#!/usr/bin/env node
// 生成文章里的示意图（src/figures/*.svg）。图的内容都写在下面，改完重新跑一次：node scripts/gen-figures.mjs
// 颜色用全站的变量（global.css 顶部那几个）：内嵌进页面时跟着日夜主题变；单独打开 svg 文件时用后面的备用色（日间）。
// 画布宽度固定 680（和正文栏差不多宽，1:1 不缩放），坐标都是手排的；框里的字放不下时跑脚本会提醒。

import { mkdirSync, writeFileSync } from 'node:fs';

const OUT = new URL('../src/figures/', import.meta.url);

const STYLE = `
.fig{font-family:var(--font-body,-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Arial,sans-serif)}
.fig .t{font-size:14px;font-weight:600;fill:var(--tx,#26232e)}
.fig .s{font-size:12px;fill:var(--tx-2,#6f687c)}
.fig .b rect{fill:color-mix(in srgb,var(--c) 11%,var(--bg,#fffcf7));stroke:var(--c);stroke-width:1}
.fig .lav{--c:var(--lav,#6d5ae6)}
.fig .mint{--c:var(--mint,#1d9e76)}
.fig .coral{--c:var(--coral,#d94f3b)}
.fig .plain rect{fill:var(--bg-soft,#f5f0e8);stroke:color-mix(in srgb,var(--tx-2,#6f687c) 40%,var(--bg,#fffcf7))}
.fig .a{fill:none;stroke:var(--tx-2,#6f687c);stroke-width:1.5}
.fig .f{fill:none;stroke:var(--tx-2,#6f687c);stroke-width:.75;stroke-dasharray:4 4;opacity:.7}
.fig marker path{fill:none;stroke:var(--tx-2,#6f687c);stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
`.trim();

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const text = (cls, x, y, s, anchor = 'start') =>
  `<text class="${cls}" x="${x}" y="${y}" text-anchor="${anchor}" dominant-baseline="central">${esc(s)}</text>`;
const tooWide = [];

// 一个框：标题 + 0–2 行小字，高度跟着行数走（44 / 56 / 76）。tone：lav / mint / coral / plain
function box(x, y, w, tone, title, ...subs) {
  const h = [44, 56, 76][subs.length];
  const need = Math.max(title.length * 8, ...subs.map((s) => s.length * 6.6)) + 16;
  if (need > w) tooWide.push(`"${title}" needs about ${Math.round(need)}px, box is ${w}px`);
  const rows = [[22], [19, 38], [20, 40, 58]][subs.length];
  const cx = x + w / 2;
  return `<g class="b ${tone}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8"/>` +
    text('t', cx, y + rows[0], title, 'middle') + subs.map((s, i) => text('s', cx, y + rows[i + 1], s, 'middle')).join('') + '</g>';
}
// 直的箭头；both = 两头都有
const arrow = (x1, y1, x2, y2, both = false) =>
  `<line class="a" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" marker-end="url(#fig-arrow)"${both ? ' marker-start="url(#fig-arrow)"' : ''}/>`;
// 拐弯的箭头：依次经过这几个点
const bend = (...pts) => `<path class="a" d="M${pts.map((p) => p.join(' ')).join(' L')}" marker-end="url(#fig-arrow)"/>`;
// 框外面的一行小字
const note = (x, y, s, anchor = 'start') => text('s', x, y, s, anchor);
// 虚线框和它左上角的名字（名字后面可以跟一句小字）
const frame = (x, y, w, h) => `<rect class="f" x="${x}" y="${y}" width="${w}" height="${h}" rx="12"/>`;
const head = (x, y, title, sub = '') => text('t', x, y, title) + (sub ? note(x + title.length * 8 + 10, y, sub) : '');

function fig(name, height, label, ...parts) {
  const svg = `<svg class="fig" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 ${height}" width="100%" role="img" aria-label="${esc(label)}">\n` +
    `<style>${STYLE}</style>\n` +
    '<defs><marker id="fig-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M2 1L8 5L2 9"/></marker></defs>\n' +
    parts.join('\n') + '\n</svg>\n';
  writeFileSync(new URL(name + '.svg', OUT), svg);
  return name;
}

mkdirSync(OUT, { recursive: true });
const C3 = [60, 262, 464];   // 三栏：每个框宽 156
const C4 = [40, 196, 352, 508];   // 四栏：每个框宽 132
const done = [];

// ---------- TimeBox ----------

done.push(fig('tb-box-logic', 226, 'The idea behind the tool: find the size of time box you can comfortably work in, grow it, and fill it with higher-priority things first, because the only things you control are your own time and attention.',
  box(C3[0], 40, 156, 'lav', 'Find your box', 'Time it, see its size'),
  arrow(218, 68, 258, 68),
  box(C3[1], 40, 156, 'lav', 'Grow the box', 'Longer, and deeper'),
  arrow(420, 68, 460, 68),
  box(C3[2], 40, 156, 'lav', 'Fill by priority', 'What matters first'),
  box(60, 150, 560, 'mint', 'What you control', 'Your own time and your own attention, and nothing else')));

done.push(fig('tb-system-map', 670, 'System map: GitHub serves the static files, the browser runs them and keeps a local copy, and an Apps Script web app reads and writes Google Sheets.',
  frame(40, 30, 600, 96), text('t', 60, 70, 'GitHub'), note(60, 90, 'where the code lives'),
  box(C3[1], 50, 156, 'plain', 'Repository (main)', 'No build step'),
  box(C3[2], 50, 156, 'plain', 'GitHub Pages', 'Public static URL'),
  arrow(420, 78, 460, 78),
  arrow(542, 108, 542, 202), note(530, 146, 'downloaded on page load', 'end'),

  frame(40, 166, 600, 222), head(60, 188, 'Your device', 'the browser on a laptop or phone'),
  box(C3[0], 206, 156, 'lav', 'Pure logic', 'Stats, meals, repeats'),
  box(C3[1], 206, 156, 'lav', 'UI (js/ui)', '9 views, re-rendered'),
  box(C3[2], 206, 156, 'lav', 'Service Worker', 'Network, else cache'),
  arrow(462, 234, 422, 234), arrow(260, 234, 220, 234),
  box(C3[0], 312, 156, 'lav', 'localStorage', 'Full local copy'),
  box(C3[1], 312, 156, 'lav', 'store.js', 'All writes go here'),
  box(C3[2], 312, 156, 'lav', 'sync.js', 'Push, then pull'),
  arrow(340, 266, 340, 308, true), arrow(258, 340, 220, 340, true), arrow(422, 340, 460, 340, true),
  arrow(542, 372, 542, 464, true), note(530, 408, 'one JSON POST', 'end'),

  frame(40, 428, 600, 222), head(60, 450, 'Google', 'sheets in your own account'),
  box(60, 468, 560, 'mint', 'Apps Script web app (Code.gs)', 'Checks secret and version, takes a lock, then reads and writes the sheets'),
  box(C3[0], 574, 156, 'mint', 'Main sheet', 'Tasks and plans'),
  box(C3[1], 574, 156, 'mint', 'Reading sheet', 'Want and finished'),
  box(C3[2], 574, 156, 'mint', 'Quarter sheet', 'Two cells per day'),
  arrow(138, 528, 138, 570, true), arrow(340, 528, 340, 570, true), arrow(542, 528, 542, 570)));

done.push(fig('tb-one-change', 606, 'The path of one change: tapped on a device, saved locally, sent in a batch, checked and written by the script, then pulled by the other device.',
  box(120, 30, 280, 'lav', 'You tap Done', 'Same on phone or laptop'),
  arrow(260, 88, 260, 126),
  box(120, 130, 280, 'lav', 'store.js updates the data', 'Saved locally at once, marked pending'),
  arrow(260, 188, 260, 226),
  box(120, 230, 280, 'lav', 'sync.js sends a batch', 'Changes within 2.5 s go together'),
  arrow(402, 258, 446, 258),
  box(450, 230, 180, 'plain', 'Cannot send?', 'Stays local, retried'),
  arrow(260, 288, 260, 326),
  box(120, 330, 280, 'mint', 'Code.gs checks the request', 'Secret, version, one writer at a time'),
  arrow(260, 388, 260, 426),
  box(120, 430, 280, 'mint', 'Sheet is written, reply sent', 'Per row, the later edit wins'),
  arrow(260, 488, 260, 526),
  box(120, 530, 280, 'lav', 'The other device picks it up', 'Pulls only rows changed since last sync')));

done.push(fig('tb-plans-pools-records', 358, 'Three kinds of things: plans, pools you pick from, and records of what happened, all meeting on Today.',
  box(60, 40, 260, 'lav', 'Plans', 'A list of items, or a rhythm', 'Placed Auto or in the Pool'),
  box(360, 40, 260, 'coral', 'Pools', 'No date until you pick one', 'Tasks · Ideas · Want list · To try'),
  arrow(190, 118, 190, 168), note(200, 143, 'repeats show up by themselves'),
  arrow(490, 118, 490, 168), note(500, 143, 'you drag or click'),
  box(60, 172, 560, 'plain', 'Today', 'Only today is written to the sheet; later days are faint previews'),
  arrow(340, 230, 340, 278), note(350, 254, 'mark the result, time it, note why'),
  box(60, 282, 560, 'mint', 'Records', 'Done / Partial / Later / Drop · actual minutes · clock times · reason')));

done.push(fig('tb-pool-lifecycle', 276, 'Life of a pool entry: it waits in the pool, gets picked for a day, and is retired once done; Later, Drop or deleting the task sends it back.',
  box(C3[0], 40, 156, 'coral', 'In the pool', 'No date yet'),
  arrow(218, 68, 258, 68),
  box(C3[1], 40, 156, 'plain', 'Picked for a day', 'Crossed off the pool'),
  arrow(420, 68, 460, 68),
  box(C3[2], 40, 156, 'mint', 'Done', 'Entry is retired'),
  bend([340, 98], [340, 124], [138, 124], [138, 100]),
  note(239, 142, 'Later / Drop / task deleted: back to the pool', 'middle'),
  note(40, 182, 'Four pools, each with its own ending'),
  box(40, 198, 135, 'coral', 'Ideas', 'Gone after a week'),
  box(195, 198, 135, 'coral', 'Reading: Want', 'Asks: finished it?'),
  box(350, 198, 135, 'coral', 'To try', 'Becomes a Box'),
  box(505, 198, 135, 'coral', 'Task pool', 'Drag onto a day')));

done.push(fig('tb-data-model', 522, 'The data model in the sheet: visible tabs for plans, items, tasks, contacts and coffee chats; hidden tabs for the daily log, settings and deletions.',
  frame(40, 30, 600, 216), head(60, 52, 'Tabs you normally see'),
  box(C3[0], 70, 156, 'mint', 'Projects', 'One row per plan'),
  arrow(218, 98, 258, 98),
  box(C3[1], 70, 156, 'mint', 'Items', 'Pieces of a plan'),
  arrow(420, 98, 460, 98),
  box(C3[2], 70, 156, 'mint', 'Tasks', 'Things on a given day'),
  box(C3[0], 170, 156, 'mint', 'Archive', 'Old tasks moved out'),
  box(C3[1], 170, 156, 'mint', 'Contacts', 'One row per person'),
  arrow(420, 198, 460, 198),
  box(C3[2], 170, 156, 'mint', 'Coffee chats', 'One row per chat'),
  arrow(542, 128, 542, 166),
  frame(40, 266, 600, 236), head(60, 288, 'Hidden tabs', 'right-click a tab to show them'),
  box(C3[0], 306, 156, 'plain', 'Log', 'One row per day'),
  box(C3[1], 306, 156, 'plain', 'Settings', 'One key, one JSON row'),
  box(C3[2], 306, 156, 'plain', 'Deleted', 'Tombstones, 14 days'),
  arrow(340, 364, 340, 402),
  box(60, 406, 560, 'plain', 'Kept in Settings, one row each', 'goal: goals · idea: ideas · meal-ing: / meal-box: / meal-week: meals', 'groups · timer · capacity · prefs · reading · quarter')));

done.push(fig('tb-sync-protocol', 436, 'The sync protocol: the device sends a batch, the sheet checks three gates, writes row by row and replies, and the device merges; blocked or offline changes wait locally.',
  box(60, 40, 250, 'lav', 'Device: send a batch', 'Waits 2.5 s; beacon on leaving'),
  arrow(312, 68, 366, 68),
  box(370, 40, 250, 'mint', 'Sheet: three gates', 'Secret, version, one at a time'),
  arrow(185, 98, 185, 136),
  box(60, 140, 250, 'plain', 'Blocked or offline', 'Changes stay local, retried later'),
  arrow(495, 98, 495, 136),
  box(370, 140, 250, 'mint', 'Write row by row', 'Later edit wins; deletes are logged'),
  arrow(495, 198, 495, 236),
  box(370, 240, 250, 'mint', 'Reply', 'Only rows changed since last sync'),
  arrow(368, 268, 314, 268),
  box(60, 240, 250, 'lav', 'Device: merge', 'Newer local rows are kept'),
  box(60, 340, 560, 'plain', 'Fallbacks', '13 days without syncing: the delete log may be pruned, so pull the whole sheet', 'Syncs again every 2 minutes, on return, and when back online; Reading rides along')));

done.push(fig('tb-request-riders', 336, 'One request carries the main sync plus optional riders for other spreadsheets and housekeeping; each rider is handled separately so a failure in one does not stop the sync.',
  box(60, 40, 560, 'lav', 'One request from the device', 'secret · version · since, plus whichever riders are needed this time'),
  arrow(106, 98, 106, 146), arrow(262, 98, 262, 146), arrow(418, 98, 418, 146), arrow(574, 98, 574, 146),
  box(C4[0], 150, 132, 'mint', 'push · pull', 'Main sheet rows'),
  box(C4[1], 150, 132, 'mint', 'reading', 'Another sheet'),
  box(C4[2], 150, 132, 'mint', 'tidy · archive', 'Housekeeping'),
  box(C4[3], 150, 132, 'mint', 'quarter', 'Its own request'),
  box(60, 260, 560, 'plain', 'Each rider is wrapped on its own', 'A broken Reading or Quarter sheet reports its error; the main sync still completes')));

done.push(fig('tb-connections', 462, 'How the parts of the tool connect: plans, ideas and the reading list feed a task; a task produces a coffee chat note, a dish to try and daily totals for the quarter sheet. Links are switched on per project, and some links are left out on purpose.',
  note(138, 22, 'feeds a task', 'middle'), note(542, 22, 'comes out of a task', 'middle'),
  box(C3[0], 40, 156, 'lav', 'Plan', 'projectId, fixed ids'),
  box(C3[0], 120, 156, 'coral', 'Idea', 'Status from the task'),
  box(C3[0], 200, 156, 'coral', 'Reading: Want', 'Matched by title'),
  box(C3[1], 120, 156, 'plain', 'Task', 'The only hub'),
  box(C3[2], 40, 156, 'mint', 'Coffee chat note', 'id = mt: + task id'),
  box(C3[2], 120, 156, 'mint', 'Dish to try', 'From a finished task'),
  box(C3[2], 200, 156, 'mint', 'Quarter sheet', 'Daily totals only'),
  bend([218, 68], [240, 68], [240, 136], [258, 136]), arrow(218, 148, 258, 148), bend([218, 228], [240, 228], [240, 160], [258, 160]),
  bend([420, 136], [442, 136], [442, 68], [460, 68]), arrow(420, 148, 460, 148), bend([420, 160], [442, 160], [442, 228], [460, 228]),
  box(60, 290, 560, 'plain', 'Wired by switches on the project, not by its name', 'progress · growth · pick people · pick ideas · what to watch', 'Rename a project and every link still holds'),
  box(60, 386, 560, 'plain', 'Left unlinked on purpose', 'To try ✕ Ideas · people ✕ ideas · no planning on the phone')));

done.push(fig('tb-mod-reading', 246, 'The reading module: things you want to read or watch are saved with a priority and a category, suggested when you add a task, asked about when the task is done, and logged under their own category once finished.',
  box(C3[0], 40, 156, 'coral', 'Want', 'Priority and category'),
  arrow(218, 68, 258, 68),
  box(C3[1], 40, 156, 'plain', 'Picked for a day', 'Suggested for a task'),
  arrow(420, 68, 460, 68),
  box(C3[2], 40, 156, 'plain', 'Finished it?', 'Asked when it is done'),
  arrow(542, 98, 542, 146),
  box(60, 150, 560, 'mint', 'Logged where it belongs', 'Under its own category, with the month and whether it was worth it', 'Books, shows, games, podcasts: everything finished goes on the record')));

done.push(fig('tb-mod-meals', 250, 'The meal prep module has two separate lines. Groceries are combined into boxes, boxes are placed on days in the weeks ahead, and the shopping list is built from the plan and grouped by shop. Restock runs on a longer clock: things replaced every few months or years, each on its own cycle, listed by the month they come due.',
  box(C4[0], 40, 132, 'lav', 'Groceries', 'Where, how long'),
  arrow(174, 68, 192, 68),
  box(C4[1], 40, 132, 'lav', 'Boxes', 'One meal each'),
  arrow(330, 68, 348, 68),
  box(C4[2], 40, 132, 'lav', 'Plan', 'Boxes onto days'),
  arrow(486, 68, 504, 68),
  box(C4[3], 40, 132, 'mint', 'Shopping list', 'Grouped by shop'),
  note(60, 128, 'A separate line, on a longer clock'),
  box(C3[0], 146, 156, 'coral', 'Restock', 'Not food, not weekly'),
  arrow(218, 174, 258, 174),
  box(C3[1], 146, 156, 'coral', 'Its own cycle', 'Months, or years'),
  arrow(420, 174, 460, 174),
  box(C3[2], 146, 156, 'mint', 'Coming up', 'What is due, by month'),
  note(340, 226, 'Vitamins every few months; a digital watch every few years, when its battery life is up', 'middle')));

done.push(fig('tb-mod-chats', 216, 'The coffee chat module: a chat is booked as a task, notes record what was discussed and what the person is interested in, a dated next step keeps the follow-up, and later the notes help choose a gift that fits.',
  box(C4[0], 40, 132, 'lav', 'Coffee chat', 'Booked as a task'),
  arrow(174, 68, 192, 68),
  box(C4[1], 40, 132, 'lav', 'Notes', 'Topics, interests'),
  arrow(330, 68, 348, 68),
  box(C4[2], 40, 132, 'lav', 'Next step', 'Follow-up, dated'),
  arrow(486, 68, 504, 68),
  box(C4[3], 40, 132, 'mint', 'Later', 'A gift that fits'),
  arrow(340, 98, 340, 136),
  box(60, 140, 560, 'plain', 'What it is for', 'Remembering what someone cares about, so the next contact is about them')));

done.push(fig('tb-mod-stats', 246, 'The stats module: timed work feeds two review pages. One shows where the hours went, with a heatmap of what you are usually doing at each hour and deep work shown apart. The other shows how the plans went, with how much got finished and the reasons things slipped.',
  box(60, 40, 560, 'lav', 'Timed work', 'Each stretch has a project, a start and an end, and may be marked deep'),
  arrow(190, 98, 190, 146), arrow(490, 98, 490, 146),
  box(60, 150, 260, 'mint', 'Time: where the hours went', 'What you usually do at this hour', 'Deep work shown apart from the rest'),
  box(360, 150, 260, 'mint', 'Plan: how the plans went', 'How much got finished', 'The reasons things slipped')));

done.push(fig('tb-mod-projects', 246, 'The projects module holds two kinds of thing. Goals need thinking and time and sit on a board that rolls forward by month, quarter and year. Ideas only need consuming and wait in a pool until picked for a day.',
  box(60, 40, 260, 'lav', 'Goals', 'Need thinking and time', 'Month, quarter, year, five years'),
  box(360, 40, 260, 'coral', 'Ideas', 'Only need consuming', 'Outings and places to eat'),
  arrow(190, 118, 190, 166), arrow(490, 118, 490, 166),
  box(60, 170, 260, 'plain', 'The board rolls', 'Late ones roll into now'),
  box(360, 170, 260, 'plain', 'Picked into a day', 'Then gone once done')));

// ---------- 求职 ----------

done.push(fig('job-overview', 326, 'Overview of the job search method: resume library, application pipeline, interviews and offer, with a weekly and monthly review feeding back into the resume.',
  box(C4[0], 40, 132, 'lav', 'Resume library', '20–30 rewrites'),
  arrow(174, 68, 192, 68),
  box(C4[1], 40, 132, 'lav', 'Pipeline', 'Under 3 days old'),
  arrow(330, 68, 348, 68),
  box(C4[2], 40, 132, 'lav', 'Interviews', 'Round by round'),
  arrow(486, 68, 504, 68),
  box(C4[3], 40, 132, 'plain', 'Offer', 'On a tailwind'),
  arrow(262, 98, 262, 146), arrow(418, 98, 418, 146),
  box(198, 150, 284, 'mint', 'Weekly and monthly review', 'Funnel · hours spent · debriefs'),
  bend([196, 178], [106, 178], [106, 100]),
  note(44, 224, 'back to the resume and the targeting'),
  box(40, 250, 600, 'plain', 'Weekly rhythm', 'Applying is the main line · 2+ recorded mocks · 1+ coffee chat · thank-you within 24 h')));

done.push(fig('job-resume-library', 226, 'Building the resume library: iterate per job description, expand, compress, and keep a long markdown master to cut from.',
  box(C3[0], 40, 156, 'lav', 'Iterate', 'A new pass per JD'),
  arrow(218, 68, 258, 68),
  box(C3[1], 40, 156, 'lav', 'Expand', 'A bullet per JD duty'),
  arrow(420, 68, 460, 68),
  box(C3[2], 40, 156, 'lav', 'Compress', 'Story, then relevance'),
  arrow(340, 98, 340, 146),
  box(60, 150, 560, 'mint', 'Resume library (markdown)', '1.5–2× the target length, cut down for each application')));

done.push(fig('job-jd-archive', 376, 'The JD archive: search by hand to get a feel for the market, paste each link to an AI to get a structured JD.md and an index row, rank and cut the day\'s batch, write a resume.md for the ones kept, and keep both files so you can prepare the moment someone calls.',
  frame(40, 30, 600, 226), head(60, 52, 'JD archive', 'plain .md files in a local folder or an Obsidian vault'),
  box(C3[0], 70, 156, 'lav', 'Search by hand', 'Builds a market feel'),
  arrow(218, 98, 258, 98),
  box(C3[1], 70, 156, 'lav', 'Paste link to AI', 'JD.md plus variables'),
  arrow(420, 98, 460, 98),
  box(C3[2], 70, 156, 'lav', 'Index row', 'Markdown table, link'),
  bend([542, 128], [542, 153], [138, 153], [138, 176]),
  box(C3[0], 180, 156, 'lav', 'Rank the day', 'AI sorts, you cut'),
  arrow(218, 208, 258, 208),
  box(C3[1], 180, 156, 'lav', 'Write resume.md', 'Only for the keepers'),
  arrow(420, 208, 460, 208),
  box(C3[2], 180, 156, 'mint', 'Pair on file', 'JD.md + resume.md'),
  arrow(542, 238, 542, 296),
  box(60, 300, 560, 'mint', 'When someone calls', 'Open the folder and prepare from the two files; no need to ask which role it was')));

done.push(fig('job-star', 346, 'The shape of an interview story: two sentences of situation, two of task and result, about three action steps each with the choice, the reason and the feedback, then a callback to the result. It shows that you saw the whole environment, knew your own part, and understand how the two shaped each other.',
  box(C4[0], 40, 132, 'lav', 'Situation', 'The big picture'),
  arrow(174, 68, 192, 68),
  box(C4[1], 40, 132, 'lav', 'Task + result', 'Goal, and outcome'),
  arrow(330, 68, 348, 68),
  box(C4[2], 40, 132, 'lav', 'Action', 'About three steps'),
  arrow(486, 68, 504, 68),
  box(C4[3], 40, 132, 'lav', 'Callback', 'Result, once more'),
  note(106, 112, '2 sentences', 'middle'), note(262, 112, '2 sentences', 'middle'), note(574, 112, '1 sentence + a small result', 'middle'),
  arrow(418, 98, 418, 146),
  box(60, 150, 560, 'plain', 'Each action step', 'The choice you made · why · roughly what came back'),
  arrow(340, 208, 340, 246),
  box(60, 250, 560, 'mint', 'What it shows', 'You saw the whole environment, and you knew your own part', 'You know how your actions and the environment shaped each other')));

done.push(fig('job-pipeline', 376, 'The application pipeline in six steps, timed end to end, with every reply logged into a funnel analysis.',
  frame(40, 30, 600, 226), head(60, 52, 'Application pipeline', 'timed end to end, to forecast weekly volume'),
  box(C3[0], 70, 156, 'lav', '1 · Find and file', 'By hand, into JD.md'),
  arrow(218, 98, 258, 98),
  box(C3[1], 70, 156, 'lav', '2 · Rank and pick', 'AI ranks, you choose'),
  arrow(420, 98, 460, 98),
  box(C3[2], 70, 156, 'lav', '3 · Tailor resume', 'Claude fits the JD'),
  bend([542, 128], [542, 153], [138, 153], [138, 176]),
  box(C3[0], 180, 156, 'lav', '4 · ATS check', 'Codex matches the JD'),
  arrow(218, 208, 258, 208),
  box(C3[1], 180, 156, 'lav', '5 · To Word', 'One-click script'),
  arrow(420, 208, 460, 208),
  box(C3[2], 180, 156, 'lav', '6 · Apply by hand', 'Cover letter at times'),
  arrow(542, 238, 542, 296),
  box(60, 300, 560, 'mint', 'Funnel analysis', 'Log every reply; review weekly and monthly which directions convert, and why')));

done.push(fig('job-interviews', 636, 'Four interview rounds drawing on a library of twelve stories, with what to prepare or what is being tested at each round, and a written debrief after each one.',
  box(60, 40, 560, 'lav', 'A library of twelve stories', 'Tell each story from what they need, in their own vocabulary'),
  arrow(185, 98, 185, 136),
  box(60, 140, 250, 'lav', 'Round 1 · HR call', 'Same stories, new angles'),
  arrow(312, 168, 366, 168),
  box(370, 140, 250, 'plain', 'Closing questions', 'Timeline, team, who they want'),
  arrow(185, 198, 185, 236),
  box(60, 240, 250, 'lav', 'Round 2 · HM + tech', 'Iterate on round 1'),
  arrow(312, 268, 366, 268),
  box(370, 240, 250, 'plain', 'Prepare', 'Peer mock, teamwork Q&A, drills'),
  arrow(185, 298, 185, 336),
  box(60, 340, 250, 'lav', 'Round 3 · skip-level + HM', 'Strategy, then the details'),
  arrow(312, 368, 366, 368),
  box(370, 340, 250, 'plain', 'What they test', 'Depth of thinking, real execution'),
  arrow(185, 398, 185, 436),
  box(60, 440, 250, 'lav', 'Round 4 · it depends', 'Team dinner, case, or the CEO'),
  arrow(312, 468, 366, 468),
  box(370, 440, 250, 'plain', 'What they test', 'Personality and authenticity'),
  arrow(185, 498, 185, 536),
  box(60, 540, 560, 'mint', 'Debrief right after', 'Write down every question and answer, then work out how to close each gap', 'Record your own mock sessions and replay them for pronunciation')));

// ---------- 历史文档分析 ----------

done.push(fig('ego-pipeline', 376, 'From a pile of files to yearly lines: gather every format into one corpus, clean it, sample paragraphs, code each one, aggregate by year, check the result with a second sample, then read it by time of day and season where timestamps exist.',
  frame(40, 30, 600, 226), head(60, 52, 'From a pile of files to yearly lines', 'everything stays on your machine'),
  box(C3[0], 70, 156, 'lav', 'Gather', 'All formats, one pile'),
  arrow(218, 98, 258, 98),
  box(C3[1], 70, 156, 'lav', 'Clean', 'Keep only your own'),
  arrow(420, 98, 460, 98),
  box(C3[2], 70, 156, 'lav', 'Sample', '120 paragraphs a year'),
  bend([542, 128], [542, 153], [138, 153], [138, 176]),
  box(C3[0], 180, 156, 'lav', 'Code', 'Six fields each'),
  arrow(218, 208, 258, 208),
  box(C3[1], 180, 156, 'lav', 'Aggregate', 'Shares by year'),
  arrow(420, 208, 460, 208),
  box(C3[2], 180, 156, 'lav', 'Check', 'Redo with new sample'),
  arrow(542, 238, 542, 296),
  box(60, 300, 560, 'mint', 'Read it by the clock too', 'Where timestamps exist, compare times of day and seasons')));

done.push(fig('ego-monitors', 346, 'Four monitors over the same coded paragraphs: emotion, who it is aimed at, topics, and stance on events that recur. Each becomes one line per year, and the lines are read together.',
  box(C4[0], 40, 132, 'lav', 'Emotion', 'Label and valence'),
  box(C4[1], 40, 132, 'lav', 'Targets', 'Aimed at whom'),
  box(C4[2], 40, 132, 'lav', 'Topics', 'Keyword shares'),
  box(C4[3], 40, 132, 'lav', 'Stance', 'On repeat events'),
  arrow(106, 98, 106, 146), arrow(262, 98, 262, 146), arrow(418, 98, 418, 146), arrow(574, 98, 574, 146),
  box(60, 150, 560, 'mint', 'One line per monitor, one point per year', 'A shift is a line that moves: a feeling fades, a target changes, a topic drops out', 'Read them together: a change means more when two lines move in the same year'),
  arrow(340, 228, 340, 266),
  box(60, 270, 560, 'plain', 'Stance needs its own pass', 'Tag recurring kinds of event and compare how each is written about across years')));

console.log('✓ ' + done.length + ' figures → src/figures/');
if (tooWide.length) console.log('⚠ 可能放不下：\n  ' + tooWide.join('\n  '));
