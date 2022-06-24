const express = require("express");
const app = express();
const path = require("path");
const logger = require("morgan");
const mongoose = require("mongoose");

const PORT = 4000;

const apiRouter = require("./routes/apis");

app.use(logger("dev"));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost:27017/firstProject")
.then(res => console.log(`Mongoose connected to db successfully ${res}`))
.catch(err => console.log(`Mongoose connection to db failed ${err.message}`));

app.use("/api",apiRouter);

console.log("let's start")

app.listen(PORT, () => {
    console.log(`Server is connected.at adreess ${PORT}`);
})