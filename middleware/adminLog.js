const isAdmin        = (req,res,next)=>{
    try{
        if(req.session.admin)
            next()
        else
            res.redirect('/admin/login')
    }catch(error){
        console.log(error);
    }
}

const isAdminLogin   = (req,res,next)=>{
    try{
        if(req.session.admin)
            res.redirect('/admin/home')
        else
            next()
    }catch(error){
        console.log(error);
    }
}

module.exports = {
    isAdmin,
    isAdminLogin
    
}