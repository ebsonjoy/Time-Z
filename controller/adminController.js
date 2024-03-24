const User = require('../models/users');
const Order = require('../models/order');
const PDFDocument  = require('pdfkit')
const fs = require('fs')
const Products = require('../models/products')


 





// admin login
const credential ={
    email:"admin@gmail.com",
    password:"12345",

};



const adminController={
    adminLogin:(req,res)=>{
        if(!req.session.admin){
        res.render("admin/login");
        }else{
            res.render('admin/dashboard')
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
    adminDashboard: async (req, res) => {
        if (!req.session.admin) {
            res.render("admin/login");
        } else {
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
    
                // Extracting total revenue from the aggregation result
                const totalRevenue = Revenue.length > 0 ? Revenue[0].totalAmount : 0;
    
                res.render('admin/dashboard', { ordersCount, totalRevenue,customers,productsCount });
            } catch (error) {
                console.error("Error:", error);
                res.status(500).send("Internal Server Error");
            }
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
      
            // Fetch orders from the database based on the provided date range
            const orders = await Order.find({
                orderDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
            }).populate('items.product');
      
            // Process fetched orders to extract necessary information for the report
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




    UserBlock:async (req,res)=>{
        const id = req.params.id;
        const user = await User.findByIdAndUpdate(id,{isblocked:false});
        res.redirect('/customer')
    },
    UserUnblock:async (req,res)=>{
        const id = req.params.id;
        const user = await User.findByIdAndUpdate(id,{isblocked:true});
        res.redirect('/customer')
    },

    
    

}


module.exports = adminController