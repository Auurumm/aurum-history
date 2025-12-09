// app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      setTimeout(() => {
        router.push('/employees');
      }, 500);
    } catch (error: any) {
      if (error.code === 'auth/invalid-credential') {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      } else if (error.code === 'auth/user-not-found') {
        setError('존재하지 않는 사용자입니다.');
      } else if (error.code === 'auth/wrong-password') {
        setError('비밀번호가 올바르지 않습니다.');
      } else {
        setError(`로그인 실패: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail.trim()) {
      alert('이메일을 입력해주세요.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      alert('비밀번호 재설정 이메일을 발송했습니다.\n이메일을 확인해주세요.');
      setShowResetModal(false);
      setResetEmail('');
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        alert('등록되지 않은 이메일입니다.');
      } else {
        alert('이메일 발송에 실패했습니다.');
      }
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">직원 명부 로그인</h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your-email@company.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>

            {/* 비밀번호 찾기 버튼 */}
            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              className="w-full text-sm text-blue-600 hover:text-blue-800 mt-2"
            >
              비밀번호를 잊으셨나요?
            </button>
          </form>
        </div>
      </div>

      {/* 비밀번호 재설정 모달 */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">비밀번호 재설정</h2>
            <p className="text-sm text-gray-600 mb-4">
              가입한 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
            </p>
            <input
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="이메일 주소"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <div className="flex space-x-2">
              <button
                onClick={handlePasswordReset}
                className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
              >
                재설정 이메일 발송
              </button>
              <button
                onClick={() => {
                  setShowResetModal(false);
                  setResetEmail('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}