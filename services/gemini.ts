
import { GoogleGenAI } from "@google/genai";
import { Position } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getHint(
  currentCubes: Position[], 
  userGuess: string, 
  actualCount: number
): Promise<string> {
  const model = "gemini-3-flash-preview";
  const prompt = `
    你是一位有趣的数学老师。
    学生正在玩一个“数正方体”的3D游戏。
    场景描述：
    - 正方体总数：${actualCount}
    - 学生的猜测：${userGuess || '尚未输入'}
    - 规则：不悬空，每层大于2个则必须相邻。
    
    请用亲切、简短的语气提供一个提示或反馈。不要直接告诉他们正确答案，除非他们猜对了。
    如果猜测错了，给出一个观察视角或思考路径的提示（例如：“试着旋转一下视角，看看后面有没有藏着的方块”）。
    如果是对的，给予热情鼓励！
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });
    return response.text || "加油，再数数看！";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "仔细观察正方体的遮挡关系哦！";
  }
}
