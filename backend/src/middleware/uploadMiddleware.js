const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');
const AppError = require('../utils/appError');

let isCloudinary = false;
let uploadMemory;
let uploadLocal;

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'receipt') {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new AppError('Invalid file type! Receipts must be images or PDF files.', 400), false);
    }
  } else {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new AppError('Not an image! Please upload only images.', 400), false);
    }
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
          if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
              const isPdfField = fieldName === 'receipt';
              const errorMsg = isPdfField 
                ? 'File size exceeds limit (1MB for images, 5MB for PDFs).' 
                : 'Image size cannot exceed 1MB.';
              return next(new AppError(errorMsg, 400));
            }
            return next(err);
          }
          if (!req.file) return next();

          // Enforce custom sizes: Images 1MB, PDFs 5MB
          const isPdf = req.file.mimetype === 'application/pdf';
          const maxImgSize = 1 * 1024 * 1024;
          const maxPdfSize = 5 * 1024 * 1024;

          if (isPdf && req.file.size > maxPdfSize) {
            return next(new AppError('PDF size cannot exceed 5MB.', 400));
          } else if (!isPdf && req.file.size > maxImgSize) {
            return next(new AppError('Image size cannot exceed 1MB.', 400));
          }

          try {
            // Upload memory buffer to Cloudinary
            const uploadOptions = {
              folder: 'crm_uploads',
            };
            if (isPdf) {
              uploadOptions.resource_type = 'raw';
            } else {
              uploadOptions.allowed_formats = ['jpg', 'png', 'jpeg', 'webp'];
            }

            // Upload memory buffer to Cloudinary
            const result = await new Promise((resolve, reject) => {
              const stream = cloudinary.uploader.upload_stream(
                uploadOptions,
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
          if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
              const isPdfField = fieldName === 'receipt';
              const errorMsg = isPdfField 
                ? 'File size exceeds limit (1MB for images, 5MB for PDFs).' 
                : 'Image size cannot exceed 1MB.';
              return next(new AppError(errorMsg, 400));
            }
            return next(err);
          }
          if (!req.file) return next();

          // Enforce custom sizes: Images 1MB, PDFs 5MB
          const isPdf = req.file.mimetype === 'application/pdf';
          const maxImgSize = 1 * 1024 * 1024;
          const maxPdfSize = 5 * 1024 * 1024;

          if (isPdf && req.file.size > maxPdfSize) {
            if (fs.existsSync(req.file.path)) {
              fs.unlinkSync(req.file.path);
            }
            return next(new AppError('PDF size cannot exceed 5MB.', 400));
          } else if (!isPdf && req.file.size > maxImgSize) {
            if (fs.existsSync(req.file.path)) {
              fs.unlinkSync(req.file.path);
            }
            return next(new AppError('Image size cannot exceed 1MB.', 400));
          }

          next();
        });
      }
    };
  },
  fields: (fieldsArray) => {
    return (req, res, next) => {
      if (isCloudinary) {
        uploadMemory.fields(fieldsArray)(req, res, async (err) => {
          if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
              return next(new AppError('Image size cannot exceed 1MB.', 400));
            }
            return next(err);
          }
          if (!req.files) return next();

          try {
            for (const field of fieldsArray) {
              const files = req.files[field.name];
              if (files && files.length > 0) {
                const file = files[0];
                const maxImgSize = 1 * 1024 * 1024;
                if (file.size > maxImgSize) {
                  return next(new AppError(`${field.name} size cannot exceed 1MB.`, 400));
                }

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
                  stream.end(file.buffer);
                });

                file.path = result.secure_url;
                file.filename = result.public_id;
              }
            }
            next();
          } catch (uploadError) {
            next(uploadError);
          }
        });
      } else {
        uploadLocal.fields(fieldsArray)(req, res, (err) => {
          if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
              return next(new AppError('Image size cannot exceed 1MB.', 400));
            }
            return next(err);
          }
          if (!req.files) return next();

          for (const field of fieldsArray) {
            const files = req.files[field.name];
            if (files && files.length > 0) {
              const file = files[0];
              const maxImgSize = 1 * 1024 * 1024;
              if (file.size > maxImgSize) {
                for (const fld of fieldsArray) {
                  const fsToClean = req.files[fld.name];
                  if (fsToClean && fsToClean.length > 0 && fs.existsSync(fsToClean[0].path)) {
                    fs.unlinkSync(fsToClean[0].path);
                  }
                }
                return next(new AppError(`${field.name} size cannot exceed 1MB.`, 400));
              }
            }
          }
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
    logger.error('Error deleting file: ', err);
  }
};

module.exports = {
  upload,
  deleteFile,
  isCloudinary,
};
