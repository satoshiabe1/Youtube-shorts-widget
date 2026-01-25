import fetch from "node-fetch";
import fs from "fs";

const API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = "UC7WTGZV5NNPCLJH9wc8e0xQ";

const url =
  `https://www.googleapis.com/youtube/v3/search?` +
  `part=snippet&channelId=${CHANNEL_ID}` +
  `&order=date&type=video&maxResults=4&key=${API_KEY}`;

const res = await fetch(url);
const json = await res.json();

let html = `<div class="shorts-wrapper">\n`;

json.items.forEach(v => {
  html += `
  <div class="shorts-item">
    <iframe
      src="https://www.youtube.com/embed/${v.id.videoId}"
      frameborder="0"
      allowfullscreen>
    </iframe>
  </div>`;
});

html += `</div>`;

fs.writeFileSync("shorts.html", html);
