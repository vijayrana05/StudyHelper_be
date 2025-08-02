import express, { Request ,Response } from 'express';
import Note from '../models/note';

import { verifyToken } from '../middleware/auth';
import { createEmbeddings, deleteNoteEmbeddings } from '../utils/embedding';
import { Types } from 'mongoose';


const router = express.Router();

// create a new note
router.post('/', verifyToken, async (req:any, res:any) => {
  const { title, content,subject,color,plainText } = req.body;
  const userId = (req as any).user.id;
  const newNote = new Note({ title, content, owner: userId,subject ,color });
  await newNote.save();
  const bedings = await createEmbeddings(plainText,newNote.id)
  if (!bedings) {
  return res.status(500).json({ error: "Failed to generate embeddings" });
}
  res.status(201).json(newNote);
});

// get all notes
// router.get('/', verifyToken, async (req, res) => {
//   const userId = (req as any).user.id;
//   const notes = await Note.find().sort({ updatedAt: -1 }) // descending order
//   res.json(notes);
// });

router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    // if(!userId) {
    //   console.log("und id")
    // }
    // else{
    // console.log(userId)
    // }
    const notes = await Note.find({ owner:userId }).sort({ updatedAt: -1 });
    // console.log(userId)
    res.json(notes);
    // console.log(notes)
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// Update a note
router.put('/:id', verifyToken, async (req: Request, res: Response): Promise<void> =>{
  const { title, content , subject,color,plainText } = req.body;
  const userId = (req as any).user.id;
  const noteId = new Types.ObjectId(req.params.id);
  // const plainText = tiptapJsonToPlainText(content);



  try {
    const updatedNote = await Note.findOneAndUpdate(
      { _id: noteId, owner: userId }, // Ensure user owns the note
      { title, content,subject,color },
      { new: true }
    );

    if (!updatedNote) {
      res.status(404).json({ error: 'Note not found or unauthorized' });
      return;
    }
    await createEmbeddings(plainText,noteId)

    res.json(updatedNote);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// add and remove from fav
router.patch("/:id", verifyToken, async (req:Request, res:Response): Promise<void> => {
  const noteId = req.params.id;
  const { fav } = req.body;

  try {
    const updatedNote = await Note.findByIdAndUpdate(
      noteId,
      { fav },
      { new: true } // return the updated document
    );

    if (!updatedNote) {
      res.status(404).json({ message: "Note not found" });
      return;
    }

    res.json(updatedNote);
  } catch (error) {
    console.error("Failed to update fav:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get('/:id', verifyToken, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user.id;
  const noteId = req.params.id;

  try {
    const note = await Note.findOne({ _id: noteId, owner: userId });
    if (!note) {
        res.status(404).json({ error: 'Note not found' });
        return
    }
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});
 //delete a note
router.delete('/:id', verifyToken, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user.id;
  const noteId = req.params.id;

  try {
    const note = await Note.findOneAndDelete({ _id: noteId, owner: userId });
    if (!note) {
        res.status(404).json({ error: 'Note not found' });
        return;
    }
    deleteNoteEmbeddings(noteId)
    res.json({ message: 'Note deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete note' });
  }
});



export default router;
