import React, { useState, useEffect } from 'react';
import { Clock, Utensils, Moon, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { API_URL } from '../utils/api';

const LogHistory = ({ userId }) => {
  const [mealLogs, setMealLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchMealLogs();
    }
  }, [userId]);

  // Listen for meal logged events to refresh data in real-time
  useEffect(() => {
    const handleMealLogged = () => {
      if (userId) {
        fetchMealLogs();
      }
    };

    window.addEventListener('mealLogged', handleMealLogged);

    return () => {
      window.removeEventListener('mealLogged', handleMealLogged);
    };
  }, [userId]);

  const fetchMealLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      // Calculate date range for today and yesterday
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // Format dates for MongoDB query
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const yesterdayStart = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
      const yesterdayEnd = new Date(yesterdayStart);
      yesterdayEnd.setDate(yesterdayEnd.getDate() + 1);

      const response = await fetch(`${API_URL}/v1/api/mealplan/${userId}/meal-analytics?limit=6&recent=true`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch meal logs');
      }

      const data = await response.json();
      if (data.success) {
        console.log('Raw meal analytics data:', data.data); // Debug log
        // Filter logs to only show today and yesterday
        const filteredLogs = data.data.filter(log => {
          const logDate = new Date(log.createdAt);
          const logDay = new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate());
          const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const yesterdayDay = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
          
          return logDay.getTime() === todayDay.getTime() || 
                 logDay.getTime() === yesterdayDay.getTime();
        });
        
        console.log('Filtered meal logs:', filteredLogs); // Debug log
        setMealLogs(filteredLogs);
      } else {
        throw new Error(data.message || 'Failed to fetch meal logs');
      }
    } catch (err) {
      console.error('Error fetching meal logs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getMealIcon = (mealType) => {
    switch (mealType?.toLowerCase()) {
      case 'breakfast':
        return <Clock size={16} className="text-amber-500" />;
      case 'lunch':
        return <Utensils size={16} className="text-blue-500" />;
      case 'dinner':
        return <Moon size={16} className="text-purple-500" />;
      default:
        return <Utensils size={16} className="text-gray-500" />;
    }
  };

  const getMealTypeColor = (mealType) => {
    switch (mealType?.toLowerCase()) {
      case 'breakfast':
        return 'text-amber-600 bg-amber-50';
      case 'lunch':
        return 'text-blue-600 bg-blue-50';
      case 'dinner':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // Reset time to start of day for accurate comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const logDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (logDate.getTime() === today.getTime()) {
      return 'Today';
    } else if (logDate.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    } else {
      const diffTime = today.getTime() - logDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
      }
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (loading) {
    return (
      <div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 text-sm">Failed to load meal logs</p>
        <button 
          onClick={fetchMealLogs}
          className="mt-2 text-indigo-600 text-sm hover:text-indigo-700"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!mealLogs || mealLogs.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar size={64} className="text-gray-300 mx-auto mb-6" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No recent meal logs</h3>
        <p className="text-gray-500 text-sm">Log your meals today to see them here</p>
      </div>
    );
  }

  const visibleLogs = expanded ? mealLogs : mealLogs.slice(0, 6);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleLogs.map((log, index) => {
          console.log('Rendering log:', log); // Debug log
          return (
          <div 
            key={log._id || index}
            className="group p-5 bg-gradient-to-br from-white to-gray-50/50 rounded-2xl border border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${getMealTypeColor(log.mealType)} ring-2 ring-gray-100`}>
                  {getMealIcon(log.mealType)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-800 capitalize">
                      {log.mealType}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium">
                    {formatDate(log.createdAt)} • {formatTime(log.createdAt)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">
                  {log.calories}
                </p>
                <p className="text-xs text-gray-500 font-medium">kcal</p>
              </div>
            </div>
            
            <div className="mt-3">
              <p className="text-sm font-semibold text-gray-800 mb-2 line-clamp-2">
                {log.dishName || log.dish || log.name || `${log.mealType} meal`}
              </p>
              
              {(log.protein > 0 || log.carbs > 0 || log.fats > 0) && (
                <div className="flex gap-3 text-xs">
                  {log.protein > 0 && (
                    <span className="px-2 py-1 bg-red-50 text-red-600 rounded-lg font-medium">
                      P: {log.protein}g
                    </span>
                  )}
                  {log.carbs > 0 && (
                    <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg font-medium">
                      C: {log.carbs}g
                    </span>
                  )}
                  {log.fats > 0 && (
                    <span className="px-2 py-1 bg-yellow-50 text-yellow-600 rounded-lg font-medium">
                      F: {log.fats}g
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          );
        })}
      </div>

      {mealLogs.length > 6 && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl transition-all duration-200 border border-indigo-200 hover:border-indigo-300"
          >
            <span>{expanded ? 'Show Less' : `Show All ${mealLogs.length} Logs`}</span>
            {expanded ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default LogHistory;
