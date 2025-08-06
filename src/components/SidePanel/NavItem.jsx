import React from "react";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";

export default function NavItem({ item, activeItem, setActiveItem, index }) {
  return (
    <motion.li
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 + index * 0.1 }}
    >
      <NavLink
        to={item.path}
        onClick={() => setActiveItem(item.name)}
        className={({ isActive }) =>
          `block rounded-2xl overflow-hidden shadow-sm transition-all duration-300 group ${
            isActive
              ? "bg-gradient-to-tr from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-md ring-2 ring-blue-400/20"
              : "bg-white/50 dark:bg-gray-800/50 hover:shadow-md hover:ring-1 hover:ring-blue-400/10"
          }`
        }
      >
        {({ isActive }) => (
          <div className="flex items-center px-5 py-4 space-x-4">
            <div
              className={`p-2 rounded-xl transition-colors ${
                isActive
                  ? "bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow"
                  : "bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-100 dark:group-hover:bg-gray-600 text-gray-600 dark:text-gray-300"
              }`}
            >
              {item.icon}
            </div>

            <div className="flex flex-col">
              <span
                className={`font-medium text-sm ${
                  isActive ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {item.name}
              </span>
              {isActive && (
                <motion.div
                  className="mt-1 h-1 w-6 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
                  layoutId="activeIndicator"
                />
              )}
            </div>
          </div>
        )}
      </NavLink>
    </motion.li>
  );
}
