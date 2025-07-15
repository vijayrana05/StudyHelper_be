import geminiModel from "./gemini";
export async function summarizeText(text: string): Promise<string> {
  try {
    const prompt = `
"Summarize the following document thoroughly. Include all key points, important facts, statistics, and conclusions. Structure the summary in a clear and organized way using bullet points or short paragraphs. Do not leave out any relevant detail. Assume the reader has not seen the original and needs a complete understanding." ${text}
`;
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response; 
    return response.text();      
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
}




