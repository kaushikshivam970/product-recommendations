import {
  getAllProducts,
  getAllUsers,
  recommend,
} from "../../helper/recommendationHelper.mjs";

export const listProducts = async (req, res) => {
  try {
    const products = await getAllProducts();
    return res.status(200).send({
      statusText: "OK",
      status: 200,
      message: "Products list fetched successfully",
      data: { products },
    });
  } catch (error) {
    res.status(400).send({
      statusText: "BAD REQUEST",
      status: 400,
      message: error?.message || "Error Occur while fetching products list",
      data: {},
    });
  }
};
export const listUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    return res.status(200).send({
      statusText: "OK",
      status: 200,
      message: "Users list fetched successfully",
      data: { users },
    });
  } catch (error) {
    res.status(400).send({
      statusText: "BAD REQUEST",
      status: 400,
      message: error?.message || "Error Occur while fetching users list",
      data: {},
    });
  }
};

export const getRecommendations = async (req, res) => {
  try {
    const {
      productId,
      userId = null,
      top = "5",
      excludeOwned = "true",
    } = req.query;
    if (!productId) {
      return res.status(400).send({
        statusText: "BAD REQUEST",
        status: 400,
        message: "productId is required",
        data: { productId },
      });
    }
    const recommendations = await recommend(
      productId,
      Number(top) || 5,
      userId || null,
      {
        excludeOwned: excludeOwned !== "false",
      }
    );
    return res.status(200).send({
      statusText: "OK",
      status: 200,
      message: "Recommendations generated successfully",
      data: {
        productId,
        recommendations,
      },
    });
  } catch (error) {
    res.status(400).send({
      statusText: "BAD REQUEST",
      status: 400,
      message: error?.message || "Failed to compute recommendations",
      data: {},
    });
  }
};
