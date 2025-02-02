import "dotenv/config";
import express, { json } from "express";
import { multerMiddleware } from "./multerMiddleware.mjs";
import cors from "cors";
import fs from "fs";
import { imageUploaderS3 } from "./imageUploaderS3v1.mjs";

const app = express();
const mockImageUrls = [
  "https://mpgimg.s3.us-west-2.amazonaws.com/p/10034/662c42f1-7fff-4655-aa16-a2897a881c7d.jpg",
  "https://mpgimg.s3.us-west-2.amazonaws.com/p/10034/34575fad-e4ff-4916-9608-51e2dd934e65.jpg",
  "https://mpgimg.s3.us-west-2.amazonaws.com/p/10034/ee654ea7-3ec7-4f6b-9c37-219eaae70b4b.jpg",
  "https://mpgimg.s3.us-west-2.amazonaws.com/p/10034/7d8c0efc-735a-47e3-9f7e-326ff2ad1ec5.jpg",
  "https://mpgimg.s3.us-west-2.amazonaws.com/p/10034/632e0abf-6d9f-439f-9c0f-3748541dc514.jpg",
  "https://mpgimg.s3.us-west-2.amazonaws.com/p/10034/5ac7a5f3-ecba-4bd0-a95d-46bcc5bbfea6.jpg",
  "https://mpgimg.s3.us-west-2.amazonaws.com/p/10034/a879e43e-9e57-4b6d-a98c-d515d32487b4.jpg",
  "https://mpgimg.s3.us-west-2.amazonaws.com/p/10034/fe46edc7-bf84-45af-b336-93ba2ff44368.jpg",
  "https://mpgimg.s3.us-west-2.amazonaws.com/p/10034/6a6d58b4-aceb-4bfa-a008-d962919bec50.jpg",
];

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

app.get("/images", async (req, res) => {
  console.log("get images 1");
  const userId = req.headers["x-user-id"];

  if (!userId) return res.status(400).json({ message: "Bad request" });
  console.log("get images 2");
  const { error, presignedUrls } = {
    error: null,
    presignedUrls: mockImageUrls,
  };

  console.log("get images 3");
  if (error) return res.status(400).json({ message: error.message });

  console.log("get images 4");

  return res.json(presignedUrls);
});

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
