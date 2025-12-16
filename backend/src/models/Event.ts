import pool from '../config/database';

export interface Event {
  id: string;
  name: string;
  subtitle?: string;
  description?: string;
  fullDescription?: string;
  date: string;
  time: string;
  location: string;
  price: number;
  category: string;
  images?: string[];
  videoUrl?: string | null;
  promoter?: string;
  instructions?: string[];
  availableTickets?: number;
  soldTickets?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EventsQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
  featured?: boolean;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export class EventModel {
  /**
   * Obtiene eventos con filtros opcionales
   */
  static async getEvents(params?: EventsQueryParams): Promise<Event[]> {
    try {
      let query = `
        SELECT 
          id,
          name,
          subtitle,
          description,
          full_description as fullDescription,
          date,
          time,
          location,
          price,
          category,
          images,
          video_url as videoUrl,
          promoter,
          instructions,
          available_tickets as availableTickets,
          sold_tickets as soldTickets,
          status,
          created_at as createdAt,
          updated_at as updatedAt
        FROM events
        WHERE 1=1
      `;

      const queryParams: any[] = [];

      if (params?.category) {
        query += ' AND category = ?';
        queryParams.push(params.category);
      }

      if (params?.status) {
        query += ' AND status = ?';
        queryParams.push(params.status);
      }

      if (params?.dateFrom) {
        query += ' AND date >= ?';
        queryParams.push(params.dateFrom);
      }

      if (params?.dateTo) {
        query += ' AND date <= ?';
        queryParams.push(params.dateTo);
      }

      if (params?.search) {
        query += ` AND (
          name LIKE ? OR 
          description LIKE ? OR 
          subtitle LIKE ? OR 
          location LIKE ?
        )`;
        const searchTerm = `%${params.search}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }

      if (params?.featured) {
        query += ' AND featured = 1';
      }

      query += ' ORDER BY date ASC, created_at DESC';

      // Aplicar paginación
      if (params?.limit) {
        const offset = params.page ? (params.page - 1) * params.limit : 0;
        query += ' LIMIT ? OFFSET ?';
        queryParams.push(params.limit, offset);
      }

      const [rows] = await pool.execute(query, queryParams);

      return (rows as any[]).map((row) => ({
        ...row,
        images: row.images ? JSON.parse(row.images) : [],
        instructions: row.instructions ? JSON.parse(row.instructions) : [],
      }));
    } catch (error) {
      console.error('Error al obtener eventos:', error);
      throw error;
    }
  }

  /**
   * Obtiene un evento por ID
   */
  static async getEventById(id: string): Promise<Event | null> {
    try {
      const [rows] = await pool.execute(
        `
        SELECT 
          id,
          name,
          subtitle,
          description,
          full_description as fullDescription,
          date,
          time,
          location,
          price,
          category,
          images,
          video_url as videoUrl,
          promoter,
          instructions,
          available_tickets as availableTickets,
          sold_tickets as soldTickets,
          status,
          created_at as createdAt,
          updated_at as updatedAt
        FROM events
        WHERE id = ?
        `,
        [id]
      );

      const events = rows as any[];
      if (events.length === 0) {
        return null;
      }

      const event = events[0];
      return {
        ...event,
        images: event.images ? JSON.parse(event.images) : [],
        instructions: event.instructions ? JSON.parse(event.instructions) : [],
      };
    } catch (error) {
      console.error('Error al obtener evento:', error);
      throw error;
    }
  }

  /**
   * Obtiene eventos destacados
   */
  static async getFeaturedEvents(limit: number = 10): Promise<Event[]> {
    try {
      const [rows] = await pool.execute(
        `
        SELECT 
          id,
          name,
          subtitle,
          description,
          full_description as fullDescription,
          date,
          time,
          location,
          price,
          category,
          images,
          video_url as videoUrl,
          promoter,
          instructions,
          available_tickets as availableTickets,
          sold_tickets as soldTickets,
          status,
          created_at as createdAt,
          updated_at as updatedAt
        FROM events
        WHERE featured = 1 AND status = 'published'
        ORDER BY created_at DESC
        LIMIT ?
        `,
        [limit]
      );

      return (rows as any[]).map((row) => ({
        ...row,
        images: row.images ? JSON.parse(row.images) : [],
        instructions: row.instructions ? JSON.parse(row.instructions) : [],
      }));
    } catch (error) {
      console.error('Error al obtener eventos destacados:', error);
      throw error;
    }
  }

  /**
   * Cuenta el total de eventos (para paginación)
   */
  static async countEvents(params?: EventsQueryParams): Promise<number> {
    try {
      let query = 'SELECT COUNT(*) as total FROM events WHERE 1=1';
      const queryParams: any[] = [];

      if (params?.category) {
        query += ' AND category = ?';
        queryParams.push(params.category);
      }

      if (params?.status) {
        query += ' AND status = ?';
        queryParams.push(params.status);
      }

      if (params?.dateFrom) {
        query += ' AND date >= ?';
        queryParams.push(params.dateFrom);
      }

      if (params?.dateTo) {
        query += ' AND date <= ?';
        queryParams.push(params.dateTo);
      }

      if (params?.search) {
        query += ` AND (
          name LIKE ? OR 
          description LIKE ? OR 
          subtitle LIKE ? OR 
          location LIKE ?
        )`;
        const searchTerm = `%${params.search}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }

      if (params?.featured) {
        query += ' AND featured = 1';
      }

      const [rows] = await pool.execute(query, queryParams);
      return (rows as any[])[0].total;
    } catch (error) {
      console.error('Error al contar eventos:', error);
      throw error;
    }
  }
}

