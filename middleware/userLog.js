const isUser = (req, res, next) => {
    try{
        if (req.session.user){
            next()
        } else {
            res.redirect('/user/signin')
        } 
    }catch(error){
        console.log(error.message);
    }    
} 


const isLogin = (req, res, next) => {
    try {
        if (req.session.user) {
            res.redirect('/')
        } else {
            next()
        }
    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    isLogin,
    isUser
}