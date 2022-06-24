const jwt = require("jsonwebtoken");

const { JWT_SECRET } = require("../utils");

const authMiddleware = async (req, res, next) => {
    // console.log('auth middleware books')
    // console.log(req.headers);    // This is an object authorization: bearer tokan  --> this is key value pair 
    const authorizationHeader = req.headers["authorization"];     // here use angular brakets because it bracket notaion to access object. [check notebook].
    //    console.log(authorizationHeader);
    if (!authorizationHeader) {
        return res.status(401).json({
            success: false,
            code: 401,
            message: 'Unauthorized access, missing authorization information',
            data: null,
            error: null,
        })
    }
    // checking for leagal token 
    const [bearer, token] = authorizationHeader.split(" ");
    //    console.log(bearer, token);
    if (!bearer || !token || (bearer && bearer !== 'Bearer')) {    // bearer not exist, token not exist, bearer exist but value is not equel to Bearer
        return res.status(401).json({
            success: false,
            code: 401,
            message: 'Unauthorized access, authorization information is not in a valid format',
            data: null,
            error: null,
        })
    }
    try {
        const decodedToken = await jwt.verify(token, JWT_SECRET)    // it return prommise as value 
        res.locals.userId = decodedToken.userId;   // all validation are done so now we need to userId and I'm taking form token.
        next();
        // console.log(decodedToken);
    } catch (error) {
        return res.status(401).json({
            success: false,
            code: 401,
            message: 'Unauthorized access '+ error.message,
            data: null,
            error: null,
        })
    }
}

module.exports.authMiddleware = authMiddleware;