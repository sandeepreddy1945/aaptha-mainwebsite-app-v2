import { createMCPClient } from '@ai-sdk/mcp';
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateId,
  stepCountIs,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from 'ai';
import { createOllama } from 'ollama-ai-provider-v2';

export const prerender = false;

const DEFAULT_MODEL = process.env.OLLAMA_MODEL ?? 'qwen3.5:4b';
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? 'http://127.0.0.1:11434/api';
const MCP_SERVER_URL = process.env.MCP_SERVER_URL ?? 'http://localhost:8000/mcp';
const SUPPORT_REPLY =
  'I’m sorry, but I’m unable to connect to the local assistant right now. Please make sure Ollama is running and try again.';
const TOOL_SUPPORT_REPLY =
  'I’m sorry, but I’m unable to connect to the assistant tools right now. Please try again later.';
const AVAILABLE_MODELS = new Set(['qwen3.5:4b', 'qwen3:0.6b']);

const ollama = createOllama({ baseURL: OLLAMA_BASE_URL });

type ChatRequest = {
  enableTools?: boolean;
  messages?: UIMessage[];
  model?: string;
};

type McpClient = Awaited<ReturnType<typeof createMCPClient>>;
type McpTools = Awaited<ReturnType<McpClient['tools']>>;
type McpResources = {
  client: McpClient;
  tools: McpTools;
};

let mcpResourcesPromise: Promise<McpResources> | undefined;

const initializeMcpResources = async (): Promise<McpResources> => {
  const client = await createMCPClient({
    transport: {
      type: 'http',
      url: MCP_SERVER_URL,
    },
  });

  try {
    return { client, tools: await client.tools() };
  } catch (error) {
    await client.close().catch(() => undefined);
    throw error;
  }
};

const getMcpResources = async () => {
  if (!mcpResourcesPromise) {
    mcpResourcesPromise = initializeMcpResources();
  }

  try {
    return await mcpResourcesPromise;
  } catch (error) {
    mcpResourcesPromise = undefined;
    throw error;
  }
};

const createFallbackResponse = (text: string, status = 200) => {
  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      const textId = generateId();

      writer.write({ type: 'text-start', id: textId });
      writer.write({ type: 'text-delta', id: textId, delta: text });
      writer.write({ type: 'text-end', id: textId });
    },
  });

  return createUIMessageStreamResponse({ stream, status });
};

export async function POST({ request }: { request: Request }) {
  try {
    const payload = (await request.json()) as ChatRequest;
    const messages = payload.messages ?? [];

    if (!Array.isArray(messages)) {
      return createFallbackResponse('Invalid chat messages.', 400);
    }

    const requestedModel = typeof payload.model === 'string' ? payload.model : DEFAULT_MODEL;
    const model = AVAILABLE_MODELS.has(requestedModel) ? requestedModel : DEFAULT_MODEL;
    const enableTools = payload.enableTools === true;
    const modelMessages = await convertToModelMessages(messages);
    const mcpResources = enableTools ? await getMcpResources() : undefined;
    const tools = mcpResources?.tools;

    if (enableTools && (!tools || Object.keys(tools).length === 0)) {
      return createFallbackResponse(TOOL_SUPPORT_REPLY);
    }

    const result = streamText({
      model: ollama(model),
      system: enableTools
        ? 'You are the Aaptha Elder Care assistant with access to MCP tools. Use the single best matching tool when the user requests information or an action that a tool can provide. Never invent tool results. Otherwise answer questions about Aaptha services, elder care, companionship, contact details, careers, and general caregiving guidance. Be concise, empathetic, and honest.'
        : 'You are the Aaptha Elder Care assistant. Answer questions about Aaptha services, elder care, companionship, contact details, careers, and general caregiving guidance. Be concise, empathetic, and honest. If you do not know something, say so instead of inventing details.',
      messages: modelMessages,
      providerOptions: {
        ollama: {
          think: true,
        },
      },
      ...(tools
        ? {
            stopWhen: [stepCountIs(5)],
            toolChoice: 'auto' as const,
            tools,
          }
        : {}),
    });

    const stream = toUIMessageStream({
      onError: () => (enableTools ? TOOL_SUPPORT_REPLY : SUPPORT_REPLY),
      originalMessages: messages,
      sendReasoning: true,
      stream: result.stream,
      ...(tools ? { tools } : {}),
    });

    return createUIMessageStreamResponse({ stream });
  } catch {
    return createFallbackResponse(SUPPORT_REPLY);
  }
}
