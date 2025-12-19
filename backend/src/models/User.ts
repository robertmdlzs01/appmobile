import bcrypt from 'bcryptjs';
import pool from '../config/database';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  profileImage?: string;
  role: 'user' | 'staff' | 'admin';
  passwordHash?: string; // Solo para creación/actualización, nunca se retorna
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserData {
  email: string;
  name: string;
  password: string;
  phone?: string;
  role?: 'user' | 'staff' | 'admin';
}

export interface UpdateUserData {
  name?: string;
  phone?: string;
  profileImage?: string;
}

export class UserModel {
  
  static async createUser(userData: CreateUserData): Promise<User> {
    try {
      const { email, name, password, phone, role = 'user' } = userData;
      
      // Verificar si el email ya existe
      const existingUser = await this.getUserByEmail(email);
      if (existingUser) {
        throw new Error('El email ya está registrado');
      }

      // Hash de la contraseña
      const passwordHash = await bcrypt.hash(password, 10);
      const id = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      await pool.execute(
        `
        INSERT INTO users (
          id,
          email,
          name,
          phone,
          password_hash,
          role,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
        `,
        [id, email, name, phone || null, passwordHash, role]
      );

      return await this.getUserById(id) as User;
    } catch (error: any) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  }

  
  static async getUserById(id: string): Promise<User | null> {
    try {
      const [rows] = await pool.execute(
        `
        SELECT 
          id,
          email,
          name,
          phone,
          profile_image as profileImage,
          role,
          created_at as createdAt,
          updated_at as updatedAt
        FROM users
        WHERE id = ?
        `,
        [id]
      );

      const users = rows as any[];
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      throw error;
    }
  }

  
  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const [rows] = await pool.execute(
        `
        SELECT 
          id,
          email,
          name,
          phone,
          profile_image as profileImage,
          role,
          password_hash as passwordHash,
          created_at as createdAt,
          updated_at as updatedAt
        FROM users
        WHERE email = ?
        `,
        [email]
      );

      const users = rows as any[];
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error('Error al obtener usuario por email:', error);
      throw error;
    }
  }

  
  static async verifyCredentials(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        return null;
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return null;
      }

      // Retornar usuario sin passwordHash
      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    } catch (error) {
      console.error('Error al verificar credenciales:', error);
      throw error;
    }
  }

  
  static async updateUser(userId: string, userData: UpdateUserData): Promise<User> {
    try {
      const updates: string[] = [];
      const values: any[] = [];

      if (userData.name !== undefined) {
        updates.push('name = ?');
        values.push(userData.name);
      }

      if (userData.phone !== undefined) {
        updates.push('phone = ?');
        values.push(userData.phone);
      }

      if (userData.profileImage !== undefined) {
        updates.push('profile_image = ?');
        values.push(userData.profileImage);
      }

      if (updates.length === 0) {
        return await this.getUserById(userId) as User;
      }

      updates.push('updated_at = NOW()');
      values.push(userId);

      await pool.execute(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      return await this.getUserById(userId) as User;
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  }

  
  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      const user = await this.getUserById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Obtener password hash actual
      const [rows] = await pool.execute(
        'SELECT password_hash as passwordHash FROM users WHERE id = ?',
        [userId]
      );

      const users = rows as any[];
      if (users.length === 0 || !users[0].passwordHash) {
        throw new Error('Usuario no encontrado');
      }

      // Verificar contraseña actual
      const isValid = await bcrypt.compare(currentPassword, users[0].passwordHash);
      if (!isValid) {
        throw new Error('Contraseña actual incorrecta');
      }

      // Hash de la nueva contraseña
      const newPasswordHash = await bcrypt.hash(newPassword, 10);

      // Actualizar contraseña
      await pool.execute(
        'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
        [newPasswordHash, userId]
      );

      return true;
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      throw error;
    }
  }

  
  static async isStaff(userId: string): Promise<boolean> {
    try {
      const user = await this.getUserById(userId);
      return user ? (user.role === 'staff' || user.role === 'admin') : false;
    } catch (error) {
      console.error('Error al verificar rol de staff:', error);
      return false;
    }
  }
}

