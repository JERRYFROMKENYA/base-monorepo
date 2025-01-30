import { GoogleGenerativeAI } from '@google/generative-ai'
import { GeminiApiKey } from '@/lib/constants'
const genAI = new GoogleGenerativeAI(GeminiApiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });