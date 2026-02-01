import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigationStore } from "../store/useNavigationStore";
import {
  LogOut,
  MessagesSquare,
  Settings,
  User,
  Home,
  BriefcaseBusiness,
} from "lucide-react";

// Define the tabs with labels and their corresponding icons
const navigationTabs = [
  { id: "jobs", label: "Job Posts", icon: Home },
  { id: "chats", label: "Messages", icon: MessagesSquare },
  { id: "profile", label: "Profile", icon: User },
];

const Navbar = () => {
  const { authUser, logout } = useAuthStore();
  // Get active tab state and setter from the navigation store
  const { activeTab, setActiveTab } = useNavigationStore();

  return (
    <header className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 backdrop-blur-lg bg-base-100/80">
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          {/* 1. Left Section: Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 hover:opacity-80 transition-all"
            onClick={() => setActiveTab("jobs")}
          >
            <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <BriefcaseBusiness className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-lg font-bold">HireHub</h1>
          </Link>

          {/* 2. Center Section: Navigation Tabs (CONDITIONAL RENDERING) */}
          {authUser && ( // Tabs only visible if user is logged in
            <nav className="hidden md:flex flex-1 justify-center items-center space-x-12 h-full">
              {navigationTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-2 text-sm font-medium transition-colors h-full px-2 
                      ${
                        activeTab === tab.id
                          ? "text-primary border-b-2 border-primary animate-pulse-once"
                          : "text-base-content/60 hover:text-base-content/80 border-b-2 border-transparent"
                      }`}
                  >
                    <Icon className="size-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          )}

          {/* 3. Right Section: Settings and Logout */}
          <div className="flex items-center gap-2">
            <Link
              to="/settings"
              className={`btn btn-ghost btn-sm gap-2 transition-colors`}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>

            {/* Logout button is only shown if authUser exists */}
            {authUser && (
              <button
                className="btn btn-ghost btn-sm flex gap-2 items-center"
                onClick={logout}
              >
                <LogOut className="size-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
