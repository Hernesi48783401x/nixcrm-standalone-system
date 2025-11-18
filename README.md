# NIXCRM License Manager - Standalone Edition

Sistema web **completamente independiente** para la generación y venta de licencias NIXCRM v11.0 en lote con control de cuotas por revendedor.

## 🎯 Características

### ✅ Completamente Independiente
- **Sin dependencias de plataformas externas**
- Base de datos SQLite (archivo local)
- Autenticación tradicional con usuario/contraseña
- Listo para desplegar en cualquier hosting

### 🔐 Seguridad
- Hardware ID binding (licencias vinculadas a PC específico)
- Encriptación HMAC para integridad
- Contraseñas hasheadas con bcrypt
- Autenticación JWT con cookies seguras
- Código fuente protegido en servidor

### 👥 Roles de Usuario
- **Administrador**: Gestión completa de revendedores y auditoría
- **Revendedor**: Generación de licencias con cuota limitada

---

## 🚀 Instalación y Deployment

### Opción 1: Servidor Local o VPS

#### Requisitos
- Node.js 18+ instalado
- Puerto 3000 disponible (o configurar otro)

#### Pasos

1. **Descomprimir el proyecto**
```bash
unzip nixcrm-standalone.zip
cd nixcrm-standalone
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
nano .env
```

Edita `.env` y cambia:
- `JWT_SECRET`: Genera un secreto aleatorio de al menos 32 caracteres
- `PORT`: Puerto del servidor (por defecto 3000)

4. **Crear el primer administrador**
```bash
npm run init-admin
```

Sigue las instrucciones en pantalla para crear tu cuenta de administrador.

5. **Iniciar el servidor**

**Desarrollo:**
```bash
npm run dev
```

**Producción:**
```bash
npm run build
npm start
```

6. **Acceder al sistema**

Abre tu navegador en: `http://localhost:3000`

---

### Opción 2: Railway.app (Gratis y Fácil)

1. **Crear cuenta en Railway.app**
   - Ve a https://railway.app
   - Regístrate con GitHub

2. **Crear nuevo proyecto**
   - Clic en "New Project"
   - Selecciona "Deploy from GitHub repo"
   - Sube tu código a GitHub primero

3. **Configurar variables de entorno**
   - En el dashboard de Railway, ve a "Variables"
   - Agrega:
     - `JWT_SECRET`: tu secreto aleatorio
     - `NODE_ENV`: `production`

4. **Deploy automático**
   - Railway detecta automáticamente Node.js
   - El deploy se hace automáticamente
   - Te da una URL pública: `https://tu-app.railway.app`

5. **Crear admin**
   - Conéctate por SSH o usa el terminal de Railway
   - Ejecuta: `npm run init-admin`

---

### Opción 3: Render.com (Gratis)

1. **Crear cuenta en Render.com**
   - Ve a https://render.com
   - Regístrate gratis

2. **Crear Web Service**
   - Clic en "New +" → "Web Service"
   - Conecta tu repositorio de GitHub

3. **Configurar el servicio**
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node

4. **Agregar variables de entorno**
   - `JWT_SECRET`: tu secreto
   - `NODE_ENV`: `production`

5. **Deploy**
   - Render hace el deploy automáticamente
   - Te da una URL: `https://tu-app.onrender.com`

---

### Opción 4: DigitalOcean / AWS / VPS

1. **Crear un Droplet/Instancia**
   - Ubuntu 22.04 LTS
   - Mínimo 1GB RAM

2. **Instalar Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. **Subir el proyecto**
```bash
scp -r nixcrm-standalone root@tu-ip:/var/www/
```

4. **Configurar y ejecutar**
```bash
cd /var/www/nixcrm-standalone
npm install
npm run init-admin
npm run build
```

5. **Usar PM2 para mantener el servidor activo**
```bash
sudo npm install -g pm2
pm2 start npm --name "nixcrm" -- start
pm2 startup
pm2 save
```

6. **Configurar Nginx como proxy inverso**
```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 📖 Guía de Uso

### Para el Administrador

1. **Acceder**
   - Ve a la URL de tu sistema
   - Clic en "Administrador"
   - Ingresa tus credenciales

2. **Crear Revendedor**
   - En el panel admin, pestaña "Revendedores"
   - Clic en "+ Crear Revendedor"
   - Completa el formulario:
     - **Usuario**: nombre único (ej: `juan_perez`)
     - **Contraseña**: mínimo 6 caracteres
     - **Nombre**: nombre visible
     - **Cuota**: cantidad de licencias (ej: 10)
     - **Modo de Días**:
       - **Fijos**: todas las licencias duran lo mismo (ej: 30 días)
       - **Rango**: el revendedor elige (ej: 7-365 días)

3. **Entregar Credenciales**
   - Envía al revendedor:
     - URL del sistema
     - Usuario
     - Contraseña

### Para el Revendedor

1. **Acceder**
   - Ve a la URL del sistema
   - Clic en "Revendedor"
   - Ingresa tus credenciales

2. **Generar Licencia**
   - El cliente ejecuta `get_hardware_id_v11.py` en su PC
   - El cliente te envía su Hardware ID (64 caracteres)
   - En el portal:
     - Pestaña "Generar Licencia"
     - Nombre del Cliente
     - Hardware ID (pegar los 64 caracteres)
     - Días (si es rango, elegir entre min y max)
   - Clic en "Generar Licencia"
   - El archivo `.lic` se descarga automáticamente

3. **Enviar al Cliente**
   - Envía el archivo `.lic` descargado
   - El cliente lo carga en NIXCRM v11.0
   - La licencia SOLO funciona en su PC

---

## 🗂️ Estructura del Proyecto

```
nixcrm-standalone/
├── src/
│   ├── database.ts              # Configuración SQLite
│   ├── server.ts                # Servidor Express
│   ├── routes/
│   │   ├── auth.ts              # Autenticación
│   │   ├── admin.ts             # Rutas de admin
│   │   └── reseller.ts          # Rutas de revendedor
│   ├── middleware/
│   │   └── auth.ts              # Middleware JWT
│   ├── utils/
│   │   └── licenseGenerator.ts  # Generador de licencias
│   └── scripts/
│       └── initAdmin.ts         # Script de inicialización
├── public/
│   ├── index.html               # Página principal
│   ├── admin.html               # Panel admin
│   ├── reseller.html            # Panel revendedor
│   └── styles.css               # Estilos
├── data/
│   └── nixcrm.db                # Base de datos (se crea automáticamente)
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

---

## 🔧 API Endpoints

### Autenticación
- `POST /api/auth/admin/login` - Login de administrador
- `POST /api/auth/reseller/login` - Login de revendedor
- `GET /api/auth/me` - Obtener usuario actual
- `POST /api/auth/logout` - Cerrar sesión

### Admin (requiere autenticación de admin)
- `GET /api/admin/stats` - Estadísticas generales
- `GET /api/admin/resellers` - Listar revendedores
- `POST /api/admin/resellers` - Crear revendedor
- `PUT /api/admin/resellers/:id` - Actualizar revendedor
- `DELETE /api/admin/resellers/:id` - Eliminar revendedor
- `GET /api/admin/licenses` - Auditoría de licencias

### Revendedor (requiere autenticación de revendedor)
- `GET /api/reseller/info` - Información del revendedor
- `GET /api/reseller/licenses` - Licencias generadas
- `POST /api/reseller/generate` - Generar nueva licencia

---

## 🔒 Seguridad

### Recomendaciones

1. **Cambiar JWT_SECRET**
   - Genera un secreto aleatorio fuerte
   - Nunca uses el valor por defecto en producción

2. **HTTPS**
   - Usa siempre HTTPS en producción
   - Configura certificado SSL (Let's Encrypt es gratis)

3. **Firewall**
   - Solo abre los puertos necesarios (80, 443)
   - Bloquea acceso directo al puerto 3000

4. **Backups**
   - Haz backups periódicos de `data/nixcrm.db`
   - Guarda en un lugar seguro

5. **Actualizaciones**
   - Mantén Node.js actualizado
   - Actualiza dependencias regularmente

---

## 🐛 Troubleshooting

### El servidor no inicia
- Verifica que el puerto 3000 esté libre
- Revisa los logs: `npm run dev`
- Verifica que Node.js 18+ esté instalado

### No puedo crear admin
- Asegúrate de que la base de datos tenga permisos de escritura
- Verifica que el directorio `data/` exista

### Error al generar licencias
- Verifica que el Hardware ID tenga exactamente 64 caracteres
- Verifica que el revendedor tenga cuota disponible

### La base de datos está corrupta
- Restaura desde backup
- Si no hay backup, elimina `data/nixcrm.db` y vuelve a crear admin

---

## 📞 Soporte

Para problemas técnicos:
1. Revisa este README
2. Verifica los logs del servidor
3. Contacta al desarrollador del sistema

---

## 📄 Licencia

MIT License - Uso libre para proyectos comerciales y personales.

---

**NIXCRM License Manager v11.0 - Standalone Edition**  
Sistema Profesional de Gestión de Licencias - Completamente Independiente
