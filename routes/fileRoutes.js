const express = require('express');
const upload = require('../config/multer');
const fileController = require('../controllers/fileController');
const { authenticateJWT, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Upload file (with optional authentication)
router.post('/upload', 
  optionalAuth,
  upload.single('file'), 
  fileController.uploadFile
);

// Download file (public)
router.get('/download/:uuid', 
  optionalAuth,
  fileController.downloadFile
);

// Get file info (public)
router.get('/info/:uuid', fileController.getFileInfo);

// Get user's files (requires authentication)
router.get('/my-files', authenticateJWT, fileController.getUserFiles);

// Delete file (requires authentication and ownership)
router.delete('/:uuid', authenticateJWT, fileController.deleteFile);

module.exports = router;