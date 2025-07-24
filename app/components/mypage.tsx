"use client";

import { useState, useEffect, useRef } from "react";
import { auth, db, storage } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { signOut, updatePassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { 
  User, 
  Mail, 
  Phone, 
  AtSign, 
  Camera, 
  Upload, 
  LogOut, 
  Save,
  Lock,
  Shield,
  Calendar,
  Edit3
} from "lucide-react";

interface UserData {
  uid: string;
  email: string;
  name: string;
  nickname: string;
  phone: string;
  profileImage?: string;
  role: string;
  createdAt: any;
}

export default function MyPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // 편집 필드들
  const [nickname, setNickname] = useState("");
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string>("");
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // 사용자 데이터 로드
  useEffect(() => {
    const loadUserData = async () => {
      if (!auth.currentUser) {
        router.push("/auth/login");
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          const user: UserData = {
            uid: auth.currentUser.uid,
            email: data.email,
            name: data.name,
            nickname: data.nickname,
            phone: data.phone,
            profileImage: data.profileImage,
            role: data.role,
            createdAt: data.createdAt,
          };
          
          setUserData(user);
          setNickname(user.nickname);
          setPhone(user.phone);
          setProfilePreview(user.profileImage || "");
        }
      } catch (error) {
        console.error("사용자 데이터 로드 오류:", error);
        setError("사용자 정보를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [router]);

  // 프로필 이미지 선택
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("프로필 사진은 5MB 이하만 업로드 가능합니다.");
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError("이미지 파일만 업로드 가능합니다.");
        return;
      }

      setProfileImage(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 프로필 업데이트
  const handleSave = async () => {
    if (!userData || !auth.currentUser) return;

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      // 닉네임 유효성 검사
      if (nickname.length < 2 || nickname.length > 10) {
        setError("닉네임은 2-10자 사이여야 합니다.");
        setSaving(false);
        return;
      }

      // 비밀번호 유효성 검사
      if (newPassword && newPassword !== passwordConfirm) {
        setError("비밀번호가 일치하지 않습니다.");
        setSaving(false);
        return;
      }

      if (newPassword && newPassword.length < 6) {
        setError("비밀번호는 6자 이상이어야 합니다.");
        setSaving(false);
        return;
      }

      // 프로필 이미지 업로드
      let profileImageURL = userData.profileImage;
      if (profileImage) {
        const imageRef = ref(storage, `profiles/${userData.uid}/${Date.now()}_${profileImage.name}`);
        const snapshot = await uploadBytes(imageRef, profileImage);
        profileImageURL = await getDownloadURL(snapshot.ref);
      }

      // Firestore 업데이트
      const updateData: any = {
        nickname,
        phone,
      };

      if (profileImageURL) {
        updateData.profileImage = profileImageURL;
      }

      await updateDoc(doc(db, "users", userData.uid), updateData);

      // 비밀번호 변경
      if (newPassword) {
        await updatePassword(auth.currentUser, newPassword);
      }

      // 상태 업데이트
      setUserData(prev => prev ? {
        ...prev,
        nickname,
        phone,
        profileImage: profileImageURL,
      } : null);

      setSuccess("프로필이 성공적으로 업데이트되었습니다!");
      setEditing(false);
      setNewPassword("");
      setPasswordConfirm("");
      setProfileImage(null);

    } catch (error: any) {
      console.error("프로필 업데이트 오류:", error);
      setError(error.message || "프로필 업데이트에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  // 로그아웃
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/auth/login");
    } catch (error) {
      console.error("로그아웃 오류:", error);
      setError("로그아웃에 실패했습니다.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-yellow-400 border-t-transparent"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">사용자 정보를 찾을 수 없습니다.</p>
          <button 
            onClick={() => router.push("/auth/login")}
            className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-md"
          >
            로그인 페이지로
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">마이 페이지</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">프로필 정보를 관리하세요</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            <LogOut className="h-4 w-4" />
            로그아웃
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* 프로필 카드 */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center">
              {/* 프로필 이미지 */}
              <div className="relative inline-block mb-4">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-yellow-400">
                  {profilePreview ? (
                    <img 
                      src={profilePreview} 
                      alt="프로필" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-yellow-400 flex items-center justify-center text-black font-bold text-4xl">
                      {userData.nickname[0].toUpperCase()}
                    </div>
                  )}
                </div>
                {editing && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 bg-yellow-400 hover:bg-yellow-500 p-2 rounded-full transition-colors"
                  >
                    <Camera className="h-4 w-4 text-black" />
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>

              {/* 기본 정보 */}
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                {userData.nickname}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-2">{userData.name}</p>
              
              {/* 상태 배지 */}
              <div className="flex justify-center">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                  userData.role === "approved" 
                    ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400"
                    : "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400"
                }`}>
                  <Shield className="h-3 w-3" />
                  {userData.role === "approved" ? "승인됨" : "승인 대기"}
                </span>
              </div>
            </div>
          </div>

          {/* 정보 수정 폼 */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              {/* 에러/성공 메시지 */}
              {error && (
                <div className="mb-4 text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="mb-4 text-green-600 text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                  {success}
                </div>
              )}

              {/* 편집 모드 토글 */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">계정 정보</h3>
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-md transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                    편집
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditing(false);
                        setNickname(userData.nickname);
                        setPhone(userData.phone);
                        setNewPassword("");
                        setPasswordConfirm("");
                        setProfileImage(null);
                        setProfilePreview(userData.profileImage || "");
                        setError("");
                      }}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 text-black px-4 py-2 rounded-md transition-colors"
                    >
                      <Save className="h-4 w-4" />
                      {saving ? "저장 중..." : "저장"}
                    </button>
                  </div>
                )}
              </div>

              {/* 정보 필드들 */}
              <div className="space-y-4">
                {/* 이메일 (읽기 전용) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    이메일
                  </label>
                  <div className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800">
                    <Mail className="h-5 w-5 mr-3 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">{userData.email}</span>
                  </div>
                </div>

                {/* 실명 (읽기 전용) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    실명
                  </label>
                  <div className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800">
                    <User className="h-5 w-5 mr-3 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">{userData.name}</span>
                  </div>
                </div>

                {/* 닉네임 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    닉네임
                  </label>
                  <div className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800">
                    <AtSign className="h-5 w-5 mr-3 text-gray-400" />
                    {editing ? (
                      <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="w-full bg-transparent focus:outline-none text-gray-900 dark:text-white"
                        placeholder="닉네임"
                      />
                    ) : (
                      <span className="text-gray-900 dark:text-white">{userData.nickname}</span>
                    )}
                  </div>
                </div>

                {/* 휴대폰 번호 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    휴대폰 번호
                  </label>
                  <div className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800">
                    <Phone className="h-5 w-5 mr-3 text-gray-400" />
                    {editing ? (
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-transparent focus:outline-none text-gray-900 dark:text-white"
                        placeholder="휴대폰 번호"
                      />
                    ) : (
                      <span className="text-gray-900 dark:text-white">{userData.phone}</span>
                    )}
                  </div>
                </div>

                {/* 비밀번호 변경 (편집 모드에서만) */}
                {editing && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        새 비밀번호 (선택사항)
                      </label>
                      <div className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800">
                        <Lock className="h-5 w-5 mr-3 text-gray-400" />
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-transparent focus:outline-none text-gray-900 dark:text-white"
                          placeholder="새 비밀번호 (6자 이상)"
                        />
                      </div>
                    </div>

                    {newPassword && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          비밀번호 확인
                        </label>
                        <div className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800">
                          <Lock className="h-5 w-5 mr-3 text-gray-400" />
                          <input
                            type="password"
                            value={passwordConfirm}
                            onChange={(e) => setPasswordConfirm(e.target.value)}
                            className="w-full bg-transparent focus:outline-none text-gray-900 dark:text-white"
                            placeholder="비밀번호 확인"
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* 가입일 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    가입일
                  </label>
                  <div className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800">
                    <Calendar className="h-5 w-5 mr-3 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {userData.createdAt?.toDate ? 
                        userData.createdAt.toDate().toLocaleDateString('ko-KR') :
                        '정보 없음'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}