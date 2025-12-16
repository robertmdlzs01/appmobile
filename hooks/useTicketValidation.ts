import { ticketsApi, TicketValidation } from '@/services/tickets.api';
import { useEffect, useRef, useState } from 'react';

interface UseTicketValidationReturn {
  validation: TicketValidation | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const POLLING_INTERVAL = 2000; // Poll cada 2 segundos (más frecuente)
const POLLING_INTERVAL_SCANNED = 1000; // Poll cada 1 segundo cuando está escaneado

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
        
        // Actualizar inmediatamente si hay cambio de estado
        setValidation(newValidation);
        
        // Si el ticket fue validado, forzar actualización visual
        if (newValidation?.validated && !previousValidationRef.current?.validated) {
          // El estado ya se actualizó arriba, solo necesitamos asegurar que se refleje
          console.log('Ticket validado en tiempo real!');
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

    // Cargar inicialmente
    setLoading(true);
    fetchValidation();

    // Configurar polling - intervalo más frecuente cuando está escaneado
    let interval = POLLING_INTERVAL;
    
    const checkAndSetupPolling = () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      
      // Determinar intervalo basado en el estado actual
      const currentValidation = previousValidationRef.current;
      if (currentValidation?.validationStatus === 'scanned' && !currentValidation?.validated) {
        interval = POLLING_INTERVAL_SCANNED;
      } else if (currentValidation?.validated) {
        interval = POLLING_INTERVAL * 2; // Menos frecuente si ya está validado
      } else {
        interval = POLLING_INTERVAL;
      }
      
      pollingIntervalRef.current = setInterval(() => {
        fetchValidation();
        // Reajustar si cambió el estado
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



