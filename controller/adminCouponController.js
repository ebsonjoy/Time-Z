
const Coupon = require('../models/coupon')



const adminCouponController = {
    couponPage:async(req,res)=>{
        const coupons = await Coupon.find();
        res.render('admin/coupon',{coupons:coupons})
    },
    addCoupon:(req,res)=>{
        res.render('admin/addCoupon')
    },
    submitNewCoupon: async (req,res)=>{
        const existingcoupon = await Coupon.findOne({coupon_code: req.body.coupon_code});
        if(existingcoupon){
             res.render('admin/addCoupon',{title:"SignUP", alert:"Coupon already exists, Please try with another one",});
        }else{
           
            const newCoupon = new Coupon({
                coupon_code:req.body.coupon_code,
                description:req.body.description,
                percentage:req.body.percentage,
                minimumAmount:req.body.minimumAmount,
                maximumAmount:req.body.maximumAmount,
                expiryDate:req.body.expiryDate,
            });
            try{
                await newCoupon.save();
                res.redirect('/coupon');
            } catch(er){
               res.json({message:er.message, type:"danger"}); 
            }
        }
    
    },
    couponList:async (req, res) => {
        const id = req.params.id;
        try {
            await Coupon.findByIdAndUpdate(id, { isListed: true });
            // console.log(id);
            res.redirect('/coupon');
        } catch (error) {
            console.error(error);
            res.status(500).send('Error updating coupon');
        }
    },
    couponUnlist:async (req, res) => {
        const id = req.params.id;
       

        try {
            const coupon =  await Coupon.findByIdAndUpdate(id, { isListed: false });
           
            

            res.redirect('/coupon');
        } catch (error) {
            console.error(error);
            res.status(500).send('Error updating coupon');
        }
    },

    editCoupon:async(req,res)=>{
        try{
            const id = req.params.id;
            const coupon = await Coupon.findById(id);
            if(!coupon){
                res.redirect('/coupon');
                return;
            }
            res.render('admin/couponEdit',{coupon:coupon});
        }catch(err){
            console.error(err);
            res.redirect('/coupon')
        }
    },
    updateCoupon: async(req,res)=>{
        const id = req.params.id;
        try{
            const result = await Coupon.findByIdAndUpdate(id,{
                coupon_code:req.body.coupon_code,
                description:req.body.description,
                percentage:req.body.percentage,
                minimumAmount:req.body.minimumAmount,
                maximumAmount:req.body.maximumAmount,
                expiryDate:req.body.expiryDate,
            });
            res.redirect('/coupon');
        }catch(err){
            console.error(err);
            res.json({message : err.message , type :"danger" })
        }
    },
}

module.exports = adminCouponController;