import { Router, type IRouter } from "express";
import axios from "axios";
import { db, aqiReadingsTable } from "@workspace/db";
import { eq, desc, gte, and } from "drizzle-orm";
import { GetAqiQueryParams, GetHistoryQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

const WAQI_TOKEN = process.env["WAQI_TOKEN"];
const OPENWEATHER_KEY = process.env["OPENWEATHER_KEY"];

async function fetchWeather(city: string): Promise<{ temperature: number | null; humidity: number | null }> {
  if (!OPENWEATHER_KEY) return { temperature: null, humidity: null };
  try {
    const resp = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_KEY}&units=metric`,
      { timeout: 5000 }
    );
    const data = resp.data as { main?: { temp?: number; humidity?: number } };
    return {
      temperature: data.main?.temp ?? null,
      humidity: data.main?.humidity ?? null,
    };
  } catch {
    return { temperature: null, humidity: null };
  }
}

async function callWaqi(city: string) {
  const token = WAQI_TOKEN ?? "demo";
  const url = `https://api.waqi.info/feed/${encodeURIComponent(city)}/?token=${token}`;
  const resp = await axios.get(url, { timeout: 10000 });
  const data = resp.data as {
    status: string;
    data: {
      aqi: number;
      dominentpol?: string;
      time?: { s?: string };
      city?: { name?: string };
    };
  };
  // If token is invalid, fall back to demo token
  if (data.status === "error" && token !== "demo") {
    const demoResp = await axios.get(
      `https://api.waqi.info/feed/${encodeURIComponent(city)}/?token=demo`,
      { timeout: 10000 }
    );
    return demoResp.data as typeof data;
  }
  return data;
}

export async function fetchAndSaveAqi(city: string) {
  const data = await callWaqi(city);

  if (data.status !== "ok") throw new Error(`WAQI API error: ${data.status}`);

  const raw = data.data;
  const aqiVal = typeof raw.aqi === "number" ? raw.aqi : Number(raw.aqi);
  const dominentpol = raw.dominentpol ?? "unknown";
  const time = raw.time?.s ?? new Date().toISOString();
  const stationName = raw.city?.name ?? city;

  const weather = await fetchWeather(city);

  await db.insert(aqiReadingsTable).values({
    city: city.toLowerCase(),
    aqi: aqiVal,
    dominentpol,
    time,
    temperature: weather.temperature,
    humidity: weather.humidity,
  });

  return {
    city: stationName,
    aqi: aqiVal,
    dominentpol,
    time,
    temperature: weather.temperature,
    humidity: weather.humidity,
    stationName,
  };
}

router.get("/aqi", async (req, res) => {
  const query = GetAqiQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: "city parameter is required" });
    return;
  }

  const city = query.data.city;
  try {
    const result = await fetchAndSaveAqi(city);
    res.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    req.log.error({ err }, "Error fetching AQI");
    res.status(500).json({ error: msg });
  }
});

router.get("/history", async (req, res) => {
  const query = GetHistoryQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: "city parameter is required" });
    return;
  }

  const city = query.data.city.toLowerCase();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  try {
    const readings = await db
      .select()
      .from(aqiReadingsTable)
      .where(and(eq(aqiReadingsTable.city, city), gte(aqiReadingsTable.createdAt, sevenDaysAgo)))
      .orderBy(desc(aqiReadingsTable.createdAt))
      .limit(168);

    res.json(readings);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    req.log.error({ err }, "Error fetching AQI history");
    res.status(500).json({ error: msg });
  }
});

export default router;
