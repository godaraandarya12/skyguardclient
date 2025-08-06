import React, { useState } from "react";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { 
  FiHome, 
  FiUsers, 
  FiSettings, 
  FiCalendar,
  FiVideo,
  FiFileText,
  FiBarChart2,
  FiAlertCircle,
  FiHardDrive,
  FiShield
} from "react-icons/fi";
import WeatherWidget from "./WeatherWidget";
import UserProfileCard from "./UserProfileCard";

export default function Sidebar() {
  const [activeItem, setActiveItem] = useState("Dashboard");

  const navItems = [
    { name: "Dashboard", path: "/", icon: <FiHome size={18} /> },
    { name: "Users", path: "/users", icon: <FiUsers size={18} /> },
    { name: "Recordings", path: "/recordings", icon: <FiVideo size={18} /> },
    { name: "Scheduler", path: "/scheduler", icon: <FiCalendar size={18} /> },
   { name: "Streaming", path: "/stream", icon: <FiBarChart2 size={18} /> },

    { name: "Alerts", path: "/notifications", icon: <FiAlertCircle size={18} /> },
    // { name: "Storage", path: "/storage", icon: <FiHardDrive size={18} /> },
    // { name: "Security", path: "/security", icon: <FiShield size={18} /> },
    // { name: "Documents", path: "/documents", icon: <FiFileText size={18} /> },
     { name: "Settings", path: "/settings", icon: <FiSettings size={18} /> },
     { name: "Devices", path: "/devices", icon: <FiHardDrive size={18} /> }
  ];

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      exit={{ x: -300 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-0 left-0 h-full w-80 z-40 md:relative md:translate-x-0 flex flex-col"
    >
      {/* Background Layer */}
      <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-r border-white/20 dark:border-gray-700/30" />

      {/* Content Layer */}
      <div className="relative z-10 h-full flex flex-col p-6">

        {/* Logo / Brand */}
        <motion.div
          className="flex items-center space-x-3 mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <motion.div whileHover={{ rotate: 15 }}>
              <span className="text-white font-bold">SG</span>
            </motion.div>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent">
            Sky Guard
          </h2>
        </motion.div>

        

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => 
                    `flex items-center px-4 py-3 rounded-xl transition-all ${isActive 
                      ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-medium' 
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`
                  }
                  onClick={() => setActiveItem(item.name)}
                >
                  <span className="mr-3 opacity-80">{item.icon}</span>
                  <span>{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer Widgets */}
        <div className="mt-auto pt-6 border-t border-gray-200/50 dark:border-gray-700/30 space-y-4">
          <WeatherWidget />
          <UserProfileCard />
        </div>
      </div>
    </motion.div>
  );
}