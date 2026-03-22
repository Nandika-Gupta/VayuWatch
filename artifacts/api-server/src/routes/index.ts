import { Router, type IRouter } from "express";
import healthRouter from "./health";
import aqiRouter from "./aqi";

const router: IRouter = Router();

router.use(healthRouter);
router.use(aqiRouter);

export default router;
