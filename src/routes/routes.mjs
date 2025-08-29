import express from "express";
import recommendationRoutes from "./RecommendationRoutes/recommendationRoutes.mjs";

const routes = express.Router();
const initialization = () => {
  app();
};

const app = () => {
  routes.use("/app/recommendations", recommendationRoutes);
};

initialization();

export default routes;
