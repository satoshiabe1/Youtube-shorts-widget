const fetch = require("node-fetch");
const fs = require("fs");

const API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = "UC7WTGZV5NNPCLJH9wc8e0xQ";

// 🔹 あえて多めに取得
const url =
  "https://www.googleapis.com/youtube/v3/search?" +
  `part=snippet&channelId=${CHANNEL_ID}` +
  "&order=date&type=video&videoDuration=short&maxResults=10" +
  `&key=${API_KEY}`;

fetch(url)
  .then(res => res.json())
  .then(json => {
    if (!json.items || !Array.isArray(json.items)) {
      console.error("No items returned from API", json);
      process.exit(1);
    }

    // 🔹 videoId があるものだけ抽出 → 4件に制限
    const videos = json.items
      .filter(v => v.id && v.id.videoId)
      .slice(0, 4);

    // 🔹 CSS込みHTML（毎回完全生成）
    let html = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
body { margin:0; padding:0; background:#000; }

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
  background: #000;
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
      src="https://www.youtube.com/embed/${v.id.videoId}"
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
  })
  .catch(err => {
    console.error("Error fetching YouTube data:", err);
    process.exit(1);
  });
