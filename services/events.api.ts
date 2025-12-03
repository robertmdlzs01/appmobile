import { apiService, ApiResponse } from './api';

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

export const eventsApi = {
  /**
   * Obtiene lista de eventos con filtros opcionales
   */
  getEvents: async (params?: EventsQueryParams): Promise<ApiResponse<Event[]>> => {
    return apiService.get<Event[]>('/events', params);
  },

  /**
   * Obtiene detalles de un evento específico
   */
  getEventById: async (id: string): Promise<ApiResponse<Event>> => {
    return apiService.get<Event>(`/events/${id}`);
  },

  /**
   * Obtiene eventos destacados
   */
  getFeaturedEvents: async (limit: number = 10): Promise<ApiResponse<Event[]>> => {
    return apiService.get<Event[]>('/events/featured', { limit });
  },
};

