"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { MessageSquare, Plus } from "lucide-react";
import Header from "../components/header";
import WondersHeroSection from "./components/WondersHeroSection";
import WonderCard from "./components/WonderCard";
import NewWonderForm from "./components/NewWonderForm";

interface Wonder {
  id: string;
  title: string;
  content: string;
  category: string;
  authorName: string;
  authorEmail: string;
  authorPhone?: string;
  company?: string;
  isPublic: boolean; // 공개/비공개 여부
  status: "pending" | "answered" | "closed"; // 답변 상태
  createdAt: any;
  updatedAt?: any;
  adminReply?: string; // 관리자 답변
  adminReplyAt?: any;
}

export default function WondersPage() {
  const [wonders, setWonders] = useState<Wonder[]>([]);
  const [isNewWonderOpen, setIsNewWonderOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // 실시간 문의글 가져오기 (공개된 글만)
  useEffect(() => {
    const q = query(
      collection(db, "wonders"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const wondersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Wonder[];
      
      // 공개된 문의글만 필터링
      const publicWonders = wondersData.filter(wonder => wonder.isPublic);
      setWonders(publicWonders);
      setLoading(false);
    }, (error) => {
      console.error("문의글 가져오기 오류:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 문의 작성 후 새로고침 (실시간 업데이트로 자동 처리됨)
  const handleWonderCreated = () => {
    // onSnapshot으로 실시간 업데이트되므로 별도 처리 불필요
  };

  if (loading) {
    return (
      <main className="bg-white dark:bg-black min-h-screen flex items-center justify-center transition-colors">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-yellow-400 border-t-transparent"></div>
      </main>
    );
  }

  return (
    <>
      <Header />
      <main className="bg-white dark:bg-black min-h-screen transition-colors">
        <WondersHeroSection />

        <section
          id="scroll-target"
          className="max-w-4xl mx-auto px-4 py-12 text-gray-900 dark:text-white transition-colors"
        >
          {/* 헤더 & 문의하기 버튼 */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">🤔 궁금해요</h2>
              <p className="text-gray-600 dark:text-gray-400">
                궁금한 점이나 문의사항을 자유롭게 남겨주세요. 빠른 시일 내에 답변드리겠습니다.
              </p>
            </div>
            
            <button
              onClick={() => setIsNewWonderOpen(true)}
              className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold transition-colors shadow-sm"
            >
              <MessageSquare className="h-5 w-5" />
              문의하기
            </button>
          </div>

          {/* 문의 통계 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">전체 문의</h3>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{wonders.length}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">답변 완료</h3>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                {wonders.filter(wonder => wonder.status === "answered").length}
              </p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-1">답변 대기</h3>
              <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                {wonders.filter(wonder => wonder.status === "pending").length}
              </p>
            </div>
          </div>

          {/* 문의글 목록 */}
          <div className="space-y-6">
            {wonders.length > 0 ? (
              wonders.map((wonder) => (
                <WonderCard 
                  key={wonder.id} 
                  wonder={{
                    id: wonder.id,
                    title: wonder.title,
                    content: wonder.content,
                    category: wonder.category,
                    authorName: wonder.authorName,
                    company: wonder.company,
                    status: wonder.status,
                    date: wonder.createdAt?.toDate ? 
                      wonder.createdAt.toDate().toLocaleDateString('ko-KR') :
                      new Date().toLocaleDateString('ko-KR'),
                    adminReply: wonder.adminReply,
                    adminReplyAt: wonder.adminReplyAt?.toDate ? 
                      wonder.adminReplyAt.toDate().toLocaleDateString('ko-KR') : null,
                  }} 
                />
              ))
            ) : (
              <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-xl mb-3">아직 등록된 문의가 없습니다.</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
                  궁금한 점이나 문의사항이 있으시면 언제든지 문의해주세요.
                </p>
                <button
                  onClick={() => setIsNewWonderOpen(true)}
                  className="text-yellow-500 hover:text-yellow-600 dark:text-yellow-400 dark:hover:text-yellow-300 hover:underline transition-colors font-medium"
                >
                  첫 번째 문의를 남겨보세요!
                </button>
              </div>
            )}
          </div>

          {/* 플로팅 문의하기 버튼 (모바일용) */}
          <button
            onClick={() => setIsNewWonderOpen(true)}
            className="fixed bottom-6 right-6 bg-yellow-400 hover:bg-yellow-500 text-black p-4 rounded-full shadow-lg transition-colors md:hidden z-40"
          >
            <Plus className="h-6 w-6" />
          </button>
        </section>

        {/* 문의하기 모달 */}
        <NewWonderForm
          isOpen={isNewWonderOpen}
          onClose={() => setIsNewWonderOpen(false)}
          onWonderCreated={handleWonderCreated}
        />
      </main>
    </>
  );
}