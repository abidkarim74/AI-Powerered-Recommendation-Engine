import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthProvider";
import AxiosInstanceCustom from "../api/AxiosInstance";

interface AIChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIChatbot({ isOpen, onClose }: AIChatbotProps) {
  const [query, setQuery] = useState("");
  const [currentQuery, setCurrentQuery] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { accessToken } = useAuth();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [response]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userPrompt = query.trim();
    setCurrentQuery(userPrompt);
    setQuery("");
    setIsLoading(true);
    setResponse("");

    try {
      const baseURL = AxiosInstanceCustom.defaults.baseURL || "http://localhost:8000/api";
      const res = await fetch(`${baseURL}/llm/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ prompt: userPrompt }),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch response");
      }

      if (!res.body) throw new Error("No body in response");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        setResponse((prev) => prev + chunk);
      }
    } catch (error) {
      console.error("Chatbot error:", error);
      setResponse("An error occurred while fetching the response.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute top-16 right-4 sm:right-6 md:right-20 w-[90vw] max-w-sm sm:w-96 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 flex flex-col font-sans overflow-hidden transform transition-all duration-300 ease-in-out">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-gray-800">
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
          <h3 className="font-semibold text-sm text-gray-800">AI Assistant</h3>
        </div>
        <button onClick={onClose} className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Chat Area */}
      <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto max-h-[60vh] min-h-[20rem] bg-white scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        {!currentQuery && !response && !isLoading ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-80 gap-3">
             <svg width="32" height="32" viewBox="0 0 20 20" fill="none" className="text-gray-300">
              <path
                d="M10 3l1.2 3.6L14.8 8l-3.6 1.2L10 12.8 8.8 9.2 5.2 8l3.6-1.2L10 3z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-sm font-medium text-center px-4 leading-relaxed">Hi, welcome to Recommendation AI, your virtual AI assistant. Let me know if you have any questions.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {currentQuery && (
              <div className="self-end bg-gray-100 px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm text-gray-800 break-words max-w-[85%] shadow-sm">
                {currentQuery}
              </div>
            )}
            {(response || isLoading) && (
              <div className="self-start text-sm text-gray-700 leading-relaxed whitespace-pre-wrap max-w-[95%]">
                {response ? (
                  (() => {
                    const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
                    const parts = [];
                    let lastIndex = 0;
                    let match;

                    while ((match = linkRegex.exec(response)) !== null) {
                      if (match.index > lastIndex) {
                        parts.push(response.slice(lastIndex, match.index));
                      }
                      parts.push(
                        <a
                          key={match.index}
                          href={match[2]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline decoration-blue-300 hover:decoration-blue-600 underline-offset-2 transition-colors"
                        >
                          {match[1]}
                        </a>
                      );
                      lastIndex = linkRegex.lastIndex;
                    }

                    if (lastIndex < response.length) {
                      parts.push(response.slice(lastIndex));
                    }

                    return parts.length > 0 ? parts : response;
                  })()
                ) : (
                  isLoading && (
                    <div className="flex gap-1 items-center h-6 pl-2">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  )
                )}
              </div>
            )}
            </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-gray-100 bg-white">
        <form onSubmit={handleSubmit} className="flex items-center gap-2 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask something..."
            className="flex-1 pl-4 pr-10 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-full outline-none focus:bg-white focus:border-gray-300 transition-colors"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className="absolute right-1 w-8 h-8 flex items-center justify-center rounded-full bg-gray-900 text-white disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-black transition-colors transform active:scale-95"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
