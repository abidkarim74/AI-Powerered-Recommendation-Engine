import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../components/Header";
import AxiosInstanceCustom from "../api/AxiosInstance";
import { type Post } from "../interfaces/Post";

export default function PostDetail() {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await AxiosInstanceCustom.get(`/posts/${postId}`);
        setPost(response.data);
      } catch (err) {
        console.error("Error fetching post detail:", err);
        setError("Failed to load post details.");
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId]);

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
    
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />
      
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <Link to="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Feed
        </Link>

        {loading ? (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 animate-pulse">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-gray-200 rounded-full"></div>
              <div className="flex flex-col gap-2">
                <div className="w-32 h-4 bg-gray-200 rounded"></div>
                <div className="w-20 h-3 bg-gray-100 rounded"></div>
              </div>
            </div>
            <div className="w-full h-4 bg-gray-200 rounded mb-3"></div>
            <div className="w-5/6 h-4 bg-gray-200 rounded mb-3"></div>
            <div className="w-4/6 h-4 bg-gray-200 rounded"></div>
          </div>
        ) : error || !post ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-500 mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Oops!</h3>
            <p className="text-gray-500">{error || "Post not found."}</p>
          </div>
        ) : (
          <article className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
            <div className="flex items-start gap-4 mb-6">
              {/* Avatar */}
              <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center text-white font-medium text-xl uppercase shadow-inner">
                {post.user.username[0] || post.user.fullname[0]}
              </div>
              
              {/* User Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                  {post.user.fullname}
                </h3>
                <span className="text-sm text-gray-500 truncate">
                  @{post.user.username}
                </span>
                <time className="text-xs text-gray-400 mt-1 block">
                  {formatDate(post.created_at)}
                </time>
              </div>
            </div>
            
            {/* Content */}
            <p className="text-gray-800 text-base sm:text-lg leading-relaxed whitespace-pre-wrap break-words mb-6">
              {post.content}
            </p>
            
            {/* Image if any */}
            {post.image_url && (
              <div className="rounded-xl overflow-hidden border border-gray-100">
                <img src={post.image_url} alt="Post attachment" className="w-full h-auto object-contain max-h-[60vh]" />
              </div>
            )}
          </article>
        )}
      </main>
    </div>
  );
}
