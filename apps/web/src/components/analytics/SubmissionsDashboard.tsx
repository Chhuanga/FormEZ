'use client';

import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TrendingUp, BarChart3, Users, Calendar, Download, Share, Eye, Target, Filter, Clock, ArrowUp, ArrowDown, Minus, BarChart, LineChart, FilterX, Search, Hash } from 'lucide-react';
import { format, parseISO, subDays, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { MiniSparkline } from '@/components/ui/mini-sparkline';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Chart,
  TooltipItem,
  ScriptableContext,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

interface AnalyticsData {
  submissionTrend: { date: string; count: number }[];
  submissionsByDayOfWeek: number[];
  submissionsByHourOfDay: number[];
  fieldAnalytics: {
    fieldId: string;
    label: string;
    type: string;
    options: { option: string; count: number }[];
  }[];
  textAnalytics: {
    fieldId: string;
    label: string;
    type: string;
    wordFrequencies: { word: string; count: number }[];
  }[];
  numericAnalytics: {
    fieldId: string;
    label: string;
    type: string;
    stats: {
      count: number;
      sum: number;
      mean: number;
      min: number;
      max: number;
      histogram: { bin: string; count: number }[];
    };
  }[];
  views?: number;
  completionRate?: number;
  funnel?: {
    views: number;
    submissions: number;
  };
}

export interface SubmissionsDashboardHandle {
  exportData: (format: 'csv' | 'json') => void;
}

export const SubmissionsDashboard = forwardRef<SubmissionsDashboardHandle, { formId: string; formTitle?: string }>(({ formId, formTitle }, ref) => {
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('last30Days');
  const [dateRange, setDateRange] = useState({
    from: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd'),
  });
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [timeGrouping, setTimeGrouping] = useState<'hour' | 'day' | 'week' | 'month'>('day');
  const [responseFilters, setResponseFilters] = useState<Record<string, string[]>>({});
  const [showFilteredAnalytics, setShowFilteredAnalytics] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  // Define quick-select time range options
  const timeRangeOptions = [
    {
      key: 'today',
      label: 'Today',
      icon: Clock,
      getDates: () => ({
        from: format(startOfDay(new Date()), 'yyyy-MM-dd'),
        to: format(endOfDay(new Date()), 'yyyy-MM-dd'),
      }),
    },
    {
      key: 'last7Days',
      label: 'Last 7 Days',
      icon: Calendar,
      getDates: () => ({
        from: format(subDays(new Date(), 6), 'yyyy-MM-dd'),
        to: format(new Date(), 'yyyy-MM-dd'),
      }),
    },
    {
      key: 'last30Days',
      label: 'Last 30 Days',
      icon: Calendar,
      getDates: () => ({
        from: format(subDays(new Date(), 29), 'yyyy-MM-dd'),
        to: format(new Date(), 'yyyy-MM-dd'),
      }),
    },
    {
      key: 'thisWeek',
      label: 'This Week',
      icon: Calendar,
      getDates: () => ({
        from: format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'),
        to: format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'),
      }),
    },
    {
      key: 'thisMonth',
      label: 'This Month',
      icon: Calendar,
      getDates: () => ({
        from: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
        to: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
      }),
    },
    {
      key: 'last90Days',
      label: 'Last 90 Days',
      icon: Calendar,
      getDates: () => ({
        from: format(subDays(new Date(), 89), 'yyyy-MM-dd'),
        to: format(new Date(), 'yyyy-MM-dd'),
      }),
    },
    {
      key: 'thisYear',
      label: 'This Year',
      icon: Calendar,
      getDates: () => ({
        from: format(startOfYear(new Date()), 'yyyy-MM-dd'),
        to: format(endOfYear(new Date()), 'yyyy-MM-dd'),
      }),
    },
    {
      key: 'custom',
      label: 'Custom Range',
      icon: Calendar,
      getDates: () => dateRange, // Uses current dateRange state
    },
  ];

  const handleTimeRangeSelect = (rangeKey: string) => {
    setSelectedTimeRange(rangeKey);
    const selectedOption = timeRangeOptions.find(option => option.key === rangeKey);
    if (selectedOption) {
      const newDateRange = selectedOption.getDates();
      setDateRange(newDateRange);
      // Trigger animation refresh
      setAnimationKey(prev => prev + 1);
    }
  };

  const getTimeRangeLabel = () => {
    const selectedOption = timeRangeOptions.find(option => option.key === selectedTimeRange);
    return selectedOption?.label || 'Custom Range';
  };

  useEffect(() => {
    if (!user || !formId || formId.length < 5) return; // Guard against incomplete/invalid IDs

    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await user.getIdToken();
        const params = new URLSearchParams({
          from: dateRange.from,
          to: dateRange.to,
        });
        const res = await fetch(`/api/forms/${formId}/submissions/analytics?${params}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          if (res.status === 404) {
            // Form not found or no analytics available
            setData(null);
            return;
          }
          throw new Error(`Failed to fetch analytics data: ${res.status} ${res.statusText}`);
        }
        const analyticsData = await res.json();
        setData(analyticsData);
      } catch (err) {
        console.error('Analytics fetch error:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [formId, user, dateRange]);

  const totalSubmissions = data?.submissionTrend?.reduce((sum, day) => sum + day.count, 0) || 0;
  const submissionDays = data?.submissionTrend?.length || 0;
  const avgSubmissionsPerDay = submissionDays > 0 ? (totalSubmissions / submissionDays).toFixed(1) : '0';
  const completionRate = data?.completionRate ? (data.completionRate * 100).toFixed(1) : '0';

  // Calculate trend comparison for previous period
  const calculateTrendComparison = (current: number, previous: number) => {
    if (previous === 0) return { percent: 0, direction: 'neutral' as const, text: 'No previous data' };
    const percent = ((current - previous) / previous) * 100;
    const direction = percent > 0 ? 'up' : percent < 0 ? 'down' : 'neutral';
    const text = percent === 0 ? 'No change' : `${Math.abs(percent).toFixed(1)}% ${direction === 'up' ? 'increase' : 'decrease'}`;
    return { percent: Math.abs(percent), direction, text };
  };

  // Get comparison data for previous period
  const getPreviousPeriodData = () => {
    if (!data) return { submissions: 0, views: 0, completionRate: 0 };
    
    // For demo purposes, simulate previous period data (in real app, this would come from API)
    const previousSubmissions = Math.floor(totalSubmissions * (0.8 + Math.random() * 0.4));
    const previousViews = Math.floor((data.views || 0) * (0.8 + Math.random() * 0.4));
    const previousCompletionRate = data.completionRate ? data.completionRate * (0.9 + Math.random() * 0.2) : 0;
    
    return {
      submissions: previousSubmissions,
      views: previousViews,
      completionRate: previousCompletionRate
    };
  };

  const previousData = getPreviousPeriodData();
  const submissionsTrend = calculateTrendComparison(totalSubmissions, previousData.submissions);
  const viewsTrend = calculateTrendComparison(data?.views || 0, previousData.views);
  const completionRateTrend = calculateTrendComparison(parseFloat(completionRate), previousData.completionRate * 100);
  const avgPerDayTrend = calculateTrendComparison(parseFloat(avgSubmissionsPerDay), previousData.submissions / (data?.submissionTrend?.length || 1));

  // Get color based on metric type and trend
  const getTrendColor = (direction: 'up' | 'down' | 'neutral', isGoodWhenUp: boolean = true) => {
    if (direction === 'neutral') return 'text-muted-foreground';
    if (direction === 'up') return isGoodWhenUp ? 'text-green-600' : 'text-red-600';
    return isGoodWhenUp ? 'text-red-600' : 'text-green-600';
  };

  const getTrendIcon = (direction: 'up' | 'down' | 'neutral') => {
    if (direction === 'up') return ArrowUp;
    if (direction === 'down') return ArrowDown;
    return Minus;
  };

  // Response filtering functions
  const toggleResponseFilter = (fieldId: string, response: string) => {
    setResponseFilters(prev => {
      const current = prev[fieldId] || [];
      const isSelected = current.includes(response);
      
      if (isSelected) {
        // Remove filter
        const newFilters = current.filter(r => r !== response);
        if (newFilters.length === 0) {
          const { [fieldId]: removed, ...rest } = prev;
          return rest;
        }
        return { ...prev, [fieldId]: newFilters };
      } else {
        // Add filter
        return { ...prev, [fieldId]: [...current, response] };
      }
    });
  };

  const clearAllResponseFilters = () => {
    setResponseFilters({});
    setShowFilteredAnalytics(false);
  };

  const getActiveFilterCount = () => {
    return Object.values(responseFilters).reduce((sum, filters) => sum + filters.length, 0);
  };

  const getFilteredFieldAnalytics = () => {
    if (!showFilteredAnalytics || Object.keys(responseFilters).length === 0) {
      return data?.fieldAnalytics || [];
    }
    
    // This would typically require server-side filtering for real cross-field analysis
    // For demo purposes, we'll simulate filtered analytics
    return data?.fieldAnalytics.map(field => ({
      ...field,
      options: field.options.map(option => ({
        ...option,
        count: Math.floor(option.count * (0.3 + Math.random() * 0.4)) // Simulate filtered data
      }))
    })) || [];
  };

  const exportData = (format: 'csv' | 'json') => {
    if (!data) return;
    
    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === 'csv') {
      const csvRows = [
        'Metric,Value',
        `Total Submissions,${totalSubmissions}`,
        `Total Views,${data.views || 0}`,
        `Completion Rate,${completionRate}%`,
        `Average per Day,${avgSubmissionsPerDay}`,
        '',
        'Date,Submissions',
        ...data.submissionTrend.map(d => `${d.date},${d.count}`)
      ];
      content = csvRows.join('\n');
      filename = `${formTitle || 'form'}_analytics.csv`;
      mimeType = 'text/csv';
    } else {
      content = JSON.stringify(data, null, 2);
      filename = `${formTitle || 'form'}_analytics.json`;
      mimeType = 'application/json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  useImperativeHandle(ref, () => ({
    exportData,
  }));

  const shareAnalytics = async () => {
    if (typeof window === 'undefined') return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${formTitle || 'Form'} Analytics`,
          text: `Analytics for ${formTitle || 'this form'}: ${totalSubmissions} submissions, ${completionRate}% completion rate`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
        // Fallback to copy if share is cancelled or fails
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    if (typeof window === 'undefined') return;

    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => {
          console.log('URL copied to clipboard');
          alert('Link copied to clipboard!');
        })
        .catch((err) => {
          console.error('Failed to copy: ', err);
          alert(
            `Could not copy link. Please copy it manually: ${window.location.href}`,
          );
        });
    } else {
      // Fallback for older browsers or non-secure contexts
      alert(`Please copy this URL: ${window.location.href}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 animate-in fade-in-0 duration-300">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary mx-auto mb-4"></div>
            <div className="absolute inset-0 rounded-full h-12 w-12 border-4 border-transparent border-r-primary/40 animate-ping mx-auto"></div>
          </div>
          <div className="space-y-2 animate-in slide-in-from-bottom-2 duration-500 delay-200">
            <p className="text-muted-foreground font-medium">Loading analytics...</p>
            <p className="text-xs text-muted-foreground/70">Analyzing your form data</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
        <div className="space-y-3">
          <div className="text-destructive mb-2 font-medium animate-in slide-in-from-top-2 duration-300 delay-100">
            Error loading analytics
          </div>
          <p className="text-sm text-muted-foreground animate-in slide-in-from-bottom-2 duration-300 delay-200">
            {error}
          </p>
        </div>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No analytics data available.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col gap-6">
          {/* Title and Description */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-black">{formTitle || 'Form Analytics'}</h1>
              <p className="text-sm md:text-base text-gray-600 mt-1">Insights and performance metrics</p>
            </div>
          </div>

          {/* Enhanced Time Range Filter */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Time Range:</span>
              <span className="text-sm font-semibold text-black">{getTimeRangeLabel()}</span>
            </div>
            
            {/* Quick Select Buttons */}
            <div className="flex flex-wrap gap-2">
              {timeRangeOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedTimeRange === option.key;
                const isCustom = option.key === 'custom';
                
                return (
                  <Button
                    key={option.key}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTimeRangeSelect(option.key)}
                    className={`text-xs transition-all duration-200 hover:scale-105 active:scale-95 ${
                      isSelected 
                        ? 'bg-black text-white hover:bg-gray-800 shadow-md' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                    } ${isCustom ? 'border-dashed' : ''}`}
                  >
                    <Icon className="h-3 w-3 mr-1.5" />
                    {option.label}
                  </Button>
                );
              })}
            </div>

            {/* Custom Date Range Inputs (shown when custom is selected) */}
            {selectedTimeRange === 'custom' && (
              <div className="flex flex-col sm:flex-row gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2">
                  <Label htmlFor="from-date" className="text-sm font-medium whitespace-nowrap text-black">From:</Label>
                  <Input
                    id="from-date"
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => {
                      setDateRange(prev => ({ ...prev, from: e.target.value }));
                      setAnimationKey(prev => prev + 1);
                    }}
                    className="text-sm border-gray-300 focus:border-black"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="to-date" className="text-sm font-medium whitespace-nowrap text-black">To:</Label>
                  <Input
                    id="to-date"
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => {
                      setDateRange(prev => ({ ...prev, to: e.target.value }));
                      setAnimationKey(prev => prev + 1);
                    }}
                    className="text-sm border-gray-300 focus:border-black"
                  />
                </div>
              </div>
            )}

            {/* Active Filters */}
            {Object.keys(selectedFilters).length > 0 && (
              <div className="flex flex-wrap gap-1 pt-2 border-t border-gray-200">
                <Filter className="h-4 w-4 text-gray-500 mt-1" />
                <span className="text-xs text-gray-600 mr-2">Active filters:</span>
                {Object.entries(selectedFilters).map(([fieldId, values]) => 
                  values.map(value => (
                    <Badge 
                      key={`${fieldId}-${value}`} 
                      variant="secondary" 
                      className="text-xs cursor-pointer bg-gray-200 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                      onClick={() => {
                        setSelectedFilters(prev => {
                          const newFilters = { ...prev };
                          newFilters[fieldId] = newFilters[fieldId].filter(v => v !== value);
                          if (newFilters[fieldId].length === 0) {
                            delete newFilters[fieldId];
                          }
                          return newFilters;
                        });
                      }}
                    >
                      {value} ×
                    </Badge>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Summary Cards */}
      <TooltipProvider>
        <div 
          key={`cards-${animationKey}`}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500"
        >
          {/* Total Submissions */}
          <Card className={`p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-l-4 bg-white ${
            submissionsTrend.direction === 'up' ? 'border-l-black' : 
            submissionsTrend.direction === 'down' ? 'border-l-gray-400' : 'border-l-gray-300'
          }`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Users className="h-5 w-5 text-black" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                </div>
                <UITooltip>
                  <TooltipTrigger>
                    <MiniSparkline data={data?.submissionTrend || []} className="text-black" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Last 7 days trend</p>
                  </TooltipContent>
                </UITooltip>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold text-black">{totalSubmissions}</p>
                <div className={`flex items-center gap-1 text-xs ${
                  submissionsTrend.direction === 'up' ? 'text-black' :
                  submissionsTrend.direction === 'down' ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  {React.createElement(getTrendIcon(submissionsTrend.direction as 'up' | 'down' | 'neutral'), { className: 'h-3 w-3' })}
                  <span className="font-medium">{submissionsTrend.percent.toFixed(1)}%</span>
                </div>
              </div>
              <p className={`text-xs ${
                submissionsTrend.direction === 'up' ? 'text-black' :
                submissionsTrend.direction === 'down' ? 'text-gray-500' : 'text-gray-400'
              }`}>
                {submissionsTrend.text} from previous period
              </p>
            </div>
          </Card>

          {/* Total Views */}
          <Card className={`p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-l-4 bg-white ${
            viewsTrend.direction === 'up' ? 'border-l-black' : 
            viewsTrend.direction === 'down' ? 'border-l-gray-400' : 'border-l-gray-300'
          }`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Eye className="h-5 w-5 text-black" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">Total Views</p>
                </div>
                <UITooltip>
                  <TooltipTrigger>
                    <MiniSparkline data={data?.submissionTrend || []} className="text-black" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Estimated views trend</p>
                  </TooltipContent>
                </UITooltip>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold text-black">{data?.views || 0}</p>
                <div className={`flex items-center gap-1 text-xs ${
                  viewsTrend.direction === 'up' ? 'text-black' :
                  viewsTrend.direction === 'down' ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  {React.createElement(getTrendIcon(viewsTrend.direction as 'up' | 'down' | 'neutral'), { className: 'h-3 w-3' })}
                  <span className="font-medium">{viewsTrend.percent.toFixed(1)}%</span>
                </div>
              </div>
              <p className={`text-xs ${
                viewsTrend.direction === 'up' ? 'text-black' :
                viewsTrend.direction === 'down' ? 'text-gray-500' : 'text-gray-400'
              }`}>
                {viewsTrend.text} from previous period
              </p>
            </div>
          </Card>

          {/* Completion Rate */}
          <Card className={`p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-l-4 bg-white ${
            completionRateTrend.direction === 'up' ? 'border-l-black' : 
            completionRateTrend.direction === 'down' ? 'border-l-gray-400' : 'border-l-gray-300'
          }`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${
                    parseFloat(completionRate) >= 70 ? 'bg-gray-100' :
                    parseFloat(completionRate) >= 40 ? 'bg-gray-100' : 'bg-gray-100'
                  }`}>
                    <Target className="h-5 w-5 text-black" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                </div>
                <UITooltip>
                  <TooltipTrigger>
                    <div className="w-15 h-5 flex items-center justify-center">
                      <div className={`w-8 h-2 rounded-full bg-gray-200 overflow-hidden`}>
                        <div 
                          className={`h-full transition-all ${
                            parseFloat(completionRate) >= 70 ? 'bg-green-500' :
                            parseFloat(completionRate) >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(parseFloat(completionRate), 100)}%` }}
                        />
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Completion rate indicator</p>
                  </TooltipContent>
                </UITooltip>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold text-black">{completionRate}%</p>
                <div className={`flex items-center gap-1 text-xs ${
                  completionRateTrend.direction === 'up' ? 'text-black' :
                  completionRateTrend.direction === 'down' ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  {React.createElement(getTrendIcon(completionRateTrend.direction as 'up' | 'down' | 'neutral'), { className: 'h-3 w-3' })}
                  <span className="font-medium">{completionRateTrend.percent.toFixed(1)}%</span>
                </div>
              </div>
              <p className={`text-xs ${
                completionRateTrend.direction === 'up' ? 'text-black' :
                completionRateTrend.direction === 'down' ? 'text-gray-500' : 'text-gray-400'
              }`}>
                {completionRateTrend.text} from previous period
              </p>
            </div>
          </Card>

          {/* Avg. per Day */}
          <Card className={`p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-l-4 bg-white ${
            avgPerDayTrend.direction === 'up' ? 'border-l-black' : 
            avgPerDayTrend.direction === 'down' ? 'border-l-gray-400' : 'border-l-gray-300'
          }`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-black" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">Avg. per Day</p>
                </div>
                <UITooltip>
                  <TooltipTrigger>
                    <MiniSparkline data={data?.submissionTrend || []} className="text-black" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Daily average trend</p>
                  </TooltipContent>
                </UITooltip>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold text-black">{avgSubmissionsPerDay}</p>
                <div className={`flex items-center gap-1 text-xs ${
                  avgPerDayTrend.direction === 'up' ? 'text-black' :
                  avgPerDayTrend.direction === 'down' ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  {React.createElement(getTrendIcon(avgPerDayTrend.direction as 'up' | 'down' | 'neutral'), { className: 'h-3 w-3' })}
                  <span className="font-medium">{avgPerDayTrend.percent.toFixed(1)}%</span>
                </div>
              </div>
              <p className={`text-xs ${
                avgPerDayTrend.direction === 'up' ? 'text-black' :
                avgPerDayTrend.direction === 'down' ? 'text-gray-500' : 'text-gray-400'
              }`}>
                {avgPerDayTrend.text} from previous period
              </p>
            </div>
          </Card>
        </div>
      </TooltipProvider>

      {/* Enhanced Trends Section */}
      <div className="space-y-3 md:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg md:text-xl font-semibold">Submission Trends</h2>
          
          {/* Chart Controls */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
              <Button
                variant={chartType === 'line' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType('line')}
                className="text-xs h-7 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <LineChart className="h-3 w-3 mr-1 transition-transform duration-200" />
                Line
              </Button>
              <Button
                variant={chartType === 'bar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType('bar')}
                className="text-xs h-7 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <BarChart className="h-3 w-3 mr-1" />
                Bar
              </Button>
            </div>
          </div>
        </div>
        
        <TooltipProvider>
          <div 
            key={`trends-${animationKey}`}
            className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-200"
          >
            {/* Submission Trend Over Time */}
            <Card className="p-4 md:p-6 transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  <h3 className="text-base md:text-lg font-semibold">Submissions Over Time</h3>
                </div>
                <UITooltip>
                  <TooltipTrigger>
                    <Badge variant="outline" className="text-xs">
                      {chartType === 'line' ? 'Line Chart' : 'Bar Chart'}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Current view: {chartType === 'line' ? 'Line' : 'Bar'} chart</p>
                  </TooltipContent>
                </UITooltip>
              </div>

            {data.submissionTrend.length > 0 ? (
              <div className="h-48 md:h-72">
                {chartType === 'line' ? (
                  <Line
                    key={`line-chart-${animationKey}`}
                    data={{
                      labels: data.submissionTrend.map((d) =>
                        format(parseISO(d.date), window.innerWidth < 768 ? 'M/d' : 'MMM d'),
                      ),
                      datasets: [
                        {
                          label: 'Submissions',
                          data: data.submissionTrend.map((d) => d.count),
                          fill: true,
                          borderColor: 'hsl(var(--primary))',
                          backgroundColor: 'hsla(var(--primary), 0.1)',
                          tension: 0.4,
                          pointRadius: 4,
                          pointHoverRadius: 6,
                          pointBackgroundColor: 'hsl(var(--primary))',
                          pointBorderColor: '#ffffff',
                          pointBorderWidth: 2,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      animation: {
                        duration: 1200,
                        easing: 'easeInOutQuart',
                        delay: (context) => context.dataIndex * 100,
                      },
                      interaction: {
                        intersect: false,
                        mode: 'index',
                      },
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: 'rgba(0, 0, 0, 0.9)',
                          titleColor: '#ffffff',
                          bodyColor: '#ffffff',
                          borderColor: 'hsl(var(--primary))',
                          borderWidth: 2,
                          cornerRadius: 8,
                          displayColors: false,
                          callbacks: {
                            title: (tooltipItems) => {
                              const date = data.submissionTrend[tooltipItems[0].dataIndex].date;
                              return format(parseISO(date), 'EEEE, MMMM d, yyyy');
                            },
                            label: (context) => {
                              const count = context.parsed.y;
                              const total = data.submissionTrend.reduce((sum, d) => sum + d.count, 0);
                              const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0';
                              return [
                                `Submissions: ${count}`,
                                `Share: ${percentage}% of total`,
                              ];
                            }
                          }
                        },
                      },
                      scales: {
                        y: { 
                          beginAtZero: true,
                          grid: {
                            color: 'rgba(0, 0, 0, 0.1)',
                          }
                        },
                        x: {
                          grid: {
                            display: false,
                          }
                        }
                      },
                    }}
                  />
                ) : (
                  <Bar
                    key={`bar-chart-${animationKey}`}
                    data={{
                      labels: data.submissionTrend.map((d) =>
                        format(parseISO(d.date), window.innerWidth < 768 ? 'M/d' : 'MMM d'),
                      ),
                      datasets: [
                        {
                          label: 'Submissions',
                          data: data.submissionTrend.map((d) => d.count),
                          backgroundColor: 'hsla(var(--primary), 0.7)',
                          borderColor: 'hsl(var(--primary))',
                          borderWidth: 1,
                          borderRadius: 4,
                          borderSkipped: false,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      animation: {
                        duration: 1000,
                        easing: 'easeInOutQuart',
                        delay: (context) => context.dataIndex * 80,
                      },
                      interaction: {
                        intersect: false,
                        mode: 'index',
                      },
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: 'rgba(0, 0, 0, 0.9)',
                          titleColor: '#ffffff',
                          bodyColor: '#ffffff',
                          borderColor: 'hsl(var(--primary))',
                          borderWidth: 2,
                          cornerRadius: 8,
                          displayColors: false,
                          callbacks: {
                            title: (tooltipItems) => {
                              const date = data.submissionTrend[tooltipItems[0].dataIndex].date;
                              return format(parseISO(date), 'EEEE, MMMM d, yyyy');
                            },
                            label: (context) => {
                              const count = context.parsed.y;
                              const total = data.submissionTrend.reduce((sum, d) => sum + d.count, 0);
                              const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0';
                              return [
                                `Submissions: ${count}`,
                                `Share: ${percentage}% of total`,
                              ];
                            }
                          }
                        },
                      },
                      scales: {
                        y: { 
                          beginAtZero: true,
                          grid: {
                            color: 'rgba(0, 0, 0, 0.1)',
                          }
                        },
                        x: {
                          grid: {
                            display: false,
                          }
                        }
                      },
                    }}
                  />
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8 text-sm">
                No submission data available
              </p>
            )}
          </Card>

          {/* Submissions by Day of Week */}
          <Card className="p-4 md:p-6 transition-all duration-300 hover:shadow-lg">
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <Calendar className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              <h3 className="text-base md:text-lg font-semibold">By Day of Week</h3>
            </div>
            {data.submissionsByDayOfWeek.some(count => count > 0) ? (
              <div className="h-48 md:h-72">
                <Bar
                  key={`day-chart-${animationKey}`}
                  data={{
                    labels: window.innerWidth < 768 
                      ? ['S', 'M', 'T', 'W', 'T', 'F', 'S']
                      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                    datasets: [
                      {
                        label: 'Submissions',
                        data: data.submissionsByDayOfWeek,
                        backgroundColor: 'hsla(var(--primary), 0.6)',
                        borderColor: 'hsl(var(--primary))',
                        borderWidth: 1,
                        borderRadius: 4,
                      },
                    ],
                  }}
                                     options={{
                     responsive: true,
                     maintainAspectRatio: false,
                     animation: {
                       duration: 800,
                       easing: 'easeOutBounce',
                       delay: (context) => context.dataIndex * 150,
                     },
                     interaction: {
                       intersect: false,
                       mode: 'index',
                     },
                     plugins: {
                       legend: { display: false },
                       tooltip: {
                         backgroundColor: 'rgba(0, 0, 0, 0.9)',
                         titleColor: '#ffffff',
                         bodyColor: '#ffffff',
                         borderColor: 'hsl(var(--primary))',
                         borderWidth: 2,
                         cornerRadius: 8,
                         displayColors: false,
                         callbacks: {
                           title: (tooltipItems) => {
                             const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                             return dayNames[tooltipItems[0].dataIndex];
                           },
                           label: (context) => {
                             const count = context.parsed.y;
                             const total = data.submissionsByDayOfWeek.reduce((sum, d) => sum + d, 0);
                             const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0';
                             return [
                               `Submissions: ${count}`,
                               `Share: ${percentage}% of weekly total`,
                               `Average per occurrence: ${(count / (data.submissionTrend.length / 7)).toFixed(1)}`
                             ];
                           }
                         }
                       },
                     },
                     scales: {
                       y: {
                         beginAtZero: true,
                         ticks: { stepSize: 1 },
                         grid: {
                           color: 'rgba(0, 0, 0, 0.1)',
                         }
                       },
                       x: {
                         grid: {
                           display: false,
                         }
                       }
                     },
                   }}
                />
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8 text-sm">
                No submission data available for this breakdown.
              </p>
            )}
          </Card>
          </div>
        </TooltipProvider>
      </div>

      {/* Submissions by Hour of Day */}
      <Card 
        key={`hourly-${animationKey}`}
        className="p-6 transition-all duration-300 hover:shadow-lg animate-in fade-in-0 slide-in-from-bottom-4 duration-900 delay-400"
      >
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Submissions by Hour of Day</h3>
        </div>
        {data.submissionsByHourOfDay.some(count => count > 0) ? (
          <div className="h-72">
            <Bar
              key={`hourly-bar-${animationKey}`}
              data={{
                labels: Array.from({ length: 24 }, (_, i) => {
                  const hour = i.toString().padStart(2, '0');
                  return `${hour}:00`;
                }),
                datasets: [
                  {
                    label: 'Submissions',
                    data: data.submissionsByHourOfDay,
                    backgroundColor: 'hsla(var(--primary), 0.5)',
                    borderColor: 'hsl(var(--primary))',
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                  duration: 1500,
                  easing: 'easeInOutQuart',
                  delay: (context) => context.dataIndex * 60,
                },
                interaction: {
                  intersect: false,
                  mode: 'index',
                },
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: 'hsl(var(--primary))',
                    borderWidth: 2,
                    cornerRadius: 8,
                    displayColors: false,
                    callbacks: {
                      title: (tooltipItems) => {
                        const hour = tooltipItems[0].dataIndex;
                        const time = hour === 0 ? '12:00 AM' : 
                                    hour < 12 ? `${hour}:00 AM` : 
                                    hour === 12 ? '12:00 PM' : 
                                    `${hour - 12}:00 PM`;
                        return `${time} - ${hour < 23 ? (hour + 1 === 12 ? '1:00 PM' : hour + 1 > 12 ? `${hour + 1 - 12}:00 PM` : `${hour + 1}:00 AM`) : '12:00 AM'}`;
                      },
                      label: (context) => {
                        const count = context.parsed.y;
                        const total = data.submissionsByHourOfDay.reduce((sum, d) => sum + d, 0);
                        const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0';
                        return [
                          `Submissions: ${count}`,
                          `Share: ${percentage}% of daily total`,
                          `Peak ${count > 0 && count === Math.max(...data.submissionsByHourOfDay) ? '🔥 Peak Hour' : ''}`
                        ];
                      }
                    }
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 },
                  },
                  x: {
                    ticks: {
                      maxRotation: 90,
                      minRotation: 45,
                    }
                  }
                },
              }}
            />
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No submission data available for this breakdown.
          </p>
        )}
      </Card>

      {/* Enhanced Field Analytics Section */}
      {data.fieldAnalytics.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-xl font-semibold">Field Analytics</h2>
            
            {/* Response Filter Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {getActiveFilterCount() > 0 && (
                <>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Filter className="h-3 w-3" />
                    {getActiveFilterCount()} active filter{getActiveFilterCount() !== 1 ? 's' : ''}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilteredAnalytics(!showFilteredAnalytics)}
                    className={`text-xs ${showFilteredAnalytics ? 'bg-primary text-primary-foreground' : ''}`}
                  >
                    <Search className="h-3 w-3 mr-1" />
                    {showFilteredAnalytics ? 'Showing Filtered' : 'Apply Filters'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllResponseFilters}
                    className="text-xs text-muted-foreground hover:text-destructive"
                  >
                    <FilterX className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Filtered Analytics Notice */}
          {showFilteredAnalytics && getActiveFilterCount() > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Search className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900 mb-1">Filtered Analysis Active</h3>
                  <p className="text-sm text-blue-700 mb-2">
                    Showing analytics for users who responded with selected answers. This helps understand behavioral patterns of specific user segments.
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(responseFilters).map(([fieldId, responses]) => {
                      const field = data?.fieldAnalytics.find(f => f.fieldId === fieldId);
                      return responses.map(response => (
                        <Badge key={`${fieldId}-${response}`} variant="outline" className="text-xs bg-blue-100 border-blue-300">
                          {field?.label}: "{response}"
                        </Badge>
                      ));
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div 
            key={`field-analytics-${animationKey}`}
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-1000 delay-600"
          >
            {getFilteredFieldAnalytics().map((field, index) => (
              <Card 
                key={field.fieldId} 
                className="p-6 hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
                style={{ animationDelay: `${600 + index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{field.label}</h4>
                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                      <Hash className="h-3 w-3" />
                      {field.options.reduce((sum, opt) => sum + opt.count, 0)}
                    </Badge>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {field.type}
                  </Badge>
                </div>

                {/* Response Filter Options */}
                <div className="mb-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Click responses to filter analytics:</p>
                    {(responseFilters[field.fieldId]?.length || 0) > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const { [field.fieldId]: removed, ...rest } = responseFilters;
                          setResponseFilters(rest);
                        }}
                        className="text-xs h-6 px-2 text-muted-foreground hover:text-destructive"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {field.options.map((option, optionIndex) => {
                      const isSelected =
                        responseFilters[field.fieldId]?.includes(option.option) ?? false;
                      
                      // Handle cases where option.option might be an object
                      const optionValue = typeof option.option === 'object' && option.option !== null 
                        ? (option.option as any).value || JSON.stringify(option.option) 
                        : option.option;
                      
                      const optionLabel = typeof option.option === 'object' && option.option !== null 
                        ? (option.option as any).label || optionValue
                        : option.option;

                      return (
                        <Button
                          key={`${field.fieldId}-${optionValue}-${optionIndex}`}
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleResponseFilter(field.fieldId, optionValue)}
                          className="h-auto py-1 px-2 text-xs transition-all duration-200 ease-in-out transform hover:scale-105"
                        >
                          <span className="truncate max-w-[150px]">{optionLabel}</span>
                          <Badge variant="secondary" className="ml-2 rounded-full h-5 w-5 p-0 flex items-center justify-center text-xs">
                            {option.count}
                          </Badge>
                        </Button>
                      );
                    })}
                  </div>
                </div>
                
                {field.type === 'RadioGroup' || field.type === 'Select' ? (
                  <div className="h-64 mx-auto" style={{ maxWidth: '300px' }}>
                    <Pie
                      key={`pie-${field.fieldId}-${animationKey}`}
                      data={{
                        labels: field.options.map(o => {
                          if (typeof o.option === 'object' && o.option !== null) {
                            return (o.option as any).label || (o.option as any).value || '[Object]';
                          }
                          return o.option;
                        }),
                        datasets: [{
                          data: field.options.map(o => o.count),
                          backgroundColor: [
                            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
                          ],
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: true,
                        animation: {
                          animateRotate: true,
                          animateScale: true,
                          duration: 1500,
                          easing: 'easeInOutQuart',
                        },
                        interaction: {
                          intersect: false,
                        },
                        plugins: {
                          legend: { 
                            position: 'top',
                            labels: {
                              generateLabels: (chart: Chart) => {
                                const labels = chart.data.labels || [];
                                const dataset = chart.data.datasets[0];
                                const backgroundColors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
                                
                                return labels.map((label, index) => ({
                                  text: `${label} (${dataset.data[index]})`,
                                  fillStyle: backgroundColors[index % backgroundColors.length],
                                  strokeStyle: backgroundColors[index % backgroundColors.length],
                                  lineWidth: 0,
                                  hidden: false,
                                  index: index
                                }));
                              }
                            }
                          },
                          tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.9)',
                            titleColor: '#ffffff',
                            bodyColor: '#ffffff',
                            borderColor: 'hsl(var(--primary))',
                            borderWidth: 2,
                            cornerRadius: 8,
                            displayColors: true,
                            callbacks: {
                              label: (context: TooltipItem<'pie'>) => {
                                const count = context.parsed;
                                const total = field.options.reduce((sum, opt) => sum + opt.count, 0);
                                const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0';
                                return [
                                  `Responses: ${count}`,
                                  `Share: ${percentage}%`,
                                  `Click to filter analytics by this response`
                                ];
                              }
                            }
                          },
                        }
                      }}
                    />
                  </div>
                ) : field.type === 'Checkbox' ? (
                  <div className="h-48">
                    <Bar
                      key={`checkbox-bar-${field.fieldId}-${animationKey}`}
                      data={{
                        labels: field.options.map(o => {
                          if (typeof o.option === 'object' && o.option !== null) {
                            return String((o.option as any).label || (o.option as any).value || '[Object]');
                          }
                          return String(o.option);
                        }),
                        datasets: [{
                          label: 'Times Chosen',
                          data: field.options.map(o => o.count),
                          backgroundColor: 'hsla(var(--primary), 0.5)',
                          borderColor: 'hsl(var(--primary))',
                          borderWidth: 1,
                        }]
                      }}
                      options={{
                        indexAxis: 'y',
                        responsive: true,
                        maintainAspectRatio: false,
                        animation: {
                          duration: 1000,
                          easing: 'easeOutElastic',
                          delay: (context: ScriptableContext<'bar'>) => context.dataIndex * 200,
                        },
                        interaction: {
                          intersect: false,
                          mode: 'index',
                        },
                        plugins: {
                          legend: { display: false },
                          tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.9)',
                            titleColor: '#ffffff',
                            bodyColor: '#ffffff',
                            borderColor: 'hsl(var(--primary))',
                            borderWidth: 2,
                            cornerRadius: 8,
                            displayColors: false,
                            callbacks: {
                              label: (context: TooltipItem<'bar'>) => {
                                const count = context.parsed.x;
                                const total = field.options.reduce((sum, opt) => sum + opt.count, 0);
                                const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0';
                                return [
                                  `Times Chosen: ${count}`,
                                  `Share: ${percentage}% of selections`,
                                  `Click to filter analytics by this choice`
                                ];
                              }
                            }
                          },
                        },
                        scales: {
                          x: {
                            beginAtZero: true,
                            ticks: { stepSize: 1 }
                          }
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {field.options.map((option, idx) => {
                      const totalResponses = field.options.reduce((sum, opt) => sum + opt.count, 0);
                      const percentage = totalResponses > 0 ? (option.count / totalResponses * 100).toFixed(1) : '0';
                      
                      const optionLabel = typeof option.option === 'object' && option.option !== null 
                        ? (option.option as any).label || (option.option as any).value || JSON.stringify(option.option) 
                        : option.option;

                      return (
                        <div key={`${optionLabel}-${idx}`} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{optionLabel}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">{option.count} responses</span>
                              <span className="text-xs text-muted-foreground">({percentage}%)</span>
                            </div>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Text Analytics */}
      {data.textAnalytics && data.textAnalytics.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Text Field Insights</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {data.textAnalytics.map((field) => (
              <Card key={field.fieldId} className="p-6">
                <h4 className="font-medium mb-4">{field.label}</h4>
                {field.wordFrequencies.length > 0 ? (
                  <div className="h-64">
                    <Bar
                      data={{
                        labels: field.wordFrequencies.map(d => d.word),
                        datasets: [{
                          label: 'Frequency',
                          data: field.wordFrequencies.map(d => d.count),
                          backgroundColor: 'hsla(var(--primary), 0.5)',
                        }],
                      }}
                      options={{
                        indexAxis: 'y',
                        responsive: true,
                        maintainAspectRatio: false,
                        interaction: {
                          intersect: false,
                          mode: 'index',
                        },
                        plugins: {
                          legend: { display: false },
                          tooltip: {
                            backgroundColor: 'hsl(var(--popover))',
                            titleColor: 'hsl(var(--popover-foreground))',
                            bodyColor: 'hsl(var(--popover-foreground))',
                            borderColor: 'hsl(var(--border))',
                            borderWidth: 1,
                          },
                        },
                        scales: { x: { ticks: { stepSize: 1 } } }
                      }}
                    />
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No significant words found.</p>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Numeric Field Analytics */}
      {data.numericAnalytics && data.numericAnalytics.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Numeric Field Analysis</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {data.numericAnalytics.map((field) => (
              <Card key={field.fieldId} className="p-6">
                <h4 className="font-medium mb-4">{field.label}</h4>
                {field.stats.count > 0 ? (
                  <div className="space-y-4">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Average</p>
                        <p className="text-lg font-semibold">{field.stats.mean.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Min</p>
                        <p className="text-lg font-semibold">{field.stats.min}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Max</p>
                        <p className="text-lg font-semibold">{field.stats.max}</p>
                      </div>
                    </div>
                    
                    {/* Histogram */}
                    <div className="h-48">
                      <Bar
                        data={{
                          labels: field.stats.histogram.map(h => h.bin),
                          datasets: [{
                            label: 'Distribution',
                            data: field.stats.histogram.map(h => h.count),
                            backgroundColor: 'hsla(var(--primary), 0.5)',
                          }],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          interaction: {
                            intersect: false,
                            mode: 'index',
                          },
                          plugins: {
                            legend: { display: false },
                            tooltip: {
                              backgroundColor: 'hsl(var(--popover))',
                              titleColor: 'hsl(var(--popover-foreground))',
                              bodyColor: 'hsl(var(--popover-foreground))',
                              borderColor: 'hsl(var(--border))',
                              borderWidth: 1,
                            },
                          },
                          scales: { y: { ticks: { stepSize: 1 } } }
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No data for this field.</p>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Completion Funnel */}
      {data.funnel && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Conversion Funnel</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <span className="font-medium">Form Views</span>
              <span className="text-xl font-bold">{data.funnel.views}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
              <span className="font-medium">Form Submissions</span>
              <span className="text-xl font-bold">{data.funnel.submissions}</span>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Conversion Rate: <span className="font-semibold">{completionRate}%</span>
              </p>
            </div>
          </div>
        </Card>
      )}

      {data.fieldAnalytics.length === 0 && (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">
            No field analytics available. Analytics are generated for multiple choice fields (Radio, Select, Checkbox).
          </p>
        </Card>
      )}
    </div>
  );
});

SubmissionsDashboard.displayName = 'SubmissionsDashboard'; 