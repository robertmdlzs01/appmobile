import { ticketsApi, TicketValidation } from '@/services/tickets.api';
import { useEffect, useRef, useState } from 'react';

interface UseTicketValidationReturn {
  validation: TicketValidation | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const POLLING_INTERVAL = 1500; 
const POLLING_INTERVAL_SCANNED = 800; 

export function useTicketValidation(
  ticketId: string | null | undefined,
  enabled: boolean = true
): UseTicketValidationReturn {
  const [validation, setValidation] = useState<TicketValidation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollingIntervalRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);
  const previousValidationRef = useRef<TicketValidation | null>(null);

  const fetchValidation = async () => {
    if (!ticketId || !enabled) return;

    try {
      setError(null);
      const response = await ticketsApi.getTicketValidation(ticketId);
      
      if (response.success && response.data && isMountedRef.current) {
        const newValidation = response.data.validation;
        
        
        setValidation(newValidation);
        
        
        if (newValidation?.validated && !previousValidationRef.current?.validated) {
          
          console.log('✅ Ticket validado en tiempo real!');
          
          setValidation({ ...newValidation });
        }
        
        previousValidationRef.current = newValidation;
      } else if (isMountedRef.current) {
        setError(response.message || 'Error al obtener validación');
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        setError(err.message || 'Error de conexión');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const refresh = async () => {
    if (!ticketId || !enabled) return;
    setLoading(true);
    await fetchValidation();
  };

  useEffect(() => {
    isMountedRef.current = true;
    
    if (!ticketId || !enabled) {
      setValidation(null);
      previousValidationRef.current = null;
      return;
    }

    
    setLoading(true);
    fetchValidation();

    
    let interval = POLLING_INTERVAL;
    
    const checkAndSetupPolling = () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      
      
      const currentValidation = previousValidationRef.current;
      if (currentValidation?.validationStatus === 'scanned' && !currentValidation?.validated) {
        interval = POLLING_INTERVAL_SCANNED;
      } else if (currentValidation?.validated) {
        interval = POLLING_INTERVAL * 2; 
      } else {
        interval = POLLING_INTERVAL;
      }
      
      pollingIntervalRef.current = setInterval(() => {
        fetchValidation();
        
        const newValidation = previousValidationRef.current;
        let newInterval = POLLING_INTERVAL;
        if (newValidation?.validationStatus === 'scanned' && !newValidation?.validated) {
          newInterval = POLLING_INTERVAL_SCANNED;
        } else if (newValidation?.validated) {
          newInterval = POLLING_INTERVAL * 2;
        }
        
        if (newInterval !== interval) {
          interval = newInterval;
          checkAndSetupPolling();
        }
      }, interval) as unknown as number;
    };

    checkAndSetupPolling();

    return () => {
      isMountedRef.current = false;
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [ticketId, enabled]);

  return {
    validation,
    loading,
    error,
    refresh,
  };
}



