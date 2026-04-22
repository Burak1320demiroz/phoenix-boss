import { Groq } from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * POST /api/chat
 *
 * This route handler proxies requests to Groq API.
 * It receives messages from the frontend and streams the AI response back.
 */
export async function POST(req: Request) {
  try {
    const { messages, model } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid request: messages array required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const selectedModel = model || "llama-3.3-70b-versatile"

    const transformedMessages = messages.map(
      (m: { role: string; content: string }) => {
        return {
          role: m.role as "user" | "assistant",
          content: m.content,
        }
      },
    )

    // Filter out any messages with empty content
    const validMessages = transformedMessages.filter((m: { content: string }) => {
      return m.content.trim().length > 0
    })

    if (validMessages.length === 0) {
      return new Response(JSON.stringify({ error: "No valid messages to process" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    let maxTokens = 1024;
    let temperature = 1;
    let topP = 1;
    let reasoningEffort: "low" | "medium" | "high" | "default" | null = null;

    if (selectedModel === "qwen/qwen3-32b") {
      maxTokens = 4096;
      temperature = 0.6;
      topP = 0.95;
      reasoningEffort = "default";
    } else if (selectedModel === "meta-llama/llama-4-scout-17b-16e-instruct" || selectedModel === "llama-3.3-70b-versatile") {
      maxTokens = 1024;
      temperature = 1;
      topP = 1;
    }

    // Add a system prompt at the beginning of the messages
    const requestMessages = [
      {
        role: "system" as const,
        content: `Sen yardımsever, arkadaş canlısı bir yapay zeka asistanısın. Her zaman Türkçe konuşacak ve cevap vereceksin. Açık, özlü ve doğru yanıtlar sağlarsın. Kod veya teknik konseptleri açıklarken, uygun yerlerde kod bloklarıyla birlikte markdown formatını kullan. Karşılıklı sohbet edercesine fakat profesyonel ol. Eğer bir şeyden emin değilsen, bunu dürüstçe belirt. KESİNLİKLE HER ZAMAN TÜRKÇE CEVAP VER.`
      },
      ...validMessages
    ];

    const chatCompletionStream = await groq.chat.completions.create({
      model: selectedModel,
      messages: requestMessages,
      temperature,
      max_completion_tokens: maxTokens,
      top_p: topP,
      stream: true,
      stop: null,
      ...(reasoningEffort ? { reasoning_effort: reasoningEffort } : {})
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of chatCompletionStream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
        } catch (e) {
          console.error("Stream generation error:", e);
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked'
      }
    });

  } catch (error) {
    console.error("Chat API error:", error)

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}
