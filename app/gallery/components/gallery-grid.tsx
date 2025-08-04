"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Filter, X, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

interface GalleryItem {
  id: number
  images: string[] // 배열로 변경 (단일 이미지는 배열에 하나만)
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
  const [cardImageIndices, setCardImageIndices] = useState<{[key: number]: number}>({})
  const [items, setItems] = useState<GalleryItem[]>([])

  // 로컬 스토리지에서 관리자가 작성한 게시글 불러오기
  useEffect(() => {
    const savedItems = localStorage.getItem('gallery-items')
    if (savedItems) {
      try {
        const parsedItems = JSON.parse(savedItems)
        setItems(parsedItems)
      } catch (error) {
        console.error('Failed to load gallery items:', error)
        setItems([]) // 기본값은 빈 배열
      }
    } else {
      setItems([]) // 로컬 스토리지에 데이터가 없으면 빈 배열
    }
  }, [])

  // 관리자에서 데이터 변경 감지 (storage 이벤트 리스닝)
  useEffect(() => {
    const handleStorageChange = () => {
      const savedItems = localStorage.getItem('gallery-items')
      if (savedItems) {
        try {
          const parsedItems = JSON.parse(savedItems)
          setItems(parsedItems)
        } catch (error) {
          console.error('Failed to load updated gallery items:', error)
        }
      }
    }

    // storage 이벤트 리스너 추가 (다른 탭에서 변경사항 감지)
    window.addEventListener('storage', handleStorageChange)
    
    // 같은 탭에서도 변경사항 감지하기 위한 커스텀 이벤트
    window.addEventListener('gallery-updated', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('gallery-updated', handleStorageChange)
    }
  }, [])

  const filteredItems = items.filter((item) => activeCategory === "전체" || item.category === activeCategory)
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
  const changeCardImage = (itemId: number, direction: 'next' | 'prev') => {
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

  // 이미지 클릭 핸들러 (모달 열기)
  const handleImageClick = (item: GalleryItem, imageIndex: number) => {
    openModal(item, imageIndex)
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

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-black text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto">
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
            const currentCardImageIndex = cardImageIndices[item.id] || 0
            const currentImage = item.images[currentCardImageIndex]
            const hasMultipleImages = item.images.length > 1
            
            return (
              <Card
                key={item.id}
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
                      } ${
                        item.id === 3 ? "object-[center_20%]" : "object-center"
                      }`}
                      onClick={() => handleImageClick(item, currentCardImageIndex)}
                    />

                    {/* Multi-image UI - 여러 장일 때만 표시 */}
                    {hasMultipleImages && (
                      <>
                        {/* Image counter */}
                        <div className="absolute top-4 right-4 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium pointer-events-none">
                          {currentCardImageIndex + 1}/{item.images.length}
                        </div>

                        {/* Navigation dots */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1">
                          {item.images.map((_, index) => (
                            <button
                              key={index}
                              onClick={(e) => {
                                e.stopPropagation()
                                setCardImageIndices(prev => ({
                                  ...prev,
                                  [item.id]: index
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

                        {/* Navigation arrows (hover) */}
                        <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              changeCardImage(item.id, 'prev')
                            }}
                            className="p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors pointer-events-auto z-10"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              changeCardImage(item.id, 'next')
                            }}
                            className="p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors pointer-events-auto z-10"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Multi-photo icon */}
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
                  </div>

                  {/* Content - 클릭 시 모달 열기 */}
                  <div 
                    className="p-6 cursor-pointer"
                    onClick={() => handleImageClick(item, currentCardImageIndex)}
                  >
                    <h3 className="text-xl font-bold mb-3 text-yellow-600 dark:text-yellow-400">
                      {item.title}
                    </h3>

                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-4">
                      {item.caption}
                    </p>
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
        {filteredItems.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📸</div>
            <h3 className="text-2xl font-bold text-gray-400 mb-2">아직 사진이 없어요</h3>
            <p className="text-gray-500">선택하신 카테고리의 사진을 준비 중입니다.</p>
          </div>
        )}

        {/* Image Modal */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Navigation Buttons - 여러 장일 때만 표시 */}
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

            {/* Modal Content */}
            <div className="max-w-6xl max-h-full w-full flex flex-col lg:flex-row bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
              {/* Image Section */}
              <div className="flex-1 relative bg-black flex items-center justify-center">
                <img
                  src={selectedItem.images[currentImageIndex]}
                  alt={selectedItem.title}
                  className="max-w-full max-h-full object-contain"
                />
                
                {/* Image counter in modal - 여러 장일 때만 표시 */}
                {selectedItem.images.length > 1 && (
                  <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {selectedItem.images.length}
                  </div>
                )}
              </div>

              {/* Info Section */}
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

                {/* Thumbnail Navigation - 여러 장일 때만 표시 */}
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
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Multi-photo indicator - 여러 장일 때만 표시 */}
                {selectedItem.images.length > 1 && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedItem.images.length}장의 사진
                  </div>
                )}
              </div>
            </div>

            {/* Click outside to close */}
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