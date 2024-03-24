const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    trackingId:{
        type:String,
        default:function(){
            return Math.floor(100000 + Math.random()* 900000).toString();
        },
        unique:true
    },
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
        orderStatus: {
            type: String,
            default: 'Pending'
        },   
    }],
    totalPrice:{
        type:Number,
        default:0,
    },
    billingDetails: {
        name: String,
        address: String,
        street: String,
        city: String,
        state: String,
        zip: String,
        country: String,
        phone: String,
        email: String
    },
    paymentStatus: {
        type: String,
        default: 'pending'
    },
    // orderStatus: {
    //     type: String,
    //     default: 'Pending'
    // },
    orderDate: {
        type: Date,
        default: Date.now,
    },
    paymentMethod: {
        type: String,
        default: 'Cash On Delivery'
    },
});



module.exports = mongoose.model('order', orderSchema);