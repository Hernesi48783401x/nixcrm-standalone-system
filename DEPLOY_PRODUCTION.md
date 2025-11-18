# Guía de Despliegue en Producción - NIXCRM License Manager

## 📋 Información del Sistema

**Sistema:** NIXCRM License Manager - Sistema de Gestión de Licencias Standalone  
**Repositorio GitHub:** https://github.com/Hernesi48783401x/nixcrm-standalone-system  
**Tecnologías:** Node.js, TypeScript, SQLite, Express  
**Puerto por defecto:** 3000

## 🔐 Credenciales de Acceso

**Usuario administrador:**
- Username: `admin`
- Password: `NixCRM2024!Secure`
- Email: `admin@nixcrm.com`

## 🚀 Opción 1: Despliegue Rápido con Render.com (GRATIS)

### Paso 1: Crear cuenta en Render
1. Ve a https://render.com
2. Haz clic en "Get Started" o "Sign Up"
3. Conecta con tu cuenta de GitHub (Hernesi48783401x)

### Paso 2: Crear nuevo Web Service
1. En el dashboard, haz clic en "New +"
2. Selecciona "Web Service"
3. Conecta tu repositorio: `Hernesi48783401x/nixcrm-standalone-system`
4. Configura los siguientes parámetros:

**Configuración básica:**
- **Name:** nixcrm-license-system
- **Environment:** Docker
- **Region:** Oregon (US West) o el más cercano
- **Branch:** main
- **Instance Type:** Free

**Variables de entorno (Environment Variables):**
```
PORT=3000
NODE_ENV=production
DATABASE_PATH=./data/nixcrm.db
JWT_SECRET=2780bed428f6f438e414f8bc3a71c40fcc7bf684108bd8f7b82495b7c0c9674eb6c8430a4ed6b4799ec819a5399b763d4f23db34e2a191891f1d16a3b726f29b
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=NixCRM2024!Secure
DEFAULT_ADMIN_EMAIL=admin@nixcrm.com
```

5. Haz clic en "Deploy Web Service"
6. Espera 5-10 minutos mientras se construye y despliega
7. Tu sistema estará disponible en: `https://nixcrm-license-system.onrender.com`

**NOTA:** El plan gratuito de Render puede suspender el servicio después de 15 minutos de inactividad. Se reactiva automáticamente al recibir una solicitud (puede tardar 30-60 segundos).

---

## 🚀 Opción 2: Despliegue con Railway.app (GRATIS con límites)

### Paso 1: Crear cuenta
1. Ve a https://railway.app
2. Haz clic en "Start a New Project"
3. Conecta con GitHub

### Paso 2: Desplegar desde GitHub
1. Selecciona "Deploy from GitHub repo"
2. Elige: `Hernesi48783401x/nixcrm-standalone-system`
3. Railway detectará automáticamente el Dockerfile
4. Agrega las variables de entorno (igual que en Render)
5. Haz clic en "Deploy"

Tu sistema estará disponible en: `https://nixcrm-standalone-system-production.up.railway.app`

**NOTA:** Railway ofrece $5 USD de crédito gratis al mes.

---

## 🚀 Opción 3: Despliegue en VPS (DigitalOcean, Linode, AWS EC2)

### Requisitos del servidor
- Ubuntu 20.04 o superior
- Mínimo 1GB RAM
- Node.js 18+ instalado
- Puerto 3000 abierto (o el que prefieras)

### Paso 1: Conectarse al servidor
```bash
ssh root@tu-servidor-ip
```

### Paso 2: Instalar dependencias
```bash
# Actualizar el sistema
apt update && apt upgrade -y

# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Instalar PM2 (gestor de procesos)
npm install -g pm2

# Instalar Git
apt install -y git
```

### Paso 3: Clonar el repositorio
```bash
cd /opt
git clone https://github.com/Hernesi48783401x/nixcrm-standalone-system.git
cd nixcrm-standalone-system
```

### Paso 4: Configurar variables de entorno
```bash
cat > .env << 'EOF'
PORT=3000
NODE_ENV=production
DATABASE_PATH=./data/nixcrm.db
JWT_SECRET=2780bed428f6f438e414f8bc3a71c40fcc7bf684108bd8f7b82495b7c0c9674eb6c8430a4ed6b4799ec819a5399b763d4f23db34e2a191891f1d16a3b726f29b
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=NixCRM2024!Secure
DEFAULT_ADMIN_EMAIL=admin@nixcrm.com
EOF
```

### Paso 5: Instalar dependencias y compilar
```bash
npm install
npm run build
```

### Paso 6: Inicializar la base de datos
```bash
mkdir -p data
npm run init
# Sigue las instrucciones en pantalla para crear el usuario admin
```

### Paso 7: Iniciar con PM2
```bash
pm2 start dist/server.js --name nixcrm-license-system
pm2 save
pm2 startup
```

### Paso 8: Configurar Nginx como proxy reverso (opcional pero recomendado)
```bash
# Instalar Nginx
apt install -y nginx

# Crear configuración
cat > /etc/nginx/sites-available/nixcrm << 'EOF'
server {
    listen 80;
    server_name tu-dominio.com;  # Cambia esto por tu dominio

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Activar el sitio
ln -s /etc/nginx/sites-available/nixcrm /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Paso 9: Configurar SSL con Let's Encrypt (opcional pero recomendado)
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d tu-dominio.com
```

### Comandos útiles de PM2
```bash
# Ver logs
pm2 logs nixcrm-license-system

# Reiniciar
pm2 restart nixcrm-license-system

# Detener
pm2 stop nixcrm-license-system

# Ver estado
pm2 status

# Monitorear
pm2 monit
```

---

## 🚀 Opción 4: Despliegue con Docker (Cualquier servidor)

### Requisitos
- Docker instalado
- Docker Compose instalado

### Paso 1: Clonar el repositorio
```bash
git clone https://github.com/Hernesi48783401x/nixcrm-standalone-system.git
cd nixcrm-standalone-system
```

### Paso 2: Crear archivo .env
```bash
cat > .env << 'EOF'
PORT=3000
NODE_ENV=production
DATABASE_PATH=./data/nixcrm.db
JWT_SECRET=2780bed428f6f438e414f8bc3a71c40fcc7bf684108bd8f7b82495b7c0c9674eb6c8430a4ed6b4799ec819a5399b763d4f23db34e2a191891f1d16a3b726f29b
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=NixCRM2024!Secure
DEFAULT_ADMIN_EMAIL=admin@nixcrm.com
EOF
```

### Paso 3: Construir y ejecutar
```bash
# Construir la imagen
docker build -t nixcrm-license-system .

# Ejecutar el contenedor
docker run -d \
  --name nixcrm \
  -p 3000:3000 \
  --env-file .env \
  -v $(pwd)/data:/app/data \
  --restart unless-stopped \
  nixcrm-license-system
```

### Comandos útiles de Docker
```bash
# Ver logs
docker logs -f nixcrm

# Reiniciar
docker restart nixcrm

# Detener
docker stop nixcrm

# Iniciar
docker start nixcrm

# Ver estado
docker ps
```

---

## 📊 Verificación del Despliegue

Una vez desplegado, verifica que todo funciona correctamente:

1. **Accede a la interfaz web:**
   - Abre tu navegador y ve a: `http://tu-dominio-o-ip:3000`
   - O la URL proporcionada por Render/Railway

2. **Inicia sesión:**
   - Usuario: `admin`
   - Contraseña: `NixCRM2024!Secure`

3. **Prueba las funcionalidades:**
   - Crear una nueva licencia
   - Verificar una licencia
   - Ver el dashboard

---

## 🔧 Mantenimiento

### Actualizar el sistema
```bash
cd /opt/nixcrm-standalone-system  # O la ruta donde clonaste
git pull origin main
npm install
npm run build
pm2 restart nixcrm-license-system
```

### Backup de la base de datos
```bash
# Crear backup
cp data/nixcrm.db data/nixcrm.db.backup-$(date +%Y%m%d-%H%M%S)

# Restaurar backup
cp data/nixcrm.db.backup-YYYYMMDD-HHMMSS data/nixcrm.db
pm2 restart nixcrm-license-system
```

### Monitoreo
```bash
# Ver logs en tiempo real
pm2 logs nixcrm-license-system --lines 100

# Ver uso de recursos
pm2 monit
```

---

## 🆘 Solución de Problemas

### El servicio no inicia
```bash
# Verificar logs
pm2 logs nixcrm-license-system

# Verificar que el puerto 3000 esté libre
netstat -tulpn | grep 3000

# Reiniciar el servicio
pm2 restart nixcrm-license-system
```

### Error de base de datos
```bash
# Eliminar la base de datos y reinicializar
rm -f data/nixcrm.db
npm run init
pm2 restart nixcrm-license-system
```

### Problemas de permisos
```bash
# Dar permisos al directorio data
chmod -R 755 data/
chown -R $USER:$USER data/
```

---

## 📞 Soporte

Si encuentras algún problema durante el despliegue, revisa:
1. Los logs del sistema: `pm2 logs nixcrm-license-system`
2. El archivo README.md en el repositorio
3. Las issues en GitHub: https://github.com/Hernesi48783401x/nixcrm-standalone-system/issues

---

## 📝 Notas Importantes

1. **Seguridad:** Cambia el JWT_SECRET en producción por uno nuevo generado aleatoriamente
2. **Backup:** Realiza backups regulares de la base de datos SQLite (carpeta `data/`)
3. **SSL:** Siempre usa HTTPS en producción (Let's Encrypt es gratuito)
4. **Firewall:** Configura el firewall para permitir solo los puertos necesarios (80, 443, 22)
5. **Actualizaciones:** Mantén el sistema actualizado regularmente

---

**¡Tu sistema NIXCRM License Manager está listo para producción!** 🎉
