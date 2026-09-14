import express from "express";
import dotenv from "dotenv";
import bodyparser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import dashboardRoutes from "./routes/dashboardRoute";
import morgan from "morgan";
import productRoute from "./routes/productRoute";
import userRoute from "./routes/userRoute";
import expenseRoute from "./routes/expenseRoute";

dotenv.config();
const app = express();
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));
app.use(cors());

app.use(express.json());
app.use("/dashboard", dashboardRoutes);
app.use("/products", productRoute);
app.use("/users", userRoute);
app.use("/expense", expenseRoute);

const port = Number(process.env.PORT || 3001);

app.listen(port, "0.0.0.0", () => {
  console.log("server is listing !!!" + `${port}`);
});
