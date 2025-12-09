// app/employees/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { POSITIONS, DEPARTMENTS } from '@/types/user';
import ProtectedRoute from '@/components/ProtectedRoute';

// ✅ 실제 페이지 컨텐츠
function NewEmployeePageContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    gender: '남' as '남' | '여',
    birthYear: '',
    address: '',
    joinDate: '',
    position: '주임',
    department: '없음',
    note: '',
  });

  const generatePassword = () => {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setFormData(prev => ({ ...prev, password }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password || !formData.name) {
      alert('이메일, 비밀번호, 이름은 필수입니다.');
      return;
    }

    if (formData.birthYear && formData.birthYear.length !== 6) {
      alert('생년월일은 6자리(YYMMDD)로 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/create-employee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        alert(`직원 등록 완료!\n\n이메일: ${formData.email}\n비밀번호: ${formData.password}\n\n※ 비밀번호를 안전하게 전달해주세요.`);
        router.push('/employees');
      } else {
        alert(`등록 실패: ${result.error}`);
      }
    } catch (error) {
      console.error('등록 실패:', error);
      alert('등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container mx-auto max-w-2xl p-6 pt-24">
      <h1 className="text-2xl font-bold mb-6">신규 직원 등록</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        {/* 계정 정보 */}
        <div className="border-b pb-4">
          <h2 className="text-lg font-semibold mb-4">계정 정보</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                이메일 (로그인 ID) <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="example@company.com"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                초기 비밀번호 <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="최소 6자 이상"
                  className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={generatePassword}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 whitespace-nowrap"
                >
                  자동생성
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">※ 이 비밀번호를 직원에게 안전하게 전달하세요</p>
            </div>
          </div>
        </div>

        {/* 기본 정보 */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">기본 정보</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">성별</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="남">남</option>
                <option value="여">여</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">생년월일 (6자리)</label>
              <input
                type="text"
                name="birthYear"
                value={formData.birthYear}
                onChange={handleChange}
                placeholder="YYMMDD (예: 900101)"
                maxLength={6}
                pattern="[0-9]{6}"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">연락처</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
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
                value={formData.joinDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">직급</label>
              <select
                name="position"
                value={formData.position}
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
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">주소</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              솔로건 ({formData.note.length}/70자)
            </label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleChange}
              maxLength={70}
              rows={3}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? '등록중...' : '등록'}
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

// ✅ ProtectedRoute로 감싸서 export
export default function NewEmployeePage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <NewEmployeePageContent />
    </ProtectedRoute>
  );
}