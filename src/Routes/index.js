import { Router } from "express";
import userRouter from "./user.route.js";
import studentRouter from "./student.route.js";
import bookRouter from "./book.route.js";
import bookTransactionRouter from "./bookTransaction.route.js";
import fineBillingRouter from "./billing.route.js";
import { AuthenticateUser } from "../Middlewares/Authorization.middleware.js";

const router = Router();

router.use("/", userRouter);
router.use("/students", studentRouter);
router.use("/books", AuthenticateUser, bookRouter);
router.use("/books/transactions", AuthenticateUser, bookTransactionRouter);
router.use("/billings/fine", AuthenticateUser, fineBillingRouter);

export default router;
