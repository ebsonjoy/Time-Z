const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    brand: {
        type:String,
        required:true,
    },
    description: {
        type:String,
        required:true,
    },
    islisted:{
        type:Boolean,
        default:true,
    },
})

module.exports = mongoose.model('brand',userSchema);