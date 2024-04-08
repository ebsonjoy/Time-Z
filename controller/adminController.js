const User = require('../models/users');
const Order = require('../models/order');
const PDFDocument  = require('pdfkit')
const fs = require('fs')
const Products = require('../models/products')


 





// admin login
const credential ={
    email:process.env.CREDENTIAL_EMAIL,
    password:process.env.CREDENTIAL_PASSWORD,

};



const adminController={
    adminLogin:(req,res)=>{
        if(!req.session.admin){
        res.render("admin/login");
        }else{
            res.redirect('/dashboard')
        }
    },

    adminLoginPost:(req,res)=>{

        if(req.body.email==credential.email && req.body.password == credential.password)
        {
            req.session.admin = req.body.email
            res.redirect("/dashboard");
        }else{
            res.render("admin/login");
        }
       
    },
    
    adminLogout:(req,res)=>{
        if(req.session.admin){
            req.session.admin = null;
            res.render('admin/login');
        }else{
            res.render('admin/login')
        }
    },



    
    adminCustomer:async(req,res)=>{
        const user = await User.find()
        res.render("admin/customer",{user:user})
    },
    
    
    generateReport : async (req, res) => {
        try {
            const { startDate, endDate } = req.body;
      
            
            const orders = await Order.aggregate([
                { $match: { 
                    orderDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
                }},
                { $unwind: "$items" }, 
                { $match: { "items.orderStatus": "Delivered" }},
                { $lookup: { 
                    from: "products", 
                    localField: "items.product",
                    foreignField: "_id",
                    as: "items.product"
                }},
                { $addFields: { 
                    "items.product": { $arrayElemAt: ["$items.product", 0] } 
                }},
                { $group: { 
                    _id: "$_id",
                    userId: { $first: "$userId" },
                    items: { $push: "$items" },
                    totalPrice: { $first: "$totalPrice" },
                    couponDiscount: { $first: "$couponDiscount" },
                    billingDetails: { $first: "$billingDetails" },
                    paymentStatus: { $first: "$paymentStatus" },
                    orderDate: { $first: "$orderDate" },
                    paymentMethod: { $first: "$paymentMethod" }
                }}
            ]).exec();
      
            
            const reportData = orders.map((order, index) => {
                let totalPrice = 0;
                order.items.forEach(product => {
                    totalPrice += product.price * product.quantity;
                });
      
                return {
                    orderId: order._id,
                    date: order.orderDate,
                    totalPrice,
                    products: order.items.map(product => {
                        return {
                            productName: product.product.product,
                            quantity: product.quantity,
                            price: product.price
                        };
                    }),
                    firstName: order.billingDetails.name,
                    address: order.billingDetails.address,
                    paymentMethod: order.paymentMethod,
                    paymentStatus: order.paymentStatus
                };
            });
            res.status(200).json({ reportData });
        } catch (err) {
            console.error('Error generating report:', err);
            res.status(500).json({ error: 'Failed to generate report' });
        }
      },
      statistics:async (req,res)=>{
            try {
                const ordersCount = await Order.countDocuments({});
                const customers = await User.countDocuments({});
                const productsCount = await Products.countDocuments({})

                
                const Revenue = await Order.aggregate([
                    {
                        $group: {
                            _id: null,
                            totalAmount: { $sum: "$totalPrice" }
                        }
                    }
                ]);
    
                
                const totalRevenue = Revenue.length > 0 ? Revenue[0].totalAmount : 0;
    
                res.render('admin/statistics', { ordersCount, totalRevenue,customers,productsCount });
            } catch (error) {
                console.error("Error:", error);
                res.status(500).send("Internal Server Error");
            }
        

      },

      




    UserBlock:async (req,res)=>{
        const id = req.params.id;
        const user = await User.findByIdAndUpdate(id,{isblocked:false});
        req.session.user = null
        res.redirect('/customer')
    },
    UserUnblock:async (req,res)=>{
        const id = req.params.id;
        const user = await User.findByIdAndUpdate(id,{isblocked:true});
        res.redirect('/customer')
    },

    bestSellingProducts:async (req, res) => {
        try {
          const bestSellingProducts = await Order.aggregate([
            { $unwind: '$items' },
            {
              $group: {
                _id: '$items.product',
                totalQuantity: { $sum: '$items.quantity' },
              },
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 10 }, 
            {
              $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: '_id',
                as: 'product',
              },
            },
            { $unwind: '$product' },
            {
              $project: {
                _id: '$product._id',
                productTitle: '$product.product',
                totalQuantity: 1,
              },
            },
          ]);
      
          res.render("admin/bestSellingProducts",{bestSellingProducts });
        } catch (err) {
          next(err);
        }
      },
      bestSellingCategories: async (req, res) => {
        try {
          const bestSellingCategories = await Order.aggregate([
            { $unwind: '$items' },
            {
              $lookup: {
                from: 'products',
                localField: 'items.product',
                foreignField: '_id',
                as: 'product',
              },
            },
            { $unwind: '$product' },
            {
              $group: {
                _id: '$product.category',
                totalQuantity: { $sum: '$items.quantity' },
              },
            },
            {
              $sort: { totalQuantity: -1 },
            },
            {
              $limit: 10, 
            },
            {
              $lookup: {
                from: 'categories',
                localField: '_id',
                foreignField: '_id',
                as: 'category',
              },
            },
            { $unwind: '$category' },
            {
              $project: {
                _id: '$category._id',
                category: '$category.category',
                totalQuantity: 1,
              },
            },
          ]);
          res.render('admin/bestSellingCategory',{bestSellingCategories });
        } catch (err) {
          next(err);
        }
      },
      bestSellingBrands: async (req, res) => {
        try {
          const bestSellingBrands = await Order.aggregate([
              { $unwind: '$items' },
              {
                  $lookup: {
                      from: 'products',
                      localField: 'items.product',
                      foreignField: '_id',
                      as: 'product',
                  },
              },
              { $unwind: '$product' },
              {
                  $group: {
                      _id: '$product.brand',
                      totalQuantity: { $sum: '$items.quantity' },
                  },
              },
              { $sort: { totalQuantity: -1 } },
              { $limit: 10 },
              {
                  $lookup: {
                      from: 'brands',
                      localField: '_id',
                      foreignField: '_id',
                      as: 'brand',
                  },
              },
              { $unwind: '$brand' },
              {
                  $project: {
                      _id: '$brand._id',
                      brandName: '$brand.brand',
                      totalQuantity: 1,
                  },
              },
          ]);
          res.render('admin/bestSellingBrand', { bestSellingBrands });
      } catch (err) {
          next(err);
      }
      },

    
    

}


module.exports = adminController