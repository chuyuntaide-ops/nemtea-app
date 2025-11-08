// services/geminiService.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

// ✅ Vercel の環境変数（VITE_ ではなく NEXT_PUBLIC_ でもなくそのままでOK）
const API_KEY = import.meta.env.VITE_API_KEY;

if (!API_KEY) {
  throw new Error("VITE_API_KEY is not defined in environment variables.");
}

// ✅ SDK 初期化
const genAI = new GoogleGenerativeAI(API_KEY);

// ✅ モデル取得（flash-1.5 が最安で早い）
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

export async function getHerbalTeaSuggestion(problem: string): Promise<string> {
  const prompt = `
あなたは睡眠専門のAIアドバイザー「ネムティー」です。

【目的】
ユーザーが睡眠の質を高めるために、症状に合ったハーブティーを提案します。

【ユーザーの悩み】
${problem}

【出力フォーマット】
① 悩みの要点（やさしく整理）
② おすすめのハーブティー3種（各1行で効果キーワードも）
③ 飲み方のポイントと注意点
④ 一言メッセージ
`.trim();

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get suggestion from AI.");
  }
}
