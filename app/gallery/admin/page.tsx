"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X, Upload, Eye, Edit, Trash2, Save, Lock, LogOut } from "lucide-react"

interface GalleryItem {
  id: number
  images: string[]
  title: string
  caption: string
  category: string
  size: "normal" | "tall"
}

const categories = ["사무실", "구성원", "일상", "워크숍", "이벤트", "외관"]

// 기본 갤러리 데이터 (초기 설정용)
const defaultGalleryItems: GalleryItem[] = [
  {
    id: 1,
    images: ["/images/gallery/aurum2.webp"],
    title: "따뜻한 회의 공간",
    caption: "아이디어가 모이는 우리의 회의실, 벽돌과 따뜻한 조명이 만드는 아늑한 분위기",
    category: "사무실",
    size: "normal",
  },
  {
    id: 2,
    images: ["/images/gallery/aurum3.webp", "/images/gallery/aurum11.png"],
    title: "활기찬 업무 공간",
    caption: "개성 넘치는 데스크와 포스터들, 우리만의 색깔이 묻어나는 오픈 오피스",
    category: "일상",
    size: "normal",
  },
  {
    id: 3,
    images: ["/images/gallery/aurum11.png", "/images/gallery/aurum10.png", "/images/gallery/aurum8.png"],
    title: "집중의 시간",
    caption: "조용한 오후, 각자의 자리에서 몰입하는 팀원들의 모습",
    category: "일상",
    size: "normal",
  },
  {
    id: 4,
    images: ["/images/gallery/gallery6.jpg"],
    title: "우리가 있는 곳",
    caption: "도심 속 우리의 보금자리, 매일 출근하는 익숙하면서도 특별한 공간",
    category: "외관",
    size: "normal",
  },
  {
    id: 5,
    images: ["/images/gallery/gallery1.jpg", "/images/gallery/image.png", "/images/gallery/aurum7.png", "/images/gallery/aurum8.png"],
    title: "팀 워크샵 & 이벤트",
    caption: "함께 성장하고 즐기는 우리팀의 특별한 순간들",
    category: "구성원",
    size: "normal",
  },
  {
    id: 6,
    images: ["/images/gallery/image.png"],
    title: "수석 개발자의 브레인스토밍 세션",
    caption: "새로운 프로젝트를 위한 아이디어 회의, 모두의 창의성이 빛나는 순간",
    category: "워크숍",
    size: "normal",
  },
  {
    id: 7,
    images: ["/images/gallery/aurum10.png", "/images/gallery/aurum7.png"],
    title: "커피 한 잔의 여유",
    caption: "바쁜 업무 중 잠깐의 휴식, 커피와 함께하는 소소한 대화",
    category: "일상",
    size: "normal",
  },
  {
    id: 8,
    images: ["/images/gallery/aurum8.png"],
    title: "프로젝트 완료 축하",
    caption: "성공적인 프로젝트 마무리를 축하하며, 함께 기뻐하는 우리 팀",
    category: "이벤트",
    size: "normal",
  },
  {
    id: 9,
    images: ["/images/gallery/aurum7.png"],
    title: "집중은 대표님처럼",
    caption: "다들 잘 보셨죠? 집중이란 이런 거예요.",
    category: "이벤트",
    size: "normal",
  },
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

// 메인 관리자 대시보드
function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  
  // 새 게시글 폼 상태
  const [newItem, setNewItem] = useState({
    title: "",
    caption: "",
    category: "",
    images: [] as string[],
    size: "normal" as "normal" | "tall"
  })
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 로컬 스토리지에서 데이터 로드 또는 기본 데이터 설정
  useEffect(() => {
    const loadData = () => {
      try {
        const savedItems = localStorage.getItem('gallery-items')
        if (savedItems) {
          const parsedItems = JSON.parse(savedItems)
          console.log("로컬 스토리지에서 데이터 로드:", parsedItems.length, "개 아이템")
          setItems(parsedItems)
        } else {
          console.log("로컬 스토리지에 데이터 없음, 기본 데이터로 초기화")
          setItems(defaultGalleryItems)
          localStorage.setItem('gallery-items', JSON.stringify(defaultGalleryItems))
        }
      } catch (error) {
        console.error('데이터 로드 실패:', error)
        setItems(defaultGalleryItems)
        localStorage.setItem('gallery-items', JSON.stringify(defaultGalleryItems))
      }
    }

    loadData()
  }, [])

  // 로컬 스토리지에 데이터 저장
  const saveToLocalStorage = (newItems: GalleryItem[]) => {
    try {
      console.log("💾 로컬 스토리지 저장 시작...")
      
      // 데이터 직렬화
      const dataString = JSON.stringify(newItems)
      const dataSize = new Blob([dataString]).size
      
      console.log("저장할 데이터 정보:", {
        itemCount: newItems.length,
        dataSize: (dataSize / 1024 / 1024).toFixed(2) + " MB",
        firstItem: newItems[0] ? {
          id: newItems[0].id,
          title: newItems[0].title,
          imageCount: newItems[0].images.length
        } : "없음"
      })
      
      // 로컬 스토리지 용량 체크 (대략 5MB 제한)
      if (dataSize > 5 * 1024 * 1024) {
        throw new Error("데이터 크기가 너무 큽니다. 이미지 개수를 줄여주세요.")
      }
      
      // 로컬 스토리지에 저장
      localStorage.setItem('gallery-items', dataString)
      
      // 저장 확인
      const savedData = localStorage.getItem('gallery-items')
      if (!savedData) {
        throw new Error("로컬 스토리지 저장 실패")
      }
      
      const parsedSavedData = JSON.parse(savedData)
      if (parsedSavedData.length !== newItems.length) {
        throw new Error("저장된 데이터 개수가 일치하지 않습니다")
      }
      
      console.log("✅ 로컬 스토리지 저장 성공:", parsedSavedData.length, "개 아이템")
      
      // 같은 탭에서 갤러리 페이지에 변경사항을 알리기 위한 커스텀 이벤트 발생
      window.dispatchEvent(new Event('gallery-updated'))
      
    } catch (error) {
      console.error("❌ 로컬 스토리지 저장 실패:", error)
      
      // 구체적인 오류 메시지 제공
      if (error instanceof Error) {
        if (error.name === 'QuotaExceededError' || error.message.includes('QuotaExceededError')) {
          throw new Error("저장 공간이 부족합니다. 이미지 크기를 줄이거나 기존 데이터를 삭제해주세요.")
        } else {
          throw new Error(`저장 실패: ${error.message}`)
        }
      }
      
      throw error
    }
  }

  // 이미지 압축 함수
  const compressImage = (file: File, maxWidth: number = 1200, maxHeight: number = 800, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        // 원본 크기
        const { width: originalWidth, height: originalHeight } = img
        
        // 비율 유지하면서 최대 크기 계산
        let { width, height } = img
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
        
        // 캔버스 크기 설정
        canvas.width = width
        canvas.height = height
        
        // 이미지 그리기
        ctx?.drawImage(img, 0, 0, width, height)
        
        // Base64로 변환 (JPEG, 품질 80%)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
        
        // 압축 결과 로깅
        const originalSize = file.size
        const compressedSize = Math.round((compressedDataUrl.length * 3) / 4) // Base64 크기 추정
        const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1)
        
        console.log(`이미지 압축 완료: ${file.name}`, {
          originalSize: `${(originalSize / 1024 / 1024).toFixed(2)}MB`,
          compressedSize: `${(compressedSize / 1024 / 1024).toFixed(2)}MB`,
          compressionRatio: `${compressionRatio}% 감소`,
          originalDimensions: `${originalWidth}x${originalHeight}`,
          newDimensions: `${width}x${height}`
        })
        
        resolve(compressedDataUrl)
      }
      
      img.onerror = () => {
        console.error('이미지 로드 실패:', file.name)
        reject(new Error(`이미지 로드 실패: ${file.name}`))
      }
      
      // 파일을 이미지로 로드
      const reader = new FileReader()
      reader.onload = (e) => {
        img.src = e.target?.result as string
      }
      reader.onerror = () => {
        reject(new Error(`파일 읽기 실패: ${file.name}`))
      }
      reader.readAsDataURL(file)
    })
  }

  // 이미지 업로드 처리 (압축 포함)
  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      console.log("선택된 파일이 없습니다.")
      return
    }
    
    console.log(`${files.length}개 파일 업로드 및 압축 시작`)
    
    try {
      // 파일 크기 체크 및 압축
      const processedImages = await Promise.all(
        Array.from(files).map(async (file, index) => {
          console.log(`파일 ${index + 1}/${files.length} 처리 중: ${file.name}`)
          console.log(`원본 크기: ${(file.size / 1024 / 1024).toFixed(2)}MB`)
          
          // 이미지 파일 타입 확인
          if (!file.type.startsWith('image/')) {
            throw new Error(`${file.name}은(는) 이미지 파일이 아닙니다.`)
          }
          
          // 파일 크기가 10MB 이상이면 더 강한 압축
          let maxWidth = 1200
          let maxHeight = 800
          let quality = 0.8
          
          if (file.size > 10 * 1024 * 1024) { // 10MB 이상
            maxWidth = 800
            maxHeight = 600
            quality = 0.6
            console.log(`큰 파일 감지: 강한 압축 적용 (${maxWidth}x${maxHeight}, 품질 ${quality})`)
          } else if (file.size > 5 * 1024 * 1024) { // 5MB 이상
            maxWidth = 1000
            maxHeight = 700
            quality = 0.7
            console.log(`중간 크기 파일: 중간 압축 적용 (${maxWidth}x${maxHeight}, 품질 ${quality})`)
          }
          
          // 이미지 압축
          return await compressImage(file, maxWidth, maxHeight, quality)
        })
      )
      
      console.log(`${processedImages.length}개 이미지 압축 완료`)
      
      // 총 데이터 크기 확인
      const totalSize = processedImages.reduce((sum, img) => sum + Math.round((img.length * 3) / 4), 0)
      console.log(`압축된 이미지 총 크기: ${(totalSize / 1024 / 1024).toFixed(2)}MB`)
      
      if (totalSize > 4 * 1024 * 1024) { // 4MB 제한
        alert('압축 후에도 이미지 크기가 너무 큽니다. 이미지 개수를 줄이거나 더 작은 이미지를 사용해주세요.')
        return
      }
      
      setNewItem(prev => {
        const updated = {
          ...prev,
          images: [...prev.images, ...processedImages]
        }
        console.log(`현재 폼의 총 이미지 개수: ${updated.images.length}`)
        return updated
      })
      
      // 파일 입력 필드 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
      // 성공 메시지
      alert(`${processedImages.length}장의 이미지가 자동으로 압축되어 업로드되었습니다!`)
      
    } catch (error) {
      console.error('이미지 업로드/압축 실패:', error)
      if (error instanceof Error) {
        alert(`이미지 처리 실패: ${error.message}`)
      } else {
        alert('이미지 업로드에 실패했습니다. 다시 시도해주세요.')
      }
    }
  }

  // 이미지 제거
  const removeImage = (index: number) => {
    console.log(`이미지 제거: ${index}번째`)
    setNewItem(prev => {
      const updated = {
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }
      console.log(`이미지 제거 후 총 개수: ${updated.images.length}`)
      return updated
    })
  }

  // 수정 시작
  const startEdit = (item: GalleryItem) => {
    console.log("수정 모드 시작:", item.id, item.title)
    setEditingId(item.id)
    setNewItem({
      title: item.title,
      caption: item.caption,
      category: item.category,
      images: [...item.images], // 배열 복사
      size: item.size
    })
    setIsCreating(true)
  }

  // 수정 취소
  const cancelEdit = () => {
    console.log("수정/작성 취소")
    setEditingId(null)
    setIsCreating(false)
    setNewItem({ title: "", caption: "", category: "", images: [], size: "normal" })
  }

  // 새 게시글 저장 또는 수정
  const saveNewItem = async () => {
    console.log("=== 저장 프로세스 시작 ===")
    console.log("현재 폼 상태:", {
      title: newItem.title,
      titleLength: newItem.title?.length || 0,
      caption: newItem.caption,
      captionLength: newItem.caption?.length || 0,
      category: newItem.category,
      imageCount: newItem.images?.length || 0,
      editingId: editingId,
      currentItemsCount: items.length
    })

    // 강화된 입력값 검증
    const titleValid = newItem.title && newItem.title.trim().length > 0
    const captionValid = newItem.caption && newItem.caption.trim().length > 0
    const categoryValid = newItem.category && newItem.category.trim().length > 0
    const imagesValid = newItem.images && Array.isArray(newItem.images) && newItem.images.length > 0

    console.log("상세 검증 결과:", {
      titleValid: titleValid,
      captionValid: captionValid,
      categoryValid: categoryValid,
      imagesValid: imagesValid,
      titleValue: newItem.title,
      captionValue: newItem.caption,
      categoryValue: newItem.category,
      imagesArray: newItem.images
    })

    if (!titleValid || !captionValid || !categoryValid || !imagesValid) {
      const missingFields = []
      if (!titleValid) missingFields.push("제목")
      if (!captionValid) missingFields.push("설명")
      if (!categoryValid) missingFields.push("카테고리")
      if (!imagesValid) missingFields.push("이미지")
      
      const errorMessage = `다음 필드를 입력해주세요: ${missingFields.join(", ")}`
      console.error("❌ 검증 실패:", errorMessage)
      alert(errorMessage)
      return
    }

    console.log("✅ 모든 검증 통과")

    try {
      // 로컬 스토리지 용량 체크
      const currentData = localStorage.getItem('gallery-items') || '[]'
      const currentSize = new Blob([currentData]).size
      console.log("현재 로컬 스토리지 크기:", (currentSize / 1024 / 1024).toFixed(2), "MB")

      if (editingId) {
        // 수정 모드
        console.log("🔄 수정 모드 실행 중... ID:", editingId)
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
        
        console.log("수정된 아이템 배열 길이:", updatedItems.length)
        console.log("수정할 아이템 찾기 결과:", updatedItems.find(item => item.id === editingId) ? "찾음" : "못찾음")
        
        setItems(updatedItems)
        await new Promise(resolve => setTimeout(resolve, 100)) // state 업데이트 대기
        saveToLocalStorage(updatedItems)
        
        console.log("✅ 수정 완료!")
        alert("게시글이 수정되었습니다!")
        
      } else {
        // 새 게시글 모드
        console.log("📝 새 게시글 모드 실행 중...")
        const newId = Date.now() + Math.random() // 고유 ID 보장
        
        const newItemData: GalleryItem = {
          id: newId,
          title: newItem.title.trim(),
          caption: newItem.caption.trim(),
          category: newItem.category.trim(),
          images: [...newItem.images], // 깊은 복사
          size: newItem.size
        }
        
        console.log("새 아이템 생성:", {
          id: newItemData.id,
          title: newItemData.title,
          imageCount: newItemData.images.length,
          category: newItemData.category
        })
        
        const newItems = [newItemData, ...items]
        console.log("새로운 전체 아이템 개수:", newItems.length)
        
        // 상태 업데이트
        setItems(newItems)
        await new Promise(resolve => setTimeout(resolve, 100)) // state 업데이트 대기
        
        // 로컬 스토리지 저장
        saveToLocalStorage(newItems)
        
        console.log("✅ 새 게시글 저장 완료!")
        alert("게시글이 저장되었습니다!")
      }
      
      // 폼 초기화
      console.log("🧹 폼 초기화 시작...")
      setNewItem({ title: "", caption: "", category: "", images: [], size: "normal" })
      setIsCreating(false)
      setEditingId(null)
      
      // 파일 입력 필드도 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
      console.log("✅ 폼 초기화 완료")
      console.log("=== 저장 프로세스 완료 ===")
      
    } catch (error) {
      console.error("❌ 저장 중 치명적 오류:", error)
      console.error("오류 스택:", error instanceof Error ? error.stack : 'No stack trace')
      
      // 로컬 스토리지 용량 초과 여부 확인
      if (error instanceof Error && error.message.includes('QuotaExceededError')) {
        alert("저장 공간이 부족합니다. 이미지 크기를 줄이거나 기존 데이터를 삭제해주세요.")
      } else {
        alert(`저장 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
      }
    }
  }

  // 게시글 삭제
  const deleteItem = (id: number) => {
    console.log("삭제 요청:", id)
    if (confirm("정말 삭제하시겠습니까?")) {
      const newItems = items.filter(item => item.id !== id)
      console.log("삭제 후 아이템 개수:", newItems.length)
      setItems(newItems)
      saveToLocalStorage(newItems)
      console.log("삭제 완료")
    }
  }

  // JSON 다운로드
  const downloadJSON = () => {
    try {
      const dataStr = JSON.stringify(items, null, 2)
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
      
      const exportFileDefaultName = 'gallery-data.json'
      const linkElement = document.createElement('a')
      linkElement.setAttribute('href', dataUri)
      linkElement.setAttribute('download', exportFileDefaultName)
      linkElement.click()
      console.log("JSON 다운로드 완료")
    } catch (error) {
      console.error("JSON 다운로드 실패:", error)
      alert("다운로드에 실패했습니다.")
    }
  }

  // 기본 데이터 복원
  const resetToDefault = () => {
    if (confirm("모든 데이터를 기본값으로 초기화하시겠습니까? 현재 데이터는 모두 삭제됩니다.")) {
      console.log("기본 데이터로 복원 시작...")
      setItems(defaultGalleryItems)
      saveToLocalStorage(defaultGalleryItems)
      console.log("기본 데이터 복원 완료")
      alert("기본 데이터로 복원되었습니다!")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 pt-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">갤러리 관리자</h1>
            <p className="text-gray-600 dark:text-gray-300">게시글처럼 쉽게 갤러리를 관리하세요</p>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={resetToDefault}
              variant="outline"
              className="flex items-center gap-2 text-orange-600 border-orange-300 hover:bg-orange-50"
            >
              <Save className="h-4 w-4" />
              기본값 복원
            </Button>
            
            <Button
              onClick={downloadJSON}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              데이터 저장 ({items.length}개)
            </Button>
            
            <Button
              onClick={() => {
                console.log("새 게시글 작성 모드 시작")
                setIsCreating(true)
              }}
              className="bg-yellow-400 text-black hover:bg-yellow-300 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              새 게시글
            </Button>

            <Button
              onClick={onLogout}
              variant="outline"
              className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              로그아웃
            </Button>
          </div>
        </div>

        {/* 새 게시글 작성 폼 */}
        {isCreating && (
          <div className="relative z-10">
            <Card className="mb-8 border-yellow-400 shadow-lg">
            <CardHeader>
              <CardTitle className="text-yellow-600">
                {editingId ? '갤러리 게시글 수정' : '새 갤러리 게시글 작성'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 제목 */}
              <div>
                <label className="block text-sm font-medium mb-2">제목 *</label>
                <Input
                  value={newItem.title}
                  onChange={(e) => {
                    console.log("제목 변경:", e.target.value)
                    setNewItem(prev => ({ ...prev, title: e.target.value }))
                  }}
                  placeholder="갤러리 제목을 입력하세요"
                />
              </div>

              {/* 설명 */}
              <div>
                <label className="block text-sm font-medium mb-2">설명 *</label>
                <Textarea
                  value={newItem.caption}
                  onChange={(e) => {
                    console.log("설명 변경:", e.target.value.length, "글자")
                    setNewItem(prev => ({ ...prev, caption: e.target.value }))
                  }}
                  placeholder="사진에 대한 설명을 입력하세요"
                  rows={3}
                />
              </div>

              {/* 카테고리 */}
              <div>
                <label className="block text-sm font-medium mb-2">카테고리 *</label>
                <Select 
                  value={newItem.category} 
                  onValueChange={(value) => {
                    console.log("카테고리 변경:", value)
                    setNewItem(prev => ({ ...prev, category: value }))
                  }}
                >
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
                  onChange={(e) => {
                    console.log("파일 선택 이벤트 발생:", e.target.files?.length || 0, "개 파일")
                    handleImageUpload(e.target.files)
                  }}
                  className="hidden"
                />
                
                <Button
                  type="button"
                  onClick={() => {
                    console.log("파일 선택 버튼 클릭")
                    fileInputRef.current?.click()
                  }}
                  variant="outline"
                  className="w-full h-32 border-dashed border-2 hover:border-yellow-400"
                >
                  <div className="text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">클릭해서 이미지를 선택하세요</p>
                    <p className="text-xs text-gray-400">
                      여러 장 선택 가능 (JPG, PNG 등)<br/>
                      <span className="text-green-600 font-medium">🔄 자동 압축 기능 포함!</span><br/>
                      대용량 이미지도 자동으로 최적화됩니다
                    </p>
                  </div>
                </Button>

                {/* 업로드된 이미지 미리보기 */}
                {newItem.images.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">
                        업로드된 이미지: {newItem.images.length}장
                      </p>
                      <p className="text-xs text-green-600">
                        ✅ 모든 이미지가 웹 최적화 완료
                      </p>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      {newItem.images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-20 object-cover rounded border"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 버튼 */}
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={() => {
                    console.log("저장 버튼 클릭")
                    saveNewItem()
                  }} 
                  className="bg-yellow-400 text-black hover:bg-yellow-300"
                >
                  {editingId ? '수정 완료' : '게시글 저장'}
                </Button>
                <Button
                  onClick={cancelEdit}
                  variant="outline"
                >
                  취소
                </Button>
              </div>
            </CardContent>
                      </Card>
          </div>
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
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            💡 사용 방법
          </h3>
          <ul className="text-blue-800 dark:text-blue-200 space-y-1 text-sm">
            <li>• "새 게시글" 버튼으로 갤러리 아이템을 추가하세요</li>
            <li>• 단일 이미지 또는 여러 장의 이미지를 업로드할 수 있습니다</li>
            <li>• <span className="bg-green-100 text-green-800 px-2 py-1 rounded font-medium">🔄 자동 압축:</span> 대용량 이미지도 자동으로 최적화됩니다!</li>
            <li>• 이미지는 최대 1200x800 크기로 자동 리사이징되며, 품질은 80%로 압축됩니다</li>
            <li>• 작성한 게시글은 자동으로 저장되며, 일반 갤러리 페이지에서 바로 확인 가능합니다</li>
            <li>• "데이터 저장" 버튼으로 백업용 JSON 파일을 다운로드할 수 있습니다</li>
            <li>• "기본값 복원" 버튼으로 초기 샘플 데이터로 되돌릴 수 있습니다</li>
            <li>• 브라우저 개발자 도구(F12) 콘솔에서 상세한 압축 로그를 확인할 수 있습니다</li>
          </ul>
          
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded border-l-4 border-green-400">
            <h4 className="font-medium text-green-900 dark:text-green-100 mb-1">
              🎯 이미지 자동 최적화 기능
            </h4>
            <p className="text-green-800 dark:text-green-200 text-xs">
              • 파일 크기에 따라 자동으로 압축 강도 조절<br/>
              • 10MB 이상: 800x600, 품질 60% 압축<br/>
              • 5-10MB: 1000x700, 품질 70% 압축<br/>
              • 5MB 이하: 1200x800, 품질 80% 압축<br/>
              • 최종 결과물은 항상 4MB 이하로 제한
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

  // 컴포넌트 마운트 시 로그인 상태 확인
  useEffect(() => {
    const authStatus = sessionStorage.getItem('gallery-admin-auth')
    console.log("인증 상태 확인:", authStatus)
    if (authStatus === 'true') {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  // 로그인 처리
  const handleLogin = (username: string, password: string) => {
    console.log("로그인 시도:", username)
    // 여기에 실제 admin 계정 정보를 입력하세요
    const ADMIN_USERNAME = "admin@aurum.nexus" // 실제 admin 아이디
    const ADMIN_PASSWORD = "admin123!@#" // 실제 admin 비밀번호
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      console.log("로그인 성공")
      setIsAuthenticated(true)
      sessionStorage.setItem('gallery-admin-auth', 'true')
    } else {
      console.log("로그인 실패")
      alert("아이디 또는 비밀번호가 올바르지 않습니다.")
    }
  }

  // 로그아웃 처리
  const handleLogout = () => {
    console.log("로그아웃")
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