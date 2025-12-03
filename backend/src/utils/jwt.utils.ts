import jwt from 'jsonwebtoken';

export interface JWTPayload {
  id: string;
  email?: string;
  [key: string]: any;
}

/**
 * Genera un token JWT
 */
export const generateToken = (payload: JWTPayload): string => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  if (!secret) {
    throw new Error('JWT_SECRET no está definido en las variables de entorno');
  }

  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Verifica y decodifica un token JWT
 */
export const verifyToken = (token: string): JWTPayload => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET no está definido en las variables de entorno');
  }

  return jwt.verify(token, secret) as JWTPayload;
};
