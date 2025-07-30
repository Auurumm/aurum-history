"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createAnnouncement } from "../../../lib/announcements"
import { useAuth } from "../../../lib/auth"
import { Announcement } from "@/types/announcement"
import { uploadImage } from "../../../lib/upload"

export default function NewPostPage() {
  const router = useRouter()
  const { isAdmin, loading } = useAuth()
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    category: "Media" as Announcement["category"],
    image: "",
    excerpt: "",
    content: "",
    published: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const newPost = {
        ...formData,
        date: new Date()
          .toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
          })
          .replace(/\./g, ". ")
          .replace(/\s+$/, ""),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await createAnnouncement(newPost)
      alert("게시글이 작성되었습니다!")
      router.push("/admin")
    } catch (err) {
      console.error(err)
      alert("작성 중 오류가 발생했습니다.")
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (file: File) => {
    setUploading(true)
    try {
      const url = await uploadImage(file)
      setFormData((prev) => ({ ...prev, image: url }))
    } catch (err) {
      alert("이미지 업로드 실패")
    } finally {
      setUploading(false)
    }
  }

  if (loading) return <div className="p-12 text-center">로딩 중...</div>
  if (!isAdmin) {
    router.push("/admin")
    return null
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">새 공지 작성</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full border px-4 py-2"
          placeholder="제목"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
        <select
          className="w-full border px-4 py-2"
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value as Announcement["category"] })
          }
        >
          <option value="Media">Media</option>
          <option value="Service">Service</option>
          <option value="Cooperation">Cooperation</option>
          <option value="Recruit">Recruit</option>
          <option value="Social">Social</option>
          <option value="Others">Others</option>
        </select>

        {/* ✅ 드래그 & 클릭 이미지 업로드 */}
        <div
          onDrop={(e) => {
            e.preventDefault()
            const file = e.dataTransfer.files[0]
            if (file) handleImageUpload(file)
          }}
          onDragOver={(e) => e.preventDefault()}
          className="w-full h-40 border-2 border-dashed border-gray-400 rounded flex items-center justify-center text-gray-500 relative"
        >
          {formData.image ? (
            <img src={formData.image} alt="미리보기" className="h-full object-contain rounded" />
          ) : uploading ? (
            <p>업로드 중...</p>
          ) : (
            <p>이미지를 드래그하거나 클릭하여 업로드</p>
          )}
          <input
            type="file"
            accept="image/*"
            className="absolute w-full h-full opacity-0 cursor-pointer"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleImageUpload(file)
            }}
          />
        </div>

        <input
          className="w-full border px-4 py-2"
          placeholder="요약 (excerpt)"
          value={formData.excerpt}
          onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
        />
        <textarea
          className="w-full border px-4 py-2 h-40"
          placeholder="본문"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.published}
            onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
          />
          발행 여부
        </label>
        <button
          type="submit"
          disabled={saving}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
        >
          {saving ? "저장 중..." : "저장하기"}
        </button>
      </form>
    </div>
  )
}
