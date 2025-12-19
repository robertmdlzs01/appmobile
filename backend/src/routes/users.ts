import { Response, Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { UpdateUserData, UserModel } from '../models/User';

const router = Router();


router.get('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
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
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener perfil',
    });
  }
});


router.put('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
      });
    }

    const updateData: UpdateUserData = {};
    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.phone !== undefined) updateData.phone = req.body.phone;
    if (req.body.profileImage !== undefined) updateData.profileImage = req.body.profileImage;

    const updatedUser = await UserModel.updateUser(userId, updateData);

    res.json({
      success: true,
      data: { user: updatedUser },
      message: 'Perfil actualizado correctamente',
    });
  } catch (error: any) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al actualizar perfil',
    });
  }
});


router.post('/change-password', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
      });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Contraseña actual y nueva contraseña son requeridas',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La nueva contraseña debe tener al menos 6 caracteres',
      });
    }

    await UserModel.changePassword(userId, currentPassword, newPassword);

    res.json({
      success: true,
      message: 'Contraseña actualizada correctamente',
    });
  } catch (error: any) {
    console.error('Error al cambiar contraseña:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error al cambiar contraseña',
    });
  }
});

export default router;

