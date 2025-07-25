"use client";

import { useState } from "react";
import { MessageSquare, Building, Clock, CheckCircle, X, Maximize2, User } from "lucide-react";

interface WonderCardProps {
  wonder: {
    id: string;
    title: string;
    content: string;
    category: string;
    authorName: string;
    company?: string;
    status: "pending" | "answered" | "closed";
    date: string;
    adminReply?: string;
    adminReplyAt?: string | null;
  };
}

export default function WonderCard({ wonder }: WonderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

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
    setIsExpanded(true);
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
          {wonder.authorName[0].toUpperCase()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">
              {wonder.title}
            </h3>
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
          </div>
        </div>

        <Maximize2 className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
      </div>

      {/* 문의 내용 미리보기 */}
      <div className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
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
      </div>

      {/* 답변 상태 */}
      {wonder.adminReply && (
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
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
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
              {wonder.authorName[0].toUpperCase()}
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
            </h2>
            <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
              {wonder.content}
            </div>
          </div>

          {/* 관리자 답변 */}
          {wonder.adminReply ? (
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
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <CompactCard />
      {isExpanded && <ExpandedModal />}
    </>
  );
}