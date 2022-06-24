const fs = require("fs");

const {
  isValid,
  isValidString,
  isValidObject,
  isValidEmail,
} = require("../utils");


const booksModel = require("../models/books.model");
const { lookup } = require("dns");
const { append } = require("express/lib/response");
const { send } = require("process");
// const { isValid } = require("../utils");

const getAllBooks = async (req, res) => {
  // console.log("I am here");
  // return res.send("All books");
  const response = {
    success: true,
    code: 200,
    message: "Book List",
    error: null,
    data: null,
    resourse: req.originalUrl,
  };
  try {
    const books = await booksModel.find({  // find function find all books if deleted = false.
      isDeleted: false,    // I dont want to deleted user so I want to existed todo 
      userId: res.locals.userId,
    });
    response.data = { books };
    return res.status(200).json(response);
  } catch (error) {
    response.error = error;
    response.message = error.message;
    response.code = error.code ? error.code : 500;
    return res.status(500).json(response);
  };
};

const getBookById = async (req, res) => {

  const { bookId } = req.params;
  console.log({ bookId });
  const response = {
    success: true,
    code: 200,
    message: "Books details",
    error: null, data: null, resource: req.originalUrl,
  };
  try {
    const book = await booksModel.findOne({ _id: bookId });
    if (!book) throw new Error("book does not exist");
    response.data = { book };
    return res.status(200).json(response);
  } catch (error) {
    response.error = error;
    response.message = error.message;
    response.code = error.code ? error.code : 500;
    return res.status(500).json(response);
  }
};



const createBook = async (req, res) => {
  // return res.send("new book created.")
  const body1 = req.body
  console.log(body1);
  const response = {
    success: true,
    code: 200,
    message: "Book Created Succesfully",
    error: null,
    data: null,
    resourse: req.originalUrl,
  }
  if (!isValid(body1) && !isValidObject(body1)) {
    response.success = false;
    response.code = 400;
    response.message = "Invalid request data";
    response.error = "Invalid requset data";
    return res.status(400).json(response);
  }
  try {
    const isBookNameExist = await booksModel.findOne({ isbn: body1.isbn });
    if (isBookNameExist)
      throw new Error(`${body1.isbn} is isbn already register`)
  } catch (error) {
    return res.status(400).json({
      success: false,
      code: 400,
      message: error.message,
      error: error,
      data: null,
      resourse: req.originalUrl,
    })
  }
  if (!isValid(body1.name) || (isValid(body1.name) && !isValidString(body1.name))) {
    response.success = false;
    response.code = 400;
    response.message = "Invalid request data.Name is reqired";
    response.error = "Invalid request data.Name is reqired";
    return res.status(400).json(response);
  }


  // const bookData = {
  //   name: body1.name.trim(),
  //   // autourname: body1.autourname.trim(),
  //   isbn: body1.isbn,
  //   publisheddate: body1.publisheddate,
  //   subcategory: body1.subcategory,
  // }
  try {
    const newBook = await booksModel.create({
      name: body1.name.trim(),
      userId: res.locals.userId,
      isbn: body1.isbn,
      category: body1.category,
      subcategory: body1.subcategory,
      publisheddate: body1.publisheddate,
      isDeleted: false,
    });
    response.data = { books: newBook };
    return res.status(201).json(response);
  } catch (error) {
    response.error = error;
    response.code = error.code ? error.code : 500;
    return res.status(500).json(response);
  }
};


const updateBook = async (req, res) => {
  const { bookId } = req.params;
  const bookData = req.body;
  if (!(bookData) || (isValid(bookData) && !isValidObject(bookData))) {
    return res.status(400).json({
      success: false,
      code: 400,
      message: "Empty request body, nothing to update.",
      error: null,
      data: null,
      resource: req.originalUrl,
    });
  }
  if (!isValid(bookData.name) || isValid(bookData.name) && !isValidString(bookData.name)) {
    return res.status(400).json({
      success: false,
      code: 400,
      message: "Empty Book name, nothing to update.",
      error: null,
      data: null,
      resource: req.originalUrl,
    });
  }
  try {
    const isBookExist = await booksModel.findOne({ _id: bookId, isDeleted: false });
    if (!isBookExist)
      return res.status(400).json({
        success: false,
        code: 404,
        message: "Invalid request Book item not exist.",
        error: null,
        data: null,
        resource: req.originalUrl,
      });
    if(isBookExist.userId.toString()!==res.locals.userId){
      return res.status(403).json({
        success: false,
        code: 403,
        message: "Unauthorise user, user not owner",
        data: null,
        error: null,
        resource: req.originalUrl,
      })
    }
    const updatedBook = await booksModel.findByIdAndUpdate(
      bookId,
      { $set: bookData },
      { new: true }   //// findByIdAndUpdate is take three parameter('where to update', 'updated data', 'if you want to show updated data( make true)')
    );
    await updatedBook.save();
    return res.status(200).json({
      success: true,
      code: 200,
      message: "Book updated successfully",
      error: null,
      data: { book: updatedBook },
      resource: req.originalUrl,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      code: 404,
      message: error.message,
      error: error,
      data: null,
      resource: req.originalUrl,
    });
  }
};

const deleteBook = async (req, res) => {
  const { bookId } = req.params;  // OR const bookId = req.params.bookId
  console.log('UserId from authentication info is ' + res.locals.userId);

  try {
    // const isBookExist = await booksModel.findByIdAndDelete(bookId);    // This is hard delete.
    // const isBookExist = await booksModel.findByIdAndUpdate(bookId,{ isDeleted: true, deletedAt:new Date().toISOString()}, {new:true});
    const isBookExist = await booksModel.findOne({ _id: bookId, isDeleted: false });

    if (!isBookExist)
      throw new Error("Invalid book id. Book does not exist with this id.");
    if (isBookExist.userId.toString() !== res.locals.userId) {
      return res.status(403).json({
        success: false,
        code: 403,
        message: "Unauthorise user, user not owner",
        data: null,
        error: null,
        resource: req.originalUrl,
      });
    }
    isBookExist.isDeleted = true,
    isBookExist.deletedAt = new Date().toISOString();
    await isBookExist.save();
    // this is soft delete.

    //isTodoExist.delete();
    return res.status(200).json({
      success: true,
      code: 200,
      message: "Book deleted successfully",
      error: null,
      data: { book: isBookExist },
      resource: req.originalUrl,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      code: 404,
      message: error.message,
      error: error,
      data: null,
      resource: req.originalUrl,
    });
  }
};

const getByCategory =async  (req, res)=>{
  // const {category} = req.params
  const  category = req.params.category; 
  console.log(category);
  const isCategoryExist = await booksModel.find({userId:res.locals.userId, category:category, isDeleted:false})
  // console.log("I am here"+ isCategoryExist);
  if(!isCategoryExist){
    return res.status(403).json({
      success: false,
      code: 403,
      message: "Category is not exist",
      data: null,
      error: null,
      resource: req.originalUrl,
    });
  }
  // if( isCategoryExist.userId.toString()!== res.locals.userId){
  //   return res.status(403).json({
  //     success: false,
  //     code: 403,
  //     message: "You are not owner !",
  //     data: null,
  //     error: null,
  //     resource: req.originalUrl,
  //   });
  // }
  
  return res.status(200).json({
    success:true,
    code:200, 
    message:"Book list based on category for authenticate owner.",
    data: { isCategoryExist },
    error:null,
    resource:req.originalUrl,
  })
 
}
module.exports = {
  getAllBooks,
  createBook,
  getBookById,
  updateBook,
  deleteBook,
  getByCategory,
}