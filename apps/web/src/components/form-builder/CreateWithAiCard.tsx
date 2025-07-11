'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const examplePrompts = [
  'A customer satisfaction survey for a coffee shop',
  'A registration form for a webinar on digital marketing',
  'A simple contact form with name, email, and message fields',
  'An RSVP form for a company holiday party',
];

interface RefinementQuestion {
  id: string;
  question: string;
}

interface Answer {
  questionId: string;
  question: string;
  answer: string;
}

export function CreateWithAiCard() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [refinementQuestions, setRefinementQuestions] = useState<
    RefinementQuestion[]
  >([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const { user } = useAuth();
  const router = useRouter();

  const handleAnswerChange = (questionId: string, question: string, answer: string) => {
    setAnswers((prev) => {
      const existing = prev.find((a) => a.questionId === questionId);
      if (existing) {
        return prev.map((a) =>
          a.questionId === questionId ? { ...a, answer } : a,
        );
      }
      return [...prev, { questionId, question, answer }];
    });
  };

  const handleGenerate = async () => {
    if (!prompt || !user) return;
    setIsLoading(true);

    const body = {
      prompt,
      answers: answers.map(({ question, answer }) => ({ question, answer })),
    };

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/ai/generate-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Failed to generate form');
      }

      const data = await response.json();

      if (data.questions) {
        setRefinementQuestions(data.questions);
        setAnswers([]); // Reset answers for the new questions
      } else if (data.form) {
        router.push(`/form/${data.form.id}/edit`);
      }
    } catch (error) {
      console.error('Error generating form with AI:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const hasAllAnswers =
    refinementQuestions.length > 0 &&
    answers.length === refinementQuestions.length &&
    answers.every((a) => a.answer.trim() !== '');

  // Get the user's first name for personalization
  const getUserGreeting = () => {
    if (!user) return 'Create with AI';
    
    if (user.displayName) {
      // Extract first name from display name
      const firstName = user.displayName.split(' ')[0];
      return `Welcome back, ${firstName}! How do you want to start?`;
    }
    
    // Fallback if no display name
    return 'Welcome back! How do you want to start?';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{getUserGreeting()}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {refinementQuestions.length === 0 ? (
          <>
            <Textarea
              placeholder="e.g., 'A customer feedback form for a coffee shop'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isLoading}
              rows={3}
            />
            <div>
              <p className="text-xs text-muted-foreground mb-2">
                Need inspiration? Try one of these:
              </p>
              <div className="flex flex-wrap gap-2">
                {examplePrompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPrompt(p)}
                    disabled={isLoading}
                    className="text-xs text-muted-foreground border rounded-full px-3 py-1.5 hover:bg-muted hover:text-foreground hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your prompt is a bit vague. Please answer these questions to refine it:
            </p>
            {refinementQuestions.map((q) => (
              <div key={q.id} className="space-y-2">
                <Label htmlFor={q.id}>{q.question}</Label>
                <Input
                  id={q.id}
                  onChange={(e) => handleAnswerChange(q.id, q.question, e.target.value)}
                  placeholder="Your answer..."
                />
              </div>
            ))}
          </div>
        )}

        <Button
          onClick={handleGenerate}
          disabled={
            isLoading ||
            !prompt ||
            (refinementQuestions.length > 0 && !hasAllAnswers)
          }
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {refinementQuestions.length > 0
                ? 'Generating...'
                : 'Thinking...'}
            </>
          ) : refinementQuestions.length > 0 ? (
            'Generate Form with Answers'
          ) : (
            'Generate Form'
          )}
        </Button>
      </CardContent>
    </Card>
  );
} 