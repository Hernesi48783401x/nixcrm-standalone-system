import bcrypt from 'bcryptjs';
import db from '../database.js';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

async function initAdmin() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║   NIXCRM License Manager - Inicialización de Admin        ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  // Check if admin already exists
  const existingAdmin = db.prepare('SELECT COUNT(*) as count FROM admins').get() as any;
  
  if (existingAdmin.count > 0) {
    console.log('⚠️  Ya existe al menos un administrador en el sistema.');
    const overwrite = await question('¿Deseas crear otro administrador? (s/n): ');
    
    if (overwrite.toLowerCase() !== 's') {
      console.log('\n✅ Operación cancelada.\n');
      rl.close();
      process.exit(0);
    }
  }
  
  console.log('\n📝 Por favor, ingresa los datos del nuevo administrador:\n');
  
  const username = await question('Usuario: ');
  if (!username) {
    console.log('\n❌ El usuario es requerido.\n');
    rl.close();
    process.exit(1);
  }
  
  // Check if username exists
  const existing = db.prepare('SELECT id FROM admins WHERE username = ?').get(username);
  if (existing) {
    console.log('\n❌ El nombre de usuario ya existe.\n');
    rl.close();
    process.exit(1);
  }
  
  const password = await question('Contraseña (mínimo 6 caracteres): ');
  if (!password || password.length < 6) {
    console.log('\n❌ La contraseña debe tener al menos 6 caracteres.\n');
    rl.close();
    process.exit(1);
  }
  
  const displayName = await question('Nombre para mostrar: ');
  if (!displayName) {
    console.log('\n❌ El nombre para mostrar es requerido.\n');
    rl.close();
    process.exit(1);
  }
  
  const email = await question('Email (opcional): ');
  
  console.log('\n⏳ Creando administrador...\n');
  
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    
    const stmt = db.prepare(`
      INSERT INTO admins (username, password_hash, display_name, email)
      VALUES (?, ?, ?, ?)
    `);
    
    stmt.run(username, passwordHash, displayName, email || null);
    
    console.log('✅ ¡Administrador creado exitosamente!\n');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`   Usuario:  ${username}`);
    console.log(`   Nombre:   ${displayName}`);
    if (email) console.log(`   Email:    ${email}`);
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('🚀 Ahora puedes iniciar el servidor con: npm run dev\n');
    
  } catch (error: any) {
    console.error('\n❌ Error al crear administrador:', error.message);
    process.exit(1);
  }
  
  rl.close();
  process.exit(0);
}

initAdmin();
