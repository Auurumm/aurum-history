"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { X, Image, Send, AlertCircle } from "lucide-react";

interface NewPostFormProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: () => void; // 글 작성 후 피드 새로고침용
}

export default function NewPostForm({ isOpen, onClose, onPostCreated }: NewPostFormProps) {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("일상");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const categories = ["일상", "공지", "회사소식", "맛집", "취미", "기타"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError("내용을 입력해주세요.");
      return;
    }

    if (!auth.currentUser) {
      setError("로그인이 필요합니다.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // 1. 현재 사용자의 승인 상태 확인
      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      const userData = userDoc.data();

      if (!userDoc.exists() || userData?.role !== "approved") {
        setError("관리자 승인 후 글 작성이 가능합니다.");
        setIsSubmitting(false);
        return;
      }

      // 2. Firestore에 새 글 저장
      await addDoc(collection(db, "posts"), {
        content: content.trim(),
        category,
        authorId: auth.currentUser.uid,
        authorName: userData.nickname || userData.name,
        authorRealName: userData.name,
        authorEmail: userData.email,
        authorProfileImage: userData.profileImage || null, // 🔥 프로필 이미지 추가
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        likes: [], // 🔥 좋아요한 사용자 UID 배열
      });

      // 3. 성공 처리
      setContent("");
      setCategory("일상");
      onPostCreated(); // 부모 컴포넌트에서 피드 새로고침
      onClose(); // 폼 닫기

    } catch (err: any) {
      console.error("글 작성 오류:", err);
      setError("글 작성 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            새 글 작성
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 에러 메시지 */}
          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* 카테고리 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              카테고리
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-colors"
              disabled={isSubmitting}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* 본문 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              내용
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="오럼의 동료들과 나누고 싶은 이야기를 작성해보세요..."
              rows={8}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none transition-colors"
              disabled={isSubmitting}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {content.length} / 1000
            </div>
          </div>

          {/* 이미지 업로드 (추후 구현) */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md p-6 text-center text-gray-500 dark:text-gray-400">
            <Image className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">이미지 업로드 (추후 구현 예정)</p>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              disabled={isSubmitting}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="flex-1 py-3 px-4 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-black font-semibold rounded-md transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent" />
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  글 작성
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}