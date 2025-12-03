import { useState, useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { cacheService } from '@/services/cache';
import { eventsApi, Event } from '@/services/events.api';

interface UseEventsReturn {
  events: Event[];
  featuredEvents: Event[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  refresh: () => Promise<void>;
}

export function useEvents(forceRefresh = false): UseEventsReturn {
  const [events, setEvents] = useState<Event[]>([]);
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadEvents = useCallback(async (force = false) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!force) {
        const cached = await cacheService.getCachedEvents();
        if (cached && cached.length > 0) {
          setEvents(cached);
          setLoading(false);
        }
      }

      const eventsResponse = await eventsApi.getEvents({
        limit: 100,
        status: 'publish',
      });
      
      if (eventsResponse.success && eventsResponse.data && Array.isArray(eventsResponse.data)) {
        setEvents(eventsResponse.data);
        await cacheService.cacheEvents(eventsResponse.data);
        setError(null);
      } else {
        throw new Error('Formato de respuesta inválido');
      }

      try {
        const featuredResponse = await eventsApi.getFeaturedEvents(10);

        if (featuredResponse.success && featuredResponse.data && Array.isArray(featuredResponse.data)) {
          setFeaturedEvents(featuredResponse.data);
        }
      } catch (err) {
        console.warn('No se pudieron cargar eventos destacados, usando primeros eventos');
      }
    } catch (err: any) {
      if (__DEV__) {
        console.error('Error loading events:', err);
      }
      
      const cached = await cacheService.getCachedEvents();
      if (cached && cached.length > 0) {
        setEvents(cached);
        setError(null);
      } else {
        setError(err.message || 'Error al cargar eventos');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await loadEvents(true);
  }, [loadEvents]);

  useEffect(() => {
    loadEvents(forceRefresh);
  }, [loadEvents, forceRefresh]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadEvents(true);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [loadEvents]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        loadEvents(true);
      }
    });

    return () => subscription.remove();
  }, [loadEvents]);

  return {
    events,
    featuredEvents,
    loading,
    error,
    refreshing,
    refresh,
  };
}

export function useEvent(eventId: string) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        setLoading(true);
        
        const cached = await cacheService.getCachedEventDetail(eventId);
        if (cached) {
          setEvent(cached);
          setLoading(false);
        }

        const response = await eventsApi.getEventById(eventId);
        
        if (response.success && response.data) {
          setEvent(response.data);
          await cacheService.cacheEventDetail(eventId, response.data);
        } else {
          throw new Error('Evento no encontrado');
        }

        setError(null);
      } catch (err: any) {
        if (__DEV__) {
          console.error('Error loading event:', err);
        }
        
        const cached = await cacheService.getCachedEventDetail(eventId);
        if (cached) {
          setEvent(cached);
          setError(null);
        } else {
          setError(err.message || 'Evento no encontrado');
        }
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      loadEvent();
    }
  }, [eventId]);

  return { event, loading, error };
}
