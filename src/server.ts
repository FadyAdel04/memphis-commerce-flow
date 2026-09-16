import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import {
  handleMetaWebhookGet,
  handleMetaWebhookPost,
  handleSendMessageApi,
  handleTestConnectionApi,
  handleGetConversationsApi,
  handleIgOAuthCallbackApi,
  handleSendIgMessageApi,
  handleGetIgStatusApi,
  handleIgAuthUrlApi,
  handleSyncIgConversationsApi,
  handleCreateIgConversationApi,
  handleSimulateInboundIgMessageApi,
} from "./lib/meta-webhook-handler";


type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};


let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}
export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);

      // Meta Webhook endpoints (handles both /api/webhooks/meta and /webhooks/meta)
      if (url.pathname === "/api/webhooks/meta" || url.pathname === "/webhooks/meta") {
        if (request.method === "GET") {
          return await handleMetaWebhookGet(request);
        }
        if (request.method === "POST") {
          return await handleMetaWebhookPost(request);
        }
      }

      // Outbound Message send endpoint
      if (url.pathname === "/api/messages/send" && request.method === "POST") {
        return await handleSendMessageApi(request);
      }

      // Fetch live conversations endpoint
      if (url.pathname === "/api/messages/conversations" && request.method === "GET") {
        return await handleGetConversationsApi();
      }

      // Test Connection endpoint
      if (url.pathname === "/api/meta/test-connection") {
        return await handleTestConnectionApi(request);
      }

      // Instagram OAuth callback (redirect from Meta/Instagram after user grants permissions)
      if (url.pathname === "/api/instagram/oauth/callback" && request.method === "GET") {
        return await handleIgOAuthCallbackApi(request);
      }

      // Instagram auth URL generator (returns the OAuth authorize URL)
      if (url.pathname === "/api/instagram/auth-url" && request.method === "GET") {
        return await handleIgAuthUrlApi(request);
      }

      // Instagram status (connected account info for current store)
      if (url.pathname === "/api/instagram/status" && request.method === "GET") {
        return await handleGetIgStatusApi(request);
      }

      // Instagram outbound DM send
      if (url.pathname === "/api/instagram/messages/send" && request.method === "POST") {
        return await handleSendIgMessageApi(request);
      }

      // Instagram sync live DMs
      if (url.pathname === "/api/instagram/sync" && (request.method === "GET" || request.method === "POST")) {
        return await handleSyncIgConversationsApi(request);
      }

      // Instagram start new conversation
      if (url.pathname === "/api/instagram/conversations/create" && request.method === "POST") {
        return await handleCreateIgConversationApi(request);
      }

      // Instagram simulate/test inbound DM
      if (url.pathname === "/api/instagram/test-inbound" && request.method === "POST") {
        return await handleSimulateInboundIgMessageApi(request);
      }
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error("Server fetch error:", error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};

