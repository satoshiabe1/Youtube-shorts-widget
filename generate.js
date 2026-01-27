const fetch = require("node-fetch");
const fs = require("fs");

const API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = "UC7WTGZV5NNPCLJH9wc8e0xQ";

const MAX_DURATION = 300; // 5分（秒）

function parseDuration(iso) {
  if (!iso || typeof iso !== "string") return Infinity;

  const h = iso.match(/(\d+)H/);
  const m = iso.match(/(\d+)M/);
  const s = iso.match(/(\d+)S/);

  return (h ? +h[1] * 3600 : 0) +
         (m ? +m[1] * 60 : 0) +
         (s ? +s[1] : 0);
}

(async () => {
  try {
    // ① search：Shorts寄り動画を広めに取得（一次フィルタ）
    const searchUrl =
      "https://www.googleapis.com/youtube/v3/search?" +
      `part=snippet&channelId=${CHANNEL_ID}` +
      "&order=date&type=video&videoDuration=short&maxResults=15" +
      `&key=${API_KEY}`;

    const searchRes = await fetch(searchUrl);
    const searchJson = await searchRes.json();

    if (!searchJson.items || !Array.isArray(searchJson.items)) {
      throw new Error("No items returned from search API");
    }

    const ids = searchJson.items
      .filter(v => v.id && v.id.videoId)
      .map(v => v.id.videoId)
      .join(",");

    if (!ids) {
      throw new Error("No video IDs found");
    }

    // ② videos.list：実際の動画時間を取得（二次フィルタ用）
    const videosUrl =
      "https://www.googleapis.com/youtube/v3/videos?" +
      `part=snippet,contentDetails&id=${ids}&key=${API_KEY}`;

    const videosRes = await fetch(videosUrl);
    const videosJson = await videosRes.json();

    if (!videosJson.items || !Array.isArray(videosJson.items)) {
      throw new Error("No items returned from videos API");
    }

    // ③ 「5分以内」＋ 新しい順 → 4件
    const videos = videosJson.items
      .filter(v =>
        v.contentDetails &&
        typeof v.contentDetails.duration === "string" &&
        parseDuration(v.contentDetails.duration) <= MAX_DURATION
      )
      .sort(
        (a, b) =>
          new Date(b.snippet.publishedAt) -
          new Date(a.snippet.publishedAt)
      )
      .slice(0, 4);

    // ④ HTML生成（CSSはそのまま）
    let html = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
body { margin:0; padding:0; background: transparent; }

.shorts-wrapper {
  display: grid;
  gap: 16px;
  padding: 8px;
}

.shorts-item {
  position: relative;
  width: 100%;
  aspect-ratio: 9 / 16;
  border-radius: 12px;
  overflow: hidden;
  background: transparent;
}

.shorts-item iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
}

/* PC：4列 */
@media (min-width: 768px) {
  .shorts-wrapper {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* スマホ：カルーセル */
@media (max-width: 767px) {
  .shorts-wrapper {
    display: flex;
    gap: 12px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
  }

  .shorts-item {
    flex: 0 0 80%;
    scroll-snap-align: start;
  }

  .shorts-wrapper::-webkit-scrollbar {
    display: none;
  }
}
</style>
</head>
<body>
<div class="shorts-wrapper">
`;

    videos.forEach(v => {
      html += `
  <div class="shorts-item">
    <iframe
      src="https://www.youtube.com/embed/${v.id}"
      allowfullscreen
      loading="lazy">
    </iframe>
  </div>`;
    });

    html += `
</div>
</body>
</html>`;

    fs.writeFileSync("shorts.html", html);
    console.log(`shorts.html generated (${videos.length} videos)`);

  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
})();
