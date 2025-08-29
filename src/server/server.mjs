import { config } from "dotenv";
config();
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import routes from "../routes/routes.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());

app.use(express.static(path.join(__dirname, "..", "..", "public")));

app.use("/api/v1", routes);

export default app;
