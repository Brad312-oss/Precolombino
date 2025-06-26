// backend/middleware/uploadMiddleware.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configuración del almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/productos';
    fs.mkdirSync(dir, { recursive: true }); // ✅ crea carpeta si no existe
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

export const upload = multer({ storage });