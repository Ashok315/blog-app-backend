import multer from "multer";
import path from "path";

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/temp'); // Define the upload directory
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Define a unique filename
  }
});




// Multer setup with validation
const upload = multer({
  storage: storage,
  limits: { fileSize: 500000 }, // Max size up to 500 KB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /^jpeg|jpg|png|gif$/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      cb(null, true); // Accept the file
    } else {
      cb(new Error('Invalid file type. Only JPEG, JPG, PNG, and GIF are allowed.')); // Reject the file
    }
  },
});

// Error handling middleware
const fileValidation = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      statusCode: 400,
      message: err.message, // Multer-specific errors
    });
  } else if (err) {
    return res.status(400).json({
      statusCode: 400,
      message: err.message, // General validation errors
    });
  }
  next();
};

export { upload, fileValidation };
