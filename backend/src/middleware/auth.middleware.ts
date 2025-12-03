import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email?: string;
    [key: string]: any;
  };
}

/**
 * Middleware para verificar JWT token
 */
export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Token de autenticación requerido',
      });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      logger.error('JWT_SECRET no está definido en las variables de entorno');
      res.status(500).json({
        success: false,
        message: 'Error de configuración del servidor',
      });
      return;
    }

    jwt.verify(token, jwtSecret, (err, decoded) => {
      if (err) {
        logger.warn(`Token inválido: ${err.message}`);
        res.status(403).json({
          success: false,
          message: 'Token inválido o expirado',
        });
        return;
      }

      req.user = decoded as { id: string; email?: string; [key: string]: any };
      next();
    });
  } catch (error) {
    logger.error('Error en middleware de autenticación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar autenticación',
    });
  }
};

/**
 * Middleware opcional para verificar token (no falla si no existe)
 */
export const optionalAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const jwtSecret = process.env.JWT_SECRET;
      if (jwtSecret) {
        jwt.verify(token, jwtSecret, (err, decoded) => {
          if (!err) {
            req.user = decoded as { id: string; email?: string; [key: string]: any };
          }
        });
      }
    }
    next();
  } catch (error) {
    next();
  }
};

/**
 * Verifica el secret del webhook de WordPress
 */
export const verifyWebhookSecret = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const webhookSecret = process.env.WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      logger.warn('WEBHOOK_SECRET no está definido, saltando verificación');
      next();
      return;
    }

    const providedSecret = req.headers['x-webhook-secret'] || req.body.secret;

    if (!providedSecret || providedSecret !== webhookSecret) {
      logger.warn('Intento de webhook con secret inválido');
      res.status(401).json({
        success: false,
        message: 'Secret de webhook inválido',
      });
      return;
    }

    next();
  } catch (error) {
    logger.error('Error al verificar webhook secret:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar webhook',
    });
  }
};
