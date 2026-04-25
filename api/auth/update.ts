import type { VercelRequest, VercelResponse } from '@vercel/node';

// Nota: En Vercel no hay filesystem persistente.
// Para cambiar credenciales, actualiza las variables de entorno en el dashboard de Vercel.
export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  // En Vercel no se puede escribir archivos, retornamos mensaje informativo
  return res.status(200).json({ 
    success: false, 
    message: 'Para cambiar credenciales, actualiza MASTER_USERNAME y MASTER_PASSWORD en las variables de entorno de Vercel.' 
  });
}
