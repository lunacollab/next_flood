"use client";
import { API_BASE_URL } from "@/lib/constants";
import { useState, useEffect, useRef } from "react";

// Cấu hình URL Backend
const API_URL = `${API_BASE_URL}/community`;

// --- INTERFACES ---
interface User {
  id: string;
  full_name: string;
  email: string;
}

interface Comment {
  id: string;
  user_name: string;
  content: string;
  created_at: string;
}

interface Post {
  id: string;
  user_name: string;
  content: string;
  image_url: string | null;
  location?: string; // --- MỚI: Thêm trường địa điểm ---
  created_at: string;
  comments?: Comment[];
  likes?: number; 
}

// --- ICONS (SVG) ---
const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill={filled ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${filled ? "text-red-500" : "text-gray-500"}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);

const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
  </svg>
);

const ShareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
  </svg>
);

const ImageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-green-500">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);

const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-blue-600">
        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
    </svg>
);

const MapPinIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-red-500">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
);

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
);

// --- MAIN COMPONENT ---
export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]); // --- MỚI: State cho bài viết đã lọc ---
  
  const [content, setContent] = useState("");
  const [locationInput, setLocationInput] = useState(""); // --- MỚI: State cho ô nhập địa điểm ---
  const [searchQuery, setSearchQuery] = useState("");     // --- MỚI: State cho ô tìm kiếm ---

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [activeCommentBox, setActiveCommentBox] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user"); 
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Lỗi parse user data", e);
      }
    }
    fetchPosts();
  }, []);

  // --- MỚI: Xử lý tìm kiếm real-time ---
  useEffect(() => {
    if (!searchQuery.trim()) {
        setFilteredPosts(posts);
    } else {
        const query = searchQuery.toLowerCase();
        const filtered = posts.filter(post => 
            (post.location && post.location.toLowerCase().includes(query)) ||
            (post.content && post.content.toLowerCase().includes(query))
        );
        setFilteredPosts(filtered);
    }
  }, [searchQuery, posts]);


  const fetchPosts = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Không thể tải bài viết");
      const data = await res.json();
      setPosts(data);
      setFilteredPosts(data); // Init filtered list
    } catch (error) {
      console.error("Lỗi tải bài viết:", error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (!currentUser) {
      alert("Bạn cần đăng nhập để đăng bài!");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("user_name", currentUser.full_name || currentUser.email || "Người dùng ẩn danh");
    formData.append("content", content);
    
    // --- MỚI: Gửi kèm location nếu có ---
    if (locationInput.trim()) {
        formData.append("location", locationInput.trim());
    }

    if (selectedImage) {
      formData.append("image", selectedImage);
    }

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setContent("");
        setLocationInput(""); // Reset location input
        setSelectedImage(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        fetchPosts();
      }
    } catch (error) {
      console.error("Lỗi đăng bài:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLike = (postId: string) => {
    setLikedPosts(prev => {
      const newLikes = new Set(prev);
      if (newLikes.has(postId)) {
        newLikes.delete(postId);
      } else {
        newLikes.add(postId);
      }
      return newLikes;
    });
  };

  const toggleCommentBox = (postId: string) => {
    setActiveCommentBox(activeCommentBox === postId ? null : postId);
  };

  const handleCommentSubmit = async (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    if (!currentUser) {
        alert("Vui lòng đăng nhập để bình luận");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/comment`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                post_id: postId,
                user_name: currentUser.full_name || "Người dùng",
                content: text
            })
        });

        if (res.ok) {
            fetchPosts(); 
            setCommentInputs(prev => ({ ...prev, [postId]: "" }));
        } else {
            console.error("Lỗi gửi bình luận");
        }
    } catch (error) {
        console.error("Lỗi kết nối:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', { 
        hour: '2-digit', minute: '2-digit', 
        day: '2-digit', month: '2-digit', year: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] p-4 pt-24"> 
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* HEADER & SEARCH BAR */}
        <div className="flex flex-col gap-4 mb-2">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Bảng tin Cứu Hộ</h1>
                <div className="text-sm text-gray-500">
                    Xin chào, <b>{currentUser?.full_name || "Khách"}</b>
                </div>
            </div>

            {/* --- MỚI: Thanh tìm kiếm --- */}
            <div className="relative">
                <input 
                    type="text" 
                    placeholder="Tìm kiếm bài viết theo địa điểm..." 
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm bg-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute left-3 top-3">
                    <SearchIcon />
                </div>
            </div>
        </div>

        {/* INPUT BOX (Tạo bài viết) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                 <span className="font-bold text-blue-600">
                    {currentUser?.full_name ? currentUser.full_name[0].toUpperCase() : "?"}
                 </span>
            </div>
            <div className="flex-1 space-y-3">
                <textarea
                    className="w-full bg-gray-50 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[80px] text-gray-800 placeholder-gray-500 resize-none"
                    placeholder={`${currentUser?.full_name || "Bạn"} ơi, hãy chia sẻ tình hình nhé...`}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
                
                {/* --- MỚI: Ô nhập địa điểm --- */}
                <div className="relative flex items-center">
                    <div className="absolute left-3 text-gray-400">
                        <MapPinIcon />
                    </div>
                    <input 
                        type="text"
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg border border-transparent focus:bg-white focus:border-blue-200 focus:outline-none text-sm transition-all"
                        placeholder="Thêm địa điểm (VD: Xã Đại Lào, Bảo Lộc...)"
                        value={locationInput}
                        onChange={(e) => setLocationInput(e.target.value)}
                    />
                </div>
            </div>
          </div>

          {previewUrl && (
            <div className="relative mt-3 ml-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
              <img src={previewUrl} alt="Preview" className="w-full h-auto object-cover max-h-80" />
              <button
                onClick={() => {
                  setSelectedImage(null);
                  setPreviewUrl(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="absolute top-2 right-2 bg-gray-900/70 hover:bg-gray-900 text-white rounded-full p-1.5 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100 ml-12">
            <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg transition text-sm font-medium"
            >
                <ImageIcon />
                <span>Ảnh/Video</span>
            </button>
            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
            
            <button
              onClick={handleSubmit}
              disabled={isLoading || !content.trim()}
              className="bg-blue-600 text-white px-8 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition font-semibold shadow-sm"
            >
              {isLoading ? "Đang đăng..." : "Đăng tin"}
            </button>
          </div>
        </div>

        {/* FEED */}
        <div className="space-y-4">
          {filteredPosts.map((post) => {
             const isLiked = likedPosts.has(post.id);
             const postComments = post.comments || []; 
             const isCommentOpen = activeCommentBox === post.id;
             const currentCommentInput = commentInputs[post.id] || "";

             return (
            <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in duration-300">
              <div className="p-4 flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                  {post.user_name ? post.user_name[0].toUpperCase() : "U"}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-[15px]">{post.user_name}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                    <span>{formatDate(post.created_at)}</span>
                    {/* --- MỚI: Hiển thị địa điểm nếu có --- */}
                    {post.location && (
                        <>
                            <span>•</span>
                            <div className="flex items-center gap-0.5 text-red-500 font-medium">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                  <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.006.003.002.001.003.001a.75.75 0 00.01.005zM10 13a4 4 0 100-8 4 4 0 000 8z" clipRule="evenodd" />
                                </svg>
                                {post.location}
                            </div>
                        </>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-4 pb-2">
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{post.content}</p>
              </div>

              {post.image_url && (
                <div className="mt-2 w-full bg-gray-50 border-y border-gray-100">
                  <img
                    src={post.image_url}
                    alt="Post content"
                    className="w-full h-auto max-h-[500px] object-contain mx-auto"
                    loading="lazy"
                  />
                </div>
              )}

              <div className="px-4 py-2 flex items-center justify-between text-gray-500 text-sm border-b border-gray-50">
                    <div className="flex items-center gap-1">
                        {isLiked && <div className="p-1 bg-red-500 rounded-full"><svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></div>}
                        <span>{isLiked ? (post.likes || 0) + 1 : (post.likes || 0)} người thích</span>
                    </div>
                    <div 
                        className="cursor-pointer hover:underline"
                        onClick={() => toggleCommentBox(post.id)}
                    >
                        <span>{postComments.length} bình luận</span>
                    </div>
              </div>

              <div className="px-2 py-1 flex items-center justify-between border-b border-gray-50">
                <button 
                    onClick={() => toggleLike(post.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition hover:bg-gray-50 ${isLiked ? "text-red-500 font-medium" : "text-gray-600"}`}
                >
                  <HeartIcon filled={isLiked} />
                  <span>Thích</span>
                </button>
                
                <button 
                    onClick={() => toggleCommentBox(post.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition hover:bg-gray-50 ${isCommentOpen ? "text-blue-600 bg-blue-50" : "text-gray-600"}`}
                >
                  <ChatIcon />
                  <span>Bình luận</span>
                </button>
                
                <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition hover:bg-gray-50 text-gray-600">
                  <ShareIcon />
                  <span>Chia sẻ</span>
                </button>
              </div>

              {/* --- KHUNG BÌNH LUẬN --- */}
              {isCommentOpen && (
                <div className="bg-gray-50 p-4 animate-in slide-in-from-top-2 duration-200">
                    <div className="flex gap-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-xs font-bold text-blue-700 flex-shrink-0">
                             {currentUser?.full_name ? currentUser.full_name[0].toUpperCase() : "me"}
                        </div>
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                className="w-full rounded-full border border-gray-300 py-2 px-4 pr-10 focus:outline-none focus:border-blue-500 text-sm"
                                placeholder="Viết bình luận..."
                                value={currentCommentInput}
                                onChange={(e) => setCommentInputs(prev => ({...prev, [post.id]: e.target.value}))}
                                onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit(post.id)}
                            />
                            <button 
                                onClick={() => handleCommentSubmit(post.id)}
                                className="absolute right-2 top-1.5 hover:bg-gray-100 p-1 rounded-full transition"
                            >
                                <SendIcon />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {[...postComments].reverse().map((comment) => (
                            <div key={comment.id} className="flex gap-2 group">
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                                    {comment.user_name ? comment.user_name[0].toUpperCase() : "U"}
                                </div>
                                <div className="flex flex-col">
                                    <div className="bg-white p-2.5 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 inline-block">
                                        <p className="text-xs font-bold text-gray-900">{comment.user_name}</p>
                                        <p className="text-sm text-gray-800">{comment.content}</p>
                                    </div>
                                    <span className="text-[10px] text-gray-400 ml-2 mt-0.5">
                                        {new Date(comment.created_at).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
              )}
            </div>
          )})}
          
          {filteredPosts.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                <p className="text-gray-500">Không tìm thấy bài viết nào.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}