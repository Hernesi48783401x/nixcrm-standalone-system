import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_key';

export interface AuthPayload {
  id: number;
  username: string;
  role: 'admin' | 'reseller';
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export function generateToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch (error) {
    return null;
  }
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const token = req.cookies.auth_token;
  
  if (!token) {
    res.status(401).json({ error: 'No autorizado' });
    return;
  }
  
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Token inválido o expirado' });
    return;
  }
  
  req.user = payload;
  next();
}

export function adminOnly(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Acceso denegado: solo administradores' });
    return;
  }
  next();
}

export function resellerOnly(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'reseller') {
    res.status(403).json({ error: 'Acceso denegado: solo revendedores' });
    return;
  }
  next();
}
