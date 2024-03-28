const Brand = require('../models/brand')
const Category = require('../models/category')

const adminBrandController = {
    adminBrand:async(req,res)=>{
            const brand = await Brand.find()
            res.render("admin/brand",{brand:brand})
    },
    adminAddBrand:(req,res)=>{
        res.render('admin/addBrand')
    },
    adminNewBrand: async (req,res)=>{
        const existingBrand = await Brand.findOne({brand: req.body.brand});
        if(existingBrand){
             res.render('admin/addBrand',{alert:"Brand is already exists, Please try with another one",});
        }else{
           
            const newBrand = new Brand({
                brand:req.body.brand,
                description:req.body.description,
            });
            try{
                await newBrand.save();
                res.redirect('/brand');
            } catch(er){
               res.json({message:er.message, type:"danger"}); 
            }
        }
    
    },
    adminEditBrand:async(req,res)=>{
        try{
            const id = req.params.id;
            const brand = await Brand.findById(id);
            if(!brand){
                res.redirect('/brand');
                return;
            }
            res.render('admin/editBrand',{brand:brand});
        }catch(err){
            console.error(err);
            res.redirect('/brand')
        }
    },
    adminUpdateBrand:async (req,res)=>{
        const id = req.params.id;
        try{
            const result = await Brand.findByIdAndUpdate(id,{
                brand:req.body.brand,
                description:req.body.description,
            });
            res.redirect('/brand');
        }catch(err){
            console.error(err);
            res.json({message : err.message , type :"danger" })
        }
    },
    BrandList:async (req,res)=>{
        const id = req.params.id;
        const brand = await Brand.findByIdAndUpdate(id,{islisted:true});
        res.redirect('/brand')
    },
    BrandUnlist:async (req,res)=>{
        const id = req.params.id;
        const brand = await Brand.findByIdAndUpdate(id,{islisted:false});
        res.redirect('/brand')
    },


}

module.exports = adminBrandController;