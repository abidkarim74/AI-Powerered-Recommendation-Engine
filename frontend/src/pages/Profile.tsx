import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthProvider";
import Header from "../components/Header";
import AxiosInstanceCustom from "../api/AxiosInstance";
import { type Tag } from "../interfaces/Tag";
import { type Post } from "../interfaces/Post";

export default function ProfilePage() {
  const { user } = useAuth();
  const [tags, setTags] = useState<Tag[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [tagError, setTagError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await AxiosInstanceCustom.get("/tags/");
        if (response.data && response.data.data) {
            setTags(response.data.data);
        } else {
            setTags([]);
        }
      } catch (error) {
        console.error("Failed to fetch tags", error);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchPosts = async () => {
      try {
        const response = await AxiosInstanceCustom.get("/posts/auth");
        setPosts(response.data);
      } catch (error) {
        console.error("Failed to fetch posts", error);
      } finally {
        setLoadingPosts(false);
      }
    };
    
    fetchTags();
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

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    setTagError("");
    
    if (!newTag.trim()) {
      return;
    }
    
    if (tags.length >= 5) {
      setTagError("You can only have up to 5 preference tags.");
      return;
    }
    
    setSubmitting(true);
    try {
      const response = await AxiosInstanceCustom.post("/tags/", { content: newTag.trim() });
      setTags([...tags, response.data]);
      setNewTag("");
    } catch (error: any) {
      setTagError(error.response?.data?.detail || "Failed to create tag.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    try {
      await AxiosInstanceCustom.delete(`/tags/${tagId}`);
      setTags(tags.filter(t => t.id !== tagId));
    } catch (error: any) {
      console.error("Failed to delete tag", error);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans overflow-x-hidden">
      <Header />
      
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 box-border">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Profile Details</h1>
        
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex items-center gap-4 mb-6 min-w-0">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-2xl font-bold text-gray-700 uppercase flex-shrink-0">
              {user?.username?.[0] || user?.fullname?.[0] || "?"}
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-gray-900 truncate">{user?.fullname}</h2>
              <p className="text-sm text-gray-500 truncate">@{user?.username}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Email</p>
              <p className="text-sm text-gray-900 break-words">{user?.email}</p>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Member Since</p>
              <p className="text-sm text-gray-900">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "Unknown"}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Preferences & Tags</h2>
          <p className="text-sm text-gray-500 mb-6">
            Add up to 5 tags to personalize your recommendation feed. These can be topics, genres, or interests.
          </p>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {tags.length > 0 ? (
                <div className="flex flex-wrap gap-2 mb-6">
                  {tags.map((tag) => (
                    <div key={tag.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-800 text-sm rounded-full font-medium max-w-full">
                      <span className="truncate">{tag.content}</span>
                      <button 
                        onClick={() => handleDeleteTag(tag.id)}
                        className="flex items-center justify-center w-4 h-4 rounded-full text-gray-500 hover:text-red-500 hover:bg-gray-200 transition-colors flex-shrink-0"
                        aria-label={`Remove tag ${tag.content}`}
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                          <path d="M2 2L8 8M8 2L2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-400 italic mb-6">No tags added yet.</div>
              )}
              
              {tags.length >= 5 && (
                 <p className="text-sm text-green-600 mb-2">You've reached the maximum limit of 5 tags.</p>
              )}

              {tags.length < 5 && (
                <form onSubmit={handleAddTag} className="flex gap-2 w-full max-w-sm">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => { setNewTag(e.target.value); setTagError(""); }}
                    placeholder="e.g. Technology, Anime, Hiking"
                    maxLength={40}
                    className="flex-1 min-w-0 px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg outline-none transition-colors placeholder:text-gray-400 focus:border-gray-400"
                  />
                  <button
                    type="submit"
                    disabled={!newTag.trim() || submitting}
                    className="flex-shrink-0 flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 active:scale-[0.98] disabled:opacity-60 transition-all whitespace-nowrap"
                  >
                    {submitting ? "Adding..." : "Add"}
                  </button>
                </form>
              )}
              {tagError && <p className="text-xs text-red-500 mt-2">{tagError}</p>}
            </>
          )}
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Your Posts</h2>
          
          {loadingPosts ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {[1, 2].map((i) => (
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
          ) : posts.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-10 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 text-gray-400 mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-500 text-sm max-w-sm mx-auto">
                You haven't created any posts. Click the + icon in the header to share something!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {posts.map((post) => (
                <article key={post.id} className="bg-white rounded-2xl p-5 sm:p-6 shadow-[0_2px_8px_rgb(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgb(0,0,0,0.08)] transition-all duration-200 border border-gray-100 flex flex-col h-full">
                  <div className="flex items-start gap-3 sm:gap-4 mb-4">
                    <div className="flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center text-white font-medium text-lg uppercase shadow-inner">
                      {post.user.username[0] || post.user.fullname[0]}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-baseline gap-1.5">
                        <h3 className="text-[15px] font-bold text-gray-900 truncate max-w-full">
                          {post.user.fullname}
                        </h3>
                        <span className="text-[14px] text-gray-500 truncate max-w-full">
                          @{post.user.username}
                        </span>
                      </div>
                      <time className="text-xs text-gray-400 mt-0.5 block">
                        {formatDate(post.created_at)}
                      </time>
                    </div>
                  </div>
                  
                  <p className="text-gray-800 text-[15px] sm:text-[16px] leading-relaxed whitespace-pre-wrap break-words mb-4 flex-1">
                    {post.content}
                  </p>
                  
                  {post.image_url && (
                    <div className="mt-auto rounded-xl overflow-hidden border border-gray-100">
                      <img src={post.image_url} alt="Post attachment" className="w-full h-48 object-cover" loading="lazy" />
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}