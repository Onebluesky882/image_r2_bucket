import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    accountId: "6c28233c3a0dd724c83f8c877166ed52",
    databaseId: "86a1bc0a-d9b4-4238-aedf-f9b7ae38425a",
    token: "edqV0Fq5QYWIRRrGQ9xnKad04COZLbk9aG9GIdOg",
  },
});
