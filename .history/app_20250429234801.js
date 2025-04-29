import express from "express";
import cors from "cors";
import { translate } from "@vitalets/google-translate-api";
import { getSubtitles } from "youtube-captions-scraper";
import { HttpProxyAgent } from "http-proxy-agent";

// const agent = new HttpProxyAgent("http://43.130.47.134:8080"); // temporary proxy - 현재 US 사용 중

const app = express();
const port = 8000;

app.use(express.json());
app.use(cors());

app.post("/translate-proxy", async (req, res) => {
  const { text, to, proxy: rawProxy } = req.body;
  const proxy = rawProxy || "http://43.130.47.134:8080"; // 프록시 URL

  if (!text || !to) {
    return res.status(400).json({ error: "Missing: text and to" });
  }
  const agent = new HttpProxyAgent(proxy); // 프록시 설정

  try {
    const result = await translate(text, { to, fetchOptions: { agent } });
    res.json({ translatedText: result.text });
    console.log(`Translated w/ proxy: ${text} to ${result.text}`);
  } catch (error) {
    console.error("Translation error:", error);
    res.status(500).json({ error: "Error while translating" });
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
  try {
    const captions = await getSubtitles({ videoID: videoId, lang: lang });
    res.json(captions);
  } catch (error) {
    console.error("Captions Error: ", error);
    res.status(500).json({ error: "Failed to retreive captions" });
  }
});

app.listen(port, () => {
  console.log(`서버 실행중: http://localhost:${port}`);
});
