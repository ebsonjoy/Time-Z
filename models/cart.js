const mongoose = require('mongoose')
const cartSchema = new mongoose.Schema({
    userId :{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        require:true,
    },
    items:[{
        product:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"products",
            require:true
        },
        price:{
            type:Number,
            default:0,
        },
        quantity:{
            type:Number,
            require:true
        },
       
    }
    ],
    totalPrice:{
        type:Number,
        default:0,
    },
})
module.exports = mongoose.model('cart',cartSchema);
 