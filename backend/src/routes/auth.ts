import { Request, Response, Router } from 'express';
import jwt from 'jsonwebtoken';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { UserModel } from '../models/User';

const router = Router();

/**
 * Genera un token JWT
 */
function generateToken(user: { id: string; email: string; role: string }): string {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';

  if (!jwtSecret) {
    throw new Error('JWT_SECRET no configurado');
  }

  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    jwtSecret,
    { expiresIn: jwtExpiresIn } as jwt.SignOptions
  );
}

/**
 * POST /api/auth/register
 * Registra un nuevo usuario
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, name, password, phone } = req.body;

    // Validaciones
    if (!email || !name || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email, nombre y contraseña son requeridos',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres',
      });
    }

    // Crear usuario
    const user = await UserModel.createUser({
      email,
      name,
      password,
      phone,
      role: 'user',
    });

    // Generar token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Retornar usuario sin datos sensibles
    const { passwordHash, ...userWithoutPassword } = user as any;

    res.status(201).json({
      success: true,
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  } catch (error: any) {
    console.error('Error en registro:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error al registrar usuario',
    });
  }
});

/**
 * POST /api/auth/login
 * Inicia sesión
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos',
      });
    }

    // Verificar credenciales
    const user = await UserModel.verifyCredentials(email, password);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
      });
    }

    // Generar token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      success: true,
      data: {
        user,
        token,
      },
    });
  } catch (error: any) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al iniciar sesión',
    });
  }
});

/**
 * POST /api/auth/refresh
 * Refresca el token (requiere autenticación)
 */
router.post('/refresh', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
      });
    }

    const user = await UserModel.getUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // Generar nuevo token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      success: true,
      data: {
        user,
        token,
      },
    });
  } catch (error: any) {
    console.error('Error al refrescar token:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al refrescar token',
    });
  }
});

/**
 * GET /api/auth/me
 * Obtiene el usuario actual (requiere autenticación)
 */
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
      });
    }

    const user = await UserModel.getUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error: any) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener usuario',
    });
  }
});

export default router;

