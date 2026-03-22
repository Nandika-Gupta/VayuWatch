import { Server as SocketIOServer } from "socket.io";
import { logger } from "./lib/logger";
import { fetchAndSaveAqi } from "./routes/aqi";

const DEFAULT_CITIES = ["Delhi", "Mumbai", "Bengaluru"];
const POLL_INTERVAL_MS = 60 * 1000;

export function startPoller(io: SocketIOServer) {
  async function pollAll() {
    for (const city of DEFAULT_CITIES) {
      try {
        const data = await fetchAndSaveAqi(city);
        io.emit("aqi:update", data);
        logger.info({ city, aqi: data.aqi }, "Polled and emitted AQI update");
      } catch (err) {
        logger.error({ err, city }, "Error polling AQI for city");
      }
    }
  }

  pollAll();
  const interval = setInterval(pollAll, POLL_INTERVAL_MS);

  return () => clearInterval(interval);
}
