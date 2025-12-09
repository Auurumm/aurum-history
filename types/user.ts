// types/user.ts
export type Position = 
  | '스탭' 
  | '사원' 
  | '주임' 
  | '대리' 
  | '과장' 
  | '차장' 
  | '부장' 
  | '실장' 
  | '상무' 
  | '전무' 
  | '이사' 
  | '대표';

export type PositionType = '직원' | '임원';

export type Department = '없음' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';

export type Gender = '남' | '여';

export interface User {
  id: string;
  email: string;
  name: string;
  nickname?: string;
  phone: string;
  profileImage: string;
  role: 'approved' | 'admin' | 'pending';
  
  // 직원 정보
  gender: Gender;
  birthYear: string; // YYMMDD 6자리
  address: string;
  joinDate: string; // YYYY-MM
  position: Position;
  department: Department;
  note: string; // 최대 70자
  
  createdAt: Date;
  updatedAt: Date;
}

// 직급별 구분 헬퍼 함수
export const getPositionType = (position: Position): PositionType => {
  const 직원 = ['스탭', '사원', '주임', '대리', '과장', '차장', '부장', '실장'];
  return 직원.includes(position) ? '직원' : '임원';
};

// 직급 순서
export const POSITIONS: Position[] = [
  '스탭', '사원', '주임', '대리', '과장', '차장', '부장', '실장', 
  '상무', '전무', '이사', '대표'
];

// 직계 순서
export const DEPARTMENTS: Department[] = [
  '없음', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'
];