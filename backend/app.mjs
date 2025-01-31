import "dotenv/config";
import express, { json } from "express";
import { multerMiddleware } from "./multerMiddleware.mjs";
import cors from "cors";
import fs from "fs";
import { imageUploaderS3 } from "./imageUploaderS3v1.mjs";

const app = express();

const PORT = process.env.PORT || 4000;

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

app.post("/images", multerMiddleware, async function (req, res) {
  const files = req.files;

  //after successful upload to the asset and it should be deleted and save the URI to database.
  let keys = [];
  try {
    if (files && files.length > 0) {
      for await (const theFile of files) {
        const file_URI = `${theFile.path}`;
        const userId = 10034;
        const fileType = `${theFile.mimetype}`;

        const { error, key } = await imageUploaderS3({
          file_URI,
          userId,
          fileType,
        });
        console.log("for loop await");
        keys.push(key);
        if (error) {
          throw error;
        }
      }
    }
  } catch (err) {
    deleteAllLocalImages(files);
    console.log("Error message - " + err.message);
    return res.status(500).json(err);
  }

  res.status(200).json({ keys });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
