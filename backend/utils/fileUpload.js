const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// Upload file to Cloudinary
exports.uploadToCloudinary = (fileBuffer, folder = 'nmep') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

// Delete file from Cloudinary
exports.deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

// Upload multiple files
exports.uploadMultipleToCloudinary = async (files, folder = 'nmep') => {
  const uploadPromises = files.map(file => 
    this.uploadToCloudinary(file.buffer, folder)
  );
  return Promise.all(uploadPromises);
};
