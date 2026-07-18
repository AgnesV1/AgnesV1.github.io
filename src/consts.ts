// 站点全局信息：想改站名、简介、社交链接，只改这个文件就行。

export const SITE_TITLE = 's_k_y_l_a_r_k_i_n_g ／ 荒腔走板';
export const SITE_DESCRIPTION = 's_k_y_l_a_r_k_i_n_g';

// 社交链接：留空字符串 '' 表示不显示对应图标。
export const GITHUB_URL = 'https://github.com/AgnesV1';
// 以后有 YouTube 频道了，把链接填在这里，页头页脚会自动出现 YouTube 图标。
export const YOUTUBE_URL = '';
// Instagram 主页链接，填上后页头会出现相机图标。
export const INSTAGRAM_URL = '';

// 摄影栏目是站内页面 /photos：照片放 src/assets/photos/<年份>/，
// 置顶的放 src/assets/photos/pinned/，页面会自动展示，不需要改代码。

// 相册页背景音乐（按此优先级取第一个非空配置）：
// 1) PHOTOS_BGM_BANDCAMP：Bandcamp 嵌入参数（嵌入代码 src 里 EmbeddedPlayer/ 后面的
//    album=… 或 track=…），点唱片弹出小条播放器。注意 Bandcamp 不支持自动播放，
//    弹出后访客要再点一次里面的播放键。
// 2) PHOTOS_BGM_YOUTUBE_ID：YouTube 视频 ID，弹出迷你播放器并直接开始播放。
// 3) 都留空 ''：探测本地文件 public/audio/photos.mp3（或 .m4a/.wav）。
// 当前是 Travelers' Encore 单曲（专辑 Outer Wilds: Echoes of the Eye – The Lost Reels Deluxe）
export const PHOTOS_BGM_BANDCAMP = 'track=1424065590';
export const PHOTOS_BGM_YOUTUBE_ID = '';
