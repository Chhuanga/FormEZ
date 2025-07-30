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

  const fetchForms = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/forms', {
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
              fetch(`/api/forms/${form.id}/submissions`, {
                headers: { Authorization: `Bearer ${token}` },
              }),
              fetch(`/api/forms/${form.id}/submissions/analytics`, {
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
      const response = await fetch(`/api/forms/${formId}`, {
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
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-black">My Forms</h1>
            <p className="text-gray-600 mt-2">
              {forms.length === 0 
                ? 'Create and manage your forms' 
                : `Managing ${forms.length} form${forms.length !== 1 ? 's' : ''} • ${filteredAndSortedForms.length} shown`
              }
            </p>
          </div>
          <Button asChild className="h-10 px-6 bg-black hover:bg-gray-800 text-white border-0 font-medium">
            <Link href="/dashboard/new" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Form
            </Link>
          </Button>
        </div>
        
        {/* Search and Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="relative flex-1 w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search forms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 border-gray-200 focus:border-black focus:ring-black/20"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <SortAsc className="h-4 w-4 text-gray-500" />
              <Select value={sortBy} onValueChange={(value: 'date' | 'name' | 'responses') => setSortBy(value)}>
                <SelectTrigger className="w-32 h-10 border-gray-200 focus:border-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-gray-200">
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="responses">Responses</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={filterStatus} onValueChange={(value: 'all' | 'draft' | 'live') => setFilterStatus(value)}>
                <SelectTrigger className="w-24 h-10 border-gray-200 focus:border-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-gray-200">
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
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-300 rounded-2xl bg-white">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <FileText className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold mb-3 text-black">No forms yet</h2>
            <p className="text-gray-600 mb-8 max-w-md leading-relaxed">
              Get started by creating your first form. Build beautiful, responsive forms in minutes.
            </p>
            <Button asChild className="bg-black hover:bg-gray-800 text-white border-0 h-11 px-6">
              <Link href="/dashboard/new" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create your first form
              </Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Search className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold mb-3 text-black">No forms found</h2>
            <p className="text-gray-600 mb-8 max-w-md leading-relaxed">
              Try adjusting your search or filter criteria to find the forms you're looking for.
            </p>
            <Button variant="outline" onClick={() => { setSearchTerm(''); setFilterStatus('all'); }} className="border-gray-300 text-black hover:bg-gray-50">
              Clear filters
            </Button>
          </div>
        )
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredAndSortedForms.map((form) => (
            <div
              key={form.id}
              className={`group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-gray-300 flex flex-col justify-between ${
                (form.analytics?.completionRate || 0) > 80 && form.submissionCount > 5 
                  ? 'border-black/20 bg-gray-50/50' 
                  : ''
              }`}
            >
              <Link href={`/form/${form.id}/submissions?from=dashboard`} className="cursor-pointer">
                {/* Form Header */}
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-black text-lg mb-1 group-hover:text-gray-700 transition-colors line-clamp-2 leading-tight">
                      {form.title}
                    </h3>
                    <Badge 
                      variant={form.status === 'live' ? 'default' : 'secondary'} 
                      className={`ml-2 text-xs ${
                        form.status === 'live' 
                          ? 'bg-black text-white hover:bg-gray-800' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {form.status}
                    </Badge>
                  </div>
                  
                  {/* Key Metrics */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <FileText className="h-4 w-4" />
                        <span className="font-medium">{form.submissionCount} response{form.submissionCount !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Target className="h-4 w-4" />
                        <span className="font-medium">{form.analytics?.completionRate || 0}% complete</span>
                      </div>
                    </div>
                    
                    {/* Activity Sparkline */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <TrendingUp className="h-4 w-4" />
                        <span>7-day activity</span>
                      </div>
                      <MiniSparkline 
                        data={form.analytics?.submissionTrend || []} 
                        className="text-black"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-500 border-t border-gray-200 pt-3">
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
                <div className="mb-4">
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    {form.fields.slice(0, 1).map((field, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0"></div>
                        <div className="h-1.5 bg-gray-300 rounded flex-1"></div>
                      </div>
                    ))}
                    {form.fields.length > 1 && (
                      <div className="text-xs text-gray-500 text-center pt-1">
                        +{form.fields.length - 1} more field{form.fields.length - 1 !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              </Link>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  asChild
                  className="flex-1 flex items-center gap-2 h-9 text-sm px-4 hover:bg-gray-50 hover:border-black/50 border-gray-300 transition-all"
                >
                  <Link href={`/form/${form.id}/edit`}>
                    <Edit className="h-4 w-4" />
                    Edit
                  </Link>
                </Button>
                
                {deletingFormId === form.id ? (
                  <div className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm border border-red-200">
                    <span>Deleting in {countdownSeconds}s</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleUndoDelete}
                      className="h-6 w-6 p-0 hover:bg-red-100 text-red-700"
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
                    className="text-gray-500 hover:text-red-600 hover:bg-red-50 h-9 px-3 transition-colors"
                    title="Delete form"
                  >
                    <Trash2 className="h-4 w-4" />
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