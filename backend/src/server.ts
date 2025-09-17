import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "dotenv";
import usersRouter from "./routes/users.js";

config();

const app = express();
const PORT = process.env.PORT ?? 8000;

app.use(helmet());
app.use(morgan("combined"));
app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/api/users", usersRouter);

app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "OK",
    message: "SNS Platform Backend is running",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/test", (req: Request, res: Response) => {
  res.json({
    message: "API is working!",
    environment: process.env.NODE_ENV ?? "development",
  });
});

app.use("*", (req: Request, res: Response) => {
  res.status(404).json({ message: "Endpoint not found" });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Test API: http://localhost:${PORT}/api/test`);
});
