import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter for documents (resume)
const documentFileFilter = (req, file, cb) => {
    const allowedMimes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only PDF and Word documents are allowed."));
    }
};

// File filter for images (profile picture)
const imageFileFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only JPG, PNG, GIF, and WebP images are allowed."));
    }
};

// Configure multer for documents
const upload = multer({
    storage: storage,
    fileFilter: documentFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

// Configure multer for images
const uploadImage = multer({
    storage: storage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

export default upload;
export { uploadImage };
