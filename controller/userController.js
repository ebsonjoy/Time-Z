const bcrypt = require('bcrypt');
const saltPassword = 10;
const User = require('../models/users');
const nodemailer = require('nodemailer');
require("dotenv").config();
const {genaratorOpt} = require("../optgenarator");
const products = require('../models/products');
const Order = require('../models/order');
const Category = require('../models/category')
const Wallet = require('../models/wallet')
const fs = require('fs');
const ejs = require("ejs");
const pdf = require("html-pdf");
const path = require('path')




const userController = {
// signUp Root
    userSignup:(req,res)=>{
        res.render("users/signup",)
    },

// Login Root
    userLoginPage:(req,res)=>{
        if(!req.session.user){
            res.render("users/userLogin")
        }else{
            res.redirect('/')
        }
        
    },

    userSignupLogin: async (req,res)=>{
        if(!req.session.user){

        const existingEmail = await User.findOne({email: req.body.email});
        const existingName = await User.findOne({name:req.body.name});
        const existingPhone = await User.findOne({phone:req.body.phone});
        if(existingEmail){
             res.render('users/signup',{title:"SignUP", alert:"Email already exists, Please try with another one",});
        }
        else if (existingPhone) {
            res.render('users/signup',{title:"SignUP", alert:"Phone Number already exists, Please try with another one",});
            
        }
        else if(existingName){
            res.render('users/signup', { title: "SignUP", alert: "Name already exists, Please try with another one" });
        }else{
            const hashedPassword = await bcrypt.hash(req.body.password, saltPassword);
            // break
            let config = {
                service : "gmail",
                auth:{
                    user:process.env.EMAIL,
                    pass:process.env.PASSWORD,
                }
            }
            let transporter = nodemailer.createTransport(config)
            let otp = genaratorOpt();

            const info=  await transporter.sendMail({
                from:process.env.EMAIL,
                to:req.body.email,
                subject:"OTP varification",
                html:`<b> Your OTP is ${otp}<b>`,
            })
            const user = new User({
                name:req.body.name,
                email:req.body.email,
                phone:req.body.phone,
                password : hashedPassword,
                OTP:otp,
            });
            try{
                await user.save();
                res.render('users/optverification');
            } catch(er){
                
               res.json({message:er.message, type:"danger"}); 
            }
        }
    }else{
        res.redirect('/')
    }
     
    },

    userLoginPost:async (req,res)=>{
        try{
            const data = await User.findOne({email: req.body.email})

            if(data){
                if(data.isblocked){
                    const passwordMatch = await bcrypt.compare(req.body.password,data.password);
                    if(passwordMatch){
                        req.session.user = req.body.email;
                        req.session.userID= data._id;
                        
                        res.redirect('/')
                    }else{
                        res.render('users/userLogin',{title:"Login",alert:"Entered Email or password is incorrect",});
                    }
                }else{
                res.render('users/signup',{title:"Signup",alert:"Your account has been blocked",});

                }
            }else{
                res.render('users/signup',{title:"Signup",alert:"Account Doesn't Exist, Please signup",});
            }
        }catch (error){
            console.error(error);
            res.status(500).send("Internal Server Error");
        }
    },
    userHomePage:async (req, res) => {
        try {
          const prod = await products.aggregate([
            {
              $lookup: {
                from: 'categories',
                localField: 'category',
                foreignField: '_id',
                as: 'category'
              }
            },
            {
              $match: {
                $and: [
                  { 'category.islisted': true },
                  { ispublished: true }
                ]
              }
            }
          ]);
          req.session.blockCheckout = false;
          res.render('users/Homepage', { prod: prod, user: req.session.user });
        } catch (error) {
          console.error('Error fetching data:', error);
          // Handle error appropriately
          res.status(500).send('Internal Server Error');
        }
      },

    userOptPost:async(req,res)=>{
      const OTP = await User.findOne({OTP:req.body.otp});
      if(OTP){
        res.render("users/userLogin")
      }else{
        res.render('users/optverification')
      }
    },
    resendOpt :async (req, res) => {
        try {
            const user = await User.findOne({ user: req.body.email });
            if (!user) {
                return res.json({ message: "User not found", type: "danger" });
            }
    
            const newotp = genaratorOpt();
    
            let config = {
                service: "gmail",
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.PASSWORD,
                }
            };
            let transporter = nodemailer.createTransport(config);
    
            await transporter.sendMail({
                from: process.env.EMAIL,
                to: user.email,
                subject: "OTP verification",
                html: `<b> Your OTP is ${newotp}<b>`,
            });
    
            
            await User.findOneAndUpdate( { OTP: newotp });
           
        } catch (err) {
            res.json({ message: err.message, type: "danger" });
        }
    },
    userShop: async (req, res) => {
        try {
            const category = req.params.category || undefined; 
            const sort = req.query.sort; 
            const page = req.params.page || 1; 
            const limit = 6; 
            const skip = (page - 1) * limit; 
    
            let prod;
            let cate;
    
            let query = { ispublished: true };
    
            let sortOptions = {};
    
            if (sort === 'lowToHigh') {
                sortOptions.price = 1;
            } else if (sort === 'highToLow') {
                sortOptions.price = -1;
            }
    
            
            cate = await Category.find({ islisted: true });
    
           
            const listedCategoryIds = cate.map(category => category._id);
    
            
            if (category) {
                
                const requestedCategory = await Category.findOne({ _id: category, islisted: true });
                if (!requestedCategory) {
                   
                    return res.render("users/shop", {
                        prod: [],
                        cate: cate,
                        user: req.session.user,
                        text: category, 
                        sort: sort, 
                        currentPage: page, 
                        totalPages: 0 
                    });
                }
               
                query.category = category;
            } else {
                
                query.category = { $in: listedCategoryIds };
            }
    
            
            prod = await products.find(query)
                                 .sort(sortOptions)
                                 .skip(skip)
                                 .limit(limit)
                                 .populate('category');
    
            const totalProductsCount = await products.countDocuments(query);
            const totalPages = Math.ceil(totalProductsCount / limit);
    
            res.render("users/shop", {
                prod: prod,
                cate: cate,
                user: req.session.user,
                text: category, 
                sort: sort, 
                currentPage: page, 
                totalPages: totalPages
            });
        } catch (error) {
            console.error("Error fetching products:", error);
            res.status(500).send("Internal Server Error");
        }
    },
    
    

    viewDetails:async (req,res)=>{
        try{
            const id = req.params.id;
            const prod = await products.findById(id).populate("category").populate("brand")
            const reProducts = await products.find({category:prod.category})

           

            const prods = await products.find({ispublished:true})
            .populate({
                path:"category",
                match:{islisted:true},
            })
            
            if(!prod){
                res.redirect('/shop');
                return;
            }
            res.render('users/viewDetails',{prod:prod,prods:prods,user:req.session.user,reProducts});
        }catch(err){
            console.error(err);
            res.redirect('/shop')
        }

    },
    userLogout:(req,res)=>{
        req.session.user = null;
        res.redirect('/')
    },

    forgotPassword:(req,res)=>{
        res.render('users/forgotPassword')
    },
    postResetPassword : async (req, res) => {
        const postEmail = req.body.email;
        const newPassword = req.body.password;
    
        try {
            
            const user = await User.findOne({ email: postEmail });
            if (!user) {
                return res.redirect('/forgotpassword');
            }
    
            
            const hashedPassword = await bcrypt.hash(newPassword, saltPassword);
    
            
            user.password = hashedPassword;
            await user.save();
    
            
            return res.redirect('/userLogin');
        } catch (error) {
            
            return res.status(500).json({ message: error.message, type: "danger" });
        }
    },
    usersProfileHome: async (req, res) => {
        try {
            const user = req.session.user;
            if (!user) {
                return res.render("users/userLogin", { user: req.session.user, alert: "Please login" });
            }
    
            const foundUser = await User.findOne({ email: req.session.user });
            if (!foundUser) {
                return res.render("users/userLogin", { user: req.session.user, alert: "User not found" });
            }
    
            res.render("users/usersProfileHome", { user: req.session.user, users: foundUser });
        } catch (err) {
            console.error(err);
            res.json({ message: err.message, type: "danger" });
        }
    },
    
    
    
    updateUserDetails: async(req,res)=>{
        const email = req.body.email;
        try{
            const result = await User.findOneAndUpdate({email:email},{
                name:req.body.name,
                email:req.body.email,
                phone:req.body.phone,
            });
            res.redirect('/usersProfileHome')
        }catch(err){
            console.error(err);
            res.json({message : err.message , type :"danger" })
        }
    },
   
    changePassword: async (req, res) => {
        const id = req.params.id;

        const newPassword = req.body.newPassword;
    
        try {
           
            const data = await User.findById(id)
            if (data) {
                const passwordMatch = await bcrypt.compare(req.body.currentPassword,data.password);
                if(passwordMatch){
                    const hashedPassword = await bcrypt.hash(newPassword, saltPassword)
                    data.password = hashedPassword;
                    await data.save();
                    req.session.message = {
                        type: "success",
                        message : "Your password is changed  successfully",
                    };
                    return res.redirect('/usersProfileHome')

                }
                req.session.message = {
                    type: "danger",
                    message : "Your password is incorrect",
                };
                return res.redirect('/usersProfileHome')
            }
        } catch (error) {
           
            return res.status(500).json({ message: error.message, type: "danger" });
        }
    },
    
    ordersProfile:async (req,res)=>{
        const userId = req.session.userID
        
        const order = await Order.find({userId:userId}).sort({ orderDate: -1 })
        
        res.render("users/ordersProfile",{user:req.session.user,order:order})
    },



    orderTrack: async (req, res) => {
        try {
            const id = req.params.id;
            const userId = req.session.userID;
            
            
            
            const order = await Order.find({ userId: userId }).populate({
                path:"items.product",
                message:"product"
            })
            if (!order) {
                return res.status(404).send("Order not found");
            }

            
            const orderItem = order.find(item => item._id.toString() === id);
            
            if (!orderItem) {
                return res.status(404).send("Order item not found");
            }

            let pending, shipped, delivered, cancelled
  
        if(orderItem.orderStatus === "Pending"){
          pending = "#F78200"
        }else if(orderItem.orderStatus === "Shipped"){
          shipped = "#FFAD00"
        }else if(orderItem.orderStatus === "Delivered"){
          delivered = "#00FF2D"
        }else if(orderItem.orderStatus === "Cancelled"){
          cancelled = "#FF0000"
        }

            res.render('users/orderTrack', { 
                user: req.session.user, 
                orderItem: orderItem, 
                order: order,
                pending,
                shipped,
                delivered,
                cancelled 
                
            });
        } catch (err) {
            console.error(err);
            res.status(500).send("Internal Server Error");
        }
    },

    


    

    orderTrackReturnOrder: async (req, res) => {
        const { productId, orderId } = req.body;
        const order = await Order.findOne({ _id: orderId })
        const returnProduct = order.items.find(product=> product._id.toString()=== productId );
        const productOne = returnProduct.product
        const pro = await products.findOne({_id:productOne})
        const amount = returnProduct.price * returnProduct.quantity
        if(!returnProduct){
            return res.status(404).json({ error: 'Product not found in order' });
        }
        
            await products.findByIdAndUpdate(productOne, { $inc: { stock: returnProduct.quantity } });
            //  order.totalPrice -= amount ;
            //  await order.save();
             
                    
                    const wallet = await Wallet.findOneAndUpdate({ userId: req.session.userID }, {
                        $inc: { balance: amount },
                        $push: { transactionHistory: { amount, type: 'deposit', description: "Amount added through Return One order" } }
                    }, { new: true });
                    returnProduct.orderStatus = 'Return';
                    await order.save();
                    return res.status(200).json({ message: 'Product returned successfully', cancelledProduct: returnProduct });
                    
        
    },

    orderTrackCancelOrder:async(req,res)=>{
        const { productId, orderId } = req.body;
        const order = await Order.findOne({ _id: orderId })
        const cancelProduct = order.items.find(product=> product._id.toString()=== productId );
        const productOne = cancelProduct.product
        const pro = await products.findOne({_id:productOne})
       let amount;
       let finalAmount;
       let nonCancelledItemCount = 0;
        for (const item of order.items) {
            if (item.orderStatus !== 'Cancelled') {
                nonCancelledItemCount++;
            }
            if (nonCancelledItemCount > 1) {
                break;
            }
        }
        
        if (nonCancelledItemCount === 1) {
            // console.log("Only one item not cancell");
            amount = cancelProduct.price * cancelProduct.quantity+60
        } else {
           
            amount = cancelProduct.price * cancelProduct.quantity
        }
        if(order.couponDiscount>0){
            divideCouponAmount = order.couponDiscount / order.items.length
            finalAmount = amount-divideCouponAmount;
        }else{
            finalAmount = amount;
        }

        
        if(!cancelProduct){
            return res.status(404).json({ error: 'Product not found in order' });
        }
        if(order.paymentStatus === 'Paid'){
            await products.findByIdAndUpdate(productOne, { $inc: { stock: cancelProduct.quantity } });
            //  order.totalPrice -= amount ;
             await order.save();
            //  const userWallet = await Wallet.findOne({ userId: req.session.userID })
                    
                    const wallet = await Wallet.findOneAndUpdate({ userId: req.session.userID }, {
                        $inc: { balance: finalAmount },
                        $push: { transactionHistory: { amount:finalAmount, type: 'deposit', description: "Amount added through Cancel One order" } }
                    }, { new: true });
                    cancelProduct.orderStatus = 'Cancelled';
                    await order.save();
                    return res.status(200).json({ message: 'Product cancelled successfully', cancelledProduct: cancelProduct });
                    
        }
        
            // order.totalPrice -= amount ;
            await products.findByIdAndUpdate(productOne, { $inc: { stock: cancelProduct.quantity } });
            cancelProduct.orderStatus = 'Cancelled';
            await order.save();
            res.status(200).json({ message: 'Product cancelled successfully', cancelledProduct: cancelProduct });

    },
    
    
    


    whishlist:async(req,res)=>{
        const userId = req.session.userID;



        res.render('users/whishlist' ,{user:req.session.user})
    },


    searchProduct:async (req, res) => {
        try {
          const searchTerm = req.query.q; 
      
          
          const searchResults = await products.find({
            $or: [
              { product: { $regex: searchTerm, $options: 'i' } }, 
              { description: { $regex: searchTerm, $options: 'i' } },
              { category: { $in: await Category.find({ category: { $regex: searchTerm, $options: 'i' } }).distinct('_id') } }
            ],
          }).populate('category').exec();
      
          res.render('users/searchItems', { results: searchResults,user:req.session.user }); 
        } catch (error) {
          console.error('Error searching products:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
      },

      getOrderInvoice : async(req,res) => {
        try{
        const  orderId  = req.params.orderId; 
           
            const categoryData = await Category.find({status:'active'})
            // const orderId = req.params.orderId;
            const userId = req.session.userID;
            const order = await Order.findById(orderId).populate('items.product')
            const user = await User.findById(userId)
    
            if (!order) {
                return res.status(404).json({ success: false, message: 'Order not found' });
            }
    
            const invoiceTemplatePath = path.join(__dirname,'..','views', 'users','invoice.ejs');
    
            const invoiceHtml = await ejs.renderFile(invoiceTemplatePath,{categoryData,order,user});
    
            const options = {
                format: 'A4',
                orientation:'portrait',
                border:'10mm'
            }
    
            pdf.create(invoiceHtml, options).toStream((err, stream) => {
                if(err) {
                    console.log('Error generating PDF:',err);
                    return res.status(500).json({ success: false, message: 'Error generating PDF' });
                }
    
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', 'attachment; filename="invoice.pdf"');
    
                stream.pipe(res);
            })
            
    
        }catch(error){
            console.log(error.message);
            res.status(500).json({success:false,message:'Internal server error'})
        }
    },

   
    aboutUs:(req,res)=>{
        res.render("users/aboutUs",{user:req.session.userID})
    }
    
}

module.exports = userController;