const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    balance: {
        type: Number,
        required: true
    },
    transactionHistory: [{
        amount: {
            type: Number,
            required: true
        },
        type: {
            type: String,
            enum: ['deposit', 'withdraw'],
            required: true
        },
        description:{
            type:String,
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
});

module.exports = mongoose.model('Wallet', walletSchema);
