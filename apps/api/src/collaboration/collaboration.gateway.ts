import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

interface CollaborationUser {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
}

interface FormUpdate {
  type: 'fields' | 'theme' | 'formSettings';
  data: any;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/collaboration',
})
export class CollaborationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('CollaborationGateway');
  private formSessions: Map<string, Map<string, CollaborationUser>> = new Map();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // Remove user from all form sessions
    for (const [formId, users] of this.formSessions) {
      if (users.has(client.id)) {
        const user = users.get(client.id);
        users.delete(client.id);
        
        // Notify other users
        client.to(formId).emit('user_left', {
          userId: user?.id,
          userName: user?.displayName,
        });
        
        // Update collaborators list
        this.broadcastCollaborators(formId);
      }
    }
  }

  @SubscribeMessage('join_form')
  async handleJoinForm(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { formId: string; user: CollaborationUser },
  ) {
    const { formId, user } = data;
    
    // Join the form room
    await client.join(formId);
    
    // Add user to session
    if (!this.formSessions.has(formId)) {
      this.formSessions.set(formId, new Map());
    }
    
    this.formSessions.get(formId)!.set(client.id, user);
    
    // Notify other users
    client.to(formId).emit('user_joined', { user });
    
    // Send current collaborators list
    this.broadcastCollaborators(formId);
    
    this.logger.log(`User ${user.displayName} joined form ${formId}`);
  }

  @SubscribeMessage('form_update')
  handleFormUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { formId: string; update: FormUpdate },
  ) {
    const { formId, update } = data;
    
    // Broadcast to all other users in the form (except sender)
    client.to(formId).emit('form_update', update);
    
    this.logger.log(`Form update in ${formId}: ${update.type}`);
  }

  @SubscribeMessage('cursor_move')
  handleCursorMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { formId: string; position: { x: number; y: number } },
  ) {
    const { formId, position } = data;
    
    // Get user info
    const user = this.formSessions.get(formId)?.get(client.id);
    
    if (user) {
      // Broadcast cursor position to all other users in the form
      client.to(formId).emit('cursor_update', {
        userId: user.id,
        position,
      });
    }
  }

  @SubscribeMessage('leave_form')
  async handleLeaveForm(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { formId: string },
  ) {
    const { formId } = data;
    
    await client.leave(formId);
    
    // Remove from session
    const formSession = this.formSessions.get(formId);
    if (formSession?.has(client.id)) {
      const user = formSession.get(client.id);
      formSession.delete(client.id);
      
      // Notify other users
      client.to(formId).emit('user_left', {
        userId: user?.id,
        userName: user?.displayName,
      });
      
      // Update collaborators list
      this.broadcastCollaborators(formId);
    }
    
    this.logger.log(`User left form ${formId}`);
  }

  private broadcastCollaborators(formId: string) {
    const collaborators = Array.from(this.formSessions.get(formId)?.values() || []);
    this.server.to(formId).emit('collaborators_list', { collaborators });
  }
}
