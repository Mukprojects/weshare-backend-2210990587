const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const path = require('path');
const fs = require('fs');
const File = require('../models/File');
const DownloadLog = require('../models/DownloadLog');
const emailService = require('../services/emailService');

class FileController {
  // Upload file
  async uploadFile(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const { senderEmail, receiverEmail } = req.body;
      const fileUuid = uuidv4();
      const expiryHours = parseInt(process.env.FILE_EXPIRY_HOURS) || 24;
      const expiryTime = moment().add(expiryHours, 'hours').toDate();

      // Create file record
      const fileRecord = new File({
        uuid: fileUuid,
        filename: req.file.filename,
        originalName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        expiryTime: expiryTime,
        senderEmail: senderEmail || null,
        receiverEmail: receiverEmail || null,
        createdBy: req.user ? req.user._id : null
      });

      await fileRecord.save();

      // Generate download link - use request host if APP_URL not set
      const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
      const downloadLink = `${baseUrl}/api/files/download/${fileUuid}`;

      console.log('Generated download link:', downloadLink);

      // Send email if receiver email is provided
      let emailSent = false;
      if (receiverEmail) {
        const emailResult = await emailService.sendFileLink(
          receiverEmail,
          senderEmail,
          req.file.originalname,
          downloadLink,
          expiryTime
        );
        emailSent = emailResult.success;
      }

      res.status(201).json({
        success: true,
        message: 'File uploaded successfully',
        data: {
          uuid: fileUuid,
          filename: req.file.originalname,
          fileSize: req.file.size,
          downloadLink: downloadLink,
          expiryTime: expiryTime,
          emailSent: emailSent
        }
      });

    } catch (error) {
      console.error('Upload error:', error);

      // Clean up uploaded file if database save failed
      if (req.file && req.file.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error('Error deleting uploaded file:', unlinkError);
        }
      }

      res.status(500).json({ error: 'Upload failed' });
    }
  }

  // Download file
  async downloadFile(req, res) {
    try {
      const { uuid } = req.params;

      const file = await File.findOne({ uuid, isActive: true });

      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }

      // Check if file is expired
      if (file.isExpired) {
        return res.status(410).json({
          error: 'File has expired',
          expiredAt: file.expiryTime
        });
      }

      // Check if physical file exists
      const filePath = path.resolve(file.filePath);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found on server' });
      }

      // Log download
      const downloadLog = new DownloadLog({
        fileId: file._id,
        fileUuid: uuid,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        userId: req.user ? req.user._id : null
      });

      await downloadLog.save();

      // Increment download count
      await file.incrementDownload();

      // Set headers for file download
      res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
      res.setHeader('Content-Type', file.mimeType);
      res.setHeader('Content-Length', file.fileSize);

      // Stream file to response
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

    } catch (error) {
      console.error('Download error:', error);
      res.status(500).json({ error: 'Download failed' });
    }
  }

  // Get file info
  async getFileInfo(req, res) {
    try {
      const { uuid } = req.params;

      const file = await File.findOne({ uuid, isActive: true })
        .select('-filePath -createdBy')
        .lean();

      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }

      // Add computed fields
      file.isExpired = new Date() > new Date(file.expiryTime);
      file.timeRemaining = file.isExpired ? 0 : new Date(file.expiryTime) - new Date();

      res.json({
        success: true,
        data: file
      });

    } catch (error) {
      console.error('Get file info error:', error);
      res.status(500).json({ error: 'Failed to get file info' });
    }
  }

  // Get user's uploaded files (requires auth)
  async getUserFiles(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const files = await File.find({
        createdBy: req.user._id,
        isActive: true
      })
        .select('-filePath')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await File.countDocuments({
        createdBy: req.user._id,
        isActive: true
      });

      // Add computed fields
      files.forEach(file => {
        file.isExpired = new Date() > new Date(file.expiryTime);
        file.downloadLink = `${process.env.APP_URL}/api/files/download/${file.uuid}`;
      });

      res.json({
        success: true,
        data: {
          files,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      console.error('Get user files error:', error);
      res.status(500).json({ error: 'Failed to get files' });
    }
  }

  // Delete file (requires auth and ownership)
  async deleteFile(req, res) {
    try {
      const { uuid } = req.params;

      const file = await File.findOne({
        uuid,
        createdBy: req.user._id,
        isActive: true
      });

      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }

      // Delete physical file
      try {
        if (fs.existsSync(file.filePath)) {
          fs.unlinkSync(file.filePath);
        }
      } catch (unlinkError) {
        console.error('Error deleting physical file:', unlinkError);
      }

      // Mark as inactive
      file.isActive = false;
      await file.save();

      res.json({
        success: true,
        message: 'File deleted successfully'
      });

    } catch (error) {
      console.error('Delete file error:', error);
      res.status(500).json({ error: 'Failed to delete file' });
    }
  }
}

module.exports = new FileController();