import { z } from 'zod';

/** RUC ecuatoriano: 13 dígitos, tercer dígito 0-5 (natural) o 6/9 (jurídico), termina en 001 */
export const rucSchema = z.string().refine((val) => {
  if (!/^\d{13}$/.test(val)) return false;
  if (!val.endsWith('001')) return false;
  const tercero = parseInt(val[2]!, 10);
  if (![0,1,2,3,4,5,6,9].includes(tercero)) return false;
  // Validate province code (01-24) or special (30)
  const provincia = parseInt(val.substring(0, 2), 10);
  if (provincia < 1 || (provincia > 24 && provincia !== 30)) return false;
  return true;
}, { message: 'RUC ecuatoriano inválido' });

/** Cédula ecuatoriana: 10 dígitos con algoritmo de dígito verificador */
export const cedulaSchema = z.string().refine((val) => {
  if (!/^\d{10}$/.test(val)) return false;
  const provincia = parseInt(val.substring(0, 2), 10);
  if (provincia < 1 || provincia > 24) return false;
  const tercero = parseInt(val[2]!, 10);
  if (tercero > 5) return false;
  // Luhn-like algorithm for Ecuadorian cédula
  const coefs = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let prod = parseInt(val[i]!, 10) * coefs[i]!;
    if (prod >= 10) prod -= 9;
    sum += prod;
  }
  const verificador = sum % 10 === 0 ? 0 : 10 - (sum % 10);
  return verificador === parseInt(val[9]!, 10);
}, { message: 'Cédula ecuatoriana inválida' });

/** 24 provincias del Ecuador */
export const PROVINCIAS_ECUADOR = [
  'Azuay', 'Bolívar', 'Cañar', 'Carchi', 'Chimborazo', 'Cotopaxi',
  'El Oro', 'Esmeraldas', 'Galápagos', 'Guayas', 'Imbabura', 'Loja',
  'Los Ríos', 'Manabí', 'Morona Santiago', 'Napo', 'Orellana', 'Pastaza',
  'Pichincha', 'Santa Elena', 'Santo Domingo de los Tsáchilas',
  'Sucumbíos', 'Tungurahua', 'Zamora Chinchipe',
] as const;

export const provinciaSchema = z.enum(PROVINCIAS_ECUADOR);

/** Teléfono ecuatoriano: 09XXXXXXXX (celular) o 0X-XXXXXXX (fijo) */
export const telefonoEcSchema = z.string().refine((val) => {
  const clean = val.replace(/[\s\-()]/g, '');
  return /^09\d{8}$/.test(clean) || /^0[2-7]\d{7}$/.test(clean);
}, { message: 'Teléfono ecuatoriano inválido' });
