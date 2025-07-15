import geminiModel from "../utils/gemini";
import express from "express"
// Load Gemini API Key

const router = express.Router();

// POST /api/ask-ai
router.post("/ask-ai", async (req:any, res:any) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    const result = await geminiModel.generateContent([` ${prompt}`]);
    const output = await result.response.text();

    return res.json({ answer: output });
  } catch (error) {
    console.error("Gemini API error:", error);
    return res.status(500).json({ error: "Failed to generate response" });
  }
});

export default router;
