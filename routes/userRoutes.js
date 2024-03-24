const express = require('express');
const nocache = require('nocache');
const router = express.Router();
router.use(nocache());
const userController = require("../controller/userController");
const passport = require('passport');
const authController = require("../middleware/passportSetup")
const addressController = require("../controller/addressController");
const cartController = require('../controller/cartController');
const wishlistController = require('../controller/wishlistController')
const walletController = require('../controller/walletController')


// User Login, SignUp, OTP, Resen OTP, LogOut 


router.get("/",userController.userHomePage);
// router.get("/:page?", userController.userHomePage);
router.get("/userLogin",userController.userLoginPage);
router.post('/userLoginPost',userController.userLoginPost);
router.get("/userSginup",userController.userSignup);
router.post("/signup",userController.userSignupLogin);
router.post('/optvarification', userController.userOptPost);
router.get("/resendOpt",userController.resendOpt);
router.get('/userLogout',userController.userLogout);
// -----------------------------------------------------------------------------

// forgot Password
router.get("/forgotPassword",userController.forgotPassword);
router.post("/resetpassword",userController.postResetPassword);
// ------------------------------------------------------------------------------

// Google login
router.get("/auth/google",authController.googleAuth);
router.get("/google/callback",authController.googleAuthCallback);
// ------------------------------------------------------------------------------

// Shop, View Details
// router.get("/shop",userController.userShop);
router.get("/viewDetails/:id",userController.viewDetails);
router.get("/shop/:page?", userController.userShop);

// ------------------------------------------------------------------------------

// User Profile
router.get("/usersProfileHome",userController.usersProfileHome);
router.post("/updateUserDetails",userController.updateUserDetails);
router.post("/changePassword/:id",userController.changePassword); //Change Passwords

// Order
router.get("/ordersProfile",userController.ordersProfile);
router.get('/orderTrack/:id',userController.orderTrack)
// router.get('/cancelOrder/:id', userController.cancelOrder);
// router.get('/returnOrder/:id', userController.returnOrder);
router.patch('/orderTrackCancelOrder',userController.orderTrackCancelOrder)
router.patch('/orderTrackReturnOrder',userController.orderTrackReturnOrder)



// My Address
router.get("/myAddress",addressController.myAddress)
router.get("/addAddress",addressController.addAddress)
router.post("/addressSubmit",addressController.addressPost)
router.get("/editAddress/:id",addressController.editAddress)
router.post("/updateAddressPost/:id",addressController.updateAddressPost)
router.get("/deleteAddress/:id",addressController.deleteAddress)

router.get("/addressAddCheckOut",addressController.addressAddCheckOut)
router.post("/addressSubmitCheckOut",addressController.addressSubmitCheckOut)

// Cart
router.get("/shopCart",cartController.shopCart)
router.get("/addTocart/:id",cartController.addTocart)

// checkOut
router.get("/checkOut",cartController.checkOut)
router.post('/updateQuantity',cartController.updateQuantity)
router.get("/deleteCartProduct/:id",cartController.deleteCartProduct)
router.post("/orderPost",cartController.orderPost)
router.get('/orderConform',cartController.orderConform) 


// Filter
router.get('/categoryFilter/:category', userController.userShop);
router.get('/priceFilter/:category?', userController.userShop);

// whishlist
router.get('/wishlist',wishlistController.wishlist)
router.patch('/addToWishlist/:id',wishlistController.addToWishlist)
router.get('/deleteWishlistProduct/:id',wishlistController.deleteWishlistProduct)

// Search Product 
router.get('/search',userController.searchProduct)

// wallet

// router.get('/user/wallet', walletController.userWallet);
// router.post('/addFunds', walletController.addFunds);
// router.post('/withdrawFunds', walletController.withdrawFunds);
// router.post('/clearHistory', walletController.clearHistory);

router.get('/user/wallet', walletController.userWallet);
router.post('/addFunds', walletController.addFunds);
router.post('/withdrawFunds', walletController.withdrawFunds);
router.post('/clearHistory', walletController.clearHistory);
router.get('/check-wallet-balance', walletController.checkWalletBalance);

// Coupon
router.patch('/checkCoupon', cartController.checkCoupon);
router.post('/cancel-coupon', cartController.cancelCoupon);






module.exports = router;