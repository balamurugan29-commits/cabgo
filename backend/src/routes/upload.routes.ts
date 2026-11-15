import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { sendSuccess } from '../utils/response';
import { requireAuth } from '../middleware/auth';

const router = Router();
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

// Ensure uploads folder exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { file_base64, filename, file_type } = req.body;

    if (!file_base64) {
      res.status(400).json({ success: false, error: 'file_base64 is required' });
      return;
    }

    // Determine extension
    let extension = 'png';
    if (filename && filename.includes('.')) {
      extension = filename.split('.').pop() || 'png';
    } else if (file_type && file_type.includes('/')) {
      extension = file_type.split('/')[1] || 'png';
    }

    const uniqueName = `${uuidv4()}.${extension}`;
    const filePath = path.join(UPLOADS_DIR, uniqueName);

    // Clean base64 header if present (e.g. data:image/png;base64,...)
    const base64Data = file_base64.replace(/^data:([A-Za-z-+/]+);base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${uniqueName}`;

    sendSuccess(
      res,
      {
        url: publicUrl,
        filename: uniqueName,
        size: buffer.length,
      },
      'File uploaded successfully',
      201
    );
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'File upload failed' });
  }
});

export default router;
