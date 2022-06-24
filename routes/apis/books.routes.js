const express = require("express");

const { booksController } = require("../../controllers");
const { authMiddleware } =require("../../middlewares/auth.middleware");
const router = express.Router();

router.get("/", authMiddleware, booksController.getAllBooks); 
router.get("/:bookId", authMiddleware,booksController.getBookById);
router.post("/", authMiddleware, booksController.createBook);
router.put("/:bookId", authMiddleware, booksController.updateBook);
router.delete("/:bookId", authMiddleware, booksController.deleteBook);
router.get("/category/:category",authMiddleware, booksController.getByCategory);

module.exports = router;