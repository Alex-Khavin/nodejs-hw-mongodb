// import 'dotenv/config';
import cloudinary from 'cloudinary';
// import { CLOUDINARY } from '../constants/index.js';

const { CLOUD_NAME, API_KEY, API_SECRET } = process.env;

cloudinary.v2.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
});

export const uploadToCloudinary = (filepath) => {
  return cloudinary.v2.uploader.upload(filepath);
};
