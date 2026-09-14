import { Router } from "express";
import { createProducts, getProducts } from "../controllers/productControllers";
const router = Router();

router.get("/", getProducts);
router.post("/", createProducts);

export default router;
