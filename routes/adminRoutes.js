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
const admin = require('../middleware/adminHandle');




// admin login
router.get("/adminLogin",adminController.adminLogin)
router.post("/submit",adminController.adminLoginPost)
router.get("/adminLogout",adminController.adminLogout)
//---------------------------------------------------------------------------

// admin Customer
router.get("/customer",admin,adminController.adminCustomer)
router.get('/block/:id',adminController.UserBlock)
router.get('/unblock/:id',adminController.UserUnblock)
// --------------------------------------------------------------------------

// Admin Category
router.get("/category",admin,adminCategoryController.adminCategory)
router.get("/addcategory",admin,adminCategoryController.adminAddCategory)
router.post("/submitcategory",adminCategoryController.adminNewCategory)
router.get('/editcategory/:id',admin,adminCategoryController.adminEditCategory)
router.post('/submiteditcategory/:id', adminCategoryController.adminUpdateCategory)
router.get('/list/:id',adminCategoryController.CategoryList)
router.get('/unlist/:id',adminCategoryController.CategoryUnlist)
// --------------------------------------------------------------------------

// Admin Product
router.get("/products",admin,productsController.adminProducts)
router.get("/addproducts",admin,productsController.adminAddProducts)
router.post("/submitproduct",upload,productsController.adminNewProducts)
router.get("/edit/:id",productsController.adminEditProduct)
router.post('/update/:id',upload,productsController.adminUpdateProduct)
router.get('/publish/:id',productsController.ProductPublish)
router.get('/unpublish/:id',productsController.ProductUnpublish)
// --------------------------------------------------------------------------


// Admin Order
router.get("/adminOrderProfile",admin,adminOrderController.adminOrderProfile)
router.get("/orderDetails/:id",admin,adminOrderController.orderDetails)
router.post('/update_order_status',adminOrderController.updateOrderStatus);

// coupon
router.get('/coupon',admin,adminCouponController.couponPage)
router.get('/addCoupon',admin,adminCouponController.addCoupon)
router.post('/submitNewCoupon',adminCouponController.submitNewCoupon)
router.get('/listCoupon/:id',adminCouponController.couponList)
router.get('/unlistCoupon/:id',adminCouponController.couponUnlist)
router.get('/editCoupon/:id',admin,adminCouponController.editCoupon)
router.post('/updateCoupon/:id',adminCouponController.updateCoupon)

// dashboard
router.get("/dashboard",admin,dashboardController.getDashboard)
router.get('/fetchdashboard',dashboardController.fetchdashboard)


// Statistics
router.get("/statistics",admin,adminController.statistics)
router.post('/generate-report',adminController.generateReport)


// brand
router.get("/brand",admin,adminBrandController.adminBrand)
router.get("/addBrand",admin,adminBrandController.adminAddBrand)
router.post("/submitBrand",admin,adminBrandController.adminNewBrand)
router.get('/editBrand/:id',adminBrandController.adminEditBrand)
router.post('/submitEditBrand/:id', adminBrandController.adminUpdateBrand)
router.get('/listBrand/:id',adminBrandController.BrandList)
router.get('/unlistBrand/:id',adminBrandController.BrandUnlist)

// best Selling 

router.get('/bestSellingProducts',admin,adminController.bestSellingProducts)
router.get('/bestSellingCategories',admin,adminController.bestSellingCategories)
router.get('/bestSellingBrands',admin,adminController.bestSellingBrands)














module.exports = router;