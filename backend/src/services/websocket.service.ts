import { Server as HTTPServer } from 'http';
import { Socket, Server as SocketIOServer } from 'socket.io';
import logger from '../utils/logger';

export class WebSocketService {
  private io: SocketIOServer | null = null;

  /**
   * Inicializa Socket.IO
   */
  initialize(httpServer: HTTPServer): void {
    const corsOrigin = process.env.SOCKET_IO_CORS_ORIGIN || '*';
    
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: corsOrigin === '*' ? true : corsOrigin.split(','),
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    this.io.on('connection', (socket: Socket) => {
      logger.info(`Cliente conectado: ${socket.id}`);

      socket.join('events');

      socket.on('disconnect', () => {
        logger.info(`Cliente desconectado: ${socket.id}`);
      });

      socket.on('subscribe:events', () => {
        socket.join('events');
        logger.debug(`Cliente ${socket.id} suscrito a eventos`);
      });

      socket.on('unsubscribe:events', () => {
        socket.leave('events');
        logger.debug(`Cliente ${socket.id} desuscrito de eventos`);
      });
    });

    logger.info('✅ WebSocket service inicializado');
  }

  /**
   * Emite un evento a todos los clientes conectados
   */
  emitEvent(eventName: string, data: any): void {
    if (this.io) {
      this.io.to('events').emit(eventName, data);
      logger.debug(`Evento emitido: ${eventName}`, data);
    }
  }

  /**
   * Notifica sobre un nuevo evento sincronizado
   */
  notifyEventCreated(event: any): void {
    this.emitEvent('event:created', event);
  }

  /**
   * Notifica sobre un evento actualizado
   */
  notifyEventUpdated(event: any): void {
    this.emitEvent('event:updated', event);
  }

  /**
   * Notifica sobre un evento eliminado
   */
  notifyEventDeleted(eventId: string): void {
    this.emitEvent('event:deleted', { id: eventId });
  }

  /**
   * Obtiene el servidor de Socket.IO
   */
  getIO(): SocketIOServer | null {
    return this.io;
  }

  /**
   * Cierra las conexiones WebSocket
   */
  close(): void {
    if (this.io) {
      this.io.close();
      logger.info('WebSocket service cerrado');
    }
  }
}
