const express = require("express");
const router = express.Router();

const userRouter= require("./users.routes");
const booksRouter = require("./books.routes");
const authsRouter = require("./auth.routes");
const  registerRouter = require("./routes.register");

router.use("/books", booksRouter);
router.use("/auth", userRouter);
router.use("/auth/login", authsRouter);
router.use("/auth/register", registerRouter);

module.exports = router;