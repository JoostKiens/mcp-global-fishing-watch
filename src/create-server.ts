import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function createMcpServer(): McpServer {
  return new McpServer({ name: "gfw-mcp-server", version: "0.1.0" });
}
