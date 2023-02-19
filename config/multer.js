const path = require('path');
const multer = require('multer')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/admin/images/category'))
    },
    filename: function (req, file, cb) {
        const name = Date.now() + '-' + file.originalname;
        cb(null, name);
    }
})

const productStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/admin/images/products'))
    },
    filename: function (req, file, cb) {
        const file_extension = file.originalname.slice(
            ((file.originalname.lastIndexOf(".") - 1) >>> 0) + 2
          );
          const uniqueSuffix = `img-${
            Date.now() + Math.round(Math.random() * 1e9)
          }.${file_extension}`;
          req.thumbnail_image = uniqueSuffix;
          cb(null, uniqueSuffix);
    },
});
const fileFilter = (req, file, cb) => {
    const file_extension = file.originalname.slice(
      ((file.originalname.lastIndexOf(".") - 1) >>> 0) + 2
    );
    const array_of_allowed_files = ["png", "jpeg", "jpg", "gif"];
    const array_of_allowed_file_types = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/gif",
    ];
    if (
      array_of_allowed_files.includes(file_extension) ||
      array_of_allowed_file_types.includes(file.mimetype)
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      req.error = "Type validation failed";
    }
  };
const categoryUpload = multer({ storage: storage })
const productUpload = multer({ storage: productStorage,
    fileFilter,
 })

module.exports = {
    categoryUpload,
    productUpload
}
