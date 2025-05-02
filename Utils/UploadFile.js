import multer from "multer";
import uuid from "uuid";

let UploadFile = () => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "public");
    },
    filename: (req, file, cb) => {
      cb(null, `${uuid.v4()}-${file.originalname}`);
    },
  });
  const fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      cb(null, true);
    } else {
      cb(
        new Error("Invalid file type. Only JPEG and PNG files are allowed."),
        false
      );
    }
  };
  const errorHandler = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({
          message:
            "Unexpected field. Please check the field names in your request.",
        });
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(500).json({ message: err.message });
    }
    next();
  };
  const fields = [
    { name: "image", maxCount: 5 },
    { name: "document", maxCount: 1 },
  ];
  return multer({
    storage: storage,
    fileFilter: fileFilter,
    errorHandler: errorHandler,
    fields: fields,
  });
};

export default UploadFile;
