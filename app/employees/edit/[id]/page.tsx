'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { User, POSITIONS, DEPARTMENTS, Position, Department, Gender } from '@/types/user';
import Image from 'next/image';

export default function EditEmployeePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [employee, setEmployee] = useState({
    name: '',
    gender: '남' as Gender,
    birthYear: '',
    phone: '',
    address: '',
    joinDate: '',
    position: '스탭' as Position,
    department: '없음' as Department,
    note: '',
    profileImage: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    loadEmployee();
  }, [userId]);

  const loadEmployee = async () => {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setEmployee({
          name: data.name || '',
          gender: (data.gender || '남') as Gender,
          birthYear: data.birthYear || '',
          phone: data.phone || '',
          address: data.address || '',
          joinDate: data.joinDate || '',
          position: (data.position || '스탭') as Position,
          department: (data.department || '없음') as Department,
          note: data.note || '',
          profileImage: data.profileImage || ''
        });
        if (data.profileImage) {
          setPreviewUrl(data.profileImage);
        }
      }
    } catch (error) {
      console.error('직원 정보 로딩 실패:', error);
      alert('직원 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기는 5MB 이하여야 합니다.');
        return;
      }
      
      setImageFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;
    
    try {
      const timestamp = Date.now();
      const fileName = `${timestamp}_${imageFile.name}`;
      const storageRef = ref(storage, `profile-images/${userId}/${fileName}`);
      
      await uploadBytes(storageRef, imageFile);
      const downloadUrl = await getDownloadURL(storageRef);
      
      return downloadUrl;
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!employee.name?.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }
    
    if (employee.birthYear && employee.birthYear.length !== 6) {
      alert('생년월일은 6자리(YYMMDD)로 입력해주세요.');
      return;
    }
    
    if (employee.note && employee.note.length > 70) {
      alert('솔로건은 70자 이내로 입력해주세요.');
      return;
    }
    
    setSaving(true);
    
    try {
      let profileImageUrl = employee.profileImage;
      
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) {
          profileImageUrl = uploadedUrl;
        }
      }
      
      // ✅ undefined 방지를 위한 명확한 값 설정
      const updateData = {
        name: employee.name || '',
        gender: employee.gender || '남',
        birthYear: employee.birthYear || '',
        phone: employee.phone || '',
        address: employee.address || '',
        joinDate: employee.joinDate || '',
        position: employee.position || '스탭',
        department: employee.department || '없음',
        note: employee.note || '',
        profileImage: profileImageUrl || '',
        updatedAt: serverTimestamp()
      };

      console.log('📝 업데이트 데이터:', updateData); // 디버깅
      
      const docRef = doc(db, 'users', userId);
      await updateDoc(docRef, updateData);
      
      alert('저장되었습니다.');
      router.push('/employees');
    } catch (error) {
      console.error('저장 실패:', error);
      alert('저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEmployee(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">로딩중...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl p-6 pt-24">
      <h1 className="text-2xl font-bold mb-6">직원 정보 수정</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 프로필 사진 */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-32 h-32">
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt="프로필 사진"
                fill
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-400">사진 없음</span>
              </div>
            )}
          </div>
          
          <label className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            사진 변경
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>

        {/* 기본 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={employee.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">성별</label>
            <select
              name="gender"
              value={employee.gender}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="남">남</option>
              <option value="여">여</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              생년월일 (6자리)
            </label>
            <input
              type="text"
              name="birthYear"
              value={employee.birthYear}
              onChange={handleChange}
              placeholder="YYMMDD (예: 900101)"
              maxLength={6}
              pattern="[0-9]{6}"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">예: 900101</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">연락처</label>
            <input
              type="tel"
              name="phone"
              value={employee.phone}
              onChange={handleChange}
              placeholder="010-0000-0000"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">입사일</label>
            <input
              type="month"
              name="joinDate"
              value={employee.joinDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">직급</label>
            <select
              name="position"
              value={employee.position}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {POSITIONS.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">직계</label>
            <select
              name="department"
              value={employee.department}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {DEPARTMENTS.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 주소 */}
        <div>
          <label className="block text-sm font-medium mb-1">주소</label>
          <input
            type="text"
            name="address"
            value={employee.address}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 솔로건 */}
        <div>
          <label className="block text-sm font-medium mb-1">
            솔로건 한마디 ({employee.note?.length || 0}/70자)
          </label>
          <textarea
            name="note"
            value={employee.note}
            onChange={handleChange}
            maxLength={70}
            rows={3}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="최대 70자"
          />
        </div>

        {/* 버튼 */}
        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {saving ? '저장중...' : '저장'}
          </button>
          
          <button
            type="button"
            onClick={() => router.push('/employees')}
            className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded hover:bg-gray-400"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}