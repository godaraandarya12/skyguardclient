import { useState, useEffect, useRef } from 'react';

export default function VideoStream() {
  // Stream feeds data
  const rtspFeeds = [
    { id: 1, name: 'Main Entrance', path: 'all' },
    { id: 2, name: 'Parking Lot', path: 'all' },
    { id: 3, name: 'Lobby Area', path: 'all' },
    { id: 4, name: 'Back Door', path: 'all' },
  ];

  const [selectedFeed, setSelectedFeed] = useState(rtspFeeds[0]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'single'
  const [quality, setQuality] = useState('hd'); // 'sd', 'hd', 'fhd'
  const [streamStatus, setStreamStatus] = useState({});
  const videoRefs = useRef({});
  const baseUrl = 'http://192.168.1.18:8889';

  // Initialize stream status
  useEffect(() => {
    const status = {};
    rtspFeeds.forEach(feed => {
      status[feed.path] = 'connecting';
      // Simulate connection
      setTimeout(() => {
        setStreamStatus(prev => ({
          ...prev,
          [feed.path]: Math.random() > 0.1 ? 'active' : 'error'
        }));
      }, 1000 + Math.random() * 1500);
    });
    setStreamStatus(status);
  }, []);

  const getStreamUrl = (path) => `${baseUrl}/${path}`;

  const toggleFullScreen = (path) => {
    const iframe = videoRefs.current[path];
    if (!iframe) return;
    
    if (!document.fullscreenElement) {
      iframe.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header Controls */}
        <div className="bg-gray-800 text-white p-3 flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center space-x-4">
            <h1 className="font-semibold">Security Monitoring</h1>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                streamStatus[selectedFeed.path] === 'active' ? 'bg-green-500' :
                streamStatus[selectedFeed.path] === 'error' ? 'bg-red-500' : 'bg-yellow-500'
              }`} />
              <span className="text-sm">
                {streamStatus[selectedFeed.path] === 'active' ? 'All systems operational' :
                 streamStatus[selectedFeed.path] === 'error' ? 'Connection issues' : 'Connecting...'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
              className="bg-gray-700 text-white text-sm rounded px-3 py-1 border border-gray-600"
            >
              <option value="sd">SD Quality</option>
              <option value="hd">HD Quality</option>
              <option value="fhd">Full HD</option>
            </select>

            <div className="flex bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded-md text-sm ${
                  viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('single')}
                className={`px-3 py-1 rounded-md text-sm ${
                  viewMode === 'single' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'
                }`}
              >
                Single
              </button>
            </div>
          </div>
        </div>

        {/* Video Content Area */}
        <div className="p-4">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {rtspFeeds.map(feed => (
                <div 
                  key={feed.id} 
                  className="bg-black rounded-lg overflow-hidden border border-gray-200"
                >
                  <div className="relative aspect-video">
                    <iframe
                      title={feed.name}
                      src={getStreamUrl(feed.path)}
                      className="w-full h-full"
                      ref={el => videoRefs.current[feed.path] = el}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-medium text-sm">{feed.name}</span>
                        <button 
                          onClick={() => toggleFullScreen(feed.path)}
                          className="text-white bg-black/30 hover:bg-black/50 rounded-full p-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium ${
                      streamStatus[feed.path] === 'active' ? 'bg-green-500 text-white' :
                      streamStatus[feed.path] === 'error' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-gray-800'
                    }`}>
                      {streamStatus[feed.path] === 'active' ? 'LIVE' : 
                       streamStatus[feed.path] === 'error' ? 'OFFLINE' : 'CONNECTING'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="relative bg-black rounded-lg aspect-video mb-4">
                <iframe
                  title={selectedFeed.name}
                  src={getStreamUrl(selectedFeed.path)}
                  className="w-full h-full"
                  ref={el => videoRefs.current[selectedFeed.path] = el}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-white font-semibold">{selectedFeed.name}</h3>
                      <p className="text-gray-300 text-sm">
                        {streamStatus[selectedFeed.path] === 'active' ? 'Live stream' : 
                         streamStatus[selectedFeed.path] === 'error' ? 'Connection error' : 'Connecting...'}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => toggleFullScreen(selectedFeed.path)}
                        className="text-white bg-black/30 hover:bg-black/50 rounded-lg px-3 py-1 flex items-center text-sm"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                        Fullscreen
                      </button>
                      <button 
                        onClick={() => setViewMode('grid')}
                        className="text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-3 py-1 text-sm"
                      >
                        Back to Grid
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex overflow-x-auto pb-2 space-x-2">
                {rtspFeeds.map(feed => (
                  <button
                    key={feed.id}
                    onClick={() => setSelectedFeed(feed)}
                    className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm flex items-center space-x-2 ${
                      selectedFeed.id === feed.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${
                      streamStatus[feed.path] === 'active' ? 'bg-green-500' :
                      streamStatus[feed.path] === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}></span>
                    <span>{feed.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}