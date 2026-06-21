import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

export default function ProfileDropdown() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setMenuOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="Profile menu"
        aria-expanded={menuOpen}
        className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors active:scale-[0.96] overflow-hidden"
      >
        <svg width="24" height="24" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <circle cx="10" cy="7.5" r="3" stroke="currentColor" strokeWidth="1.5" className="text-gray-500" />
          <path
            d="M3.5 17c0-3.038 2.91-5.5 6.5-5.5s6.5 2.462 6.5 5.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="text-gray-500"
          />
        </svg>
      </button>

      {menuOpen && (
        <div className="fixed sm:absolute left-3 right-3 sm:left-auto sm:right-0 top-[4.5rem] sm:top-14 w-auto sm:w-60 max-w-none sm:max-w-[calc(100vw-1.5rem)] bg-white border border-gray-100 rounded-xl shadow-sm py-1.5 z-20">
          <div className="px-3.5 py-3 border-b border-gray-100 mb-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold text-gray-700 uppercase flex-shrink-0">
                {user?.username?.[0] || user?.fullname?.[0] || "?"}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-semibold text-gray-900 truncate">{user?.username || "Guest"}</span>
                <span className="text-xs text-gray-500 truncate">{user?.email || "No email"}</span>
              </div>
            </div>
          </div>
          
          <Link to="/profile" onClick={() => setMenuOpen(false)} className="block px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            Profile
          </Link>
          <Link to="/settings" onClick={() => setMenuOpen(false)} className="block px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            Settings
          </Link>
          
          <div className="px-3.5 py-2 mt-1">
            <button 
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 active:scale-[0.98] disabled:opacity-60 transition-all"
            >
              {loggingOut ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Logging out...
                </>
              ) : (
                "Log out"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}