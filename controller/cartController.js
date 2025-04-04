
const User = require('../models/users');
require("dotenv").config();
const products = require('../models/products');
const Address = require('../models/address');
const Cart = require('../models/cart');
const Order = require('../models/order');
const Coupon = require('../models/coupon');



const cartController = {
    shopCart: async (req, res) => {
       
        const userId = req.session.userID;
       
        const userCart = await Cart.findOne({userId:userId}).populate('items.product')
        res.render("users/shopCart", { cart: userCart, user: req.session.user });

   
},
addTocart:async(req,res)=>{
    try{
        const userId= req.session.userID;
        const productId = req.params.id;
        const quantity = 1;
        const product = await products.findById(productId);
        if(!product){
            return res.status(404).json({message:"product not found"})
        }
        let userCart = await Cart.findOne({userId});
        if(!userCart){
            const newCart = new Cart({
                userId,
                items:[{
                    product:productId,
                    price:product.price,
                    quantity:quantity,
                }],
                totalPrice :product.price * quantity
            });
            userCart = await newCart.save();
        }else{
            const existingItem = userCart.items.find(item=>item.product.toString()===productId.toString());
            if(existingItem){
                existingItem.quantity += quantity;
            }else{
                userCart.items.push({product:productId,price:product.price,quantity:quantity});
            }
            userCart.totalPrice = userCart.items.reduce((total,item)=>total+(item.price* item.quantity),0)
            await userCart.save();
        }
        res.redirect('/')
    }catch(err){
        console.error("Error adding item to cart :",err);
        res.status(500).json({message:"internal Sever Error"})
    }
},
checkOut: async(req,res)=>{
    const itemId = req.query.itemId; 
    const userId = req.session.userID;

    if(req.session.blockCheckout){
        req.session.blockCheckout = false;
        res.redirect('/')
    }else{

    if (itemId) {
        const order = await Order.findById(itemId).populate({
            path: "items.product",
            message: "product"
        });
        order.totalPrice -=60;
        const address = await Address.findOne({ userId: userId });
        const data = await User.findById(userId);
        const cartTotalPrice = order.totalPrice;
        
        const validCoupons = await Coupon.find({
            expiryDate: { $gt: new Date() }, 
            minimumAmount: { $lt: cartTotalPrice }, 
            userID: { $ne: userId },
            isListed: true 
        });
    
        res.render("users/checkOut", {
            userId: userId,
            data: data,
            cart: order, 
            user: req.session.user,
            address: address,
            coupons: validCoupons,
            razorpayKey: process.env.RAZORPAY_KEY,
        });


    } else {
        const data = await User.findById(userId)
    const address = await Address.findOne({ userId: userId });
   
    

    const userCart = await Cart.findOne({userId:userId}).populate({
        path:"items.product",
        message:"product"
    })
    
    
    
    const userCarts = await Cart.findOne({ userId });
    
    const cartTotalPrice = userCarts.totalPrice

    const validCoupons = await Coupon.find({
        expiryDate: { $gt: new Date() }, 
         minimumAmount: { $lt: cartTotalPrice }, 
        userID: { $ne: userId },
        isListed: true 
    });

    res.render("users/checkOut",{
        userId:userId,
        data:data,
         cart:userCart,
         user:req.session.user,
         address:address,
         coupons:validCoupons,
         razorpayKey: process.env.RAZORPAY_KEY,
        })
    } 
}  
},
updateQuantity : async (req, res) => {
    try {
        const userId = req.session.userID;
        const productId = req.body.productId;
        const action = req.body.action;

        let userCart = await Cart.findOne({ userId }).populate('items.product');

        if (!userCart) {
            return res.status(404).json({ success: false, message: "User cart not found" });
        }

        const item = userCart.items.find(item => item.product._id.toString() === productId);

        if (!item) {
            return res.status(404).json({ success: false, message: "Product not found in the cart" });
        }

        const product = await products.findById(productId);
        const maxQuantity = product.stock;

        if (action === "increment") {
            if (item.quantity < maxQuantity) {
                item.quantity += 1;
                item.price = item.product.price
                userCart.totalPrice = userCart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

                await userCart.save();
            } else {
                return res.json({ success: false, message: "Maximum quantity reached for this product" });
            }
        } else if (action === "decrement" && item.quantity > 1) {
            item.quantity -= 1;
            item.price = item.product.price
            userCart.totalPrice = userCart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
            await userCart.save();
        } else {
            return res.json({ success: false, message: "Invalid action or quantity" });
        }

        await userCart.save();

        return res.json({
            success: true,
            item,
            totalPrice: userCart.items.reduce((total, item) => total + item.product.price * item.quantity, 0)
        });
    } catch (error) {
        console.error("Error updating cart:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
},
deleteCartProduct: async (req, res) => {
    const id = req.params.id;

    try {
        
        const cartDocument = await Cart.findOne({ 'items._id': id });

        if (!cartDocument) {
            res.redirect('/shopCart');
            return;
        }

        
        const itemToDelete = cartDocument.items.find(item => item._id.toString() === id);
        const priceToDelete = itemToDelete.price * itemToDelete.quantity;

        
        await Cart.updateOne(
            { _id: cartDocument._id },
            { $pull: { items: { _id: id } } }
        );

       
        cartDocument.totalPrice -= priceToDelete;
        await cartDocument.save();

        res.redirect('/shopCart');
    } catch (err) {
        console.error(err);
        res.json({ message: err.message });
    }
},
orderPost:async (req, res) => {
    const orderId = req.body.orderId;
    
    try {
        const findOrder = await Order.findOne({ _id: orderId });

        if (findOrder) {
            if( req.body.paymentMethod === "COD"){
            const updatedOrder = await Order.findByIdAndUpdate(orderId, { paymentStatus: "Pending" }, { new: true });
            }else{
            const updatedOrder = await Order.findByIdAndUpdate(orderId, { paymentStatus: "Paid" }, { new: true });

            }

            
        } else {
            const userId = req.session.userID;
            const { addressId, totalPrice } = req.body;

            if (!addressId) {
                return res.status(400).json({ alert: 'Please select an address' });
            }

            let userOrder = await Order.findOne({ userId });

            if (!userOrder) {
                userOrder = new Order({ userId, addressId, totalPrice });
            } else {
                userOrder.totalPrice = totalPrice;
            }

            const userCart = await Cart.findOne({ userId }).populate('items.product');
            const user = await User.findById(userId);
            const address = await Address.findOne({ userId });
            const selectedAddress = address.addressDetails.find(a => addressId.includes(a._id.toString()));

            if (selectedAddress) {
                const orderItems = userCart.items.map(item => ({
                    product: item.product._id,
                    price: item.product.price,
                    quantity: item.quantity
                }));

                const order = new Order({
                    userId,
                    totalPrice,
                    billingDetails: {
                        name: user.name,
                        email: user.email,
                        phone: user.phone,
                        address: selectedAddress.address,
                        street: selectedAddress.street,
                        city: selectedAddress.city,
                        state: selectedAddress.state,
                        zip: selectedAddress.zip,
                        country: selectedAddress.country
                    },
                    items: orderItems,
                    paymentStatus: req.body.paymentStatus,
                    paymentMethod: req.body.paymentMethod,
                    couponDiscount: req.body.couponDiscount,
                });

                await order.save();

                await Cart.findOneAndUpdate(
                    { userId: user._id },
                    { $set: { items: [], totalPrice: 0 } }
                );

                for (const item of order.items) {
                    await products.findByIdAndUpdate(
                        item.product,
                        { $inc: { stock: -item.quantity } },
                        { new: true }
                    );
                }

                if (req.body.couponDiscount > 0) {
                    
                    const coupon = await Coupon.findOne({ coupon_code: req.body.couponCode });
        
                    if (coupon) {
                        
                        coupon.userID.push(req.session.userID);
                        await coupon.save();
                    }
                }

            } else {
                return res.status(400).json({ error: 'Please select a valid address' });
            }
        }
        if(req.body.paymentStatus == "Failed"){
            req.session.blockCheckout = true;
            res.redirect('/ordersProfile');
        }else{
            req.session.blockCheckout = true;
            res.redirect('/orderConform');
        }
       
        

    } catch (err) {
        console.error("Error placing order:", err);
        res.status(500).json({ error: 'Internal server error' });
    }
},
orderConform:(req,res)=>{
    res.render('users/orderConform',{user:req.session.user})
},

checkCoupon :async (req, res) => {
    try {
        const { couponCode } = req.body;
        const coupon = await Coupon.findOne({ coupon_code: couponCode });
        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }
        const userId = req.session.userID; 
        const userCart = await Cart.findOne({ userId });
        const totalAmount = userCart.totalPrice;
        if (!userCart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const amountDividedBYPercentage = Math.ceil(totalAmount*coupon.percentage/100)
    if(amountDividedBYPercentage > coupon.maximumAmount ){
        const amountToPay = (totalAmount - coupon.maximumAmount) + 60
        res.json({totalAmount:amountToPay,couponId:couponCode,discountAmount:coupon.maximumAmount,couponCode:coupon.coupon_code})   
    }else{
        const amountToPay = (totalAmount-amountDividedBYPercentage) +60
        res.json({totalAmount:amountToPay,couponId:couponCode,discountAmount:amountDividedBYPercentage,couponCode:couponCode.coupon_code})
    }

    } catch (error) {
        console.error('Error applying coupon:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
},






}

module.exports = cartController;