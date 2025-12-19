import { ApiResponse, apiService } from './api';

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
  
  getEvents: async (params?: EventsQueryParams): Promise<ApiResponse<Event[]>> => {
    try {
      return await apiService.get<Event[]>('/events', params);
    } catch (error: any) {
    return {
        success: false,
        message: error.message || 'Error al obtener eventos',
    };
    }
  },

  
  getEventById: async (id: string): Promise<ApiResponse<Event>> => {
    try {
      return await apiService.get<Event>(`/events/${id}`);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al obtener evento',
      };
    }
  },

  
  getFeaturedEvents: async (limit: number = 10): Promise<ApiResponse<Event[]>> => {
    try {
      return await apiService.get<Event[]>('/events/featured', { limit });
    } catch (error: any) {
    return {
        success: false,
        message: error.message || 'Error al obtener eventos destacados',
    };
    }
  },
};

