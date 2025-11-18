import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import db from '../database.js';
import { generateToken, authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Admin login
router.post('/admin/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      res.status(400).json({ error: 'Usuario y contraseña requeridos' });
      return;
    }
    
    const admin = db.prepare('SELECT * FROM admins WHERE username = ? AND is_active = 1').get(username) as any;
    
    if (!admin) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }
    
    const isValid = await bcrypt.compare(password, admin.password_hash);
    if (!isValid) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }
    
    const token = generateToken({
      id: admin.id,
      username: admin.username,
      role: 'admin'
    });
    
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    res.json({
      success: true,
      user: {
        id: admin.id,
        username: admin.username,
        displayName: admin.display_name,
        email: admin.email,
        role: 'admin'
      }
    });
  } catch (error: any) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Reseller login
router.post('/reseller/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      res.status(400).json({ error: 'Usuario y contraseña requeridos' });
      return;
    }
    
    const reseller = db.prepare('SELECT * FROM resellers WHERE username = ? AND is_active = 1').get(username) as any;
    
    if (!reseller) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }
    
    const isValid = await bcrypt.compare(password, reseller.password_hash);
    if (!isValid) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }
    
    const token = generateToken({
      id: reseller.id,
      username: reseller.username,
      role: 'reseller'
    });
    
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    
    res.json({
      success: true,
      user: {
        id: reseller.id,
        username: reseller.username,
        displayName: reseller.display_name,
        email: reseller.email,
        role: 'reseller',
        totalQuota: reseller.total_quota,
        usedQuota: reseller.used_quota,
        daysMode: reseller.days_mode,
        daysFixed: reseller.days_fixed,
        daysMin: reseller.days_min,
        daysMax: reseller.days_max
      }
    });
  } catch (error: any) {
    console.error('Reseller login error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Get current user
router.get('/me', authMiddleware, (req: AuthRequest, res: Response): void => {
  const user = req.user!;
  
  if (user.role === 'admin') {
    const admin = db.prepare('SELECT * FROM admins WHERE id = ?').get(user.id) as any;
    res.json({
      id: admin.id,
      username: admin.username,
      displayName: admin.display_name,
      email: admin.email,
      role: 'admin'
    });
  } else {
    const reseller = db.prepare('SELECT * FROM resellers WHERE id = ?').get(user.id) as any;
    res.json({
      id: reseller.id,
      username: reseller.username,
      displayName: reseller.display_name,
      email: reseller.email,
      role: 'reseller',
      totalQuota: reseller.total_quota,
      usedQuota: reseller.used_quota,
      daysMode: reseller.days_mode,
      daysFixed: reseller.days_fixed,
      daysMin: reseller.days_min,
      daysMax: reseller.days_max
    });
  }
});

// Logout
router.post('/logout', (req: Request, res: Response): void => {
  res.clearCookie('auth_token');
  res.json({ success: true });
});

export default router;
