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
const PORT = parseInt(process.env.PORT || '5000', 10);

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    /^https:\/\/.*\.vercel\.app$/  // This matches any *.vercel.app domain
  ],
  credentials: true
}));
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'StudyHelper API is running!',
    status: 'success',
    endpoints: {
      auth: '/api/authRoutes',
      notes: '/api/notesRoutes',
      upload: '/api/uploadRoutes',
      search: '/api/searchRoutes',
      askAi: '/api/askAiRoutes',
      queryNotes: '/api/queryNotesRoutes'
    }
  });
});

app.use('/api/authRoutes', authRoutes);
app.use('/api/notesRoutes', notesRoutes);
app.use('/api/uploadRoutes', uploadRoutes);
app.use('/api/searchRoutes', searchRoutes);
app.use('/api/askAiRoutes', askAiRoutes);
app.use('/api/queryNotesRoutes', queryNotesRoutes);

// Connect to DB and start server
connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});