import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Certificate from '../models/certificate.js';
import Settings from '../models/settings.js';
import { verifyAdmin } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads/certificates');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Upload certificate (admin only)
router.post('/upload', verifyAdmin, async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: 'ไม่พบไฟล์ที่อัปโหลด' });
    }

    const uploadedCertificates = [];
    const errors = [];

    // Handle single or multiple files
    const files = Array.isArray(req.files.certificates) 
      ? req.files.certificates 
      : [req.files.certificates];

    for (const file of files) {
      try {
        // Validate file type (PDF, PNG, JPG)
        const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
        if (!allowedTypes.includes(file.mimetype)) {
          errors.push({
            fileName: file.name,
            error: 'รองรับเฉพาะไฟล์ PDF, PNG, JPG เท่านั้น'
          });
          continue;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          errors.push({
            fileName: file.name,
            error: 'ไฟล์มีขนาดใหญ่เกิน 10MB'
          });
          continue;
        }

        // Extract name from filename (format: firstName_lastName.ext)
        const nameWithoutExt = path.parse(file.name).name;
        const nameParts = nameWithoutExt.split('_');
        
        if (nameParts.length < 2) {
          errors.push({
            fileName: file.name,
            error: 'ชื่อไฟล์ต้องอยู่ในรูปแบบ ชื่อ_นามสกุล.pdf'
          });
          continue;
        }

        const firstName = nameParts[0].trim();
        const lastName = nameParts.slice(1).join('_').trim();

        // Generate unique filename
        const timestamp = Date.now();
        const ext = path.extname(file.name);
        const uniqueFileName = `${firstName}_${lastName}_${timestamp}${ext}`;
        const filePath = path.join(uploadsDir, uniqueFileName);

        // Move file to uploads directory
        await file.mv(filePath);

        // Check if certificate already exists for this user
        const existingCert = await Certificate.findOne({ firstName, lastName });
        if (existingCert) {
          // Delete old file
          if (fs.existsSync(existingCert.filePath)) {
            fs.unlinkSync(existingCert.filePath);
          }
          // Update existing certificate
          existingCert.fileName = file.name;
          existingCert.filePath = filePath;
          existingCert.fileSize = file.size;
          existingCert.uploadDate = new Date();
          existingCert.uploadedBy = req.user?.username || 'admin';
          await existingCert.save();
          uploadedCertificates.push(existingCert);
        } else {
          // Create new certificate record
          const certificate = new Certificate({
            firstName,
            lastName,
            fileName: file.name,
            filePath,
            fileSize: file.size,
            uploadedBy: req.user?.username || 'admin'
          });
          await certificate.save();
          uploadedCertificates.push(certificate);
        }
      } catch (err) {
        console.error('Error processing file:', file.name, err);
        errors.push({
          fileName: file.name,
          error: err.message || 'เกิดข้อผิดพลาดในการอัปโหลด'
        });
      }
    }

    res.json({
      success: true,
      uploaded: uploadedCertificates.length,
      certificates: uploadedCertificates,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Error uploading certificates:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัปโหลดเกียรติบัตร' });
  }
});

// Search certificate by name (public)
router.get('/search', async (req, res) => {
  try {
    const { firstName, lastName } = req.query;

    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'กรุณาระบุชื่อและนามสกุล' });
    }

    const certificate = await Certificate.findOne({
      firstName: firstName.trim(),
      lastName: lastName.trim()
    });

    if (!certificate) {
      return res.json({ found: false });
    }

    // Check if download is allowed based on settings
    const settings = await Settings.getSettings();
    const now = new Date();
    const downloadDate = settings.certificateDownloadDate;
    
    const canDownload = !downloadDate || now >= new Date(downloadDate);

    res.json({
      found: true,
      certificate: {
        id: certificate._id,
        firstName: certificate.firstName,
        lastName: certificate.lastName,
        fileName: certificate.fileName,
        uploadDate: certificate.uploadDate,
        canDownload,
        downloadDate: downloadDate
      }
    });
  } catch (error) {
    console.error('Error searching certificate:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการค้นหาเกียรติบัตร' });
  }
});

// Download certificate (public with date validation)
router.get('/download/:id', async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);

    if (!certificate) {
      return res.status(404).json({ error: 'ไม่พบเกียรติบัตร' });
    }

    // Check if download is allowed based on settings
    const settings = await Settings.getSettings();
    const now = new Date();
    const downloadDate = settings.certificateDownloadDate;
    
    if (downloadDate && now < new Date(downloadDate)) {
      return res.status(403).json({
        error: 'ยังไม่ถึงวันที่สามารถดาวน์โหลดได้',
        downloadDate: downloadDate
      });
    }

    // Check if file exists
    if (!fs.existsSync(certificate.filePath)) {
      return res.status(404).json({ error: 'ไม่พบไฟล์เกียรติบัตร' });
    }

    // Send file
    res.download(certificate.filePath, certificate.fileName);
  } catch (error) {
    console.error('Error downloading certificate:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดาวน์โหลดเกียรติบัตร' });
  }
});

// List all certificates (admin only)
router.get('/list', verifyAdmin, async (req, res) => {
  try {
    const certificates = await Certificate.find()
      .sort({ uploadDate: -1 })
      .select('-filePath'); // Don't expose file path

    res.json({
      success: true,
      count: certificates.length,
      certificates
    });
  } catch (error) {
    console.error('Error listing certificates:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงรายการเกียรติบัตร' });
  }
});

// Delete certificate (admin only)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);

    if (!certificate) {
      return res.status(404).json({ error: 'ไม่พบเกียรติบัตร' });
    }

    // Delete file from filesystem
    if (fs.existsSync(certificate.filePath)) {
      fs.unlinkSync(certificate.filePath);
    }

    // Delete from database
    await Certificate.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'ลบเกียรติบัตรเรียบร้อยแล้ว'
    });
  } catch (error) {
    console.error('Error deleting certificate:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบเกียรติบัตร' });
  }
});

export default router;
