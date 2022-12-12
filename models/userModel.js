const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "please add a name"]
    },
    email: {
        type: String,
        required: [true, "please add an email"],
        unique: true,
        trim: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "please enter a valid email"
        ]

    },
    password: {
        type: String,
        required: [true, "please add a password"],
        minLength: [6, "not less than 6 charcters"],
        maxLength: 100
        
    },
    photo: {
        type: String,
        required: [true, "plaese add a photo"],
    
    },
    phone : {
        type: String,
        default: "=254"

    },
    bio:{
        type: String,
        maxLength:300
        }

}, {
    timeStamps:true
}) 

// password encryption
userSchema.pre("save", async function(next){
    if(!this.isModified("password")) {
        return next()
    }

const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);
this.password = hashedPassword;
next();

})
const User = mongoose.model("User", userSchema)
module.exporrts = User
