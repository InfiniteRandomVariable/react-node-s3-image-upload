import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import fs from "fs";
import { v4 as uuid } from "uuid";

const s3 = new S3Client();
const BUCKET = process.env.BUCKET;
//change your S3 bucket key
// e.g. bucket/p/yourasset
//https://github.com/aws/aws-sdk-js/issues/2961
const bucket_base_path = "p";
export const imageUploaderS3 = async ({
  file_URI,
  userId,
  fileType = "image/jpg",
  extensionType = "",
  shouldDeleteLocalAsset = true,
}) => {
  //best to remove userId for better security

  try {
    const fileStream = fs.createReadStream(file_URI, function (err, data) {
      if (err) throw err;
    });

    const key = `${bucket_base_path}/${userId}/${uuid()}${extensionType}`;
    const input = {
      Bucket: BUCKET,
      Key: key,
      Body: fileStream,
      ContentType: fileType,
    };

    const isUnknownStreamSizeUpload = true;

    if (isUnknownStreamSizeUpload === true) {
      const multipartUpload = new Upload({
        client: s3,
        params: input,
      });

      await multipartUpload.done();
    } else {
      const awsPutCommand = new PutObjectCommand(input);
      await s3.send(awsPutCommand);
    }
    return { key };
  } catch (error) {
    console.log("S3 upload 5");
    console.log(error);
    return error;
  } finally {
    if (shouldDeleteLocalAsset) {
      fs.unlinkSync(file_URI, (e) => {
        console.log(e);
      });
    }
  }
};
