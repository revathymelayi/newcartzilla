const errorHandler =(err,req,res,next )=>{
    res.render('404',{layout:false})
    }
    module.exports = { errorHandler }