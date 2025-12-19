
import React, { createContext, useContext, useMemo } from 'react';
import { useEvents as useEventsHook } from '@/hooks/useEvents';
import { Event } from '@/constants/types';

interface AppContextType {
  events: Event[];
  featuredEvents: Event[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  refresh: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function transformEvent(apiEvent: any): Event {
  return {
    id: apiEvent.id,
    title: apiEvent.name || apiEvent.title,
    description: apiEvent.description || apiEvent.subtitle || '',
    date: apiEvent.date,
    time: apiEvent.time,
    venue: apiEvent.location || apiEvent.venue,
    location: apiEvent.location,
    price: apiEvent.price,
    category: apiEvent.category,
    imageUrl: apiEvent.images && apiEvent.images.length > 0 ? apiEvent.images[0] : apiEvent.imageUrl || '',
    images: apiEvent.images || [],
    videoUrl: apiEvent.videoUrl,
    promoter: apiEvent.promoter,
    instructions: apiEvent.instructions || [],
    availableTickets: apiEvent.availableTickets || 0,
    soldTickets: apiEvent.soldTickets || 0,
    status: apiEvent.status || 'published',
    createdAt: apiEvent.createdAt,
    updatedAt: apiEvent.updatedAt,
  };
}

export function AppContextProvider({ children }: { children: React.ReactNode }) {
  const { events: apiEvents, featuredEvents: apiFeaturedEvents, loading, error, refreshing, refresh } = useEventsHook();

  const events = useMemo(() => {
    return apiEvents.map(transformEvent);
  }, [apiEvents]);

  const featuredEvents = useMemo(() => {
    
    if (apiFeaturedEvents && apiFeaturedEvents.length > 0) {
      return apiFeaturedEvents.map(transformEvent);
    }
    return events.slice(0, 3);
  }, [apiFeaturedEvents, events]);

  const value: AppContextType = {
    events,
    featuredEvents,
    loading,
    error,
    refreshing,
    refresh,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useEvents() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an AppContextProvider');
  }
  return context;
}
