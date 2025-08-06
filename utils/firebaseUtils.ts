// utils/firebaseUtils.ts
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

// 단일 이미지 업로드
export const uploadImageToFirebase = async (file: File): Promise<UploadResult> => {
  try {
    console.log('📤 업로드 시작:', file.name)
    
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: '이미지 파일만 업로드 가능합니다.',
        fileName: file.name
      }
    }

    if (file.size > 10 * 1024 * 1024) {
      return {
        success: false,
        error: '파일 크기는 10MB 이하만 가능합니다.',
        fileName: file.name
      }
    }

    const fileName = `gallery_${Date.now()}_${Math.random().toString(36).substring(2, 15)}.jpg`
    const storageRef = ref(storage, `gallery/${fileName}`)
    
    const snapshot = await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(snapshot.ref)
    
    console.log('✅ 업로드 성공:', downloadURL)
    
    return {
      success: true,
      url: downloadURL,
      fileName: fileName,
      originalName: file.name,
      path: `gallery/${fileName}`
    }
    
  } catch (error: any) {
    console.error('❌ 업로드 실패:', error)
    return {
      success: false,
      error: error.message || '업로드 중 오류가 발생했습니다.',
      fileName: file.name
    }
  }
}

// 다중 이미지 업로드
export const uploadMultipleImages = async (
  files: File[],
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult[]> => {
  const results: UploadResult[] = []
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    
    if (onProgress) {
      onProgress({
        current: i + 1,
        total: files.length,
        fileName: file.name,
        percentage: Math.round(((i + 1) / files.length) * 100)
      })
    }
    
    const result = await uploadImageToFirebase(file)
    results.push(result)
    
    if (i < files.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 300))
    }
  }
  
  return results
}

// Firebase에서 이미지 삭제
export const deleteImageFromFirebase = async (imageUrl: string): Promise<UploadResult> => {
  try {
    if (!imageUrl.includes('firebasestorage.googleapis.com')) {
      return {
        success: false,
        error: 'Firebase Storage 이미지가 아닙니다.',
        url: imageUrl
      }
    }
    
    const url = new URL(imageUrl)
    const pathMatch = url.pathname.match(/\/o\/(.+?)\?/)
    
    if (!pathMatch) {
      return {
        success: false,
        error: '이미지 경로를 찾을 수 없습니다.',
        url: imageUrl
      }
    }
    
    const filePath = decodeURIComponent(pathMatch[1])
    const storageRef = ref(storage, filePath)
    
    await deleteObject(storageRef)
    
    console.log('✅ 삭제 성공:', filePath)
    
    return {
      success: true,
      url: imageUrl,
      path: filePath
    }
    
  } catch (error: any) {
    console.error('❌ 삭제 실패:', error)
    
    if (error.code === 'storage/object-not-found') {
      return {
        success: true,
        url: imageUrl,
        error: '파일이 이미 삭제되었습니다.'
      }
    }
    
    return {
      success: false,
      error: error.message || '삭제 중 오류가 발생했습니다.',
      url: imageUrl
    }
  }
}

// Base64 업로드 (단순화)
export const uploadBase64ToFirebase = async (base64Data: string, fileName?: string): Promise<UploadResult> => {
  try {
    const response = await fetch(base64Data)
    const blob = await response.blob()
    const file = new File([blob], fileName || `migrated_${Date.now()}.jpg`, { type: 'image/jpeg' })
    
    return await uploadImageToFirebase(file)
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Base64 변환 실패',
      fileName: fileName
    }
  }
}