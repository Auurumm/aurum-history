// app/admin/wonders/page.tsx - 새로 생성할 파일

"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  onSnapshot, 
  orderBy, 
  doc, 
  updateDoc, 
  serverTimestamp,
  where 
} from "firebase/firestore";
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  X, 
  Send, 
  Building, 
  User, 
  Mail, 
  Calendar,
  Search,
  Filter,
  Eye,
  Lock,
  AlertCircle,
  Trash2
} from "lucide-react";

interface Wonder {
  id: string;
  title: string;
  content: string;
  category: string;
  authorName: string;
  authorEmail: string;
  authorPhone?: string;
  company?: string;
  isPublic: boolean;
  status: "pending" | "answered" | "closed";
  createdAt: any;
  updatedAt?: any;
  adminReply?: string;
  adminReplyAt?: any;
  images?: Array<{
    url: string;
    fileName: string;
    storageId: string;
  }>;
}

export default function AdminWondersPage() {
  const [wonders, setWonders] = useState<Wonder[]>([]);
  const [filteredWonders, setFilteredWonders] = useState<Wonder[]>([]);
  const [selectedWonder, setSelectedWonder] = useState<Wonder | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // 필터 상태
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "answered" | "closed">("all");
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | "public" | "private">("all");
  const [searchTerm, setSearchTerm] = useState("");

  // 실시간 데이터 가져오기
  useEffect(() => {
    if (!db) {
      setError("Firebase 연결 오류");
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "wonders"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const wondersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Wonder[];

        setWonders(wondersData);
        setLoading(false);
        setError("");
      },
      (error) => {
        console.error("문의글 가져오기 오류:", error);
        setError("문의글을 불러오는 중 오류가 발생했습니다.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // 필터링 로직
  useEffect(() => {
    let filtered = wonders;

    // 상태 필터
    if (statusFilter !== "all") {
      filtered = filtered.filter(w => w.status === statusFilter);
    }

    // 공개/비공개 필터
    if (visibilityFilter !== "all") {
      filtered = filtered.filter(w => 
        visibilityFilter === "public" ? w.isPublic : !w.isPublic
      );
    }

    // 검색 필터
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(w => 
        w.title.toLowerCase().includes(search) ||
        w.content.toLowerCase().includes(search) ||
        w.authorName.toLowerCase().includes(search) ||
        w.authorEmail.toLowerCase().includes(search) ||
        w.category.toLowerCase().includes(search)
      );
    }

    setFilteredWonders(filtered);
  }, [wonders, statusFilter, visibilityFilter, searchTerm]);

  // 답변 등록
  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWonder || !replyText.trim()) return;

    setIsReplying(true);
    try {
      await updateDoc(doc(db, "wonders", selectedWonder.id), {
        adminReply: replyText.trim(),
        adminReplyAt: serverTimestamp(),
        status: "answered",
        updatedAt: serverTimestamp(),
      });

      setReplyText("");
      setSelectedWonder(null);
      alert("답변이 등록되었습니다!");
    } catch (error) {
      console.error("답변 등록 오류:", error);
      alert("답변 등록 중 오류가 발생했습니다.");
    } finally {
      setIsReplying(false);
    }
  };

  // 상태 변경
  const handleStatusChange = async (wonder: Wonder, newStatus: Wonder["status"]) => {
    try {
      await updateDoc(doc(db, "wonders", wonder.id), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("상태 변경 오류:", error);
      alert("상태 변경 중 오류가 발생했습니다.");
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "answered":
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          text: "답변완료",
          className: "bg-green-100 text-green-700 border-green-200"
        };
      case "closed":
        return {
          icon: <X className="h-4 w-4" />,
          text: "해결완료",
          className: "bg-gray-100 text-gray-700 border-gray-200"
        };
      default:
        return {
          icon: <Clock className="h-4 w-4" />,
          text: "답변대기",
          className: "bg-orange-100 text-orange-700 border-orange-200"
        };
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp?.toDate) return "날짜 정보 없음";
    return timestamp.toDate().toLocaleString("ko-KR");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-yellow-400 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">문의글 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🔧 문의 관리 대시보드</h1>
              <p className="text-gray-600">등록된 문의를 확인하고 답변할 수 있습니다</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">총 {wonders.length}개 문의</p>
              <p className="text-sm text-gray-500">
                미답변 {wonders.filter(w => w.status === "pending").length}개
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500 mb-2">전체 문의</h3>
            <p className="text-3xl font-bold text-blue-600">{wonders.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500 mb-2">답변 대기</h3>
            <p className="text-3xl font-bold text-orange-600">
              {wonders.filter(w => w.status === "pending").length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500 mb-2">답변 완료</h3>
            <p className="text-3xl font-bold text-green-600">
              {wonders.filter(w => w.status === "answered").length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500 mb-2">비공개 문의</h3>
            <p className="text-3xl font-bold text-purple-600">
              {wonders.filter(w => !w.isPublic).length}
            </p>
          </div>
        </div>

        {/* 필터 및 검색 */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8 border">
          <div className="flex flex-col md:flex-row gap-4">
            {/* 검색 */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="제목, 내용, 작성자, 이메일로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                />
              </div>
            </div>

            {/* 상태 필터 */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            >
              <option value="all">모든 상태</option>
              <option value="pending">답변 대기</option>
              <option value="answered">답변 완료</option>
              <option value="closed">해결 완료</option>
            </select>

            {/* 공개/비공개 필터 */}
            <select
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            >
              <option value="all">전체</option>
              <option value="public">공개 문의</option>
              <option value="private">비공개 문의</option>
            </select>
          </div>
        </div>

        {/* 문의 목록 */}
        <div className="space-y-4">
          {filteredWonders.length > 0 ? (
            filteredWonders.map((wonder) => {
              const statusInfo = getStatusInfo(wonder.status);
              return (
                <div
                  key={wonder.id}
                  className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {wonder.title}
                          </h3>
                          <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusInfo.className}`}>
                            {statusInfo.icon}
                            {statusInfo.text}
                          </span>
                          {!wonder.isPublic && (
                            <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                              <Lock className="h-3 w-3" />
                              비공개
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {wonder.authorName}
                          </div>
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {wonder.authorEmail}
                          </div>
                          {wonder.company && (
                            <div className="flex items-center gap-1">
                              <Building className="h-4 w-4" />
                              {wonder.company}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(wonder.createdAt)}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            {wonder.category}
                          </span>
                          {wonder.images && wonder.images.length > 0 && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                              📷 {wonder.images.length}개
                            </span>
                          )}
                        </div>

                        <p className="text-gray-700 mb-4 line-clamp-2">
                          {wonder.content}
                        </p>

                        {wonder.adminReply && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-green-700">
                                관리자 답변 ({formatDate(wonder.adminReplyAt)})
                              </span>
                            </div>
                            <p className="text-green-800 text-sm whitespace-pre-wrap">
                              {wonder.adminReply}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {wonder.status !== "answered" && (
                          <button
                            onClick={() => setSelectedWonder(wonder)}
                            className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black text-sm rounded-md transition-colors font-medium"
                          >
                            <Send className="h-4 w-4" />
                            답변하기
                          </button>
                        )}
                        
                        <select
                          value={wonder.status}
                          onChange={(e) => handleStatusChange(wonder, e.target.value as Wonder["status"])}
                          className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-400"
                        >
                          <option value="pending">답변 대기</option>
                          <option value="answered">답변 완료</option>
                          <option value="closed">해결 완료</option>
                        </select>
                      </div>

                      <div className="text-xs text-gray-500">
                        ID: {wonder.id.substring(0, 8)}...
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 text-gray-500">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-xl mb-2">조건에 맞는 문의가 없습니다</p>
              <p className="text-sm text-gray-400">필터를 조정하거나 검색어를 변경해보세요</p>
            </div>
          )}
        </div>
      </div>

      {/* 답변 모달 */}
      {selectedWonder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">답변 작성</h2>
                <button
                  onClick={() => setSelectedWonder(null)}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* 원본 문의 정보 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900">
                    📋 {selectedWonder.title}
                  </h3>
                  {!selectedWonder.isPublic && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                      <Lock className="h-3 w-3" />
                      비공개
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  작성자: {selectedWonder.authorName} ({selectedWonder.authorEmail})
                  <br />
                  작성일: {formatDate(selectedWonder.createdAt)}
                </div>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {selectedWonder.content}
                </p>
              </div>
            </div>

            <div className="p-6">
              {/* 답변 작성 */}
              <form onSubmit={handleReply}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    답변 내용 *
                  </label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={8}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none"
                    placeholder="답변을 작성해주세요..."
                    required
                    disabled={isReplying}
                  />
                  <div className="text-right text-sm text-gray-500 mt-1">
                    {replyText.length} / 2000
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedWonder(null)}
                    className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    disabled={isReplying}
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={isReplying || !replyText.trim()}
                    className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-md transition-colors flex items-center justify-center gap-2"
                  >
                    {isReplying ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        답변 등록 중...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        답변 등록
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}