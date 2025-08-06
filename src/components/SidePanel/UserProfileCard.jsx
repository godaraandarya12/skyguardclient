import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { NavLink } from "react-router-dom";
import Notiflix from "notiflix";

export default function UserProfileCard() {
  const [user, setUser] = useState({
    name: "Commander",
    email: "",
    role: "User",
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser =
          JSON.parse(localStorage.getItem("nzUser")) ||
          JSON.parse(sessionStorage.getItem("nzUser"));

        if (storedUser) {
          setUser({
            name: storedUser.name || "Commander",
            email: storedUser.email || "classified@domain.com",
            role: storedUser.role || "User",
          });
        }
      } catch (err) {
        console.error("🛑 Error fetching user data:", err);
        Notiflix.Notify.failure("Unable to retrieve user details.");
      }
    };

    loadUser();
  }, []);

  const handleLogout = () => {
    Notiflix.Confirm.show(
      "🚪 Leaving So Soon?",
      "Are you sure you want to exit your command center?",
      "Yes, Logout",
      "Stay Logged In",
      () => {
        localStorage.clear();
        sessionStorage.clear();
        Notiflix.Notify.success("🔐 You’ve been securely logged out.");
        setTimeout(() => {
          window.location.href = "/";
        }, 800);
      },
      () => {
        Notiflix.Notify.info("🚀 Continuing mission.");
      },
      {
        titleColor: "#6D28D9",
        okButtonBackground: "#7C3AED",
        cancelButtonBackground: "#1E40AF",
        borderRadius: "12px",
        cssAnimationStyle: "zoom",
        background: "#0F172A",
        titleFontSize: "20px",
        messageFontSize: "16px",
        buttonsFontSize: "14px",
        width: "400px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        zindex: 9999,
        backOverlayColor: "rgba(15,23,42,0.8)",
        svgSize: "80px",
        titleFontStyle: "italic",
        messageMaxLength: 200,
      }
    );
  };

  return (
    <div className="space-y-4">
      {/* Logout Button */}
      <motion.button
        onClick={handleLogout}
        whileHover={{ scale: 1.03, x: 6 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="w-full flex items-center justify-between px-5 py-3 rounded-xl bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800 hover:from-gray-200 dark:hover:from-gray-600 shadow-sm hover:shadow-md transition-all duration-300 group"
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-100/80 dark:bg-red-900/30 rounded-lg">
            <LogOut className="text-red-500 dark:text-red-400" />
          </div>
          <span className="text-gray-700 dark:text-gray-300 font-medium group-hover:underline">
            Logout
          </span>
        </div>
        <div className="text-xs px-2 py-1 bg-red-500/10 text-red-500 dark:text-red-400 rounded-full">
          Esc
        </div>
      </motion.button>

      {/* User Profile Card */}
      <NavLink
        to="/profile"
        className="flex items-center space-x-3 p-3 rounded-xl bg-white/50 dark:bg-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-700/80 shadow-sm hover:shadow-md transition-all duration-300 group"
      >
        <motion.div
          whileHover={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 0.6 }}
          className="relative w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 overflow-hidden shadow-md ring-2 ring-offset-2 ring-white dark:ring-offset-gray-900"
        >
          <img
            src="https://randomuser.me/api/portraits/women/44.jpg"
            alt={user.name}
            className="w-full h-full object-cover"
          />
          <div
            className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"
            title="Online"
          />
        </motion.div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 dark:text-white truncate group-hover:underline">
            {user.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {user.role}
          </p>
        </div>

        <motion.div
          className="w-2 h-2 bg-green-400 rounded-full shadow-sm"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
      </NavLink>
    </div>
  );
}
