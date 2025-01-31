import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { pipeline } from "stream";

import util from "util";
import fs from "fs";
import { v4 as uuid } from "uuid";
import { fileTypeFromStream } from "file-type";
import sharp from "sharp"; // Import as default
const _pipeline = util.promisify(pipeline);
const s3 = new S3Client();
const BUCKET = process.env.BUCKET;
//change your S3 bucket key
// e.g. bucket/p/yourasset
//https://github.com/aws/aws-sdk-js/issues/2961

//This method can delete the asset after its task as you choose.
const bucket_base_path = "p";
export const imageUploaderS3 = async ({
  file_URI,
  userId,
  fileType,
  shouldDeleteLocalAsset = true,
  allowedTypes = ["image/jpeg", "image/png", "image/jpg"],
  resizeImageTo = 320,
}) => {
  let extensionType = ".jpg";
  const fileURIExtension = file_URI + extensionType;

  async function deleteLocalFiles() {
    if (shouldDeleteLocalAsset) {
      console.log("Deleting the local files");
      fs.unlinkSync(file_URI, (e) => {
        console.log(e);
      });

      fs.unlinkSync(fileURIExtension, (e) => {
        console.log(e);
      });
    }
  }
  //best to remove userId for better security
  async function S3UploadProcedure(key) {
    const awsFileStream = fs.createReadStream(
      fileURIExtension,
      function (err, data) {
        if (err) throw err;
      }
    );
    const input = {
      Bucket: BUCKET,
      Key: key,
      Body: awsFileStream,
      ContentType: fileType,
    };

    const isUnknownStreamSizeUpload = true;

    if (isUnknownStreamSizeUpload === true) {
      const multipartUpload = new Upload({
        client: s3,
        params: input,
      });
      //Debugging (optional)
      multipartUpload.on("httpUploadProgress", (progress) => {
        console.log("multipartUpload progress");
        console.log(progress);
      });
      await multipartUpload.done();
      await deleteLocalFiles();
    } else {
      const awsPutCommand = new PutObjectCommand(input);
      await s3.send(awsPutCommand);
    }
  }

  const key = `${bucket_base_path}/${userId}/${uuid()}${extensionType}`;
  const originalFileStream = fs.createReadStream(
    file_URI,
    function (err, data) {
      if (err) throw err;
    }
  );

  const transfomer = sharp()
    .resize({
      width: resizeImageTo,
      height: resizeImageTo,
      fit: sharp.fit.cover,
      position: sharp.strategy.entropy,
    })
    .jpeg({ mozjpeg: true });

  let writer = fs.createWriteStream(fileURIExtension);

  //Issue: thi function return without waiting for the completion of S3Upload. So the client side won't know the occured problem during the upload
  // Why use pipeline? It is fast, efficent, stable and industry standard.
  //Meaning, because of the pipeline
  // fail attempt:
  // line 1  await pipeline ...
  // line 2  await S3UploadProcedure(key) ...

  return _pipeline(originalFileStream, transfomer, writer)
    .then(() => {
      return new Promise((resolve, reject) => {
        writer.on("finish", (err) => {
          console.log("writing to s3 starting...");
          S3UploadProcedure(key);
        });
      });
    })
    .then(() => {
      console.log("returning key");
      return { key };
    })
    .catch((err) => {
      console.log(err);
      return err;
    });
};

// console.log("Before I am returning");

// console.log("I am returning");

// } catch (error) {
//   console.log(error);
//   deleteLocalFiles();
//   return error;
// }
//};
