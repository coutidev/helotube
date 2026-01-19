
import { GoogleGenAI, Type } from "@google/genai";
import { Comment } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateVideoComments = async (videoTitle: string): Promise<Comment[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Gere 5 comentários realistas e engraçados em português do Brasil para um vídeo chamado "${videoTitle}". 
      Instruções:
      - Use gírias da internet brasileira (kkkkk, rindo muito, socorro, amei, morta, genteee, ícone, etc).
      - Se o título for "VLOG COM SAUDADE DO MOR #01", faça comentários fofos de apoio sobre o casal, tipo "que lindos", "ela vai amar", "meta de relacionamento".
      - Se falar da Virginia, cite "base de 200 reais" ou "dancinha".
      - Se falar de BBB, cite "barraco", "paredão" ou "estratégia".
      - Os comentários devem parecer de pessoas reais em 2024.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              author: { type: Type.STRING },
              avatar: { type: Type.STRING },
              text: { type: Type.STRING },
              likes: { type: Type.STRING },
              time: { type: Type.STRING },
            },
            required: ["id", "author", "text", "likes", "time"]
          }
        }
      }
    });

    const comments = JSON.parse(response.text);
    return comments.map((c: any) => ({
      ...c,
      avatar: `https://i.pravatar.cc/150?u=${c.id}`
    }));
  } catch (error) {
    console.error("Erro ao gerar comentários:", error);
    return [];
  }
};

export const generateVideoDescription = async (videoTitle: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Escreva uma descrição muito engraçada e típica da internet brasileira para um vídeo chamado "${videoTitle}" no canal HeloTube. 
      IMPORTANTE: Se o vídeo for "VLOG COM SAUDADE DO MOR #01", a descrição DEVE obrigatoriamente dizer que o autor é perdidamente apaixonado por ela e estava morrendo de saudades. Use emojis fofos.
      Para outros vídeos, use gírias atuais e hashtags como #memesbr #virginia #bbb #tiktokbr #fofoca.`,
    });
    return response.text;
  } catch (error) {
    return "Bem-vindos ao HeloTube! Genteee, não esqueça de deixar o seu like e se inscrever kkkk. 😂 #memesbr #saudades";
  }
};
