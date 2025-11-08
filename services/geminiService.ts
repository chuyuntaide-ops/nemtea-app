// services/geminiService.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

// ✅ 正しい Vite の環境変数読み込み
const API_KEY = import.meta.env.VITE_API_KEY;

if (!API_KEY) {
  throw new Error("VITE_API_KEY が設定されていません。Vercel の環境変数を確認してください。");
}

// ✅ SDK 初期化
const genAI = new GoogleGenerativeAI(API_KEY);

// ✅ モデルの正しい呼び方（最新）
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

// ✅ プロンプトを送って回答を取得
export async function getHerbalTeaSuggestion(problem: string): Promise<string> {
  const prompt = `
あなたは睡眠専門AIアドバイザー「ネムティー」です。

【目的】
ユーザーが睡眠の質を高めるために、症状に合ったハーブティーを提案します。

【ユーザーの悩み】
${problem}

【出力形式】
① 悩みの分析
② おすすめのハーブティー
・ティー名｜効果｜説明
③ 飲み方のアドバイス
④ 追加の生活習慣の提案
`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("AI からの提案取得に失敗しました。");
  }
}
