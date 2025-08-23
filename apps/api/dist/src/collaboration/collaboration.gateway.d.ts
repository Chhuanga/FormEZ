import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
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
export declare class CollaborationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private logger;
    private formSessions;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinForm(client: Socket, data: {
        formId: string;
        user: CollaborationUser;
    }): Promise<void>;
    handleFormUpdate(client: Socket, data: {
        formId: string;
        update: FormUpdate;
    }): void;
    handleCursorMove(client: Socket, data: {
        formId: string;
        position: {
            x: number;
            y: number;
        };
    }): void;
    handleLeaveForm(client: Socket, data: {
        formId: string;
    }): Promise<void>;
    private broadcastCollaborators;
}
export {};
