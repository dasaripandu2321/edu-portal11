import { NextRequest, NextResponse } from 'next/server';
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

const ai = genkit({ plugins: [googleAI()] });

export async function POST(req: NextRequest) {
  try {
    const { messages, context } = await req.json();

    const systemPrompt = `You are an expert programming tutor and doubt-clearing assistant for Edu Portal. 
Your role is to help students understand programming concepts, debug code, and clarify doubts.
${context ? `The student is currently studying: ${context}` : ''}

Guidelines:
- Give clear, concise explanations with examples
- When explaining code, use proper code blocks
- Break down complex concepts into simple steps
- Be encouraging and supportive
- If asked about code bugs, explain what's wrong and how to fix it
- Keep responses focused and practical`;

    const history = messages.slice(0, -1).map((m: any) => ({
      role: m.role,
      content: [{ text: m.content }],
    }));

    const lastMessage = messages[messages.length - 1].content;

    const { text } = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      system: systemPrompt,
      messages: history,
      prompt: lastMessage,
    });

    return NextResponse.json({ reply: text });
  } catch (err) {
    console.error('AI chat error:', err);
    return NextResponse.json({ error: 'Failed to get AI response.' }, { status: 500 });
  }
}
