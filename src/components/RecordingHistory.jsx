// RecordingsPage.jsx
import React, { useEffect, useState } from "react";

const VideoPlayer = ({ url, title }) => (
  <div className="video-player">
    <video controls poster="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQwIiBoZWlnaHQ9IjM2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRjNGNEY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMjBweCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlZpZGVvIFByZXZpZXc8L3RleHQ+PC9zdmc+">
      <source src={url} type="video/mp4" />
      Your browser does not support video.
    </video>
    <p className="video-title">{title}</p>
  </div>
);

const FilterBar = ({ filter, setFilter, cameras }) => (
  <div className="filter-bar">
    <div className="search-box">
      <input
        type="text"
        placeholder="Search recordings..."
        value={filter.search}
        onChange={(e) => setFilter({ ...filter, search: e.target.value })}
      />
    </div>
    <div className="filter-controls">
      <select
        value={filter.camera}
        onChange={(e) => setFilter({ ...filter, camera: e.target.value })}
      >
        <option value="all">All Cameras</option>
        {cameras.map((cam) => (
          <option key={cam} value={cam}>
            {cam}
          </option>
        ))}
      </select>
      <select
        value={filter.type}
        onChange={(e) => setFilter({ ...filter, type: e.target.value })}
      >
        <option value="all">All Types</option>
        <option value="local">Local Only</option>
        <option value="cloud">Cloud Only</option>
      </select>
    </div>
  </div>
);

const RecordingSection = ({ title, videos, emptyMessage }) => (
  <div className="recording-section">
    <h2>{title}</h2>
    {videos.length === 0 ? (
      <p className="empty-message">{emptyMessage}</p>
    ) : (
      <div className="video-grid">
        {videos.map((v) => (
          <VideoPlayer key={v.url} url={v.url} title={v.filename} />
        ))}
      </div>
    )}
  </div>
);

export default function RecordingHistory() {
  const [videos, setVideos] = useState({ local: [], cloud: [] });
  const [filter, setFilter] = useState({ search: "", camera: "all", type: "all" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://100.107.158.92:5002/api/recordings");
        const data = await res.json();

        const localWithFullUrl = data.local.map(v => ({
          ...v,
          url: `http://100.107.158.92:5002${v.url}`
        }));

        setVideos({ local: localWithFullUrl, cloud: data.cloud });
      } catch (err) {
        console.error("Error fetching recordings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecordings();
  }, []);

  // Get unique cameras for filter dropdown
  const cameras = [...new Set(videos.local.map(v => v.camera))];

  // Filter videos based on criteria
  const filterVideos = (videoList) => {
    return videoList.filter(video => {
      const matchesSearch = video.filename.toLowerCase().includes(filter.search.toLowerCase()) ||
                           (video.camera && video.camera.toLowerCase().includes(filter.search.toLowerCase()));
      const matchesCamera = filter.camera === "all" || video.camera === filter.camera;
      return matchesSearch && matchesCamera;
    });
  };

  const filteredLocal = filter.type !== "cloud" ? filterVideos(videos.local) : [];
  const filteredCloud = filter.type !== "local" ? filterVideos(videos.cloud) : [];

  if (loading) {
    return (
      <div className="recordings-page">
        <div className="loading-spinner">Loading recordings...</div>
      </div>
    );
  }

  return (
    <div className="recordings-page">
      <header className="page-header">
        <h1>Security Recordings</h1>
        <p>Review and manage your security footage</p>
      </header>

      <FilterBar filter={filter} setFilter={setFilter} cameras={cameras} />

      <div className="recordings-container">
        <RecordingSection
          title="Local Recordings (Last 24 Hours)"
          videos={filteredLocal}
          emptyMessage="No local recordings available."
        />

        <RecordingSection
          title="Cloud Recordings"
          videos={filteredCloud}
          emptyMessage="No cloud recordings available."
        />
      </div>

      <style jsx>{`
        .recordings-page {
          padding: 20px;
          
          margin: 0 auto;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #333;
        }
        
        .page-header {
          margin-bottom: 30px;
          border-bottom: 1px solid #eaeaea;
          padding-bottom: 20px;
        }
        
        .page-header h1 {
          margin: 0;
          color: #2c3e50;
          font-size: 28px;
        }
        
        .page-header p {
          margin: 5px 0 0;
          color: #7f8c8d;
        }
        
        .filter-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 25px;
          padding: 15px;
          background-color: #f8f9fa;
          border-radius: 8px;
        }
        
        .search-box input {
          padding: 10px 15px;
          border: 1px solid #ddd;
          border-radius: 4px;
          width: 250px;
          font-size: 14px;
        }
        
        .filter-controls {
          display: flex;
          gap: 10px;
        }
        
        .filter-controls select {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background-color: white;
          font-size: 14px;
        }
        
        .recording-section {
          margin-bottom: 40px;
        }
        
        .recording-section h2 {
          font-size: 20px;
          color: #34495e;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 2px solid #3498db;
        }
        
        .video-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        
        .video-player {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .video-player:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.15);
        }
        
        .video-player video {
          width: 100%;
          height: auto;
          display: block;
        }
        
        .video-title {
          padding: 10px 15px;
          margin: 0;
          font-size: 14px;
          color: #555;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .empty-message {
          text-align: center;
          padding: 30px;
          color: #95a5a6;
          font-style: italic;
        }
        
        .loading-spinner {
          text-align: center;
          padding: 40px;
          font-size: 18px;
          color: #7f8c8d;
        }
        
        @media (max-width: 768px) {
          .filter-bar {
            flex-direction: column;
          }
          
          .search-box input {
            width: 100%;
          }
          
          .filter-controls {
            width: 100%;
          }
          
          .filter-controls select {
            flex: 1;
          }
          
          .video-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}