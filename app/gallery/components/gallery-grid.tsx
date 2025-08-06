"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Filter, X, ChevronLeft, ChevronRight, MoreHorizontal, RefreshCw, Cloud } from "lucide-react"
import { getAllGalleryItems, FirestoreGalleryItem } from "../../../utils/firestoreUtils"

interface GalleryItem {
  id?: string
  images: string[]
  title: string
  caption: string
  category: string
  size: "normal" | "tall"
}

const categories = ["전체", "사무실", "구성원", "일상", "워크숍", "이벤트", "외관"]

export default function GalleryGrid() {
  const [activeCategory, setActiveCategory] = useState("전체")
  const [visibleItems, setVisibleItems] = useState(6)
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [cardImageIndices, setCardImageIndices] = useState<{[key: string]: number}>({})
  const [items, setItems] = useState<GalleryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Firestore에서 데이터 로드
  const loadGalleryData = async () => {
    setIsLoading(true)
    try {
      // Firestore에서 최신 데이터 가져오기
      const firestoreItems = await getAllGalleryItems()
      
      if (firestoreItems.length > 0) {
        console.log(`✅ Firestore에서 ${firestoreItems.length}개 갤러리 아이템 로드됨`)
        setItems(firestoreItems)
        setLastUpdate(new Date())
        
        // Firestore 데이터를 localStorage에도 백업 저장
        try {
          localStorage.setItem('gallery-items', JSON.stringify(firestoreItems))
        } catch (error) {
          console.warn('localStorage 백업 실패:', error)
        }
      } else {
        // Firestore에 데이터가 없으면 localStorage 폴백
        const savedItems = localStorage.getItem('gallery-items')
        if (savedItems) {
          try {
            const parsedItems = JSON.parse(savedItems)
            console.log(`📦 localStorage에서 ${parsedItems.length}개 아이템 로드됨 (폴백)`)
            setItems(parsedItems)
          } catch (error) {
            console.error('localStorage 파싱 실패:', error)
            setItems([])
          }
        } else {
          console.log('📭 갤러리 데이터가 없습니다.')
          setItems([])
        }
      }
    } catch (error: unknown) {
      console.error('갤러리 데이터 로드 실패:', error)
      
      // 오류 발생시 localStorage 폴백
      try {
        const savedItems = localStorage.getItem('gallery-items')
        if (savedItems) {
          const parsedItems = JSON.parse(savedItems)
          console.log(`🔄 오류 폴백: localStorage에서 ${parsedItems.length}개 아이템 로드됨`)
          setItems(parsedItems)
        } else {
          setItems([])
        }
      } catch (localError) {
        console.error('localStorage 폴백도 실패:', localError)
        setItems([])
      }
    } finally {
      setIsLoading(false)
    }
  }

  // 초기 데이터 로드
  useEffect(() => {
    loadGalleryData()
  }, [])

  // 관리자에서 데이터 변경 감지
  useEffect(() => {
    const handleStorageChange = (e?: StorageEvent) => {
      // 다른 탭에서 localStorage가 변경된 경우에만 반응
      if (e && e.key === 'gallery-items') {
        console.log('🔄 다른 탭에서 갤러리 데이터 변경 감지됨')
        loadGalleryData()
      }
    }

    const handleGalleryUpdate = () => {
      console.log('🔄 갤러리 업데이트 이벤트 감지됨')
      loadGalleryData()
    }

    // 다른 탭에서 localStorage 변경 감지
    window.addEventListener('storage', handleStorageChange)
    
    // 같은 탭에서 갤러리 업데이트 감지
    window.addEventListener('gallery-updated', handleGalleryUpdate)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('gallery-updated', handleGalleryUpdate)
    }
  }, [])

  // 주기적 데이터 새로고침 (5분마다)
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 주기적 갤러리 데이터 새로고침')
      loadGalleryData()
    }, 5 * 60 * 1000) // 5분

    return () => clearInterval(interval)
  }, [])

  const filteredItems = items.filter((item) => 
    activeCategory === "전체" || item.category === activeCategory
  )
  const displayedItems = filteredItems.slice(0, visibleItems)

  const loadMore = () => {
    setVisibleItems((prev) => Math.min(prev + 6, filteredItems.length))
  }

  const openModal = (item: GalleryItem, imageIndex: number = 0) => {
    setSelectedItem(item)
    setCurrentImageIndex(imageIndex)
  }

  const closeModal = () => {
    setSelectedItem(null)
  }

  const goToNext = () => {
    if (!selectedItem) return
    const nextIndex = (currentImageIndex + 1) % selectedItem.images.length
    setCurrentImageIndex(nextIndex)
  }

  const goToPrevious = () => {
    if (!selectedItem) return
    const prevIndex = currentImageIndex === 0 ? selectedItem.images.length - 1 : currentImageIndex - 1
    setCurrentImageIndex(prevIndex)
  }

  // 카드 내 이미지 변경
  const changeCardImage = (itemId: string | undefined, direction: 'next' | 'prev') => {
    if (!itemId) return
    
    const item = items.find(i => i.id === itemId)
    if (!item || item.images.length <= 1) return

    const currentIndex = cardImageIndices[itemId] || 0
    let newIndex
    
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % item.images.length
    } else {
      newIndex = currentIndex === 0 ? item.images.length - 1 : currentIndex - 1
    }
    
    setCardImageIndices(prev => ({
      ...prev,
      [itemId]: newIndex
    }))
  }

  // 키보드 이벤트 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedItem) return
      
      switch (e.key) {
        case 'Escape':
          closeModal()
          break
        case 'ArrowLeft':
          goToPrevious()
          break
        case 'ArrowRight':
          goToNext()
          break
      }
    }

    if (selectedItem) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    } else {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [selectedItem, currentImageIndex])

  // 수동 새로고침
  const handleRefresh = () => {
    loadGalleryData()
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-black text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto">
        {/* 상태 표시 헤더 */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Cloud className="h-4 w-4 text-green-500" />
              <span>Firestore 연동</span>
            </div>
            <div className="text-sm text-gray-500">
              마지막 업데이트: {lastUpdate.toLocaleTimeString()}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
              새로고침
            </Button>
          </div>
          
          {isLoading && (
            <div className="text-center py-4">
              <RefreshCw className="h-6 w-6 animate-spin text-yellow-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">갤러리 데이터를 불러오는 중...</p>
            </div>
          )}
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <Filter className="h-5 w-5 text-yellow-400 mr-2 mt-1" />
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setActiveCategory(category)
                setVisibleItems(6)
              }}
              className={
                activeCategory === category
                  ? "bg-yellow-400 text-black hover:bg-yellow-300 dark:bg-yellow-300 dark:text-black"
                  : "border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-yellow-500 bg-transparent dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-yellow-400"
              }
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {displayedItems.map((item) => {
            const itemId = item.id || `temp-${Math.random()}`
            const currentCardImageIndex = cardImageIndices[itemId] || 0
            const currentImage = item.images[currentCardImageIndex]
            const hasMultipleImages = item.images.length > 1
            
            return (
              <Card
                key={itemId}
                className={`bg-white/80 dark:bg-gray-900/30 border-gray-300 dark:border-gray-800 hover:border-yellow-400/50 transition-all duration-300 hover:-translate-y-2 group overflow-hidden cursor-pointer ${
                  item.size === "tall" ? "md:row-span-2" : ""
                }`}
              >
                <CardContent className="p-0">
                  {/* Image */}
                  <div className="relative overflow-hidden">
                    <img
                      src={currentImage || "/placeholder.svg"}
                      alt={item.title}
                      className={`w-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer ${
                        item.size === "tall" ? "h-96 md:h-full" : "h-64"
                      } object-center`}
                      onClick={() => openModal(item, currentCardImageIndex)}
                    />

                    {/* Multi-image UI */}
                    {hasMultipleImages && (
                      <>
                        <div className="absolute top-4 right-4 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium pointer-events-none">
                          {currentCardImageIndex + 1}/{item.images.length}
                        </div>

                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1">
                          {item.images.map((_, index) => (
                            <button
                              key={index}
                              onClick={(e) => {
                                e.stopPropagation()
                                setCardImageIndices(prev => ({
                                  ...prev,
                                  [itemId]: index
                                }))
                              }}
                              className={`w-2 h-2 rounded-full transition-colors z-10 ${
                                index === currentCardImageIndex 
                                  ? 'bg-yellow-400' 
                                  : 'bg-white/50 hover:bg-white/80'
                              }`}
                            />
                          ))}
                        </div>

                        <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              changeCardImage(itemId, 'prev')
                            }}
                            className="p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors pointer-events-auto z-10"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              changeCardImage(itemId, 'next')
                            }}
                            className="p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors pointer-events-auto z-10"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="absolute bottom-4 right-4 pointer-events-none">
                          <MoreHorizontal className="h-5 w-5 text-white drop-shadow-lg" />
                        </div>
                      </>
                    )}

                    {/* Category Tag */}
                    <div className="absolute top-4 left-4 pointer-events-none">
                      <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-medium">
                        #{item.category}
                      </span>
                    </div>

                    {/* Firebase 표시 */}
                    {currentImage?.includes('firebasestorage.googleapis.com') && (
                      <div className="absolute top-4 left-20 pointer-events-none">
                        <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          ☁️ Firebase
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div 
                    className="p-6 cursor-pointer"
                    onClick={() => openModal(item, currentCardImageIndex)}
                  >
                    <h3 className="text-xl font-bold mb-3 text-yellow-600 dark:text-yellow-400">
                      {item.title}
                    </h3>

                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-4">
                      {item.caption}
                    </p>

                    {/* 이미지 저장소 정보 */}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{item.images.length}장의 사진</span>
                      {item.images.filter(img => img.includes('firebasestorage.googleapis.com')).length > 0 && (
                        <span className="text-blue-500">
                          ☁️ {item.images.filter(img => img.includes('firebasestorage.googleapis.com')).length}장 클라우드
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Load More Button */}
        {visibleItems < filteredItems.length && (
          <div className="text-center">
            <Button
              onClick={loadMore}
              size="lg"
              className="px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: "#facc15",
                color: "#000000",
              }}
            >
              더 많은 사진 보기 ({filteredItems.length - visibleItems}장 더)
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredItems.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📸</div>
            <h3 className="text-2xl font-bold text-gray-400 mb-2">아직 사진이 없어요</h3>
            <p className="text-gray-500 mb-4">선택하신 카테고리의 사진을 준비 중입니다.</p>
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="h-4 w-4" />
              다시 불러오기
            </Button>
          </div>
        )}

        {/* 연결 상태 정보 */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-full text-sm text-green-700 dark:text-green-300">
            <Cloud className="h-4 w-4" />
            <span>Firebase Firestore 연결됨</span>
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          </div>
        </div>

        {/* Image Modal */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            {selectedItem.images.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            <div className="max-w-6xl max-h-full w-full flex flex-col lg:flex-row bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
              <div className="flex-1 relative bg-black flex items-center justify-center">
                <img
                  src={selectedItem.images[currentImageIndex]}
                  alt={selectedItem.title}
                  className="max-w-full max-h-full object-contain"
                />
                
                {selectedItem.images.length > 1 && (
                  <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {selectedItem.images.length}
                  </div>
                )}

                {/* Firebase 표시 */}
                {selectedItem.images[currentImageIndex]?.includes('firebasestorage.googleapis.com') && (
                  <div className="absolute bottom-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                    ☁️ Firebase
                  </div>
                )}
              </div>

              <div className="lg:w-80 p-6 bg-white dark:bg-gray-900">
                <div className="mb-4">
                  <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-medium">
                    #{selectedItem.category}
                  </span>
                </div>
                
                <h2 className="text-2xl font-bold mb-4 text-yellow-600 dark:text-yellow-400">
                  {selectedItem.title}
                </h2>
                
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                  {selectedItem.caption}
                </p>

                {selectedItem.images.length > 1 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">모든 사진</h4>
                    <div className="grid grid-cols-4 gap-2">
                      {selectedItem.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`relative aspect-square rounded overflow-hidden transition-all ${
                            index === currentImageIndex 
                              ? 'ring-2 ring-yellow-400' 
                              : 'opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {image.includes('firebasestorage.googleapis.com') && (
                            <div className="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-bl text-xs flex items-center justify-center">
                              <span className="text-white text-[8px]">☁</span>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                  <div>{selectedItem.images.length}장의 사진</div>
                  {selectedItem.images.filter(img => img.includes('firebasestorage.googleapis.com')).length > 0 && (
                    <div className="text-blue-500">
                      ☁️ {selectedItem.images.filter(img => img.includes('firebasestorage.googleapis.com')).length}장이 Firebase에 저장됨
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div 
              className="absolute inset-0 -z-10" 
              onClick={closeModal}
            ></div>
          </div>
        )}
      </div>
    </section>
  )
}