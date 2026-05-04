import { type NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { chatMessages } from "@/lib/database/schema";
import { getDbOrNull } from "@/lib/db";
import {
  getOllamaBaseUrl,
  getOllamaHeaders,
  getOllamaModel,
} from "@/lib/ollama";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function isChatMessage(value: unknown): value is ChatMessage {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as { role?: unknown; content?: unknown };
  return (
    (candidate.role === "user" || candidate.role === "assistant") &&
    typeof candidate.content === "string"
  );
}

interface EnhancePromptRequest {
  prompt: string;
  context?: {
    fileName?: string;
    language?: string;
    codeContent?: string;
  };
}

interface PersistedChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

async function getAuthenticatedUserId() {
  const session = await auth();
  return session?.user?.id ?? null;
}

async function loadPersistedMessages(
  limit: number,
): Promise<{ messages: PersistedChatMessage[]; persisted: boolean }> {
  const userId = await getAuthenticatedUserId();
  const db = getDbOrNull();

  if (!userId || !db) {
    return { messages: [], persisted: false };
  }

  const rows = await db
    .select({
      id: chatMessages.id,
      role: chatMessages.role,
      content: chatMessages.content,
      createdAt: chatMessages.createdAt,
    })
    .from(chatMessages)
    .where(eq(chatMessages.userId, userId))
    .orderBy(desc(chatMessages.createdAt))
    .limit(limit);

  return {
    messages: rows
      .reverse()
      .filter(
        (
          row,
        ): row is typeof row & {
          role: "user" | "assistant";
        } => row.role === "user" || row.role === "assistant",
      )
      .map((row) => ({
        id: row.id,
        role: row.role,
        content: row.content,
        timestamp: row.createdAt.toISOString(),
      })),
    persisted: true,
  };
}

async function persistConversation(
  userId: string,
  messages: ChatMessage[],
): Promise<boolean> {
  const db = getDbOrNull();

  if (!db || messages.length === 0) {
    return false;
  }

  await db.insert(chatMessages).values(
    messages.map((message) => ({
      userId,
      role: message.role,
      content: message.content,
    })),
  );

  return true;
}

async function generateAIResponse(messages: ChatMessage[]) {
  const systemPrompt = `You are an expert AI coding assistant. You help developers with:
- Code explanations and debugging
- Best practices and architecture advice
- Writing clean, efficient code
- Troubleshooting errors
- Code reviews and optimizations

Always provide clear, practical answers. When showing code, use proper formatting with language-specific syntax.
Keep responses concise but comprehensive. Use code blocks with language specification when providing code examples.`;

  const fullMessages = [{ role: "system", content: systemPrompt }, ...messages];

  const prompt = fullMessages
    .map((msg) => `${msg.role}: ${msg.content}`)
    .join("\n\n");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  const ollamaBaseUrl = getOllamaBaseUrl();
  const ollamaModel = getOllamaModel();

  try {
    const response = await fetch(`${ollamaBaseUrl}/generate`, {
      method: "POST",
      headers: getOllamaHeaders(),
      body: JSON.stringify({
        model: ollamaModel,
        prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 1000,
          num_predict: 1000,
          repeat_penalty: 1.1,
          context_length: 4096,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error from AI model API:", errorText);
      throw new Error(`AI model API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    if (!data.response) {
      throw new Error("No response from AI model");
    }
    return data.response.trim();
  } catch (error) {
    clearTimeout(timeoutId);
    if ((error as Error).name === "AbortError") {
      throw new Error("Request timeout: AI model took too long to respond");
    }
    console.error("AI generation error:", error);
    throw error;
  }
}

async function enhancePrompt(request: EnhancePromptRequest) {
  const enhancementPrompt = `You are a prompt enhancement assistant. Take the user's basic prompt and enhance it to be more specific, detailed, and effective for a coding AI assistant.

Original prompt: "${request.prompt}"

Context: ${request.context ? JSON.stringify(request.context, null, 2) : "No additional context"}

Enhanced prompt should:
- Be more specific and detailed
- Include relevant technical context
- Ask for specific examples or explanations
- Be clear about expected output format
- Maintain the original intent

Return only the enhanced prompt, nothing else.`;

  try {
    const response = await fetch(`${getOllamaBaseUrl()}/generate`, {
      method: "POST",
      headers: getOllamaHeaders(),
      body: JSON.stringify({
        model: getOllamaModel(),
        prompt: enhancementPrompt,
        stream: false,
        options: {
          temperature: 0.3,
          max_tokens: 500,
        },
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to enhance prompt");
    }

    const data = await response.json();
    return data.response?.trim() || request.prompt;
  } catch (error) {
    console.error("Prompt enhancement error:", error);
    return request.prompt;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.action === "enhance") {
      const enhancedPrompt = await enhancePrompt(body as EnhancePromptRequest);
      return NextResponse.json({ enhancedPrompt });
    }

    const {
      message,
      history,
      persist,
      clientMessage,
    }: {
      message?: unknown;
      history?: unknown;
      persist?: unknown;
      clientMessage?: unknown;
    } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required and must be a string" },
        { status: 400 },
      );
    }

    const validHistory = Array.isArray(history)
      ? history.filter(isChatMessage)
      : [];

    const recentHistory = validHistory.slice(-10);
    const messages: ChatMessage[] = [
      ...recentHistory,
      { role: "user", content: message },
    ];

    const aiResponse = await generateAIResponse(messages);

    if (!aiResponse) {
      throw new Error("Empty response from AI model");
    }

    const userId = await getAuthenticatedUserId();
    const shouldPersist = persist !== false;
    const persisted =
      shouldPersist && userId
        ? await persistConversation(userId, [
            {
              role: "user",
              content:
                typeof clientMessage === "string" && clientMessage.trim()
                  ? clientMessage.trim()
                  : message,
            },
            { role: "assistant", content: aiResponse },
          ])
        : false;

    return NextResponse.json({
      response: aiResponse,
      model: getOllamaModel(),
      persisted,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in AI chat route:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      {
        error: "Failed to generate AI response",
        details: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;

  if (searchParams.get("history") === "1") {
    const rawLimit = Number.parseInt(searchParams.get("limit") ?? "50", 10);
    const limit = Number.isFinite(rawLimit)
      ? Math.min(Math.max(rawLimit, 1), 200)
      : 50;

    try {
      const { messages, persisted } = await loadPersistedMessages(limit);
      return NextResponse.json({
        messages,
        persisted,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error loading persisted chat messages:", error);
      return NextResponse.json(
        {
          error: "Failed to load chat history",
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({
    status: "AI Chat API is running",
    timestamp: new Date().toISOString(),
    info: "Use POST method to send chat messages or enhance prompts",
  });
}

export async function DELETE() {
  try {
    const userId = await getAuthenticatedUserId();
    const db = getDbOrNull();

    if (!userId || !db) {
      return NextResponse.json({
        success: true,
        persisted: false,
        timestamp: new Date().toISOString(),
      });
    }

    await db.delete(chatMessages).where(eq(chatMessages.userId, userId));

    return NextResponse.json({
      success: true,
      persisted: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error clearing persisted chat messages:", error);
    return NextResponse.json(
      {
        error: "Failed to clear chat history",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
