import { useState, useRef, useEffect } from "react";
import AxiosInstanceCustom from "../api/AxiosInstance";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  // Handle escape key to close
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (content.length < 10) {
      setError("Post content must be at least 10 characters long.");
      return;
    }
    
    setLoading(true);
    
    try {
      await AxiosInstanceCustom.post("/posts/", {
        content: content.trim(),
        image_url: imageUrl.trim() || null
      });
      
      // Show success message
      setSuccess(true);
      
      // Wait for 1.5s to let user read the message, then route to profile
      setTimeout(() => {
        setContent("");
        setImageUrl("");
        setSuccess(false);
        onClose();
        window.location.href = "/profile";
      }, 1500);
      
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to create post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        ref={modalRef}
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Create a new post</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        {success ? (
          <div className="flex flex-col items-center justify-center p-10 sm:p-14 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-5 border-4 border-green-100">
              <svg className="w-8 h-8 text-green-500 animate-in spin-in-180 duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Post Created!</h3>
            <p className="text-gray-500 text-center text-sm">Your post has been successfully published.<br/>Redirecting to your profile...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col p-6 animate-in fade-in duration-200">
            <div className="mb-4">
              <textarea
                placeholder="What's on your mind? (min 10 characters)"
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (error) setError("");
                }}
                rows={4}
                maxLength={1000}
                className="w-full px-4 py-3 text-gray-900 bg-gray-50 border border-gray-200 rounded-xl outline-none transition-colors placeholder:text-gray-400 focus:bg-white focus:border-gray-900 resize-none text-[15px]"
                autoFocus
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-400">
                  {content.length}/1000 characters
                </span>
                {content.length > 0 && content.length < 10 && (
                  <span className="text-xs text-amber-500">
                    {10 - content.length} more characters needed
                  </span>
                )}
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
                Image URL (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none transition-colors placeholder:text-gray-400 focus:bg-white focus:border-gray-900"
                />
              </div>
              {imageUrl && (
                <div className="mt-3 relative rounded-lg overflow-hidden border border-gray-200 max-h-40 bg-gray-50">
                  <img 
                    src={imageUrl} 
                    alt="Preview" 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                    onLoad={(e) => {
                      (e.target as HTMLImageElement).style.display = 'block';
                    }}
                  />
                </div>
              )}
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}
            
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || content.length < 10}
                className="px-5 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center min-w-[100px]"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin mr-2" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Posting
                  </>
                ) : (
                  "Post"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
