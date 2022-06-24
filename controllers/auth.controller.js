const bcrypt = require("bcrypt");
const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

const {
    isValid,
    isValidEmail,
    isValidObject,
    isValidString,
    JWT_SECRET,
} = require("../utils");
const login = async (req, res) => {
    const data = req.body;
    // console.log("I am in login");
    // return res.send('Ok authentication are working')
    if (!isValid(data) || (isValid(data) && !isValidObject(data))) {
        return res
            .status(400)
            .json({
                success: false,
                code: 400,
                error: null,
                message: "Invalid request body",
                resource: req.originalUrl
            });
    }

    if (!isValid(data.email) || (isValid(data.email) && !isValidEmail(data.email))) {
        return res
            .status(400)
            .json({
                success: false,
                code: 400,
                error: null,
                message: "Invalid Email Id",
                resource: req.originalUrl
            });
    }
    if (!isValid(data.password) || (isValid(data.password) && !isValidString(data.password))) {
        return res
            .status(400)
            .json({
                success: false,
                code: 400,
                error: null,
                message: "Invalid password",
                resource: req.originalUrl
            });
    }
    try {
        const user = await userModel.findOne({ email: data.email });
        // console.log(user);
        if (!user) {
            // console.log("Omkar");
            return res.status(404).json({
                success: false,
                code: 404,
                error: null,
                message: "Invalid email id, no user found.",
                resource: req.originalUrl,
            });
        }
        const isPasswordMatch = await bcrypt.compare(data.password, user.password)  // bcrypt.compare  => Its first parameter is the unhashed password entered manually or through a login form. The second parameter is a string or rather the stored password in the database but it is hashed password.
        if (!isPasswordMatch) {
            return res.status(404).json({
                success: false,
                code: 404,
                error: null,
                message: "Invalid password.",
                resource: req.originalUrl,
            });
        }
        // user.password="*****";
        const token = await jwt.sign({ userId: user._id }, JWT_SECRET);

        return res.status(200).json({
            success: true,
            code: 200,
            data:{ user, token },
            error: null,
            message: 'Login successfull',
            resource: req.originalUrl,

        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            code: 500,
            error: error,
            message: error,
            resource: req.originalUrl
        });
    }
};


module.exports = {
    login,
}