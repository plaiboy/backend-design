const asyncHandler = require('express-async-handler')
const User = require('../models/userModel');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const Token = require('../models/tokenModel');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SCERET, {ExpiresIn: "1d"})
};


const registerUser = asyncHandler(async(req, res) => {
    const {name, email , password} = req.body;

    if (!name || !email || !password){
        res.status(400);
        throw new Error("please fill in all required fields")
    };
    if (password.length < 6) {
        res.status(400)('password must be upt 6 characters')
    };
    const userExists = await User.findOne({email});

    if(userExists){
        res.status(400)
        throw new Error('Email already used')
    };
    

    // create new user
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
    });

    // generate token
    const token =generateToken(user._id);

    // send http-only cookie
    res.cookie("token", token, {
        path: "/",
        httpOnly: true,
        expires: new Date(Date.now() + 1000 + 86400),
        sameSite: "none",  
        secure: true

    })

    if (user){
        const { _id, name, email,photo, phone, bio} = user
        res.status(201).json({
            _id,name, email,photo,phone, bio, token
        })
    } else {
        res.status(400)
        throw new Error('INVALID user')
    }
 });

//  login user
const loginUser = asyncHandler(async(req, res) =>{
   const {email, password} = req.body;
   if(!email || !password) {
    res.status(400);
    throw new Error("please enter email and password")
   }
    // check whether user exists
    const user = await User.findOne({email})

    if(!user){
        res.status(400)
        throw new Error("User not found, please sign up")
    }
    // check if password is correct
    const passwordIsCorrect = await bcrypt.compare(password, user.password);

    const token =generateToken(user._id);

    // send http-only cookie
    res.cookie("token", token, {
        path: "/",
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400),
        sameSite: "none",  
        secure: true

    });

    if(user && passwordIsCorrect) {
        const { _id, name, email, photo, phone, bio } = user;
        res.status(200).json({
            _id,
            name,
            email,
            photo,
            phone,
            bio,
            token
        });
    } else {
        res.status(400);
        throw new Error("Invaqlid email or password");
    }
   
});

const logoutUser = asyncHandler(async(req, res) => {
    res.cookie("token", "", {
        path: "/",
        httpOnly: true,
        expires: new Date(0),
        sameSite: "none",  
        secure: true
    });
    return res.status(200).json({ message: "Successfully loggedOut"})
})

// gget user data
const getUser = asyncHandler(async(req, res) =>{
     const user = await User.findById(req.user._id)
     
    if (user){
        const { _id, name, email,photo, phone, bio} = user
        res.status(200).json({
            _id,name, email,photo,phone, bio, token
        })
    } else {
        res.status(400)
        throw new Error('User Not Found')
    }


});

const loginStatus = asyncHandler(async (req, res) => {
    const token = req.cookies.token;
    if(!token) {
        return res.json(false)
    }
    const verified = jwt.verify(token, process.env.JWT_SCERET);
    if(verified) {
        return res.jason(true)
    }
     

})

const updateUser = asyncHandler(async(req, res) => {
    const user = await User.findById(req.user._id)

    if(user) {
        const{ name, email, photo, bio } = user;
        user.email = email;
        user.name = req.body.name || name;
        user.phone = req.body.phone || phone;
        user.bio = req.body.bio || bio;
        user.photo = req.body.photo || photo;

        const updateUser =await user.save()
        res.json({
            _id: updatedUser._id ,
            name:updatedUser.name,
            email:updateUser.email,
            photo:updateUser.photo,
            phone: updateUser.phone,
            bio:updateUser.bio,
        })

    } else {
        res.staatus(404)
        throw new Error('user not found')
    }
    
})


const changePassword = asyncHandler(async(req, res) =>{
    const user = await User.findById(req.user._id);
    
    const {oldPassword, password} = req.body

    if(!oldPassword || !password) {
        res.status(400);
        throw new Error('Please add old and new password')

    }

    // check if oldpassword matches the one in db 
    const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password)

    // save new password 
    if (user && passwordIsCorrect) {
        user.password = password 
        await user.save()
        res.status(200).send('password change is succesful')
    } else {
        res.status(400);
        throw new Error('Olld password is incorrect')
    }
});
const forgotPassword = asyncHandler(async(req, res) =>{
    const {email} =req.body
    const user = await User.findOne({email}) 

    if(!user) {
        res.status(404)
        throw new Error('User does not exist')
    }
    // delete token 
    let token = await Token.findOne({userId: user._id})
    if (token) {
        await token.deleteOne()
    }
// creae reset token
let resetToken = crypto.randomBytes(32).toString("hex") + user._id
console.log(resetToken);
// hash token before saving to db
const  hashedToken = crypto.createHash("sha254").update(resetToken).digest("hex")

// save token
await new Token({
    userId: user._id,
    token: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 30 * (60 * 1000)
}).save()

// construct reset url

const resteUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`

// reset email 
const message = `<h2> ${user.name} </h2>
<p>Please use url belw to reset your password </p>
<p> The rest link expires after 30 minutes </p>
<a href=${resetUrl} clicktracking= off> ${resetUrl}</a>
<p>Regards..</p>
<p> Maestro finest </p>
`
const subject = "passowrd Reset Request"
const send_to = user.email
const sent_from = process.env.EMAIL_USER

try {
    await sendEmail(subject, message, send_to, sent_from)
    res.status(200).json({success: true, message: "Reset email sent"})
} catch (error) {
    res.status(500)
    throw new Error("email not sent, please try again")
    
}
})   

const resetPassword  = asyncHandler(async(req, res) =>{
    const {passowrd} = req.body
    const {resetToken} = req.params

    const hashedToken = crypto.
    createHash("sha256")
    .update(resetToken)
    .digest("hex")

    const userToken = await Token.findOne({
        token: hashedToken,
        expiresAt: {$gt: Date.now()}
    })
    if (!userToken) {
        res.status(404)
        throw new Error("Invalid or expured token");
    }
    const user = await User.findOne({
    _id: userToken.userId
    })
    user.passowrd = passowrd
    await user.save(200).json({
        message: "password reset successful , please login"
    })
})
    
    
module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getUser , 
    loginStatus,
    updateUser,
    changePassword,
    forgotPassword,
    resetPassword
}