import { useState } from "react";
import { 
  Menu, X, Home, Users, Settings, MessageSquare, Bell, HelpCircle, LogOut 
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

export default function SidePanel() {
  const [isOpen, setIsOpen] = useState(true);
  const [activeItem, setActiveItem] = useState("Dashboard");

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const navItems = [
    { name: "Dashboard", icon: <Home size={18} />, path: "/dashboard" },
    { name: "Users", icon: <Users size={18} />, path: "/users" },
    { name: "Recordings", icon: <MessageSquare size={18} />, path: "/messages" },
    { name: "Settings", icon: <Settings size={18} />, path: "/settings" },
  ];

  return (
    <div className="flex h-screen">
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className={`fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-lg transition-all duration-300 hover:scale-105 md:hidden ${
          isOpen ? "left-64" : "left-4"
        }`}
      >
        {isOpen ? (
          <X size={20} className="text-gray-600 dark:text-gray-300" />
        ) : (
          <Menu size={20} className="text-gray-600 dark:text-gray-300" />
        )}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-r border-gray-200 dark:border-gray-700 p-6 shadow-lg transition-all duration-300 z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0 w-72 flex flex-col`}
      >
        {/* Logo/Branding */}
        <NavLink to="/" className="flex items-center space-x-3 mb-8">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">DS</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white tracking-tight">
            Dashboard Pro
          </h2>
        </NavLink>

        {/* Quick Actions */}
        <div className="space-y-3 mb-8">
          <NavLink 
            to="/users/new" 
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <span>+</span>
            <span>Add User</span>
          </NavLink>

          <NavLink 
            to="/stream" 
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <span>▶</span>
            <span>Live Stream</span>
          </NavLink>
        </div>

        {/* Navigation */}
        <nav className="flex-1">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  onClick={() => setActiveItem(item.name)}
                  className={({ isActive }) => 
                    `w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-medium shadow-inner"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`
                  }
                >
                  <span className={({ isActive }) => 
                    `${isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`
                  }>
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom Section */}
        <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
          <NavLink 
            to="/notifications" 
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
          >
            <Bell size={18} />
            <span>Notifications</span>
            <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">3</span>
          </NavLink>

          <NavLink 
            to="/support" 
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
          >
            <HelpCircle size={18} />
            <span>Help & Support</span>
          </NavLink>

          <NavLink 
            to="/logout" 
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </NavLink>

          {/* User Profile */}
          <NavLink 
            to="/profile" 
            className="flex items-center space-x-3 p-3 mt-4 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 overflow-hidden">
              <img 
                src="https://randomuser.me/api/portraits/women/44.jpg" 
                alt="User" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 dark:text-white truncate">Sarah Johnson</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Admin</p>
            </div>
          </NavLink>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}