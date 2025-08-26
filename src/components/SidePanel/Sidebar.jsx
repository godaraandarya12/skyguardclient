import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink, useLocation } from "react-router-dom";
import {
  FiHome, FiUsers, FiSettings, FiCalendar, FiVideo,
  FiAlertCircle, FiHardDrive, FiMenu, FiX,
  FiChevronRight, FiCloud, FiPower
} from "react-icons/fi";
import { RiLiveLine } from "react-icons/ri";
import UserProfileCard from "./UserProfileCard";
import Logo from '../../assets/logo.png'; // Adjust the path as necessary

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [isHovering, setIsHovering] = useState(false);
  const location = useLocation();

      
      
  // In a real app, get this from authentication/authorization logic
  const userRole = localStorage.getItem('role')||sessionStorage.getItem('role');

  // Handle screen resizing for responsive sidebar
  const handleResize = useCallback(() => {
    setIsDesktop(window.innerWidth >= 768);
  }, []);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  // Close sidebar on route change for mobile
  useEffect(() => {
    if (!isDesktop) setIsOpen(false);
  }, [location.pathname, isDesktop]);

  // Full navigation list
  const allNavItems = [
    { name: "Dashboard", path: "/dashboard", icon: <FiHome size={18} />, pulse: true },
    {
      name: "User Management",
      path: "/users",
      icon: <FiUsers size={18} />,
      roles: ["Admin"], // only visible for these roles
      submenu: [
        { name: "All Users", path: "/users/all", icon: <FiUsers size={14} /> },
        { name: "Add Users", path: "/users", icon: <FiSettings size={14} /> }
      ]
    },
    {
      name: "Media Center",
      icon: <FiVideo size={18} />,
      submenu: [
        { name: "Recordings", path: "/recordings", icon: <FiVideo size={14} /> },
        { name: "Live Streams", path: "/stream", icon: <RiLiveLine size={14} /> }
      ]
    },
    { name: "Scheduler", path: "/scheduler", icon: <FiCalendar size={18} /> },
    { name: "Alerts", path: "/notifications", icon: <FiAlertCircle size={18} />, urgent: true },
    {
      name: "Device Hub",
      path: "/devices",
      icon: <FiHardDrive size={18} />,
      status: "online",
      roles: ["Admin"] // only visible for these roles
    },
    { name: "System Settings", path: "/settings", icon: <FiSettings size={18} /> }
  ];

  // Filter by role
  const navItems = allNavItems.filter(item => {
    return !item.roles || item.roles.includes(userRole);
  });

  const toggleSubmenu = (index) => {
    setActiveSubmenu(activeSubmenu === index ? null : index);
  };

  return (
    <>
      {/* Mobile Header */}
      {!isDesktop && (
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-transparent transparent:bg-transparent-900  border-gray-200  ">
          <div className="flex items-center space-x-2">
            
          </div>
          <button
            aria-label="Open Sidebar"
            onClick={() => setIsOpen(true)}
            className="p-2 rounded-lg hover:bg-white-100 dark:hover:bg-gray-800"
          >
            <FiMenu size={22} />
          </button>
        </header>
      )}

      {/* Backdrop for Mobile */}
      <AnimatePresence>
        {!isDesktop && isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        role="navigation"
        aria-label="Main Sidebar"
        initial={{ x: -320 }}
        animate={{ x: isDesktop || isOpen ? 0 : -320 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 h-screen w-80 z-50 flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-2xl"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Logo & Close */}
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-3">
 <div className="w-20 h-20 bg-gradient-to-br rounded-2xl flex items-center justify-center shadow-xl animate-bounce-slow">
          <img 
            src={Logo} 
            alt="Logo" 
            className="h-full w-full"
          />
        </div>            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent">CIVIEASE</h2>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <FiCloud size={12} className="mr-1" /> v1.0.0 <span className="mx-1">•</span> PRO
              </div>
            </div>
          </div>
          {!isDesktop && (
            <button
              aria-label="Close Sidebar"
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg hover:bg-white-100 white:hover:bg-white-800"
            >
            
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-2">
          <ul className="space-y-1.5">
            {navItems.map((item, index) => (
              <li key={item.name}>
                {item.submenu ? (
                  <>
                    <button
                      aria-expanded={activeSubmenu === index}
                      onClick={() => toggleSubmenu(index)}
                      className={`flex items-center justify-between w-full px-4 py-3 rounded-xl ${activeSubmenu === index ? "bg-blue-50 dark:bg-gray-800 text-blue-600 dark:text-blue-400" : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"}`}
                    >
                      <span className="flex items-center">{item.icon}<span className="ml-3">{item.name}</span></span>
                      <motion.div animate={{ rotate: activeSubmenu === index ? 90 : 0 }}>
                        <FiChevronRight size={16} />
                      </motion.div>
                    </button>
                    <AnimatePresence>
                      {activeSubmenu === index && (
                        <motion.ul
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="pl-8 mt-1 space-y-1"
                        >
                          {item.submenu.map((sub) => (
                            <li key={sub.name}>
                              <NavLink
                                to={sub.path}
                                className={({ isActive }) =>
                                  `flex items-center px-4 py-2.5 rounded-lg text-sm ${isActive ? "bg-blue-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400" : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"}`
                                }
                              >
                                {sub.icon}<span className="ml-2">{sub.name}</span>
                              </NavLink>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-3 rounded-xl ${isActive ? "bg-blue-50 dark:bg-gray-800 text-blue-600 dark:text-blue-400" : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"}`
                    }
                  >
                    {item.icon}<span className="ml-3">{item.name}</span>
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
          <UserProfileCard />
          <div className="mt-4 flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>© 2025 CIVIEASE</span>
           
          </div>
        </div>
      </motion.aside>
    </>
  );
}
