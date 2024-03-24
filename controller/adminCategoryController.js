const User = require('../models/users');
const Category = require('../models/category')
const Products = require('../models/products');
const multer = require('multer');
const products = require('../models/products');
const category = require('../models/category');
const Address = require('../models/address');
const Cart = require('../models/cart');
const Order = require('../models/order');

const adminCategoryController = {
    adminCategory:async(req,res)=>{
        const category = await Category.find()
        res.render("admin/category",{category:category})
    },
    adminAddCategory:(req,res)=>{
        res.render("admin/addcategory")
    },
    adminNewCategory: async (req,res)=>{
        const existingcategory = await Category.findOne({category: req.body.category});
        if(existingcategory){
             res.render('users/addcategory',{title:"SignUP", alert:"Email already exists, Please try with another one",});
        }else{
           
            const newcategory = new Category({
                category:req.body.category,
                description:req.body.description,
            });
            try{
                await newcategory.save();
                res.redirect('/category');
            } catch(er){
               res.json({message:er.message, type:"danger"}); 
            }
        }
    
    },
    adminEditCategory:async(req,res)=>{
        try{
            const id = req.params.id;
            const categ = await Category.findById(id);
            if(!categ){
                res.redirect('admin/category');
                return;
            }
            res.render('admin/editcategory',{categ:categ});
        }catch(err){
            console.error(err);
            res.redirect('admin/category')
        }
    },
    adminUpdateCategory:async (req,res)=>{
        const id = req.params.id;
        try{
            const result = await Category.findByIdAndUpdate(id,{
                category:req.body.category,
                description:req.body.description,
            });
            res.redirect('/category');
        }catch(err){
            console.error(err);
            res.json({message : err.message , type :"danger" })
        }
    },
    CategoryList:async (req,res)=>{
        const id = req.params.id;
        const category = await Category.findByIdAndUpdate(id,{islisted:true});
        res.redirect('/category')
    },
    CategoryUnlist:async (req,res)=>{
        const id = req.params.id;
        const category = await Category.findByIdAndUpdate(id,{islisted:false});
        res.redirect('/category')
    },

}

module.exports = adminCategoryController;