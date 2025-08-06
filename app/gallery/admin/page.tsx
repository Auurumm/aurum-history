"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X, Upload, Edit, Trash2, Save, Lock, LogOut, Cloud, RefreshCw, Download } from "lucide-react"

// Firebase imports
import { storage, db } from "../../../lib/firebase"
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { collection, addDoc, getDoc, deleteDoc, doc } from 'firebase/firestore'

// Utils imports - 타입 충돌 해결
import { 
  uploadMultipleImages, 
  deleteImageFromFirebase, 
  uploadBase64ToFirebase,
  type UploadResult,
  type UploadProgress
} from "../../../utils/firebaseUtils"

import { 
  saveGalleryItem, 
  updateGalleryItem, 
  deleteGalleryItem, 
  getAllGalleryItems, 
  migrateFromLocalStorage,
  backupToLocalStorage,
  type FirestoreGalleryItem,
  testFirestoreConnection,
  getGalleryItem
} from "../../../utils/firestoreUtils"

// 로컬 타입 정의 (중복 제거)
interface GalleryItem {
  id?: string
  images: string[]
  title: string
  caption: string
  category: string
  size: "normal" | "tall"
}

const categories = ["사무실", "구성원", "일상", "워크숍", "이벤트", "외관"]

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
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const [newItem, setNewItem] = useState({
    title: "",
    caption: "",
    category: "",
    images: [] as string[],
    size: "normal" as "normal" | "tall"
  })
  
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

  // Firebase 디버깅 함수들 (필요 시 사용)
  const debugFirebaseConfig = () => {
    console.group('🔥 Firebase 설정 확인')
    console.log('API Key:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.substring(0, 10) + '...')
    console.log('Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)
    console.log('Storage Bucket:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET)
    console.log('Auth Domain:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN)
    
    const hasRealConfig = 
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.startsWith('AIzaSy') &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
      !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID.includes('dummy')
      
    if (hasRealConfig) {
      console.log('✅ Firebase 설정이 실제 값으로 보입니다')
    } else {
      console.error('❌ Firebase 설정에 더미 값이 포함되어 있습니다!')
      console.error('📝 .env.local 파일에 실제 Firebase 설정값을 추가해주세요!')
    }
    console.groupEnd()
    
    alert(hasRealConfig ? '✅ Firebase 설정 정상 (콘솔 확인)' : '❌ Firebase 설정에 더미 값 포함 (콘솔 확인)')
  }

  const testStorageConnection = async () => {
    try {
      console.group('📡 Firebase Storage 연결 테스트')
      console.log('Storage 인스턴스:', !!storage)
      
      const testData = new Blob(['Firebase Storage connection test'], { type: 'text/plain' })
      const testRef = ref(storage, 'debug/storage-test.txt')
      
      console.log('테스트 파일 경로:', 'debug/storage-test.txt')
      console.log('업로드 시작...')
      
      const snapshot = await uploadBytes(testRef, testData)
      console.log('✅ 업로드 성공:', snapshot.metadata.name)
      
      const downloadURL = await getDownloadURL(snapshot.ref)
      console.log('✅ 다운로드 URL 생성:', downloadURL)
      
      await deleteObject(testRef)
      console.log('✅ 파일 삭제 성공')
      
      console.groupEnd()
      alert('✅ Firebase Storage 연결 테스트 성공!')
      
    } catch (error: any) {
      console.group('❌ Firebase Storage 연결 실패')
      console.error('오류 코드:', error.code)
      console.error('오류 메시지:', error.message)
      console.error('전체 오류:', error)
      console.groupEnd()
      
      alert(`❌ Storage 연결 실패!\n오류: ${error.code}\n메시지: ${error.message}`)
    }
  }

  // 초기 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        console.log('📖 갤러리 데이터 로드 시작...')
        const firestoreItems = await getAllGalleryItems()
        
        if (firestoreItems.length > 0) {
          console.log(`✅ Firestore에서 ${firestoreItems.length}개 아이템 로드됨`)
          setItems(firestoreItems)
          await backupToLocalStorage()
        } else {
          const savedItems = localStorage.getItem('gallery-items')
          if (savedItems) {
            try {
              const parsedItems = JSON.parse(savedItems)
              console.log(`📦 localStorage에서 ${parsedItems.length}개 아이템 로드됨`)
              setItems(parsedItems)
            } catch (error) {
              console.error('localStorage 파싱 실패:', error)
              setItems([])
            }
          } else {
            console.log('📭 데이터가 없습니다.')
            setItems([])
          }
        }
      } catch (error: unknown) {
        console.error('데이터 로드 실패:', error)
        setItems([])
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [])

  // 데이터 새로고침
  const refreshData = async () => {
    setIsLoading(true)
    try {
      const firestoreItems = await getAllGalleryItems()
      setItems(firestoreItems)
      await backupToLocalStorage()
      alert(`✅ 데이터 새로고침 완료! (${firestoreItems.length}개 아이템)`)
    } catch (error) {
      console.error('새로고침 실패:', error)
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류'
      alert(`❌ 새로고침 실패: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  // 이미지 업로드 처리
  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    
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
      
      const results: UploadResult[] = await uploadMultipleImages(
        validFiles,
        (progress) => {
          setUploadProgress(prev => ({
            ...prev,
            current: progress.current,
            total: progress.total,
            fileName: progress.fileName,
            percentage: progress.percentage
          }))
        }
      )
      
      const successfulUploads = results.filter(result => result.success)
      const failedUploads = results.filter(result => !result.success)
      
      if (successfulUploads.length > 0) {
        const imageUrls = successfulUploads.map(result => result.url).filter((url): url is string => url !== undefined)
        
        setNewItem(prev => ({
          ...prev,
          images: [...prev.images, ...imageUrls]
        }))
        
        alert(`✅ ${successfulUploads.length}장의 이미지가 Firebase에 업로드되었습니다!`)
      }
      
      if (failedUploads.length > 0) {
        const errorMessages = failedUploads.map(fail => `• ${fail.fileName}: ${fail.error}`).join('\n')
        alert(`❌ ${failedUploads.length}장의 이미지 업로드 실패:\n${errorMessages}`)
      }
      
    } catch (error: unknown) {
      console.error('업로드 실패:', error)
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류'
      alert(`업로드 중 오류가 발생했습니다: ${errorMessage}`)
    } finally {
      setUploadProgress({
        isUploading: false,
        current: 0,
        total: 0,
        fileName: '',
        percentage: 0
      })
      
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // 이미지 제거
  const removeImage = async (index: number) => {
    const imageUrl = newItem.images[index]
    
    if (confirm('이미지를 삭제하시겠습니까? Firebase에서도 완전히 삭제됩니다.')) {
      if (imageUrl && imageUrl.includes('firebasestorage.googleapis.com')) {
        const deleteResult = await deleteImageFromFirebase(imageUrl)
        if (!deleteResult.success) {
          console.error('Firebase 삭제 실패:', deleteResult.error)
        }
      }
      
      setNewItem(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }))
    }
  }

  // 수정 시작
  const startEdit = (item: GalleryItem) => {
    setEditingId(item.id || '')
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
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
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
      console.log('💾 게시글 저장 시작:', newItem.title)
      
      if (editingId) {
        // 수정
        await updateGalleryItem(editingId, {
          title: newItem.title.trim(),
          caption: newItem.caption.trim(),
          category: newItem.category.trim(),
          images: [...newItem.images],
          size: newItem.size
        })
        
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
        console.log('✅ 게시글 수정 완료')
        alert("✅ 게시글이 성공적으로 수정되었습니다!")
      } else {
        // 새 게시글 생성
        const docId = await saveGalleryItem({
          title: newItem.title.trim(),
          caption: newItem.caption.trim(),
          category: newItem.category.trim(),
          images: [...newItem.images],
          size: newItem.size
        })
        
        const newItemData: GalleryItem = {
          id: docId,
          title: newItem.title.trim(),
          caption: newItem.caption.trim(),
          category: newItem.category.trim(),
          images: [...newItem.images],
          size: newItem.size
        }
        
        const newItems = [newItemData, ...items]
        setItems(newItems)
        console.log('✅ 새 게시글 저장 완료:', docId)
        alert("✅ 게시글이 성공적으로 저장되었습니다!")
      }
      
      // localStorage 백업
      await backupToLocalStorage()
      
      // 폼 초기화
      setNewItem({ title: "", caption: "", category: "", images: [], size: "normal" })
      setIsCreating(false)
      setEditingId(null)
      
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
    } catch (error: unknown) {
      console.error("❌ 게시글 저장 실패:", error)
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류'
      
      if (error instanceof Error) {
        if (error.message.includes('permission-denied')) {
          alert(`❌ 권한이 거부되었습니다!\n\nFirestore 보안 규칙을 확인하세요:\n\nFirebase Console → Firestore Database → 규칙\n\n다음 규칙을 설정하세요:\nmatch /{document=**} {\n  allow read, write: if true;\n}`)
        } else {
          alert(`❌ 게시글 저장 실패!\n\n오류: ${errorMessage}\n\n콘솔에서 자세한 오류를 확인하세요.`)
        }
      }
    }
  }

  // 게시글 삭제
  const deleteItem = async (id: string | undefined) => {
    if (!id) return
    
    const item = items.find(i => i.id === id)
    if (!item) return
    
    if (confirm(`"${item.title}" 게시글을 삭제하시겠습니까?\nFirebase의 이미지들도 함께 삭제됩니다.`)) {
      try {
        // Firebase Storage에서 이미지들 삭제
        for (const imageUrl of item.images) {
          if (imageUrl.includes('firebasestorage.googleapis.com')) {
            await deleteImageFromFirebase(imageUrl)
          }
        }
        
        // Firestore에서 삭제
        await deleteGalleryItem(id)
        
        // 로컬 상태 업데이트
        const newItems = items.filter(item => item.id !== id)
        setItems(newItems)
        
        await backupToLocalStorage()
        
        alert("✅ 게시글과 이미지가 성공적으로 삭제되었습니다!")
      } catch (error: unknown) {
        console.error("삭제 중 오류:", error)
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류'
        alert(`삭제 중 오류가 발생했습니다: ${errorMessage}`)
      }
    }
  }

  // JSON 다운로드
  const downloadJSON = () => {
    try {
      const dataStr = JSON.stringify(items, null, 2)
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
      
      const linkElement = document.createElement('a')
      linkElement.setAttribute('href', dataUri)
      linkElement.setAttribute('download', `gallery-backup-${new Date().toISOString().split('T')[0]}.json`)
      linkElement.click()
    } catch (error: unknown) {
      console.error("JSON 다운로드 실패:", error)
      alert("다운로드에 실패했습니다.")
    }
  }

  // localStorage에서 Firestore로 마이그레이션
  const migrateToFirestore = async () => {
    if (!confirm('localStorage의 데이터를 Firestore로 마이그레이션하시겠습니까?\n이미 Firestore에 있는 데이터와 중복될 수 있습니다.')) {
      return
    }

    try {
      setUploadProgress(prev => ({ ...prev, isUploading: true }))
      
      const result = await migrateFromLocalStorage()
      
      alert(`✅ 마이그레이션 완료!\n\n성공: ${result.success}개\n실패: ${result.failed}개`)
      
      await refreshData()
      
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

  // Base64 이미지 마이그레이션
  const migrateBase64Images = async () => {
    const base64Items = items.filter(item => 
      item.images.some(img => img.startsWith('data:image/'))
    )

    if (base64Items.length === 0) {
      alert('마이그레이션할 Base64 이미지가 없습니다.')
      return
    }

    if (!confirm(`${base64Items.length}개 아이템의 Base64 이미지를 Firebase로 마이그레이션하시겠습니까?`)) {
      return
    }

    setUploadProgress(prev => ({ ...prev, isUploading: true }))
    let totalProcessed = 0
    const totalImages = base64Items.reduce((sum, item) => 
      sum + item.images.filter(img => img.startsWith('data:image/')).length, 0
    )

    try {
      const updatedItems = [...items]

      for (const item of base64Items) {
        const newImages: string[] = []

        for (let i = 0; i < item.images.length; i++) {
          const imageUrl = item.images[i]
          
          if (imageUrl.startsWith('data:image/')) {
            try {
              totalProcessed++
              setUploadProgress(prev => ({
                ...prev,
                current: totalProcessed,
                total: totalImages,
                fileName: `${item.title} - 이미지 ${i + 1}`,
                percentage: Math.round((totalProcessed / totalImages) * 100)
              }))

              const result = await uploadBase64ToFirebase(imageUrl, `${item.title}_${i}.jpg`)
              
              if (result.success && result.url) {
                newImages.push(result.url)
              } else {
                console.error('마이그레이션 실패:', result.error)
                newImages.push(imageUrl)
              }

              await new Promise(resolve => setTimeout(resolve, 500))
            } catch (error) {
              console.error('Base64 변환 실패:', error)
              newImages.push(imageUrl)
            }
          } else {
            newImages.push(imageUrl)
          }
        }

        // Firestore 업데이트
        if (item.id) {
          await updateGalleryItem(item.id, { images: newImages })
        }

        // 로컬 상태 업데이트
        const itemIndex = updatedItems.findIndex(i => i.id === item.id)
        if (itemIndex !== -1) {
          updatedItems[itemIndex] = { ...item, images: newImages }
        }
      }

      setItems(updatedItems)
      await backupToLocalStorage()

      alert(`✅ Base64 이미지 마이그레이션 완료!\n\n처리된 이미지: ${totalImages}장`)

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

  // 통계 계산
  const base64ImageCount = items.reduce((sum, item) => 
    sum + item.images.filter(img => img.startsWith('data:image/')).length, 0
  )

  const firebaseImageCount = items.reduce((sum, item) => 
    sum + item.images.filter(img => img.includes('firebasestorage.googleapis.com')).length, 0
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-yellow-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 pt-24">
      <div className="max-w-6xl mx-auto">
        {/* 업로드 진행률 모달 */}
        <UploadProgressModal progress={uploadProgress} />
        
        {/* Base64 마이그레이션 안내 */}
        {base64ImageCount > 0 && (
          <div className="mb-8 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-orange-500 text-xl">⚠️</div>
              <div>
                <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                  Base64 이미지 마이그레이션 필요
                </h3>
                <p className="text-orange-800 dark:text-orange-200 text-sm mb-3">
                  현재 {base64ImageCount}장의 이미지가 Base64 형태로 저장되어 있어서 다른 컴퓨터에서 볼 수 없습니다. 
                  Firebase로 마이그레이션하면 모든 컴퓨터에서 접근할 수 있습니다.
                </p>
                <Button 
                  onClick={migrateBase64Images}
                  className="bg-orange-500 text-white hover:bg-orange-600"
                  disabled={uploadProgress.isUploading}
                >
                  <Cloud className="h-4 w-4 mr-2" />
                  Base64 이미지 마이그레이션 ({base64ImageCount}장)
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
              <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">Firebase & Firestore</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-300">🌐 클라우드 동기화로 모든 컴퓨터에서 동일한 데이터</p>
            
            <div className="mt-2 flex gap-4 text-sm">
              <span className="text-green-600">☁️ Firebase 이미지: {firebaseImageCount}장</span>
              {base64ImageCount > 0 && (
                <span className="text-orange-600">💾 Base64 이미지: {base64ImageCount}장 (마이그레이션 필요)</span>
              )}
              <span className="text-blue-600">📊 총 게시글: {items.length}개</span>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={refreshData} 
              variant="outline" 
              className="flex items-center gap-2"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              새로고침
            </Button>
            
            <Button 
              onClick={migrateToFirestore} 
              variant="outline" 
              className="flex items-center gap-2 text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              <Upload className="h-4 w-4" />
              localStorage → Firestore
            </Button>
            
            <Button 
              onClick={downloadJSON} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              백업 다운로드
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
          <Card className="mb-8 border-yellow-400 shadow-lg">
            <CardHeader>
              <CardTitle className="text-yellow-600 flex items-center gap-2">
                <Cloud className="h-5 w-5" />
                {editingId ? '갤러리 게시글 수정' : '새 갤러리 게시글 작성'}
                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">Firestore 저장</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">제목 *</label>
                <Input
                  value={newItem.title}
                  onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="갤러리 제목을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">설명 *</label>
                <Textarea
                  value={newItem.caption}
                  onChange={(e) => setNewItem(prev => ({ ...prev, caption: e.target.value }))}
                  placeholder="사진에 대한 설명을 입력하세요"
                  rows={3}
                />
              </div>

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

              <div>
                <label className="block text-sm font-medium mb-2">크기</label>
                <Select value={newItem.size} onValueChange={(value: "normal" | "tall") => setNewItem(prev => ({ ...prev, size: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">일반 크기</SelectItem>
                    <SelectItem value="tall">세로 크기 (2배)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
                  disabled={uploadProgress.isUploading}
                >
                  <div className="text-center">
                    <Cloud className="h-8 w-8 mx-auto mb-2 text-yellow-400" />
                    <p className="text-sm text-gray-600">🔥 Firebase Storage에 업로드</p>
                    <p className="text-xs text-gray-400">
                      여러 장 선택 가능 • 자동 압축 • CDN 지원
                    </p>
                  </div>
                </Button>

                {newItem.images.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-3">
                      업로드된 이미지: {newItem.images.length}장
                    </p>
                    
                    <div className="grid grid-cols-4 gap-3">
                      {newItem.images.map((image, index) => (
                        <div key={index} className="relative">
                          <div className="absolute -top-2 -left-2 bg-yellow-400 text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center z-10">
                            {index + 1}
                          </div>
                          
                          {index === 0 && (
                            <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1 py-0.5 rounded z-10">
                              대표
                            </div>
                          )}

                          {image.includes('firebasestorage.googleapis.com') && (
                            <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded z-10">
                              ☁️
                            </div>
                          )}
                          
                          <div className="group relative">
                            <img
                              src={image}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-20 object-cover rounded border"
                            />
                            
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 z-20"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={saveNewItem} 
                  className="bg-yellow-400 text-black hover:bg-yellow-300"
                  disabled={uploadProgress.isUploading}
                >
                  {uploadProgress.isUploading ? '처리 중...' : (editingId ? '수정 완료' : '게시글 저장')}
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

        {/* 게시글 목록 */}
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
                          {item.images[0].includes('firebasestorage.googleapis.com') && (
                            <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                              ☁️
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          이미지 없음
                        </div>
                      )}
                    </div>

                    <div className="flex-1 p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                              #{item.category}
                            </span>
                            <span className="text-gray-400 text-sm">
                              {item.images.length}장
                            </span>
                            {item.images.filter(img => img.includes('firebasestorage.googleapis.com')).length > 0 && (
                              <span className="text-blue-500 text-sm">
                                ☁️ {item.images.filter(img => img.includes('firebasestorage.googleapis.com')).length}장
                              </span>
                            )}
                            {item.images.filter(img => img.startsWith('data:image/')).length > 0 && (
                              <span className="text-orange-500 text-sm">
                                💾 {item.images.filter(img => img.startsWith('data:image/')).length}장
                              </span>
                            )}
                          </div>
                          
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            {item.title}
                          </h3>
                          
                          <p className="text-gray-600 dark:text-gray-300 line-clamp-2">
                            {item.caption}
                          </p>
                        </div>

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