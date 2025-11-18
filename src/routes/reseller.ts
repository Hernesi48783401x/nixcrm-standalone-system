import { Router, Response } from 'express';
import db from '../database.js';
import { authMiddleware, resellerOnly, AuthRequest } from '../middleware/auth.js';
import { generateLicense, generateLicenseFilename, licenseToFileContent, validateHardwareId } from '../utils/licenseGenerator.js';

const router = Router();

// Apply auth middleware to all reseller routes
router.use(authMiddleware, resellerOnly);

// Get reseller info
router.get('/info', (req: AuthRequest, res: Response): void => {
  try {
    const reseller = db.prepare('SELECT * FROM resellers WHERE id = ?').get(req.user!.id) as any;
    
    if (!reseller) {
      res.status(404).json({ error: 'Revendedor no encontrado' });
      return;
    }
    
    res.json({
      id: reseller.id,
      username: reseller.username,
      displayName: reseller.display_name,
      email: reseller.email,
      totalQuota: reseller.total_quota,
      usedQuota: reseller.used_quota,
      daysMode: reseller.days_mode,
      daysFixed: reseller.days_fixed,
      daysMin: reseller.days_min,
      daysMax: reseller.days_max
    });
  } catch (error: any) {
    console.error('Get reseller info error:', error);
    res.status(500).json({ error: 'Error al obtener información' });
  }
});

// Get reseller's licenses
router.get('/licenses', (req: AuthRequest, res: Response): void => {
  try {
    const licenses = db.prepare('SELECT * FROM licenses WHERE reseller_id = ? ORDER BY created_at DESC').all(req.user!.id);
    res.json(licenses);
  } catch (error: any) {
    console.error('Get licenses error:', error);
    res.status(500).json({ error: 'Error al obtener licencias' });
  }
});

// Generate license
router.post('/generate', (req: AuthRequest, res: Response): void => {
  try {
    const { studentName, hardwareId, daysValidity } = req.body;
    
    if (!studentName || !hardwareId || !daysValidity) {
      res.status(400).json({ error: 'Datos incompletos' });
      return;
    }
    
    // Validate hardware ID
    if (!validateHardwareId(hardwareId)) {
      res.status(400).json({ error: 'Hardware ID inválido. Debe tener 64 caracteres hexadecimales.' });
      return;
    }
    
    // Get reseller
    const reseller = db.prepare('SELECT * FROM resellers WHERE id = ?').get(req.user!.id) as any;
    
    if (!reseller || !reseller.is_active) {
      res.status(403).json({ error: 'Cuenta de revendedor inactiva' });
      return;
    }
    
    // Check quota
    if (reseller.used_quota >= reseller.total_quota) {
      res.status(403).json({ error: 'Cuota agotada. Contacta al administrador.' });
      return;
    }
    
    // Validate days
    if (reseller.days_mode === 'fixed') {
      if (daysValidity !== reseller.days_fixed) {
        res.status(400).json({ error: `Los días deben ser exactamente ${reseller.days_fixed}` });
        return;
      }
    } else {
      if (daysValidity < reseller.days_min || daysValidity > reseller.days_max) {
        res.status(400).json({ error: `Los días deben estar entre ${reseller.days_min} y ${reseller.days_max}` });
        return;
      }
    }
    
    // Generate license
    const license = generateLicense(studentName, daysValidity, hardwareId.toUpperCase());
    
    // Save to database
    const expiresAt = Math.floor(new Date(license.fecha_expiracion).getTime() / 1000);
    
    db.prepare(`
      INSERT INTO licenses (reseller_id, license_id, student_name, hardware_id, days_validity, expires_at, hash, hmac_signature)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      reseller.id,
      license.license_id,
      license.estudiante,
      license.hardware_id,
      daysValidity,
      expiresAt,
      license.hash,
      license.firma_hmac
    );
    
    // Increment used quota
    db.prepare('UPDATE resellers SET used_quota = used_quota + 1 WHERE id = ?').run(reseller.id);
    
    // Generate file content
    const fileContent = licenseToFileContent(license);
    const filename = generateLicenseFilename(studentName, license.license_id);
    
    res.json({
      success: true,
      license,
      fileContent,
      filename
    });
  } catch (error: any) {
    console.error('Generate license error:', error);
    res.status(500).json({ error: error.message || 'Error al generar licencia' });
  }
});

export default router;
