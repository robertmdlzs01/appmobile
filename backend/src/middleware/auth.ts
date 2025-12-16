import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: 'user' | 'staff' | 'admin';
    [key: string]: any;
  };
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token de autenticación requerido',
    });
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return res.status(500).json({
      success: false,
      message: 'Error de configuración del servidor',
    });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Token inválido o expirado',
    });
  }
};

// Middleware opcional - no requiere autenticación pero la usa si está presente
export const optionalAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    const jwtSecret = process.env.JWT_SECRET;
    if (jwtSecret) {
      try {
        const decoded = jwt.verify(token, jwtSecret) as any;
        req.user = decoded;
      } catch (error) {
        // Ignorar errores de token inválido en auth opcional
      }
    }
  }

  next();
};

/**
 * Middleware para verificar que el usuario es staff o admin
 */
export const requireStaff = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Primero verificar autenticación
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticación requerido',
      });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({
        success: false,
        message: 'Error de configuración del servidor',
      });
    }

    const decoded = jwt.verify(token, jwtSecret) as any;
    req.user = decoded;

    // Verificar que el usuario es staff o admin
    const isStaff = await UserModel.isStaff(decoded.id);
    if (!isStaff) {
      return res.status(403).json({
        success: false,
        message: 'Acceso restringido. Se requieren permisos de staff.',
      });
    }

    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Token inválido o expirado',
    });
  }
};

