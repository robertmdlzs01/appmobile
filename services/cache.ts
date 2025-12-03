
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Event {
  id: string;
  name?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  date: string;
  time: string;
  location: string;
  venue?: string;
  price: number;
  category: string;
  images?: string[];
  imageUrl?: string;
  videoUrl?: string | null;
  promoter?: string;
  instructions?: string[];
  availableTickets?: number;
  soldTickets?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Ticket {
  id: string;
  eventId: string;
  eventName?: string;
  date?: string;
  time?: string;
  venue?: string;
  seat?: string;
  location?: string;
  quantity?: number;
  status?: string;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class CacheService {
  private readonly CACHE_DURATION = {
    EVENTS: 5 * 60 * 1000,      
    EVENT_DETAIL: 10 * 60 * 1000, 
    TICKETS: 2 * 60 * 1000,      
    USER: 30 * 60 * 1000,        
  };

  private readonly STORAGE_KEYS = {
    EVENTS: '@eventu_cache_events',
    EVENT_DETAIL: '@eventu_cache_event_detail_',
    TICKETS: '@eventu_cache_tickets',
    USER: '@eventu_cache_user',
  };

  private async getCached<T>(
    key: string,
    maxAge: number
  ): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(key);
      if (!cached) return null;

      const entry: CacheEntry<T> = JSON.parse(cached);
      const age = Date.now() - entry.timestamp;

      if (age > maxAge) {
        
        await AsyncStorage.removeItem(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error(`Error reading cache [${key}]:`, error);
      return null;
    }
  }

  private async setCached<T>(key: string, data: T): Promise<void> {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(key, JSON.stringify(entry));
    } catch (error) {
      console.error(`Error writing cache [${key}]:`, error);
    }
  }

  async clearCache(key?: string): Promise<void> {
    if (key) {
      await AsyncStorage.removeItem(key);
    } else {
      
      const keys = Object.values(this.STORAGE_KEYS);
      await Promise.all(keys.map(k => AsyncStorage.removeItem(k)));
    }
  }

  async getCachedEvents(): Promise<Event[] | null> {
    return this.getCached<Event[]>(
      this.STORAGE_KEYS.EVENTS,
      this.CACHE_DURATION.EVENTS
    );
  }

  async cacheEvents(events: Event[]): Promise<void> {
    await this.setCached(this.STORAGE_KEYS.EVENTS, events);
  }

  async setCachedEvents(events: Event[]): Promise<void> {
    await this.cacheEvents(events);
  }

  async getCachedEventDetail(eventId: string): Promise<Event | null> {
    return this.getCached<Event>(
      `${this.STORAGE_KEYS.EVENT_DETAIL}${eventId}`,
      this.CACHE_DURATION.EVENT_DETAIL
    );
  }

  async cacheEventDetail(eventId: string, event: Event): Promise<void> {
    await this.setCached(`${this.STORAGE_KEYS.EVENT_DETAIL}${eventId}`, event);
  }

  async setCachedEventDetail(eventId: string, event: Event): Promise<void> {
    await this.cacheEventDetail(eventId, event);
  }

  async getCachedTickets(): Promise<Ticket[] | null> {
    return this.getCached<Ticket[]>(
      this.STORAGE_KEYS.TICKETS,
      this.CACHE_DURATION.TICKETS
    );
  }

  async setCachedTickets(tickets: Ticket[]): Promise<void> {
    await this.setCached(this.STORAGE_KEYS.TICKETS, tickets);
  }

  async isOnline(): Promise<boolean> {
    
    return true;
  }
}

export const cacheService = new CacheService();
