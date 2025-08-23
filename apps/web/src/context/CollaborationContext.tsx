'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FormField, useFormStore } from '@/store/form';
import { toast } from 'sonner';

interface CollaborationUser {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
  cursor?: { x: number; y: number };
  lastSeen: Date;
}

interface CollaborationContextType {
  collaborators: CollaborationUser[];
  isConnected: boolean;
  isCollaborating: boolean;
  startCollaboration: (formId: string) => void;
  stopCollaboration: () => void;
  sendCursorPosition: (x: number, y: number) => void;
}

const CollaborationContext = createContext<CollaborationContextType>({
  collaborators: [],
  isConnected: false,
  isCollaborating: false,
  startCollaboration: () => {},
  stopCollaboration: () => {},
  sendCursorPosition: () => {},
});

export const useCollaboration = () => useContext(CollaborationContext);

interface CollaborationProviderProps {
  children: React.ReactNode;
}

export function CollaborationProvider({ children }: CollaborationProviderProps) {
  const { user } = useAuth();
  const [collaborators, setCollaborators] = useState<CollaborationUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isCollaborating, setIsCollaborating] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const formStoreRef = useRef(useFormStore.getState());

  // Subscribe to form store changes
  useEffect(() => {
    const unsubscribe = useFormStore.subscribe((state) => {
      formStoreRef.current = state;
    });
    return unsubscribe;
  }, []);

  const startCollaboration = async (formId: string) => {
    if (!user) return;

    try {
      // Import socket.io-client dynamically
      const { io } = await import('socket.io-client');
      
      const token = await user.getIdToken();
      const socket = io('http://localhost:3001/collaboration', {
        auth: {
          token,
        },
      });

      socket.on('connect', () => {
        setIsConnected(true);
        setIsCollaborating(true);
        toast.success('Connected to collaboration session');
        
        // Join the form room
        socket.emit('join_form', {
          formId,
          user: {
            id: user.uid,
            email: user.email,
            displayName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
            avatar: user.photoURL,
          }
        });
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
        setIsCollaborating(false);
        setCollaborators([]);
        toast.info('Disconnected from collaboration session');
      });

      socket.on('user_joined', (data) => {
        setCollaborators(prev => {
          const existing = prev.find(c => c.id === data.user.id);
          if (existing) return prev;
          return [...prev, { ...data.user, lastSeen: new Date() }];
        });
        toast.success(`${data.user.displayName} joined the session`);
      });

      socket.on('user_left', (data) => {
        setCollaborators(prev => prev.filter(c => c.id !== data.userId));
        toast.info(`${data.userName} left the session`);
      });

      socket.on('form_update', (update) => {
        // Apply remote changes to form store
        const { setFields, setTheme, setFormSettings } = useFormStore.getState();
        
        if (update.type === 'fields') {
          setFields(update.data);
        } else if (update.type === 'theme') {
          setTheme(update.data);
        } else if (update.type === 'formSettings') {
          setFormSettings(update.data);
        }
      });

      socket.on('cursor_update', (data) => {
        setCollaborators(prev => prev.map(c => 
          c.id === data.userId 
            ? { ...c, cursor: data.position, lastSeen: new Date() }
            : c
        ));
      });

      socket.on('collaborators_list', (data) => {
        setCollaborators(data.collaborators.map((c: any) => ({
          ...c,
          lastSeen: new Date()
        })));
      });

      socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        toast.error('Connection error');
      });

      // Store socket reference
      (wsRef as any).current = socket;
    } catch (error) {
      console.error('Failed to start collaboration:', error);
      toast.error('Failed to start collaboration');
    }
  };

  const stopCollaboration = () => {
    const socket = (wsRef as any).current;
    if (socket) {
      socket.emit('leave_form', { formId: 'current' }); // You'd need to track current formId
      socket.disconnect();
      (wsRef as any).current = null;
    }
    setIsCollaborating(false);
    setIsConnected(false);
    setCollaborators([]);
  };

  const sendCursorPosition = (x: number, y: number) => {
    const socket = (wsRef as any).current;
    if (socket && socket.connected) {
      socket.emit('cursor_move', {
        formId: 'current', // You'd need to track current formId
        position: { x, y }
      });
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCollaboration();
    };
  }, []);

  // Send form changes to other collaborators
  useEffect(() => {
    if (!isCollaborating) return;

    const unsubscribe = useFormStore.subscribe((state, prevState) => {
      const socket = (wsRef as any).current;
      if (socket?.connected) {
        // Check what changed and send updates
        if (state.fields !== prevState.fields) {
          socket.emit('form_update', {
            formId: 'current', // You'd need to track current formId
            update: { type: 'fields', data: state.fields }
          });
        }
        if (state.theme !== prevState.theme) {
          socket.emit('form_update', {
            formId: 'current', // You'd need to track current formId
            update: { type: 'theme', data: state.theme }
          });
        }
        if (state.formSettings !== prevState.formSettings) {
          socket.emit('form_update', {
            formId: 'current', // You'd need to track current formId
            update: { type: 'formSettings', data: state.formSettings }
          });
        }
      }
    });

    return unsubscribe;
  }, [isCollaborating]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCollaboration();
    };
  }, []);

  return (
    <CollaborationContext.Provider value={{
      collaborators,
      isConnected,
      isCollaborating,
      startCollaboration,
      stopCollaboration,
      sendCursorPosition,
    }}>
      {children}
    </CollaborationContext.Provider>
  );
}
