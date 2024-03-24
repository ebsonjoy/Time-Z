require("dotenv").config();
const Address = require('../models/address');


const addressController = {
    myAddress: async (req, res) => {
        try {
            const userId = req.session.userID;
            const address = await Address.findOne({ userId: userId });
    
            if (address) {
                
                res.render("users/myAddress", { user: req.session.user, address: [address] });
            } else {
               
                res.render("users/myAddress", { user: req.session.user, address: null });
            }
        } catch (error) {
            console.error("Error fetching address:", error);
           
            res.status(500).send("Internal Server Error");
        }
    },
    addAddress:async(req,res)=>{
        const userId = req.session.userID
        // const data = await Address.findById({ userId:userId  });
        res.render("users/addAddress",{ user:req.session.user})
    },
    addressPost: async (req, res) => {
        try {
            const userId = req.session.userID;
            const newAddress = { ...req.body };
            
            let userAddress = await Address.findOne({ userId: userId });
    
            if (!userAddress) {
                userAddress = new Address({ userId: userId, addressDetails: [] });
            }
    
            userAddress.addressDetails.push(newAddress);
            await userAddress.save();
    
            req.session.message = {
                type: "success",
                message: "Address Added Successfully!",
            };
            res.redirect("/myAddress");
        } catch (error) {
            console.error("Error adding Address:", error);
            res.status(500).json({ message: "Server Error" });
        }
    },
    editAddress: async (req, res) => {
        try {
            const id = req.params.id;
            const addressDocument = await Address.findOne({ 'addressDetails._id': id });
            
            if (!addressDocument) {
                res.redirect('/myAddress');
                return;
            }
            
            const address = addressDocument.addressDetails.find(address => address._id.toString() === id);
            
            res.render("users/editAddress", { user: req.session.user, address: address });
        } catch (err) {
            console.error(err);
            res.json({ message: err.message, type: "danger" });
        }
    },
    updateAddressPost: async (req, res) => {
        const id = req.params.id;
        try {
            const addressDocument = await Address.findOne({ 'addressDetails._id': id });
            
            if (!addressDocument) {
                res.redirect('/myAddress');
                return;
            }
            
            // Find the index of the address to update in the addressDetails array
            const addressIndex = addressDocument.addressDetails.findIndex(address => address._id.toString() === id);
            
            // Update the address details at the found index
            addressDocument.addressDetails[addressIndex].address = req.body.address;
            addressDocument.addressDetails[addressIndex].street = req.body.street;
            addressDocument.addressDetails[addressIndex].city = req.body.city;
            addressDocument.addressDetails[addressIndex].state = req.body.state;
            addressDocument.addressDetails[addressIndex].zip = req.body.zip;
            addressDocument.addressDetails[addressIndex].country = req.body.country;
    
            // Save the updated document
            await addressDocument.save();
    
            res.redirect('/myAddress');
        } catch (err) {
            console.error(err);
            res.json({ message: err.message, type: "danger" });
        }
    },
    deleteAddress: async(req,res)=>{
        const id = req.params.id;

        try{
            // Find the document containing the address details
              const addressDocument = await Address.findOne({ 'addressDetails._id': id });

             if (!addressDocument) {
             res.redirect('/myAddress');
               return;
              }

          // Use $pull to remove the matching address from the addressDetails array
             await Address.updateOne(
               { _id: addressDocument._id },
               { $pull: { addressDetails: { _id: id } } }
           );

          // After deleting the address, you might want to redirect the user to a different page
                  res.redirect('/myAddress');

        }catch(err){
            console.error(err);
        res.json({message : err.message});
        }
        
    },addressAddCheckOut:async(req,res)=>{
        // const userId = req.session.userID
        // const data = await Address.findById({ userId:userId  });
        res.render("users/addAddressCheckOut",{ user:req.session.user})
    },



    addressSubmitCheckOut:async (req, res) => {
        try {
            const userId = req.session.userID;
            const newAddress = { ...req.body };
            
            let userAddress = await Address.findOne({ userId: userId });
    
            if (!userAddress) {
                userAddress = new Address({ userId: userId, addressDetails: [] });
            }
    
            userAddress.addressDetails.push(newAddress);
            await userAddress.save();
    
            req.session.message = {
                type: "success",
                message: "Address Added Successfully!",
            };
            res.redirect("/checkOut");
        } catch (error) {
            console.error("Error adding Address:", error);
            res.status(500).json({ message: "Server Error" });
        }
    },
}

module.exports = addressController;