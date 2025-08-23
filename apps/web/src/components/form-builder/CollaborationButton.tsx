'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Copy, Check, Mail, Crown, UserCheck, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface Collaborator {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
  role: 'owner' | 'editor';
  isOnline: boolean;
}

interface CollaborationButtonProps {
  formId: string;
  isOwner?: boolean;
}

export function CollaborationButton({ formId, isOwner = true }: CollaborationButtonProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    {
      id: user?.uid || '',
      email: user?.email || '',
      displayName: user?.displayName || 'You',
      avatar: user?.photoURL || '',
      role: 'owner',
      isOnline: true,
    }
  ]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareLink = `${window.location.origin}/form/${formId}/collaborate`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast.success('Collaboration link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast.error('Failed to copy link');
    }
  };

  const handleInviteByEmail = async () => {
    if (!inviteEmail.trim()) return;
    
    setInviting(true);
    try {
      const token = await user?.getIdToken();
      const response = await fetch(`/api/forms/${formId}/collaborators/invite`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: inviteEmail }),
      });

      if (!response.ok) {
        throw new Error('Failed to send invitation');
      }

      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
    } catch (error) {
      console.error('Failed to invite collaborator:', error);
      toast.error('Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveCollaborator = async (collaboratorId: string) => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch(`/api/forms/${formId}/collaborators/${collaboratorId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to remove collaborator');
      }

      setCollaborators(prev => prev.filter(c => c.id !== collaboratorId));
      toast.success('Collaborator removed');
    } catch (error) {
      console.error('Failed to remove collaborator:', error);
      toast.error('Failed to remove collaborator');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" id="collaborate-button">
          <Users className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Collaborate</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Collaborate on this form
          </DialogTitle>
          <DialogDescription>
            Invite others to edit this form in real-time. Changes are saved automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Share Link Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Share collaboration link</Label>
            <div className="flex gap-2">
              <Input
                value={shareLink}
                readOnly
                className="flex-1 bg-gray-50"
              />
              <Button
                onClick={handleCopyLink}
                variant="outline"
                size="sm"
                className="px-3"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Anyone with this link can edit the form (requires login)
            </p>
          </div>

          {/* Invite by Email Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Invite by email</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleInviteByEmail()}
                className="flex-1"
              />
              <Button
                onClick={handleInviteByEmail}
                disabled={!inviteEmail.trim() || inviting}
                variant="outline"
                size="sm"
                className="px-3"
              >
                {inviting ? (
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Current Collaborators */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Collaborators ({collaborators.length})
            </Label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {collaborators.map((collaborator) => (
                <div
                  key={collaborator.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={collaborator.avatar} />
                        <AvatarFallback>
                          {collaborator.displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {collaborator.isOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {collaborator.displayName}
                        {collaborator.id === user?.uid && ' (You)'}
                      </p>
                      <p className="text-xs text-gray-500">{collaborator.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={collaborator.role === 'owner' ? 'default' : 'secondary'}>
                      {collaborator.role === 'owner' ? (
                        <Crown className="h-3 w-3 mr-1" />
                      ) : (
                        <UserCheck className="h-3 w-3 mr-1" />
                      )}
                      {collaborator.role}
                    </Badge>
                    
                    {isOwner && collaborator.role !== 'owner' && (
                      <Button
                        onClick={() => handleRemoveCollaborator(collaborator.id)}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Info Section */}
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Real-time collaboration:</strong> All changes are synced instantly. 
              Both you and your collaborators can save the form and access analytics.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
