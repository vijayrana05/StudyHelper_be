import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const geminiModel: GenerativeModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export default geminiModel;