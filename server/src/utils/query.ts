import note from '../models/note'; // Mongoose Note model
import { index } from '../config/pinecone';
import { genAI } from '../utils/embedding';


export async function searchNotes(query: string) {
  // Step 1: Embed the user query
    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const query_embedding = await model.embedContent(query);

  // Step 2: Query Pinecone
  const result = await index.query({
    topK: 3,
    vector: query_embedding.embedding.values,
    includeMetadata: true,
  });

  // Step 3: Extract noteIds from top results
  const noteIds = new Set<string>();
  result.matches?.forEach(match => {
    if (match.metadata?.noteId) {
      noteIds.add(match.metadata.noteId as string);
    }
  });

  // Step 4: Get full notes from DB
  const notes = await note.find({ _id: { $in: Array.from(noteIds) } });

  return notes;
}
