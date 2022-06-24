const bcrypt = require("bcrypt");

module.exports.SALT = bcrypt.genSaltSync(10);
module.exports.JWT_SECRET = "some-very-secure-random-string";