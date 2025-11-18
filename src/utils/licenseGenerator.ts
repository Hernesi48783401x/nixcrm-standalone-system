import crypto from 'crypto';

// Security keys from original NIXCRM v11
const APP_SECRET = "NIXCRM_PRO_2025_ULTRA_SECRET_KEY_V11";
const HMAC_KEY = "NIXCRM_HMAC_MASTER_2025_V11";

export interface LicenseData {
  estudiante: string;
  license_id: string;
  hardware_id: string;
  fecha_creacion: string;
  fecha_expiracion: string;
  hash: string;
  firma_hmac: string;
  version: string;
  tipo: string;
}

function generateLicenseId(): string {
  return `lic_${crypto.randomBytes(8).toString('hex')}`;
}

export function validateHardwareId(hwId: string): boolean {
  if (hwId.length !== 64) return false;
  return /^[0-9A-F]{64}$/i.test(hwId);
}

export function generateLicense(
  studentName: string,
  daysValidity: number,
  hardwareId: string
): LicenseData {
  if (!validateHardwareId(hardwareId)) {
    throw new Error("Invalid Hardware ID format. Must be 64 hexadecimal characters.");
  }

  const creationDate = new Date();
  const expirationDate = new Date(creationDate.getTime() + daysValidity * 24 * 60 * 60 * 1000);
  
  const licenseId = generateLicenseId();
  
  const baseData = [
    APP_SECRET,
    studentName,
    hardwareId,
    creationDate.toISOString(),
    expirationDate.toISOString()
  ].join('|');
  
  const hash = crypto.createHash('sha256').update(baseData).digest('hex');
  const hmacSignature = crypto.createHmac('sha256', HMAC_KEY).update(baseData).digest('hex');
  
  const license: LicenseData = {
    estudiante: studentName,
    license_id: licenseId,
    hardware_id: hardwareId,
    fecha_creacion: creationDate.toISOString(),
    fecha_expiracion: expirationDate.toISOString(),
    hash: hash,
    firma_hmac: hmacSignature,
    version: "11.0",
    tipo: "PRO MAX"
  };
  
  return license;
}

export function licenseToFileContent(license: LicenseData): string {
  return JSON.stringify(license, null, 2);
}

export function generateLicenseFilename(studentName: string, licenseId: string): string {
  const safeName = studentName.replace(/[^a-zA-Z0-9]/g, '_');
  return `${safeName}_NIXCRM_V11_${licenseId.substring(0, 8)}.lic`;
}
