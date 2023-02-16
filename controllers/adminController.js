const Admin = require("../models/adminModel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const moment = require("moment");
const Order = require("../models/orderModel");
const Coupon = require("../models/couponModel");

// const bcrypt =require("bcrypt")

const adminLogin = async (req, res) => {
  try {
    res.render("login", { title: "Cartzilla - Login", error: "" });
  } catch (error) {
    console.log(error.message);
  }
};

const authenticate = async (req, res) => {
  try {
    let checkUser = await Admin.findOne({ email: req.body.email });

    if (checkUser) {
      req.session.admin = checkUser.email;
      res.redirect("/admin/home");
    } else {
      res.render("login", { error: "Incorrect Credential !!" });
    }
  } catch (error) {}
};

const adminHome = async (req, res) => {
  try {
    const totalRevenue = await Order.aggregate([
      { $match: { status: "Delivered" } },
      { $group: { _id: null, totalRevenue: { $sum: "$total" } } },
    ]);
    console.log( totalRevenue)
    const totalRefunds = await Order.aggregate([
      { $match: { status: "Cancelled" } },
      { $group: { _id: null, totalRefunds: { $sum: "$total" } } },
    ]);

    const totalOrders = await Order.find({}).count();

    const totalProducts = await Product.find({}).count();
    const totalUsers = await User.find({}).count();
    const categories = await Category.find({ status: true }).lean();
    const topProducts = await bestSellingProducts((limit = 3));

    const recentOrder = await Order.find({}).sort({ date: -1 }).limit(4).lean();
    recentOrder.map((item) => {
      return (item.date = moment(item.date).format("Do MMM YYYY"));
    });
    const cashOnDelivery = await Order.aggregate([
      {
        $group: {
          _id: "$payment_method",
          total: { $sum: "$total" },
        },
      },
      { $match: { _id: { $eq: "COD" } } },
      { $project: { _id: 1, total: 1 } },
    ]);

    const paypalTransaction = await Order.aggregate([
      {
        $group: {
          _id: "$payment_method",
          total: { $sum: "$total" },
        },
      },
      { $match: { _id: { $eq: "Paypal" } } },
      { $project: { _id: 1, total: 1 } },
    ]);
    const totalCouponAmount = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$couponAmount" } } },
      { $project: { _id: 0, total: 1 } },
    ]);
    res.render("dashboard", {
      totalRevenue: totalRevenue?.[0]?.totalRevenue,
      totalRefunds: totalRefunds?.[0]?.totalRefunds,
      totalOrders: totalOrders,
      totalProducts: totalProducts,
      totalUsers: totalUsers,
      categories: categories,
      topProducts: topProducts,
      recentOrder: recentOrder,
      cashOnDelivery: cashOnDelivery?.[0]?.total,
      paypalTransaction: paypalTransaction?.[0]?.total,
      totalCouponAmount: totalCouponAmount?.[0]?.total,
    });
  } catch (error) {
    console.log(error.message);
  }
};
//Best selling products
const bestSellingProducts = async (limit = 10) => {
  return await Order.aggregate([
    { $match: { status: "Delivered" } },
    { $unwind: "$product" },
    {
      $group: {
        _id: "$product.id",
        name: { $first: "$product.name" },
        image: { $first: "$product.image" },
        quantity: { $sum: "$product.quantity" },
        price: { $sum: "$product.amount" },
      },
    },
    { $sort: { quantity: -1 } },
    { $limit: limit },
    {
      $project: {
        name: 1,
        image: 1,
        quantity: 1,
        price: 1,
        total: { $multiply: ["$price", "$quantity"] },
      },
    },
  ]);
};

//topsales report
const topSalesReport = async (req, res) => {
  try {
    const topProductsReport = await bestSellingProducts();
    res.render("sales/top-sales-report", {
      topSaleProducts: topProductsReport,
    });
  } catch (error) {
    console.log(error);
  }
};

//sales report
const salesReport = async (req, res) => {
  try {
    const salesReport = await Order.find(
      {},
      {
        orderId: 1,
        userName: 1,
        status: 1,
        payment_method: 1,
        date: { $substr: ["$date", 0, 10] },
        total: 1,
      }
    ).sort({ total: 1 }).lean();
    const total = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);
    console.log(total);
    res.render("sales/sales-report", {
      salesReport: salesReport,
      total: total[0].total,
    });
  } catch (error) {
    console.log(error);
  }
};

//Revenue report
const revenueReport = async (req, res) => {
  try {
    const monthWiseRevenue = await Order.aggregate([
      { $match: { status: "Delivered" } },
      {
        $group: {
          _id: { $month: "$date" },
          count: { $sum: 1 },
          total: { $sum: "$total" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const yearWiseRevenue = await Order.aggregate([
      { $match: { status: "Delivered" } },
      {
        $group: {
          _id: { $month: "$date" },
          count: { $sum: 1 },
          total: { $sum: "$total" },
        },
      },
      { $sort: { _id: -1 } },
    ]);
    console.log(yearWiseRevenue);
    const categoryRevenue = await Order.aggregate([
      { $unwind: "$product" },
      {
        $lookup: {
          from: "products",
          localField: "product.id",
          foreignField: "_id",
          as: "productCategory",
        },
      },
      {
        $group: {
          _id: "$productCategory.category_id",
          total: { $sum: "$total" },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "categories",
        },
      },
      { $project: { _id: 1, total: 1, categories: { name: 1 } } },
      { $sort: { _id: -1 } },
    ]);
    const categories = await Category.find(
      { status: true },
      { name: 1 }
    ).lean();
    categories.forEach((item) => {
      categoryRevenue.forEach((obj) => {
        if (item.name == obj.categories[0].name) {
          Object.assign(item, { total: obj.total });
        }
      });
    });
    console.log(categoryRevenue)
    categories.forEach((item) => {
      if (!item.total) {
        item.total = 0;
      }
    });
    res.json({
      monthWiseRevenue: monthWiseRevenue,
      yearWiseRevenue: yearWiseRevenue,
      categoryRevenue: categories,
    });
  } catch (error) {
    console.log(error);
  }
};

//category
const categories = async (req, res) => {
  try {
    const categoryList = await Category.find({ status: true }).lean();
    res.render("category/categories", {
      title: "Category",
      category: categoryList,
    });
  } catch (error) {
    console.log(error.message);
  }
};
const addCategoryView = async (req, res) => {
  try {
    res.render("category/addCategory");
  } catch (error) {
    console.log(error.message);
  }
};
const addCategory = async (req, res) => {
  try {
    // const category = await Category.findOne({ name: req.body.name });
    const category = await Category.findOne({ name: { $regex: `${req.body.name}.*`, $options: "i" } });
    if (!category) {
      req.body.image = req.file.filename;
      req.body.status = 1;
      const newCategory = await Category.insertMany(req.body);
      res.redirect("/admin/categories");
    } else {
      res.render("category/addCategory", { error: "Category already exist" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const categoryDetails = async (req, res) => {
  try {
    const categoryDetails = await Category.findOne({
      _id: req.params.categoryId,
    });
    res.send(categoryDetails);
  } catch (error) {
    console.log(error.message);
  }
};

const editCategory = async (req, res) => {
  try {
    let imageName = "";
    if (req.file) {
      imageName = req.file.filename;
    } else {
      imageName = req.body.image;
    }
    let updateCategory = await Category.updateOne(
      { _id: req.body.categoryId },
      {
        $set: {
          name: req.body.name,
          image: imageName,
          offer: req.body.offer,
        },
      }
    );
    if (updateCategory) {
      res.redirect("/admin/categories");
    }
  } catch (error) {
    console.log(error.message);
  }
};
const deleteCategory = async (req, res) => {
  try {
    const deleteCategory = await Category.findOneAndUpdate(
      { _id: req.params.categoryId },
      { $set: { status: false } }
    );
    if (deleteCategory) res.send("success");
    else res.send("error");
  } catch (error) {
    console.log(error.message);
  }
};

//product
const products = async (req, res) => {
  try {
    const productList = await Product.aggregate([
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
    res.render("product/products", { products: productList });
  } catch (error) {
    console.log(error.message);
  }
};
const addProductView = async (req, res) => {
  try {
    const categories = await Category.find({}).lean();
    res.render("product/addProduct", {
      title: "Products",
      categories: categories,
    });
  } catch (error) {
    console.log(error.message);
  }
};

// const addProduct = async (req, res) => {
//     try {
//         if (req.file) {
//             req.body.thumbnail_image = req.file.filename
//         }
//         req.body.status = 1
//         const newProduct = await Product.insertMany(req.body)
//         res.redirect('/admin/products')
//     } catch (error) {
//         console.log(error.message);
//     }
// }
const addProduct = async (req, res) => {
  try {
    console.log(req.body);
    const thumbnail = req.files.thumbnail_image;
    req.body.images = req.files.product_images.map(function (obj) {
      return obj.filename;
    });
    if (thumbnail) {
      req.body.thumbnail_image = thumbnail[0].filename;
    }
    req.body.status = 1;
    const newProduct = await Product.insertMany(req.body);

    res.redirect("/admin/products");
  } catch (error) {
    console.log(error.message);
  }
};

const editProductView = async (req, res) => {
  try {
    const productDetails = await Product.findOne({
      _id: req.params.productId,
    }).lean();
    const categories = await Category.find({ status: true }).lean();
    res.render("product/editProduct", {
      title: "Edit Product",
      productDetails: productDetails,
      categories: categories,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const editProduct = async (req, res) => {
  try {
    if (req.files.product_images) {
      req.body.images = req.files.product_images.map(function (obj) {
        return obj.filename;
      });
    }
    if (req.files.thumbnail_image) {
      const thumbnail = req.files.thumbnail_image;
      req.body.thumbnail_image = req.file.filename;
    }
    const updateProduct = await Product.findOneAndUpdate(
      { _id: req.params.productId },
      {
        $set: {
          name: req.body.name,
          category_id: req.body.category_id,
          price: req.body.price,
          unit: req.body.unit,
          quantity: req.body.quantity,
          images: req.body.images,
          description: req.body.description,
          thumbnail_image: req.body.thumbnail_image,
        },
      }
    );
    res.redirect("/admin/products");
  } catch (error) {
    console.log(error.message);
  }
};
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.productId },
      { $set: { status: false } }
    );
    if (product) res.send("success");
    else res.send("error");
  } catch (error) {}
};
//users
const users = async (req, res) => {
  try {
    const usersList = await User.find({}).lean();
    res.render("user/users", { users: usersList });
  } catch (error) {
    console.log(error.message);
  }
};

const blockUser = async (req, res) => {
  try {
    const userInfo = await User.findOne({ _id: req.params.userId }).then(
      async (data, err) => {
        if (data.status) {
          const user = await User.findOneAndUpdate(
            { _id: req.params.userId },
            { $set: { status: false } }
          );
        } else {
          const user = await User.findOneAndUpdate(
            { _id: req.params.userId },
            { $set: { status: true } }
          );
        }
        res.send("success");
      }
    );
  } catch (error) {
    console.log(error.message);
  }
};
const deleteUser = async (req, res) => {
  try {
    const product = Product.findOneAndUpdate(
      { _id: userId },
      { $set: { status: 0 } }
    );
  } catch (error) {}
};
//order
const ordersList = async (req, res) => {
  const ordersList = await Order.find({}).sort({ date: -1 }).lean();
  ordersList.forEach((item, i) => {
    item.status == "Cancelled" ? (item.cancelStatus = "yes") : "";
    item.date = moment(item.date).format("Do MMM YYYY");
  });
  res.render("order/orders", { title: "Orders", ordersList: ordersList });
};

//order Details
const orderDetails = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id }).lean();
    const date = moment(order.date).format("MMMM Do YYYY, h:mm a");
    const products = order.product;

    const address = await User.findOne(
      { "address.id": order.addressId },
      { _id: 0, address: { $elemMatch: { id: order.addressId } } }
    ).lean();
    const total = order.total_amount + order.couponAmount;
    res.render("order/orderDetails", {
      orderDetails: order,
      address: address.address,
      products: products,
      orderDate: date,
    });
  } catch (error) {
    console.log(error);
  }
};
//cancel order
const cancelOrder = async (req, res) => {
  const cancelOrder = await Order.findOneAndUpdate(
    { _id: req.params.id },
    { $set: { status: "Cancelled" } },
    { new: true }
  );
  if (cancelOrder) {
    const products = cancelOrder.product;
    const incrementQuantity = products.forEach(async function (item, i) {
      await Product.findByIdAndUpdate(item.id, {
        $inc: { quantity: item.quantity },
      });
    });
    const amount = cancelOrder.total_amount;
    const addToWallet = await User.updateOne(
      { _id: cancelOrder.userId },
      { $inc: { wallet: amount } }
    );
    res.json("success");
  } else res.json("error");
};

//status order
const changeOrderStatus = async (req, res) => {
  try {
    const updateStatus = await Order.updateOne(
      { _id: req.params.id },
      { $set: { status: req.body.status } }
    );
    if (updateStatus) {
      res.json("success");
    }
  } catch (error) {
    console.log(error);
  }
};
//coupon list
const listCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
    ]);
    const categories = await Category.find({ status: true }).lean();
    res.render("coupon/listCoupon", {
      coupons: coupons,
      categories: categories,
      message: "",
    });
  } catch (error) {
    console.log(error);
  }
};
//Create coupon
const createCoupon = async (req, res) => {
  try {
    const checkCouponCode = await Coupon.find({ code: req.body.code });
    console.log(checkCouponCode);
    if (checkCouponCode.length == 0) {
      if (req.body.status) req.body.status = true;
      else req.body.status = false;
      const addCoupon = await Coupon.insertMany(req.body);
      if (addCoupon) res.redirect("/admin/coupons");
    } else {
      res.render("coupon/addCoupon", {
        error: "Coupon Code already exists !!",
      });
    }
  } catch (error) {
    console.log(error);
  }
};
//create Coupon view
const createCouponView = async (req, res) => {
  try {
    const categories = await Category.find({ status: true }).lean();
    const coupons = await Coupon.find().lean();
    res.render("coupon/addCoupon", {
      categories: categories,
      coupons: coupons,
    });
  } catch (error) {
    console.log(error);
  }
};
//coupon activate/deactivate
const activateCoupon = async (req, res) => {
  try {
    const updateCouponStatus = await Coupon.findById(req.params.id);
    if (updateCouponStatus.status == true) {
      await Coupon.findByIdAndUpdate(req.params.id, { status: false });
    } else {
      await Coupon.findByIdAndUpdate(req.params.id, { status: true });
    }
    res.send("success");
  } catch (error) {
    console.log(error);
  }
};
//Edit coupon
const editCoupon = async (req, res) => {
  try {
    const editCoupon = await Coupon.findById(req.params.id).lean();
    if (editCoupon) {
      res.json({ editCoupon: editCoupon });
    }
  } catch (error) {
    console.log(error);
  }
};

//  //dashboard
//  const dashBoard =async(req,res)=>{
//   try{
//     res.render('dashboard/dashboard')
//   }
//   catch(error){
//     console.log(error.message)
//   }
//  }

//logout
const logout = async (req, res, next) => {
  try {
    delete req.session.admin;
    res.redirect("/admin/login");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  adminLogin,
  authenticate,
  adminHome,
  categories,
  addCategoryView,
  addCategory,
  categoryDetails,
  editCategory,
  deleteCategory,
  products,
  addProductView,
  addProduct,
  editProductView,
  editProduct,
  deleteProduct,
  users,
  blockUser,
  deleteUser,
  ordersList,
  orderDetails,
  cancelOrder,
  changeOrderStatus,
  listCoupons,
  createCoupon,
  createCouponView,
  activateCoupon,
  editCoupon,
  topSalesReport,
  salesReport,
  revenueReport,
  logout,
};
