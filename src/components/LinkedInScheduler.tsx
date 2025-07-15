import React, { useState } from 'react';

interface ScheduleOption {
  label: string;
  value: string | (() => string);
}

interface LinkedInSchedulerProps {
  content: string;
  accessToken: string;
  onSuccess?: (response: any) => void;
  onError?: (error: string) => void;
  className?: string;
}

export default function LinkedInScheduler({
  content,
  accessToken,
  onSuccess,
  onError,
  className = '',
}: LinkedInSchedulerProps) {
  const [isScheduling, setIsScheduling] = useState(false);
  const [customDate, setCustomDate] = useState('');
  const [customTime, setCustomTime] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  // Predefined schedule options
  const scheduleOptions: ScheduleOption[] = [
    { 
      label: 'In 1 hour', 
      value: () => new Date(Date.now() + 60 * 60 * 1000).toISOString() 
    },
    { 
      label: 'Tomorrow morning (9 AM)', 
      value: () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);
        return tomorrow.toISOString();
      }
    },
    { 
      label: 'Next Monday (10 AM)', 
      value: () => {
        const today = new Date();
        const nextMonday = new Date();
        const daysUntilMonday = (1 + 7 - today.getDay()) % 7;
        nextMonday.setDate(today.getDate() + daysUntilMonday);
        nextMonday.setHours(10, 0, 0, 0);
        return nextMonday.toISOString();
      }
    },
    {
      label: 'Best time (Tuesday 11 AM)',
      value: () => {
        const today = new Date();
        const nextTuesday = new Date();
        const daysUntilTuesday = (2 + 7 - today.getDay()) % 7;
        nextTuesday.setDate(today.getDate() + daysUntilTuesday);
        nextTuesday.setHours(11, 0, 0, 0);
        return nextTuesday.toISOString();
      }
    }
  ];

  const handleSchedule = async (scheduledTime: string) => {
    if (!accessToken) {
      onError?.('Not authenticated with LinkedIn');
      return;
    }

    setIsScheduling(true);
    try {
      const response = await fetch('/api/linkedin/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          accessToken,
          scheduledTime,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to schedule LinkedIn post');
      }

      onSuccess?.(data);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsScheduling(false);
    }
  };

  const handleCustomSchedule = () => {
    if (!customDate || !customTime) {
      onError?.('Please select both date and time');
      return;
    }

    const scheduledDateTime = new Date(`${customDate}T${customTime}`);
    handleSchedule(scheduledDateTime.toISOString());
  };

  return (
    <div className={`linkedin-scheduler ${className}`}>
      <h3 className="text-lg font-medium mb-3">Schedule LinkedIn Post</h3>
      
      <div className="space-y-3">
        {scheduleOptions.map((option, index) => (
          <button
            key={index}
            onClick={() => handleSchedule(typeof option.value === 'function' ? option.value() : option.value)}
            className="w-full bg-gray-100 text-gray-800 px-4 py-2 rounded-md flex items-center justify-between hover:bg-gray-200 transition-colors"
            disabled={isScheduling}
          >
            <span>{option.label}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
              <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
            </svg>
          </button>
        ))}
        
        <button
          onClick={() => setShowCustom(!showCustom)}
          className="w-full bg-gray-100 text-gray-800 px-4 py-2 rounded-md flex items-center justify-between hover:bg-gray-200 transition-colors"
        >
          <span>Custom date & time</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
          </svg>
        </button>
        
        {showCustom && (
          <div className="p-3 border border-gray-200 rounded-md space-y-3">
            <div>
              <label htmlFor="custom-date" className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                id="custom-date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div>
              <label htmlFor="custom-time" className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <input
                type="time"
                id="custom-time"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
              />
            </div>
            
            <button
              onClick={handleCustomSchedule}
              className="w-full bg-[#0077b5] text-white px-4 py-2 rounded-md flex items-center justify-center gap-2 hover:bg-[#0069a0] transition-colors"
              disabled={isScheduling || !customDate || !customTime}
            >
              {isScheduling ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.5.5 0 0 0-.5.5v3h-3a.5.5 0 0 0 0 1h3.5a.5.5 0 0 0 .5-.5V4.5A.5.5 0 0 0 8 4z"/>
                </svg>
              )}
              Schedule Post
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
