"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProducts = exports.getProducts = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getProducts = async (req, res) => {
    try {
        const search = req.query.search?.toString();
        const whereClause = {};
        if (search) {
            whereClause.name = {
                contains: search,
            };
        }
        const products = await prisma.products.findMany({
            where: whereClause,
        });
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ message: "Error retrieving products" });
    }
};
exports.getProducts = getProducts;
const createProducts = async (req, res) => {
    try {
        const { productId, name, price, rating, stockQuantity } = req.body;
        const product = await prisma.products.create({
            data: {
                productId,
                name,
                price,
                rating,
                stockQuantity,
            },
        });
        res.status(201).json(product);
    }
    catch (error) {
        res.status(201).json({ message: "Error" });
    }
};
exports.createProducts = createProducts;
//# sourceMappingURL=productControllers.js.map