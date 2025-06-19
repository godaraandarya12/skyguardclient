import { useState } from "react";
import { Menu, X } from "lucide-react"; // Install lucide-react if not yet: npm i lucide-react

export default function SidePanel() {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute top-4 left-4 z-50 p-2 bg-white border border-gray-200 rounded-md shadow-md md:hidden"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 p-6 shadow-sm transition-transform duration-300 z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0 w-64 space-y-6`}
      >
        <h2 className="text-2xl font-semibold text-gray-800 mb-8 tracking-tight">
          Dashboard
        </h2>

        <button className="block w-full text-left px-4 py-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium transition duration-200 shadow-sm">
          Add User
        </button>

        <button className="block w-full text-left px-4 py-3 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition duration-200 shadow-sm">
          Live Stream
        </button>

        <button className="block w-full text-left px-4 py-3 rounded-md bg-gray-700 hover:bg-gray-800 text-white font-medium transition duration-200 shadow-sm">
          Activity
        </button>
      </div>
    </>
  );
}
