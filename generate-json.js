const fetch = require("node-fetch");
const fs = require("fs");

const API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = "UC7WTGZV5NNPCLJH9wc8e0xQ";

const url =
  "https://www.googleapis.com/youtube/v3/search?" +
  `part=snippet&channelId=${CHANNEL_ID}` +
  "&order=date&type=video&videoDuration=short&maxResults=10" +
  `&key=${API_KEY}`;

fetch(url)
  .then(res => res.json())
  .then(json => {
    if (!json.items) {
      console.error("No items", json);
      process.exit(1);
    }

    const videos = json.items
      .filter(v => v.id && v.id.videoId)
      .slice(0, 4)
      .map(v => ({
        videoId: v.id.videoId,
        title: v.snippet.title,
        publishedAt: v.snippet.publishedAt
      }));

    fs.writeFileSync(
      "shorts-data.json",
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          videos
        },
        null,
        2
      )
    );

    console.log("shorts-data.json generated");
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
