const User = require('../models/users');
const Order = require('../models/order');
const PDFDocument  = require('pdfkit')
const fs = require('fs')
const Products = require('../models/products')

const dashboardController = {
    getDashboard: async (req, res, next) => {
        if (!req.session.admin) {
            res.render("admin/login");
        } else {
            try {
                const users = await User.find().exec();
                const orders = await Order.find().exec();
                const products = await Products.find().exec();
                const ordersPie = await chart()
                const ordersGraph = await monthgraph();
                const ordersYearGraph = await yeargraph();
                const paidOrders = orders.filter(order => order.paymentStatus === "Paid");
                const filteredOrders = orders.filter(order => 
                  order.paymentStatus !== "Failed" && order.status !== "Cancelled"
              );
          
                // Calculate revenue from paid orders
                let revenue = 0;
                paidOrders.forEach(order => {
                  revenue += order.totalPrice;
                });
              
                res.render("admin/dashboard", { title: "Admin Home", users: users,orders:filteredOrders,products:products, ordersPie:ordersPie,ordersGraph: ordersGraph,ordersYearGraph: ordersYearGraph,revenue: revenue.toFixed(2)});
              } catch (err) {
                next(err);
              }



        }
    },
    fetchdashboard:async (req, res, next) => {
      
        try {
          const users = await User.find().exec();
          const orders = await Order.find().exec();
          const products = await Products.find().exec();
          const ordersPie = await chart();
    
          
          res.json({
            title: "Admin Home",
            users: users,
            orders: orders,
            products: products,
            ordersPie: ordersPie,
          });
        } catch (err) {
          next(err);
        }
      }

}

async function chart() {
    try {
      
      const ordersPie = await Order.find()
      const ordersCount = {
        cashOnDelivery: 0,
        razorPay: 0,
        wallet: 0
      }
      const paymentMethod = {
        cashOnDelivery:'COD',
        razorPay:'Razorpay',
        wallet :'Wallet'
      }

     
      ordersPie.forEach((order) => {
        if (order.paymentMethod === paymentMethod.cashOnDelivery) {
            ordersCount.cashOnDelivery++
          } else if (order.paymentMethod === paymentMethod.razorPay) {
            ordersCount.razorPay++
          } else if (order.paymentMethod === paymentMethod.wallet) {
            ordersCount.wallet++
          }
    
      })

      return ordersCount;
    } catch (error) {
      console.log("An error occured in orders count function chart", error.message);
    }
  }


  async function monthgraph() {
    try {
      const ordersCountByMonth = await Order.aggregate([
        {
          $project: {
            yearMonth: {
              $dateToString: {
                format: "%Y-%m",
                date: "$orderDate"
              }
            }
          }
        },
        {
          $group: {
            _id: "$yearMonth",
            count: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);

      const labels = ordersCountByMonth.map(val => val._id);
      const count = ordersCountByMonth.map(val => val.count);

      return {
        labels: labels,
        count: count
      };
    } catch (error) {
      console.log('Error retrieving orders in monthgraph function:', error.message);
      throw error; 
    }
  }


  async function yeargraph() {
    try {
      const ordersCountByYear = await Order.aggregate([
        {
          $project: {
            year: { $year: { date: '$orderDate' } },
          },
        },
        {
          $group: {
            _id: '$year',
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      const labels = ordersCountByYear.map((val) => val._id.toString());
      const count = ordersCountByYear.map((val) => val.count);

      return {
        labels: labels,
        count: count
      };
    } catch (error) {
      console.log('Error retrieving orders in yeargraph function:', error.message);
    }
  }
 
module.exports = dashboardController;
