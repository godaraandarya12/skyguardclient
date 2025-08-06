import React, { useState, useEffect } from 'react';
import { 
  FiClock, FiCalendar, FiSave, 
  FiToggleLeft, FiToggleRight, FiMenu
} from 'react-icons/fi';

const WeeklyTimerControl = () => {
  // Initial state for each day's timer settings
  const initialDayState = {
    enabled: false,
    startTime: '08:00',
    stopTime: '17:00'
  };

  // State for all days
  const [days, setDays] = useState({
    monday: { ...initialDayState },
    tuesday: { ...initialDayState },
    wednesday: { ...initialDayState },
    thursday: { ...initialDayState },
    friday: { ...initialDayState },
    saturday: { ...initialDayState },
    sunday: { ...initialDayState }
  });

  // State for UI
  const [apiResponse, setApiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('schedule');
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [showPanel, setShowPanel] = useState(true);
  const [saveCooldown, setSaveCooldown] = useState(false);
  const [showRestartButton, setShowRestartButton] = useState(false);

  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Fetch schedule from API
  useEffect(() => {
    const fetchSchedule = async () => {
      const deviceId = 'device123';
      try {
        const response = await fetch(`http://localhost:3000/api/schedules?device_id=${deviceId}`);
        const data = await response.json();
        if (Array.isArray(data)) {
          const loadedDays = {};
          data.forEach(({ day, enabled, start_time, stop_time }) => {
            const normalizedDay = day.toLowerCase();
            loadedDays[normalizedDay] = {
              enabled,
              startTime: start_time.slice(0, 5),
              stopTime: stop_time.slice(0, 5)
            };
          });
          setDays(prev => ({ ...prev, ...loadedDays }));
          setApiResponse({ text: 'Schedule loaded.', type: 'success' });
        } else {
          setApiResponse({ text: 'Failed to load schedule.', type: 'error' });
        }
      } catch (error) {
        setApiResponse({ text: `Error fetching schedule: ${error.message}`, type: 'error' });
      }
    };
    fetchSchedule();
  }, []);

  // Auto-hide panel on mobile
  useEffect(() => {
    if (isMobile) setShowPanel(false);
    else setShowPanel(true);
  }, [isMobile]);

  // Handle changes for each day's settings
  const handleDayChange = (day, field, value) => {
    setDays(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: field === 'enabled' ? value : value
      }
    }));
  };

  // Enable/disable all days
  const toggleAllDays = (enable) => {
    const updatedDays = {};
    Object.keys(days).forEach(day => {
      updatedDays[day] = { ...days[day], enabled: enable };
    });
    setDays(updatedDays);
  };

  // Set same time for all days
  const setAllTimes = (startTime, stopTime) => {
    const updatedDays = {};
    Object.keys(days).forEach(day => {
      updatedDays[day] = { 
        ...days[day], 
        startTime, 
        stopTime 
      };
    });
    setDays(updatedDays);
  };

  // Send schedule to API
  const sendSchedule = async () => {
    if (saveCooldown) return;
    setIsLoading(true);
    setApiResponse('');
    setSaveCooldown(true);
    const deviceId = 'device123';
    const schedules = Object.entries(days).map(([day, config]) => ({
      day: day.charAt(0).toUpperCase() + day.slice(1),
      enabled: config.enabled,
      start_time: `${config.startTime}:00`,
      stop_time: `${config.stopTime}:00`
    }));

    try {
      const response = await fetch('http://localhost:3000/api/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ device_id: deviceId, schedules })
      });
      const data = await response.json();
      setApiResponse({ text: data.message || 'Schedule saved successfully!', type: 'success' });
      alert('Schedule saved successfully! Please restart the device to apply the new schedule.');
      setShowRestartButton(true);
      setTimeout(() => setSaveCooldown(false), 5000); // 5-second cooldown
    } catch (error) {
      setApiResponse({ text: `Error: ${error.message}`, type: 'error' });
      setSaveCooldown(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Send restart command to device
  const sendRestartCommand = async () => {
    setIsLoading(true);
    setApiResponse('');
    try {
      const response = await fetch('http://your-raspberry-pi-ip:port/api/restart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setApiResponse({ text: data.message || 'Restart command sent successfully!', type: 'success' });
      setShowRestartButton(false); // Hide button after restart
    } catch (error) {
      setApiResponse({ text: `Error: ${error.message}`, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // Render panel content
  const renderPanelContent = () => (
    <>
      <div className="panel-header">
        <FiCalendar size={24} />
        <h3>Quick Actions</h3>
        {(isMobile || isTablet) && (
          <button 
            className="close-panel"
            onClick={() => setShowPanel(false)}
          >
            &times;
          </button>
        )}
      </div>
      
      <div className="panel-section">
        <h4>Enable/Disable</h4>
        <button 
          className="panel-button success"
          onClick={() => toggleAllDays(true)}
        >
          <FiToggleRight /> Enable All
        </button>
        <button 
          className="panel-button danger"
          onClick={() => toggleAllDays(false)}
        >
          <FiToggleLeft /> Disable All
        </button>
      </div>
      
      <div className="panel-section">
        <h4>Set Times</h4>
        <div className="time-input-group">
          <label>Start Time</label>
          <input 
            type="time" 
            id="bulkStartTime"
            defaultValue="08:00"
          />
        </div>
        <div className="time-input-group">
          <label>Stop Time</label>
          <input 
            type="time" 
            id="bulkStopTime"
            defaultValue="17:00"
          />
        </div>
        <button 
          className="panel-button primary"
          onClick={() => {
            const startTime = document.getElementById('bulkStartTime').value;
            const stopTime = document.getElementById('bulkStopTime').value;
            setAllTimes(startTime, stopTime);
          }}
        >
          <FiClock /> Apply to All
        </button>
      </div>
      
      <div className="panel-section">
        <h4>System</h4>
        <button 
          className="panel-button primary"
          onClick={sendSchedule}
          disabled={isLoading || saveCooldown}
        >
          <FiSave /> {isLoading ? 'Sending...' : saveCooldown ? 'Please Wait...' : 'Save Schedule'}
        </button>
        {showRestartButton && (
          <button 
            className="panel-button warning"
            onClick={sendRestartCommand}
            disabled={isLoading}
          >
            <FiClock /> Restart Device
          </button>
        )}
      </div>
    </>
  );

  return (
    <div className="app-container">
      {isMobile && (
        <>
          <button 
            className="mobile-menu-button"
            onClick={() => setShowPanel(true)}
          >
            <FiMenu /> Menu
          </button>
          {showPanel && (
            <div className="mobile-panel">
              {renderPanelContent()}
            </div>
          )}
        </>
      )}
      
      {!isMobile && (
        <div className={`side-panel ${isTablet ? 'right-panel' : ''} ${showPanel ? 'visible' : ''}`}>
          {renderPanelContent()}
        </div>
      )}

      <div className="main-content">
        <div className="header">
          <h1><FiClock /> Weekly Scheduler</h1>
          <p>After Scheduling do not forget to save your changes!</p>
        </div>
        
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedule')}
          >
            Schedule
          </button>
        </div>
        
        {activeTab === 'schedule' && (
          <div className="days-grid">
            {Object.entries(days).map(([dayName, daySettings]) => (
              <div 
                key={dayName} 
                className={`day-card ${daySettings.enabled ? 'active' : 'inactive'}`}
                onClick={(e) => {
                  if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON') {
                    handleDayChange(dayName, 'enabled', !daySettings.enabled);
                  }
                }}
              >
                <div className="day-header">
                  <h3>{dayName.charAt(0).toUpperCase() + dayName.slice(1)}</h3>
                  <div className="toggle-buttons">
                    <button
                      className={`toggle-button ${daySettings.enabled ? 'active' : ''}`}
                      onClick={() => handleDayChange(dayName, 'enabled', true)}
                    >
                      On
                    </button>
                    <button
                      className={`toggle-button ${!daySettings.enabled ? 'active' : ''}`}
                      onClick={() => handleDayChange(dayName, 'enabled', false)}
                    >
                      Off
                    </button>
                  </div>
                </div>
                
                <div className="time-controls">
                  <div className="time-input">
                    <label>
                      <span>Start</span>
                      <input
                        type="time"
                        value={daySettings.startTime}
                        onChange={(e) => handleDayChange(dayName, 'startTime', e.target.value)}
                        disabled={!daySettings.enabled}
                      />
                    </label>
                  </div>
                  
                  <div className="time-input">
                    <label>
                      <span>Stop</span>
                      <input
                        type="time"
                        value={daySettings.stopTime}
                        onChange={(e) => handleDayChange(dayName, 'stopTime', e.target.value)}
                        disabled={!daySettings.enabled}
                      />
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {apiResponse && (
          <div className={`api-response ${apiResponse.type}`}>
            <p>{apiResponse.text}</p>
            <button onClick={() => setApiResponse('')}>&times;</button>
          </div>
        )}
      </div>
      
      <style jsx>{`
        :root {
          --primary: #3b82f6;
          --success: #10b981;
          --danger: #ef4444;
          --warning: #f59e0b;
          --text: #1f2937;
          --text-light: #6b7280;
          --bg: #f9fafb;
          --card-bg: #ffffff;
          --border: #d1d5db;
          --shadow: rgba(0, 0, 0, 0.1);
        }
        
        * {
          box-sizing: border-box;
          transition: all 0.3s ease;
        }
        
        body {
          margin: 0;
          background: var(--bg);
          color: var(--text);
          font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .app-container {
          display: flex;
          min-height: 100vh;
          background: var(--bg);
          color: var(--text);
        }
        
        .side-panel {
          width: 300px;
          background: var(--card-bg);
          padding: 24px;
          box-shadow: 2px 0 12px var(--shadow);
          display: flex;
          flex-direction: column;
          z-index: 10;
        }
        
        .right-panel {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          transform: translateX(100%);
          transition: transform 0.3s ease;
        }
        
        .right-panel.visible {
          transform: translateX(0);
        }
        
        .mobile-panel {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: var(--card-bg);
          padding: 24px;
          box-shadow: 0 2px 12px var(--shadow);
          z-index: 20;
          max-height: 100vh;
          overflow-y: auto;
        }
        
        @media (min-width: 768px) and (max-width: 1023px) {
          .side-panel {
            width: 260px;
          }
        }
        
        @media (min-width: 1024px) {
          .side-panel {
            position: static;
            transform: none;
          }
        }
        
        .panel-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 32px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border);
          position: relative;
        }
        
        .panel-header h3 {
          font-size: 20px;
          font-weight: 600;
        }
        
        .close-panel {
          position: absolute;
          right: 0;
          top: 0;
          background: none;
          border: none;
          font-size: 28px;
          cursor: pointer;
          color: var(--text);
        }
        
        .panel-section {
          margin-bottom: 32px;
        }
        
        .panel-section h4 {
          margin-bottom: 16px;
          color: var(--text);
          font-weight: 600;
          font-size: 16px;
        }
        
        .panel-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 14px 16px;
          margin-bottom: 12px;
          border: none;
          border-radius: 10px;
          background: var(--border);
          color: var(--text);
          cursor: pointer;
          font-size: 15px;
          font-weight: 500;
        }
        
        .panel-button:hover {
          transform: scale(1.02);
          box-shadow: 0 4px 12px var(--shadow);
        }
        
        .panel-button.primary {
          background: var(--primary);
          color: white;
        }
        
        .panel-button.success {
          background: var(--success);
          color: white;
        }
        
        .panel-button.danger {
          background: var(--danger);
          color: white;
        }
        
        .panel-button.warning {
          background: var(--warning);
          color: white;
        }
        
        .time-input-group {
          margin-bottom: 12px;
        }
        
        .time-input-group label {
          display: block;
          margin-bottom: 6px;
          font-size: 14px;
          color: var(--text-light);
        }
        
        .time-input-group input {
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--bg);
          color: var(--text);
          font-size: 15px;
        }
        
        .main-content {
          flex: 1;
          padding: 40px;
          max-width: 100%;
          overflow-x: hidden;
        }
        
        @media (max-width: 767px) {
          .main-content {
            padding: 24px;
            margin-top: 80px;
          }
        }
        
        @media (min-width: 768px) and (max-width: 1023px) {
          .main-content {
            padding: 24px;
          }
        }
        
        .header {
          margin-bottom: 40px;
        }
        
        .header h1 {
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--text);
          margin: 0;
          font-size: 32px;
          font-weight: 700;
        }
        
        .header p {
          color: var(--text-light);
          margin: 8px 0 0;
          font-size: 16px;
        }
        
        .tabs {
          display: flex;
          border-bottom: 1px solid var(--border);
          margin-bottom: 32px;
        }
        
        .tab {
          padding: 14px 24px;
          background: none;
          border: none;
          border-bottom: 3px solid transparent;
          cursor: pointer;
          font-weight: 600;
          font-size: 16px;
          color: var(--text-light);
        }
        
        .tab.active {
          color: var(--primary);
          border-bottom-color: var(--primary);
        }
        
        .days-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 24px;
        }
        
        @media (max-width: 600px) {
          .days-grid {
            grid-template-columns: 1fr;
          }
        }
        
        .day-card {
          background: var(--card-bg);
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 6px 12px var(--shadow);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .day-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 16px var(--shadow);
        }
        
        .day-card.active {
          border-left: 5px solid var(--success);
        }
        
        .day-card.active .day-header h3 {
          color: var(--success);
        }
        
        .day-card.inactive {
          border-left: 5px solid var(--danger);
        }
        
        .day-card.inactive .day-header h3 {
          color: var(--danger);
        }
        
        .day-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .day-header h3 {
          margin: 0;
          color: var(--text);
          font-size: 20px;
          font-weight: 600;
        }
        
        .toggle-buttons {
          display: flex;
          gap: 8px;
        }
        
        .toggle-button {
          padding: 8px 16px;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--bg);
          color: var(--text);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .toggle-button.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }
        
        .toggle-button:hover {
          transform: scale(1.05);
        }
        
        .time-controls {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2px;
        }
        
        .time-input {
          display: flex;
          flex-direction: column;
        }
        
        .time-input label {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 14px;
          color: var(--text-light);
        }
        
        .time-input input {
          padding: 10px;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 15px;
          background: var(--bg);
          color: var(--text);
        }
        
        .time-input input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .api-response {
          position: fixed;
          bottom: 24px;
          right: 24px;
          padding: 16px 24px;
          border-radius: 10px;
          font-size: 15px;
          max-width: 320px;
          box-shadow: 0 6px 12px var(--shadow);
          display: flex;
          justify-content: space-between;
          align-items: center;
          animation: slideIn 0.3s ease;
          z-index: 100;
        }
        
        @keyframes slideIn {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .api-response.success {
          background: var(--success);
          color: white;
        }
        
        .api-response.error {
          background: var(--danger);
          color: white;
        }
        
        .api-response button {
          background: none;
          border: none;
          color: white;
          font-size: 20px;
          cursor: pointer;
          margin-left: 12px;
        }
        
        .mobile-menu-button {
          position: fixed;
          top: 12px;
          left: 12px;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 10px;
          padding: 10px 18px;
          display: flex;
          align-items: center;
          gap: 8px;
          z-index: 30;
          box-shadow: 0 3px 12px var(--shadow);
        }
        
        .mobile-menu-button:hover {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
};

export default WeeklyTimerControl;  