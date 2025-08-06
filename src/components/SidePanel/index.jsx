import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

export default function SidePanel() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isSidebarVisible, setIsSidebarVisible] = useState(window.innerWidth >= 768);

  // Handle resize behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsSidebarVisible(!mobile); // Auto-hide on mobile, show on larger
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarVisible((prev) => !prev);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Toggle Button for Mobile */}
      {isMobile && (
        <motion.button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-3 bg-white dark:bg-gray-800 rounded-full shadow-2xl transition-all duration-300 hover:shadow-lg md:hidden"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {isSidebarVisible ? (
            <X className="text-gray-600 dark:text-gray-300" />
          ) : (
            <Menu className="text-gray-600 dark:text-gray-300" />
          )}
        </motion.button>
      )}

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarVisible && (
          <motion.div
            initial={{ x: isMobile ? -250 : 0 }}
            animate={{ x: 0 }}
            exit={{ x: -250 }}
            transition={{ duration: 0.25 }}
            className={`z-40 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-md md:relative h-full fixed md:static`}
          >
            <Sidebar />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 overflow-auto transition-all duration-300">
        <div className="min-h-screen px-4 py-6 md:px-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
