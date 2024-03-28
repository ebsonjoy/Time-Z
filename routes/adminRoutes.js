const express = require('express');
const nocache = require('nocache');
const router = express.Router();
router.use(nocache());

const adminController = require("../controller/adminController");
const adminCategoryController = require("../controller/adminCategoryController");
const {upload,productsController} = require("../controller/productsController")
const adminOrderController = require("../controller/adminOrderController");
const adminCouponController = require("../controller/adminCouponController");
const { route } = require('./userRoutes');
const dashboardController = require("../controller/dashboardController");
const adminBrandController = require("../controller/adminBrandController")










// admin login
router.get("/adminLogin",adminController.adminLogin)
router.post("/submit",adminController.adminLoginPost)
router.get("/adminLogout",adminController.adminLogout)
//---------------------------------------------------------------------------

// admin Customer
router.get("/customer",adminController.adminCustomer)
router.get('/block/:id',adminController.UserBlock)
router.get('/unblock/:id',adminController.UserUnblock)
// --------------------------------------------------------------------------

// Admin Category
router.get("/category",adminCategoryController.adminCategory)
router.get("/addcategory",adminCategoryController.adminAddCategory)
router.post("/submitcategory",adminCategoryController.adminNewCategory)
router.get('/editcategory/:id',adminCategoryController.adminEditCategory)
router.post('/submiteditcategory/:id', adminCategoryController.adminUpdateCategory)
router.get('/list/:id',adminCategoryController.CategoryList)
router.get('/unlist/:id',adminCategoryController.CategoryUnlist)
// --------------------------------------------------------------------------

// Admin Product
router.get("/products",productsController.adminProducts)
router.get("/addproducts",productsController.adminAddProducts)
router.post("/submitproduct",upload,productsController.adminNewProducts)
router.get("/edit/:id",productsController.adminEditProduct)
router.post('/update/:id',upload,productsController.adminUpdateProduct)
router.get('/publish/:id',productsController.ProductPublish)
router.get('/unpublish/:id',productsController.ProductUnpublish)
// --------------------------------------------------------------------------


// Admin Order
router.get("/adminOrderProfile",adminOrderController.adminOrderProfile)
router.get("/orderDetails/:id",adminOrderController.orderDetails)
router.post('/update_order_status',adminOrderController.updateOrderStatus);

// coupon
router.get('/coupon',adminCouponController.couponPage)
router.get('/addCoupon',adminCouponController.addCoupon)
router.post('/submitNewCoupon',adminCouponController.submitNewCoupon)
router.get('/listCoupon/:id',adminCouponController.couponList)
router.get('/unlistCoupon/:id',adminCouponController.couponUnlist)
router.get('/editCoupon/:id',adminCouponController.editCoupon)
router.post('/updateCoupon/:id',adminCouponController.updateCoupon)

// dashboard

// router.post('/generate-report',adminController.generateReport)
router.get("/dashboard",dashboardController.getDashboard)
router.get('/fetchdashboard',dashboardController.fetchdashboard)


// Statistics

router.get("/statistics",adminController.statistics)
router.post('/generate-report',adminController.generateReport)


// brand
router.get("/brand",adminBrandController.adminBrand)
router.get("/addBrand",adminBrandController.adminAddBrand)
router.post("/submitBrand",adminBrandController.adminNewBrand)
router.get('/editBrand/:id',adminBrandController.adminEditBrand)
router.post('/submitEditBrand/:id', adminBrandController.adminUpdateBrand)
router.get('/listBrand/:id',adminBrandController.BrandList)
router.get('/unlistBrand/:id',adminBrandController.BrandUnlist)

// best Selling 

router.get('/bestSellingProducts',adminController.bestSellingProducts)
router.get('/bestSellingCategories',adminController.bestSellingCategories)
router.get('/bestSellingBrands',adminController.bestSellingBrands)














module.exports = router;