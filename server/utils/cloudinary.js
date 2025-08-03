const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dkidezoqx',
  api_key: '812784754584314',
  api_secret: 'S-3G9IaJXdpGV1ss0aMp57xPbao',
});

// Helper function to upload files to Cloudinary
const uploadToCloudinary = async (filePath, folder = 'general') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'auto',
      transformation: [
        { width: 800, height: 600, crop: 'fit', quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });
    return result;
  } catch (error) {
    throw error;
  }
};

module.exports = { cloudinary, uploadToCloudinary };
