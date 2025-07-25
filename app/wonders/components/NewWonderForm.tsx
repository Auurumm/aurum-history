"use client";

import { useState, useRef } from "react";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { X, Send, AlertCircle, User, Building, Mail, Phone, Lock, Eye, EyeOff, Upload, Image as ImageIcon, Trash2 } from "lucide-react";

interface NewWonderFormProps {
  isOpen: boolean;
  onClose: () => void;
  onWonderCreated: () => void;
}

interface UploadedImage {
  file: File;
  url: string;
  id: string;
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
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    
    if (field === "isPublic" && value === true) {
      setFormData(prev => ({
        ...prev,
        password: ""
      }));
    }
  };

  // 이미지 업로드 처리
  const handleImageUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;

    // 최대 5개 이미지 제한
    if (uploadedImages.length + files.length > 5) {
      setError("이미지는 최대 5개까지 업로드할 수 있습니다.");
      return;
    }

    setIsUploadingImage(true);
    setError("");

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // 파일 크기 검증 (5MB 제한)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name}은(는) 5MB를 초과합니다.`);
        }

        // 파일 타입 검증
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name}은(는) 이미지 파일이 아닙니다.`);
        }

        // 고유한 파일명 생성
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 15);
        const fileExtension = file.name.split('.').pop();
        const fileName = `wonder-images/${timestamp}-${randomId}.${fileExtension}`;

        // Firebase Storage에 업로드
        const storageRef = ref(storage, fileName);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        return {
          file,
          url: downloadURL,
          id: fileName,
        };
      });

      const newImages = await Promise.all(uploadPromises);
      setUploadedImages(prev => [...prev, ...newImages]);

    } catch (error: any) {
      console.error("이미지 업로드 오류:", error);
      setError(error.message || "이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // 이미지 삭제
  const handleImageDelete = async (imageId: string) => {
    try {
      // Firebase Storage에서 삭제
      const storageRef = ref(storage, imageId);
      await deleteObject(storageRef);

      // 상태에서 제거
      setUploadedImages(prev => prev.filter(img => img.id !== imageId));
    } catch (error) {
      console.error("이미지 삭제 오류:", error);
      // Storage에서 삭제 실패해도 UI에서는 제거
      setUploadedImages(prev => prev.filter(img => img.id !== imageId));
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.authorEmail)) {
      setError("올바른 이메일 형식을 입력해주세요.");
      return false;
    }
    if (!formData.isPublic && !formData.password.trim()) {
      setError("비공개 문의의 경우 비밀번호를 설정해주세요.");
      return false;
    }
    if (!formData.isPublic && formData.password.length < 4) {
      setError("비밀번호는 최소 4자 이상이어야 합니다.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError("");

    try {
      if (!db) {
        throw new Error("Firebase 초기화되지 않음");
      }

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
        images: uploadedImages.map(img => ({
          url: img.url,
          fileName: img.file.name,
          storageId: img.id,
        })), // 업로드된 이미지 정보 저장
      };

      if (!formData.isPublic) {
        wonderData.password = formData.password.trim();
      }

      const wondersCollection = collection(db, "wonders");
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
      setUploadedImages([]);
      
      onWonderCreated();
      onClose();
      
      const message = formData.isPublic 
        ? "문의가 성공적으로 등록되었습니다. 빠른 시일 내에 답변드리겠습니다."
        : "비공개 문의가 성공적으로 등록되었습니다. 설정하신 비밀번호로 문의 내용을 확인하실 수 있습니다.";
      
      alert(message);

    } catch (err: any) {
      console.error("💥 문의 등록 오류:", err);
      
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
    }
  };

  // 폼 닫기 시 업로드된 이미지 정리
  const handleClose = async () => {
    // 업로드된 이미지가 있다면 삭제 확인
    if (uploadedImages.length > 0) {
      const confirmed = confirm("업로드된 이미지가 있습니다. 정말로 취소하시겠습니까?");
      if (!confirmed) return;

      // 업로드된 이미지들을 Storage에서 삭제
      try {
        await Promise.all(
          uploadedImages.map(img => deleteObject(ref(storage, img.id)))
        );
      } catch (error) {
        console.error("이미지 정리 오류:", error);
      }
    }

    setUploadedImages([]);
    onClose();
  };

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
            onClick={handleClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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

            {/* 이미지 업로드 섹션 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <ImageIcon className="inline h-4 w-4 mr-1" />
                첨부 이미지 (선택사항)
              </label>
              
              {/* 이미지 업로드 버튼 */}
              <div className="mb-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                  className="hidden"
                  disabled={isSubmitting || isUploadingImage || uploadedImages.length >= 5}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting || isUploadingImage || uploadedImages.length >= 5}
                  className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-yellow-400 dark:hover:border-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full justify-center"
                >
                  {isUploadingImage ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-yellow-400 border-t-transparent" />
                      이미지 업로드 중...
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        이미지 선택 (최대 5개, 각각 5MB 이하)
                      </span>
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  지원 형식: JPG, PNG, GIF, WebP | 현재 업로드: {uploadedImages.length}/5개
                </p>
              </div>

              {/* 업로드된 이미지 미리보기 */}
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {uploadedImages.map((image, index) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.url}
                        alt={`업로드된 이미지 ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                      />
                      <button
                        type="button"
                        onClick={() => handleImageDelete(image.id)}
                        className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={isSubmitting}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                      <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-2 py-1 rounded">
                        {image.file.name.length > 15 
                          ? `${image.file.name.substring(0, 15)}...` 
                          : image.file.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
              onClick={handleClose}
              className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              disabled={isSubmitting}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploadingImage || !formData.title.trim() || !formData.content.trim() || !formData.authorName.trim() || !formData.authorEmail.trim()}
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