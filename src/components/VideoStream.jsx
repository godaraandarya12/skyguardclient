// src/components/VideoDashboard.jsx
import React, { useEffect, useState, useRef } from 'react';
import Hls from 'hls.js';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import axios from 'axios';
import LiveStream from './liveStream';

const VideoDashboard = () => {
  const [videos, setVideos] = useState([]);
  const [currentVideo, setCurrentVideo] = useState('');
  const hlsPlayerRef = useRef(null);
  const videoJsRef = useRef(null);

  const CAM_NAME = 'cam1';
  const API_BASE = 'http://localhost:3000';

  // Fetch recordings from central server
  useEffect(() => {
    axios.get(`${API_BASE}/api/recordings/${CAM_NAME}`)
      .then((res) => {
        console.log('🎬 Fetched videos:', res.data);
        setVideos(res.data);
        if (res.data.length > 0) {
          setCurrentVideo(`${API_BASE}${res.data[0].url}`);
        }
      })
      .catch((err) => {
        console.error('❌ Error fetching video list:', err);
      });
  }, []);

  // Init video.js for recorded footage
  useEffect(() => {
    if (currentVideo && videoJsRef.current) {
      const player = videojs(videoJsRef.current, {
        controls: true,
        autoplay: false,
        preload: 'auto',
        fluid: true,
      });
      player.src({ src: currentVideo, type: 'video/mp4' });
      return () => {
        player.dispose();
      };
    }
  }, [currentVideo]);

  // Setup HLS live stream via hls.js
  useEffect(() => {
    const video = hlsPlayerRef.current;
    const hls = new Hls();
    const liveStreamUrl = `http://localhost:8888/${CAM_NAME}/index.m3u8`;

    if (Hls.isSupported() && video) {
      hls.loadSource(liveStreamUrl);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = liveStreamUrl;
    }

    return () => {
      hls.destroy();
    };
  }, []);

  return (
    <div className="p-4">

      <h2 className="text-xl font-bold mb-4">🎥 Live Stream ({CAM_NAME})</h2>
      <video
        ref={hlsPlayerRef}
        className="w-full border border-gray-400 rounded mb-6"
        
        autoPlay
        muted
      />

      <h2 className="text-xl font-bold mb-4">📁 Recordings</h2>
      <video
        ref={videoJsRef}
        className="video-js vjs-default-skin w-full"
       
      />

      <ul className="mt-4 space-y-2">
        {videos.map((vid) => (
          <li key={vid.filename}>
            <button
              onClick={() => setCurrentVideo(`${API_BASE}${vid.url}`)}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              ▶️ {vid.filename}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VideoDashboard;
