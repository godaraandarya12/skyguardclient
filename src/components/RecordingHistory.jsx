import React, { useState, useEffect, useRef } from 'react';
import { 
  FiPlay, FiPause, FiSkipBack, FiSkipForward, 
  FiCalendar, FiClock, FiDownload, FiTrash2,
  FiChevronLeft, FiChevronRight, FiSearch
} from 'react-icons/fi';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import axios from 'axios';

const RecordingHistory = () => {
  const [recordings, setRecordings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [showSidePanel, setShowSidePanel] = useState(true);
  const videoJsRef = useRef(null);

  const CAM_NAME = 'cam1';
  const API_BASE = 'http://localhost:3000';

  // Fetch recordings from server
  useEffect(() => {
    axios.get(`${API_BASE}/api/recordings/${CAM_NAME}`)
      .then((res) => {
        console.log('🎬 Fetched recordings:', res.data);
        // Add mock fields for favorite and events if not provided by API
        const enrichedRecordings = res.data.map((recording, index) => ({
          id: index + 1,
          filename: recording.filename,
          url: recording.url,
          date: recording.date || new Date().toISOString().split('T')[0], // Fallback date
          duration: recording.duration || '00:00:00', // Fallback duration
          size: recording.size || 'Unknown', // Fallback size
          thumbnail: recording.thumbnail || `https://via.placeholder.com/150/${Math.floor(Math.random()*16777215).toString(16)}/FFFFFF?text=${recording.filename}`,
          events: recording.events || Math.floor(Math.random() * 16) + 5, // Mock events
          favorite: recording.favorite || false // Mock favorite status
        }));
        setRecordings(enrichedRecordings);
      })
      .catch((err) => {
        console.error('❌ Error fetching recordings:', err);
      });
  }, []);

  // Initialize video.js for selected recording
  useEffect(() => {
    if (selectedRecording && videoJsRef.current) {
      const player = videojs(videoJsRef.current, {
        controls: true,
        autoplay: false,
        preload: 'auto',
        fluid: true,
      });
      player.src({ src: `${API_BASE}${selectedRecording.url}`, type: 'video/mp4' });
      
      // Update playback state for progress bar
      player.on('timeupdate', () => {
        setCurrentTime((player.currentTime() / player.duration()) * 100 || 0);
        setIsPlaying(!player.paused());
      });

      return () => {
        player.dispose();
      };
    }
  }, [selectedRecording]);

  // Check mobile view
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-hide side panel on mobile
  useEffect(() => {
    if (isMobile) setShowSidePanel(false);
  }, [isMobile]);

  // Filter recordings based on search
  const filteredRecordings = recordings.filter(recording => 
    recording.filename.toLowerCase().includes(searchTerm.toLowerCase()) || 
    recording.date.includes(searchTerm)
  );

  // Toggle favorite status
  const toggleFavorite = (id) => {
    setRecordings(recordings.map(recording => 
      recording.id === id ? { ...recording, favorite: !recording.favorite } : recording
    ));
  };

  // Toggle playback
  const togglePlayback = () => {
    if (videoJsRef.current) {
      const player = videojs(videoJsRef.current);
      if (isPlaying) {
        player.pause();
      } else {
        player.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Format date to be more readable
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Pagination logic
  const recordingsPerPage = 6;
  const totalPages = Math.ceil(filteredRecordings.length / recordingsPerPage);
  const paginatedRecordings = filteredRecordings.slice(
    (currentPage - 1) * recordingsPerPage,
    currentPage * recordingsPerPage
  );

  return (
    <div className="recording-history-container">
     
      
      <div className="main-content">
        <div className="header">
          <h1><FiCalendar /> Recording History</h1>
          <p>View and manage your past recordings</p>
        </div>
        
        <div className="search-bar">
          <div className="search-input">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search recordings by date or filename..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {selectedRecording ? (
          <div className="recording-detail-view">
            <button 
              className="back-button"
              onClick={() => setSelectedRecording(null)}
            >
              <FiChevronLeft /> Back to list
            </button>
            
            <div className="recording-player">
              <div className="recording-thumbnail">
                <video
                  ref={videoJsRef}
                  className="video-js vjs-default-skin w-full"
                />
                <div className="playback-overlay">
                  <button className="play-button" onClick={togglePlayback}>
                    {isPlaying ? <FiPause size={32} /> : <FiPlay size={32} />}
                  </button>
                </div>
              </div>
              
              <div className="playback-controls">
                <button className="control-button">
                  <FiSkipBack size={20} />
                </button>
                <div className="progress-bar">
                  <div 
                    className="progress" 
                    style={{ width: `${currentTime}%` }}
                  ></div>
                </div>
                <button className="control-button">
                  <FiSkipForward size={20} />
                </button>
              </div>
              
              <div className="recording-info">
                <h2>{formatDate(selectedRecording.date)}</h2>
                <div className="recording-meta">
                  <span><FiClock /> {selectedRecording.duration}</span>
                  <span>• {selectedRecording.size}</span>
                  <span>• {selectedRecording.events} events</span>
                </div>
                
                <div className="action-buttons">
                  <button 
                    className={`action-button ${selectedRecording.favorite ? 'active' : ''}`}
                    onClick={() => toggleFavorite(selectedRecording.id)}
                  >
                    {selectedRecording.favorite ? '★ Favorited' : '☆ Favorite'}
                  </button>
                  <button className="action-button">
                    <FiDownload /> Download
                  </button>
                  <button className="action-button danger">
                    <FiTrash2 /> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="recording-grid">
            {paginatedRecordings.map(recording => (
              <div 
                key={recording.id} 
                className={`recording-card ${recording.favorite ? 'favorite' : ''}`}
                onClick={() => setSelectedRecording(recording)}
              >
                <div className="card-thumbnail">
                  <img src={recording.thumbnail} alt="Recording thumbnail" />
                  <div className="play-icon">
                    <FiPlay size={24} />
                  </div>
                  {recording.favorite && (
                    <div className="favorite-badge">★</div>
                  )}
                </div>
                
                <div className="card-details">
                  <h3>{formatDate(recording.date)}</h3>
                  <div className="recording-stats">
                    <span><FiClock /> {recording.duration}</span>
                    <span>• {recording.size}</span>
                  </div>
                  <div className="events-count">
                    {recording.events} events detected
                  </div>
                </div>
              </div>
            ))}
            {paginatedRecordings.length === 0 && (
              <p>No recordings found for the selected criteria.</p>
            )}
          </div>
        )}
        
        <div className="pagination">
          <button 
            className="pagination-button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            <FiChevronLeft /> Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button 
            className="pagination-button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next <FiChevronRight />
          </button>
        </div>
      </div>
      
      <style jsx>{`
        :root {
          --primary: #3498db;
          --success: #2ecc71;
          --danger: #e74c3c;
          --accent: #9b59b6;
          --warning: #f39c12;
          --text: #2c3e50;
          --text-light: #7f8c8d;
          --bg: #f5f7fa;
          --card-bg: #ffffff;
          --border: #e0e0e0;
          --shadow: rgba(0,0,0,0.1);
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
            padding: 20px;
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
        
        .search-bar {
          margin-bottom: 25px;
        }
        
        .search-input {
          position: relative;
          max-width: 500px;
        }
        
        .search-input input {
          width: 100%;
          padding: 12px 15px 12px 40px;
          border-radius: 8px;
          border: 1px solid var(--border);
          font-size: 14px;
          background: var(--card-bg);
          box-shadow: 0 2px 4px var(--shadow);
        }
        
        .search-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-light);
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
        
        .recording-card {
          background: var(--card-bg);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px var(--shadow);
          transition: all 0.3s;
          cursor: pointer;
        }
        
        .recording-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 15px var(--shadow);
        }
        
        .recording-card.favorite {
          border-left: 4px solid var(--warning);
        }
        
        .card-thumbnail {
          position: relative;
          height: 160px;
          overflow: hidden;
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
        }
        
        .card-details h3 {
          margin: 0 0 10px;
          font-size: 16px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .recording-stats {
          display: flex;
          gap: 10px;
          font-size: 13px;
          color: var(--text-light);
          margin-bottom: 10px;
        }
        
        .events-count {
          font-size: 13px;
          color: var(--primary);
          background: rgba(52, 152, 219, 0.1);
          padding: 4px 8px;
          border-radius: 4px;
          display: inline-block;
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
        }
        
        .recording-player {
          background: var(--card-bg);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px var(--shadow);
        }
        
        .recording-thumbnail {
          position: relative;
          height: 300px;
          overflow: hidden;
        }
        
        .recording-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .playback-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
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
        }
        
        .play-button:hover {
          transform: scale(1.1);
        }
        
        .playback-controls {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px 20px;
          background: var(--bg);
        }
        
        .control-button {
          background: none;
          border: none;
          color: var(--text);
          cursor: pointer;
          padding: 5px;
        }
        
        .progress-bar {
          flex: 1;
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
        
        .recording-info {
          padding: 20px;
        }
        
        .recording-info h2 {
          margin: 0 0 10px;
        }
        
        .recording-meta {
          display: flex;
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
          transition: all 0.2s;
        }
        
        .action-button:hover {
          background: var(--border);
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
          background: rgba(231, 76, 60, 0.1);
        }
        
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
          margin-top: 30px;
        }
        
        .pagination-button {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 8px 15px;
          border-radius: 6px;
          border: 1px solid var(--border);
          background: var(--card-bg);
          color: var(--text);
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .pagination-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .pagination-button:hover:not(:disabled) {
          background: var(--border);
        }
        
        .mobile-menu-button {
          position: fixed;
          top: 10px;
          left: 10px;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 20px;
          padding: 8px 15px;
          display: flex;
          align-items: center;
          gap: 5px;
          z-index: 5;
          box-shadow: 0 2px 10px var(--shadow);
        }
      `}</style>
    </div>
  );
};

export default RecordingHistory;