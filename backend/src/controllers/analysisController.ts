import { Response } from 'express';
import fs from 'fs';
import { AuthRequest } from '../middleware/auth';
import * as analysisService from '../services/analysisService';

export async function upload(req: AuthRequest, res: Response): Promise<void> {
  const file = req.file;
  if (!file) {
    res.status(400).json({ success: false, message: 'No image file provided' });
    return;
  }

  const imageType = ((req.body.imageType as string) || '').toLowerCase() as 'xray' | 'ct';
  const sessionId = req.body.sessionId || null;

  const result = await analysisService.uploadAndAnalyze({
    userId: req.user!.id,
    filePath: file.path,
    originalFilename: file.originalname,
    imageType,
    sessionId,
  });

  if (result.success === false) {
    try { fs.unlinkSync(file.path); } catch { }
    const status = result.error.startsWith('imageType') ? 400 : 503;
    res.status(status).json({ success: false, message: result.error });
    return;
  }

  res.status(201).json({
    success: true,
    message: 'Analysis complete',
    data: result.data,
  });
}

export async function getHistory(req: AuthRequest, res: Response): Promise<void> {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.max(1, parseInt(req.query.limit as string) || 10);

  const result = await analysisService.getAnalysisHistory(req.user!.id, page, limit);

  if (result.success === false) {
    res.status(500).json({ success: false, message: result.error });
    return;
  }

  res.json({
    success: true,
    message: 'History retrieved',
    data: result.data.data,
    pagination: result.data.pagination,
  });
}

export async function getById(req: AuthRequest, res: Response): Promise<void> {
  const result = await analysisService.getAnalysisById(req.user!.id, Number(req.params.id));

  if (result.success === false) {
    res.status(404).json({ success: false, message: result.error });
    return;
  }

  res.json({
    success: true,
    message: 'Analysis retrieved',
    data: result.data,
  });
}

export async function deleteAnalysis(req: AuthRequest, res: Response): Promise<void> {
  const result = await analysisService.deleteAnalysisById(req.user!.id, Number(req.params.id));

  if (result.success === false) {
    res.status(404).json({ success: false, message: result.error });
    return;
  }

  res.json({ success: true, message: 'Analysis deleted' });
}
