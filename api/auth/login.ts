import type { VercelRequest, VercelResponse } from '@vercel/node';

// Credenciales por defecto — cámbialas en las variables de entorno de Vercel
const MASTER_USER = process.env.MASTER_USERNAME || 'Admin';
const MASTER_PASS = process.env.MASTER_PASSWORD || 'Admin';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { username, password } = req.body;

  if (username === MASTER_USER && password === MASTER_PASS) {
    return res.json({ success: true, message: 'Login successful' });
  } else {
    return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
  }
}
