import { sql } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const images = sqliteTable("images", {
  id: int().primaryKey({ autoIncrement: true }),

  // Images
  imageUrl: text("image_url"),
  website: text("website"),

  // Timestamp
  added: text("added").default(sql`CURRENT_TIMESTAMP`),
});
