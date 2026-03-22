import { pgTable, serial, text, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const aqiReadingsTable = pgTable("aqi_readings", {
  id: serial("id").primaryKey(),
  city: text("city").notNull(),
  aqi: real("aqi").notNull(),
  dominentpol: text("dominentpol").notNull(),
  time: text("time").notNull(),
  temperature: real("temperature"),
  humidity: real("humidity"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAqiReadingSchema = createInsertSchema(aqiReadingsTable).omit({ id: true, createdAt: true });
export type InsertAqiReading = z.infer<typeof insertAqiReadingSchema>;
export type AqiReading = typeof aqiReadingsTable.$inferSelect;
