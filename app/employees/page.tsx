// app/employees/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User, getPositionType } from '@/types/user';
import Image from 'next/image';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

// ✅ 1. 먼저 내부 컴포넌트 정의
function EmployeesPageContent() {
  const { user: currentUser, logout, isAdmin } = useAuth();
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterPosition, setFilterPosition] = useState<string>('all');

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const q = query(
        collection(db, 'users'),
        orderBy('name', 'asc')
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
      
      setEmployees(data);
    } catch (error) {
      console.error('직원 목록 로딩 실패:', error);
      alert('직원 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const matchSearch = employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       employee.phone?.includes(searchTerm);
    const matchDepartment = filterDepartment === 'all' || employee.department === filterDepartment;
    const matchPosition = filterPosition === 'all' || employee.position === filterPosition;
    
    return matchSearch && matchDepartment && matchPosition;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">로딩중...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 pt-24">

      {/* 내 정보 카드 추가 */}
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
        <div>
            <h2 className="font-semibold text-lg">내 정보</h2>
            <p className="text-sm text-gray-600">
            {currentUser?.name} ({currentUser?.position}) - {currentUser?.department}
            </p>
        </div>
        <Link href={`/employees/edit/${currentUser?.id}`}>
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            내 정보 수정
            </button>
        </Link>
        </div>
        </div>

      {/* 상단 헤더 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">직원 명부</h1>
          <p className="text-sm text-gray-600 mt-1">
            로그인: {currentUser?.name} ({currentUser?.email})
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-gray-600">
            총 <span className="font-bold text-blue-600">{filteredEmployees.length}</span>명
          </div>
          
          {isAdmin && (
            <Link href="/employees/new">
              <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                + 신규 등록
              </button>
            </Link>
          )}
          
          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            로그아웃
          </button>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">검색</label>
            <input
              type="text"
              placeholder="이름 또는 연락처 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">직계</label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체</option>
              <option value="없음">없음</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
              <option value="E">E</option>
              <option value="F">F</option>
              <option value="G">G</option>
              <option value="H">H</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">직급</label>
            <select
              value={filterPosition}
              onChange={(e) => setFilterPosition(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체</option>
              <optgroup label="직원">
                <option value="스탭">스탭</option>
                <option value="사원">사원</option>
                <option value="주임">주임</option>
                <option value="대리">대리</option>
                <option value="과장">과장</option>
                <option value="차장">차장</option>
                <option value="부장">부장</option>
                <option value="실장">실장</option>
              </optgroup>
              <optgroup label="임원">
                <option value="상무">상무</option>
                <option value="전무">전무</option>
                <option value="이사">이사</option>
                <option value="대표">대표</option>
              </optgroup>
            </select>
          </div>
        </div>

        {(searchTerm || filterDepartment !== 'all' || filterPosition !== 'all') && (
          <div className="mt-4">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterDepartment('all');
                setFilterPosition('all');
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              필터 초기화
            </button>
          </div>
        )}
      </div>

      {/* 직원 목록 테이블 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">사진</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">성별</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">생년월일</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">연락처</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">직급</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">직계</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">입사일</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                    조회된 직원이 없습니다.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {employee.profileImage ? (
                        <Image
                          src={employee.profileImage}
                          alt={employee.name || '프로필'}
                          width={48}
                          height={48}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-gray-400 text-xs">사진없음</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{employee.name || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.gender || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.birthYear || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.phone || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        getPositionType(employee.position) === '임원'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {employee.position || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.department || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.joinDate || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link href={`/employees/edit/${employee.id}`}>
                        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
                          수정
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 통계 */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500 mb-1">직원</div>
          <div className="text-2xl font-bold text-blue-600">
            {employees.filter(e => getPositionType(e.position) === '직원').length}명
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500 mb-1">임원</div>
          <div className="text-2xl font-bold text-purple-600">
            {employees.filter(e => getPositionType(e.position) === '임원').length}명
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500 mb-1">전체</div>
          <div className="text-2xl font-bold text-gray-900">{employees.length}명</div>
        </div>
      </div>
    </div>
  );
}

// ✅ 2. default export는 딱 한 번만!
export default function EmployeesPage() {
  return (
    <ProtectedRoute>
      <EmployeesPageContent />
    </ProtectedRoute>
  );
}
