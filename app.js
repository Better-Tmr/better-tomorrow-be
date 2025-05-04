import express from "express";
import cors from "cors";
import { getSubtitles } from "youtube-captions-scraper";
import dotenv from "dotenv";
import { v2 as translate } from "@google-cloud/translate";

dotenv.config();

const app = express();
const port = process.env.PORT || 3128;

app.use(express.json());
// app.use(cors());

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
};

app.use(cors(corsOptions));

const translateClient = new translate.Translate({
  key: process.env.GOOGLE_API_KEY,
});

app.post("/translate", async (req, res) => {
  const { text, to } = req.body;

  if (!text || !to) {
    return res.status(400).json({ error: "Missing: text and to" });
  }

  try {
    const [translation] = await translateClient.translate(text, to);
    console.log(`Translated: '${text}','${translation}'`);
    res.json({ translatedText: translation });
  } catch (error) {
    console.error("Translation error:", error);
    res.status(500).json({ error: "Translation failed" });
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

// 서버 실행
app.listen(port, () => {
  console.log(`서버 실행중: http://localhost:${port}`);
});
