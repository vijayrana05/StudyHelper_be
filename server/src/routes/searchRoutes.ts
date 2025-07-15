import express from 'express';
import { searchNotes } from '../utils/query'; // the function you wrote

const router = express.Router();

router.get('/search', async (req:any, res:any) => {
  const query = req.query.query as string;

  if (!query) {
    return res.status(400).json({ error: 'Missing query parameter' });
  }

  try {
    const notes = await searchNotes(query);
    res.json(notes);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;
