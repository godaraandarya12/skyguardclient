import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  FiBell,
  FiCheckCircle,
  FiAlertCircle,
  FiXCircle,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiSearch,
  FiX,
  FiDownload,
  FiZoomIn,
  FiZoomOut,
} from 'react-icons/fi';
import { debounce } from 'lodash';
import { saveAs } from 'file-saver';

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const notificationsPerPage = 8;

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('http://localhost:3000/api/notifications/GAST2ccf672af4ea');
        if (!response.ok) throw new Error('Failed to fetch notifications');

        const { data } = await response.json();

        const validatedData = data.map(notification => {
          const timestamp = new Date(notification.timestamp);
          return {
            ...notification,
            timestamp: isNaN(timestamp.getTime()) ? new Date().toISOString() : notification.timestamp
          };
        }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        setNotifications(validatedData);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();

    return () => {
      // Cleanup for pending requests
    };
  }, []);

  const handleSearch = useCallback(
    debounce((value) => {
      setSearchTerm(value);
      setCurrentPage(1);
    }, 300),
    []
  );

  const toggleReadStatus = useCallback(async (id) => {
    try {
      const notification = notifications.find(n => n.id === id);
      const response = await fetch(`http://localhost:3000/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: !notification.read }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      setNotifications(prev =>
        prev.map(n =>
          n.id === id ? { ...n, read: !n.read } : n
        )
      );
    } catch (error) {
      console.error('Error updating read status:', error);
    }
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      const matchesType = filterType === 'all' || notification.type === filterType;
      const matchesSearch =
        notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatTimestamp(notification.timestamp).toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [notifications, filterType, searchTerm]);

  const totalPages = Math.ceil(filteredNotifications.length / notificationsPerPage);
  const paginatedNotifications = useMemo(() => {
    const start = (currentPage - 1) * notificationsPerPage;
    return filteredNotifications.slice(start, start + notificationsPerPage);
  }, [filteredNotifications, currentPage]);

  const formatTimestamp = useCallback((timestamp) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return 'Invalid date';

      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return 'Invalid date';
    }
  }, []);

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setZoomLevel(1);
  };

  const handleDownload = (e, imageUrl) => {
    e.stopPropagation();
    saveAs(imageUrl, `notification-image-${new Date().getTime()}.jpg`);
  };

  const handleZoom = (e, direction) => {
    e.stopPropagation();
    setZoomLevel(prev => {
      const newZoom = direction === 'in' ? prev + 0.1 : prev - 0.1;
      return Math.min(Math.max(newZoom, 0.5), 3);
    });
  };

  const timeAgo = useCallback((timestamp) => {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'Just now';

    const seconds = Math.floor((new Date() - date) / 1000);
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
      second: 1
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
      }
    }

    return 'Just now';
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-indigo-100 text-indigo-600">
                <FiBell className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                <p className="text-sm text-gray-500">
                  {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search notifications..."
                onChange={(e) => handleSearch(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base"
                aria-label="Search notifications"
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setCurrentPage(1);
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <FiX className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                </button>
              )}
            </div>
            
            <div className="w-full md:w-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiFilter className="h-5 w-5 text-indigo-500" />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="appearance-none block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base"
                >
                  <option value="all">All Notifications</option>
                  <option value="info">Information</option>
                  <option value="warning">Warnings</option>
                  <option value="error">Errors</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {/* Header with pagination */}
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-gray-500 mb-2 sm:mb-0">
              Showing <span className="font-medium">{(currentPage - 1) * notificationsPerPage + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(currentPage * notificationsPerPage, filteredNotifications.length)}
              </span>{' '}
              of <span className="font-medium">{filteredNotifications.length}</span> results
            </div>
            
            {totalPages > 1 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-md ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  <FiChevronLeft className="h-5 w-5" />
                </button>
                <span className="text-sm font-medium text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-md ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  <FiChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Notification List */}
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
              </div>
              <p className="mt-4 text-base font-medium text-gray-700">Loading notifications...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center rounded-full bg-red-100 p-3">
                <FiAlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Error loading notifications</h3>
              <p className="mt-2 text-sm text-gray-500">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Retry
              </button>
            </div>
          ) : paginatedNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
                <FiBell className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No notifications found</h3>
              <p className="mt-2 text-sm text-gray-500">
                {searchTerm
                  ? "Try adjusting your search or filter criteria"
                  : "You're all caught up! New notifications will appear here."}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {paginatedNotifications.map((notification) => (
                <li
                  key={notification.id}
                  className={`px-4 py-5 sm:px-6 hover:bg-gray-50 transition-colors duration-150 ${notification.read ? 'bg-gray-50 opacity-90' : 'bg-white'}`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`flex-shrink-0 p-3 rounded-lg ${notification.type === 'info' ? 'bg-blue-100 text-blue-600' : notification.type === 'warning' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}`}>
                      {notification.type === 'info' && <FiCheckCircle className="h-6 w-6" />}
                      {notification.type === 'warning' && <FiAlertCircle className="h-6 w-6" />}
                      {notification.type === 'error' && <FiXCircle className="h-6 w-6" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <p className={`text-base font-medium ${notification.read ? 'text-gray-500' : 'text-gray-900'}`}>
                          {notification.message}
                        </p>
                        <button
                          onClick={() => toggleReadStatus(notification.id)}
                          className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-full shadow-sm ${notification.read ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-indigo-600 text-white hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                        >
                          {notification.read ? 'Mark Unread' : 'Mark Read'}
                        </button>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center text-sm text-gray-500 gap-x-4">
                        <span>{formatTimestamp(notification.timestamp)}</span>
                        <span>•</span>
                        <span>{timeAgo(notification.timestamp)}</span>
                      </div>

                      {notification.imageurls && notification.imageurls.length > 0 && (
                        <div className="mt-3 relative group">
                          <img
                            src={notification.imageurls[0]}
                            alt="Notification content"
                            className="h-48 w-auto rounded-lg object-cover cursor-pointer border border-gray-200 hover:shadow-md transition-all"
                            onClick={() => handleImageClick(notification.imageurls[0])}
                          />
                          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                            <button
                              className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                              onClick={(e) => handleDownload(e, notification.imageurls[0])}
                              title="Download"
                            >
                              <FiDownload className="h-4 w-4 text-gray-700" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-full max-h-full">
            <img
              src={selectedImage}
              alt="Enlarged notification content"
              className="max-w-full max-h-[90vh] object-contain"
              style={{ transform: `scale(${zoomLevel})` }}
              onClick={(e) => e.stopPropagation()}
            />

            <div className="absolute top-4 right-4 flex gap-2 bg-black/50 rounded-lg p-2 backdrop-blur-sm">
              <button
                className="p-2 text-white hover:bg-white/20 rounded-full disabled:opacity-50"
                onClick={(e) => handleZoom(e, 'in')}
                disabled={zoomLevel >= 3}
              >
                <FiZoomIn className="h-5 w-5" />
              </button>
              <button
                className="p-2 text-white hover:bg-white/20 rounded-full disabled:opacity-50"
                onClick={(e) => handleZoom(e, 'out')}
                disabled={zoomLevel <= 0.5}
              >
                <FiZoomOut className="h-5 w-5" />
              </button>
              <button
                className="p-2 text-white hover:bg-white/20 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  saveAs(selectedImage, `notification-${new Date().getTime()}.jpg`);
                }}
              >
                <FiDownload className="h-5 w-5" />
              </button>
              <button
                className="p-2 text-white hover:bg-red-500 rounded-full"
                onClick={() => {
                  setSelectedImage(null);
                  setZoomLevel(1);
                }}
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {Math.round(zoomLevel * 100)}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notification;