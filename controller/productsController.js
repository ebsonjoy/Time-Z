
const Category = require('../models/category')
const Products = require('../models/products');
const multer = require('multer');
const products = require('../models/products');



// addImage
var storage = multer.diskStorage({
    destination: function(req,file,callback){
        callback(null, "./public/products");
    },
    filename: function(req,file,callback){
        callback(null, file.fieldname + "_"+ Date.now()+ "_"+ file.originalname);
    },
});
// uploadMidleWare

var upload = multer({
    storage:storage,
}).array("images",3); 


const productsController = {
    adminProducts:async (req, res) => {
        const ITEMS_PER_PAGE = 6;
        const page = +req.query.page || 1; // Get current page or default to 1
        const searchQuery = req.query.search;
    
        try {
            let products;
            let totalProducts;
    
            if (searchQuery) {
                let query;
                const numericQuery = parseFloat(searchQuery);
                if (!isNaN(numericQuery)) {
                   
                    query = { price: numericQuery };
                } else {
                   
                    query = { product: { $regex: searchQuery, $options: 'i' } };
                }
    
                products = await Products.find(query)
                    .skip((page - 1) * ITEMS_PER_PAGE)
                    .limit(ITEMS_PER_PAGE);
    
                totalProducts = await Products.countDocuments(query);
            } else {
                
                totalProducts = await Products.countDocuments();
                products = await Products.find()
                    .skip((page - 1) * ITEMS_PER_PAGE)
                    .limit(ITEMS_PER_PAGE);
            }
    
            res.render("admin/products", {
                products: products,
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < totalProducts,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalProducts / ITEMS_PER_PAGE),
                searchQuery: searchQuery 
            });
        } catch (err) {
            console.error("Error fetching products:", err);
            res.status(500).send("Error fetching products");
        }
    },
    adminAddProducts:async (req,res)=>{
        const category = await Category.find()
        res.render('admin/addproducts',{cate:category})
    },
    adminNewProducts:async(req,res)=>{
        const existingproduct = await Products.findOne({product : req.body.category});
        if(existingproduct){
            res.render('users/addproducts')
        }else{
            const images = req.files.map(file=>file.filename)
            const newproduct = new Products({
                product:req.body.product,
                description:req.body.description,
                brand:req.body.brand,
                bandColor:req.body.bandColor,
                bandMeterial:req.body.bandMeterial,
                warrantyType:req.body.warrantyType,
                warrantyDescription:req.body.warrantyDescription,
                Country:req.body.Country,
                waterResi:req.body.waterResi,
                PackingDelivery:req.body.PackingDelivery,
                price : req.body.price,
                oldPrice:req.body.oldPrice,
                stock:req.body.stock,
                category:req.body.category,
                images:images,
            });
            try{
                await newproduct.save();
                res.redirect('/products')
            }catch(er){
                res.json({message:er.message,type:"danger"})
            }
        }

    },
    adminEditProduct:async (req,res)=>{
        try{
            const id = req.params.id;
            const category = await Category.find()
            const prod = await Products.findById(id).populate('category')
            if(!prod){
                res.redirect('admin/products');
                return;
            }
            res.render('admin/editproduct',{prod:prod,cate:category});
        }catch(err){
            console.error(err);
            res.redirect('admin/products')
        }

    },
    adminUpdateProduct:async (req,res)=>{
        const id = req.params.id;
        
        try{
            const images = req.files.map(file=> file.filename);
            const result = await Products.findByIdAndUpdate(id,{
                product:req.body.product,
                description:req.body.description,
                brand:req.body.brand,
                price : req.body.price,
                stock:req.body.stock, 
                category:req.body.category,
                images:images,
            });
                 
            res.redirect('/products');
        }catch(err){
            console.error(err);
            res.json({message : err.message , type :"danger" })
        }
    },
    ProductPublish:async (req,res)=>{
        const id = req.params.id;
        const product = await products.findByIdAndUpdate(id,{ispublished:true});
        res.redirect('/products')
    },
    ProductUnpublish:async (req,res)=>{
        const id = req.params.id;
        const product = await products.findByIdAndUpdate(id,{ispublished:false});
        res.redirect('/products')
    },

}

module.exports = {upload,productsController};