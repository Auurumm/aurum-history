"use client";

import { useState } from "react";
import { auth, db, storage } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { X, Image, Send, AlertCircle, Upload, Trash2 } from "lucide-react";

interface NewPostFormProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

export default function NewPostForm({ isOpen, onClose, onPostCreated }: NewPostFormProps) {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("일상");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const categories = ["일상", "공지", "회사소식", "맛집", "취미", "기타"];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // 파일 크기 검증 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        setError("이미지 크기는 5MB 이하만 가능합니다.");
        return;
      }

      // 파일 타입 검증
      if (!file.type.startsWith('image/')) {
        setError("이미지 파일만 업로드 가능합니다.");
        return;
      }

      setImageFile(file);
      setError("");

      // 미리보기 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageRemove = () => {
    setImageFile(null);
    setImagePreview(null);
    // 파일 input 초기화
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

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
      // 1. 사용자 정보 확인
      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      const userData = userDoc.data();

      if (!userDoc.exists() || userData?.role !== "approved") {
        setError("관리자 승인 후 글 작성이 가능합니다.");
        setIsSubmitting(false);
        return;
      }

      // 2. 이미지 업로드 (있는 경우)
      let imageUrl = null;
      if (imageFile) {
        setIsUploadingImage(true);
        try {
          // ✅ 올바른 Storage 경로: postImages/{userId}/{파일명}
          const timestamp = Date.now();
          const fileExtension = imageFile.name.split('.').pop();
          const fileName = `${timestamp}.${fileExtension}`;
          const storageRef = ref(storage, `postImages/${auth.currentUser.uid}/${fileName}`);
          
          console.log("📤 이미지 업로드 중:", `postImages/${auth.currentUser.uid}/${fileName}`);
          
          const snapshot = await uploadBytes(storageRef, imageFile);
          imageUrl = await getDownloadURL(snapshot.ref);
          
          console.log("✅ 이미지 업로드 성공:", imageUrl);
        } catch (uploadError) {
          console.error("💥 이미지 업로드 오류:", uploadError);
          setError("이미지 업로드 중 오류가 발생했습니다.");
          return;
        } finally {
          setIsUploadingImage(false);
        }
      }

      // 3. Firestore에 게시글 저장
      console.log("💾 게시글 저장 중...");
      
      await addDoc(collection(db, "posts"), {
        content: content.trim(),
        category,
        authorId: auth.currentUser.uid,
        authorName: userData.nickname || userData.name,
        authorRealName: userData.name,
        authorEmail: userData.email,
        authorProfileImage: userData.profileImage || null,
        imageUrl, // 업로드된 이미지 URL (없으면 null)
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        likes: [],
        likesCount: 0, // 초기 좋아요 수
      });

      console.log("✅ 게시글 저장 성공");

      // 4. 성공 처리
      setContent("");
      setCategory("일상");
      setImageFile(null);
      setImagePreview(null);
      onPostCreated();
      onClose();
      
      alert("게시글이 성공적으로 작성되었습니다!");

    } catch (err: any) {
      console.error("💥 글 작성 오류:", err);
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
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">새 글 작성</h2>
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
                <option key={cat} value={cat}>{cat}</option>
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
              maxLength={1000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {content.length} / 1000
            </div>
          </div>

          {/* 이미지 업로드 섹션 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Image className="inline h-4 w-4 mr-1" />
              이미지 첨부 (선택사항)
            </label>
            
            {/* 이미지 미리보기 */}
            {imagePreview ? (
              <div className="relative mb-4">
                <img
                  src={imagePreview}
                  alt="업로드 미리보기"
                  className="w-full max-h-64 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                />
                <button
                  type="button"
                  onClick={handleImageRemove}
                  className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
                  disabled={isSubmitting}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {imageFile?.name}
                </div>
              </div>
            ) : (
              /* 이미지 업로드 버튼 */
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md p-6 text-center">
                <label className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                    이미지를 선택하거나 드래그하세요
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    JPG, PNG, GIF 지원 (최대 5MB)
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={isSubmitting}
                  />
                </label>
              </div>
            )}
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
              disabled={isSubmitting || isUploadingImage || !content.trim()}
              className="flex-1 py-3 px-4 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-black font-semibold rounded-md transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent" />
                  {isUploadingImage ? "이미지 업로드 중..." : "글 작성 중..."}
                </>
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