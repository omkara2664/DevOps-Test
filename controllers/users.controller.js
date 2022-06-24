const bcrypt = require("bcrypt");


const {
  isValid,
  isValidString,
  isValidObject,
  isValidEmail,
  SALT,
} = require("../utils");

const UserModel = require("../models/user.model");

const getAllUsers = async (req, res) => {
  const response = {
    success: true,
    code: 200,
    message: "User list",
    error: null,
    data: null,
    resourse: req.originalUrl,
  };
  try {
    const users = await UserModel.find({});
    response.data = { users };
    return res.status(200).json(response);
  } catch (error) {
    response.error = error;
    response.message = error.message;
    response.code = error.code ? error.code : 500;
    return res.status(500).json(response);
  }
};

const getUserById = async (req, res) => {
  const { authId } = req.params;
  console.log(authId);
  const response = {
    success: true,
    code: 200,
    message: "User list",
    error: null,
    data: null,
    resourse: req.originalUrl,
  };
  try {
    const user = await UserModel.findOne({ _id: authId });
    console.log(user);
    if (!user) throw new Error("User does not exist");
    response.data = { user };
    return res.status(200).json(response);
  } catch (error) {
    response.error = error;
    response.message = error.message;
    response.code = error.code ? error.code : 500;
    return res.status(500).json(response);
  }
};

const createUser = async (req, res) => {
  const user = req.body;
  // console.log(user);
  const response = {
    success: true,
    code: 200,
    message: "User Created Succesfully",
    error: null,
    data: null,
    resourse: req.originalUrl,
  };
  if (!isValid(user) && !isValidObject(user)) {
    response.success = false;
    response.code = 400;
    response.message = "Invalid request data";
    response.error = "Invalid requset data";
    return res.status(400).json(response);
  }

  if (!isValid(user.title) || (isValid(user.title) && !isValidString(user.title))) {
    response.success = false;
    response.code = 400;
    response.message = "Invalid request data.title is reqired";
    response.error = "Invalid request data.title is reqired";
    return res.status(400).json(response);
  }
  if (!isValid(user.name) || (isValid(user.name) && !isValidString(user.name))) {
    response.success = false;
    response.code = 400;
    response.message = "Invalid request data.Name is reqired";
    response.error = "Invalid request data.Name is reqired";
    return res.status(400).json(response);
  }

  if (!isValid(user.email) || (isValid(user.email) && !isValidEmail(user.email))) {
    response.success = false;
    response.code = 400;
    response.message = "Invalid request data.Email is reqired";
    response.error = "Invalid request data.Email is reqired";
    return res.status(400).json(response);
  }
  if (!isValid(user.password) || (!isValid(user.password) && !isValidString(user.password))) {
    response.success = false;
    response.code = 400;
    response.message = "Invalid request data.Password is reqired";
    response.error = "Invalid request data. Password is reqired";
    return res.status(400).json(response);
  }
  const arrTitle = ['Mr', 'Miss'];
  try {
    const isTitleExist = arrTitle.indexOf(user.title);
    // console.log(isTitleExist);
    if (isTitleExist === -1) {
      // console.log(" I'm here");
      response.success = false;
      response.code = 400;
      response.message = `Enter valid title, '${user.title}' is not valid.`;
      response.error = "Invalid request title";
      return res.status(400).json(response);
    }
  } catch (error) {
    response.success = false;
    response.code = 400;
    response.message = "Invalid request title";
    response.error = "Invalid request title";
    return res.status(400).json(response);
  }
  try {
    const isEmailExist = await UserModel.findOne({
      email: user.email,
    });
    if (!isEmailExist)
      throw new Error(`This email ${user.email} id is already registered.`)
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
  // const saltRounds = 16;  // salt is random bit added in eatch password instance before its hashing 
  // const salt = await bcrypt.genSalt(saltRounds);
  //  instance of line 91,92 we provide the salt from const file generated once and use many times forn utils
  const hashPassword = await bcrypt.hash(user.password.trim(), SALT);
  const cleanedUserData = {
    title: user.title.trim(),
    name: user.name.trim(),
    email: user.email.trim(),
    password: hashPassword,
  };
  if (user.address) {
    cleanedUserData.address = user.address;
  }
  console.log(cleanedUserData);
  try {
    const newUser = new UserModel(cleanedUserData);
    await newUser.save();
    response.data = { user: newUser };
    return res.status(201).json(response);
  } catch (error) {
    response.error = error;
    response.code = error.code ? error.code : 500;
    response.message = "Problem here";
    return res.status(500).json(response);
  }
};

const updateUser = async (req, res) => {
  const { authId } = req.params;
  const userData = req.body;
  if (!isValid(userData) || !isValidObject(userData)) {   // if user is empty(undefined) or null 
    return res.status(400).json({
      success: false,
      code: 404,
      message: "Empty request body, nothing update",
      error: null,
      data: null,
      resourse: req.originalUrl
    })
  }
  // to avoid fake update call, means already exited emil in db(database) with users but if same user updated same exsited email id no problem, and diff user try to update his same email which is already exist so we need to check email aslo at time of update, here database it varify but we don't relia on database.
  if (isValid(userData.email) && isValidEmail(userData.email)) {           // if('is not undefined or null' && 'is valid email or not(present in databaese)')
    try {
      const isEmailExist = await UserModel.findOne({
        email: userData.email,
        _id: { $ne: authId },      // it look in all user('UserModel.findOne'), it send to validation email pattern.
      });
      if (isEmailExist) throw new Error(`This email ${userData.email} id is already registerd`)  // if email exit it throw error and it catch by catch block if not exist then it ignore catch block.
    } catch (error) {
      return res.status(404).json({
        success: false,
        code: 404,
        message: error.message,
        error: error,
        data: null,
        resourse: req.originalUrl
      });
    }

  }
  try {
    const isUserExist = await UserModel.findById(authId);
    if (!isUserExist)
      throw new Error("Invalid user id.User does not exist with this id.");

    if (userData.password) {

      userData.password = await bcrypt.hash(userData.password, SALT);
    }
    const updatedUser = await UserModel.findByIdAndUpdate(authId, { $set: userData }, { new: true });  // findByIdAndUpdate is take three parameter('where to update', 'updated data', 'if you want to show updated data( make true)')
    return res.status(200).json({
      success: true,
      code: 200,
      message: "User updated succesfully",
      error: null,
      data: { user: updatedUser },
      resourse: req.originalUrl
    })
  }
  catch (error) {
    // console.log("I'm here");
    return res.status(404).json({
      success: false,
      code: 404,
      message: error.message,
      error: error,
      data: null,
      resourse: req.originalUrl
    })
  }
}

const deleteUser = async (req, res) => {
  const { authId } = req.params;

  try {
    const isUserExist = await UserModel.findById(authId);
    // console.log("I'm here");
    if (!isUserExist) throw new Error("Invalid user id. User dose not exist, with this id");
    // if(!isUserExist) return res.status(400).send("Invalid user id. User dose not exist, with this id");
    isUserExist.delete();
    return res.status(200).json({
      success: true,
      code: 200,
      message: 'User deleted successfully',
      error: null,
      data: { user: isUserExist },
      resourse: req.originalUrl,
    });
  } catch (error) {
    // console.log("I'm here");
    return res.status(404).json({
      success: false,
      code: 404,
      message: error.message,
      error: error,
      data: null,
      resourse: req.originalUrl
    })
  }
}


module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
