'use client';

import { useCollaboration } from '@/context/CollaborationContext';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Wifi, WifiOff, Users } from 'lucide-react';

export function CollaborationStatus() {
  const { collaborators, isConnected, isCollaborating } = useCollaboration();
  const { user } = useAuth();

  if (!isCollaborating) return null;

  const otherCollaborators = collaborators.filter(c => c.id !== user?.uid);

  return (
    <div className="flex items-center gap-2">
      {/* Connection Status */}
      <div className="flex items-center gap-1">
        {isConnected ? (
          <Wifi className="h-4 w-4 text-green-500" />
        ) : (
          <WifiOff className="h-4 w-4 text-red-500" />
        )}
        <Badge variant={isConnected ? 'default' : 'destructive'} className="text-xs">
          {isConnected ? 'Connected' : 'Disconnected'}
        </Badge>
      </div>

      {/* Collaborators */}
      {otherCollaborators.length > 0 && (
        <TooltipProvider>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-gray-500" />
            <div className="flex -space-x-1">
              {otherCollaborators.slice(0, 3).map((collaborator) => (
                <Tooltip key={collaborator.id}>
                  <TooltipTrigger asChild>
                    <Avatar className="h-6 w-6 border-2 border-white">
                      <AvatarImage src={collaborator.avatar} />
                      <AvatarFallback className="text-xs">
                        {collaborator.displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">{collaborator.displayName}</p>
                    <p className="text-xs text-gray-500">{collaborator.email}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
              {otherCollaborators.length > 3 && (
                <div className="h-6 w-6 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-xs text-gray-600">+{otherCollaborators.length - 3}</span>
                </div>
              )}
            </div>
          </div>
        </TooltipProvider>
      )}
    </div>
  );
}
