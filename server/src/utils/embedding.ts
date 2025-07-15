// import { GoogleGenerativeAI } from '@google/generative-ai';
// import { Types } from 'mongoose';
// import { index } from '../config/pinecone';
// // Load environment variables


// // Initialize the Google AI client
// const apiKey = process.env.GEMINI_API_KEY;
// if (!apiKey) {
//   throw new Error('GOOGLE_API_KEY environment variable is not set');
// }
// console.log('API Key loaded:', apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 4));
// export const genAI = new GoogleGenerativeAI(apiKey);

// export interface EmbeddingResult {
//   chunk: string;
//   embedding: number[];
//   chunkIndex: number;
// }

// async function insertEmbeddings(embeddings: EmbeddingResult[], noteId: Types.ObjectId) {
//   if (!embeddings.length) {
//     console.log("⚠️ No embeddings generated — skipping upsert.");
//     return;
//   }

//   console.log("✅ Inserting embeddings into Pinecone...");
  
//   const vectors = embeddings.map((item) => ({
//     id: `${noteId}-chunk-${item.chunkIndex}`,
//     values: item.embedding,
//     metadata: { 
//       text: item.chunk,
//       noteId: noteId.toString(),
//       chunkIndex: item.chunkIndex
//     }
//   }));

//   await index.upsert(vectors); // This will now only run if vectors.length > 0
//   console.log("✅ Done inserting into Pinecone.");
// }


// async function generateEmbeddings(text: string, chunkSize: number = 800): Promise<EmbeddingResult[]> {
//   // Split text into chunks
//   const chunks = chunkText(text, chunkSize);
//   const results: EmbeddingResult[] = [];
  
//   console.log(`Processing ${chunks.length} chunks...`);
  
//   // Get the embedding model
//   const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
  
//   // Process each chunk with delay to respect rate limits
//   for (let i = 0; i < chunks.length; i++) {
//     try {
//       console.log(`Processing chunk ${i + 1}/${chunks.length}`);
      
//       const result = await model.embedContent(chunks[i]);
      
//       results.push({
//         chunk: chunks[i],
//         embedding: result.embedding.values,
//         chunkIndex: i
//       });
      
//       // Add delay to respect rate limits (1500 RPM = ~25 RPS, so ~40ms between requests)
//       if (i < chunks.length - 1) {
//         await delay(50);
//       }
      
//     } catch (error) {
//       console.error(`Error processing chunk ${i + 1}:`, error);
//       // You might want to retry or handle errors differently
//       throw error;
//     }
//   }
  
//   return results;
// }

// function chunkText(text: string, chunkSize: number): string[] {
//   const chunks: string[] = [];
  
//   for (let i = 0; i < text.length; i += chunkSize) {
//     chunks.push(text.slice(i, i + chunkSize));
//   }
  
//   return chunks;
// }

// function delay(ms: number): Promise<void> {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }

// // Example usage
// export async function createEmbeddings( yourText :any, noteId?: Types.ObjectId ) {
//   try {
    
//     const embeddings = await generateEmbeddings(yourText, 800);
   
//     // });
//     if(noteId){
//       insertEmbeddings(embeddings,noteId)
//     }
//     return embeddings;
 
    
//   } catch (error) {
//     console.error('Error:', error);
//   }
// }

// export async function deleteNoteEmbeddings(noteId: string) {
//   try {
//     await index.deleteMany({
    
//       noteId: { $eq: noteId.toString() } 
      
//     });
//     console.log(`Successfully deleted embeddings for noteId: ${noteId}`);
//   } catch (error) {
//     console.error('Error deleting embeddings:', error);
//     throw error;
//   }
// }

  

import { GoogleGenerativeAI } from '@google/generative-ai';
import { Types } from 'mongoose';
import { index } from '../config/pinecone';
// Load environment variables

// Initialize the Google AI client
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('GOOGLE_API_KEY environment variable is not set');
}
console.log('API Key loaded:', apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 4));
export const genAI = new GoogleGenerativeAI(apiKey);

export interface EmbeddingResult {
  chunk: string;
  embedding: number[];
  chunkIndex: number;
}

async function insertEmbeddings(embeddings: EmbeddingResult[], noteId: Types.ObjectId) {
  if (!embeddings.length) {
    console.log("⚠️ No embeddings generated — skipping upsert.");
    return;
  }

  console.log("✅ Inserting embeddings into Pinecone...");
  
  const vectors = embeddings.map((item) => ({
    id: `${noteId}-chunk-${item.chunkIndex}`,
    values: item.embedding,
    metadata: { 
      text: item.chunk.replace(/\n/g, ' ').trim(),
      noteId: noteId.toString(),
      chunkIndex: item.chunkIndex
    }
  }));

  await index.upsert(vectors); // This will now only run if vectors.length > 0
  console.log("✅ Done inserting into Pinecone.");
}

// IMPROVED CHUNKING FUNCTIONS
function chunkTextImproved(text: string, chunkSize: number): string[] {
  const chunks: string[] = [];
  
  // Clean up the text first
  const cleanText = text
    .replace(/\s+/g, ' ')  // Replace multiple whitespace with single space
    .trim();
  
  // Split into sentences or paragraphs for better semantic chunking
  const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  let currentChunk = '';
  
  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    
    // If adding this sentence would exceed chunk size
    if (currentChunk.length + trimmedSentence.length + 1 > chunkSize) {
      // Save current chunk if it has content
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }
      
      // Start new chunk with current sentence
      currentChunk = trimmedSentence;
      
      // If single sentence is too long, split it by character limit
      if (currentChunk.length > chunkSize) {
        const longSentenceParts = splitLongSentence(currentChunk, chunkSize);
        chunks.push(...longSentenceParts.slice(0, -1));
        currentChunk = longSentenceParts[longSentenceParts.length - 1];
      }
    } else {
      // Add sentence to current chunk
      currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
    }
  }
  
  // Add final chunk if it has content
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

function splitLongSentence(sentence: string, chunkSize: number): string[] {
  const parts: string[] = [];
  
  for (let i = 0; i < sentence.length; i += chunkSize) {
    parts.push(sentence.slice(i, i + chunkSize));
  }
  
  return parts;
}

function chunkByParagraphs(text: string, chunkSize: number): string[] {
  const chunks: string[] = [];
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  let currentChunk = '';
  
  for (const paragraph of paragraphs) {
    const cleanParagraph = paragraph.replace(/\s+/g, ' ').trim();
    
    if (currentChunk.length + cleanParagraph.length + 2 > chunkSize) {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }
      
      // If paragraph is too long, split it further
      if (cleanParagraph.length > chunkSize) {
        const subChunks = chunkTextImproved(cleanParagraph, chunkSize);
        chunks.push(...subChunks.slice(0, -1));
        currentChunk = subChunks[subChunks.length - 1];
      } else {
        currentChunk = cleanParagraph;
      }
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + cleanParagraph;
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

// ORIGINAL CHUNKING FUNCTION (keeping for backward compatibility)
function chunkText(text: string, chunkSize: number): string[] {
  const chunks: string[] = [];
  
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  
  return chunks;
}

// UPDATED GENERATE EMBEDDINGS FUNCTION
async function generateEmbeddings(
  text: string, 
  chunkSize: number = 800, 
  chunkingStrategy: 'simple' | 'semantic' | 'paragraph' = 'semantic'
): Promise<EmbeddingResult[]> {
  
  // Choose chunking strategy
  let chunks: string[];
  
  switch (chunkingStrategy) {
    case 'semantic':
      chunks = chunkTextImproved(text, chunkSize);
      break;
    case 'paragraph':
      chunks = chunkByParagraphs(text, chunkSize);
      break;
    case 'simple':
    default:
      chunks = chunkText(text, chunkSize);
      break;
  }
  
  const results: EmbeddingResult[] = [];
  
  console.log(`Processing ${chunks.length} chunks using ${chunkingStrategy} strategy...`);
  
  // Get the embedding model
  const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
  
  // Process each chunk with delay to respect rate limits
  for (let i = 0; i < chunks.length; i++) {
    try {
      console.log(`Processing chunk ${i + 1}/${chunks.length}`);
      
      const result = await model.embedContent(chunks[i]);
      
      results.push({
        chunk: chunks[i],
        embedding: result.embedding.values,
        chunkIndex: i
      });
      
      // Add delay to respect rate limits (1500 RPM = ~25 RPS, so ~40ms between requests)
      if (i < chunks.length - 1) {
        await delay(50);
      }
      
    } catch (error) {
      console.error(`Error processing chunk ${i + 1}:`, error);
      // You might want to retry or handle errors differently
      throw error;
    }
  }
  
  return results;
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// UPDATED CREATE EMBEDDINGS FUNCTION
export async function createEmbeddings(
  yourText: any, 
  noteId?: Types.ObjectId,
  chunkSize: number = 800,
  chunkingStrategy: 'simple' | 'semantic' | 'paragraph' = 'semantic'
) {
  try {
    
    const embeddings = await generateEmbeddings(yourText, chunkSize, chunkingStrategy);
    
    if(noteId){
      await insertEmbeddings(embeddings, noteId);
    }
    
    return embeddings;
    
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

export async function deleteNoteEmbeddings(noteId: string) {
  try {
    await index.deleteMany({
      noteId: { $eq: noteId.toString() } 
    });
    console.log(`Successfully deleted embeddings for noteId: ${noteId}`);
  } catch (error) {
    console.error('Error deleting embeddings:', error);
    throw error;
  }
}
