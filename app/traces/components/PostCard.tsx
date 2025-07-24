"use client";

import { useState, useEffect } from "react";
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
  serverTimestamp 
} from "firebase/firestore";
import { Heart, MessageCircle, Send, User, X, Maximize2 } from "lucide-react";

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
    userImage?: string; // 🔥 프로필 이미지 URL
    content: string;
    category?: string;
    date: string;
    likes?: string[];
    likesCount?: number;
  };
}

export default function PostCard({ post }: PostCardProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [isExpanded, setIsExpanded] = useState(false); // 🔥 모달 상태

  // 현재 사용자 정보 가져오기
  useEffect(() => {
    if (auth.currentUser) {
      const fetchUserData = async () => {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser!.uid));
        const userData = userDoc.data();
        if (userData) {
          setCurrentUser({
            uid: auth.currentUser!.uid,
            name: userData.name,
            nickname: userData.nickname,
            role: userData.role,
          });
        }
      };
      fetchUserData();
    }
  }, []);

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

  // 좋아요 토글
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

  // 댓글 작성
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
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

  const canInteract = currentUser && currentUser.role === "approved";

  // 🔥 카드 클릭 시 모달 열기
  const handleCardClick = (e: React.MouseEvent) => {
    // 버튼 클릭은 모달 열지 않음
    if ((e.target as HTMLElement).closest('button')) return;
    setIsExpanded(true);
  };

  // 🔥 컴팩트 카드 컴포넌트 (기본 상태)
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
        <Maximize2 className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* 글 내용 (3줄까지만 표시) */}
      <div className="text-gray-800 dark:text-gray-100 mb-4 whitespace-pre-wrap leading-relaxed overflow-hidden" 
           style={{
             display: '-webkit-box',
             WebkitLineClamp: 3,
             WebkitBoxOrient: 'vertical',
           }}>
        {post.content}
      </div>

      {/* 좋아요/댓글 버튼 */}
      <div className="flex items-center gap-4 text-sm pt-3 border-t border-gray-200 dark:border-gray-700">
        <button 
          onClick={handleLike}
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
        
        <button className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
          <MessageCircle className="h-4 w-4" />
          {comments.length}
        </button>
      </div>
    </div>
  );

  // 🔥 확장 모달 컴포넌트
  const ExpandedModal = () => (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* 모달 헤더 */}
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
          {/* 왼쪽: 게시글 내용 */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* 작성자 정보 */}
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

            {/* 글 내용 (전체 표시) */}
            <div className="text-gray-800 dark:text-gray-100 mb-6 whitespace-pre-wrap leading-relaxed text-lg">
              {post.content}
            </div>

            {/* 좋아요 버튼 */}
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

          {/* 오른쪽: 댓글 섹션 */}
          <div className="w-96 border-l border-gray-200 dark:border-gray-700 flex flex-col">
            {/* 댓글 헤더 */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                댓글 {comments.length}개
              </h3>
            </div>

            {/* 댓글 목록 */}
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
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="댓글을 입력하세요..."
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-sm"
                      disabled={isSubmittingComment}
                    />
                    <button
                      type="submit"
                      disabled={!newComment.trim() || isSubmittingComment}
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