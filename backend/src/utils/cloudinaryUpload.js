import dotenv from 'dotenv';

dotenv.config();

export const uploadToCloudinary = async () => {
  throw new Error('Cloudinary support removed. Use local uploads instead.');
};

export const deleteFromCloudinary = async () => {
  throw new Error('Cloudinary support removed.');
};
