"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { PenSquare, Plus } from "lucide-react";
import Header from "../components/header"; // 🔥 헤더 추가
import HeroSection from "./components/HeroSection";
import PostCard from "./components/PostCard";
import NewPostForm from "./components/NewPostForm";

interface Post {
  id: string;
  content: string;
  category: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  authorProfileImage?: string; // 🔥 작성자 프로필 이미지
  createdAt: any;
  likes: string[] | any[];
  likesCount: number;
}

interface User {
  uid: string;
  name: string;
  nickname?: string; // 🔥 닉네임 필드 추가
  email: string;
  role: string;
}

export default function TracesPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // 사용자 인증 상태 확인
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          const userData = userDoc.data();
          
          if (userDoc.exists() && userData) {
            setUser({
              uid: firebaseUser.uid,
              name: userData.name,
              nickname: userData.nickname, // 🔥 닉네임 추가
              email: userData.email,
              role: userData.role,
            });
          }
        } catch (error) {
          console.error("사용자 정보 가져오기 오류:", error);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 실시간 포스트 가져오기
  useEffect(() => {
    const q = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];
      
      setPosts(postsData);
    }, (error) => {
      console.error("포스트 가져오기 오류:", error);
    });

    return () => unsubscribe();
  }, []);

  // 글 작성 후 새로고침 (실시간 업데이트로 자동 처리됨)
  const handlePostCreated = () => {
    // onSnapshot으로 실시간 업데이트되므로 별도 처리 불필요
  };

  // 글쓰기 권한 확인
  const canWritePost = user && user.role === "approved";

  if (loading) {
    return (
      <main className="bg-white dark:bg-black min-h-screen flex items-center justify-center transition-colors">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-yellow-400 border-t-transparent"></div>
      </main>
    );
  }

  return (
    <>
      <Header /> {/* 🔥 헤더 추가 */}
      <main className="bg-white dark:bg-black min-h-screen transition-colors">
        <HeroSection />

      <section
        id="scroll-target"
        className="max-w-3xl mx-auto px-4 py-12 text-gray-900 dark:text-white transition-colors"
      >
        {/* 헤더 & 글쓰기 버튼 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">📌 최신 피드</h2>
          
          {canWritePost ? (
            <button
              onClick={() => setIsNewPostOpen(true)}
              className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-md font-semibold transition-colors shadow-sm"
            >
              <PenSquare className="h-4 w-4" />
              글쓰기
            </button>
          ) : user && user.role === "pending" ? (
            <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700">
              승인 대기 중 (글쓰기 제한)
            </div>
          ) : !user ? (
            <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700">
              로그인 후 글쓰기 가능
            </div>
          ) : null}
        </div>

        {/* 포스트 목록 */}
        <div className="space-y-6">
          {posts.length > 0 ? (
            posts.map((post) => (
              <PostCard 
                key={post.id} 
                post={{
                  id: post.id,
                  username: post.authorName,
                  userImage: post.authorProfileImage || "/images/default-avatar.png", // 🔥 실제 프로필 이미지
                  content: post.content,
                  category: post.category,
                  date: post.createdAt?.toDate ? 
                    post.createdAt.toDate().toLocaleDateString('ko-KR') :
                    new Date().toLocaleDateString('ko-KR'),
                  likes: Array.isArray(post.likes) ? post.likes : [],
                  likesCount: typeof post.likesCount === 'number' ? post.likesCount : 
                             (Array.isArray(post.likes) ? post.likes.length : 0),
                }} 
              />
            ))
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <PenSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">아직 작성된 글이 없습니다.</p>
              {canWritePost && (
                <button
                  onClick={() => setIsNewPostOpen(true)}
                  className="text-yellow-500 hover:text-yellow-600 dark:text-yellow-400 dark:hover:text-yellow-300 hover:underline transition-colors"
                >
                  첫 번째 글을 작성해보세요!
                </button>
              )}
            </div>
          )}
        </div>

        {/* 플로팅 글쓰기 버튼 (모바일용) */}
        {canWritePost && (
          <button
            onClick={() => setIsNewPostOpen(true)}
            className="fixed bottom-6 right-6 bg-yellow-400 hover:bg-yellow-500 text-black p-4 rounded-full shadow-lg transition-colors md:hidden"
          >
            <Plus className="h-6 w-6" />
          </button>
        )}
      </section>

      {/* 글쓰기 모달 */}
      <NewPostForm
        isOpen={isNewPostOpen}
        onClose={() => setIsNewPostOpen(false)}
        onPostCreated={handlePostCreated}
      />
      </main>
    </>
  );
}