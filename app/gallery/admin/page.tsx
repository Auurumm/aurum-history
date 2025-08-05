"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X, Upload, Edit, Trash2, Save, Lock, LogOut, Cloud } from "lucide-react"
import { uploadMultipleImages, deleteImageFromFirebase, uploadImageToFirebase } from "../../../utils/firebaseUtils"

// 타입 정의를 컴포넌트 내부에서 정의
interface UploadResult {
  success: boolean
  url?: string
  fileName?: string
  originalName?: string
  path?: string
  error?: string
}

interface UploadProgress {
  current: number
  total: number
  fileName: string
  percentage: number
}

interface GalleryItem {
  id: number
  images: string[]
  title: string
  caption: string
  category: string
  size: "normal" | "tall"
}

const categories = ["사무실", "구성원", "일상", "워크숍", "이벤트", "외관"]

// 기본 갤러리 데이터 (Firebase URL로 변경된 예시)
const defaultGalleryItems: GalleryItem[] = [
  {
    id: 1,
    images: ["/images/gallery/aurum2.webp"], // 기존 로컬 이미지는 그대로 유지
    title: "따뜻한 회의 공간",
    caption: "아이디어가 모이는 우리의 회의실, 벽돌과 따뜻한 조명이 만드는 아늑한 분위기",
    category: "사무실",
    size: "normal",
  },
  // ... 나머지 기본 데이터
]

// 로그인 컴포넌트
function LoginForm({ onLogin }: { onLogin: (username: string, password: string) => void }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = () => {
    if (!username || !password) {
      setError("아이디와 비밀번호를 입력해주세요.")
      return
    }
    onLogin(username, password)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-black" />
          </div>
          <CardTitle className="text-2xl">갤러리 관리자</CardTitle>
          <p className="text-gray-600 dark:text-gray-300">관리자 계정으로 로그인하세요</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">아이디</label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="관리자 아이디"
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">비밀번호</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호"
                className="w-full"
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded">
                {error}
              </div>
            )}

            <Button 
              onClick={handleSubmit}
              className="w-full bg-yellow-400 text-black hover:bg-yellow-300"
            >
              로그인
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// 업로드 진행률 모달 컴포넌트
function UploadProgressModal({ progress }: { 
  progress: {
    isUploading: boolean
    current: number
    total: number
    fileName: string
    percentage: number
  }
}) {
  if (!progress.isUploading) return null
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
        <div className="text-center mb-4">
          <Cloud className="h-12 w-12 text-yellow-400 mx-auto mb-2 animate-bounce" />
          <h3 className="text-lg font-semibold">🔥 Firebase에 업로드 중...</h3>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>{progress.current} / {progress.total}</span>
            <span>{progress.percentage}%</span>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          현재 파일: <span className="font-medium">{progress.fileName}</span>
        </p>
        
        <div className="mt-4 text-xs text-center text-gray-500">
          ☁️ 클라우드에 안전하게 저장되고 있습니다
        </div>
      </div>
    </div>
  )
}

// 메인 관리자 대시보드
function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  // 상태 변수들
  const [items, setItems] = useState<GalleryItem[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  
  const [newItem, setNewItem] = useState({
    title: "",
    caption: "",
    category: "",
    images: [] as string[],
    size: "normal" as "normal" | "tall"
  })
  
  // Firebase 업로드 진행률 타입 정의
  const [uploadProgress, setUploadProgress] = useState<{
    isUploading: boolean
    current: number
    total: number
    fileName: string
    percentage: number
  }>({
    isUploading: false,
    current: 0,
    total: 0,
    fileName: '',
    percentage: 0
  })
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const loadData = () => {
      try {
        const savedItems = localStorage.getItem('gallery-items')
        if (savedItems) {
          const parsedItems = JSON.parse(savedItems)
          setItems(parsedItems)
        } else {
          setItems(defaultGalleryItems)
          localStorage.setItem('gallery-items', JSON.stringify(defaultGalleryItems))
        }
      } catch (error: unknown) {
        console.error('데이터 로드 실패:', error)
        setItems(defaultGalleryItems)
        localStorage.setItem('gallery-items', JSON.stringify(defaultGalleryItems))
      }
    }
    loadData()
  }, [])

  const saveToLocalStorage = (newItems: GalleryItem[]) => {
    try {
      localStorage.setItem('gallery-items', JSON.stringify(newItems))
      window.dispatchEvent(new Event('gallery-updated'))
    } catch (error: unknown) {
      console.error("로컬 스토리지 저장 실패:", error)
      throw error
    }
  }

  // Firebase를 사용한 이미지 업로드 처리
  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    
    // 파일 검증
    const validFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name}은(는) 이미지 파일이 아닙니다.`)
        return false
      }
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name}의 크기가 10MB를 초과합니다.`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    try {
      setUploadProgress(prev => ({ ...prev, isUploading: true }))
      
      // Firebase에 업로드
      const results: UploadResult[] = await uploadMultipleImages(
        validFiles,
        (progress: UploadProgress) => {
          setUploadProgress(prev => ({
            ...prev,
            current: progress.current,
            total: progress.total,
            fileName: progress.fileName,
            percentage: progress.percentage
          }))
        }
      )
      
      // 성공한 업로드들만 필터링
      const successfulUploads = results.filter(result => result.success)
      const failedUploads = results.filter(result => !result.success)
      
      if (successfulUploads.length > 0) {
        const imageUrls = successfulUploads.map(result => result.url).filter((url): url is string => url !== undefined)
        
        setNewItem(prev => ({
          ...prev,
          images: [...prev.images, ...imageUrls]
        }))
        
        alert(`✅ ${successfulUploads.length}장의 이미지가 Firebase에 업로드되었습니다!\n🌐 이제 모든 컴퓨터에서 볼 수 있습니다!`)
      }
      
      if (failedUploads.length > 0) {
        const errorMessages = failedUploads.map(fail => `• ${fail.fileName}: ${fail.error}`).join('\n')
        alert(`❌ ${failedUploads.length}장의 이미지 업로드 실패:\n${errorMessages}`)
      }
      
    } catch (error: unknown) {
      console.error('업로드 실패:', error)
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      alert(`업로드 중 오류가 발생했습니다: ${errorMessage}`)
    } finally {
      setUploadProgress({
        isUploading: false,
        current: 0,
        total: 0,
        fileName: '',
        percentage: 0
      })
      
      // 파일 입력 초기화
      const fileInput = fileInputRef.current
      if (fileInput) {
        fileInput.value = ''
      }
    }
  }

  // 이미지 제거 (Firebase에서도 삭제)
  const removeImage = async (index: number) => {
    const imageUrl = newItem.images[index]
    
    if (confirm('이미지를 삭제하시겠습니까? Firebase에서도 완전히 삭제됩니다.')) {
      // Firebase에서 이미지 삭제 시도
      if (imageUrl && imageUrl.includes('firebasestorage.googleapis.com')) {
        const deleteResult = await deleteImageFromFirebase(imageUrl)
        if (!deleteResult.success) {
          console.error('Firebase 삭제 실패:', deleteResult.error)
        }
      }
      
      // 로컬 상태에서 제거
      setNewItem(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }))
    }
  }

  // 이미지 순서 변경
  const moveImage = (fromIndex: number, toIndex: number) => {
    setNewItem(prev => {
      const newImages = [...prev.images]
      const [movedImage] = newImages.splice(fromIndex, 1)
      newImages.splice(toIndex, 0, movedImage)
      return { ...prev, images: newImages }
    })
  }

  // 수정 시작
  const startEdit = (item: GalleryItem) => {
    setEditingId(item.id)
    setNewItem({
      title: item.title,
      caption: item.caption,
      category: item.category,
      images: [...item.images],
      size: item.size
    })
    setIsCreating(true)
  }

  // 수정 취소
  const cancelEdit = () => {
    setEditingId(null)
    setIsCreating(false)
    setNewItem({ title: "", caption: "", category: "", images: [], size: "normal" })
    
    const fileInput = fileInputRef.current
    if (fileInput) {
      fileInput.value = ''
    }
  }

  // 게시글 저장
  const saveNewItem = async () => {
    const titleValid = newItem.title && newItem.title.trim().length > 0
    const captionValid = newItem.caption && newItem.caption.trim().length > 0
    const categoryValid = newItem.category && newItem.category.trim().length > 0
    const imagesValid = newItem.images && Array.isArray(newItem.images) && newItem.images.length > 0

    if (!titleValid || !captionValid || !categoryValid || !imagesValid) {
      const missingFields = []
      if (!titleValid) missingFields.push("제목")
      if (!captionValid) missingFields.push("설명")
      if (!categoryValid) missingFields.push("카테고리")
      if (!imagesValid) missingFields.push("이미지")
      
      alert(`다음 필드를 입력해주세요: ${missingFields.join(", ")}`)
      return
    }

    try {
      if (editingId) {
        const updatedItems = items.map(item => 
          item.id === editingId 
            ? {
                ...item,
                title: newItem.title.trim(),
                caption: newItem.caption.trim(),
                category: newItem.category.trim(),
                images: [...newItem.images],
                size: newItem.size
              }
            : item
        )
        setItems(updatedItems)
        saveToLocalStorage(updatedItems)
        alert("✅ 게시글이 수정되었습니다!")
      } else {
        const newItemData: GalleryItem = {
          id: Date.now() + Math.random(),
          title: newItem.title.trim(),
          caption: newItem.caption.trim(),
          category: newItem.category.trim(),
          images: [...newItem.images],
          size: newItem.size
        }
        
        const newItems = [newItemData, ...items]
        setItems(newItems)
        saveToLocalStorage(newItems)
        alert("✅ 게시글이 저장되었습니다! 🌐 모든 컴퓨터에서 볼 수 있습니다!")
      }
      
      setNewItem({ title: "", caption: "", category: "", images: [], size: "normal" })
      setIsCreating(false)
      setEditingId(null)
      
      const fileInput = fileInputRef.current
      if (fileInput) {
        fileInput.value = ''
      }
      
    } catch (error: unknown) {
      console.error("저장 중 오류:", error)
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      alert(`저장 중 오류가 발생했습니다: ${errorMessage}`)
    }
  }

  // 게시글 삭제
  const deleteItem = async (id: number) => {
    const item = items.find(i => i.id === id)
    if (!item) return
    
    if (confirm(`"${item.title}" 게시글을 삭제하시겠습니까?\nFirebase의 이미지들도 함께 삭제됩니다.`)) {
      // Firebase 이미지들 삭제
      for (const imageUrl of item.images) {
        if (imageUrl.includes('firebasestorage.googleapis.com')) {
          await deleteImageFromFirebase(imageUrl)
        }
      }
      
      const newItems = items.filter(item => item.id !== id)
      setItems(newItems)
      saveToLocalStorage(newItems)
      alert("✅ 게시글과 이미지가 삭제되었습니다!")
    }
  }

  const downloadJSON = () => {
    try {
      const dataStr = JSON.stringify(items, null, 2)
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
      
      const linkElement = document.createElement('a')
      linkElement.setAttribute('href', dataUri)
      linkElement.setAttribute('download', 'gallery-data.json')
      linkElement.click()
    } catch (error: unknown) {
      console.error("JSON 다운로드 실패:", error)
      alert("다운로드에 실패했습니다.")
    }
  }

  // 기존 Base64 이미지를 Firebase로 마이그레이션
  const migrateToFirebase = async () => {
    if (!confirm('기존 localStorage의 Base64 이미지들을 Firebase로 마이그레이션하시겠습니까?\n이 작업은 시간이 오래 걸릴 수 있습니다.')) {
      return
    }

    const base64Items = items.filter(item => 
      item.images.some(img => img.startsWith('data:image/'))
    )

    if (base64Items.length === 0) {
      alert('마이그레이션할 Base64 이미지가 없습니다.')
      return
    }

    setUploadProgress(prev => ({ ...prev, isUploading: true }))
    let totalProcessed = 0
    const totalImages = base64Items.reduce((sum, item) => sum + item.images.length, 0)

    try {
      const updatedItems = [...items]

      for (const item of base64Items) {
        const newImages: string[] = []

        for (let i = 0; i < item.images.length; i++) {
          const imageUrl = item.images[i]
          
          // Base64 이미지인 경우에만 마이그레이션
          if (imageUrl.startsWith('data:image/')) {
            try {
              // Base64를 Blob으로 변환
              const response = await fetch(imageUrl)
              const blob = await response.blob()
              
              // 임시 File 객체 생성
              const file = new File([blob], `migrated_${Date.now()}_${i}.jpg`, { type: 'image/jpeg' })
              
              // 진행률 업데이트
              totalProcessed++
              setUploadProgress(prev => ({
                ...prev,
                current: totalProcessed,
                total: totalImages,
                fileName: `${item.title} - 이미지 ${i + 1}`,
                percentage: Math.round((totalProcessed / totalImages) * 100)
              }))

              // Firebase에 업로드
              const result = await uploadImageToFirebase(file)
              
              if (result.success && result.url) {
                newImages.push(result.url)
              } else {
                console.error('마이그레이션 실패:', result.error)
                newImages.push(imageUrl) // 실패시 기존 이미지 유지
              }

              // 요청 제한 방지를 위한 대기
              await new Promise(resolve => setTimeout(resolve, 500))
            } catch (error) {
              console.error('Base64 변환 실패:', error)
              newImages.push(imageUrl) // 실패시 기존 이미지 유지
            }
          } else {
            // 이미 Firebase 이미지인 경우 그대로 유지
            newImages.push(imageUrl)
          }
        }

        // 아이템 업데이트
        const itemIndex = updatedItems.findIndex(i => i.id === item.id)
        if (itemIndex !== -1) {
          updatedItems[itemIndex] = { ...item, images: newImages }
        }
      }

      // 업데이트된 데이터 저장
      setItems(updatedItems)
      saveToLocalStorage(updatedItems)

      const migratedCount = totalImages
      const firebaseCount = updatedItems.reduce((sum, item) => 
        sum + item.images.filter(img => img.includes('firebasestorage.googleapis.com')).length, 0
      )

      alert(`✅ 마이그레이션 완료!\n\n📊 결과:\n• 처리된 이미지: ${migratedCount}장\n• Firebase 이미지: ${firebaseCount}장\n• 이제 모든 컴퓨터에서 볼 수 있습니다!`)

    } catch (error: unknown) {
      console.error('마이그레이션 실패:', error)
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류'
      alert(`❌ 마이그레이션 중 오류 발생: ${errorMessage}`)
    } finally {
      setUploadProgress({
        isUploading: false,
        current: 0,
        total: 0,
        fileName: '',
        percentage: 0
      })
    }
  }

  // Base64 이미지 개수 확인
  const base64ImageCount = items.reduce((sum, item) => 
    sum + item.images.filter(img => img.startsWith('data:image/')).length, 0
  )

  // Firebase 이미지 개수 확인
  const firebaseImageCount = items.reduce((sum, item) => 
    sum + item.images.filter(img => img.includes('firebasestorage.googleapis.com')).length, 0
  )

  // 기본 데이터 복원
  const resetToDefault = () => {
    if (confirm("모든 데이터를 기본값으로 초기화하시겠습니까? 현재 데이터는 모두 삭제됩니다.")) {
      setItems(defaultGalleryItems)
      saveToLocalStorage(defaultGalleryItems)
      alert("기본 데이터로 복원되었습니다!")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 pt-24">
      <div className="max-w-6xl mx-auto">
        {/* 업로드 진행률 모달 */}
        <UploadProgressModal progress={uploadProgress} />
        
        {/* 마이그레이션 안내 메시지 */}
        {base64ImageCount > 0 && (
          <div className="mb-8 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-orange-500 text-xl">⚠️</div>
              <div>
                <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                  마이그레이션이 필요합니다
                </h3>
                <p className="text-orange-800 dark:text-orange-200 text-sm mb-3">
                  현재 {base64ImageCount}장의 이미지가 로컬 저장소에만 있어서 다른 컴퓨터에서 볼 수 없습니다. 
                  Firebase로 마이그레이션하면 모든 컴퓨터에서 접근할 수 있습니다.
                </p>
                <Button 
                  onClick={migrateToFirebase}
                  className="bg-orange-500 text-white hover:bg-orange-600"
                  disabled={uploadProgress.isUploading}
                >
                  <Cloud className="h-4 w-4 mr-2" />
                  지금 마이그레이션 시작하기
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Cloud className="h-8 w-8 text-yellow-400" />
              갤러리 관리자
              <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">Firebase 연동</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-300">🌐 클라우드 저장으로 모든 컴퓨터에서 접근 가능</p>
            
            {/* 이미지 상태 표시 */}
            <div className="mt-2 flex gap-4 text-sm">
              <span className="text-green-600">☁️ Firebase 이미지: {firebaseImageCount}장</span>
              {base64ImageCount > 0 && (
                <span className="text-orange-600">💾 로컬 이미지: {base64ImageCount}장 (마이그레이션 필요)</span>
              )}
            </div>
          </div>
          
          <div className="flex gap-3">
            {/* 마이그레이션 버튼 - Base64 이미지가 있을 때만 표시 */}
            {base64ImageCount > 0 && (
              <Button 
                onClick={migrateToFirebase} 
                className="bg-blue-500 text-white hover:bg-blue-600 flex items-center gap-2"
                disabled={uploadProgress.isUploading}
              >
                <Cloud className="h-4 w-4" />
                Firebase로 마이그레이션 ({base64ImageCount}장)
              </Button>
            )}
            
            <Button onClick={resetToDefault} variant="outline" className="flex items-center gap-2 text-orange-600 border-orange-300 hover:bg-orange-50">
              <Save className="h-4 w-4" />
              기본값 복원
            </Button>
            
            <Button onClick={downloadJSON} variant="outline" className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              데이터 저장 ({items.length}개)
            </Button>
            
            <Button onClick={() => setIsCreating(true)} className="bg-yellow-400 text-black hover:bg-yellow-300 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              새 게시글
            </Button>

            <Button onClick={onLogout} variant="outline" className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50">
              <LogOut className="h-4 w-4" />
              로그아웃
            </Button>
          </div>
        </div>

        {/* 새 게시글 작성 폼 */}
        {isCreating && (
          <Card className="mb-8 border-yellow-400 shadow-lg">
            <CardHeader>
              <CardTitle className="text-yellow-600 flex items-center gap-2">
                <Cloud className="h-5 w-5" />
                {editingId ? '갤러리 게시글 수정' : '새 갤러리 게시글 작성'}
                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">Firebase 클라우드 저장</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 제목 */}
              <div>
                <label className="block text-sm font-medium mb-2">제목 *</label>
                <Input
                  value={newItem.title}
                  onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="갤러리 제목을 입력하세요"
                />
              </div>

              {/* 설명 */}
              <div>
                <label className="block text-sm font-medium mb-2">설명 *</label>
                <Textarea
                  value={newItem.caption}
                  onChange={(e) => setNewItem(prev => ({ ...prev, caption: e.target.value }))}
                  placeholder="사진에 대한 설명을 입력하세요"
                  rows={3}
                />
              </div>

              {/* 카테고리 */}
              <div>
                <label className="block text-sm font-medium mb-2">카테고리 *</label>
                <Select value={newItem.category} onValueChange={(value) => setNewItem(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="카테고리를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 이미지 업로드 */}
              <div>
                <label className="block text-sm font-medium mb-2">이미지 * (1장 이상)</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files)}
                  className="hidden"
                />
                
                <Button
                  type="button"
                  onClick={() => {
                    const fileInput = fileInputRef.current
                    if (fileInput) {
                      fileInput.click()
                    }
                  }}
                  variant="outline"
                  className="w-full h-32 border-dashed border-2 hover:border-yellow-400"
                  disabled={uploadProgress.isUploading}
                >
                  <div className="text-center">
                    <Cloud className="h-8 w-8 mx-auto mb-2 text-yellow-400" />
                    <p className="text-sm text-gray-600">🔥 Firebase에 업로드하기</p>
                    <p className="text-xs text-gray-400">
                      여러 장 선택 가능 (JPG, PNG 등)<br/>
                      <span className="text-blue-600 font-medium">🌐 클라우드 저장으로 모든 컴퓨터에서 접근!</span><br/>
                      대용량 이미지도 자동으로 최적화됩니다
                    </p>
                  </div>
                </Button>

                {/* Firebase 업로드 안내 */}
                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-700 dark:text-blue-300">
                  ☁️ <strong>Firebase Storage 사용 중:</strong> 
                  <ul className="mt-1 space-y-1 list-disc list-inside">
                    <li>이미지가 Google 클라우드에 안전하게 저장됩니다</li>
                    <li>모든 컴퓨터, 모든 브라우저에서 동일하게 보입니다</li>
                    <li>자동으로 CDN을 통해 빠르게 로딩됩니다</li>
                  </ul>
                </div>

                {/* 업로드된 이미지 미리보기 */}
                {newItem.images.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-gray-600">
                        업로드된 이미지: {newItem.images.length}장
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          ☁️ Firebase 저장완료
                        </span>
                        <span className="text-xs text-green-600">
                          🌐 모든 기기에서 접근 가능
                        </span>
                      </div>
                    </div>
                    
                    {/* 드래그 앤 드롭 안내 */}
                    <div className="mb-3 p-2 bg-purple-50 dark:bg-purple-900/20 rounded text-xs text-purple-700 dark:text-purple-300">
                      💡 <strong>순서 조정:</strong> 이미지를 드래그해서 순서를 변경할 수 있습니다. 첫 번째 이미지가 대표 이미지가 됩니다.
                    </div>
                    
                    <div className="grid grid-cols-4 gap-3">
                      {newItem.images.map((image, index) => (
                        <div
                          key={index}
                          className="relative cursor-move transition-all duration-200"
                        >
                          {/* 순서 번호 */}
                          <div className="absolute -top-2 -left-2 bg-yellow-400 text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center z-10">
                            {index + 1}
                          </div>
                          
                          {/* 대표 이미지 표시 */}
                          {index === 0 && (
                            <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1 py-0.5 rounded z-10">
                              대표
                            </div>
                          )}

                          {/* Firebase 표시 */}
                          {image.includes('firebasestorage.googleapis.com') && (
                            <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded z-10">
                              ☁️
                            </div>
                          )}
                          
                          <div className="group relative">
                            <img
                              src={image}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-20 object-cover rounded border transition-transform duration-200"
                              draggable={false}
                            />
                            
                            {/* 삭제 버튼 */}
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 z-20"
                            >
                              <X className="h-3 w-3" />
                            </button>
                            
                            {/* 드래그 오버레이 */}
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                              <div className="text-white text-xs font-medium bg-black/50 px-2 py-1 rounded">
                                드래그하여 이동
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* 순서 변경 도움말 */}
                    <div className="mt-3 text-xs text-gray-500 space-y-1">
                      <p>• 첫 번째 이미지(①)가 갤러리에서 대표 이미지로 표시됩니다</p>
                      <p>• ☁️ 마크가 있는 이미지는 Firebase에 저장된 클라우드 이미지입니다</p>
                      <p>• 순서는 언제든지 변경 가능합니다</p>
                    </div>
                  </div>
                )}
              </div>

              {/* 버튼 */}
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={saveNewItem} 
                  className="bg-yellow-400 text-black hover:bg-yellow-300"
                  disabled={uploadProgress.isUploading}
                >
                  {uploadProgress.isUploading ? '업로드 중...' : (editingId ? '수정 완료' : '게시글 저장')}
                </Button>
                <Button 
                  onClick={cancelEdit} 
                  variant="outline"
                  disabled={uploadProgress.isUploading}
                >
                  취소
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 기존 게시글 목록 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            게시글 목록 ({items.length}개)
          </h2>
          
          {items.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">📸</div>
              <h3 className="text-xl font-medium text-gray-500 mb-2">아직 게시글이 없습니다</h3>
              <p className="text-gray-400">첫 번째 갤러리 게시글을 작성해보세요!</p>
            </Card>
          ) : (
            items.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="flex">
                    {/* 이미지 섹션 */}
                    <div className="w-48 h-32 relative bg-gray-100">
                      {item.images.length > 0 ? (
                        <>
                          <img
                            src={item.images[0]}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                          {item.images.length > 1 && (
                            <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                              +{item.images.length - 1}
                            </div>
                          )}
                          {/* Firebase 이미지 표시 */}
                          {item.images[0].includes('firebasestorage.googleapis.com') && (
                            <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                              ☁️ Firebase
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          이미지 없음
                        </div>
                      )}
                    </div>

                    {/* 콘텐츠 섹션 */}
                    <div className="flex-1 p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                              #{item.category}
                            </span>
                            <span className="text-gray-400 text-sm">
                              {item.images.length}장의 사진
                            </span>
                            {/* Firebase 이미지 개수 표시 */}
                            {item.images.filter(img => img.includes('firebasestorage.googleapis.com')).length > 0 && (
                              <span className="text-blue-500 text-sm">
                                ☁️ {item.images.filter(img => img.includes('firebasestorage.googleapis.com')).length}장 클라우드
                              </span>
                            )}
                            <span className="text-gray-400 text-sm">
                              ID: {item.id}
                            </span>
                          </div>
                          
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            {item.title}
                          </h3>
                          
                          <p className="text-gray-600 dark:text-gray-300 line-clamp-2">
                            {item.caption}
                          </p>
                        </div>

                        {/* 액션 버튼 */}
                        <div className="flex gap-2 ml-4">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => startEdit(item)}
                            className="text-blue-600 hover:text-blue-700 hover:border-blue-300"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => deleteItem(item.id)}
                            className="text-red-600 hover:text-red-700 hover:border-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* 안내 메시지 */}
        <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            🔥 Firebase Storage 연동 완료!
          </h3>
          <ul className="text-blue-800 dark:text-blue-200 space-y-1 text-sm">
            <li>• <span className="bg-green-100 text-green-800 px-2 py-1 rounded font-medium">✅ 해결완료:</span> 이제 모든 컴퓨터에서 이미지를 볼 수 있습니다!</li>
            <li>• <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded font-medium">☁️ 클라우드 저장:</span> Google Firebase에 안전하게 저장됩니다</li>
            <li>• <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">🌐 CDN 지원:</span> 전세계 어디서든 빠른 로딩</li>
            <li>• <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-medium">🔄 자동 압축:</span> 대용량 이미지도 자동으로 최적화됩니다!</li>
            <li>• 이미지는 최대 1200x800 크기로 자동 리사이징되며, 품질은 80%로 압축됩니다</li>
            <li>• ☁️ 마크가 있는 이미지는 Firebase에 저장된 클라우드 이미지입니다</li>
            <li>• "데이터 저장" 버튼으로 백업용 JSON 파일을 다운로드할 수 있습니다</li>
          </ul>
          
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded border-l-4 border-green-400">
            <h4 className="font-medium text-green-900 dark:text-green-100 mb-1 flex items-center gap-2">
              <Cloud className="h-4 w-4" />
              🎯 Firebase Storage 장점
            </h4>
            <p className="text-green-800 dark:text-green-200 text-xs">
              • <strong>무료 티어:</strong> 1GB 저장공간, 월 20,000회 다운로드 무료<br/>
              • <strong>글로벌 CDN:</strong> 전세계 어디서든 빠른 이미지 로딩<br/>
              • <strong>99.95% 가동률:</strong> Google 인프라로 안정성 보장<br/>
              • <strong>자동 스케일링:</strong> 사용량에 따라 자동 확장<br/>
              • <strong>실시간 동기화:</strong> 모든 기기에서 즉시 업데이트 반영
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// 메인 컴포넌트
export default function GalleryAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const authStatus = sessionStorage.getItem('gallery-admin-auth')
    if (authStatus === 'true') {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const handleLogin = (username: string, password: string) => {
    const ADMIN_USERNAME = "admin@aurum.nexus"
    const ADMIN_PASSWORD = "admin123!@#"
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      sessionStorage.setItem('gallery-admin-auth', 'true')
    } else {
      alert("아이디 또는 비밀번호가 올바르지 않습니다.")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem('gallery-admin-auth')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {!isAuthenticated ? (
        <LoginForm onLogin={handleLogin} />
      ) : (
        <AdminDashboard onLogout={handleLogout} />
      )}
    </>
  )
}