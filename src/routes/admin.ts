import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import db from '../database.js';
import { authMiddleware, adminOnly, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Apply auth middleware to all admin routes
router.use(authMiddleware, adminOnly);

// Get statistics
router.get('/stats', (req: AuthRequest, res: Response): void => {
  try {
    const totalResellers = db.prepare('SELECT COUNT(*) as count FROM resellers').get() as any;
    const activeResellers = db.prepare('SELECT COUNT(*) as count FROM resellers WHERE is_active = 1').get() as any;
    const totalLicenses = db.prepare('SELECT COUNT(*) as count FROM licenses').get() as any;
    
    const now = Date.now() / 1000;
    const last24h = now - (24 * 60 * 60);
    const licensesLast24h = db.prepare('SELECT COUNT(*) as count FROM licenses WHERE created_at >= ?').get(last24h) as any;
    
    const quotaStats = db.prepare('SELECT SUM(total_quota) as total, SUM(used_quota) as used FROM resellers').get() as any;
    
    res.json({
      totalResellers: totalResellers.count,
      activeResellers: activeResellers.count,
      totalLicenses: totalLicenses.count,
      licensesLast24h: licensesLast24h.count,
      totalQuotaAssigned: quotaStats.total || 0,
      totalQuotaUsed: quotaStats.used || 0,
      quotaRemaining: (quotaStats.total || 0) - (quotaStats.used || 0)
    });
  } catch (error: any) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// List all resellers
router.get('/resellers', (req: AuthRequest, res: Response): void => {
  try {
    const resellers = db.prepare('SELECT * FROM resellers ORDER BY created_at DESC').all();
    res.json(resellers);
  } catch (error: any) {
    console.error('List resellers error:', error);
    res.status(500).json({ error: 'Error al listar revendedores' });
  }
});

// Create reseller
router.post('/resellers', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { username, password, displayName, email, totalQuota, daysMode, daysFixed, daysMin, daysMax } = req.body;
    
    if (!username || !password || !displayName || totalQuota === undefined || !daysMode) {
      res.status(400).json({ error: 'Datos incompletos' });
      return;
    }
    
    // Check if username exists
    const existing = db.prepare('SELECT id FROM resellers WHERE username = ?').get(username);
    if (existing) {
      res.status(400).json({ error: 'El nombre de usuario ya existe' });
      return;
    }
    
    const passwordHash = await bcrypt.hash(password, 10);
    
    const stmt = db.prepare(`
      INSERT INTO resellers (username, password_hash, display_name, email, total_quota, days_mode, days_fixed, days_min, days_max)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(username, passwordHash, displayName, email || null, totalQuota, daysMode, daysFixed || null, daysMin || null, daysMax || null);
    
    const newReseller = db.prepare('SELECT * FROM resellers WHERE id = ?').get(result.lastInsertRowid);
    
    res.json({ success: true, reseller: newReseller });
  } catch (error: any) {
    console.error('Create reseller error:', error);
    res.status(500).json({ error: 'Error al crear revendedor' });
  }
});

// Update reseller
router.put('/resellers/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { displayName, email, totalQuota, daysMode, daysFixed, daysMin, daysMax, isActive, password } = req.body;
    
    const updates: string[] = [];
    const values: any[] = [];
    
    if (displayName !== undefined) {
      updates.push('display_name = ?');
      values.push(displayName);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email || null);
    }
    if (totalQuota !== undefined) {
      updates.push('total_quota = ?');
      values.push(totalQuota);
    }
    if (daysMode !== undefined) {
      updates.push('days_mode = ?');
      values.push(daysMode);
    }
    if (daysFixed !== undefined) {
      updates.push('days_fixed = ?');
      values.push(daysFixed || null);
    }
    if (daysMin !== undefined) {
      updates.push('days_min = ?');
      values.push(daysMin || null);
    }
    if (daysMax !== undefined) {
      updates.push('days_max = ?');
      values.push(daysMax || null);
    }
    if (isActive !== undefined) {
      updates.push('is_active = ?');
      values.push(isActive ? 1 : 0);
    }
    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      updates.push('password_hash = ?');
      values.push(passwordHash);
    }
    
    if (updates.length === 0) {
      res.status(400).json({ error: 'No hay datos para actualizar' });
      return;
    }
    
    updates.push('updated_at = unixepoch()');
    values.push(id);
    
    const stmt = db.prepare(`UPDATE resellers SET ${updates.join(', ')} WHERE id = ?`);
    stmt.run(...values);
    
    const updated = db.prepare('SELECT * FROM resellers WHERE id = ?').get(id);
    
    res.json({ success: true, reseller: updated });
  } catch (error: any) {
    console.error('Update reseller error:', error);
    res.status(500).json({ error: 'Error al actualizar revendedor' });
  }
});

// Delete reseller
router.delete('/resellers/:id', (req: AuthRequest, res: Response): void => {
  try {
    const { id } = req.params;
    
    db.prepare('DELETE FROM resellers WHERE id = ?').run(id);
    
    res.json({ success: true });
  } catch (error: any) {
    console.error('Delete reseller error:', error);
    res.status(500).json({ error: 'Error al eliminar revendedor' });
  }
});

// Get all licenses (audit)
router.get('/licenses', (req: AuthRequest, res: Response): void => {
  try {
    const licenses = db.prepare(`
      SELECT l.*, r.display_name as reseller_name 
      FROM licenses l 
      JOIN resellers r ON l.reseller_id = r.id 
      ORDER BY l.created_at DESC
    `).all();
    
    res.json(licenses);
  } catch (error: any) {
    console.error('Get all licenses error:', error);
    res.status(500).json({ error: 'Error al obtener licencias' });
  }
});

export default router;
