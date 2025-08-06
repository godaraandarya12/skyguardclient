import React, { useState } from 'react';
import { FiX, FiVideo, FiRefreshCw, FiImage, FiSun, FiVolume2 } from 'react-icons/fi';

const SettingsPanel = ({
  streamQuality,
  setStreamQuality,
  volume,
  setVolume,
  brightness,
  setBrightness,
  onClose,
}) => {
  const [autoReconnect, setAutoReconnect] = useState(true);
  const [screenshotQuality, setScreenshotQuality] = useState(0.8);

  const qualityOptions = [
    { value: 'auto', label: 'Auto' },
    { value: '0', label: 'Low (480p)' },
    { value: '1', label: 'Medium (720p)' },
    { value: '2', label: 'High (1080p)' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FiX /> Stream Settings
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700 transition">
            <FiX />
          </button>
        </div>

        {/* Stream Quality */}
        <div className="mb-4">
          <label className="flex items-center gap-2 mb-2">
            <FiVideo /> Stream Quality
          </label>
          <select
            value={streamQuality}
            onChange={(e) => setStreamQuality(e.target.value)}
            className="w-full p-2 bg-gray-700 rounded-lg text-white"
          >
            {qualityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Auto Reconnect */}
        <div className="mb-4">
          <label className="flex items-center gap-2">
            <FiRefreshCw /> Auto Reconnect
            <input
              type="checkbox"
              checked={autoReconnect}
              onChange={() => setAutoReconnect(!autoReconnect)}
              className="ml-auto"
            />
          </label>
        </div>

        {/* Volume Control */}
        <div className="mb-4">
          <label className="flex items-center gap-2 mb-2">
            <FiVolume2 /> Volume
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(parseInt(e.target.value))}
            className="w-full"
          />
          <span>{volume}%</span>
        </div>

        {/* Brightness Control */}
        <div className="mb-4">
          <label className="flex items-center gap-2 mb-2">
            <FiSun /> Brightness
          </label>
          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.1"
            value={brightness}
            onChange={(e) => setBrightness(parseFloat(e.target.value))}
            className="w-full"
          />
          <span>{(brightness * 100).toFixed(0)}%</span>
        </div>

        {/* Screenshot Quality */}
        <div className="mb-4">
          <label className="flex items-center gap-2 mb-2">
            <FiImage /> Screenshot Quality
          </label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={screenshotQuality}
            onChange={(e) => setScreenshotQuality(parseFloat(e.target.value))}
            className="w-full"
          />
          <span>{(screenshotQuality * 100).toFixed(0)}%</span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition"
        >
          Save & Close
        </button>
      </div>
    </div>
  );
};

export default SettingsPanel;