import express from "express";
import healthRoutes from "./routes/health.route";
import routes from "./routes";
import { errorMiddleware } from "./common/middleware/error.middleware";

const app = express();

app.use(express.json());

app.use(healthRoutes);
app.use("/api", routes);
app.use(errorMiddleware);

export default app;
