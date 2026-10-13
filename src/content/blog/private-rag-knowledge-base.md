---
title: 'Notes on Building a Private RAG Q&A 🗄️🔎'
description: 'A rough log of the reasoning chain behind a personal RAG tool over Google Drive and Notion: what it is for, what has to be configured, and how the pipeline is wired.'
pubDate: 2026-07-26
lang: en
tags: ['dev']
---

I keep two kinds of writing that never get reread: weekly journals and topic notes, scattered across Google Drive and Notion, written in a mix of Chinese and English. Keyword search fails on them constantly — I write a note in Chinese and later look for it in English, or I remember a conclusion but not which week it landed in.

So I built a small retrieval-augmented Q&A over exactly those folders. This is a rough log of the whole chain of reasoning, not a tutorial.

## 1. What it is for

**The goal.** One web page with one input box. I ask a question in either language; the system finds the relevant fragments in my own material and answers from them, with sources. Nothing more ambitious than that.

**The scope, stated as hard boundaries.** Most of the design fell out of drawing these lines early:

- **Whitelist-only ingestion.** Only folders and pages explicitly listed in the config are imported. Anything not listed does not exist as far as the tool is concerned — the cheapest way to guarantee a sensitive file never leaks is to never embed it.
- **Read-only, manual sync.** No background daemon watching my Drive. Syncing is a command I run when I know I have changed something. Fewer moving parts, no surprise API bills, no half-synced states to debug.
- **Grounded answers or no answer.** If the retrieved material does not cover the question, the correct output is "I cannot answer this based on the available material," not a plausible paragraph. A knowledge base that occasionally invents my own history is worse than no knowledge base.
- **Local first, deployable later.** Everything runs on a laptop against a file-backed vector store. The same code should later run behind HTTPS on a small server without restructuring.

**The tasks I expect it to handle.** Recall questions ("what did I conclude about X"), scoped questions ("in Q1 of last year"), and cross-language retrieval — asking in English and hitting Chinese notes is not a nice-to-have here, it is the main reason the thing exists. Two smaller expectations: I want to narrow retrieval to a time window or a single topic before asking, and I want an optional escape hatch where the model may search the web when my own notes genuinely do not contain the answer.

**Non-goals**, so the scope stays honest: no multi-user accounts, no writing back to the sources, no agentic behaviour, no attempt to be a general assistant. It answers from my material or it declines.

## 2. What has to be configured

Roughly in the order you hit them.

**Secrets** live in `.env`, never in the config file:

- `ANTHROPIC_API_KEY` — the answering model.
- `VOYAGE_API_KEY` — embeddings. Required, because the embedding provider defaults to Voyage.
- `GOOGLE_SERVICE_ACCOUNT_JSON` — path to a service-account key file, only if you use Drive.
- `NOTION_TOKEN` — only if you use Notion.

**Google Drive** takes four steps: enable the Drive API on a Cloud project, create a service account and download its JSON key, share the target folders with the service account's email address (Viewer is enough), then put the folder IDs into the config. The share step is the one that is easy to forget — the account can authenticate perfectly and still see nothing.

**Notion** is the same shape: create an internal integration, then explicitly connect it to each page or database. Page IDs pull in their children recursively; database IDs treat each row as a document.

**Everything non-secret sits in one `config.yaml`:** embedding provider and model, chunk size (1200 characters) and overlap (150), how many chunks to retrieve per question (6), the answering model and token ceiling, a per-IP rate limit, a maximum question length, and the source whitelists.

One configuration decision is really a filing decision. Drive folder paths are parsed into metadata, so the folder layout *is* the schema:

```
2026/
  Q1/
    week-03-notes        →  kind=weekly, year=2026, quarter=1
  03/
    week-10-notes        →  month form also works, quarter derived
Topics/
  <topic name>/
    research-notes       →  kind=topic, topic=<topic name>
```

Quarters beat months here for a boring reason: a week routinely straddles a month boundary, and deciding which month a cross-boundary week "belongs to" is an annoying judgement call twelve times a year instead of four. Folders that match neither pattern still import fine; they just carry no classification.

**On cost**, since it shapes the choices: embeddings are billed per token but the free tier covers a personal corpus comfortably; unchanged text is never re-embedded, so a re-sync after editing one file costs almost nothing; the web-search tool bills per search, which is exactly why it is off by default.

## 3. How it is actually wired

Two paths through the same store: an offline **ingest** path and an online **answer** path.

### Ingest

```
sources → Document → chunking → embeddings → Chroma
```

Each source adapter (local files, Drive, Notion) does whatever API dance it needs and returns the same `Document` shape: id, title, url, source, text, plus the classification fields parsed from the folder path. Everything downstream is source-agnostic.

Chunking splits on heading boundaries first, then paragraphs, then greedily merges pieces up to the size limit, with a sentence-level hard split reserved for paragraphs that are pathologically long. The part I would not skip if I rebuilt this: **each chunk gets a context prefix injected into its text** — a marker naming the year and quarter for a weekly entry, or the topic name for a topic note. The embedding then carries the time and subject, so a question like "what was I working on early last year" has something to match against instead of relying purely on metadata filters.

The store keeps one detail that makes syncing cheap and idempotent: **`chunk_id` is a hash of the document id plus the chunk text**. Content that has not changed produces the same id, so a sync embeds only genuinely new chunks and deletes ids that vanished — and only within the sources actually fetched this run, so syncing Notion alone never touches Drive's chunks. Re-running sync twice in a row is a no-op.

Filtering deserves one trick. Alongside the usual fields, each chunk stores `period = year × 10 + quarter`, collapsing a two-dimensional time coordinate into a single integer. Range filters over time then become ordinary numeric comparisons, and the UI's scope selector reduces to a small string protocol: empty for everything, `weekly`, `weekly:<from>-<to>`, or `topic:<name>`.

The embedding layer is one interface with three implementations — a hosted multilingual model (the default, and the reason cross-language retrieval works), the vector store's bundled model for running with no keys at all, and a local model for staying entirely offline. Each provider writes to its own collection, so switching providers cannot silently mix incompatible vector spaces; it forces a re-sync instead.

### Answer

```
question → embed → top-k (+ filter) → build context → Claude (stream) → SSE → browser
```

The question is embedded and matched against the store with whatever scope filter the UI supplied. The retrieved fragments are assembled into a context block, each one headed by its document title and link, and the deduplicated source list is streamed to the browser *first* — so citations render before the answer text starts arriving.

The system prompt is deliberately **byte-stable**: no dynamic content is interpolated into it, which lets it be marked for prompt caching. Per-request variation (interface language, the retrieved material, the question) lives in the user message instead. The same prompt covers both modes; whether the model may search the web is expressed purely by whether the search tool is attached to that request, and with no tool attached the rules naturally tighten to "answer only from the material."

The response is a small event stream: a `sources` event, then text deltas, then optionally a `web_sources` event assembled from the final message when web search actually fired. The frontend is a single HTML file that reads that stream and renders knowledge-base sources and web sources in separate columns — the distinction between "this is from your notes" and "this came from the internet" should never be ambiguous.

**Guardrails**, mostly cheap ones. Retrieved passages are framed explicitly as quoted evidence, and the prompt instructs the model to treat instruction-shaped text inside them as plain data — my own notes are not a hostile input, but a note that quotes something else might be. Beyond that: whitelist ingestion, a refusal rule when material is missing, per-IP rate limiting, and a question length cap.

### What is not proven yet

Being honest about the state: the retrieval and sync paths are tested, but the web-search branch has only been validated against mocked response objects, not a live call — the shape of a real search result block, and how it interleaves with streaming, are still assumptions. Inline citations are not handled at all; the frontend renders plain text. That is the next thing to verify, before any of this goes anywhere public.
