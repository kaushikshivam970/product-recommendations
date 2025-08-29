import express from "express";
import {
  getRecommendations,
  listProducts,
  listUsers,
} from "../../controller/Recommendation/RecommendationController.mjs";
const recommendationRoutes = express.Router();
const initialization = () => {
  getRoutes();
  postRoutes();
  putRoutes();
};

const getRoutes = () => {
  recommendationRoutes.get("/products", listProducts);
  recommendationRoutes.get("/users", listUsers);
  recommendationRoutes.get("/get-recommendation", getRecommendations);
};
const postRoutes = () => {};
const putRoutes = () => {};

initialization();

export default recommendationRoutes;
