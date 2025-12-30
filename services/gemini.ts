
import { GoogleGenAI } from "@google/genai";
import { Position } from "../types.ts";

export async function getHint(
  currentCubes: Position[], 
  userGuess: string, 
  actualCount: number
): Promise<string> {
  // Always initialize a new GoogleGenAI instance before making an API call
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-flash-preview";
  const prompt = `
    你是一位有趣的数学老师。
    学生正在玩一个“数正方体”的3D游戏。
    场景描述：
    - 正方体总数：${actualCount}
    - 学生的猜测：${userGuess || '尚未输入'}
    - 规则：不悬空，每层大于2个则必须相邻。
    
    请用亲切、简短的语气提供一个提示或反馈。不要直接告诉他们正确答案。
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { temperature: 0.7 }
    });
    // Use .text getter property directly
    return response.text || "加油，再数数看！";
  } catch (error) {
    return "仔细观察正方体的遮挡关系哦！";
  }
}
