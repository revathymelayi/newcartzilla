const express = require("express");
const adminRoute = express();
const logCheck = require('../middleware/adminLog')
const  { categoryUpload, productUpload } = require('../config/multer')

//importing Layouts
const hbs = require('express-handlebars')

adminRoute.engine('hbs', hbs.engine({
    extname: 'hbs',
    defaultLayout: 'admin-layout',
    layoutsDir: __dirname + '../../views/layouts/',
    partialsDir: __dirname + '../../views/partials/'
}))
adminRoute.set('views', './views/admin')
const adminController = require('../controllers/adminController')

//Home
adminRoute.get('/home', logCheck.isAdmin, adminController.adminHome)


//Category
adminRoute.get('/categories', adminController.categories)
adminRoute.get('/add/category', adminController.addCategoryView)
adminRoute.post('/add/category', categoryUpload.single('category_image'), adminController.addCategory)
adminRoute.get('/category/details/:categoryId',logCheck.isAdmin,adminController.categoryDetails)
adminRoute.put('/category/delete/:categoryId',adminController.deleteCategory)
adminRoute.post('/category/edit',categoryUpload.single('category_image'),adminController.editCategory)


//Products
const cpUpload = productUpload.fields([{ name: 'thumbnail_image', maxCount: 1 }, { name: 'product_images', maxCount: 8 }])

adminRoute.get('/products', logCheck.isAdmin, adminController.products)
adminRoute.get('/add/product', logCheck.isAdmin, adminController.addProductView)
adminRoute.post('/add/product',cpUpload,adminController.addProduct)
adminRoute.get('/product/edit/:productId',logCheck.isAdmin,adminController.editProductView)
adminRoute.post('/product/edit/:productId',cpUpload,adminController.editProduct)
adminRoute.put('/product/delete/:productId',adminController.deleteProduct)


//Orders
adminRoute.get('/orders',logCheck.isAdmin,adminController.ordersList)
adminRoute.get('/order-details/:id',logCheck.isAdmin,adminController.orderDetails)

adminRoute.put('/change/order/status/:id',logCheck.isAdmin,adminController.changeOrderStatus)
adminRoute.put('/cancel/order/:id',logCheck.isAdmin ,adminController.cancelOrder)

//User
adminRoute.get('/users',logCheck.isAdmin,adminController.users)

adminRoute.get('/user/block/:userId',logCheck.isAdmin,adminController.blockUser)

//coupon
adminRoute.get('/coupons',logCheck.isAdmin,adminController.listCoupons)
adminRoute.get('/create/coupon',logCheck.isAdmin,adminController.createCouponView)
adminRoute.post('/create/coupon',logCheck.isAdmin,adminController.createCoupon)
adminRoute.put('/coupon/activate/:id',logCheck.isAdmin,adminController.activateCoupon)
adminRoute.get('/coupon/edit/:id',logCheck.isAdmin,adminController.editCoupon)
// adminRoute.post('/coupon/update/:id',logCheck.isAdmin,adminController.updateCoupon)


//Sales Report
adminRoute.get('/top-sales/report',logCheck.isAdmin,adminController.topSalesReport)
adminRoute.get('/sales/report',logCheck.isAdmin,adminController.salesReport)

//Revenue report
adminRoute.get('/revenue/report',logCheck.isAdmin,adminController.revenueReport)
//logout
adminRoute.get('/logout',adminController.logout)

module.exports = adminRoute





