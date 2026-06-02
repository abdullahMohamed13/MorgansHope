import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as hospitalService from '../services/hospitalService';

export async function getAll(req: AuthRequest, res: Response): Promise<void> {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.max(1, parseInt(req.query.limit as string) || 10);

  const result = await hospitalService.getAllHospitals({
    city: req.query.city as string,
    type: req.query.type as string,
    specialization: req.query.specialization as string,
    search: req.query.search as string,
    page,
    limit,
  });

  if (result.success === false) {
    res.status(500).json({ success: false, message: result.error });
    return;
  }

  res.json({
    success: true,
    message: 'Hospitals retrieved',
    data: result.data.data,
    pagination: result.data.pagination,
  });
}

export async function getCities(_req: AuthRequest, res: Response): Promise<void> {
  const result = await hospitalService.getHospitalCities();

  if (result.success === false) {
    res.status(500).json({ success: false, message: result.error });
    return;
  }

  res.json({
    success: true,
    message: 'Cities retrieved',
    data: result.data,
  });
}

export async function getById(req: AuthRequest, res: Response): Promise<void> {
  const result = await hospitalService.getHospitalById(Number(req.params.id));

  if (result.success === false) {
    res.status(404).json({ success: false, message: result.error });
    return;
  }

  res.json({ success: true, message: 'Hospital retrieved', data: result.data });
}
