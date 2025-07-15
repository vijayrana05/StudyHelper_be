import express from 'express';
import multer from 'multer';
//@ts-ignore 
import pdfParse from 'pdf-parse';
import fs from 'fs/promises';
import { summarizeText } from '../utils/summarize'; // We'll define this
import { createEmbeddings } from '../utils/embedding';
import Note from '../models/note';
import { verifyToken } from '../middleware/auth';

const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.post('/upload', verifyToken ,upload.single('file'), async (req, res):Promise<void> => {
  console.log("inside upload");
  const userId = (req as any).user.id;
  try {
    const file = req.file;

    if (!file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
    }

    const fileBuffer = await fs.readFile(file.path);

    const pdfData = await pdfParse(fileBuffer);
    const extractedText = pdfData.text;
    

    const summary = await summarizeText(extractedText);
    // const note = new Note({ title: file.originalname, content: summary, owner: userId });

    // await note.save();
    // console.log("note saved");
    // const noteId = note._id;
    // createEmbeddings(summary,noteId)
    await fs.unlink(file.path); 
    
    

    console.log("text is generated i guess")
    res.json({ summary});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong while uploading or summarizing' });
  }
});

export default router;
