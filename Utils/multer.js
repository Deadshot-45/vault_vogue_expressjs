/* eslint-disable no-undef */
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

const uploadFile = () => {
  // Define the upload directory - using absolute path for reliability
  const uploadDir = path.join(process.cwd(), "public");

  // Ensure the upload directory exists
  if (!fs.existsSync(uploadDir)) {
    console.log(`Creating upload directory: ${uploadDir}`);
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Define storage configuration
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      console.log(`Setting destination to: ${uploadDir}`);
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      // Generate unique filename while preserving extension
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const fileExtension = path.extname(file.originalname).toLowerCase();

      const filename = `${uuidv4()}-${uniqueSuffix}${fileExtension}`;

      console.log(
        `Generated filename: ${filename} for original: ${file.originalname}`
      );
      cb(null, filename);
    },
  });

  // File filter to only allow image files
  const fileFilter = (req, file, cb) => {
    console.log(`Checking file type: ${file.mimetype}`);

    // List of allowed image MIME types
    const allowedMimes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ];

    if (allowedMimes.includes(file.mimetype)) {
      console.log(`File ${file.originalname} accepted as valid image`);
      cb(null, true);
    } else {
      console.log(
        `File ${file.originalname} rejected - not an allowed image type`
      );
      cb(
        new Error("Only image files (JPEG, PNG, GIF, WebP, SVG) are allowed!"),
        false
      );
    }
  };

  // Create multer instance
  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB file size limit
    },
    fileFilter: fileFilter,
  });

  return upload;
};

export default uploadFile;
