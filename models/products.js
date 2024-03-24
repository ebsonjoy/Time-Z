const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    product: {
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    brand:{
        type:String,
        required:true,
    },
    bandColor:{
        type:String,
        required:true,
    },
    bandMeterial:{
        type:String,
        required:true,
    },
    warrantyType:{
        type:String,
        required:true,
    },
    warrantyDescription:{
        type:String,
        required:true,
    },
    Country:{
        type:String,
        required:true,
    },
    waterResi:{
        type:String,
        required:true,
    },
    PackingDelivery:{
        type:String,
        required:true,
    },
    stock:{
        type:Number,
        require:true,
    },
    price: {
        type:Number,
        required:true,
    },
    oldPrice:{
        type:Number,
        required:true,
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"category",
        required:true,
    },
    images:{
        type:Array,
    },
    ispublished:{
        type:Boolean,
        default:true,
    },
    


})

module.exports = mongoose.model('products',userSchema);