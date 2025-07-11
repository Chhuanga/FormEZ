'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, FileText, Calendar, Hash, Mail, Type, CheckSquare, MousePointerClick } from 'lucide-react';
import { format } from 'date-fns';

// We need to define the types for the data we're fetching.
// These should ideally be shared from a common types package.
interface FormField {
    id: string;
    label: string;
    type: string;
    options?: string[];
}

interface Answer {
    fieldId: string;
    value: any;
    file?: {
        filename: string;
        path: string;
    };
}

interface Submission {
    id: string;
    createdAt: string;
    answers: Answer[];
    form: {
        title: string;
        fields: FormField[];
    };
}

export default function SubmissionViewPage() {
    const { user, getToken } = useAuth();
    const params = useParams();
    const { id: formId, submissionId } = params;

    const [submission, setSubmission] = useState<Submission | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user || !submissionId) return;

        const fetchSubmission = async () => {
            try {
                const token = await getToken();
                const response = await fetch(`/api/submissions/${submissionId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch submission data.');
                }
                const data = await response.json();
                setSubmission(data);
            } catch (e) {
                setError(e instanceof Error ? e.message : 'An unknown error occurred.');
            } finally {
                setLoading(false);
            }
        };

        fetchSubmission();
    }, [submissionId, user, getToken]);

    const getFieldIcon = (type: string) => {
        switch (type) {
            case 'Input': return <Type className="h-5 w-5 text-muted-foreground" />;
            case 'Textarea': return <Type className="h-5 w-5 text-muted-foreground" />;
            case 'Email': return <Mail className="h-5 w-5 text-muted-foreground" />;
            case 'RadioGroup': return <MousePointerClick className="h-5 w-5 text-muted-foreground" />;
            case 'Select': return <MousePointerClick className="h-5 w-5 text-muted-foreground" />;
            case 'Checkbox': return <CheckSquare className="h-5 w-5 text-muted-foreground" />;
            case 'DatePicker': return <Calendar className="h-5 w-5 text-muted-foreground" />;
            case 'NumberInput': return <Hash className="h-5 w-5 text-muted-foreground" />;
            default: return <Type className="h-5 w-5 text-muted-foreground" />;
        }
    };

    const renderAnswer = (answer: Answer, field: FormField) => {
        if (field.type === 'FileUpload' && answer.file) {
            return (
                <Button variant="outline" asChild>
                    <a href={`/${answer.file.path}`} target="_blank" rel="noopener noreferrer">
                        {answer.file.filename}
                    </a>
                </Button>
            );
        }

        if (Array.isArray(answer.value)) {
            return <div className="flex flex-col gap-1">
                {answer.value.map((val, i) => <span key={i} className="block">{String(val)}</span>)}
            </div>
        }
        
        if (field.type === 'DatePicker' && answer.value) {
            try {
                return format(new Date(answer.value), 'PPP');
            } catch {
                return String(answer.value)
            }
        }

        return String(answer.value);
    }

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading submission...</div>;
    }

    if (error) {
        return <div className="flex h-screen items-center justify-center text-red-500">Error: {error}</div>;
    }

    if (!submission) {
        return <div className="flex h-screen items-center justify-center">Submission not found.</div>;
    }

    const fieldMap = new Map(submission.form.fields.map(f => [f.id, f]));

    return (
        <div className="min-h-screen bg-muted/20">
            <header className="bg-gradient-to-r from-background to-muted/30 border-b shadow-sm sticky top-0 p-4">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-background/80 backdrop-blur-sm rounded-lg border shadow-sm p-4">
                        <div className="flex items-center gap-4">
                            <Button variant="outline" size="icon" asChild className="shadow-sm">
                                <Link href={`/form/${formId}/submissions`}>
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                                    <FileText className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-foreground">{submission.form.title}</h1>
                                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                                        <span>Submitted on {format(new Date(submission.createdAt), 'PPP p')}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-4 sm:p-8">
                <div className="bg-background rounded-lg border shadow-sm overflow-hidden">
                    <div className="p-6 border-b bg-muted/20">
                         <h2 className="text-xl font-semibold flex items-center gap-3 text-foreground">
                            <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                                <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <span>Submission Details</span>
                        </h2>
                    </div>
                    <ul className="divide-y divide-border/50">
                        {submission.answers.map((answer) => {
                            const field = fieldMap.get(answer.fieldId);
                            if (!field) return null;
                            return (
                                <li key={answer.fieldId} className="p-6 grid md:grid-cols-3 gap-4 items-start hover:bg-muted/20 transition-colors">
                                    <div className="font-semibold md:col-span-1 flex items-center gap-3 text-foreground">
                                        <div className="p-1 bg-muted rounded">
                                            {getFieldIcon(field.type)}
                                        </div>
                                        <span>{field.label}</span>
                                    </div>
                                    <div className="md:col-span-2 text-foreground bg-muted/30 rounded-md p-3 min-h-[40px] flex items-center">
                                        {renderAnswer(answer, field)}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </main>
        </div>
    );
} 