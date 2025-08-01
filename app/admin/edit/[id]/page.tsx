// 수정 페이지 (page.tsx) - 수정된 부분

"use client"

import { useEffect, useState, useRef } from "react"
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
  const [uploadingInline, setUploadingInline] = useState(false) // 인라인 이미지 업로드 상태
  const [editorInitialized, setEditorInitialized] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null) // 인라인 이미지용 파일 입력

  // 기존 HTML은 그대로, 플레인 텍스트만 줄바꿈 변환
  const processContentForEditor = (content: string) => {
    if (!content) return ""
    
    // HTML 태그가 하나라도 있으면 그대로 반환
    if (content.includes('<') && content.includes('>')) {
      return content
    }
    
    // 순수 텍스트면 줄바꿈만 <br>로 변환
    return content.replace(/\n/g, '<br>')
  }

  useEffect(() => {
    if (!params?.id) return
    getAnnouncementById(params.id as string).then((post) => {
      if (post) {
        setFormData(post)
        // 에디터에 직접 내용 설정 (약간의 지연 후)
        setTimeout(() => {
          if (editorRef.current && post.content !== undefined) {
            const processedContent = processContentForEditor(post.content || "")
            editorRef.current.innerHTML = processedContent
            setEditorInitialized(true)
          }
        }, 100)
      }
    })
  }, [params?.id])

  // 텍스트 포맷팅 함수들
  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
  }

  const insertHTML = (html: string) => {
    document.execCommand('insertHTML', false, html)
    editorRef.current?.focus()
  }

  // 인라인 이미지 삽입 함수 (디버깅 강화)
  const handleInlineImageUpload = async (file: File) => {
    console.log('📁 파일 선택됨:', file.name, file.size, file.type)
    
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.')
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB 제한
      alert('파일 크기가 너무 큽니다. (최대 10MB)')
      return
    }

    setUploadingInline(true)
    console.log('📤 업로드 시작...')
    
    try {
      const url = await uploadImage(file)
      console.log('✅ 업로드 완료:', url)
      
      if (!url) {
        throw new Error('업로드된 URL이 없습니다')
      }
      
      // 현재 선택된 위치 저장
      const selection = window.getSelection()
      const range = selection?.getRangeAt(0)
      
      // 에디터에 포커스 설정  
      editorRef.current?.focus()
      
      // 저장된 위치로 복원 (가능한 경우)
      if (range && selection) {
        selection.removeAllRanges()
        selection.addRange(range)
      }
      
      // 이미지 HTML 생성 - 더 안전한 방식
      const imageHtml = `<img src="${url}" alt="삽입된 이미지" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 4px; display: block;" /><br>`
      
      // insertHTML 대신 더 안전한 방법 사용
      if (document.queryCommandSupported('insertHTML')) {
        document.execCommand('insertHTML', false, imageHtml)
      } else {
        // insertHTML이 지원되지 않는 경우 대체 방법
        const img = document.createElement('img')
        img.src = url
        img.alt = '삽입된 이미지'
        img.style.cssText = 'max-width: 100%; height: auto; margin: 10px 0; border-radius: 4px; display: block;'
        
        const br = document.createElement('br')
        
        if (range) {
          range.insertNode(br)
          range.insertNode(img)
          range.collapse(false)
        } else if (editorRef.current) {
          editorRef.current.appendChild(img)
          editorRef.current.appendChild(br)
        }
      }
      
      // 에디터 내용 강제 업데이트
      setTimeout(() => {
        if (editorRef.current) {
          const content = editorRef.current.innerHTML
          console.log('📝 에디터 내용 업데이트:', content.substring(0, 200) + '...')
          setFormData(prev => ({ ...prev, content }))
          
          // 강제 리렌더링 트리거
          const event = new Event('input', { bubbles: true })
          editorRef.current.dispatchEvent(event)
        }
      }, 100)
      
    } catch (err) {
      console.error('❌ 업로드 실패:', err)
      alert(`이미지 업로드 실패: ${err instanceof Error ? err.message : '알 수 없는 오류'}`)
    } finally {
      setUploadingInline(false)
    }
  }

  // 인라인 이미지 삽입 버튼 클릭 핸들러
  const handleImageButtonClick = () => {
    fileInputRef.current?.click()
  }

  const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB']
  const highlightColors = ['transparent', '#FFFF00', '#00FF00', '#FF0000', '#0000FF', '#FFA500', '#FF00FF', '#00FFFF']

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!params?.id) return
    
    console.log('📋 폼 제출 데이터:', {
      title: formData.title,
      contentLength: formData.content?.length || 0,
      hasImages: formData.content?.includes('<img') || false
    })
    
    setSaving(true)

    try {
      const updateData = {
        ...formData,
        updatedAt: new Date(),
      }
      
      console.log('💾 수정할 데이터:', updateData)
      await updateAnnouncement(params.id as string, updateData)
      console.log('✅ 수정 완료')
      alert("수정되었습니다.")
      router.push("/admin")
    } catch (err) {
      console.error('❌ 수정 실패:', err)
      alert("수정 중 오류 발생")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-12 text-center">로딩 중...</div>
  if (!isAdmin) return <div className="p-12 text-center">접근 권한이 없습니다.</div>
  if (!formData.title) return <div className="p-12 text-center">불러오는 중...</div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">공지 수정</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          placeholder="제목"
          value={formData.title || ""}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
        
        <select
          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
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

        {/* 썸네일 이미지 업로드 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">썸네일 이미지</label>
          <div
            onDrop={(e) => {
              e.preventDefault()
              const file = e.dataTransfer.files[0]
              if (file) handleImageUpload(file)
            }}
            onDragOver={(e) => e.preventDefault()}
            className="w-full h-40 border-2 border-dashed border-gray-400 rounded-md flex items-center justify-center text-gray-500 relative hover:border-yellow-500 transition-colors"
          >
            {formData.image ? (
              <img src={formData.image} alt="미리보기" className="h-full object-contain rounded-md" />
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
        </div>

        <input
          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          placeholder="요약 (excerpt)"
          value={formData.excerpt || ""}
          onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
        />

        {/* 커스텀 리치 텍스트 에디터 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">본문</label>
          
          {/* 툴바 */}
          <div className="border border-gray-300 rounded-t-md bg-gray-50 p-2 flex flex-wrap gap-1">
            {/* 텍스트 스타일 */}
            <button
              type="button"
              onClick={() => formatText('bold')}
              className="px-3 py-1 border rounded hover:bg-gray-200 font-bold"
              title="굵게"
            >
              B
            </button>
            <button
              type="button"
              onClick={() => formatText('italic')}
              className="px-3 py-1 border rounded hover:bg-gray-200 italic"
              title="기울임"
            >
              I
            </button>
            <button
              type="button"
              onClick={() => formatText('underline')}
              className="px-3 py-1 border rounded hover:bg-gray-200 underline"
              title="밑줄"
            >
              U
            </button>
            <button
              type="button"
              onClick={() => formatText('strikeThrough')}
              className="px-3 py-1 border rounded hover:bg-gray-200 line-through"
              title="취소선"
            >
              S
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1"></div>

            {/* 제목 스타일 */}
            <select
              onChange={(e) => formatText('formatBlock', e.target.value)}
              className="px-2 py-1 border rounded text-sm"
              defaultValue=""
            >
              <option value="">일반</option>
              <option value="h1">제목 1</option>
              <option value="h2">제목 2</option>
              <option value="h3">제목 3</option>
              <option value="h4">제목 4</option>
              <option value="h5">제목 5</option>
              <option value="h6">제목 6</option>
            </select>

            {/* 폰트 크기 */}
            <select
              onChange={(e) => formatText('fontSize', e.target.value)}
              className="px-2 py-1 border rounded text-sm"
              defaultValue="3"
            >
              <option value="1">매우 작게</option>
              <option value="2">작게</option>
              <option value="3">보통</option>
              <option value="4">크게</option>
              <option value="5">매우 크게</option>
              <option value="6">가장 크게</option>
              <option value="7">초대형</option>
            </select>

            <div className="w-px h-6 bg-gray-300 mx-1"></div>

            {/* 텍스트 색상 */}
            <div className="flex items-center gap-1">
              <span className="text-sm">색상:</span>
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => formatText('foreColor', color)}
                  className="w-6 h-6 border border-gray-300 rounded"
                  style={{ backgroundColor: color }}
                  title={`텍스트 색상: ${color}`}
                />
              ))}
            </div>

            <div className="w-px h-6 bg-gray-300 mx-1"></div>

            {/* 형광펜/배경색 */}
            <div className="flex items-center gap-1">
              <span className="text-sm">형광펜:</span>
              {highlightColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => formatText('backColor', color)}
                  className="w-6 h-6 border border-gray-300 rounded"
                  style={{ backgroundColor: color === 'transparent' ? 'white' : color }}
                  title={`배경 색상: ${color}`}
                >
                  {color === 'transparent' && '×'}
                </button>
              ))}
            </div>

            <div className="w-px h-6 bg-gray-300 mx-1"></div>

            {/* 정렬 */}
            <button
              type="button"
              onClick={() => formatText('justifyLeft')}
              className="px-3 py-1 border rounded hover:bg-gray-200"
              title="왼쪽 정렬"
            >
              ⬅
            </button>
            <button
              type="button"
              onClick={() => formatText('justifyCenter')}
              className="px-3 py-1 border rounded hover:bg-gray-200"
              title="가운데 정렬"
            >
              ⬌
            </button>
            <button
              type="button"
              onClick={() => formatText('justifyRight')}
              className="px-3 py-1 border rounded hover:bg-gray-200"
              title="오른쪽 정렬"
            >
              ➡
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1"></div>

            {/* 목록 */}
            <button
              type="button"
              onClick={() => formatText('insertUnorderedList')}
              className="px-3 py-1 border rounded hover:bg-gray-200"
              title="글머리 기호"
            >
              • 목록
            </button>
            <button
              type="button"
              onClick={() => formatText('insertOrderedList')}
              className="px-3 py-1 border rounded hover:bg-gray-200"
              title="번호 매기기"
            >
              1. 목록
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1"></div>

            {/* 이미지 삽입 버튼 - 새로 추가 */}
            <button
              type="button"
              onClick={handleImageButtonClick}
              disabled={uploadingInline}
              className="px-3 py-1 border rounded hover:bg-gray-200 disabled:opacity-50"
              title="이미지 삽입"
            >
              {uploadingInline ? "📤..." : "🖼️"}
            </button>

            {/* 숨겨진 파일 입력 */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleInlineImageUpload(file)
              }}
            />

            <div className="w-px h-6 bg-gray-300 mx-1"></div>

            {/* 기타 */}
            <button
              type="button"
              onClick={() => {
                const url = prompt('링크 URL을 입력하세요:')
                if (url) formatText('createLink', url)
              }}
              className="px-3 py-1 border rounded hover:bg-gray-200"
              title="링크 추가"
            >
              🔗
            </button>
            <button
              type="button"
              onClick={() => formatText('removeFormat')}
              className="px-3 py-1 border rounded hover:bg-gray-200 text-red-600"
              title="서식 지우기"
            >
              지우기
            </button>
          </div>

          {/* 에디터 영역 */}
          <div
            ref={editorRef}
            contentEditable
            onInput={(e) => {
              // 에디터가 초기화된 후에만 내용 업데이트
              if (editorInitialized) {
                const content = e.currentTarget.innerHTML
                console.log('🔄 에디터 내용 변경:', content.length, '글자')
                
                // 내용이 실제로 변경되었을 때만 업데이트
                if (content !== formData.content) {
                  setFormData({ ...formData, content })
                }
              }
            }}
            onPaste={(e) => {
              console.log('📋 붙여넣기 이벤트')
              const items = e.clipboardData?.items
              if (items) {
                for (let i = 0; i < items.length; i++) {
                  const item = items[i]
                  if (item.type.indexOf('image') !== -1) {
                    e.preventDefault()
                    const file = item.getAsFile()
                    if (file) {
                      console.log('📋 이미지 붙여넣기:', file.name)
                      handleInlineImageUpload(file)
                    }
                    break
                  }
                }
              }
            }}
            onDrop={(e) => {
              console.log('🎯 드래그앤드롭 이벤트')
              e.preventDefault()
              const files = e.dataTransfer.files
              if (files.length > 0) {
                const file = files[0]
                if (file.type.startsWith('image/')) {
                  console.log('🎯 이미지 드롭:', file.name)
                  handleInlineImageUpload(file)
                }
              }
            }}
            onDragOver={(e) => e.preventDefault()}
            className="min-h-[300px] p-4 border border-t-0 border-gray-300 rounded-b-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
            style={{ 
              maxHeight: '500px', 
              overflowY: 'auto',
              lineHeight: '1.6'
            }}
            suppressContentEditableWarning={true}
          >
          </div>
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.published || false}
            onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
            className="w-4 h-4 text-yellow-600 bg-gray-100 border-gray-300 rounded focus:ring-yellow-500"
          />
          <span className="text-sm font-medium text-gray-700">발행 여부</span>
        </label>

        <button
          type="submit"
          disabled={saving}
          className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-white px-6 py-3 rounded-md font-medium transition-colors"
        >
          {saving ? "수정 중..." : "저장하기"}
        </button>
      </form>

      {/* 커스텀 에디터 스타일 */}
      <style jsx global>{`
        [contenteditable] {
          outline: none;
          white-space: normal;
          word-wrap: break-word;
        }
        
        [contenteditable] img {
          max-width: 100%;
          height: auto;
          margin: 10px 0;
          border-radius: 4px;
          cursor: pointer;
          transition: transform 0.2s;
        }
        
        [contenteditable] img:hover {
          transform: scale(1.02);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        [contenteditable] br {
          display: block;
          margin: 0;
          line-height: 1.6;
        }
        
        [contenteditable] p {
          margin: 1em 0;
          line-height: 1.6;
        }
        
        [contenteditable] div {
          line-height: 1.6;
        }
        
        [contenteditable] h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.67em 0;
          line-height: 1.2;
        }
        
        [contenteditable] h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.75em 0;
          line-height: 1.2;
        }
        
        [contenteditable] h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin: 0.83em 0;
          line-height: 1.2;
        }
        
        [contenteditable] h4 {
          font-size: 1em;
          font-weight: bold;
          margin: 1.12em 0;
          line-height: 1.2;
        }
        
        [contenteditable] h5 {
          font-size: 0.83em;
          font-weight: bold;
          margin: 1.5em 0;
          line-height: 1.2;
        }
        
        [contenteditable] h6 {
          font-size: 0.75em;
          font-weight: bold;
          margin: 1.67em 0;
          line-height: 1.2;
        }
        
        [contenteditable] ul {
          list-style-type: disc;
          margin: 1em 0;
          padding-left: 40px;
        }
        
        [contenteditable] ol {
          list-style-type: decimal;
          margin: 1em 0;
          padding-left: 40px;
        }
        
        [contenteditable] li {
          margin: 0.5em 0;
          line-height: 1.6;
        }
      `}</style>
    </div>
  )
}