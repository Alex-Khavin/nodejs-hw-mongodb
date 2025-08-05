import cloudinary from 'cloudinary';
import { CLOUDINARY } from '../constants/index.js';

// const { CLOUD_NAME, API_KEY, API_SECRET } = process.env;

cloudinary.v2.config({
  cloud_name: CLOUDINARY.CLOUD_NAME,
  api_key: CLOUDINARY.API_KEY,
  api_secret: CLOUDINARY.API_SECRET,
});

export const uploadToCloudinary = (filepath) => {
  return cloudinary.v2.uploader.upload(filepath);
};
