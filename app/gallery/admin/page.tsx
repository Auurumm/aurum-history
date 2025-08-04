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
    const savedItems = localStorage.getItem('gallery-items')
    if (savedItems) {
      try {
        const parsedItems = JSON.parse(savedItems)
        setItems(parsedItems)
      } catch (error) {
        console.error('Failed to load gallery items:', error)
        // 파싱 실패 시 기본 데이터로 초기화
        setItems(defaultGalleryItems)
        localStorage.setItem('gallery-items', JSON.stringify(defaultGalleryItems))
      }
    } else {
      // 로컬 스토리지에 데이터가 없으면 기본 데이터로 초기화
      setItems(defaultGalleryItems)
      localStorage.setItem('gallery-items', JSON.stringify(defaultGalleryItems))
    }
  }, [])

  // 로컬 스토리지에 데이터 저장
  const saveToLocalStorage = (newItems: GalleryItem[]) => {
    localStorage.setItem('gallery-items', JSON.stringify(newItems))
    // 같은 탭에서 갤러리 페이지에 변경사항을 알리기 위한 커스텀 이벤트 발생
    window.dispatchEvent(new Event('gallery-updated'))
  }

  // 이미지를 base64로 변환하는 함수
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  // 이미지 업로드 처리
  const handleImageUpload = async (files: FileList | null) => {
    if (!files) return
    
    try {
      // 모든 파일을 base64로 변환
      const base64Images = await Promise.all(
        Array.from(files).map(file => convertToBase64(file))
      )
      
      setNewItem(prev => ({
        ...prev,
        images: [...prev.images, ...base64Images]
      }))
    } catch (error) {
      console.error('이미지 변환 실패:', error)
      alert('이미지 업로드에 실패했습니다.')
    }
  }

  // 이미지 제거
  const removeImage = (index: number) => {
    setNewItem(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  // 수정 시작
  const startEdit = (item: GalleryItem) => {
    setEditingId(item.id)
    setNewItem({
      title: item.title,
      caption: item.caption,
      category: item.category,
      images: item.images,
      size: item.size
    })
    setIsCreating(true)
  }

  // 수정 취소
  const cancelEdit = () => {
    setEditingId(null)
    setIsCreating(false)
    setNewItem({ title: "", caption: "", category: "", images: [], size: "normal" })
  }

  // 새 게시글 저장 또는 수정
  const saveNewItem = () => {
    if (!newItem.title || !newItem.caption || !newItem.category || newItem.images.length === 0) {
      alert("모든 필드를 입력해주세요!")
      return
    }

    if (editingId) {
      // 수정 모드
      const updatedItems = items.map(item => 
        item.id === editingId 
          ? {
              ...item,
              title: newItem.title,
              caption: newItem.caption,
              category: newItem.category,
              images: newItem.images,
              size: newItem.size
            }
          : item
      )
      setItems(updatedItems)
      saveToLocalStorage(updatedItems)
      alert("게시글이 수정되었습니다!")
    } else {
      // 새 게시글 모드
      const item: GalleryItem = {
        id: Date.now(),
        title: newItem.title,
        caption: newItem.caption,
        category: newItem.category,
        images: newItem.images,
        size: newItem.size
      }
      const newItems = [item, ...items]
      setItems(newItems)
      saveToLocalStorage(newItems)
      alert("게시글이 저장되었습니다!")
    }
    
    setNewItem({ title: "", caption: "", category: "", images: [], size: "normal" })
    setIsCreating(false)
    setEditingId(null)
  }

  // 게시글 삭제
  const deleteItem = (id: number) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      const newItems = items.filter(item => item.id !== id)
      setItems(newItems)
      saveToLocalStorage(newItems)
    }
  }

  // JSON 다운로드
  const downloadJSON = () => {
    const dataStr = JSON.stringify(items, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = 'gallery-data.json'
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

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
              onClick={() => setIsCreating(true)}
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
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full h-32 border-dashed border-2 hover:border-yellow-400"
                >
                  <div className="text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">클릭해서 이미지를 선택하세요</p>
                    <p className="text-xs text-gray-400">여러 장 선택 가능 (JPG, PNG 등 / 각 파일 5MB 이하 권장)</p>
                  </div>
                </Button>

                {/* 업로드된 이미지 미리보기 */}
                {newItem.images.length > 0 && (
                  <div className="grid grid-cols-4 gap-3 mt-4">
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
                )}
              </div>

              {/* 버튼 */}
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={saveNewItem} 
                  className="bg-yellow-400 text-black hover:bg-yellow-300"
                >
                  {editingId ? '수정 완료' : '게시글 저장'}
                </Button>
                <Button
                  onClick={editingId ? cancelEdit : () => {
                    setIsCreating(false)
                    setNewItem({ title: "", caption: "", category: "", images: [], size: "normal" })
                  }}
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
            <li>• 작성한 게시글은 자동으로 저장되며, 일반 갤러리 페이지에서 바로 확인 가능합니다</li>
            <li>• "데이터 저장" 버튼으로 백업용 JSON 파일을 다운로드할 수 있습니다</li>
            <li>• "기본값 복원" 버튼으로 초기 샘플 데이터로 되돌릴 수 있습니다</li>
          </ul>
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
    if (authStatus === 'true') {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  // 로그인 처리
  const handleLogin = (username: string, password: string) => {
    // 여기에 실제 admin 계정 정보를 입력하세요
    const ADMIN_USERNAME = "admin@aurum.nexus" // 실제 admin 아이디
    const ADMIN_PASSWORD = "admin123!@#" // 실제 admin 비밀번호
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      sessionStorage.setItem('gallery-admin-auth', 'true')
    } else {
      alert("아이디 또는 비밀번호가 올바르지 않습니다.")
    }
  }

  // 로그아웃 처리
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