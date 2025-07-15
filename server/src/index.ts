import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import notesRoutes from './routes/notesRoutes';
import uploadRoutes from './routes/uploadRoutes';
import searchRoutes from './routes/searchRoutes';
import askAiRoutes from './routes/askAiRoutes'
import queryNotesRoutes from './routes/queryNotes'

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/authRoutes', authRoutes);
app.use('/api/notesRoutes', notesRoutes);
app.use('/api/uploadRoutes',uploadRoutes )
app.use('/api/searchRoutes',searchRoutes )
app.use('/api/askAiRoutes',askAiRoutes)
app.use('/api/queryNotesRoutes',queryNotesRoutes)


// Connect to DB and start server
connectDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`🚀 Server running on port ${process.env.PORT}`);
  });
});
