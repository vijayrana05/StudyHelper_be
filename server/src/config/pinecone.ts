import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';

dotenv.config();
const p_api_key = process.env.PINECONE_API_KEY; 
if (!p_api_key) {
  throw new Error('PINECONE_API_KEY environment variable is not set');
}
const pc = new Pinecone({
  apiKey:p_api_key
});
export const index = pc.index('studyhelper');