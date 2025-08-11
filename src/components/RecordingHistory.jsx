import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  FiPlay, FiPause, FiSkipBack, FiSkipForward, 
  FiCalendar, FiClock, FiDownload, FiTrash2,
  FiChevronLeft, FiImage, FiMaximize2, FiMinimize2,
  FiHeart, FiShare2, FiEdit, FiSearch, FiFilter,
  FiVolume2, FiVolumeX, FiSettings, FiRotateCw
} from 'react-icons/fi';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import axios from 'axios';
import debounce from 'lodash.debounce';
import { format, parseISO, differenceInSeconds } from 'date-fns';

const RecordingHistory = () => {
  // State management
  const [recordings, setRecordings] = useState([]);
  const [filteredRecordings, setFilteredRecordings] = useState([]);
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showThumbnail, setShowThumbnail] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEvents, setShowEvents] = useState(false);
  
  // Refs
  const videoJsRef = useRef(null);
  const playerRef = useRef(null);
  const searchRef = useRef(null);
  
  // API configuration
  const API_URL = 'http://localhost:3000/api/recordings/GAST522f284c4f66';
  const EVENTS_API_URL = 'http://localhost:3000/api/events/GAST522f284c4f66';

  // Mock events data
  const mockEvents = [
    { id: 1, timestamp: '2023-05-15T10:15:30Z', type: 'motion', confidence: 0.92 },
    { id: 2, timestamp: '2023-05-15T10:17:45Z', type: 'person', confidence: 0.87 },
    { id: 3, timestamp: '2023-05-15T10:20:10Z', type: 'vehicle', confidence: 0.95 },
    { id: 4, timestamp: '2023-05-15T10:22:30Z', type: 'animal', confidence: 0.78 },
    { id: 5, timestamp: '2023-05-15T10:25:00Z', type: 'motion', confidence: 0.85 }
  ];

  // Determine video MIME type based on file extension
  const getVideoMimeType = (url) => {
    const extension = url.split('.').pop().toLowerCase();
    switch (extension) {
      case 'mp4':
        return 'video/mp4';
      case 'mkv':
        return 'video/x-matroska';
      default:
        return 'video/mp4'; // Fallback
    }
  };

  // Fetch recordings from server
  const fetchRecordings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(API_URL);
      console.log('🎬 Fetched recordings:', response.data);
      
      if (response.data.status === 'success' && response.data.data.length > 0) {
        const enrichedRecordings = await Promise.all(
          response.data.data.map(async (apiRecording) => {
            const duration = await getVideoDuration(apiRecording.url);
            return {
              id: apiRecording.id,
              device_id: apiRecording.device_id,
              timestamp: apiRecording.timestamp,
              url: apiRecording.url,
              s3_key: apiRecording.s3_key,
              created_at: apiRecording.created_at,
              duration: formatDuration(duration),
              duration_seconds: duration,
              size: formatFileSize(Math.floor(Math.random() * 100) + 10),
              events: Math.floor(Math.random() * 16) + 5,
              favorite: false,
              thumbnail: null,
              tags: generateRandomTags(), // Ensure tags are included
            };
          })
        );
        
        setRecordings(enrichedRecordings);
        setFilteredRecordings(enrichedRecordings);
        
        // Generate thumbnails in batches
        batchGenerateThumbnails(enrichedRecordings);
      } else {
        setRecordings([]);
        setFilteredRecordings([]);
      }
    } catch (err) {
      console.error('❌ Error fetching recordings:', err);
      setError('Failed to load recordings. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Get video duration from URL
  const getVideoDuration = (url) => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.src = url;
      video.preload = 'metadata';
      video.crossOrigin = 'anonymous';

      video.onloadedmetadata = () => {
        resolve(video.duration);
        video.remove();
      };
      video.onerror = () => {
        console.error(`Failed to load metadata for video: ${url}`);
        resolve(0); // Fallback duration
        video.remove();
      };
      video.load(); // Ensure the video loads
    });
  };

  // Format duration in HH:MM:SS
  const formatDuration = (seconds) => {
    if (seconds == null || isNaN(seconds)) return '00:00';
    const total = Math.max(0, Math.floor(seconds));
    const hrs = Math.floor(total / 3600);
    const mins = Math.floor((total % 3600) / 60);
    const secs = total % 60;

    const hh = String(hrs).padStart(2, '0');
    const mm = String(mins).padStart(2, '0');
    const ss = String(secs).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  };

  // Format file size
  const formatFileSize = (sizeInMB) => {
    return sizeInMB < 1 
      ? `${Math.round(sizeInMB * 1024)} KB` 
      : `${sizeInMB.toFixed(1)} MB`;
  };

  // Generate random tags for demonstration
  const generateRandomTags = () => {
    const tags = ['outdoor', 'indoor', 'night', 'day', 'motion', 'person'];
    const count = Math.floor(Math.random() * 3) + 1;
    const result = [];
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * tags.length);
      if (!result.includes(tags[randomIndex])) {
        result.push(tags[randomIndex]);
      }
    }
    return result;
  };

  // Batch generate thumbnails with delay
  const batchGenerateThumbnails = (recordings, batchSize = 3, delay = 500) => {
    const batches = [];
    for (let i = 0; i < recordings.length; i += batchSize) {
      batches.push(recordings.slice(i, i + batchSize));
    }
    
    batches.forEach((batch, index) => {
      setTimeout(() => {
        batch.forEach(recording => generateThumbnail(recording));
      }, index * delay);
    });
  };

  // Generate thumbnail from the first second of the video
  const generateThumbnail = async (recording) => {
    try {
      const video = document.createElement('video');
      video.src = recording.url;
      video.crossOrigin = 'anonymous';
      video.currentTime = 1;

      await new Promise((resolve, reject) => {
        video.onloadeddata = resolve;
        video.onerror = () => reject(new Error(`Failed to load video: ${recording.url}`));
        video.load();
      });

      await new Promise((resolve) => {
        video.onseeked = resolve;
      });

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const thumbnailUrl = canvas.toDataURL('image/jpeg');

      setRecordings((prev) =>
        prev.map((rec) =>
          rec.id === recording.id ? { ...rec, thumbnail: thumbnailUrl } : rec
        )
      );

      if (selectedRecording && selectedRecording.id === recording.id) {
        setSelectedRecording((prev) => ({ ...prev, thumbnail: thumbnailUrl }));
      }

      video.remove();
      canvas.remove();
    } catch (err) {
      console.error(`❌ Error generating thumbnail for recording ${recording.id}:`, err);
      const fallbackThumbnail = `https://via.placeholder.com/320x180/CCCCCC/FFFFFF?text=Recording+${recording.id}`;
      
      setRecordings((prev) =>
        prev.map((rec) =>
          rec.id === recording.id ? { ...rec, thumbnail: fallbackThumbnail } : rec
        )
      );
    }
  };

  // Initialize video.js for selected recording
  useEffect(() => {
    if (selectedRecording && videoJsRef.current && !showThumbnail) {
      const player = videojs(videoJsRef.current, {
        controls: true,
        autoplay: false,
        preload: 'auto',
        fluid: true,
        muted: isMuted,
        playbackRates: [0.5, 1, 1.5, 2],
        controlBar: {
          volumePanel: { inline: false },
          currentTimeDisplay: true,
          timeDivider: true,
          durationDisplay: true,
          progressControl: true,
          remainingTimeDisplay: false,
          playbackRateMenuButton: true,
          fullscreenToggle: true
        }
      });
      
      player.src({ src: selectedRecording.url, type: getVideoMimeType(selectedRecording.url) });
      player.playbackRate(playbackRate);
      playerRef.current = player;

      player.on('timeupdate', () => {
        setCurrentTime(player.currentTime());
        setIsPlaying(!player.paused());
      });

      player.on('loadedmetadata', () => {
        setDuration(player.duration());
      });

      player.on('fullscreenchange', () => {
        setIsFullscreen(player.isFullscreen());
        if (player.isFullscreen()) {
          setShowThumbnail(false);
        }
      });

      player.on('ratechange', () => {
        setPlaybackRate(player.playbackRate());
      });

      player.on('ended', () => {
        setIsPlaying(false);
      });

      player.on('error', (e) => {
        console.error('Video.js error:', player.error());
        setError('Failed to load video. Please check the file format or URL.');
      });

      return () => {
        if (playerRef.current) {
          playerRef.current.dispose();
          playerRef.current = null;
        }
      };
    }
  }, [selectedRecording, showThumbnail, isMuted, playbackRate]);

  // Filter recordings based on search and date filter
  useEffect(() => {
    const filtered = recordings.filter(recording => {
      const matchesSearch = recording.timestamp.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recording.device_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (recording.tags || []).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesDate = filterDate ? 
        new Date(recording.timestamp).toDateString() === new Date(filterDate).toDateString() : 
        true;
      
      return matchesSearch && matchesDate;
    });
    
    setFilteredRecordings(filtered);
  }, [recordings, searchQuery, filterDate]);

  // Initial data fetch
  useEffect(() => {
    fetchRecordings();
    
    if (searchRef.current) {
      searchRef.current.focus();
    }
    
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [fetchRecordings]);

  // Toggle playback
  const togglePlayback = useCallback(() => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pause();
      } else {
        playerRef.current.play().catch(err => {
          console.error('Playback error:', err);
          setError('Failed to play video. Please try again.');
        });
      }
    }
  }, [isPlaying]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedRecording) return;
      
      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlayback();
          break;
        case 'ArrowLeft':
          seek(-5);
          break;
        case 'ArrowRight':
          seek(5);
          break;
        case 'm':
          toggleMute();
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 't':
          if (!isFullscreen) toggleThumbnailView();
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedRecording, togglePlayback, isFullscreen]);

  // Seek backward or forward
  const seek = useCallback((seconds) => {
    if (playerRef.current) {
      const player = playerRef.current;
      const newTime = Math.max(0, Math.min(player.duration(), player.currentTime() + seconds));
      player.currentTime(newTime);
      
      const seekFeedback = document.createElement('div');
      seekFeedback.className = 'seek-feedback';
      seekFeedback.textContent = seconds > 0 ? `+${seconds}s` : `${seconds}s`;
      seekFeedback.style.color = seconds > 0 ? '#2ecc71' : '#e74c3c';
      document.body.appendChild(seekFeedback);
      
      setTimeout(() => {
        seekFeedback.classList.add('fade-out');
        setTimeout(() => seekFeedback.remove(), 300);
      }, 100);
    }
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (playerRef.current) {
      if (isFullscreen) {
        playerRef.current.exitFullscreen();
      } else {
        playerRef.current.requestFullscreen();
      }
    }
  }, [isFullscreen]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (playerRef.current) {
      const newMutedState = !playerRef.current.muted();
      playerRef.current.muted(newMutedState);
      setIsMuted(newMutedState);
    }
  }, []);

  // Change playback rate
  const changePlaybackRate = useCallback((rate) => {
    if (playerRef.current) {
      playerRef.current.playbackRate(rate);
      setPlaybackRate(rate);
    }
  }, []);

  // Format date to be more readable
  const formatDate = useCallback((dateString) => {
    return format(parseISO(dateString), 'PPPPpp');
  }, []);

  // Toggle favorite status
  const toggleFavorite = useCallback((id) => {
    setRecordings(prev => prev.map(rec => 
      rec.id === id ? { ...rec, favorite: !rec.favorite } : rec
    ));
    
    if (selectedRecording && selectedRecording.id === id) {
      setSelectedRecording(prev => ({ ...prev, favorite: !prev.favorite }));
    }
  }, [selectedRecording]);

  // Toggle between thumbnail and video feed
  const toggleThumbnailView = useCallback(() => {
    if (!isFullscreen) {
      setShowThumbnail(prev => !prev);
    }
  }, [isFullscreen]);

  // Handle recording selection
  const handleSelectRecording = useCallback((recording) => {
    setSelectedRecording(recording);
    setSelectedEvent(null);
    setShowEvents(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Handle event selection
  const handleSelectEvent = useCallback((event) => {
    setSelectedEvent(event);
    if (playerRef.current) {
      const eventTime = differenceInSeconds(
        parseISO(event.timestamp),
        parseISO(selectedRecording.timestamp)
      );
      playerRef.current.currentTime(Math.max(0, eventTime));
      playerRef.current.play().catch(err => {
        console.error('Playback error:', err);
        setError('Failed to play video at event timestamp.');
      });
      setIsPlaying(true);
    }
  }, [selectedRecording]);

  // Debounced search
  const handleSearchChange = debounce((value) => {
    setSearchQuery(value);
  }, 300);

  // Refresh recordings
  const handleRefresh = useCallback(() => {
    fetchRecordings();
  }, [fetchRecordings]);

  // Delete recording
  const handleDeleteRecording = useCallback(async (id) => {
    if (window.confirm('Are you sure you want to delete this recording?')) {
      try {
        // Uncomment and configure the actual API call
        // await axios.delete(`${API_URL}/${id}`);
        
        setRecordings(prev => prev.filter(rec => rec.id !== id));
        if (selectedRecording && selectedRecording.id === id) {
          setSelectedRecording(null);
        }
      } catch (err) {
        console.error('Error deleting recording:', err);
        alert('Failed to delete recording. Please try again.');
      }
    }
  }, [selectedRecording]);

  // Share recording
  const handleShareRecording = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: `Recording from ${selectedRecording.device_id}`,
        text: `Check out this recording from ${formatDate(selectedRecording.timestamp)}`,
        url: selectedRecording.url
      }).catch(err => {
        console.error('Error sharing:', err);
      });
    } else {
      navigator.clipboard.writeText(selectedRecording.url).then(() => {
        alert('Recording URL copied to clipboard!');
      }).catch(err => {
        console.error('Could not copy text: ', err);
        prompt('Copy this URL:', selectedRecording.url);
      });
    }
  }, [selectedRecording, formatDate]);

  // Calculate progress percentage
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="recording-history-container">
      <div className="main-content">
        <div className="header">
          <h1><FiCalendar /> Recording History</h1>
          <p>Viewing recordings for device GAST522f284c4f66</p>
          
          {!selectedRecording && (
            <div className="controls-bar">
              <div className="search-box">
                <FiSearch className="search-icon" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search recordings..."
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>
              
              <div className="filter-controls">
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="date-filter"
                />
                <button 
                  onClick={() => setFilterDate('')}
                  disabled={!filterDate}
                  className="clear-filter"
                >
                  Clear
                </button>
                <button onClick={handleRefresh} className="refresh-button">
                  <FiRotateCw /> Refresh
                </button>
              </div>
            </div>
          )}
        </div>

        {loading && !recordings.length ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading recordings...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={fetchRecordings} className="retry-button">
              <FiRotateCw /> Retry
            </button>
          </div>
        ) : selectedRecording ? (
          <div className="recording-detail-view">
            <button 
              className="back-button"
              onClick={() => setSelectedRecording(null)}
            >
              <FiChevronLeft /> Back to list
            </button>

            <div className="recording-player">
              <div className={`recording-thumbnail ${isFullscreen ? 'fullscreen' : ''}`}>
                {showThumbnail && selectedRecording.thumbnail && !isFullscreen ? (
                  <img
                    src={selectedRecording.thumbnail}
                    alt="Recording thumbnail"
                    className="thumbnail-image"
                  />
                ) : (
                  <video
                    ref={videoJsRef}
                    className="video-js vjs-default-skin w-full"
                    crossOrigin="anonymous"
                  />
                )}
                <div className="playback-overlay">
                  {!showThumbnail && !isFullscreen && (
                    <button className="play-button" onClick={togglePlayback}>
                      {isPlaying ? <FiPause size={32} /> : <FiPlay size={32} />}
                    </button>
                  )}
                </div>
              </div>

              <div className="playback-controls">
                <div className="left-controls">
                  <button className="control-button" onClick={() => seek(-10)}>
                    <FiSkipBack size={20} />
                  </button>
                  <button className="control-button" onClick={togglePlayback}>
                    {isPlaying ? <FiPause size={20} /> : <FiPlay size={20} />}
                  </button>
                  <button className="control-button" onClick={() => seek(10)}>
                    <FiSkipForward size={20} />
                  </button>
                  <button className="control-button" onClick={toggleMute}>
                    {isMuted ? <FiVolumeX size={20} /> : <FiVolume2 size={20} />}
                  </button>
                </div>

                <div className="progress-container">
                  <div className="time-display">
                    {formatDuration(currentTime)} / {formatDuration(duration)}
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress" 
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>

                <div className="right-controls">
                  <div className="playback-rate">
                    <select
                      value={playbackRate}
                      onChange={(e) => changePlaybackRate(parseFloat(e.target.value))}
                    >
                      <option value="0.5">0.5x</option>
                      <option value="1">1x</option>
                      <option value="1.5">1.5x</option>
                      <option value="2">2x</option>
                    </select>
                  </div>
                  <button 
                    className="control-button" 
                    onClick={toggleThumbnailView}
                    disabled={isFullscreen}
                    title="Toggle Thumbnail"
                  >
                    <FiImage size={20} />
                  </button>
                  <button 
                    className="control-button" 
                    onClick={toggleFullscreen}
                    title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                  >
                    {isFullscreen ? <FiMinimize2 size={20} /> : <FiMaximize2 size={20} />}
                  </button>
                </div>
              </div>

              <div className="recording-info">
                <div className="info-header">
                  <h2>
                    {formatDate(selectedRecording.timestamp)}
                    {selectedRecording.favorite && <span className="favorite-icon">★</span>}
                  </h2>
                  <div className="tag-container">
                    {(selectedRecording.tags || []).map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>

                <div className="recording-meta">
                  <span><FiClock /> {selectedRecording.duration}</span>
                  <span>• Size: {selectedRecording.size}</span>
                  <span>• Device: {selectedRecording.device_id}</span>
                  <span>• Created: {formatDate(selectedRecording.created_at)}</span>
                  <span>• {selectedRecording.events} events detected</span>
                </div>

                <div className="action-buttons">
                  <button 
                    className={`action-button ${selectedRecording.favorite ? 'active' : ''}`}
                    onClick={() => toggleFavorite(selectedRecording.id)}
                  >
                    <FiHeart /> {selectedRecording.favorite ? 'Favorited' : 'Favorite'}
                  </button>
                  <button 
                    className="action-button"
                    onClick={() => setShowEvents(!showEvents)}
                  >
                    <FiSettings /> {showEvents ? 'Hide Events' : 'Show Events'}
                  </button>
                  <a 
                    href={selectedRecording.url} 
                    className="action-button"
                    download={`recording_${selectedRecording.id}.mp4`}
                  >
                    <FiDownload /> Download
                  </a>
                  <button 
                    className="action-button"
                    onClick={handleShareRecording}
                  >
                    <FiShare2 /> Share
                  </button>
                  <button 
                    className="action-button danger"
                    onClick={() => handleDeleteRecording(selectedRecording.id)}
                  >
                    <FiTrash2 /> Delete
                  </button>
                </div>

                {showEvents && (
                  <div className="events-panel">
                    <h3>Detected Events</h3>
                    <div className="events-list">
                      {mockEvents.map(event => (
                        <div 
                          key={event.id}
                          className={`event-item ${selectedEvent?.id === event.id ? 'active' : ''}`}
                          onClick={() => handleSelectEvent(event)}
                        >
                          <div className="event-type">{event.type}</div>
                          <div className="event-time">
                            {format(parseISO(event.timestamp), 'HH:mm:ss')}
                          </div>
                          <div className="event-confidence">
                            Confidence: {(event.confidence * 100).toFixed(0)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="recording-grid">
            {filteredRecordings.length > 0 ? (
              filteredRecordings.map(recording => (
                <div 
                  key={recording.id} 
                  className={`recording-card ${recording.favorite ? 'favorite' : ''}`}
                  onClick={() => handleSelectRecording(recording)}
                >
                  <div className="card-thumbnail">
                    <img 
                      src={recording.thumbnail || 'https://via.placeholder.com/320x180/CCCCCC/FFFFFF?text=Loading...'} 
                      alt="Recording thumbnail" 
                    />
                    <div className="play-icon">
                      <FiPlay size={24} />
                    </div>
                    <div className="duration-badge">
                      {recording.duration}
                    </div>
                    {recording.favorite && (
                      <div className="favorite-badge">★</div>
                    )}
                  </div>

                  <div className="card-details">
                    <h3>{formatDate(recording.timestamp)}</h3>
                    <div className="tag-container">
                      {(recording.tags || []).slice(0, 2).map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                      {(recording.tags || []).length > 2 && (
                        <span className="tag-more">+{(recording.tags || []).length - 2}</span>
                      )}
                    </div>
                    <div className="recording-stats">
                      <span>{recording.size}</span>
                      <span>• {recording.events} events</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No recordings found matching your criteria.</p>
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setFilterDate('');
                  }}
                  className="clear-filters-button"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        :root {
          --primary: #3498db;
          --primary-light: rgba(52, 152, 219, 0.1);
          --success: #2ecc71;
          --danger: #e74c3c;
          --danger-light: rgba(231, 76, 60, 0.1);
          --warning: #f39c12;
          --warning-light: rgba(243, 156, 18, 0.1);
          --accent: #9b59b6;
          --text: #2c3e50;
          --text-light: #7f8c8d;
          --text-lighter: #bdc3c7;
          --bg: #f5f7fa;
          --card-bg: #ffffff;
          --border: #e0e0e0;
          --shadow: rgba(0,0,0,0.1);
          --shadow-hover: rgba(0,0,0,0.2);
          --transition: all 0.3s ease;
        }

        * {
          box-sizing: border-box;
        }

        .recording-history-container {
          display: flex;
          min-height: 100vh;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: var(--bg);
          color: var(--text);
        }

        .main-content {
          flex: 1;
          padding: 30px;
          max-width: 100%;
          overflow-x: hidden;
        }

        @media (max-width: 768px) {
          .main-content {
            padding: 20px 15px;
          }
        }

        .header {
          margin-bottom: 30px;
        }

        .header h1 {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--text);
          margin: 0;
          font-size: 28px;
        }

        .header p {
          color: var(--text-light);
          margin: 5px 0 0;
        }

        .controls-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          margin-top: 20px;
          align-items: center;
        }

        .search-box {
          flex: 1;
          min-width: 250px;
          position: relative;
          max-width: 400px;
        }

        .search-box input {
          width: 100%;
          padding: 10px 15px 10px 35px;
          border: 1px solid var(--border);
          border-radius: 6px;
          font-size: 14px;
          transition: var(--transition);
        }

        .search-box input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 2px var(--primary-light);
        }

        .search-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-light);
        }

        .filter-controls {
          display: flex;
          gap: 10px;
          align-items: center;
          flex-wrap: wrap;
        }

        .date-filter {
          padding: 8px 12px;
          border: 1px solid var(--border);
          border-radius: 6px;
          font-size: 14px;
        }

        .clear-filter, .refresh-button, .retry-button {
          padding: 8px 12px;
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 5px;
          transition: var(--transition);
        }

        .clear-filter:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .clear-filter:not(:disabled):hover, 
        .refresh-button:hover, 
        .retry-button:hover {
          background: var(--border);
        }

        .loading-state, .error-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          gap: 20px;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 5px solid var(--border);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .error-state p {
          color: var(--danger);
          font-size: 16px;
        }

        .recording-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        @media (max-width: 600px) {
          .recording-grid {
            grid-template-columns: 1fr;
          }
        }

        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 40px 20px;
          color: var(--text-light);
        }

        .clear-filters-button {
          margin-top: 15px;
          padding: 8px 16px;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: var(--transition);
        }

        .clear-filters-button:hover {
          background: #2980b9;
        }

        .recording-card {
          background: var(--card-bg);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px var(--shadow);
          transition: var(--transition);
          cursor: pointer;
          display: flex;
          flex-direction: column;
        }

        .recording-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 15px var(--shadow-hover);
        }

        .recording-card.favorite {
          border-left: 4px solid var(--warning);
        }

        .card-thumbnail {
          position: relative;
          height: 160px;
          overflow: hidden;
          background: #000;
        }

        .card-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }

        .recording-card:hover .card-thumbnail img {
          transform: scale(1.05);
        }

        .play-icon {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0,0,0,0.7);
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          opacity: 0;
          transition: opacity 0.3s;
        }

        .recording-card:hover .play-icon {
          opacity: 1;
        }

        .duration-badge {
          position: absolute;
          bottom: 10px;
          right: 10px;
          background: rgba(0,0,0,0.7);
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 12px;
        }

        .favorite-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          background: var(--warning);
          color: white;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }

        .card-details {
          padding: 15px;
          flex: 1;
        }

        .card-details h3 {
          margin: 0 0 10px;
          font-size: 16px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .tag-container {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin-bottom: 10px;
        }

        .tag {
          background: var(--primary-light);
          color: var(--primary);
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 12px;
        }

        .tag-more {
          background: var(--border);
          color: var(--text-light);
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 12px;
        }

        .recording-stats {
          display: flex;
          gap: 10px;
          font-size: 13px;
          color: var(--text-light);
          margin-top: 10px;
        }

        .recording-detail-view {
          margin-bottom: 30px;
        }

        .back-button {
          display: flex;
          align-items: center;
          gap: 5px;
          background: none;
          border: none;
          color: var(--primary);
          font-size: 14px;
          margin-bottom: 20px;
          cursor: pointer;
          padding: 8px 0;
          transition: var(--transition);
        }

        .back-button:hover {
          color: #2980b9;
        }

        .recording-player {
          background: var(--card-bg);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px var(--shadow);
        }

        .recording-thumbnail {
          position: relative;
          height: 500px;
          overflow: hidden;
          background: #000;
        }

        .recording-thumbnail.fullscreen {
          height: calc(100vh - 120px);
        }

        @media (max-width: 768px) {
          .recording-thumbnail {
            height: 300px;
          }
        }

        .thumbnail-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .playback-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }

        .play-button {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: rgba(255,255,255,0.9);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
          cursor: pointer;
          transition: transform 0.2s;
          pointer-events: auto;
        }

        .play-button:hover {
          transform: scale(1.1);
        }

        .playback-controls {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 10px 20px;
          background: var(--bg);
          flex-wrap: wrap;
        }

        .left-controls, .right-controls {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .progress-container {
          flex: 1;
          min-width: 200px;
        }

        .time-display {
          font-size: 12px;
          color: var(--text-light);
          margin-bottom: 2px;
        }

        .progress-bar {
          height: 6px;
          background: var(--border);
          border-radius: 3px;
          overflow: hidden;
        }

        .progress {
          height: 100%;
          background: var(--primary);
          transition: width 0.1s;
        }

        .control-button {
          background: none;
          border: none;
          color: var(--text);
          cursor: pointer;
          padding: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: var(--transition);
        }

        .control-button:hover {
          background: var(--border);
        }

        .control-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .playback-rate select {
          padding: 5px;
          border-radius: 4px;
          border: 1px solid var(--border);
          background: var(--card-bg);
          color: var(--text);
        }

        .recording-info {
          padding: 20px;
        }

        .info-header {
          margin-bottom: 15px;
        }

        .info-header h2 {
          margin: 0 0 5px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .favorite-icon {
          color: var(--warning);
        }

        .recording-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          color: var(--text-light);
          margin-bottom: 20px;
          font-size: 14px;
        }

        .recording-meta span {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .action-buttons {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }

        .action-button {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 8px 15px;
          border-radius: 6px;
          border: 1px solid var(--border);
          background: var(--bg);
          color: var(--text);
          cursor: pointer;
          font-size: 14px;
          transition: var(--transition);
          text-decoration: none;
        }

        .action-button:hover {
          background: var(--border);
        }

        .action-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .action-button.active {
          background: var(--warning);
          color: white;
          border-color: var(--warning);
        }

        .action-button.danger {
          color: var(--danger);
          border-color: var(--danger);
        }

        .action-button.danger:hover {
          background: var(--danger-light);
        }

        .events-panel {
          border-top: 1px solid var(--border);
          padding-top: 20px;
          margin-top: 20px;
        }

        .events-panel h3 {
          margin: 0 0 15px;
        }

        .events-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .event-item {
          padding: 10px;
          border: 1px solid var(--border);
          border-radius: 6px;
          cursor: pointer;
          transition: var(--transition);
        }

        .event-item:hover {
          background: var(--bg);
        }

        .event-item.active {
          border-color: var(--primary);
          background: var(--primary-light);
        }

        .event-type {
          font-weight: bold;
          text-transform: capitalize;
        }

        .event-time {
          font-size: 13px;
          color: var(--text-light);
          margin: 3px 0;
        }

        .event-confidence {
          font-size: 12px;
          color: var(--text-lighter);
        }

        /* Seek feedback animation */
        .seek-feedback {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 24px;
          font-weight: bold;
          z-index: 1000;
          opacity: 1;
          transition: opacity 0.3s;
        }

        .seek-feedback.fade-out {
          opacity: 0;
          transform: translate(-50%, -100%);
        }

        /* Video.js custom styles */
        .video-js {
          width: 100%;
          height: 100%;
        }

        .video-js .vjs-big-play-button {
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .video-js .vjs-control-bar {
          background: rgba(0, 0, 0, 0.7);
        }

        .video-js .vjs-play-progress {
          background: var(--primary);
        }
      `}</style>
    </div>
  );
};

export default RecordingHistory;