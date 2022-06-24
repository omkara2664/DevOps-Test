const express = require("express");
const { usersController } = require("../../controllers");

const router = express.Router();

router.post("/", usersController.createUser);

module.exports = router;