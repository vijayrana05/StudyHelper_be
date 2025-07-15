import { index } from '../config/pinecone';
import { genAI } from '../utils/embedding';
import geminiModel from './gemini';
export async function searchInsideNote(noteId: string, query: string) {
  // 1. Embed the query
  const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
  const queryEmbedding = await model.embedContent(query);

  // 2. Query Pinecone for chunks of that note only
  const result = await index.query({
    topK: 3,
    vector: queryEmbedding.embedding.values,
    includeMetadata: true,
    filter: {
      noteId: noteId, // ✅ Plain key-value works fine with Pinecone
    },
  });

  // 3. Extract top 3 matching chunks and combine them as context
  const topChunks = result.matches?.map(
    (match) => match.metadata?.text as string
  ).filter(Boolean) || [];

  const combinedContext = topChunks.join('\n\n');

  // 4. Pass context + query to AI model
  const aiResponse = await geminiModel.generateContent({
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `Context:\n${combinedContext}\n\nQuery: ${query}`,
          },
        ],
      },
    ],
  });

  // 5. Return AI model's text response
  return aiResponse.response.text(); // or however your SDK exposes it
}
