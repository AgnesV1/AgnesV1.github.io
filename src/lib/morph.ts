// 「只在点的那一下动」的过场：同文档 View Transition 的一层薄包装，筛选重排、短札展开、文章图片放大共用。
// 平时零开销：名字只在过场期间临时挂上、放完就拿掉；<html data-vt="…"> 也只在过场期间存在，
// 各种过场的快慢写在 global.css 的「点一下的过场」一段，按 data-vt 区分。
// 浏览器不支持、系统要求减少动态、页面在后台时，直接执行改动、不放过场。
// （相册页的灯箱是更早写的同一套做法，代码在 src/pages/photos/index.astro 里，没有改用这里。）

export const canMorph = () =>
	'startViewTransition' in document &&
	document.visibilityState === 'visible' &&
	!matchMedia('(prefers-reduced-motion: reduce)').matches;

const run = (kind: string, update: () => void | Promise<void>, cleanup: () => void) => {
	const root = document.documentElement;
	root.dataset.vt = kind;
	const t = document.startViewTransition(update);
	return t.finished.finally(() => {
		cleanup();
		if (root.dataset.vt === kind) delete root.dataset.vt;
	});
};

// 两个函数都返回一个 Promise：过场放完（或不放、直接改完）时结束。

// 一组元素各自从旧位置滑到新位置（列表重排、便签展开）：
// 只给眼下看得见附近的、和原本藏着的（可能要出现的）挂名字，屏幕外很远的不管，省得白拍快照。
// cls 是 view-transition-class，给需要特别样子的元素（比如便签）用。
export function morphGroup(
	kind: string,
	els: HTMLElement[],
	update: () => void,
	cls?: (el: HTMLElement) => string | undefined,
): Promise<void> {
	if (!canMorph()) return Promise.resolve(update());
	const vh = innerHeight;
	const named: HTMLElement[] = [];
	els.forEach((el) => {
		const r = el.getBoundingClientRect();
		const hidden = r.width === 0 && r.height === 0;
		if (!hidden && (r.bottom < -vh * 0.5 || r.top > vh * 1.5)) return;
		el.style.viewTransitionName = `${kind}-${named.length}`;
		const c = cls?.(el);
		if (c) el.style.setProperty('view-transition-class', c);
		named.push(el);
	});
	return run(kind, update, () =>
		named.forEach((el) => {
			el.style.viewTransitionName = '';
			el.style.removeProperty('view-transition-class');
		}),
	);
}

// 一个东西从 from 长成 to（图片放大 / 缩回）。update 可以是 async：等大图解码好再拍「过场后」的样子。
export function morphOne(
	kind: string,
	name: string,
	from: () => Element | null,
	to: () => Element | null,
	update: () => void | Promise<void>,
): Promise<void> {
	if (!canMorph()) return Promise.resolve(update());
	const a = from() as HTMLElement | null;
	if (a) a.style.viewTransitionName = name;
	let b: HTMLElement | null = null;
	return run(
		kind,
		async () => {
			if (a) a.style.viewTransitionName = '';
			await update();
			b = to() as HTMLElement | null;
			if (b) b.style.viewTransitionName = name;
		},
		() => {
			if (b) b.style.viewTransitionName = '';
		},
	);
}
