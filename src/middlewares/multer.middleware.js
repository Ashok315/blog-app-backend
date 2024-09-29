import multer from "multer";
import path from "path";

const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,"./public/temp")
    },
    filename:function(req,file,cb){
        cb(null,Date.now()+'-'+file.originalname)
    }
}) 

const upload = multer({
    storage: storage,
    limits: { fileSize: 500000 }, // max size upto 500kb
    fileFilter: (req, file, cb) => {
      // Define allowed file types
      const allowedTypes = /jpeg|jpg|png|gif/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);
  
      if (mimetype && extname) {
        return cb(null, true);
      } else {
      
        cb(new Error('Invalid file type'));
      }
    },

  });

  const fileValidation = (err, req, res, next) => {
    if (err) {
      return res.status(400).json({ 
        statusCode:400,
        message:err.message 
      });
     } else {
      next()
    }
  }
  
export {upload,fileValidation}
     