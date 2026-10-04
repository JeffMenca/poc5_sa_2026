import type { AddressInfo } from "node:net";
import type { Express } from "express";

export interface TestServer {
  url: string;
  request: (method: string, path: string, body?: unknown) => Promise<{ status: number; body: any }>;
  close: () => Promise<void>;
}

export async function testServer(app: Express): Promise<TestServer> {
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

  return {
    url,
    async request(method, path, body) {
      const response = await fetch(`${url}${path}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      const text = await response.text();
      return { status: response.status, body: text ? JSON.parse(text) : undefined };
    },
    close: () => new Promise((resolve) => server.close(() => resolve())),
  };
}
