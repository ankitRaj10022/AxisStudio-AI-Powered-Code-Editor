import { type NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { chatMessages } from "@/lib/database/schema";
import { getDbOrNull } from "@/lib/db";
import {
  generateWithOllama,
  getOllamaModel,
  OllamaError,
} from "@/lib/ollama";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

type ChatMode = "chat" | "review" | "fix" | "optimize";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
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

function isChatMode(value: unknown): value is ChatMode {
  return (
    value === "chat" ||
    value === "review" ||
    value === "fix" ||
    value === "optimize"
  );
}

function isEnhanceContext(
  value: unknown,
): value is EnhancePromptRequest["context"] {
  if (!isRecord(value)) {
    return false;
  }

  return (
    (value.fileName === undefined || typeof value.fileName === "string") &&
    (value.language === undefined || typeof value.language === "string") &&
    (value.codeContent === undefined || typeof value.codeContent === "string")
  );
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function sanitizeHistory(history: unknown) {
  if (!Array.isArray(history)) {
    return [] as ChatMessage[];
  }

  return history
    .filter(isChatMessage)
    .map((message) => ({
      role: message.role,
      content: message.content.trim(),
    }))
    .filter((message) => message.content.length > 0);
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

function getModeInstructions(mode: ChatMode) {
  switch (mode) {
    case "review":
      return `Treat this as a code review request.
- Prioritize correctness, regressions, security, performance, and maintainability.
- Call out concrete issues first, then suggest improvements.
- When code is provided, be specific about what should change and why.
- If context is missing, say what assumption you are making.`;
    case "fix":
      return `Treat this as a debugging and bug-fix request.
- Identify likely root causes before proposing changes.
- Give the smallest reliable fix first.
- Include corrected code when it helps.
- Mention how the user can verify the fix.`;
    case "optimize":
      return `Treat this as an optimization request.
- Focus on performance, reliability, readability, and maintainability.
- Prefer practical improvements over theoretical ones.
- Mention tradeoffs when an optimization changes complexity or clarity.
- If you suggest code changes, explain why they help.`;
    default:
      return `Treat this as a general AI coding assistant conversation.
- Answer coding questions directly and clearly.
- Give practical suggestions, explanations, and examples when useful.
- If the user asks for code, provide working code with correct formatting.`;
  }
}

function getOllamaGenerationOptions(mode: ChatMode) {
  const sharedOptions = {
    num_predict: 1000,
    repeat_penalty: 1.1,
    num_ctx: 4096,
  };

  switch (mode) {
    case "review":
      return {
        ...sharedOptions,
        temperature: 0.4,
        top_p: 0.85,
      };
    case "fix":
      return {
        ...sharedOptions,
        temperature: 0.35,
        top_p: 0.85,
      };
    case "optimize":
      return {
        ...sharedOptions,
        temperature: 0.5,
        top_p: 0.9,
      };
    default:
      return {
        ...sharedOptions,
        temperature: 0.7,
        top_p: 0.9,
      };
  }
}

async function generateAIResponse(
  messages: ChatMessage[],
  mode: ChatMode = "chat",
) {
  const systemPrompt = `You are an expert AI coding assistant. You help developers with:
- Code explanations and debugging
- Best practices and architecture advice
- Writing clean, efficient code
- Troubleshooting errors
- Code reviews and optimizations

Always provide clear, practical answers. When showing code, use proper formatting with language-specific syntax.
Keep responses concise but comprehensive. Use code blocks with language specification when providing code examples.

${getModeInstructions(mode)}`;

  const fullMessages = [{ role: "system", content: systemPrompt }, ...messages];

  const prompt = fullMessages
    .map((msg) => `${msg.role}: ${msg.content}`)
    .join("\n\n");

  return generateWithOllama({
    prompt,
    timeoutMs: 20000,
    options: getOllamaGenerationOptions(mode),
  });
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
    const result = await generateWithOllama({
      prompt: enhancementPrompt,
      timeoutMs: 15000,
      options: {
        temperature: 0.3,
        num_predict: 500,
      },
    });

    return result.response || request.prompt;
  } catch (error) {
    console.error("Prompt enhancement error:", error);
    return request.prompt;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();

    if (!isRecord(body)) {
      return NextResponse.json(
        { error: "Request body must be a JSON object" },
        { status: 400 },
      );
    }

    if (body.action === "enhance") {
      const prompt = normalizeText(body.prompt);

      if (!prompt) {
        return NextResponse.json(
          { error: "Prompt is required and must be a non-empty string" },
          { status: 400 },
        );
      }

      const enhancedPrompt = await enhancePrompt({
        prompt,
        context: isEnhanceContext(body.context) ? body.context : undefined,
      });

      return NextResponse.json({ enhancedPrompt });
    }

    const {
      message,
      history,
      persist,
      clientMessage,
      mode,
    }: {
      message?: unknown;
      history?: unknown;
      persist?: unknown;
      clientMessage?: unknown;
      mode?: unknown;
    } = body;

    const normalizedMessage = normalizeText(message);
    const normalizedClientMessage = normalizeText(clientMessage);

    if (!normalizedMessage) {
      return NextResponse.json(
        { error: "Message is required and must be a non-empty string" },
        { status: 400 },
      );
    }

    const requestMode = isChatMode(mode) ? mode : "chat";
    const recentHistory = sanitizeHistory(history).slice(-10);
    const messages: ChatMessage[] = [
      ...recentHistory,
      { role: "user", content: normalizedMessage },
    ];

    const aiResult = await generateAIResponse(messages, requestMode);
    const aiResponse = aiResult.response;

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
              content: normalizedClientMessage || normalizedMessage,
            },
            { role: "assistant", content: aiResponse },
          ])
        : false;

    return NextResponse.json({
      response: aiResponse,
      model: aiResult.model || getOllamaModel(),
      tokens: aiResult.tokens,
      promptTokens: aiResult.promptTokens,
      mode: requestMode,
      persisted,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in AI chat route:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    const statusCode = error instanceof OllamaError ? error.statusCode : 500;
    return NextResponse.json(
      {
        error: "Failed to generate AI response",
        details: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: statusCode },
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
