const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendFileLink(receiverEmail, senderEmail, filename, downloadLink, expiryTime) {
    try {
      const mailOptions = {
        from: `"File Sharing App" <${process.env.SMTP_USER}>`,
        to: receiverEmail,
        subject: `${senderEmail ? senderEmail + ' has' : 'Someone has'} shared a file with you`,
        html: this.generateEmailTemplate(senderEmail, filename, downloadLink, expiryTime)
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      
      // For Ethereal Email, log the preview URL
      if (process.env.SMTP_HOST === 'smtp.ethereal.email') {
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
      }
      
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  generateEmailTemplate(senderEmail, filename, downloadLink, expiryTime) {
    const senderText = senderEmail ? `${senderEmail} has` : 'Someone has';
    const expiryDate = new Date(expiryTime).toLocaleString();
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>File Shared With You</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #007bff; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 5px 5px; }
          .download-btn { display: inline-block; background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .expiry-info { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📁 File Shared With You</h1>
          </div>
          <div class="content">
            <p><strong>${senderText} shared a file with you:</strong></p>
            <p><strong>File:</strong> ${filename}</p>
            
            <div style="text-align: center;">
              <a href="${downloadLink}" class="download-btn">Download File</a>
            </div>
            
            <div class="expiry-info">
              <strong>⏰ Important:</strong> This link will expire on <strong>${expiryDate}</strong>
            </div>
            
            <p><strong>Download Link:</strong><br>
            <a href="${downloadLink}">${downloadLink}</a></p>
            
            <p><em>This is an automated message from File Sharing App. Please do not reply to this email.</em></p>
          </div>
          <div class="footer">
            <p>Powered by File Sharing App</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('SMTP connection is ready');
      return true;
    } catch (error) {
      console.error('SMTP connection failed:', error);
      return false;
    }
  }
}

module.exports = new EmailService();