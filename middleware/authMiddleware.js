const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const jwt = require("jsonwebtoken");



const protect = asyncHandler(async(req, res, next) => {
    try {
        const token = req.cookies.token
        if(!token) {
            res.status(401)
            throw new Error("Not Authorized please log in")
        }

        // verify token
        const verified = jwt.verify(token, process.env.JWT._SECRET)

        const user = await user.findById(verified.id).select("password")

        if (!user) {
            res.status(401)
            throw new Error("user not found")
        }
        req.user = user
        next()
    } catch (error) {
        res.status(401)
        throw new Error("Not Authorized please log in")
    }

});

module.exports = protect;