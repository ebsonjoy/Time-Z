const mongoose = require('mongoose');
const googleAuthUsersSchema = new mongoose.Schema({
    googleId:{
        type:String,
        required:true,
    },
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    }
});

const User = mongoose.model('googleAuthUsers',googleAuthUsersSchema);
module.exports = User;
