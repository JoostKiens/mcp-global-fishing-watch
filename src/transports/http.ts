import http from "node:http";
import type { IncomingMessage, ServerResponse, Server } from "node:http";

import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

import { createMcpServer } from "../create-server.js";

async function readBody(req: IncomingMessage): Promise<unknown> {
  let raw = "";
  for await (const chunk of req) raw += String(chunk);
  return raw ? JSON.parse(raw) : undefined;
}

export async function startHttp(options: { port: number }): Promise<Server> {
  const httpServer = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
    try {
      const parsedBody = await readBody(req);
      // Stateless mode: the SDK requires a fresh transport (and server) per request.
      const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
      res.on("close", () => transport.close());
      await createMcpServer().connect(transport);
      await transport.handleRequest(req, res, parsedBody);
    } catch {
      res.statusCode = 400;
      res.end("invalid json\n");
    }
  });

  httpServer.listen(options.port, () => {
    console.log(`GFW MCP (http) listening on ${options.port}`);
  });

  return httpServer;
}
