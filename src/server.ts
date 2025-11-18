import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import resellerRoutes from './routes/reseller.js';

// Import database to initialize
import './database.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reseller', resellerRoutes);

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   NIXCRM License Manager - Standalone v1.0                 ║
║   Sistema de Gestión de Licencias Independiente           ║
║                                                            ║
║   🚀 Servidor iniciado en: http://localhost:${PORT.toString().padEnd(4)}         ║
║   📊 Base de datos: SQLite                                 ║
║   🔐 Autenticación: JWT                                    ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});

export default app;
