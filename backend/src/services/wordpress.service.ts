import axios, { AxiosError, AxiosInstance } from 'axios';
import { WordPressConfig, getWordPressAuthHeader } from '../config/wordpress';
import logger from '../utils/logger';

export interface WordPressPost {
  id: number;
  date: string;
  date_gmt: string;
  modified: string;
  modified_gmt: string;
  slug: string;
  status: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
    protected: boolean;
  };
  excerpt: {
    rendered: string;
    protected: boolean;
  };
  acf?: {
    [key: string]: any;
  };
  featured_media?: number;
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
      media_details?: {
        sizes?: {
          [key: string]: {
            source_url: string;
          };
        };
      };
    }>;
  };
}

export interface WordPressEventData {
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
  status: string;
  slug: string;
  featured?: boolean;
}

export class WordPressService {
  private axiosInstance: AxiosInstance;
  private config: WordPressConfig;

  constructor(config: WordPressConfig) {
    this.config = config;
    const authHeader = getWordPressAuthHeader(config);

    this.axiosInstance = axios.create({
      baseURL: config.apiUrl,
      timeout: 30000,
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    this.axiosInstance.interceptors.request.use(
      (config) => {
        logger.debug(`WordPress API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error('Error en request a WordPress:', error);
        return Promise.reject(error);
      }
    );

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response) {
          logger.error(
            `WordPress API Error: ${error.response.status} - ${error.response.statusText}`,
            {
              url: error.config?.url,
              data: error.response.data,
            }
          );
        } else if (error.request) {
          logger.error('No se recibió respuesta de WordPress API', {
            url: error.config?.url,
          });
        } else {
          logger.error('Error al configurar request a WordPress:', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Obtiene todos los eventos desde WordPress
   */
  async fetchEvents(params?: {
    page?: number;
    per_page?: number;
    status?: string;
    after?: string;
    before?: string;
  }): Promise<WordPressPost[]> {
    try {
      const queryParams = {
        per_page: params?.per_page || 100,
        page: params?.page || 1,
        status: params?.status || 'publish',
        _embed: true,
        ...(params?.after && { after: params.after }),
        ...(params?.before && { before: params.before }),
      };

      const response = await this.axiosInstance.get<WordPressPost[]>(
        `/${this.config.eventPostType}`,
        { params: queryParams }
      );

      logger.info(`✅ Obtenidos ${response.data.length} eventos de WordPress`);
      return response.data;
    } catch (error) {
      logger.error('Error al obtener eventos de WordPress:', error);
      throw error;
    }
  }

  /**
   * Obtiene un evento específico por ID
   */
  async fetchEventById(id: number): Promise<WordPressPost> {
    try {
      const response = await this.axiosInstance.get<WordPressPost>(
        `/${this.config.eventPostType}/${id}`,
        { params: { _embed: true } }
      );

      logger.info(`✅ Obtenido evento ${id} de WordPress`);
      return response.data;
    } catch (error) {
      logger.error(`Error al obtener evento ${id} de WordPress:`, error);
      throw error;
    }
  }

  /**
   * Convierte un post de WordPress al formato de evento de la app
   */
  transformWordPressPostToEvent(post: WordPressPost): WordPressEventData {
    const acf = post.acf || {};
    
    const images: string[] = [];
    if (post._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
      images.push(post._embedded['wp:featuredmedia'][0].source_url);
    }
    if (acf.images && Array.isArray(acf.images)) {
      images.push(...acf.images);
    }

    const postDate = new Date(post.date);
    const date = postDate.toISOString().split('T')[0];
    const time = postDate.toTimeString().split(' ')[0].substring(0, 5);

    return {
      id: post.id.toString(),
      name: post.title.rendered,
      subtitle: acf.subtitle || this.extractSubtitle(post.excerpt.rendered),
      description: this.stripHtml(post.excerpt.rendered),
      fullDescription: this.stripHtml(post.content.rendered),
      date: acf.date || date,
      time: acf.time || time,
      location: acf.location || 'Ubicación no especificada',
      price: parseFloat(acf.price) || 0,
      category: acf.category || 'General',
      images: images.length > 0 ? images : undefined,
      videoUrl: acf.video_url || acf.videoUrl || null,
      promoter: acf.promoter || 'Eventu',
      instructions: acf.instructions || [],
      availableTickets: acf.available_tickets || acf.availableTickets,
      soldTickets: acf.sold_tickets || acf.soldTickets || 0,
      status: post.status,
      slug: post.slug,
      featured: acf.featured === true || acf.featured === 'true',
    };
  }

  /**
   * Extrae un subtítulo del excerpt si no está en ACF
   */
  private extractSubtitle(excerpt: string): string | undefined {
    const clean = this.stripHtml(excerpt);
    if (clean.length > 100) {
      return clean.substring(0, 100) + '...';
    }
    return clean || undefined;
  }

  /**
   * Elimina etiquetas HTML de un string
   */
  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }

  /**
   * Verifica la conexión con WordPress
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.axiosInstance.get('/');
      logger.info('✅ Conexión a WordPress verificada');
      return true;
    } catch (error) {
      logger.error('❌ Error al verificar conexión con WordPress:', error);
      return false;
    }
  }
}
