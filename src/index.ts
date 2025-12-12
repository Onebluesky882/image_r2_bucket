import { Hono } from "hono";
import { Env } from "../type";

const app = new Hono<{ Bindings: Env }>();

app.get("/message", (c) => {
  return c.text("Hello oneSkyblue882!");
});

export default app;
