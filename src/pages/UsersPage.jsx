import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink, useLocation } from "react-router-dom";
import {
  FiHome, FiUsers, FiSettings, FiCalendar, FiVideo,
  FiBarChart2, FiAlertCircle, FiHardDrive, FiMenu, FiX,
  FiChevronRight, FiPlus, FiActivity, FiClock, FiCloud, FiPower
} from "react-icons/fi";
import { RiLiveLine } from "react-icons/ri";
import { BsFillLightningFill } from "react-icons/bs";
import UserProfileCard from "../components/SidePanel/UserProfileCard";

export default function Sidebar({ user, rememberMe = true }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [time, setTime] = useState(new Date());
  const [isHovering, setIsHovering] = useState(false);
  const location = useLocation();

  // Store user role in appropriate storage
  const storage = rememberMe ? localStorage : sessionStorage;
  useEffect(() => {
    if (user?.role) {
      storage.setItem('role', user.role);
    }
  }, [user, storage]);

  // Get user role from storage
  const userRole = storage.getItem('role') || 'user'; // Default to 'user' if no role

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleResize = useCallback(() => {
    setIsDesktop(window.innerWidth >= 768);
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  useEffect(() => {
    if (!isDesktop) setIsOpen(false);
  }, [location.pathname, isDesktop]);

  // Role-based navigation items
  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <FiHome size={18} />,
      pulse: true,
      roles: ['admin', 'user'] // Accessible to all roles
    },
    {
      name: "User Management",
      path: "/users",
      icon: <FiUsers size={18} />,
      submenu: [
        { name: "All Users", path: "/users/all", icon: <FiUsers size={14} />, roles: ['admin', 'manager'] },
        { name: "Add Users", path: "/users", icon: <FiSettings size={14} />, roles: ['admin'] },
      ],
      roles: ['admin']
    },
    {
      name: "Media Center",
      icon: <FiVideo size={18} />,
      submenu: [
        { name: "Recordings", path: "/recordings", icon: <FiVideo size={14} />, roles: ['admin', 'user'] },
        { name: "Live Streams", path: "/streams", icon: <RiLiveLine size={14} />, roles: ['admin', 'user'] },
      ],
      roles: ['admin', 'user', ]
    },
    {
      name: "Scheduler",
      path: "/scheduler",
      icon: <FiCalendar size={18} />,
      roles: ['admin']
    },
    {
      name: "Alerts",
      path: "/notifications",
      icon: <FiAlertCircle size={18} />,
      urgent: true,
      roles: ['admin', 'user']
    },
    {
      name: "Device Hub",
      path: "/devices",
      icon: <FiHardDrive size={18} />,
      status: "online",
      roles: ['admin']
    },
    {
      name: "System Settings",
      path: "/settings",
      icon: <FiSettings size={18} />,
      roles: ['admin','user']
    }
  ];

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item => item.roles.includes(userRole));

  const toggleSubmenu = (index) => {
    setActiveSubmenu(activeSubmenu === index ? null : index);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Mobile Top Bar */}
      {!isDesktop && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-800/50 shadow-lg"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center space-x-2">
            <motion.div
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <span className="text-white font-bold text-sm">SG</span>
            </motion.div>
            <motion.h2
              className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent"
              whileHover={{ scale: 1.02 }}
            >
              Sky Guard
            </motion.h2>
          </div>
          <motion.button
            onClick={() => setIsOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiMenu size={22} className="text-gray-700 dark:text-gray-200" />
          </motion.button>
        </motion.div>
      )}
      {/* Backdrop */}
      <AnimatePresence>
        {!isDesktop && isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -320 }}
        animate={{
          x: isDesktop || isOpen ? 0 : -320,
          boxShadow: isDesktop || isOpen ?
            "0 25px 50px -12px rgba(0, 0, 0, 0.25)" : "none"
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          boxShadow: { duration: 0.3 }
        }}
        className={`fixed top-0 left-0 h-screen w-80 z-50 flex flex-col
          bg-gradient-to-b from-white/95 via-white/90 to-white/85 dark:from-gray-900/95 dark:via-gray-900/90 dark:to-gray-900/85
          backdrop-blur-xl border-r border-white/40 dark:border-gray-800/40 shadow-2xl`}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Glow Effect */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          animate={{
            background: isHovering
              ? "radial-gradient(ellipse at left, rgba(99, 102, 241, 0.15) 0%, transparent 70%)"
              : "transparent"
          }}
          transition={{ duration: 0.3 }}
        />
        {/* Header */}
        <motion.div
          className="flex-none p-6 pb-4 flex items-center justify-between relative"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center space-x-3 z-10">
            <motion.div
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg relative overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-white font-bold z-10">SG</span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 opacity-0 hover:opacity-100 transition-opacity duration-300"
                animate={{ opacity: isHovering ? 0.3 : 0 }}
              />
            </motion.div>
            <motion.div
              className="flex flex-col"
              whileHover={{ scale: 1.02 }}
            >
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent">
                Sky Guard
              </h2>
              <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                <FiCloud size={12} />
                <span>v1.0.0</span>
                <span className="h-1 w-1 rounded-full bg-gray-400"></span>
                <span>PRO</span>
              </div>
            </motion.div>
          </div>
          {!isDesktop && (
            <motion.button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 z-10"
              whileHover={{ rotate: 90, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FiX size={20} className="text-gray-700 dark:text-gray-200" />
            </motion.button>
          )}
        </motion.div>
        {/* System Status Bar */}
        <motion.div
          className="mx-6 mb-4 px-4 py-2 rounded-lg bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm flex items-center justify-between text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center space-x-1.5">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-gray-700 dark:text-gray-300">System Active</span>
          </div>
        </motion.div>
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
          <ul className="space-y-1.5">
            {filteredNavItems.map((item, index) => (
              <li key={item.name}>
                {item.submenu ? (
                  <>
                    <motion.div
                      className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all relative group
                        ${activeSubmenu === index ?
                          'bg-blue-50/70 dark:bg-gray-800 text-blue-600 dark:text-blue-400' :
                          'text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50'}`}
                      onClick={() => toggleSubmenu(index)}
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="flex items-center">
                        <div className="relative">
                          <span className="mr-3 opacity-90 group-hover:opacity-100">{item.icon}</span>
                          {item.status && (
                            <span className={`absolute -top-1 -right-1 h-2 w-2 rounded-full border border-white dark:border-gray-900
                              ${item.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}
                            />
                          )}
                        </div>
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <div className="flex items-center">
                        {item.premium && (
                          <span className="mr-2 px-1.5 py-0.5 text-[10px] rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-amber-900 font-bold">
                            PRO
                          </span>
                        )}
                        <motion.div
                          animate={{ rotate: activeSubmenu === index ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <FiChevronRight size={16} className="opacity-70 group-hover:opacity-100" />
                        </motion.div>
                      </div>
                    </motion.div>
                    <AnimatePresence>
                      {activeSubmenu === index && (
                        <motion.ul
                          className="pl-4 mt-1 space-y-1 overflow-hidden"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {item.submenu
                            .filter(subItem => subItem.roles.includes(userRole))
                            .map((subItem) => (
                              <motion.li
                                key={subItem.name}
                                whileHover={{ x: 5 }}
                              >
                                <NavLink
                                  to={subItem.path}
                                  className={({ isActive }) =>
                                    `flex items-center px-4 py-2.5 rounded-lg text-sm transition-all ${
                                      isActive
                                        ? "bg-blue-100/60 dark:bg-gray-800 text-blue-600 dark:text-blue-400 font-medium"
                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100/30 dark:hover:bg-gray-800/30"
                                    }`
                                  }
                                >
                                  <span className="mr-2 opacity-80">{subItem.icon}</span>
                                  {subItem.name}
                                </NavLink>
                              </motion.li>
                            ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-4 py-3 rounded-xl transition-all relative overflow-hidden group
                        ${isActive
                          ? "bg-blue-50/70 dark:bg-gray-800 text-blue-600 dark:text-blue-400 font-medium"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"}`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center">
                          <div className="relative">
                            <span className="mr-3 opacity-90 group-hover:opacity-100">{item.icon}</span>
                            {item.pulse && (
                              <motion.span
                                className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500 border border-white dark:border-gray-900"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                              />
                            )}
                          </div>
                          <span className="font-medium">{item.name}</span>
                          {item.new && (
                            <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-gradient-to-r from-blue-400 to-blue-600 text-white font-bold">
                              New
                            </span>
                          )}
                          {item.highlight && (
                            <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold flex items-center">
                              <BsFillLightningFill size={10} className="mr-1" />
                              Featured
                            </span>
                          )}
                        </div>
                        <div className="flex items-center">
                          {item.notification && (
                            <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                              item.urgent
                                ? 'bg-red-500 text-white animate-pulse'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                            }`}>
                              {item.notification}
                            </span>
                          )}
                        </div>
                        {isActive && (
                          <motion.div
                            className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r"
                            layoutId="activeIndicator"
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        )}
                      </>
                    )}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </nav>
        {/* Footer */}
        <div className="flex-none px-6 pt-4 pb-6 border-t border-gray-200/40 dark:border-gray-800/40 mt-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <UserProfileCard />
          </motion.div>
          <motion.div
            className="mt-4 pt-4 border-t border-gray-200/30 dark:border-gray-800/30 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <span>© 2025 Sky Guard</span>
            <button className="flex items-center hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
              <FiPower size={14} className="mr-1" />
              <span>Logout</span>
            </button>
          </motion.div>
        </div>
      </motion.aside>
    </>
  );
}