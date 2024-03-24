const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    addressDetails:[
        {
            address: {
                type:String,
                required:true,
            },
            street: {
                type:String,
                required:true,
            },
            city: {
                type:String,
                required:true,
            },
            state:{
                type:String,
                required:true,
            },
            zip:{
                type:String,
                required:true,
            },
            country:{
                type:String,
                required:true,
            },
            created:{
                type:Date,
                default:Date.now,
            },
            

        }
    ]

})

module.exports = mongoose.model('address',userSchema);