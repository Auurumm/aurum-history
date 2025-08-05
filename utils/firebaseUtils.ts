// utils/firebaseUtils.ts (확장자를 .ts로 변경)
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '../lib/firebase'

// 타입 정의
export interface UploadResult {
  success: boolean
  url?: string
  fileName?: string
  originalName?: string
  path?: string
  error?: string
}

export interface UploadProgress {
  current: number
  total: number
  fileName: string
  percentage: number
}

// 이미지 압축 함수
export const compressImage = (file: File, maxWidth: number = 1200, maxHeight: number = 800, quality: number = 0.8): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      let { width, height } = img
      
      // 비율 유지하면서 크기 조정
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height
        height = maxHeight
      }
      
      canvas.width = width
      canvas.height = height
      ctx?.drawImage(img, 0, 0, width, height)
      
      // Blob으로 변환
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('이미지 압축 실패'))
          }
        },
        'image/jpeg',
        quality
      )
    }
    
    img.onerror = () => reject(new Error(`이미지 로드 실패: ${file.name}`))
    img.src = URL.createObjectURL(file)
  })
}

// Firebase Storage에 단일 이미지 업로드
export const uploadImageToFirebase = async (file: File): Promise<UploadResult> => {
  try {
    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      throw new Error(`${file.name}은(는) 이미지 파일이 아닙니다.`)
    }

    // 파일 크기 검증 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error(`${file.name}의 크기가 10MB를 초과합니다.`)
    }

    // 파일 압축
    const compressedFile = await compressImage(file)
    
    // 고유한 파일명 생성
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const extension = file.name.split('.').pop() || 'jpg'
    const fileName = `${timestamp}_${randomString}.${extension}`
    
    // Firebase Storage 참조 생성 (gallery/ 폴더에 저장)
    const storageRef = ref(storage, `gallery/${fileName}`)
    
    // 메타데이터 설정
    const metadata = {
      contentType: 'image/jpeg',
      customMetadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString()
      }
    }
    
    // 파일 업로드
    const snapshot = await uploadBytes(storageRef, compressedFile, metadata)
    
    // 다운로드 URL 가져오기
    const downloadURL = await getDownloadURL(snapshot.ref)
    
    return {
      success: true,
      url: downloadURL,
      fileName: fileName,
      originalName: file.name,
      path: `gallery/${fileName}`
    }
  } catch (error) {
    console.error('Firebase 업로드 실패:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      fileName: file.name
    }
  }
}

// 여러 이미지 동시 업로드
export const uploadMultipleImages = async (
  files: File[], 
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult[]> => {
  const results: UploadResult[] = []
  const totalFiles = files.length
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    
    // 진행률 콜백
    if (onProgress) {
      onProgress({
        current: i + 1,
        total: totalFiles,
        fileName: file.name,
        percentage: Math.round(((i + 1) / totalFiles) * 100)
      })
    }
    
    const result = await uploadImageToFirebase(file)
    results.push(result)
    
    // 잠깐 대기 (Firebase 요청 제한 방지)
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  return results
}

// Firebase Storage에서 이미지 삭제
export const deleteImageFromFirebase = async (imageUrl: string): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    // Firebase Storage URL인지 검증
    if (!imageUrl || !imageUrl.includes('firebasestorage.googleapis.com')) {
      return { success: true, message: 'Firebase 이미지가 아닙니다.' }
    }
    
    // URL에서 파일 경로 추출
    const decodedUrl = decodeURIComponent(imageUrl)
    const pathMatch = decodedUrl.match(/\/o\/(.*?)\?/)
    
    if (!pathMatch) {
      throw new Error('유효하지 않은 Firebase URL 형식')
    }
    
    const filePath = pathMatch[1]
    
    // 파일 참조 생성
    const imageRef = ref(storage, filePath)
    
    // 파일 삭제
    await deleteObject(imageRef)
    
    return { 
      success: true, 
      message: '이미지가 Firebase에서 삭제되었습니다.' 
    }
  } catch (error) {
    console.error('Firebase 삭제 실패:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    }
  }
}