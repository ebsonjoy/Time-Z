

const products = require('../models/products');

const Wishlist = require('../models/whishlist')


const wishlistController = {
    wishlist:async(req,res)=>{
        const userId = req.session.userID;
        const userWishlist = await Wishlist.findOne({userId:userId}).populate('items.product')  

        res.render('users/wishlist' ,{user:req.session.user, wishlist:userWishlist})
    },
    addToWishlist: async (req, res) => {
        try {
            const userId = req.session.userID;
            const productId = req.params.id;
    
            const product = await products.findById(productId);
            if (!product) {
                return res.status(404).json({ message: "Product not found" });
            }
    
            let userWishlist = await Wishlist.findOne({ userId });
    
            if (!userWishlist) {
                
                const newWishlist = new Wishlist({
                    userId,
                    items: [{ product: productId }],
                });
                userWishlist = await newWishlist.save();
            } else {
                
                const existingProduct = userWishlist.items.find(item => item.product == productId);
    
                if (existingProduct) {
                    
                    return res.json({ message: 'Product already in wishlist', icon: "warning" });
                } else {
                    
                    userWishlist.items.push({ product: productId });
                    await userWishlist.save(); 
                    return res.json({ message: 'Product added to wishlist', icon: "success" });
                }
            }
        } catch (err) {
            console.error("Error adding item to wishlist:", err);
            res.status(500).json({ message: "Internal Server Error" });
        }
    },
    
    deleteWishlistProduct:async(req,res)=>{
    const id = req.params.id;

    try {
       
        const whishlistDocument = await Wishlist.findOne({ 'items._id': id });

        if (!whishlistDocument) {
            res.redirect('/wishlist');
            return;
        }

        
        await Wishlist.updateOne(
            { _id: whishlistDocument._id },
            { $pull: { items: { _id: id } } }
        );

        
        res.redirect('/wishlist');

    } catch (err) {
        console.error(err);
        res.json({ message: err.message });
    }

    }

}

module.exports = wishlistController;