const cron = require('node-cron');
const fs = require('fs').promises;
const path = require('path');
const File = require('../models/File');
const DownloadLog = require('../models/DownloadLog');

class CleanupService {
  constructor() {
    this.isRunning = false;
  }

  startCleanupJob() {
    const intervalHours = process.env.CLEANUP_INTERVAL_HOURS || 1;
    const cronExpression = `0 */${intervalHours} * * *`; // Every N hours
    
    console.log(`Starting cleanup job - runs every ${intervalHours} hour(s)`);
    
    cron.schedule(cronExpression, async () => {
      if (!this.isRunning) {
        await this.cleanupExpiredFiles();
      }
    });

    // Run cleanup on startup
    setTimeout(() => this.cleanupExpiredFiles(), 5000);
  }

  async cleanupExpiredFiles() {
    if (this.isRunning) {
      console.log('Cleanup already running, skipping...');
      return;
    }

    this.isRunning = true;
    console.log('Starting cleanup of expired files...');

    try {
      const now = new Date();
      
      // Find expired files
      const expiredFiles = await File.find({
        expiryTime: { $lt: now },
        isActive: true
      });

      console.log(`Found ${expiredFiles.length} expired files to cleanup`);

      let deletedFiles = 0;
      let deletedFromDisk = 0;

      for (const file of expiredFiles) {
        try {
          // Delete physical file
          const filePath = path.join(process.cwd(), file.filePath);
          
          try {
            await fs.access(filePath);
            await fs.unlink(filePath);
            deletedFromDisk++;
            console.log(`Deleted file from disk: ${file.filename}`);
          } catch (fileError) {
            console.log(`File not found on disk (already deleted?): ${file.filename}`);
          }

          // Mark file as inactive in database
          file.isActive = false;
          await file.save();
          deletedFiles++;

          // Optionally delete download logs older than 30 days
          await DownloadLog.deleteMany({
            fileId: file._id,
            timestamp: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          });

        } catch (error) {
          console.error(`Error cleaning up file ${file.filename}:`, error);
        }
      }

      console.log(`Cleanup completed: ${deletedFiles} files marked inactive, ${deletedFromDisk} files deleted from disk`);

      // Clean up old inactive file records (older than 7 days)
      const oldInactiveFiles = await File.deleteMany({
        isActive: false,
        updatedAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      });

      if (oldInactiveFiles.deletedCount > 0) {
        console.log(`Deleted ${oldInactiveFiles.deletedCount} old inactive file records`);
      }

    } catch (error) {
      console.error('Cleanup service error:', error);
    } finally {
      this.isRunning = false;
    }
  }

  async getStorageStats() {
    try {
      const activeFiles = await File.countDocuments({ isActive: true });
      const expiredFiles = await File.countDocuments({ 
        expiryTime: { $lt: new Date() },
        isActive: true 
      });
      
      const totalSize = await File.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, totalSize: { $sum: '$fileSize' } } }
      ]);

      return {
        activeFiles,
        expiredFiles,
        totalSizeBytes: totalSize[0]?.totalSize || 0,
        totalSizeMB: Math.round((totalSize[0]?.totalSize || 0) / (1024 * 1024))
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return null;
    }
  }
}

module.exports = new CleanupService();