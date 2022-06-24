const { type } = require("express/lib/response");
const mongoose = require("mongoose");

const booksSchema = new mongoose.Schema({
    name: { type: String, require: true },
    // autourname: { type: String, require: true },
    userId: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
    isbn: { type: String, require: true },
    publisheddate: { type: Date, reauire: true },
    category: { type: String, require: true }, 
    subcategory: [String],
    createdAt: { type: Date, defalut: new Date() },
    modifiedAt: { type: Date, defalut: new Date() },
    isDeleted: { type: Boolean, defalut: false },
    deletedAt: { type: Date, defalut: null },
},
    { timestamps: true }
);

module.exports = mongoose.model("Books", booksSchema);