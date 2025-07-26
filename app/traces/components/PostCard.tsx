"use client";

import { useState, useEffect, useCallback } from "react";
import { auth, db } from "@/lib/firebase";
import { 
  doc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot,
  getDoc,
  serverTimestamp,
  deleteDoc
} from "firebase/firestore";
import { Heart, MessageCircle, Send, User, X, Maximize2, Edit, Trash2, MoreHorizontal, ImageOff } from "lucide-react";

interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: any;
}

interface PostCardProps {
  post: {
    id: string;
    username: string;
    userImage?: string;
    content: string;
    category?: string;
    date: string;
    likes?: string[];
    likesCount?: number;
    authorId?: string;
    imageUrl?: string;
  };
  onPostDeleted?: () => void;
  onPostUpdated?: () => void;
}

export default function PostCard({ post, onPostDeleted, onPostUpdated }: PostCardProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  
  // 🔥 이미지 로딩 상태 추가
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // 🔧 작성자 권한 체크 개선
  const isAuthor = useCallback(() => {
    console.log("🔍 권한 체크:", {
      currentUser: currentUser?.uid,
      authUser: auth.currentUser?.uid,
      postAuthor: post.authorId,
      isEqual: currentUser?.uid === post.authorId
    });
    
    return currentUser && 
           auth.currentUser && 
           (post.authorId === auth.currentUser.uid);
  }, [currentUser, post.authorId]);

  // 현재 사용자 정보 가져오기
  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
          const userData = userDoc.data();
          if (userData) {
            const user = {
              uid: auth.currentUser.uid,
              name: userData.name,
              nickname: userData.nickname,
              role: userData.role,
            };
            setCurrentUser(user);
            console.log("👤 사용자 정보 로드:", user);
          }
        } catch (error) {
          console.error("사용자 정보 가져오기 오류:", error);
        }
      } else {
        setCurrentUser(null);
        console.log("👤 로그인되지 않음");
      }
    };

    fetchUserData();
  }, [auth.currentUser?.uid]);

  // 좋아요 상태 확인
  useEffect(() => {
    if (auth.currentUser && post.likes && Array.isArray(post.likes)) {
      setIsLiked(post.likes.includes(auth.currentUser.uid));
    }
    setLikesCount(post.likesCount || (Array.isArray(post.likes) ? post.likes.length : 0));
  }, [post.likes, post.likesCount]);

  // 실시간 댓글 가져오기
  useEffect(() => {
    const commentsRef = collection(db, "posts", post.id, "comments");
    const q = query(commentsRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Comment[];
      setComments(commentsData);
    });

    return () => unsubscribe();
  }, [post.id]);

  // 🔥 이미지 에러 핸들러
  const handleImageError = () => {
    console.error("🖼️ 이미지 로딩 실패:", post.imageUrl);
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    console.log("✅ 이미지 로딩 성공:", post.imageUrl);
    setImageLoading(false);
    setImageError(false);
  };

  // 한글 입력 핸들러들
  const handleCompositionStart = useCallback(() => {
    setIsComposing(true);
  }, []);

  const handleCompositionEnd = useCallback(() => {
    setIsComposing(false);
  }, []);

  const handleCommentChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewComment(e.target.value);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isComposing) {
      e.preventDefault();
      handleCommentSubmit(e as any);
    }
  }, [isComposing, newComment]);

  const handleLike = async () => {
    if (!auth.currentUser || !currentUser || currentUser.role !== "approved") {
      alert("승인된 사용자만 좋아요를 누를 수 있습니다.");
      return;
    }

    try {
      const postRef = doc(db, "posts", post.id);
      
      if (isLiked) {
        await updateDoc(postRef, {
          likes: arrayRemove(auth.currentUser.uid),
          likesCount: Math.max(0, likesCount - 1)
        });
        setIsLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));
      } else {
        await updateDoc(postRef, {
          likes: arrayUnion(auth.currentUser.uid),
          likesCount: likesCount + 1
        });
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error) {
      console.error("좋아요 처리 오류:", error);
      alert("좋아요 처리 중 오류가 발생했습니다.");
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isComposing || !newComment.trim()) return;
    
    if (!auth.currentUser || !currentUser || currentUser.role !== "approved") {
      alert("승인된 사용자만 댓글을 작성할 수 있습니다.");
      return;
    }

    setIsSubmittingComment(true);

    try {
      const commentsRef = collection(db, "posts", post.id, "comments");
      await addDoc(commentsRef, {
        content: newComment.trim(),
        authorId: auth.currentUser.uid,
        authorName: currentUser.nickname || currentUser.name,
        createdAt: serverTimestamp(),
      });

      setNewComment("");
    } catch (error) {
      console.error("댓글 작성 오류:", error);
      alert("댓글 작성 중 오류가 발생했습니다.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // 🔧 수정 기능 개선
  const handleEditClick = () => {
    console.log("✏️ 수정 버튼 클릭");
    setIsEditing(true);
    setEditContent(post.content);
    setShowMenu(false);
  };

  const handleEditCancel = () => {
    console.log("❌ 수정 취소");
    setIsEditing(false);
    setEditContent(post.content);
  };

  const handleEditSave = async () => {
    if (!auth.currentUser || !currentUser || !editContent.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }

    if (!isAuthor()) {
      alert("자신이 작성한 글만 수정할 수 있습니다.");
      return;
    }

    console.log("💾 게시글 수정 시작:", {
      postId: post.id,
      newContent: editContent,
      author: currentUser.uid
    });

    try {
      const postRef = doc(db, "posts", post.id);
      await updateDoc(postRef, {
        content: editContent.trim(),
        updatedAt: serverTimestamp(),
      });

      console.log("✅ 게시글 수정 완료");
      setIsEditing(false);
      setShowMenu(false);
      
      onPostUpdated?.();
      alert("게시글이 성공적으로 수정되었습니다.");

    } catch (error) {
      console.error("💥 게시글 수정 오류:", error);
      alert("게시글 수정에 실패했습니다.");
    }
  };

  const handleDelete = async () => {
    if (!auth.currentUser || !currentUser) return;

    if (!isAuthor()) {
      alert("자신이 작성한 글만 삭제할 수 있습니다.");
      return;
    }

    const confirmed = confirm("정말로 이 게시글을 삭제하시겠습니까?");
    if (!confirmed) return;

    setIsDeleting(true);

    try {
      await deleteDoc(doc(db, "posts", post.id));
      onPostDeleted?.();
      alert("게시글이 삭제되었습니다.");
    } catch (error) {
      console.error("게시글 삭제 오류:", error);
      alert("게시글 삭제에 실패했습니다.");
      setIsDeleting(false);
    }
  };

  const canInteract = currentUser && currentUser.role === "approved";
  const canEdit = isAuthor();

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    setIsExpanded(true);
  };

  // 🔥 이미지 렌더링 컴포넌트 개선
  const ImageComponent = ({ className = "" }: { className?: string }) => {
    if (!post.imageUrl) return null;

    if (imageError) {
      return (
        <div className={`bg-gray-100 dark:bg-gray-800 flex items-center justify-center ${className}`}>
          <div className="text-center text-gray-500 dark:text-gray-400 p-8">
            <ImageOff className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">이미지를 불러올 수 없습니다</p>
          </div>
        </div>
      );
    }

    return (
      <div className={`relative ${className}`}>
        {imageLoading && (
          <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-yellow-400 border-t-transparent"></div>
          </div>
        )}
        <img
          src={post.imageUrl}
          alt="게시글 이미지"
          className={`w-full object-cover rounded-lg ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      </div>
    );
  };

  const CompactCard = () => (
    <div 
      onClick={handleCardClick}
      className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer group"
    >
      {/* 작성자 정보 헤더 */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border-2 border-yellow-400">
          {post.userImage ? (
            <img 
              src={post.userImage} 
              alt={`${post.username} 프로필`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-yellow-400 flex items-center justify-center text-black font-bold text-sm">
              {post.username ? post.username[0].toUpperCase() : "?"}
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">{post.username}</h3>
            {post.category && (
              <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full border border-gray-200 dark:border-gray-600">
                {post.category}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{post.date}</p>
        </div>
        
        {/* 수정/삭제 메뉴 */}
        {canEdit && (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log("🔧 메뉴 버튼 클릭");
                setShowMenu(!showMenu);
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <MoreHorizontal className="h-4 w-4 text-gray-500" />
            </button>
            
            {showMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowMenu(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-20">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick();
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Edit className="h-3 w-3" />
                    수정
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete();
                    }}
                    disabled={isDeleting}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Trash2 className="h-3 w-3" />
                    {isDeleting ? "삭제 중..." : "삭제"}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
        
        <Maximize2 className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* 🔥 이미지 표시 개선 */}
      <ImageComponent className="max-h-96 mb-4" />

      {/* 글 내용 - 수정 모드 개선 */}
      {isEditing ? (
        <div className="mb-4" onClick={(e) => e.stopPropagation()}>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            rows={6}
            placeholder="수정할 내용을 입력하세요..."
            maxLength={1000}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-500">
              {editContent.length} / 1000
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleEditCancel}
                className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-700 text-sm rounded-md transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleEditSave}
                disabled={!editContent.trim() || editContent === post.content}
                className="px-3 py-1 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-black text-sm rounded-md transition-colors"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-gray-800 dark:text-gray-100 mb-4 whitespace-pre-wrap leading-relaxed overflow-hidden" 
             style={{
               display: '-webkit-box',
               WebkitLineClamp: 3,
               WebkitBoxOrient: 'vertical',
             }}>
          {post.content}
        </div>
      )}

      {/* 좋아요/댓글 버튼 */}
      <div className="flex items-center gap-4 text-sm pt-3 border-t border-gray-200 dark:border-gray-700">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            handleLike();
          }}
          disabled={!canInteract}
          className={`flex items-center gap-1 transition-colors ${
            isLiked 
              ? "text-red-500 dark:text-red-400" 
              : "text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
          } ${!canInteract ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
          {likesCount}
        </button>
        
        <button 
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          {comments.length}
        </button>
      </div>

      {/* 🔧 디버깅 정보 (개발 환경에서만) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs">
          <p>🔍 디버깅: 수정 권한 = {canEdit ? "✅" : "❌"}</p>
          <p>현재 사용자: {currentUser?.uid || "없음"}</p>
          <p>글 작성자: {post.authorId || "없음"}</p>
          {post.imageUrl && <p>이미지 URL: {post.imageUrl.substring(0, 50)}...</p>}
        </div>
      )}
    </div>
  );

  const ExpandedModal = () => (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">게시글 상세</h2>
          <button
            onClick={() => setIsExpanded(false)}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold">
                {post.username ? post.username[0].toUpperCase() : "?"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{post.username}</h3>
                  {post.category && (
                    <span className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-600">
                      {post.category}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{post.date}</p>
              </div>
            </div>

            {/* 🔥 확대 모달에서도 이미지 개선 */}
            <ImageComponent className="max-h-[400px] mb-6" />

            <div className="text-gray-800 dark:text-gray-100 mb-6 whitespace-pre-wrap leading-relaxed text-lg">
              {post.content}
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button 
                onClick={handleLike}
                disabled={!canInteract}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isLiked 
                    ? "bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400" 
                    : "bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400"
                } ${!canInteract ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
                <span className="font-medium">{likesCount}</span>
              </button>
            </div>
          </div>

          {/* 댓글 섹션 */}
          <div className="w-96 border-l border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                댓글 {comments.length}개
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-gray-900 dark:text-white">
                            {comment.authorName}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {comment.createdAt?.toDate ? 
                              comment.createdAt.toDate().toLocaleString('ko-KR') :
                              '방금 전'
                            }
                          </span>
                        </div>
                        <p className="text-sm text-gray-800 dark:text-gray-200">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 text-sm py-8">
                  첫 번째 댓글을 작성해보세요!
                </p>
              )}
            </div>

            {/* 댓글 작성 폼 */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              {canInteract ? (
                <form onSubmit={handleCommentSubmit} className="flex gap-2">
                  <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-black font-bold text-sm">
                      {currentUser?.nickname ? currentUser.nickname[0].toUpperCase() : "?"}
                    </span>
                  </div>
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={handleCommentChange}
                      onCompositionStart={handleCompositionStart}
                      onCompositionEnd={handleCompositionEnd}
                      onKeyDown={handleKeyDown}
                      placeholder="댓글을 입력하세요..."
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-sm"
                      disabled={isSubmittingComment}
                      autoComplete="off"
                      maxLength={500}
                    />
                    <button
                      type="submit"
                      disabled={!newComment.trim() || isSubmittingComment || isComposing}
                      className="px-3 py-2 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-black rounded-md transition-colors flex items-center gap-1"
                    >
                      {isSubmittingComment ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-2">
                  {currentUser ? "승인 후 댓글 작성 가능" : "로그인 후 댓글 작성 가능"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <CompactCard />
      {isExpanded && <ExpandedModal />}
    </>
  );
}