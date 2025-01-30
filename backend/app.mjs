import "dotenv/config";
import express, { json } from "express";
import { multerMiddleware } from "./multerMiddleware.mjs";
import cors from "cors";
import fs from "fs";
import { imageUploaderS3 } from "./imageUploaderS3.mjs";
//const __filename = fileURLToPath(import.meta.url);
//const __dirname = dirname(__filename);
//console.log("__dirname: " + __dirname);
const app = express();

const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST;
const frontendURL = process.env.FRONTEND_URL;

const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
function deleteAllLocalImages({ files }) {
  if (files && Array.isArray(files) && files.length > 0)
    files.forEach((file) => {
      if (file && file.path) {
        fs.unlinkSync(file.path).catch((e) => {
          console.log(e);
        });
      }
    });
}

app.use(
  cors({
    origin: "*",
  })
);
app.use(json());

app.get("/", (req, res) => res.send("success"));

app.post("/images", multerMiddleware, (req, res) => {
  const files = req.files;

  //after successful upload to the asset and it should be deleted and save the URI to database.
  let keys = [];
  try {
    if (files && files.length > 0) {
      files.forEach((theFile) => {
        const file_URI = `${theFile.path}`;
        const userId = 10034;
        const fileType = `${theFile.mimetype}`;
        const matchImageTypeIndex = allowedTypes.indexOf(fileType);
        let extensionType = "";
        if (matchImageTypeIndex !== -1) {
          //get file extension type
          const theExtensionStr = allowedTypes[matchImageTypeIndex];
          const isPng = theExtensionStr.includes("png");
          extensionType = isPng ? ".png" : ".jpg";
        } else {
          throw Error("Must be a valid file type " + allowedTypes);
        }
        const { error, key } = imageUploaderS3({
          file_URI,
          userId,
          fileType,
          extensionType,
        });
        keys.append(key);
        if (error) {
          console.log("about to call upload to S3 error 5");
          throw error;
        }
      });
    }
  } catch (err) {
    deleteAllLocalImages(files);
    return res.status(500).json(err);
  }

  res.status(200).json({ keys });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
