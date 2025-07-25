"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { X, Send, AlertCircle, User, Building, Mail, Phone, Lock, Eye, EyeOff } from "lucide-react";

interface NewWonderFormProps {
  isOpen: boolean;
  onClose: () => void;
  onWonderCreated: () => void;
}

export default function NewWonderForm({ isOpen, onClose, onWonderCreated }: NewWonderFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "일반문의",
    authorName: "",
    authorEmail: "",
    authorPhone: "",
    company: "",
    isPublic: true,
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const categories = [
    "일반문의",
    "서비스문의", 
    "기술지원",
    "파트너십",
    "채용문의",
    "기타"
  ];

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 공개로 변경 시 비밀번호 초기화
    if (field === "isPublic" && value === true) {
      setFormData(prev => ({
        ...prev,
        password: ""
      }));
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError("제목을 입력해주세요.");
      return false;
    }
    if (!formData.content.trim()) {
      setError("문의 내용을 입력해주세요.");
      return false;
    }
    if (!formData.authorName.trim()) {
      setError("성함을 입력해주세요.");
      return false;
    }
    if (!formData.authorEmail.trim()) {
      setError("이메일을 입력해주세요.");
      return false;
    }
    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.authorEmail)) {
      setError("올바른 이메일 형식을 입력해주세요.");
      return false;
    }
    // 비공개 문의 시 비밀번호 필수
    if (!formData.isPublic && !formData.password.trim()) {
      setError("비공개 문의의 경우 비밀번호를 설정해주세요.");
      return false;
    }
    // 비밀번호 길이 검증
    if (!formData.isPublic && formData.password.length < 4) {
      setError("비밀번호는 최소 4자 이상이어야 합니다.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("🚀 폼 제출 시작");
    console.log("📝 폼 데이터:", formData);
    
    if (!validateForm()) {
      console.log("❌ 폼 검증 실패");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Firebase 연결 확인
      console.log("🔥 Firebase db 객체:", db);
      
      if (!db) {
        throw new Error("Firebase 초기화되지 않음");
      }

      // 저장할 데이터 준비
      const wonderData: any = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        authorName: formData.authorName.trim(),
        authorEmail: formData.authorEmail.trim(),
        authorPhone: formData.authorPhone.trim() || null,
        company: formData.company.trim() || null,
        isPublic: formData.isPublic,
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // 비공개 문의의 경우 비밀번호 추가
      if (!formData.isPublic) {
        wonderData.password = formData.password.trim();
      }

      console.log("💾 저장할 데이터:", wonderData);

      // Firestore 컬렉션 참조 생성
      const wondersCollection = collection(db, "wonders");
      console.log("📁 컬렉션 참조:", wondersCollection);

      // 문서 추가
      console.log("⏳ Firestore에 문서 추가 중...");
      const docRef = await addDoc(wondersCollection, wonderData);
      
      console.log("✅ 문서 추가 성공! ID:", docRef.id);

      // 성공 처리
      setFormData({
        title: "",
        content: "",
        category: "일반문의",
        authorName: "",
        authorEmail: "",
        authorPhone: "",
        company: "",
        isPublic: true,
        password: "",
      });
      
      console.log("🎉 폼 초기화 완료");
      
      // 콜백 실행
      onWonderCreated();
      onClose();
      
      // 성공 알림
      const message = formData.isPublic 
        ? "문의가 성공적으로 등록되었습니다. 빠른 시일 내에 답변드리겠습니다."
        : "비공개 문의가 성공적으로 등록되었습니다. 설정하신 비밀번호로 문의 내용을 확인하실 수 있습니다.";
      
      alert(message);
      console.log("📧 성공 알림 표시 완료");

    } catch (err: any) {
      console.error("💥 문의 등록 오류:", err);
      console.error("🔍 오류 상세:", {
        name: err.name,
        message: err.message,
        code: err.code,
        stack: err.stack
      });
      
      // 사용자에게 더 자세한 오류 정보 제공
      let errorMessage = "문의 등록 중 오류가 발생했습니다.";
      
      if (err.code === 'permission-denied') {
        errorMessage += " (권한 오류: Firestore 보안 규칙을 확인해주세요)";
      } else if (err.code === 'unavailable') {
        errorMessage += " (네트워크 오류: 인터넷 연결을 확인해주세요)";
      } else if (err.code === 'unauthenticated') {
        errorMessage += " (인증 오류: Firebase 설정을 확인해주세요)";
      } else if (err.message) {
        errorMessage += ` (${err.message})`;
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
      console.log("🏁 제출 프로세스 완료");
    }
  };

  // 폼이 열려있지 않으면 렌더링하지 않음
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            궁금한 점 문의하기
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Firebase 연결 상태 디버그 정보 (개발 환경에서만 표시) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm">
              <p className="text-blue-700 dark:text-blue-300">
                🔧 디버그 정보: Firebase DB 연결 상태 - {db ? "✅ 연결됨" : "❌ 연결 안됨"}
              </p>
            </div>
          )}

          {/* 에러 메시지 */}
          {error && (
            <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <div className="whitespace-pre-wrap">{error}</div>
            </div>
          )}

          {/* 개인정보 섹션 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User className="inline h-4 w-4 mr-1" />
                성함 *
              </label>
              <input
                type="text"
                value={formData.authorName}
                onChange={(e) => handleInputChange("authorName", e.target.value)}
                placeholder="이름을 입력하세요"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                disabled={isSubmitting}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Mail className="inline h-4 w-4 mr-1" />
                이메일 *
              </label>
              <input
                type="email"
                value={formData.authorEmail}
                onChange={(e) => handleInputChange("authorEmail", e.target.value)}
                placeholder="이메일을 입력하세요"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                disabled={isSubmitting}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Phone className="inline h-4 w-4 mr-1" />
                연락처
              </label>
              <input
                type="tel"
                value={formData.authorPhone}
                onChange={(e) => handleInputChange("authorPhone", e.target.value)}
                placeholder="연락처를 입력하세요"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Building className="inline h-4 w-4 mr-1" />
                회사명
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => handleInputChange("company", e.target.value)}
                placeholder="회사명을 입력하세요"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* 문의 정보 섹션 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                문의 분야 *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                disabled={isSubmitting}
                required
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                문의 제목 *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="문의 제목을 입력하세요"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                disabled={isSubmitting}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                문의 내용 *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => handleInputChange("content", e.target.value)}
                placeholder="궁금한 점이나 문의사항을 자세히 작성해주세요..."
                rows={8}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none"
                disabled={isSubmitting}
                required
                maxLength={2000}
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {formData.content.length} / 2000
              </div>
            </div>

            {/* 공개 설정 */}
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  문의 공개 설정
                </h3>
                
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      checked={formData.isPublic}
                      onChange={() => handleInputChange("isPublic", true)}
                      className="mt-1 w-4 h-4 text-yellow-400 bg-gray-100 border-gray-300 focus:ring-yellow-400 dark:focus:ring-yellow-400 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      disabled={isSubmitting}
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        공개 문의
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        다른 사용자도 문의 내용을 볼 수 있습니다. (개인정보는 표시되지 않습니다)
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      checked={!formData.isPublic}
                      onChange={() => handleInputChange("isPublic", false)}
                      className="mt-1 w-4 h-4 text-yellow-400 bg-gray-100 border-gray-300 focus:ring-yellow-400 dark:focus:ring-yellow-400 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      disabled={isSubmitting}
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        비공개 문의
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        비밀번호를 설정하여 본인만 확인할 수 있습니다
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* 비공개 문의 시 비밀번호 입력 */}
              {!formData.isPublic && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                    <Lock className="inline h-4 w-4 mr-1" />
                    비공개 문의 비밀번호 *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      placeholder="비밀번호를 입력하세요 (최소 4자)"
                      className="w-full p-3 pr-12 border border-blue-300 dark:border-blue-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      disabled={isSubmitting}
                      minLength={4}
                      required={!formData.isPublic}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      disabled={isSubmitting}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                    💡 이 비밀번호로 나중에 문의 내용과 답변을 확인하실 수 있습니다.
                  </p>
                </div>
              )}
            </div>
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
              disabled={isSubmitting || !formData.title.trim() || !formData.content.trim() || !formData.authorName.trim() || !formData.authorEmail.trim()}
              className="flex-1 py-3 px-4 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-black font-semibold rounded-md transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent" />
                  등록 중...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  문의 등록
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}