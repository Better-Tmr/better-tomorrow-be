console.log("🔥 이 app.js가 진짜 실행됨!");
import express from "express";
import cors from "cors";
import { translate } from "@vitalets/google-translate-api";
import { getSubtitles } from "youtube-captions-scraper";
import { HttpProxyAgent } from "http-proxy-agent";

// const agent = new HttpProxyAgent("http://43.130.47.134:8080"); // temporary proxy - 현재 US 사용 중
const agent = new HttpProxyAgent("http://15.223.105.115"); // temporary proxy - 현재 US 사용 중

const app = express();
const port = process.env.PORT || 3128;

app.use(express.json());
app.use(cors());

app.post("/translate-proxy", async (req, res) => {
  const { text, to } = req.body;

  if (!text || !to) {
    return res.status(400).json({ error: "Missing: text and to" });
  }

  try {
    const result = await Promise.race([
      translate(text, { to }),
      new Promise((_, reject) => setTimeout(() => reject("Timeout"), 5000)), // 5초 타임아웃 설정
    ]);
    res.json({ translatedText: result.text });
    console.log(`Translated: ${text} to ${result.text}`);
  } catch (error) {
    console.error("Translation error:", error);
    res.status(500).json({
      error:
        error === "Timeout"
          ? "Translation timed out"
          : "Error while translating",
    });
  }
});

app.post("/translate", async (req, res) => {
  const { text, to } = req.body;

  if (!text || !to) {
    return res.status(400).json({ error: "Missing: text and to" });
  }

  try {
    const result = await translate(text, { to });
    res.json({ translatedText: result.text });
    console.log(`Translated: ${text} to ${result.text}`);
  } catch (error) {
    console.error("Translation error:", error);
    res.status(500).json({ error: "Error while translating" });
  }
});

app.get("/captions", async (req, res) => {
  const { videoId, lang } = req.query;
  console.log(`VideoId: ${videoId}, Lang: ${lang}`); // 로그 추가
  try {
    const captions = await getSubtitles({ videoID: videoId, lang: lang });
    res.json(captions);
  } catch (error) {
    console.error("Captions Error: ", error);
    res.status(500).json({ error: "Failed to retrieve captions" });
  }
});

app.get("/", (req, res) => {
  res.send("홈페이지입니다!");
});

app.listen(port, () => {
  console.log(`서버 실행중: http://localhost:${port}`);
});
