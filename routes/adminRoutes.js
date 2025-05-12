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
router.route('/addcategory')
  .get(admin, adminCategoryController.adminAddCategory)
  .post(adminCategoryController.adminNewCategory);
router.route('/editcategory/:id')
  .get(admin, adminCategoryController.adminEditCategory)
  .post(adminCategoryController.adminUpdateCategory);
router.get('/list/:id',adminCategoryController.CategoryList)
router.get('/unlist/:id',adminCategoryController.CategoryUnlist)
// --------------------------------------------------------------------------

// Admin Product
router.get("/products",admin,productsController.adminProducts)
router.route("/addproducts")
  .get(admin, productsController.adminAddProducts)
  .post(upload, productsController.adminNewProducts);
router.route("/edit/:id")
  .get(productsController.adminEditProduct)
  .post(upload, productsController.adminUpdateProduct);
router.get('/publish/:id',productsController.ProductPublish)
router.get('/unpublish/:id',productsController.ProductUnpublish)
// --------------------------------------------------------------------------


// Admin Order
router.get("/adminOrderProfile",admin,adminOrderController.adminOrderProfile)
router.get("/orderDetails/:id",admin,adminOrderController.orderDetails)
router.post('/update_order_status',adminOrderController.updateOrderStatus);

// coupon
router.get('/coupon',admin,adminCouponController.couponPage)
router.route('/addCoupon')
  .get(admin, adminCouponController.addCoupon)
  .post(adminCouponController.submitNewCoupon);
router.get('/listCoupon/:id',adminCouponController.couponList)
router.get('/unlistCoupon/:id',adminCouponController.couponUnlist)
router.route('/editCoupon/:id')
  .get(admin, adminCouponController.editCoupon)
  .post(adminCouponController.updateCoupon);
// --------------------------------------------------------------------------


// dashboard
router.get("/dashboard",admin,dashboardController.getDashboard)
router.get('/fetchdashboard',dashboardController.fetchdashboard)


// Statistics
router.get("/statistics",admin,adminController.statistics)
router.post('/generate-report',adminController.generateReport)


// brand
router.get("/brand",admin,adminBrandController.adminBrand)
router.route("/addBrand")
  .get(admin, adminBrandController.adminAddBrand)
  .post(admin, adminBrandController.adminNewBrand);
router.route("/editBrand/:id")
  .get(adminBrandController.adminEditBrand)
  .post(adminBrandController.adminUpdateBrand);
router.get('/listBrand/:id',adminBrandController.BrandList)
router.get('/unlistBrand/:id',adminBrandController.BrandUnlist)
// --------------------------------------------------------------------------



// best Selling 
router.get('/bestSellingProducts',admin,adminController.bestSellingProducts)
router.get('/bestSellingCategories',admin,adminController.bestSellingCategories)
router.get('/bestSellingBrands',admin,adminController.bestSellingBrands)














module.exports = router;