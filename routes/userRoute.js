const express = require("express");
const userRoute = express();
const logCheck = require("../middleware/userLog");
const session = require("../config/session");
userRoute.use(session);
//Layouts

const hbs = require("express-handlebars");
userRoute.engine(
  "hbs",
  hbs.engine({
    extname: "hbs",
    defaultLayout: "layout",
    layoutsDir: __dirname + "../../views/layouts/",
    partialsDir: __dirname + "../../views/partials",
  })
);
userRoute.set("views", "./views/user");
const userController = require("../controllers/userController");
//userhome
userRoute.get("/", userController.userHome);
userRoute.get("/product/:productName/:productId",userController.productDetails);
userRoute.get('/category/:name/:id' , userController.showProduct)


//Cart
userRoute.get("/cart/view", logCheck.isUser, userController.showCart);
userRoute.post( "/product/:productName/:productId", logCheck.isUser,userController.addToCart);
userRoute.delete("/cart/remove/:id",logCheck.isUser,userController.removeItems);

//checkout
userRoute.post("/proceed-checkout",logCheck.isUser,userController.checkoutData);
userRoute.get("/payment-gateway",logCheck.isUser,userController.paymentGate);


//orders
userRoute.get("/orders",logCheck.isUser, userController.orders);
userRoute.post("/place-order", logCheck.isUser, userController.placeOrder);

userRoute.get('/orders/details/:id' ,logCheck.isUser,userController.orderDetails);
userRoute.put('/cancel/order/:id',logCheck.isUser ,userController.cancelOrder)
userRoute.post('/product/search',userController.searchProducts)

//profile
userRoute.get("/profile-settings",logCheck.isUser,userController.profileSettings);
userRoute.post("/profile-settings", logCheck.isUser,userController.updateProfileSettings);
userRoute.get("/profile-address",logCheck.isUser,userController.profileAddresses);
userRoute.get("/address/delete/:id",logCheck.isUser,userController.deleteAddress);
userRoute.post("/add/address", logCheck.isUser, userController.addAddress);
//coupon
userRoute.put('/redeem-coupon',logCheck.isUser,userController.redeemCoupon)
//wallet
userRoute.get('/wallet',logCheck.isUser,userController.wallet)

//Invoice
userRoute.put('/download/invoice/:orderId',logCheck.isUser,userController.invoice)

//Checkout
// userRoute.get("/checkout", logCheck.isUser, userController.checkoutDetails);

//Logout
userRoute.get("/signout", userController.logout);
module.exports = userRoute;
