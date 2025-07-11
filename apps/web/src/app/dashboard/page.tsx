'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MiniSparkline } from '@/components/ui/mini-sparkline';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Plus, FileText, Trash2, Edit, Search, Filter, SortAsc, MoreVertical, Undo2, X, TrendingUp, Target } from 'lucide-react';

// Define the shape of a form, mirroring our backend model
interface Form {
  id: string;
  title: string;
  updatedAt: string;
  createdAt: string;
  fields: any[]; // Add fields for a simple count
  status: 'draft' | 'live';
  submissionCount: number;
  lastModifiedBy: string;
  analytics?: {
    submissionTrend: { date: string; count: number }[];
    completionRate: number;
  };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'responses'>('date');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'live'>('all');
  const [deletingFormId, setDeletingFormId] = useState<string | null>(null);
  const [undoTimeoutId, setUndoTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(5);
  const [countdownIntervalId, setCountdownIntervalId] = useState<NodeJS.Timeout | null>(null);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const fetchForms = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const token = await user.getIdToken();
      const response = await fetch(`${apiBaseUrl}/forms`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch forms');
      const formsData = await response.json();
      
      // Fetch submission counts and analytics for each form
      const enrichedData = await Promise.all(
        formsData.map(async (form: any) => {
          try {
            // Fetch submissions and analytics in parallel
            const [submissionsResponse, analyticsResponse] = await Promise.all([
              fetch(`${apiBaseUrl}/forms/${form.id}/submissions`, {
                headers: { Authorization: `Bearer ${token}` },
              }),
              fetch(`${apiBaseUrl}/forms/${form.id}/submissions/analytics`, {
                headers: { Authorization: `Bearer ${token}` },
              })
            ]);
            
            let submissionCount = 0;
            let analytics = undefined;
            
            if (submissionsResponse.ok) {
              const submissionsData = await submissionsResponse.json();
              submissionCount = submissionsData.submissions?.length || 0;
              
              // Calculate completion rate based on required fields
              const requiredFields = (form.fields || []).filter((field: any) => field.validation?.required);
              let completionRate = 100; // Default to 100% if no required fields
              
              if (requiredFields.length > 0 && submissionsData.submissions?.length > 0) {
                const completedSubmissions = submissionsData.submissions.filter((submission: any) => {
                  return requiredFields.every((field: any) => {
                    const answer = submission.answers.find((a: any) => a.fieldId === field.id);
                    return answer && answer.value !== null && answer.value !== undefined && answer.value !== '';
                  });
                });
                completionRate = Math.round((completedSubmissions.length / submissionsData.submissions.length) * 100);
              }
              
              if (analyticsResponse.ok) {
                const analyticsData = await analyticsResponse.json();
                analytics = {
                  submissionTrend: analyticsData.submissionTrend || [],
                  completionRate,
                };
              } else {
                analytics = {
                  submissionTrend: [],
                  completionRate,
                };
              }
            }
            
            return {
              ...form,
              status: Math.random() > 0.5 ? 'live' : 'draft' as 'live' | 'draft', // Still mock status until backend provides it
              submissionCount,
              lastModifiedBy: user?.displayName || user?.email || 'You',
              createdAt: form.createdAt || form.updatedAt,
              analytics,
            };
          } catch (error) {
            console.error(`Error fetching data for form ${form.id}:`, error);
            return {
              ...form,
              status: Math.random() > 0.5 ? 'live' : 'draft' as 'live' | 'draft',
              submissionCount: 0,
              lastModifiedBy: user?.displayName || user?.email || 'You',
              createdAt: form.createdAt || form.updatedAt,
              analytics: {
                submissionTrend: [],
                completionRate: 0,
              },
            };
          }
        })
      );
      
      setForms(enrichedData);
    } catch (error) {
      console.error('Error fetching forms:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, [user]);

  // Cleanup timeout and interval on unmount
  useEffect(() => {
    return () => {
      if (undoTimeoutId) {
        clearTimeout(undoTimeoutId);
      }
      if (countdownIntervalId) {
        clearInterval(countdownIntervalId);
      }
    };
  }, [undoTimeoutId, countdownIntervalId]);

  const handleDeleteClick = (formId: string) => {
    if (undoTimeoutId) {
      clearTimeout(undoTimeoutId);
    }
    if (countdownIntervalId) {
      clearInterval(countdownIntervalId);
    }
    
    setDeletingFormId(formId);
    setCountdownSeconds(5);
    
    // Start countdown interval
    const intervalId = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    setCountdownIntervalId(intervalId);
    
    // Set deletion timeout
    const timeoutId = setTimeout(() => {
      performDelete(formId);
    }, 5000);
    
    setUndoTimeoutId(timeoutId);
  };

  const performDelete = async (formId: string) => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch(`${apiBaseUrl}/forms/${formId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Delete failed:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Failed to delete form: ${response.status} ${response.statusText}`);
      }

      // Refresh the list of forms
      fetchForms();
    } catch (error) {
      console.error('Error deleting form:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to delete form: ${errorMessage}`);
    } finally {
      setDeletingFormId(null);
      setUndoTimeoutId(null);
      if (countdownIntervalId) {
        clearInterval(countdownIntervalId);
        setCountdownIntervalId(null);
      }
      setCountdownSeconds(5);
    }
  };

  const handleUndoDelete = () => {
    if (undoTimeoutId) {
      clearTimeout(undoTimeoutId);
      setUndoTimeoutId(null);
    }
    if (countdownIntervalId) {
      clearInterval(countdownIntervalId);
      setCountdownIntervalId(null);
    }
    setDeletingFormId(null);
    setCountdownSeconds(5);
  };

  // Filter and sort forms
  const filteredAndSortedForms = forms
    .filter(form => {
      // Filter by search term
      const matchesSearch = form.title.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by status
      const matchesStatus = filterStatus === 'all' || form.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'responses':
          return b.submissionCount - a.submissionCount;
        case 'date':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          Loading your forms...
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Forms</h1>
            <p className="text-muted-foreground mt-1">
              {forms.length === 0 
                ? 'Create and manage your forms' 
                : `Managing ${forms.length} form${forms.length !== 1 ? 's' : ''} • ${filteredAndSortedForms.length} shown`
              }
            </p>
          </div>
          <Button asChild className="h-9 px-4">
            <Link href="/dashboard/new" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Form
            </Link>
          </Button>
        </div>
        
        {/* Search and Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 p-4 bg-muted/30 rounded-lg border">
          <div className="relative flex-1 w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search forms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <SortAsc className="h-4 w-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={(value: 'date' | 'name' | 'responses') => setSortBy(value)}>
                <SelectTrigger className="w-32 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="responses">Responses</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filterStatus} onValueChange={(value: 'all' | 'draft' | 'live') => setFilterStatus(value)}>
                <SelectTrigger className="w-24 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Forms Grid */}
      {filteredAndSortedForms.length === 0 ? (
        forms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border rounded-lg bg-accent/50">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No forms yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Get started by creating your first form. Build beautiful, responsive forms in minutes.
            </p>
            <Button asChild>
              <Link href="/dashboard/new" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create your first form
              </Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No forms found</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Try adjusting your search or filter criteria to find the forms you're looking for.
            </p>
            <Button variant="outline" onClick={() => { setSearchTerm(''); setFilterStatus('all'); }}>
              Clear filters
            </Button>
          </div>
        )
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredAndSortedForms.map((form) => (
            <div
              key={form.id}
              className={`group bg-card border rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-border/80 flex flex-col justify-between ${
                (form.analytics?.completionRate || 0) > 80 && form.submissionCount > 5 
                  ? 'border-primary/20 bg-primary/5' 
                  : 'border-border'
              }`}
            >
              <Link href={`/form/${form.id}/submissions?from=dashboard`} className="cursor-pointer">
                {/* Form Header */}
                <div className="mb-3">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-card-foreground text-base mb-1 group-hover:text-primary transition-colors line-clamp-2">
                      {form.title}
                    </h3>
                    <Badge variant={form.status === 'live' ? 'default' : 'secondary'} className="ml-2 text-xs">
                      {form.status}
                    </Badge>
                  </div>
                  
                  {/* Key Metrics */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <FileText className="h-3 w-3" />
                        <span>{form.submissionCount} response{form.submissionCount !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Target className="h-3 w-3" />
                        <span>{form.analytics?.completionRate || 0}% complete</span>
                      </div>
                    </div>
                    
                    {/* Activity Sparkline */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <TrendingUp className="h-3 w-3" />
                        <span>7-day activity</span>
                      </div>
                      <MiniSparkline 
                        data={form.analytics?.submissionTrend || []} 
                        className="text-primary"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1 text-xs text-muted-foreground border-t border-border pt-2">
                    <div className="flex items-center justify-between">
                      <span>{form.fields.length} field{form.fields.length !== 1 ? 's' : ''}</span>
                      <span>By {form.lastModifiedBy}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{formatDistanceToNow(new Date(form.updatedAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>

                {/* Compact Form Preview */}
                <div className="mb-3">
                  <div className="bg-muted/20 rounded-md p-1.5 space-y-1">
                    {form.fields.slice(0, 1).map((field, index) => (
                      <div key={index} className="flex items-center gap-1.5">
                        <div className="w-1 h-1 bg-muted-foreground/40 rounded-full flex-shrink-0"></div>
                        <div className="h-1 bg-muted-foreground/20 rounded flex-1"></div>
                      </div>
                    ))}
                    {form.fields.length > 1 && (
                      <div className="text-xs text-muted-foreground text-center">
                        +{form.fields.length - 1} more field{form.fields.length - 1 !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              </Link>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  asChild
                  className="flex-1 flex items-center gap-1.5 h-8 text-xs px-3 hover:bg-accent hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                >
                  <Link href={`/form/${form.id}/edit`}>
                    <Edit className="h-3 w-3" />
                    Edit
                  </Link>
                </Button>
                
                {deletingFormId === form.id ? (
                  <div className="flex items-center gap-1 bg-destructive/10 text-destructive px-2 py-1 rounded-md text-xs">
                    <span>Deleting in {countdownSeconds}s</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleUndoDelete}
                      className="h-6 w-6 p-0 hover:bg-destructive/20"
                      title="Undo deletion"
                    >
                      <Undo2 className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(form.id)}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 px-2 transition-colors"
                    title="Delete form"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 