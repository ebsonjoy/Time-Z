const mongoose = require('mongoose')
const whishlistSchema = new mongoose.Schema({
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
    }]
})
module.exports = mongoose.model('whishlist',whishlistSchema);
 