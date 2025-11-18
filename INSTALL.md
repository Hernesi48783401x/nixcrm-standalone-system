# Guía Rápida de Instalación

## ⚡ Instalación en 5 Minutos

### 1. Descomprimir
```bash
unzip nixcrm-standalone.zip
cd nixcrm-standalone
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar
```bash
cp .env.example .env
nano .env
```

**Cambiar en `.env`:**
- `JWT_SECRET`: Genera un secreto aleatorio (mínimo 32 caracteres)

### 4. Crear Administrador
```bash
npm run init-admin
```

Ingresa:
- Usuario: `admin`
- Contraseña: (la que quieras, mínimo 6 caracteres)
- Nombre: `Administrador`
- Email: (opcional)

### 5. Iniciar Servidor
```bash
npm run dev
```

### 6. Acceder
Abre tu navegador en: **http://localhost:3000**

---

## 🌐 Deployment en Hosting

### Railway.app (Más Fácil)

1. Sube el proyecto a GitHub
2. Ve a https://railway.app
3. Crea nuevo proyecto desde GitHub
4. Agrega variable de entorno: `JWT_SECRET`
5. Railway hace el deploy automáticamente
6. Conéctate por SSH y ejecuta: `npm run init-admin`

### Render.com

1. Sube el proyecto a GitHub
2. Ve a https://render.com
3. Crea nuevo "Web Service"
4. Build Command: `npm install && npm run build`
5. Start Command: `npm start`
6. Agrega variable: `JWT_SECRET`
7. Espera el deploy
8. Usa el terminal de Render para: `npm run init-admin`

### VPS (DigitalOcean, AWS, etc.)

```bash
# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Subir proyecto
scp -r nixcrm-standalone root@tu-ip:/var/www/

# Configurar
cd /var/www/nixcrm-standalone
npm install
npm run init-admin
npm run build

# Mantener activo con PM2
sudo npm install -g pm2
pm2 start npm --name "nixcrm" -- start
pm2 startup
pm2 save
```

---

## 🔐 Seguridad Importante

1. **Cambiar JWT_SECRET** - Nunca uses el valor por defecto
2. **Usar HTTPS** - Configura certificado SSL en producción
3. **Backups** - Haz backup de `data/nixcrm.db` regularmente
4. **Firewall** - Solo abre puertos 80 y 443

---

## 📞 ¿Problemas?

### El servidor no inicia
```bash
# Verifica que el puerto 3000 esté libre
lsof -i :3000

# Si está ocupado, cambia el puerto en .env
PORT=8080
```

### No puedo crear admin
```bash
# Verifica permisos
chmod 755 data/
```

### Error al generar licencias
- Hardware ID debe tener exactamente 64 caracteres hexadecimales
- Verifica que el revendedor tenga cuota disponible

---

## ✅ Checklist de Producción

- [ ] Cambiar `JWT_SECRET` a un valor aleatorio fuerte
- [ ] Configurar `NODE_ENV=production`
- [ ] Habilitar HTTPS
- [ ] Configurar firewall
- [ ] Configurar backups automáticos
- [ ] Crear primer administrador
- [ ] Probar generación de licencias
- [ ] Documentar credenciales de forma segura

---

¡Listo! Tu sistema está funcionando. 🚀
