const admin = (req,res,next) => {
    if(req.session.admin){
        next()
    }else{
        res.redirect("/adminLogin")
    }
}

module.exports = admin