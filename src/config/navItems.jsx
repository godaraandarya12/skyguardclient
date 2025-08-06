import { Home, Users, MessageSquare, Settings } from "lucide-react";
import Dashboard from "../components/Dashboard";

export const navItems = [
  { name: "Dashboard", icon: <Dashboard />, path: "/dashboard" },
  { name: "Users", icon: <Users />, path: "/users" },
  { name: "Recordings", icon: <MessageSquare />, path: "/recordings" },
  { name: "Scheduler", icon: <Settings />, path: "/scheduler" },
];
