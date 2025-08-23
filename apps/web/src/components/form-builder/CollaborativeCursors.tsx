'use client';

import { useCollaboration } from '@/context/CollaborationContext';
import { useAuth } from '@/context/AuthContext';
import { MousePointer2 } from 'lucide-react';

export function CollaborativeCursors() {
  const { collaborators } = useCollaboration();
  const { user } = useAuth();

  return (
    <>
      {collaborators
        .filter(c => c.id !== user?.uid && c.cursor)
        .map((collaborator) => (
          <div
            key={collaborator.id}
            className="fixed pointer-events-none z-50 transition-all duration-75"
            style={{
              left: collaborator.cursor!.x,
              top: collaborator.cursor!.y,
              transform: 'translate(-2px, -2px)',
            }}
          >
            {/* Cursor */}
            <div className="relative">
              <MousePointer2 
                className="h-5 w-5 text-blue-500 drop-shadow-sm"
                style={{ 
                  fill: 'currentColor',
                  filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.3))'
                }}
              />
              
              {/* User label */}
              <div 
                className="absolute top-6 left-2 px-2 py-1 text-xs text-white bg-blue-500 rounded-md whitespace-nowrap shadow-sm"
                style={{
                  fontSize: '11px',
                  lineHeight: '1.2',
                }}
              >
                {collaborator.displayName}
              </div>
            </div>
          </div>
        ))}
    </>
  );
}
