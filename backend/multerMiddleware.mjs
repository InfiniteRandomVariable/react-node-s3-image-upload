//import "dotenv/config";
import { fileURLToPath } from "url";
import multer from "multer";
import fs from "fs";
import path, { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
console.log("__dirname: " + __dirname);
/*
Allow only one image to upload at a time because of simplicity and less errors and is saved on local disk for maximum stability and easily support multi files/images upload using this format. 
Not good for UX. 
*/
//save to disk and not memory for efficiency and stability
const imagePath = path.join(__dirname, "./images/");

try {
  if (!fs.existsSync(imagePath)) {
    fs.mkdirSync(imagePath, (err) => {
      throw Error(
        "Folder created but you need to be the correct owner fs.chown() and correct permission. "
      );
    });
  }
} catch {
  (e) => {
    console.log(e.message);
  };
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, imagePath);
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.replace(/.jpg|.png|.jpeg/gi, "");

    cb(null, fileName);
  },
});
const maxAllowUploadImages = 2;
const upload = multer({ storage: storage });
const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];

export const multerMiddleware = (req, res, next) => {
  // Use multer upload instance
  // the first parameter of upload array must match the FormData() name from the frontend.
  //e.g.
  //upload.array("images[]"
  //frontend FormData form.append('images[]', file);
  return upload.array("images[]", maxAllowUploadImages)(req, res, (err) => {
    console.log("req.files");
    console.log(req.files);
    if (!req.files) return res.json({ error: ErrorMessages.invalidFiletype });
    if (err) {
      console.log("line 51 " + err.message);
      console.log(err);
      return res.status(400).json({ error: err.message });
    }

    // Retrieve uploaded files
    const files = req.files;
    const errors = [];

    // Validate file types and sizes
    files.forEach((file) => {
      const maxSize = maxAllowUploadImages * 1024 * 1024; // 5MB
      console.log(file);

      if (!allowedTypes.includes(file.mimetype)) {
        errors.push(`Invalid file type: ${file.originalname}`);
      }

      if (file.size > maxSize) {
        errors.push(`File too large: ${file.originalname}`);
      }
    });

    // Handle validation errors
    if (errors.length > 0) {
      deleteAllLocalImages(files);

      return res.status(400).json({ errors });
    }

    // Attach files to the request object
    req.files = files;

    // Proceed to the next middleware or route handler
    next();
  });
};
