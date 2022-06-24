module.exports.isValidString = (value) => typeof value === "string" && value.trim().length > 0;
module.exports.isValid = (value) => value !== null || typeof value !== 'undefined'
module.exports.isValidObject =(obj)=> Object.keys(obj).length>0;
module.exports.isValidEmail =(emil)=>/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(emil);
