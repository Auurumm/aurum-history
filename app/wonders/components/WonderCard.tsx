"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { MessageSquare, Building, Clock, CheckCircle, X, Maximize2, User, ChevronLeft, ChevronRight, Lock, Eye, EyeOff, AlertCircle, Edit, Trash2, MoreHorizontal, AlertTriangle } from "lucide-react";

interface WonderImage {
  url: string;
  fileName: string;
  storageId: string;
}

interface WonderCardProps {
  wonder: {
    id: string;
    title: string;
    content: string;
    category: string;
    authorName: string;
    authorEmail: string;
    company?: string;
    status: "pending" | "answered" | "closed";
    date: string;
    adminReply?: string;
    adminReplyAt?: string | null;
    images?: WonderImage[];
    isPublic: boolean;
  };
}

export default function WonderCard({ wonder }: WonderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  
  // 비공개 문의 확인 관련 상태
  const [isPrivateUnlocked, setIsPrivateUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  // 작성자 인증 관련 상태
  const [isAuthorVerified, setIsAuthorVerified] = useState(false);
  const [showAuthorVerification, setShowAuthorVerification] = useState(false);
  const [verificationPassword, setVerificationPassword] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // 수정/삭제 관련 상태
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(wonder.title);
  const [editContent, setEditContent] = useState(wonder.content);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // 비공개 문의인지 확인
  const isPrivate = !wonder.isPublic;
  const canViewContent = !isPrivate || isPrivateUnlocked;

  // 메뉴 표시 여부 (작성자 본인 확인 완료 시에만)
  const canShowMenu = isAuthorVerified;

  // 작성자 본인 확인 (비밀번호 기반)
  const handleAuthorVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationPassword.trim()) {
      setVerificationError("비밀번호를 입력해주세요.");
      return;
    }

    setIsVerifying(true);
    setVerificationError("");

    try {
      // 작성자 이메일과 비밀번호로 확인
      const q = query(
        collection(db, "wonders"),
        where("id", "==", wonder.id),
        where("authorEmail", "==", wonder.authorEmail),
        where("password", "==", verificationPassword.trim())
      );

      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        setVerificationError("비밀번호가 올바르지 않습니다.");
        return;
      }

      // 작성자 확인 완료
      setIsAuthorVerified(true);
      setShowAuthorVerification(false);
      setVerificationPassword("");
      setVerificationError("");

      // 비공개 문의의 경우 내용도 함께 해제
      if (isPrivate) {
        setIsPrivateUnlocked(true);
      }

    } catch (error) {
      console.error("작성자 확인 오류:", error);
      setVerificationError("확인 중 오류가 발생했습니다.");
    } finally {
      setIsVerifying(false);
    }
  };

  // 비공개 문의 비밀번호 확인
  const handlePasswordCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) {
      setPasswordError("비밀번호를 입력해주세요.");
      return;
    }

    setIsChecking(true);
    setPasswordError("");

    try {
      const q = query(
        collection(db, "wonders"),
        where("id", "==", wonder.id),
        where("authorEmail", "==", wonder.authorEmail),
        where("password", "==", passwordInput.trim())
      );

      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        setPasswordError("비밀번호가 올바르지 않습니다.");
        return;
      }

      // 비밀번호가 맞으면 잠금 해제 및 작성자 인증
      setIsPrivateUnlocked(true);
      setIsAuthorVerified(true); // 비밀번호 확인했으므로 작성자로 인증
      setShowPasswordInput(false);
      setPasswordInput("");
      setPasswordError("");

    } catch (error) {
      console.error("비공개 문의 확인 오류:", error);
      setPasswordError("확인 중 오류가 발생했습니다.");
    } finally {
      setIsChecking(false);
    }
  };

  // 수정 기능
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim() || !editContent.trim()) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    if (!isAuthorVerified) {
      alert("작성자 본인만 수정할 수 있습니다.");
      return;
    }

    setIsUpdating(true);
    try {
      await updateDoc(doc(db, "wonders", wonder.id), {
        title: editTitle.trim(),
        content: editContent.trim(),
        updatedAt: serverTimestamp(),
      });
      
      setIsEditing(false);
      setShowMenu(false);
      alert("문의가 수정되었습니다.");
    } catch (error) {
      console.error("문의 수정 오류:", error);
      alert("문의 수정 중 오류가 발생했습니다.");
    } finally {
      setIsUpdating(false);
    }
  };

  // 삭제 기능
  const handleDelete = async () => {
    if (!isAuthorVerified) {
      alert("작성자 본인만 삭제할 수 있습니다.");
      return;
    }

    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "wonders", wonder.id));
      setShowDeleteConfirm(false);
      alert("문의가 삭제되었습니다.");
    } catch (error) {
      console.error("문의 삭제 오류:", error);
      alert("문의 삭제 중 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  // 수정 취소
  const handleCancelEdit = () => {
    setEditTitle(wonder.title);
    setEditContent(wonder.content);
    setIsEditing(false);
    setShowMenu(false);
  };

  // 메뉴 버튼 클릭 시 작성자 확인
  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isAuthorVerified) {
      setShowAuthorVerification(true);
      return;
    }
    
    setShowMenu(!showMenu);
  };

  // 상태별 스타일 및 텍스트
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "answered":
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          text: "답변완료",
          className: "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
        };
      case "closed":
        return {
          icon: <X className="h-4 w-4" />,
          text: "해결완료",
          className: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700"
        };
      default:
        return {
          icon: <Clock className="h-4 w-4" />,
          text: "답변대기",
          className: "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800"
        };
    }
  };

  const statusInfo = getStatusInfo(wonder.status);

  // 카드 클릭 시 모달 열기
  const handleCardClick = (e: React.MouseEvent) => {
    // 버튼 클릭은 모달 열지 않음
    if ((e.target as HTMLElement).closest('button')) return;
    if ((e.target as HTMLElement).closest('input')) return;
    if ((e.target as HTMLElement).closest('textarea')) return;
    
    // 수정 모드일 때는 모달 열지 않음
    if (isEditing) return;
    
    // 비공개 문의이고 잠금 해제되지 않았으면 비밀번호 입력 표시
    if (isPrivate && !isPrivateUnlocked) {
      setShowPasswordInput(true);
      return;
    }
    
    setIsExpanded(true);
  };

  // 이미지 네비게이션
  const nextImage = () => {
    if (wonder.images && wonder.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % wonder.images!.length);
    }
  };

  const prevImage = () => {
    if (wonder.images && wonder.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + wonder.images!.length) % wonder.images!.length);
    }
  };

  // 이미지 갤러리 컴포넌트
  const ImageGallery = ({ images, compact = false }: { images: WonderImage[], compact?: boolean }) => {
    if (!images || images.length === 0) return null;

    if (compact) {
      // 컴팩트 모드: 최대 3개 이미지만 보여주고 더 있으면 +N 표시
      const displayImages = images.slice(0, 3);
      const remainingCount = images.length - 3;

      return (
        <div className="flex gap-2 mb-4 flex-wrap">
          {displayImages.map((image, index) => (
            <div
              key={index}
              className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 cursor-pointer hover:opacity-80 transition-opacity"
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
            </div>
          ))}
          {remainingCount > 0 && (
            <div 
              className="w-20 h-20 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 flex items-center justify-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setIsExpanded(true)}
            >
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                +{remainingCount}
              </span>
            </div>
          )}
        </div>
      );
    }

    // 전체 모드: 모든 이미지를 그리드로 표시
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        {images.map((image, index) => (
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
              <Maximize2 className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ))}
      </div>
    );
  };

  // 이미지 모달 컴포넌트
  const ImageModal = () => {
    if (!isImageModalOpen || !wonder.images || wonder.images.length === 0) return null;

    const currentImage = wonder.images[currentImageIndex];

    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4">
        <div className="relative max-w-4xl max-h-full">
          {/* 닫기 버튼 */}
          <button
            onClick={() => setIsImageModalOpen(false)}
            className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
          >
            <X className="h-6 w-6" />
          </button>

          {/* 이전/다음 버튼 */}
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

          {/* 이미지 */}
          <img
            src={currentImage.url}
            alt={currentImage.fileName}
            className="max-w-full max-h-full object-contain"
          />

          {/* 이미지 정보 */}
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

  // 컴팩트 카드 컴포넌트
  const CompactCard = () => (
    <div 
      onClick={handleCardClick}
      className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer group"
    >
      {/* 문의 헤더 */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-black font-bold text-lg flex-shrink-0">
          {wonder.authorName?.[0]?.toUpperCase() || "?"}
        </div>
        
        <div className="flex-1 min-w-0">
          {/* 제목 부분 - 수정 모드일 때 변경 */}
          <div className="flex items-center gap-3 mb-2">
            {isEditing ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="flex-1 text-lg font-bold bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-gray-900 dark:text-white"
                placeholder="제목을 입력하세요"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">
                {wonder.title}
              </h3>
            )}
            
            <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusInfo.className}`}>
              {statusInfo.icon}
              {statusInfo.text}
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {wonder.authorName}
            </div>
            {wonder.company && (
              <div className="flex items-center gap-1">
                <Building className="h-3 w-3" />
                {wonder.company}
              </div>
            )}
            <span>{wonder.date}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full border border-blue-200 dark:border-blue-800">
              {wonder.category}
            </span>
            {isPrivate && (
              <span className="text-xs bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 px-2 py-1 rounded-full border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                <Lock className="h-3 w-3" />
                비공개
              </span>
            )}
            {wonder.images && wonder.images.length > 0 && (
              <span className="text-xs bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 px-2 py-1 rounded-full border border-purple-200 dark:border-purple-800">
                📷 {wonder.images.length}개
              </span>
            )}
          </div>
        </div>

        {/* 메뉴 버튼 (항상 표시하되, 작성자 확인 후 기능 활성화) */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={handleMenuClick}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              title={!isAuthorVerified ? "작성자 확인이 필요합니다" : "메뉴"}
            >
              <MoreHorizontal className="h-4 w-4 text-gray-500" />
            </button>
            
            {showMenu && isAuthorVerified && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-20">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(true);
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Edit className="h-3 w-3" />
                    수정
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteConfirm(true);
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Trash2 className="h-3 w-3" />
                    삭제
                  </button>
                </div>
              </>
            )}
          </div>
          
          <Maximize2 className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
        </div>
      </div>

      {/* 이미지 갤러리 (컴팩트 모드) */}
      {canViewContent && wonder.images && <ImageGallery images={wonder.images} compact />}

      {/* 문의 내용 미리보기 */}
      <div className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
        {isEditing ? (
          <div onClick={(e) => e.stopPropagation()}>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
              rows={6}
              placeholder="내용을 입력하세요"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">
                {editContent.length} / 1000
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-700 text-sm rounded-md transition-colors"
                  disabled={isUpdating}
                >
                  취소
                </button>
                <button
                  onClick={handleEdit}
                  disabled={isUpdating || !editTitle.trim() || !editContent.trim()}
                  className="px-3 py-1 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-black text-sm rounded-md transition-colors flex items-center gap-1"
                >
                  {isUpdating ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-2 border-black border-t-transparent" />
                      저장 중
                    </>
                  ) : (
                    "저장"
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : canViewContent ? (
          <div 
            className="overflow-hidden"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {wonder.content}
          </div>
        ) : (
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center">
            <Lock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              비공개 문의입니다
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
              작성자만 내용을 확인할 수 있습니다
            </p>
          </div>
        )}
      </div>

      {/* 답변 상태 */}
      {canViewContent && wonder.adminReply && (
        <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">
              관리자 답변 ({wonder.adminReplyAt})
            </span>
          </div>
          <div 
            className="text-sm text-green-800 dark:text-green-300 overflow-hidden"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {wonder.adminReply}
          </div>
        </div>
      )}
    </div>
  );

  // 확장 모달 컴포넌트
  const ExpandedModal = () => (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-[50] p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">궁금해요 상세보기</h2>
          <button
            onClick={() => setIsExpanded(false)}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* 문의자 정보 */}
          <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-black font-bold text-xl">
              {wonder.authorName?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {wonder.authorName}
                </h3>
                <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${statusInfo.className}`}>
                  {statusInfo.icon}
                  {statusInfo.text}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                {wonder.company && (
                  <div className="flex items-center gap-1">
                    <Building className="h-4 w-4" />
                    {wonder.company}
                  </div>
                )}
                <span>{wonder.date}</span>
                <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full">
                  {wonder.category}
                </span>
                {isPrivate && (
                  <span className="bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 px-2 py-1 rounded-full flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    비공개
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 문의 제목 */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {wonder.title}
          </h1>

          {/* 문의 내용 */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              문의 내용
              {isPrivate && (
                <span className="text-sm bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 px-2 py-1 rounded-full flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  비공개
                </span>
              )}
            </h2>
            
            {canViewContent ? (
              <>
                <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed mb-4">
                  {wonder.content}
                </div>
                
                {/* 이미지 갤러리 (전체 모드) */}
                {wonder.images && <ImageGallery images={wonder.images} />}
              </>
            ) : (
              <div className="bg-gray-100 dark:bg-gray-700 p-8 rounded-lg text-center">
                <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-2">
                  비공개 문의입니다
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mb-4">
                  작성자만 내용을 확인할 수 있습니다
                </p>
                <button
                  onClick={() => setShowPasswordInput(true)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm transition-colors"
                >
                  비밀번호로 확인하기
                </button>
              </div>
            )}
          </div>

          {/* 관리자 답변 */}
          {canViewContent ? (
            wonder.adminReply ? (
              <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-green-700 dark:text-green-400 mb-3 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  관리자 답변
                  {wonder.adminReplyAt && (
                    <span className="text-sm font-normal text-green-600 dark:text-green-500">
                      ({wonder.adminReplyAt})
                    </span>
                  )}
                </h2>
                <div className="text-green-800 dark:text-green-300 whitespace-pre-wrap leading-relaxed">
                  {wonder.adminReply}
                </div>
              </div>
            ) : (
              <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-lg p-6 text-center">
                <Clock className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <p className="text-orange-700 dark:text-orange-400 font-medium">
                  답변을 준비 중입니다
                </p>
                <p className="text-sm text-orange-600 dark:text-orange-500 mt-1">
                  빠른 시일 내에 답변드리겠습니다
                </p>
              </div>
            )
          ) : (
            <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg text-center">
              <Lock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400">
                답변을 확인하려면 비밀번호가 필요합니다
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <CompactCard />
      {isExpanded && <ExpandedModal />}
      <ImageModal />
      
      {/* 작성자 본인 확인 모달 */}
      {showAuthorVerification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <User className="h-5 w-5" />
                  작성자 본인 확인
                </h2>
                <button
                  onClick={() => {
                    setShowAuthorVerification(false);
                    setVerificationPassword("");
                    setVerificationError("");
                  }}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={handleAuthorVerification} className="space-y-4">
                {verificationError && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {verificationError}
                  </div>
                )}

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <h3 className="font-medium text-yellow-700 dark:text-yellow-300 mb-2">
                    📋 {wonder.title}
                  </h3>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    작성자: {wonder.authorName} | {wonder.date}
                  </p>
                  <p className="text-xs text-yellow-500 dark:text-yellow-500 mt-2">
                    본인이 작성한 문의가 맞다면 등록 시 설정한 비밀번호를 입력하세요.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    문의 등록 시 설정한 비밀번호
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={verificationPassword}
                      onChange={(e) => setVerificationPassword(e.target.value)}
                      className="w-full p-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      placeholder="비밀번호 입력"
                      required
                      disabled={isVerifying}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      disabled={isVerifying}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAuthorVerification(false);
                      setVerificationPassword("");
                      setVerificationError("");
                    }}
                    className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    disabled={isVerifying}
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={isVerifying || !verificationPassword.trim()}
                    className="flex-1 py-3 px-4 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-md transition-colors flex items-center justify-center gap-2"
                  >
                    {isVerifying ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        확인 중...
                      </>
                    ) : (
                      <>
                        <User className="h-4 w-4" />
                        본인 확인
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* 비공개 문의 비밀번호 입력 모달 */}
      {showPasswordInput && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  비공개 문의 확인
                </h2>
                <button
                  onClick={() => {
                    setShowPasswordInput(false);
                    setPasswordInput("");
                    setPasswordError("");
                  }}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={handlePasswordCheck} className="space-y-4">
                {passwordError && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {passwordError}
                  </div>
                )}

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-700 dark:text-blue-300 mb-2">
                    📋 {wonder.title}
                  </h3>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    작성자: {wonder.authorName} | {wonder.date}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    문의 등록 시 설정한 비밀번호를 입력하세요
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full p-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                      placeholder="비밀번호 입력"
                      required
                      disabled={isChecking}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      disabled={isChecking}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordInput(false);
                      setPasswordInput("");
                      setPasswordError("");
                    }}
                    className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    disabled={isChecking}
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={isChecking || !passwordInput.trim()}
                    className="flex-1 py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-md transition-colors flex items-center justify-center gap-2"
                  >
                    {isChecking ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        확인 중...
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4" />
                        확인
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">문의 삭제</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">이 작업은 되돌릴 수 없습니다.</p>
                </div>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                정말로 이 문의를 삭제하시겠습니까?<br />
                삭제된 문의는 복구할 수 없습니다.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  disabled={isDeleting}
                >
                  취소
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-md transition-colors flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      삭제 중...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      삭제하기
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}