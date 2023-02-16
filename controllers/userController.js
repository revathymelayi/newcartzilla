const User = require("../models/userModel");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const Order = require("../models/orderModel");
const moment = require("moment");
const Coupon = require("../models/couponModel");
const Invoice = require("../models/invoiceModel");


const isLog = require("../helper/isLog");
const { ObjectId } = require("mongodb");
const categoryModel = require("../models/categoryModel");

/* ------------------------------- Home ------------------------------ */

const userHome = async (req, res) => {
 
  try {
    const user = await isLog(req.session.user);

    const products = await Product.aggregate([
      { $match: { status: true } },
      {
        $lookup: {
          from: "categories",
          localField: "category_id",
          foreignField: "_id",
          as: "category",
        },
      },
    ]);

    res.render("home", {
      title: "Cartzilla- Home",
      headerData: user,
      categories: user.categories,
      products: products,
      cartCount: user.cartCount,
    });
  } catch (error) {
    console.log(error);
  }
};

/* ------------------------------- Serach products------------------------------ */
const searchProducts = async (req, res) => {
  try {
    const search = req.body.search;
    const showProduct = await Product.aggregate([
      {
        $match: {
          status: true,
          name: { $regex: `${search}.*`, $options: "i" },
        },
      },
    ]);

    const categories = await Category.find({ status: true }).lean();
    res.render("search-product", {
      categories: categories,
      products: showProduct,
    });
  } catch (error) {
    console.log(error);
  }
};
/* ------------------------------- show products ------------------------------ */
const showProduct= async(req,res)=>{
try{
  const categoryProducts = await Product.find({ category_id:req.params.id }).lean();
  console.log(categoryProducts)
  const categories = await Category.find({ status: true }).lean();
  res.render('product',{
    categoryProducts: categoryProducts,
    categories: categories,
  })

}
catch(error){
console.log(error)
}
}

/* ------------------------------- Product details ------------------------------ */
const productDetails = async (req, res) => {
  const products = await Product.aggregate([
    { $match: { name: req.params.productName } },
    {
      $lookup: {
        from: "categories",
        localField: "category_id",
        foreignField: "_id",
        as: "category",
      },
    },
  ]);
  const user = await isLog(req.session.user);
  res.render("productDetails", {
    title: "Cartzilla- Product Deatails",
    categories: user.categories,
    headerData: user,
    products: products,
    cartCount: user.cartCount,
  });
};

/* ------------------------------- Add to cart ------------------------------ */
const addToCart = async (req, res) => {
  try {
    if (req.session.user) {
      const addProductToCart = await User.updateOne(
        { email: req.session.user },
        {
          $addToSet: {
            cart: { productId: req.params.productId },
          },
        }
      );
      res.redirect("/cart/view");
    } else {
      res.send("error");
    }
  } catch (error) {
    console.log(error);
  }
};

/* ------------------------------- Remove item from cart ------------------------------ */
const removeItems = async (req, res) => {
  try {
    const result = await User.findOneAndUpdate(
      { email: req.session.user },
      {
        $pull: {
          cart: { productId: req.params.id },
        },
      }
    );
    res.json("success");
  } catch (error) {
    res.json("some thing went wrong");
    console.log(error.message);
  }
};

/* ------------------------------- Show cart ------------------------------ */
const showCart = async (req, res) => {
  try {
    const user = await isLog(req.session.user);

    const userCartData = await User.aggregate([
      { $match: { email: req.session.user } },
      {
        $lookup: {
          from: "products",
          let: { cartItems: "$cart" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$_id", "$$cartItems.productId"],
                },
              },
            },
          ],
          as: "Products",
        },
      },
    ]);
    const items = userCartData[0].Products;
   let btn=  items.length >=1 ? true : false
    let subtotal = 0;
    items.forEach((item) => {
      subtotal = subtotal + item.price;
    });

    res.render("cart", {
      categories: user.categories,
      headerData: user,
      items,
      subtotal: subtotal,
      cartCount: user.cartCount,
      btn:btn
    });
  } catch (error) {
    console.log(error.message);
  }
};

let Global_productid;
let Global_price;
let Global_quantity;
let Global_addressid;
let Global_total;
let Global_couponAmount;
let Global_actualAmount;



/* ------------------------------- Checkout  ------------------------------ */
const checkoutData = async (req, res) => {
  try {
    const user = await isLog(req.session.user);
    const address = await User.find({ email: req.session.user }).lean();

    const userCartData = await User.aggregate([
      { $match: { email: req.session.user } },
      {
        $lookup: {
          from: "products",
          let: { cartItems: "$cart" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$_id", "$$cartItems.productId"],
                },
              },
            },
          ],
          as: "Products",
        },
      },
    ]);
    let subtotal = 0;
    userCartData[0].Products.map((item, i) => {
      item.quantity = req.body.quantity[i];
      subtotal = subtotal + item.price * req.body.quantity[i];
    });
    res.render("checkout", {
      categories: user.categories,
      headerData: user,
      productDetails: userCartData[0].Products,
      subtotal: subtotal,
      userAddress: address[0].address,
    });
  } catch (error) {
    console.log(error);
  }
};

/* ------------------------------- place Order ------------------------------ */

const placeOrder = async (req, res) => {
  try {
    const user = await isLog(req.session.user);
    let validator = false;
    let {
      productid,
      price,
      quantity,
      addressid,
      payment_method,
      total,
      couponAmount,
      actualAmount,
    } = req.body;
    console.log(req.body);
    if (
      payment_method &&
      payment_method !== "COD" &&
      payment_method !== "Paypal"
    ) {
      res.json("please select products");
      validator = true;
    }
    if (
      !productid &&
      !price &&
      !quantity &&
      !addressid &&
      !total &&
      !couponAmount &&
      !actualAmount &&
      payment_method === "COD"
    ) {
      res.json("please select products");
      validator = true;
    }

    if (payment_method !== "COD" && !Global_productid) {
      Global_productid = productid;
      Global_price = price;
      Global_quantity = quantity;
      Global_addressid = addressid;
      Global_total = total;
      Global_couponAmount = couponAmount;
      Global_actualAmount = actualAmount;
      validator = true;
      res.json("redirect-to-payment");
    } else if (payment_method !== "COD" && Global_productid) {
      productid = Global_productid;
      price = Global_price;
      quantity = Global_quantity;
      addressid = Global_addressid;
      total = Global_total;
      couponAmount = Global_couponAmount;
      actualAmount = Global_actualAmount;
    }
    if (!validator) {
      const productDetails = await Product.find({
        _id: { $in: productid },
      });
      let product = productDetails.map((item, i) => ({
        id: item._id,
        name: item.name,
        image: item.thumbnail_image,
        amount: item.price,
        quantity: quantity[i],
      }));

      const result = Math.random().toString(36).substring(2, 7);
      const id = Math.floor(100000 + Math.random() * 900000);
      const orderId = result + id;
      const datetime = new Date().toISOString();
      const userId = await User.findOne(
        { email: req.session.user },
        { _id: 1 }
      );

      let data = {
        userId: userId._id,
        userName: req.session.user,
        product: product,
        orderId: orderId,
        date: datetime,
        status: "pending",
        payment_method: payment_method,
        addressId: addressid[0],
        total: total,
        couponAmount: couponAmount,
        actualAmount: actualAmount,
      };
      const orderPlacement = await Order.insertMany(data);

      const clearCart = await User.updateOne(
        {
          email: req.session.user,
        },
        {
          $set: {
            cart: [],
          },
        }
      );
      quantity.map(async (item, i) => {
        const reduceStock = await Product.updateOne(
          { _id: ObjectId(productid[i]) },
          {
            $inc: {
              unit: -Number(item),
            },
          }
        );
      });

      if (orderPlacement && clearCart) {
        Global_productid = "";
        Global_price = "";
        Global_quantity = "";
        Global_addressid = "";
        Global_total = "";
        Global_couponAmount = "";
        Global_actualAmount = "";
        res.json("success");
      } else {
        const handlePlacementissue = await Order.deleteMany({
          orderId: orderId,
        });
        res.json("try again");
      }
    }
  } catch (error) {
    Global_productid = "";
    Global_price = "";
    Global_quantity = "";
    Global_addressid = "";
    Global_total = "";
    Global_couponAmount = "";
    Global_actualAmount = "";
    res.json("try again");
    console.log(error);
  }
};

/* ------------------------------- Paypal ------------------------------ */

const paymentGate = async (req, res) => {
  const user = await isLog(req.session.user);

  let total = 0;
  Global_quantity.forEach((item, i) => {
    // total = total + (Number(Global_quantity[i]) * Number(Global_price[i]))-Number(Global_couponAmount)
    total = Global_total;
  });

  try {
    res.render("payment-paypal", { total });
  } catch (error) {
    console.log(error.message);
  }
};

/* ------------------------------- Redeem coupon ------------------------------ */



const redeemCoupon = async (req, res) => {
  const user = await User.findOne({ email: req.session.user }, { _id: 1 });
  const coupon = await Coupon.findOne({ code: req.body.coupon });
  const validate = await Coupon.updateOne(
    { code: req.body.coupon, date: { $gte: new Date() } },
    {
      $push: {
        user: { userId: user._id },
      },
    }
  );
  if (validate.modifiedCount)
    res.json({ success: "success", amount: coupon.discount });
  else res.json({ error: "Invalid Coupon" });
};

/* ------------------------------- Orders ------------------------------ */
const orders = async (req, res) => {
  const user = await isLog(req.session.user);
  const ordersList = await Order.find({ userId: user.user._id }).sort({ date: -1 }).lean();
  let date = moment().format("MMMM Do YYYY, h:mm:ss a");
  ordersList.forEach((item, i) => {
    item.status == "Cancelled" ? (item.cancelStatus = "yes") : "";
    item.date = moment(item.date).format("Do MMMM YYYY");
    item.totalPrice = item.product.reduce((prev, obj) => {
      obj.total = obj.amount * obj.quantity;
      return (prev = obj.amount * obj.quantity);
    }, 0);
  });

  res.render("orders", {
    orders: ordersList,
    categories: user.categories,
    headerData: user,
    cartCount: user.cartCount,
  });
};

/* ------------------------------- Cancel order ------------------------------ */
const cancelOrder = async (req, res) => {
  const cancelOrder = await Order.findOneAndUpdate(
    { _id: req.params.id },
    { $set: { status: "Cancelled" } },
    { new: true }
  );
  if (cancelOrder) {
    const products = cancelOrder.product;
    const increaseStock = products.forEach(async function (item, i) {
      await Product.updateOne(
        { _id: item.id },
        { $inc: { unit: Number(item.quantity) } }
      );
    });
    const amount = cancelOrder.total;
    const addToWallet = await User.updateOne(
      { _id: cancelOrder.userId },
      { $inc: { wallet: amount } }
    );

    res.json("success");
  } else res.json("error");
};

//wallet
const wallet = async (req, res) => {
  try {
    const userWallet = await User.find(
      { email: req.session.user },
      { wallet: 1 }
    ).lean();
    const walletTransaction = await Order.find({
      $and: [{ userId: userWallet[0]._id }, { status: "Cancelled" }],
    }).lean();
   
    walletTransaction.forEach((item) => {
      item.date = moment(item.date).format("Do MMMM YYYY");
    });
    res.render("wallet", {
      wallet: true,
      userWallet: userWallet,
      walletTransaction: walletTransaction,
    });
  } catch (error) {}
};

/* ------------------------------- Order details ------------------------------ */

const orderDetails = async (req, res) => {
  const user = await isLog(req.session.user);
  try {
    let invoice= true;
    const order = await Order.findOne({ _id: req.params.id }).lean();
    if(order.status != 'Delivered'){
      invoice = false
    }
    const products = order.product;
    const date = moment(order.date).format("Do MMMM YYYY");
    const address = await User.findOne(
      { "address.id": order.addressId },
      { _id: 0, address: { $elemMatch: { id: order.addressId } } }
    ).lean();
    res.render("orderDetails", {
      orderDetails: order,
      products: products,
      address: address.address,
      orderDate: date,
      categories: user.categories,
      headerData: user,
      cartCount: user.cartCount,
      invoice:invoice,
    });
  } catch (error) {
    console.log(error);
  }
};

//profile

/* ------------------------------- profile Settings ------------------------------ */
const profileSettings = async (req, res) => {
  try {
    const user = await isLog(req.session.user);
    res.render("profile-settings", {
      profileSettings: true,
      categories: user.categories,
      headerData: user,
      message: "",
      cartCount: user.cartCount,
    });
  } catch {
    console.log(error);
  }
};
const updateProfileSettings = async (req, res) => {
  try {
    const updateDetails = await User.findOneAndUpdate(
      { email: req.body.email },
      {
        $set: {
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          phone: req.body.phone,
        },
      }
    );
    const user = await isLog(req.session.user);
    if (updateDetails)
      res.render("profile-settings", {
        message: "Profile updated successfully !!!",
        categories: user.categories,
        headerData: user,
        profileSettings: true,
        cartCount: user.cartCount,
      });
  } catch (error) {
    console.log(error);
  }
};

/* ------------------------------- Address ------------------------------ */
const profileAddresses = async (req, res) => {
  const user = await isLog(req.session.user);
  const address = await User.find({ email: req.session.user }).lean();
  res.render("address", {
    address: true,
    categories: user.categories,
    headerData: user,
    cartCount: user.cartCount,

    userAddress: address[0].address,
  });
};

/* ------------------------------- Add address ------------------------------ */
const addAddress = async (req, res) => {
  let ts = Date.now();
  const id = Math.floor(ts / 1000);
  try {
    const user = await User.updateOne(
      { email: req.body.email },
      {
        $push: {
          address: {
            id: id,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            address1: req.body.address1,
            country: req.body.country,
            city: req.body.city,
            state: req.body.state,
            zipCode: req.body.zipCode,
            addrname: req.body.addrname,
            default: req.body.default,
          },
        },
      }
    );
    res.redirect("/profile-address");
  } catch (error) {
    console.log(error);
  }
};

/* ------------------------------- Delete Address------------------------------ */
const deleteAddress = async (req, res) => {
  try {
    const deleteAddress = await User.updateOne(
      {
        $and: [
          { email: req.session.user },
          { address: { $elemMatch: { id: req.params.id } } },
        ],
      },
      {
        $pull: {
          address: { id: req.params.id },
        },
      }
    );
    res.redirect("/profile-address");
  } catch (error) {
    console.log(error);
  }
};
/* ------------------------------- Invoice ------------------------------ */
const invoice = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.orderId }).lean();
    const products = order.product
    const invoice = await Invoice.invoice.findOne({orderId:req.params.orderId})
    // const invoiceDate = moment(invoice.date).format("Do MMMM YYYY");
    res.json({
      products :products,
      invoice :invoice,
      // invoiceDate:invoiceDate,
    })
  } catch (error) {
    console.log(error);
  }
};

/* ------------------------------- Logout ------------------------------ */

const logout = async (req, res, next) => {
  try {
    delete req.session.user;
    res.redirect("/user/signin");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  userHome,
  logout,
  productDetails,
  searchProducts,
  showProduct,
  showCart,
  profileSettings,
  updateProfileSettings,
  profileAddresses,
  addAddress,
  deleteAddress,
  addToCart,
  removeItems,
  checkoutData,
  placeOrder,
  orders,
  cancelOrder,
  invoice,
  orderDetails,
  paymentGate,
  redeemCoupon,
  wallet,
};
