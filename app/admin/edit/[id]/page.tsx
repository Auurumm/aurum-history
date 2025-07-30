"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getAnnouncementById, updateAnnouncement } from "../../../../lib/announcements"
import { uploadImage } from "../../../../lib/upload"
import { Announcement } from "@/types/announcement"
import { useAuth } from "../../../../lib/auth"

export default function EditPage() {
  const router = useRouter()
  const params = useParams()
  const { isAdmin, loading } = useAuth()
  const [formData, setFormData] = useState<Partial<Announcement>>({})
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!params?.id) return
    getAnnouncementById(params.id as string).then((post) => {
      if (post) setFormData(post)
    })
  }, [params?.id])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!params?.id) return
    setSaving(true)

    try {
      await updateAnnouncement(params.id as string, {
        ...formData,
        updatedAt: new Date(),
      })
      alert("수정되었습니다.")
      router.push("/admin")
    } catch (err) {
      console.error(err)
      alert("수정 중 오류 발생")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-12 text-center">로딩 중...</div>
  if (!isAdmin) return <div className="p-12 text-center">접근 권한이 없습니다.</div>
  if (!formData.title) return <div className="p-12 text-center">불러오는 중...</div>

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">공지 수정</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full border px-4 py-2"
          placeholder="제목"
          value={formData.title || ""}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
        <select
          className="w-full border px-4 py-2"
          value={formData.category || "Media"}
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
        <input
          className="w-full border px-4 py-2"
          placeholder="요약"
          value={formData.excerpt || ""}
          onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
        />
        <textarea
          className="w-full border px-4 py-2 h-40"
          placeholder="본문"
          value={formData.content || ""}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
        />

        {/* ✅ 이미지 업로드 */}
        <div>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          {uploading && <p className="text-sm text-gray-500 mt-1">업로드 중...</p>}
          {formData.image && (
            <img
              src={formData.image}
              alt="미리보기"
              className="w-full h-auto rounded-lg mt-4 border"
            />
          )}
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.published || false}
            onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
          />
          발행 여부
        </label>

        <button
          type="submit"
          disabled={saving}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
        >
          {saving ? "수정 중..." : "저장하기"}
        </button>
      </form>
    </div>
  )
}
