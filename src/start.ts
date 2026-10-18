import { createStart, createCsrfMiddleware, createMiddleware } from "@tanstack/react-start";

import { getRequest } from "@tanstack/react-start/server";
import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error("[ServerError]", error);

    try {
      const request = getRequest();
      const accept = request?.headers?.get("accept") ?? "";
      // If this is a server function RPC call or API request, let Start serialize the error
      if (
        request?.headers?.has("x-start-server-fn") ||
        request?.headers?.has("x-server-fn") ||
        !accept.includes("text/html")
      ) {
        throw error;
      }
    } catch (e) {
      if (e === error) throw e;
    }

    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Start installs this automatically when src/start.ts is absent; defining the
// file opts out, so re-add it explicitly to keep server functions protected
// from cross-site requests.
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [errorMiddleware, csrfMiddleware],
}));
