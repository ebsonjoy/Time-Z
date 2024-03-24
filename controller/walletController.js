
const User = require('../models/users');


const Wallet = require('../models/wallet')

const walletController = {
    userWallet: async (req, res) => {
        try {
            const userId = req.session.userID;
            const emailId = req.session.email
            const data = await User.findOne({emailId})
            let wallet = await Wallet.findOne({ userId });
            


            // If wallet is not found, create a new one with balance 0
            if (!wallet) {
                wallet = new Wallet({ userId, balance: 0 });
                await wallet.save();
            }

            res.render('users/userWallet', { wallet,data,user:req.session.user});
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    },

    addFunds: async (req, res) => {
        const userId = req.session.userID;
        const amount = req.body.amount;

        try {
            const wallet = await Wallet.findOneAndUpdate({ userId }, {
                $inc: { balance: amount },
                $push: { transactionHistory: { amount, type: 'deposit', description: "Amount added through online" } }
            }, { new: true });

            res.json({ success: true, balance: wallet.balance });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },

    withdrawFunds: async (req, res) => {
        const userId = req.session.userID;
        const amount = req.body.amount;

        try {
            const wallet = await Wallet.findOneAndUpdate({ userId }, {
                $inc: { balance: -amount },
                $push: { transactionHistory: { amount, type: 'withdraw', description: " Wallet withdrawal initiated through purchase"  } }
            }, { new: true });

            res.json({ success: true, balance: wallet.balance });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },

    clearHistory: async (req, res) => {
        const userId = req.session.userID;

        try {
            await Wallet.findOneAndUpdate({ userId }, { transactionHistory: [] });
            res.json({ success: true });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },

    checkWalletBalance: async (req, res) => {
        const userId = req.session.userID;

        try {
            let wallet = await Wallet.findOne({ userId });

            // If wallet is not found, create a new one with balance 0
            if (!wallet) {
                wallet = new Wallet({ userId, balance: 0 });
                await wallet.save();
            }

            res.json({ success: true, balance: wallet.balance });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },


}
module.exports = walletController;