import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import {
  FiCamera, FiSettings, FiMaximize, FiRefreshCw, FiVideo, FiMoon, FiSun,
  FiImage, FiPlus, FiMinus, FiMinimize
} from 'react-icons/fi';
import SettingsPanel from './SettingsPanel';

const LiveStream = ({ initialCamera = 'cam1' }) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [camera, setCamera] = useState(initialCamera);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [showSettings, setShowSettings] = useState(false);
  const [streamQuality, setStreamQuality] = useState('auto');
  const [volume, setVolume] = useState(50);
  const [brightness, setBrightness] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [eventLog, setEventLog] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  const cameras = [
    { id: 'cam1', name: 'Main Entrance', url: 'http://100.66.89.46:8889/cam1' },
    { id: 'cam2', name: 'Parking Lot', url: 'http://100.66.89.46:8888/cam1/index.m3u8' },
    { id: 'cam3', name: 'Lobby Area', url: 'http://localhost:3000/hls/cam3/index.m3u8' },
    { id: 'cam4', name: 'Security Desk', url: 'http://localhost:3000/hls/cam4/index.m3u8' },
  ];

  const isHls = (url) => url.endsWith('.m3u8');
  const isIframe = (url) => url.endsWith('.html') || url.includes('/player');
  const isWebrtc = (url) => url.startsWith('http') && !isHls(url) && !isIframe(url);

  useEffect(() => {
    const video = videoRef.current;
    const selectedCamera = cameras.find((cam) => cam.id === camera);

    if (!selectedCamera || !video) return;

    setIsLoading(true);

    if (isHls(selectedCamera.url)) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          autoStartLoad: true,
          startLevel: streamQuality === 'auto' ? -1 : parseInt(streamQuality),
        });
        hlsRef.current = hls;
        hls.loadSource(selectedCamera.url);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().then(() => setIsLoading(false)).catch((err) => {
            console.error('Auto-play failed:', err);
            setIsLoading(false);
          });
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = selectedCamera.url;
        video.addEventListener('loadedmetadata', () => {
          video.play().then(() => setIsLoading(false));
        });
      }
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [camera, streamQuality, refreshKey]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume / 100;
    }
  }, [volume]);

  const videoStyle = {
    filter: `brightness(${brightness})`,
    transform: `scale(${zoom})`,
    transformOrigin: 'center',
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      videoRef.current?.requestFullscreen?.().catch((err) => {
        console.error(`Fullscreen error: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  const refreshStream = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const toggleRecording = () => {
    if (!isRecording) {
      const stream = videoRef.current.captureStream();
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'video/webm' });
      recordedChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recording_${new Date().toISOString()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } else {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const captureScreenshot = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.filter = `brightness(${brightness})`;
    ctx.drawImage(videoRef.current, 0, 0);
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `screenshot_${new Date().toISOString()}.png`;
    a.click();
  };

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
  const zoomIn = () => setZoom((z) => Math.min(3, z + 0.5));
  const zoomOut = () => setZoom((z) => Math.max(1, z - 0.5));
  const resetZoom = () => setZoom(1);

  const selectedCamera = cameras.find((cam) => cam.id === camera);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} transition-colors duration-300 flex flex-col`}>
      <div className="max-w-5xl mx-auto w-full p-4 space-y-4">
        <header className="flex justify-between items-center">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <FiCamera /> {selectedCamera?.name || 'Live Stream'}
          </h1>
          <div className="flex gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-700" title="Toggle Theme">
              {theme === 'dark' ? <FiSun /> : <FiMoon />}
            </button>
            <button onClick={() => setShowSettings(!showSettings)} className="p-2 rounded-full hover:bg-gray-700" title="Settings">
              <FiSettings />
            </button>
          </div>
        </header>

        <div className="relative rounded-xl overflow-hidden shadow-xl">
          <div className="relative pb-[56.25%] bg-black">
            {(() => {
              if (!selectedCamera) return null;

              if (isHls(selectedCamera.url) || isWebrtc(selectedCamera.url)) {
                return (
                  <video
                    ref={videoRef}
                    className="absolute top-0 left-0 w-full h-full object-cover"
                    style={videoStyle}
                    autoPlay
                    playsInline
                    muted
                  />
                );
              }

              if (isIframe(selectedCamera.url)) {
                return (
                  <iframe
                    src={selectedCamera.url}
                    title={selectedCamera.name}
                    className="absolute top-0 left-0 w-full h-full border-0"
                    allow="autoplay; fullscreen"
                  />
                );
              }

              return (
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  ❌ Unsupported stream format
                </div>
              );
            })()}

            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 text-white">
                Connecting to live stream...
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-wrap justify-between items-center p-2 bg-gray-800 bg-opacity-90">
            <div className="flex flex-wrap gap-2 items-center">
              <button onClick={refreshStream} className="p-2 rounded-full bg-gray-700 hover:bg-gray-600" title="Refresh"><FiRefreshCw /></button>
              <button onClick={toggleRecording} className={`p-2 rounded-full ${isRecording ? 'bg-red-600' : 'bg-gray-700'} hover:bg-gray-600`} title="Record"><FiVideo /></button>
              <button onClick={captureScreenshot} className="p-2 rounded-full bg-gray-700 hover:bg-gray-600" title="Screenshot"><FiImage /></button>
              <button onClick={zoomIn} className="p-2 rounded-full bg-gray-700 hover:bg-gray-600" title="Zoom In"><FiPlus /></button>
              <button onClick={zoomOut} className="p-2 rounded-full bg-gray-700 hover:bg-gray-600" title="Zoom Out"><FiMinus /></button>
              <button onClick={resetZoom} className="p-2 rounded-full bg-gray-700 hover:bg-gray-600" title="Reset Zoom"><FiMinimize /></button>
              <span className="text-sm text-white px-3 py-1 bg-gray-700 rounded-full">{zoom.toFixed(1)}x</span>
              <button onClick={toggleFullscreen} className="p-2 rounded-full bg-gray-700 hover:bg-gray-600" title="Fullscreen"><FiMaximize /></button>
            </div>

            {/* Camera Switch */}
            <select value={camera} onChange={(e) => setCamera(e.target.value)} className="bg-gray-700 text-white px-3 py-2 rounded-full">
              {cameras.map((cam) => (
                <option key={cam.id} value={cam.id}>{cam.name}</option>
              ))}
            </select>
          </div>
        </div>

        {showSettings && (
          <SettingsPanel
            streamQuality={streamQuality}
            setStreamQuality={setStreamQuality}
            volume={volume}
            setVolume={setVolume}
            brightness={brightness}
            setBrightness={setBrightness}
            onClose={() => setShowSettings(false)}
          />
        )}
      </div>
    </div>
  );
};

export default LiveStream;
