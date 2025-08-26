import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FiPlay, FiPause, FiSkipBack, FiSkipForward, FiCalendar, FiClock,
  FiDownload, FiTrash2, FiChevronLeft, FiHeart, FiShare2, FiSearch,
  FiVolume2, FiVolumeX, FiRotateCw, FiMaximize2, FiMinimize2
} from 'react-icons/fi';
import axios from 'axios';
import debounce from 'lodash.debounce';
import { format, parseISO } from 'date-fns';
import './RecordingHistory.css'; // We'll create this CSS file

const RecordingHistory = () => {
  // State
  const [recordings, setRecordings] = useState([]);
  const [filteredRecordings, setFilteredRecordings] = useState([]);
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Refs
  const deviceId = localStorage.getItem('device') || sessionStorage.getItem('device') || '';
  const videoRef = useRef(null);
  const searchRef = useRef(null);

  const API_URL = `http://100.66.89.46:3000/api/recordings/${deviceId}`;

  // Fetch recordings
  const fetchRecordings = useCallback(async () => {
    if (!deviceId) {
      setError('No device ID found. Please set a device ID.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(API_URL);
      if (response.data.status === 'success' && Array.isArray(response.data.data)) {
        const enriched = response.data.data.map((r, i) => ({
          ...r,
          duration: '00:00', // placeholder
          size: `${Math.floor(Math.random() * 100) + 10} MB`,
          favorite: false,
        }));
        setRecordings(enriched);
        setFilteredRecordings(enriched);
      } else {
        setRecordings([]);
        setFilteredRecordings([]);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load recordings. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [deviceId, API_URL]);

  useEffect(() => {
    fetchRecordings();
    if (searchRef.current) searchRef.current.focus();
  }, [fetchRecordings]);

  // Filter list
  useEffect(() => {
    const filtered = recordings.filter(r => {
      const matchesSearch = r.timestamp.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDate = filterDate
        ? new Date(r.timestamp).toDateString() === new Date(filterDate).toDateString()
        : true;
      return matchesSearch && matchesDate;
    });
    setFilteredRecordings(filtered);
  }, [recordings, searchQuery, filterDate]);

  // Player event handling
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => {
      setCurrentTime(video.currentTime);
      setIsPlaying(!video.paused);
    };
    const updateMeta = () => setDuration(video.duration || 0);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateMeta);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateMeta);
      video.removeEventListener('ended', handleEnded);
    };
  }, [selectedRecording]);


  const seek = (sec) => {
    const video = videoRef.current;
    if (video) video.currentTime = Math.min(Math.max(0, video.currentTime + sec), duration);
  };
  
  const toggleMute = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = !video.muted;
      setIsMuted(video.muted);
    }
  };
  const togglePlayback = () => {
  const video = videoRef.current;
  if (!video) return;
  if (isPlaying) {
    video.pause();
  } else {
    video.play().catch(err => {
      console.error("Autoplay prevented:", err);
    });
  }
};
  const toggleFullscreen = () => {
    const container = videoRef.current?.parentElement;
    if (!container) return;
    
    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };
  
  const changePlaybackRate = (rate) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  };

  const toggleFavorite = (id) => {
    setRecordings(prev => prev.map(r => 
      r.id === id ? {...r, favorite: !r.favorite} : r
    ));
  };

  const handleDownload = (recording) => {
    // Create a temporary link for downloading
    const link = document.createElement('a');
    link.href = recording.url;
    link.download = `recording-${recording.timestamp}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async (recording) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Recording',
          text: 'Check out this recording',
          url: recording.url,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(recording.url).then(() => {
        alert('Link copied to clipboard!');
      });
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this recording?')) {
      setRecordings(prev => prev.filter(r => r.id !== id));
      if (selectedRecording?.id === id) {
        setSelectedRecording(null);
      }
    }
  };

  // Formatting
  const formatDuration = (sec) => {
    if (!sec || isNaN(sec)) return '00:00';
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };
  
  const formatDate = (d) => format(parseISO(d), 'PPpp');

  const handleSearchChange = debounce((value) => {
    setSearchQuery(value);
  }, 300);

  const clearFilters = () => {
    setSearchQuery('');
    setFilterDate('');
  };

  return (
    <div className="recording-history-container">
      <div className="main-content">
        <div className="header">
          <h1><FiCalendar /> Recording History</h1>
          <p>Device {deviceId || 'N/A'}</p>
        </div>

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
                className="date-filter"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
              
              <button 
                className="clear-filter" 
                onClick={clearFilters}
                disabled={!searchQuery && !filterDate}
              >
                Clear Filters
              </button>
              
              <button className="refresh-button" onClick={fetchRecordings}>
                <FiRotateCw /> Refresh
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading recordings...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
            <button className="retry-button" onClick={fetchRecordings}>
              <FiRotateCw /> Try Again
            </button>
          </div>
        ) : selectedRecording ? (
          <div className="recording-detail-view">
            <button className="back-button" onClick={() => setSelectedRecording(null)}>
              <FiChevronLeft /> Back to List
            </button>
            
            <div className="recording-player">
              <div className={`recording-thumbnail ${isFullscreen ? 'fullscreen' : ''}`}>
               <video
  ref={videoRef}
  src={recording.url}
  preload="metadata" // fetch only duration initially
  playsInline
  muted
  controls={false} // your custom controls
/>
                
                {!isPlaying && (
                  <div className="playback-overlay">
                    <button className="play-button" onClick={togglePlayback}>
                      <FiPlay size={24} />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="playback-controls">
                <div className="left-controls">
                  <button className="control-button" onClick={() => seek(-10)}>
                    <FiSkipBack />
                  </button>
                  
                  <button className="control-button play-pause" onClick={togglePlayback}>
                    {isPlaying ? <FiPause /> : <FiPlay />}
                  </button>
                  
                  <button className="control-button" onClick={() => seek(10)}>
                    <FiSkipForward />
                  </button>
                  
                  <button className="control-button" onClick={toggleMute}>
                    {isMuted ? <FiVolumeX /> : <FiVolume2 />}
                  </button>
                  
                  <div className="time-display">
                    {formatDuration(currentTime)} / {formatDuration(duration)}
                  </div>
                </div>
                
                <div className="progress-container">
                  <input
                    type="range"
                    className="progress-slider"
                    min="0"
                    max={duration}
                    step="0.1"
                    value={Math.min(currentTime, duration)}
                    onChange={(e) => {
                      const newTime = Math.min(parseFloat(e.target.value), duration);
                      if (videoRef.current) {
                        videoRef.current.currentTime = newTime;
                        setCurrentTime(newTime);
                      }
                    }}
                  />
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
                  
                  <button className="control-button" onClick={toggleFullscreen}>
                    {isFullscreen ? <FiMinimize2 /> : <FiMaximize2 />}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="recording-info">
              <div className="info-header">
                <h2>
                  {selectedRecording.favorite && <FiHeart className="favorite-icon" />}
                  Recording from {formatDate(selectedRecording.timestamp)}
                </h2>
              </div>
              
              <div className="recording-meta">
                <span><FiClock /> Duration: {formatDuration(duration)}</span>
                <span>•</span>
                <span>Size: {selectedRecording.size}</span>
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
                  onClick={() => handleDownload(selectedRecording)}
                >
                  <FiDownload /> Download
                </button>
                
                <button 
                  className="action-button"
                  onClick={() => handleShare(selectedRecording)}
                >
                  <FiShare2 /> Share
                </button>
                
                <button 
                  className="action-button danger"
                  onClick={() => handleDelete(selectedRecording.id)}
                >
                  <FiTrash2 /> Delete
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {filteredRecordings.length === 0 ? (
              <div className="empty-state">
                <p>No recordings found</p>
                {(searchQuery || filterDate) && (
                  <button className="clear-filters-button" onClick={clearFilters}>
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="recording-grid">
                {filteredRecordings.map(r => (
                  <div 
                    key={r.id} 
                    className={`recording-card ${r.favorite ? 'favorite' : ''}`}
                    onClick={() => setSelectedRecording(r)}
                  >
                    <div className="card-thumbnail">
                      <video src={r.url} poster={r.url + '#t=0.1'} />
                      <div className="play-icon">
                        <FiPlay />
                      </div>
                      <div className="duration-badge">
                        {r.duration}
                      </div>
                      {r.favorite && (
                        <div className="favorite-badge">
                          <FiHeart size={12} />
                        </div>
                      )}
                    </div>
                    
                    <div className="card-details">
                      <h3>{formatDate(r.timestamp)}</h3>
                      <div className="recording-stats">
                        <span>{r.duration}</span> • <span>{r.size}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RecordingHistory;