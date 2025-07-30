"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Lock, Eye, AlertCircle, CheckCircle, X, ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";

interface PrivateWonderCheckProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WonderImage {
  url: string;
  fileName: string;
  storageId: string;
}

export default function PrivateWonderCheck({ isOpen, onClose }: PrivateWonderCheckProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [wonder, setWonder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const q = query(
        collection(db, "wonders"),
        where("authorEmail", "==", email.trim()),
        where("password", "==", password.trim()),
        where("isPublic", "==", false)
      );

      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        setError("해당하는 비공개 문의를 찾을 수 없습니다. 이메일과 비밀번호를 다시 확인해주세요.");
        return;
      }

      const wonderData = snapshot.docs[0].data();
      setWonder({
        id: snapshot.docs[0].id,
        ...wonderData,
      });

    } catch (error) {
      console.error("비공개 문의 확인 오류:", error);
      setError("문의 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setWonder(null);
    setError("");
  };

  // 이미지 네비게이션
  const nextImage = () => {
    if (wonder.images && wonder.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % wonder.images.length);
    }
  };

  const prevImage = () => {
    if (wonder.images && wonder.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + wonder.images.length) % wonder.images.length);
    }
  };

  // 이미지 모달
  const ImageModal = () => {
    if (!isImageModalOpen || !wonder.images || wonder.images.length === 0) return null;

    const currentImage = wonder.images[currentImageIndex];

    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[70] p-4">
        <div className="relative max-w-4xl max-h-full">
          <button
            onClick={() => setIsImageModalOpen(false)}
            className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
          >
            <X className="h-6 w-6" />
          </button>

          {wonder.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          <img
            src={currentImage.url}
            alt={currentImage.fileName}
            className="max-w-full max-h-full object-contain"
          />

          <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg">
            <p className="text-sm">{currentImage.fileName}</p>
            {wonder.images.length > 1 && (
              <p className="text-xs text-gray-300 mt-1">
                {currentImageIndex + 1} / {wonder.images.length}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Lock className="h-5 w-5" />
                비공개 문의 확인
              </h2>
              <button
                onClick={() => { resetForm(); onClose(); }}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {!wonder ? (
              <form onSubmit={handleCheck} className="space-y-4">
                {error && (
                  <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <div>{error}</div>
                  </div>
                )}

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-700 dark:text-blue-300 mb-2">
                    💡 비공개 문의 확인 방법
                  </h3>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    문의 등록 시 입력한 이메일과 설정한 비밀번호를 입력하시면 문의 내용과 답변을 확인하실 수 있습니다.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    등록시 사용한 이메일 *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="example@domain.com"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    설정한 비밀번호 *
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="비밀번호 입력"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { resetForm(); onClose(); }}
                    className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    disabled={loading}
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !email.trim() || !password.trim()}
                    className="flex-1 py-3 px-4 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-black font-semibold rounded-md transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent" />
                        확인 중...
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4" />
                        문의 확인
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                {/* 문의 확인됨 알림 */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-bold text-blue-700 dark:text-blue-300">
                      문의 확인됨
                    </h3>
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                    <p>등록일: {wonder.createdAt?.toDate?.()?.toLocaleDateString('ko-KR') || '날짜 정보 없음'}</p>
                    {wonder.category && <p>분야: {wonder.category}</p>}
                  </div>
                </div>

                {/* 문의 내용 */}
                <div>
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-3">
                    📝 {wonder.title}
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {wonder.content}
                    </p>
                  </div>

                  {/* 첨부 이미지 */}
                  {wonder.images && wonder.images.length > 0 && (
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                        <ImageIcon className="h-4 w-4" />
                        첨부 이미지 ({wonder.images.length}개)
                      </h5>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {wonder.images.map((image: WonderImage, index: number) => (
                          <div
                            key={index}
                            className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 cursor-pointer hover:opacity-80 transition-opacity group"
                            onClick={() => {
                              setCurrentImageIndex(index);
                              setIsImageModalOpen(true);
                            }}
                          >
                            <img
                              src={image.url}
                              alt={image.fileName}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                              <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 답변 상태 */}
                  <div className="mb-4">
                    {wonder.status === "answered" && wonder.adminReply ? (
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                          <h5 className="font-semibold text-green-700 dark:text-green-400">
                            ✅ 답변 완료
                          </h5>
                          {wonder.adminReplyAt && (
                            <span className="text-sm text-green-600 dark:text-green-500">
                              ({wonder.adminReplyAt.toDate?.()?.toLocaleDateString('ko-KR')})
                            </span>
                          )}
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-md">
                          <p className="text-green-800 dark:text-green-300 whitespace-pre-wrap leading-relaxed">
                            {wonder.adminReply}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-4 rounded-lg text-center">
                        <div className="text-orange-500 text-2xl mb-2">⏳</div>
                        <p className="text-orange-700 dark:text-orange-400 font-medium mb-1">
                          답변 준비 중입니다
                        </p>
                        <p className="text-sm text-orange-600 dark:text-orange-500">
                          빠른 시일 내에 답변드리겠습니다
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 버튼들 */}
                <div className="flex gap-3">
                  <button
                    onClick={resetForm}
                    className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    다른 문의 확인
                  </button>
                  <button
                    onClick={() => { resetForm(); onClose(); }}
                    className="flex-1 py-3 px-4 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-md transition-colors"
                  >
                    닫기
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <ImageModal />
    </>
  );
}