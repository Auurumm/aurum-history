"use client"

import { useEffect, useState } from "react"
import { useAuth } from "../../lib/auth"
import { getAllAnnouncements, deleteAnnouncement } from "../../lib/announcements"
import { Announcement } from "@/types/announcement"
import Link from "next/link"

export default function AdminDashboard() {
  const { isAdmin, logout, loading } = useAuth()
  const [posts, setPosts] = useState<Announcement[]>([])
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (isAdmin) {
      getAllAnnouncements().then(setPosts)
    }
  }, [isAdmin])

  const handleDelete = async (id: string) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      setDeleting(id)
      await deleteAnnouncement(id)
      setPosts(posts.filter(post => post.id !== id))
      setDeleting(null)
    }
  }

  if (loading) return <div className="p-10 text-center">로딩 중...</div>
  if (!isAdmin) return <div className="p-10 text-center">권한 없음</div>

  return (
    <div className="max-w-4xl mx-auto p-10">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">공지사항 관리</h1>
        <div className="flex gap-2">
          <Link href="/admin/new" className="bg-blue-600 text-white px-4 py-2 rounded">
            새 글 작성
          </Link>
          <button onClick={logout} className="bg-gray-600 text-white px-4 py-2 rounded">
            로그아웃
          </button>
        </div>
      </div>

      {posts.length === 0 ? (
        <p>게시글이 없습니다.</p>
      ) : (
        <ul className="space-y-4">
          {posts.map((post) => (
            <li key={post.id} className="border p-4 rounded bg-white dark:bg-zinc-800">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-semibold">{post.title}</h2>
                  <p className="text-sm text-gray-500">{post.date} · {post.category}</p>
                </div>
                <div className="flex gap-4">
                  <Link href={`/admin/edit/${post.id}`} className="text-blue-600 hover:underline">
                    수정
                  </Link>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="text-red-600 hover:underline"
                    disabled={deleting === post.id}
                  >
                    {deleting === post.id ? "삭제 중..." : "삭제"}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
