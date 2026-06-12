const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const fs = require('fs');

let isCloudinary = false;
let uploadMemory;
let uploadLocal;

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

const uploadDir = path.join(__dirname, '../../public/uploads');

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  // Configure Cloudinary
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // Use memory storage for direct streaming to Cloudinary
  uploadMemory = multer({
    storage: multer.memoryStorage(),
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  });
  
  isCloudinary = true;
} else {
  // Local storage fallback setup
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  uploadLocal = multer({
    storage: multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, uploadDir);
      },
      filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      },
    }),
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  });
}

// Custom wrapper mimicking multer uploader API
const upload = {
  single: (fieldName) => {
    return (req, res, next) => {
      if (isCloudinary) {
        uploadMemory.single(fieldName)(req, res, async (err) => {
          if (err) return next(err);
          if (!req.file) return next();

          try {
            // Upload memory buffer to Cloudinary
            const result = await new Promise((resolve, reject) => {
              const stream = cloudinary.uploader.upload_stream(
                {
                  folder: 'crm_uploads',
                  allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
                },
                (error, uploadResult) => {
                  if (error) reject(error);
                  else resolve(uploadResult);
                }
              );
              stream.end(req.file.buffer);
            });

            // Format req.file to match multer-storage-cloudinary fields
            req.file.path = result.secure_url;
            req.file.filename = result.public_id;
            next();
          } catch (uploadError) {
            next(uploadError);
          }
        });
      } else {
        uploadLocal.single(fieldName)(req, res, (err) => {
          if (err) return next(err);
          next();
        });
      }
    };
  }
};

// Helper to delete files from Cloudinary or local disk
const deleteFile = async (urlOrPath, publicId = '') => {
  if (!urlOrPath) return;

  try {
    if (isCloudinary && publicId) {
      await cloudinary.uploader.destroy(publicId);
    } else {
      // Local file delete
      const filename = path.basename(urlOrPath);
      const filePath = path.join(uploadDir, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  } catch (err) {
    console.error('Error deleting file: ', err);
  }
};

module.exports = {
  upload,
  deleteFile,
  isCloudinary,
};
