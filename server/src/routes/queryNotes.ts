import express from 'express';
import { searchInsideNote } from '../utils/queryNotes';

const router = express.Router();

router.post('/searchNote', async (req: any, res: any) => {
  const { noteId, query } = req.body;

  if (!query || !noteId) {
    return res.status(400).json({ error: 'Missing noteId or query' });
  }

  try {
    const output = await searchInsideNote(noteId, query);
    return res.json({ answer: output });
  } catch (error) {
    console.error("Gemini API error:", error);
    return res.status(500).json({ error: "Failed to generate response" });
  }
});


export default router;
