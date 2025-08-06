import React from "react";
import { Plus, Video, Calendar, UserPlus, Settings, FileText, Bell, Shield, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink, useNavigate } from "react-router-dom";

export default function QuickActions() {
  const [hoveredIndex, setHoveredIndex] = React.useState(null);
  const navigate = useNavigate();

  // Using consistent indigo color scheme
  const actions = [
    {
      title: "Add New User",
      path: "/users",
      icon: <UserPlus size={22} />,
      color: "from-indigo-500 to-indigo-600",
      hoverColor: "from-indigo-600 to-indigo-700",
      description: "Create and manage user accounts",
      shortcut: "⌘ + U",
      key: "u",
    },
    {
      title: "Recordings",
      path: "/recordings",
      icon: <Video size={22} />,
      color: "from-indigo-500 to-blue-600",
      hoverColor: "from-indigo-600 to-blue-700",
      description: "Initiate new video recording session",
      shortcut: "⌘ + R",
      key: "r",
    },
    {
      title: "Schedules",
      path: "/scheduler",
      icon: <Calendar size={22} />,
      color: "from-indigo-500 to-violet-600",
      hoverColor: "from-indigo-600 to-violet-700",
      description: "Plan future detection",
      shortcut: "⌘ + E",
      key: "e",
    },
    {
      title: "View Alerts",
      path: "/notifications",
      icon: <Bell size={22} />,
      color: "from-indigo-500 to-purple-600",
      hoverColor: "from-indigo-600 to-purple-700",
      description: "Check security notifications",
      shortcut: "⌘ + A",
      key: "a",
    },
    {
      title: "System Settings",
      path: "/settings",
      icon: <Settings size={22} />,
      color: "from-indigo-500 to-slate-600",
      hoverColor: "from-indigo-600 to-slate-700",
      description: "Configure dashboard preferences",
      shortcut: "⌘ + ,",
      key: ",",
    },
    {
      title: "Live Stream",
      path: "/stream",
      icon: <Shield size={22} />,
      color: "from-indigo-500 to-indigo-700",
      hoverColor: "from-indigo-600 to-indigo-800",
      description: "Generate security audit",
      shortcut: "⌘ + S",
      key: "s",
    },
    {
      title: "Devices",
      path: "/devices",
      icon: <Zap size={22} />,
      color: "from-indigo-500 to-green-600",
      hoverColor: "from-indigo-600 to-green-700",
      description: "Manage connected devices",
      shortcut: "⌘ + D",
      key: "d",
    }
  ];

  React.useEffect(() => {
    const handleKeyDown = (event) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isMeta = isMac ? event.metaKey : event.ctrlKey;

      if (!isMeta) return;

      const matchedAction = actions.find(action => action.key === event.key.toLowerCase());
      if (matchedAction) {
        event.preventDefault();
        navigate(matchedAction.path);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <motion.div
      className="w-full mb-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {actions.map((action, index) => (
          <NavLink 
            to={action.path} 
            key={index}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <motion.div
              className={`relative h-full p-5 rounded-xl bg-gradient-to-br ${action.color} text-white shadow-lg overflow-hidden group hover:shadow-indigo-500/20 transition-all`}
              whileHover={{ 
                y: -5, 
                scale: 1.02,
              }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              {/* Subtle background pattern */}
              <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)]"></div>
              </div>
              
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Icon */}
              <motion.div
                className="p-3 bg-white/10 rounded-xl backdrop-blur-sm w-fit mb-4 border border-white/10"
                whileHover={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 0.5 }}
              >
                {action.icon}
              </motion.div>
              
              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-lg font-semibold mb-1">{action.title}</h3>
                <p className="text-sm text-indigo-100 mb-2">{action.description}</p>
                
                {/* Keyboard shortcut */}
                <AnimatePresence>
                  {hoveredIndex === index && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ duration: 0.2 }}
                      className="text-xs bg-white/20 px-2 py-1 rounded-md inline-block"
                    >
                      {action.shortcut}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Hover effect indicator */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-1 bg-white/30"
                initial={{ scaleX: 0, originX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3, type: "spring" }}
              />
              
              {/* Quick action badge */}
              <div className="absolute top-3 right-3">
                <motion.div
                  className="w-2 h-2 bg-white rounded-full"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 1.5,
                    ease: "easeInOut"
                  }}
                />
              </div>
            </motion.div>
          </NavLink>
        ))}
      </div>
    </motion.div>
  );
}