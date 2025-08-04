'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, RefreshCw, Sparkles, TrendingUp, Users, MessageSquare, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface AIAnalyticsSummaryProps {
  formId: string;
  dateRange?: { from: string; to: string };
}

interface AIAnalyticsData {
  summary: string;
  generatedAt: string;
  formId: string;
  dateRange?: { from: string; to: string };
}

export const AIAnalyticsSummary: React.FC<AIAnalyticsSummaryProps> = ({ formId, dateRange }) => {
  const { user } = useAuth();
  const [data, setData] = useState<AIAnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAISummary = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      const params = new URLSearchParams();
      if (dateRange?.from) params.append('from', dateRange.from);
      if (dateRange?.to) params.append('to', dateRange.to);

      const url = `/api/forms/${formId}/submissions/analytics/ai-summary${params.toString() ? `?${params}` : ''}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('AI analytics are not available for this form');
        }
        throw new Error(`Failed to fetch AI analytics: ${response.status} ${response.statusText}`);
      }

      const aiData = await response.json();
      setData(aiData);
    } catch (err) {
      console.error('AI Analytics fetch error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAISummary();
  }, [formId, user, dateRange]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const parseAnalysisSection = (text: string, sectionTitle: string) => {
    // Look for the section title followed by a colon (case insensitive)
    const regex = new RegExp(`${sectionTitle}:\\s*([\\s\\S]*?)(?=\\n\\n[A-Z][^:]*:|$)`, 'i');
    const match = text.match(regex);
    if (match && match[1]) {
      // Clean any remaining markdown formatting
      return match[1]
        .trim()
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
        .replace(/\*(.*?)\*/g, '$1')     // Remove italic
        .replace(/^\d+\.\s*/gm, '')      // Remove numbered lists
        .replace(/\*\*/g, '')            // Remove any remaining **
        .replace(/\n{3,}/g, '\n\n');     // Clean extra whitespace
    }
    return null;
  };

  const renderAnalysisSection = (title: string, content: string | null, icon: React.ReactNode) => {
    if (!content) return null;
    
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {icon}
          <h4 className="font-semibold text-sm">{title}</h4>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{content}</p>
      </div>
    );
  };

  if (loading) {
    return (
      <Card className="p-6 animate-in fade-in-0 duration-300">
        <div className="flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary/20 border-t-primary mx-auto"></div>
              <Brain className="absolute inset-0 h-10 w-10 text-primary/60 animate-pulse mx-auto mt-1 ml-1" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">AI is analyzing your form data...</p>
              <p className="text-xs text-muted-foreground">This may take a few moments</p>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
        <div className="space-y-4">
          <div className="text-destructive mb-2 font-medium animate-in slide-in-from-top-2 duration-300 delay-100">
            <div className="flex items-center justify-center gap-2">
              <AlertCircle className="h-5 w-5" />
              AI Analysis Unavailable
            </div>
          </div>
          <p className="text-sm text-muted-foreground animate-in slide-in-from-bottom-2 duration-300 delay-200">
            {error}
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchAISummary}
            className="animate-in slide-in-from-bottom-2 duration-300 delay-300"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">No AI analysis available.</p>
      </Card>
    );
  }

  // Parse different sections of the analysis
  const performanceSummary = parseAnalysisSection(data.summary, 'Overall Performance Summary');
  const statisticalInsights = parseAnalysisSection(data.summary, 'Statistical Insights');
  const sentimentAnalysis = parseAnalysisSection(data.summary, 'User Sentiment Analysis');
  const responsePatterns = parseAnalysisSection(data.summary, 'Response Pattern Analysis');
  const recommendations = parseAnalysisSection(data.summary, 'Recommendations');
  const trendsPatterns = parseAnalysisSection(data.summary, 'Trends and Patterns');

  return (
    <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                AI Analytics Summary
                <Sparkles className="h-4 w-4 text-purple-500" />
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Generated {formatTimeAgo(data.generatedAt)}
                </Badge>
                {dateRange && (
                  <Badge variant="outline" className="text-xs">
                    {dateRange.from} to {dateRange.to}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchAISummary}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </Card>

      {/* Analysis Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance & Statistics */}
        <div className="space-y-6">
          {performanceSummary && (
            <Card className="p-6 transition-all duration-300 hover:shadow-lg">
              {renderAnalysisSection(
                'Performance Summary',
                performanceSummary,
                <TrendingUp className="h-4 w-4 text-green-600" />
              )}
            </Card>
          )}

          {statisticalInsights && (
            <Card className="p-6 transition-all duration-300 hover:shadow-lg">
              {renderAnalysisSection(
                'Statistical Insights',
                statisticalInsights,
                <Users className="h-4 w-4 text-blue-600" />
              )}
            </Card>
          )}
        </div>

        {/* Sentiment & Patterns */}
        <div className="space-y-6">
          {sentimentAnalysis && (
            <Card className="p-6 transition-all duration-300 hover:shadow-lg">
              {renderAnalysisSection(
                'Sentiment Analysis',
                sentimentAnalysis,
                <MessageSquare className="h-4 w-4 text-purple-600" />
              )}
            </Card>
          )}

          {responsePatterns && (
            <Card className="p-6 transition-all duration-300 hover:shadow-lg">
              {renderAnalysisSection(
                'Response Patterns',
                responsePatterns,
                <CheckCircle className="h-4 w-4 text-indigo-600" />
              )}
            </Card>
          )}
        </div>
      </div>

      {/* Recommendations & Trends */}
      <div className="grid grid-cols-1 gap-6">
        {recommendations && (
          <Card className="p-6 transition-all duration-300 hover:shadow-lg border-l-4 border-l-orange-500">
            {renderAnalysisSection(
              'Recommendations',
              recommendations,
              <Sparkles className="h-4 w-4 text-orange-600" />
            )}
          </Card>
        )}

        {trendsPatterns && (
          <Card className="p-6 transition-all duration-300 hover:shadow-lg border-l-4 border-l-blue-500">
            {renderAnalysisSection(
              'Trends & Patterns',
              trendsPatterns,
              <TrendingUp className="h-4 w-4 text-blue-600" />
            )}
          </Card>
        )}
      </div>

      {/* Fallback: Full summary if parsing fails */}
      {!performanceSummary && !statisticalInsights && !sentimentAnalysis && !responsePatterns && !recommendations && !trendsPatterns && (
        <Card className="p-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              <h4 className="font-semibold text-sm">AI Analysis</h4>
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {data.summary}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
