'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Download,
  Search,
  ArrowLeft,
  FileText,
  BarChart2,
  List,
  RefreshCw,
  Clock,
  Eye,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { SubmissionsDashboard, SubmissionsDashboardHandle } from '@/components/analytics/SubmissionsDashboard';
import { SubmissionDetail } from '@/components/submissions/SubmissionDetail';

// --- Helper Components & Types ---

const GoogleSheetsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);

interface Submission {
  id: string;
  createdAt: string;
  answers: Array<{
    fieldId: string;
    value: any;
    file?: { url: string; name: string; size: number } | null;
  }>;
}

interface FormField {
  id: string;
  label: string;
  type: string;
}

interface FormData {
  id: string;
  title: string;
  fields: FormField[];
  submissions: Submission[];
}

interface Integration {
  id: string;
  type: 'GOOGLE_SHEETS' | string;
  metadata: { spreadsheetUrl?: string };
}

interface Account {
  id: string;
  provider: string;
}

// --- Main Page Component ---

export default function SubmissionsPage() {
  const { user } = useAuth();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const from = searchParams.get('from');

  const [data, setData] = useState<{
    form: Omit<FormData, 'submissions'> | null;
    submissions: Submission[];
  }>({ form: null, submissions: [] });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'list' | 'analytics'>('list');
  const [sheetIntegration, setSheetIntegration] = useState<Integration | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const dashboardRef = useRef<SubmissionsDashboardHandle>(null);

  useEffect(() => {
    if (!user || !id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const token = await user.getIdToken();
        const headers = { Authorization: `Bearer ${token}` };

        const [submissionsRes, integrationsRes] = await Promise.all([
          fetch(`/api/forms/${id}/submissions`, { headers }),
          fetch(`/api/forms/${id}/integrations`, { headers }),
        ]);

        if (!submissionsRes.ok) throw new Error('Failed to fetch submissions');
        const submissionsData = await submissionsRes.json();
        
        setData({
          form: {
            id: submissionsData.id,
            title: submissionsData.title,
            fields: submissionsData.fields
          },
          submissions: submissionsData.submissions,
        });

        if (integrationsRes.ok) {
          const integrationsData = await integrationsRes.json();
          const googleSheet = integrationsData.find(
            (int: Integration) => int.type === 'GOOGLE_SHEETS',
          );
          setSheetIntegration(googleSheet || null);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user]);
  
  // --- Search & Filter Logic ---

  const filteredSubmissions = useMemo(() => {
    if (!data.submissions) return [];
    
    // If no search term, return all submissions
    if (!searchTerm.trim()) return data.submissions;
    
    return data.submissions.filter((submission) => {
      if (!submission.answers || submission.answers.length === 0) return false;
      
      const lowercasedSearchTerm = searchTerm.toLowerCase();

      return submission.answers.some((answer) => {
        if (answer.value === null || answer.value === undefined) return false;
        
        let valueAsString = '';
        if (typeof answer.value === 'object') {
          if ('label' in answer.value && typeof answer.value.label === 'string') {
            valueAsString = answer.value.label;
          } else if ('value' in answer.value && typeof answer.value.value === 'string') {
            valueAsString = answer.value.value;
          } else {
            valueAsString = JSON.stringify(answer.value);
          }
        } else {
          valueAsString = String(answer.value);
        }
        
        return valueAsString.toLowerCase().includes(lowercasedSearchTerm);
      });
    });
  }, [data.submissions, searchTerm]);

  // --- Helper Functions ---
  
  const formatFriendlyDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return `Today at ${format(date, 'h:mm a')}`;
    if (isYesterday(date)) return `Yesterday at ${format(date, 'h:mm a')}`;
    const daysAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (daysAgo <= 7) return `${formatDistanceToNow(date, { addSuffix: true })} at ${format(date, 'h:mm a')}`;
    return format(date, "MMM d, yyyy 'at' h:mm a");
  };

  const getAnswerForField = (submission: Submission, fieldId: string) => {
    const answer = submission.answers.find((a) => a.fieldId === fieldId);
    if (!answer) return '—';
    const { value, file } = answer;

    if (file) return file.name;
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object' && value !== null) return JSON.stringify(value);
    return String(value) || '—';
  };

  // --- Action Handlers ---

  const handleGoogleSheetClick = async () => {
    if (sheetIntegration?.metadata?.spreadsheetUrl) {
      window.open(sheetIntegration.metadata.spreadsheetUrl, '_blank');
      return;
    }
    setIsExporting(true);
    try {
      const token = await user?.getIdToken();
      if (!token) throw new Error('Not authenticated');

      const headers = { Authorization: `Bearer ${token}` };

      // 1. Get user's connected Google account
      const accountsRes = await fetch('/api/integrations/accounts', { headers });
      if (!accountsRes.ok) throw new Error('Could not fetch accounts.');
      const accounts: Account[] = await accountsRes.json();
      const googleAccount = accounts.find(acc => acc.provider === 'google');

      if (!googleAccount) {
        // In a real app, you'd guide them to the settings page.
        alert('Please connect your Google account in settings first.');
        return;
      }

      // 2. Create the integration
      const createRes = await fetch(
        `/api/forms/${id}/integrations/google-sheets`,
        {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ accountId: googleAccount.id }),
        },
      );

      if (!createRes.ok) throw new Error('Failed to create Google Sheet.');

      const newIntegration: Integration = await createRes.json();
      setSheetIntegration(newIntegration);

      // 3. Open the new sheet
      if (newIntegration.metadata?.spreadsheetUrl) {
        window.open(newIntegration.metadata.spreadsheetUrl, '_blank');
      }
    } catch (error) {
      console.error('Error exporting to Google Sheets:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToCSV = () => {
    if (!data.form || data.submissions.length === 0) return;
    const { fields } = data.form;
    const headers = ['Submission Date', ...fields.map(field => field.label)];
    const csvContent = [
      headers.join(','),
      ...data.submissions.map(submission => {
        const row = [
          new Date(submission.createdAt).toISOString(),
          ...fields.map(field => {
            const answer = submission.answers.find(a => a.fieldId === field.id);
            const value = answer ? answer.value : '';
            if (value === null || value === undefined) return '';
            const stringValue = Array.isArray(value) ? value.join('; ') : String(value);
            return `"${stringValue.replace(/"/g, '""')}"`;
          })
        ];
        return row.join(',');
      })
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.form.title}_submissions.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const handleExport = () => {
    if (view === 'analytics') {
      dashboardRef.current?.exportData('csv');
    } else {
      exportToCSV();
    }
  };

  const copyFormLink = () => {
    const formUrl = `${window.location.origin}/s/${id}`;
    navigator.clipboard.writeText(formUrl);
    alert('Link copied!');
  };

  const openFormPreview = () => window.open(`/s/${id}`, '_blank');
  
  // --- Render Logic ---

  const backLink = from === 'edit' ? `/form/${id}/edit` : '/dashboard';

  if (loading) {
    return <div className="flex h-full items-center justify-center">Loading submissions...</div>;
  }

  const renderContent = () => {    
    if (view === 'analytics') {
      return <SubmissionsDashboard ref={dashboardRef} formId={id} formTitle={data.form?.title} />;
    }

    if (filteredSubmissions.length === 0) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-center bg-background rounded-lg border border-dashed shadow-sm p-8">
          <div className="p-4 bg-primary/10 rounded-full border-8 border-primary/5 mb-6 relative">
            <FileText className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            {searchTerm ? 'No Matching Submissions' : 'No Submissions Yet'}
          </h2>
          <p className="text-muted-foreground mt-2 max-w-md">
            {searchTerm
              ? "Try a different search term to find what you're looking for."
              : 'Share your form link to start collecting responses.'}
          </p>
          {!searchTerm && (
            <div className="mt-6 flex gap-3">
              <Button variant="outline" onClick={copyFormLink}><Copy className="h-4 w-4 mr-2" />Copy Link</Button>
              <Button onClick={openFormPreview}><ExternalLink className="h-4 w-4 mr-2" />Preview Form</Button>
            </div>
          )}
        </div>
      );
    }
    
    const fieldsToDisplay = (data.form?.fields || []).slice(0, 3);
    const mobilePreviewFields = (data.form?.fields || []).slice(0, 2);

    return (
      <TooltipProvider>
        {/* Desktop Table */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[220px]">Submitted At</TableHead>
                {fieldsToDisplay.map((field) => <TableHead key={field.id}>{field.label}</TableHead>)}
                <TableHead className="w-[80px] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubmissions.map((submission) => (
                <TableRow key={submission.id} onClick={() => setSelectedSubmission(submission)} className="cursor-pointer">
                  <TableCell>{formatFriendlyDate(submission.createdAt)}</TableCell>
                  {fieldsToDisplay.map((field) => (
                    <TableCell key={field.id} className="truncate max-w-[200px]">
                      {getAnswerForField(submission, field.id)}
                    </TableCell>
                  ))}
                  <TableCell className="text-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setSelectedSubmission(submission); }}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>View submission</p></TooltipContent>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Mobile Card View */}
        <div className="block md:hidden space-y-3">
          {filteredSubmissions.map((submission) => (
            <div key={submission.id} onClick={() => setSelectedSubmission(submission)} className="bg-card border rounded-lg p-4 cursor-pointer">
              <div className="flex items-center justify-between mb-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><Clock className="h-4 w-4" /><span>{formatFriendlyDate(submission.createdAt)}</span></div>
                <Badge variant="outline"><Eye className="h-3 w-3 mr-1" />View</Badge>
              </div>
              <div className="space-y-2">
                {mobilePreviewFields.map((field) => (
                  <div key={field.id}>
                    <div className="text-xs text-muted-foreground">{field.label}</div>
                    <div className="text-sm truncate">{getAnswerForField(submission, field.id)}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {selectedSubmission && (
          <SubmissionDetail
            submission={selectedSubmission}
            formFields={data.form?.fields || []}
            onClose={() => setSelectedSubmission(null)}
          />
        )}
      </TooltipProvider>
    );
  };

  return (
    <div className="h-full flex flex-col bg-muted/20">
      <header className="bg-gradient-to-r from-background to-muted/30 border-b shadow-sm p-4 sm:p-6 flex-shrink-0">
        <div className="bg-background/80 backdrop-blur-sm rounded-lg border shadow-sm p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" asChild>
                <Link href={backLink}><ArrowLeft className="h-4 w-4" /></Link>
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">{data.form?.title || 'Submissions'}</h1>
                <p className="text-sm text-muted-foreground">{data.submissions.length} submissions</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleGoogleSheetClick} disabled={isExporting}>
                {isExporting ? 'Creating...' : (sheetIntegration ? <GoogleSheetsIcon /> : 'Export to Sheets')}
              </Button>
              <Button onClick={handleExport} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                {view === 'analytics' ? 'Export Analytics' : 'Export Submissions'}
              </Button>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center rounded-md bg-muted p-1">
              <Button variant={view === 'list' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('list')}>
                <List className="h-4 w-4 mr-2" />Submissions
              </Button>
              <Button variant={view === 'analytics' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('analytics')}>
                <BarChart2 className="h-4 w-4 mr-2" />Analytics
              </Button>
            </div>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search submissions..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-auto p-4 sm:p-6">{renderContent()}</main>
    </div>
  );
} 