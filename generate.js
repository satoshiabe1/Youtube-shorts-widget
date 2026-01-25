const fetch = require("node-fetch");
const fs = require("fs");

const API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = "UC7WTGZV5NNPCLJH9wc8e0xQ";

const url =
  "https://www.googleapis.com/youtube/v3/search?" +
  `part=snippet&channelId=${CHANNEL_ID}` +
  "&order=date&type=video&videoDuration=short&maxResults=4" +
  `&key=${API_KEY}`;

fetch(url)
  .then(res => res.json())
  .then(json => {
    let html = `<div class="shorts-wrapper">`;

    if (!json.items) {
      console.error("No items returned from API", json);
      return;
    }

    json.items.forEach(v => {
      if (!v.id || !v.id.videoId) return;

      html += `
        <div class="shorts-item">
          <iframe
            src="https://www.youtube.com/embed/${v.id.videoId}"
            allowfullscreen
            loading="lazy">
          </iframe>
        </div>`;
    });

    html += `</div>`;

    fs.writeFileSync("shorts.html", html);
    console.log("shorts.html generated");
  })
  .catch(err => {
    console.error("Error fetching YouTube data:", err);
    process.exit(1);
  });
