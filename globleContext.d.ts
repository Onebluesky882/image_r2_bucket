import type { Context } from "hono";
import { Env } from "./type";
declare global {
  export type context = Context<{ Bindings: Env }>;
}
