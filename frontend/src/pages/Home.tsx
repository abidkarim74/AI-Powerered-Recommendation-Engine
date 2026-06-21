import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import AxiosInstanceCustom from "../api/AxiosInstance";
import { type Post } from "../interfaces/Post";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await AxiosInstanceCustom.get("/posts/");
        setPosts(response.data);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError("Failed to load your feed.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Your Feed</h1>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse h-64">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex flex-col gap-2">
                    <div className="w-24 h-3 bg-gray-200 rounded"></div>
                    <div className="w-16 h-2 bg-gray-100 rounded"></div>
                  </div>
                </div>
                <div className="w-full h-4 bg-gray-200 rounded mb-2"></div>
                <div className="w-5/6 h-4 bg-gray-200 rounded mb-2"></div>
                <div className="w-4/6 h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-50 text-red-500 mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Oops!</h3>
            <p className="text-gray-500">{error}</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 text-gray-400 mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">
              We couldn't find any recommendations right now. Try adding more tags to your profile!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {posts.map((post) => (
              <article key={post.id} className="bg-white rounded-2xl p-5 sm:p-6 shadow-[0_2px_8px_rgb(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgb(0,0,0,0.08)] transition-all duration-200 border border-gray-100 flex flex-col h-full">
                <div className="flex items-start gap-3 sm:gap-4 mb-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center text-white font-medium text-lg uppercase shadow-inner">
                    {post.user.username[0] || post.user.fullname[0]}
                  </div>
                  
                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-baseline gap-1.5">
                      <h3 className="text-[15px] font-bold text-gray-900 truncate max-w-full">
                        {post.user.fullname}
                      </h3>
                      <span className="text-[14px] text-gray-500 truncate max-w-full">
                        @{post.user.username}
                      </span>
                    </div>
                    {/* Mobile time */}
                    <time className="text-xs text-gray-400 mt-0.5 block">
                      {formatDate(post.created_at)}
                    </time>
                  </div>
                  
                  {/* Options button */}
                  <button className="flex-shrink-0 text-gray-300 hover:text-gray-600 transition-colors p-1 -mr-1 rounded-full hover:bg-gray-50">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                    </svg>
                  </button>
                </div>
                
                {/* Content */}
                <p className="text-gray-800 text-[15px] sm:text-[16px] leading-relaxed whitespace-pre-wrap break-words mb-4 flex-1">
                  {post.content}
                </p>
                
                {/* Image if any */}
                {post.image_url && (
                  <div className="mt-auto rounded-xl overflow-hidden border border-gray-100 mb-4">
                    <img src={post.image_url} alt="Post attachment" className="w-full h-48 object-cover" loading="lazy" />
                  </div>
                )}

                <Link 
                  to={`/posts/${post.id}`} 
                  className="mt-auto text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center transition-colors"
                >
                  View Post
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}