// services/geminiService.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

// Vite なので import.meta.env から。キー名は Vercel 側と一致（VITE_API_KEY）
const API_KEY = import.meta.env.VITE_API_KEY;

if (!API_KEY) {
  throw new Error("VITE_API_KEY is not defined in environment variables.");
}

// SDK を初期化 → モデルを取得
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
// もし 2.0 が無ければ "gemini-1.5-flash" でもOK

export async function getHerbalTeaSuggestion(problem: string): Promise<string> {
  const prompt = `
あなたは睡眠の専門AIアドバイザー「ネムティー」です。

【目的】
ユーザーが睡眠の質を高めるために、症状に合ったハーブティーを提案します。

【ユーザーの悩み】
${problem}

【出力フォーマット】
1. 悩みの要点（やさしく整理）
2. おすすめハーブティー3種（各1行で効能キーワードも）
3. 飲み方のポイントと注意点
4. 一言メッセージ
  `.trim();

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get suggestion from AI.");
  }
}
