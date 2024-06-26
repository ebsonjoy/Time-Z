
const Order = require('../models/order');
const products = require('../models/products')
const Wallet = require('../models/wallet')

const adminOrderController = {

     // Order
     adminOrderProfile: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = 6;
            const skip = (page - 1) * limit;
            
            let query = {}; 
    
            
            if (req.query.orderStatus && req.query.orderStatus !== 'Status') {
                query.orderStatus = req.query.orderStatus; 
            }
    
            const orders = await Order.find(query).sort({ orderDate: -1 }).skip(skip).limit(limit);
            const totalOrders = await Order.countDocuments(query);
            const totalPages = Math.ceil(totalOrders / limit);
    
            res.render('admin/adminOrderProfile', { 
                orders: orders,
                currentPage: page,
                totalPages: totalPages 
            });
        } catch (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
        }
    },

    orderDetails: async (req, res) => {
        try {
            const id = req.params.id;
            
    
            
            const order = await Order.find({}).populate({
                path: "items.product",
                message: "product"
            });
            if (!order) {
                return res.status(404).send("Order not found");
            }
    
            
            const orderItem = order.find(item => item._id.toString() === id);
    
            if (!orderItem) {
                return res.status(404).send("Order item not found");
            }
    
           
            const product = orderItem.items.find(item => item._id.toString() === id);
            
            res.render('admin/orderDetails', { 
                user: req.session.user, 
                orderItem: orderItem, 
                order: order,
                product: product 
            });
        } catch (err) {
            console.error(err);
            res.status(500).send("Internal Server Error");
        }
    },


    updateOrderStatus: async (req, res) => {
        try {
            const { productId, orderId } = req.body; 
    
            const order = await Order.findOne({ _id: orderId });
            const userId = order.userId;

            let amount;
            let finalAmount;
            let nonCancelledItemCount = 0;
    
            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }
    
            const returnProduct = order.items.find(product => product._id.toString() === productId);
            const productOne = returnProduct.product;
    
            const newStatus = req.body.newStatus;
    
            if (newStatus === "Cancelled") {
                await products.findByIdAndUpdate(productOne, { $inc: { stock: returnProduct.quantity } });
                for (const item of order.items) {
                    if (item.orderStatus !== 'Cancelled') {
                        nonCancelledItemCount++;
                    }
                    if (nonCancelledItemCount > 1) {
                        break;
                    }
                }

                if (nonCancelledItemCount === 1) {
                    // console.log("Only one item not cancelled");
                    amount = returnProduct.price * returnProduct.quantity+60
                } else {
                   
                    amount = returnProduct.price * returnProduct.quantity
                }
                if(order.couponDiscount>0){
                    divideCouponAmount = order.couponDiscount / order.items.length
                    finalAmount = amount-divideCouponAmount;
                }else{
                    finalAmount = amount;
                }

                if(order.paymentStatus === 'Paid'){
                   
                            const wallet = await Wallet.findOneAndUpdate({ userId: userId }, {
                                $inc: { balance: finalAmount },
                                $push: { transactionHistory: { amount:finalAmount, type: 'deposit', description: "Amount refunded through cancellation of one product" } }
                            }, { new: true });
                }

            }
    
            const statusProduct = order.items.find(product => product._id.toString() === productId);
            statusProduct.orderStatus = newStatus;
    
            await order.save(); 
            return res.status(200).json({ message: 'Order status updated successfully', statusProduct });
        } catch (error) {
            console.error('Error updating order status:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    


}

module.exports = adminOrderController;