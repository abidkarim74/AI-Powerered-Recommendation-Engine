import { useState } from "react";
import { Link } from "react-router-dom";
import ProfileDropdown from "./ProfileDropdown";
import CreatePostModal from "./CreatePostModal";
import AIChatbot from "./AIChatbot";

export default function Header() {
  const [search, setSearch] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full max-w-full bg-white border-b border-gray-100 font-sans">
      <div className="px-3 sm:px-6 h-16 flex items-center justify-between gap-1 sm:gap-2">

        {/* Left: App icon (hidden on mobile while search is open) */}
        <Link
          to="/"
          aria-label="Home"
          className={`flex-shrink-0 items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-lg hover:bg-gray-50 transition-colors active:scale-[0.96] ${
            mobileSearchOpen ? "hidden sm:flex" : "flex"
          }`}
        >
          <svg width="26" height="26" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M10 2.5l6.5 3.75v7.5L10 17.5l-6.5-3.75v-7.5L10 2.5z"
              stroke="#111827"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <circle cx="10" cy="10" r="2.25" stroke="#111827" strokeWidth="1.5" />
          </svg>
        </Link>

        {/* Center: Search bar (desktop) */}
        <div className="hidden sm:flex flex-1 justify-center px-4 sm:px-8">
          <div className="relative w-full max-w-md">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
              <path d="M17 17l-3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search"
              className="w-full pl-9 pr-3 py-2 text-sm text-gray-900 bg-gray-50 border border-transparent rounded-lg outline-none transition-colors placeholder:text-gray-400 focus:bg-white focus:border-gray-200"
            />
          </div>
        </div>

        {/* Center: Search bar (mobile, replaces other content when open) */}
        {mobileSearchOpen && (
          <div className="flex sm:hidden flex-1 items-center gap-2">
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
                <path d="M17 17l-3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search"
                autoFocus
                className="w-full pl-9 pr-3 py-2 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none transition-colors placeholder:text-gray-400 focus:bg-white"
              />
            </div>
            <button
              type="button"
              onClick={() => { setMobileSearchOpen(false); setSearch(""); }}
              aria-label="Close search"
              className="flex items-center justify-center w-9 h-9 flex-shrink-0 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}

        {/* Right: Search icon (mobile), AI, Create, Profile */}
        <div className={`items-center gap-0.5 sm:gap-2 flex-shrink-0 ${mobileSearchOpen ? "hidden sm:flex" : "flex"}`}>

          {/* Search icon (mobile only) */}
          <button
            type="button"
            onClick={() => setMobileSearchOpen(true)}
            aria-label="Open search"
            className="flex sm:hidden items-center justify-center w-11 h-11 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors active:scale-[0.96]"
          >
            <svg width="23" height="23" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
              <path d="M17 17l-3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>

          {/* AI icon */}
          <button
            type="button"
            onClick={() => setIsChatbotOpen(!isChatbotOpen)}
            aria-label="Ask AI"
            className={`flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-lg transition-colors active:scale-[0.96] ${isChatbotOpen ? 'bg-gray-100 text-gray-800' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'}`}
          >
            <svg width="25" height="25" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M10 3l1.2 3.6L14.8 8l-3.6 1.2L10 12.8 8.8 9.2 5.2 8l3.6-1.2L10 3z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <path
                d="M15.5 12l.6 1.8 1.9.6-1.9.6-.6 1.8-.6-1.8-1.9-.6 1.9-.6.6-1.8z"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Create / + icon */}
          <button
            type="button"
            onClick={() => setIsCreatePostOpen(true)}
            aria-label="Create post"
            className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors active:scale-[0.96]"
          >
            <svg width="25" height="25" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>

          {/* Divider */}
          <div className="w-px h-5 bg-gray-100 mx-1" />

          {/* Profile icon */}
          <ProfileDropdown />
        </div>
      </div>

      <CreatePostModal 
        isOpen={isCreatePostOpen} 
        onClose={() => setIsCreatePostOpen(false)} 
      />
      <AIChatbot 
        isOpen={isChatbotOpen} 
        onClose={() => setIsChatbotOpen(false)} 
      />
    </header>
  );
}