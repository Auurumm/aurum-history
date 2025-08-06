// utils/firestoreUtils.ts
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore'
import { db } from '../lib/firebase'

// 갤러리 아이템 타입
export interface FirestoreGalleryItem {
  id?: string
  images: string[]
  title: string
  caption: string
  category: string
  size: "normal" | "tall"
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

// 갤러리 아이템 저장
export const saveGalleryItem = async (item: Omit<FirestoreGalleryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    console.log('💾 Firestore에 저장 중:', item.title)
    const docRef = await addDoc(collection(db, 'gallery'), {
      ...item,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    console.log('✅ 저장 성공:', docRef.id)
    return docRef.id
  } catch (error) {
    console.error('❌ Firestore 저장 실패:', error)
    throw error
  }
}

// 갤러리 아이템 업데이트
export const updateGalleryItem = async (id: string, item: Partial<FirestoreGalleryItem>): Promise<void> => {
  try {
    console.log('🔄 업데이트 중:', id)
    const docRef = doc(db, 'gallery', id)
    await updateDoc(docRef, {
      ...item,
      updatedAt: serverTimestamp()
    })
    console.log('✅ 업데이트 성공')
  } catch (error) {
    console.error('❌ 업데이트 실패:', error)
    throw error
  }
}

// 갤러리 아이템 삭제
export const deleteGalleryItem = async (id: string): Promise<void> => {
  try {
    console.log('🗑️ 삭제 중:', id)
    await deleteDoc(doc(db, 'gallery', id))
    console.log('✅ 삭제 성공')
  } catch (error) {
    console.error('❌ 삭제 실패:', error)
    throw error
  }
}

// 모든 갤러리 아이템 가져오기
export const getAllGalleryItems = async (): Promise<FirestoreGalleryItem[]> => {
  try {
    console.log('📖 Firestore 조회 중...')
    const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    
    const items = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FirestoreGalleryItem[]
    
    console.log(`✅ 조회 성공: ${items.length}개`)
    return items
  } catch (error) {
    console.error('❌ 조회 실패:', error)
    return []
  }
}

// 단일 갤러리 아이템 가져오기
export const getGalleryItem = async (id: string): Promise<FirestoreGalleryItem | null> => {
  try {
    const docRef = doc(db, 'gallery', id)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as FirestoreGalleryItem
    } else {
      return null
    }
  } catch (error) {
    console.error('❌ 단일 조회 실패:', error)
    return null
  }
}

// localStorage 백업
export const backupToLocalStorage = async (): Promise<void> => {
  try {
    const items = await getAllGalleryItems()
    localStorage.setItem('gallery-items', JSON.stringify(items))
    window.dispatchEvent(new Event('gallery-updated'))
    console.log(`💾 백업 완료: ${items.length}개`)
  } catch (error) {
    console.error('❌ 백업 실패:', error)
  }
}

// localStorage에서 마이그레이션 (단순화)
export const migrateFromLocalStorage = async (): Promise<{ success: number; failed: number }> => {
  try {
    const localData = localStorage.getItem('gallery-items')
    if (!localData) {
      return { success: 0, failed: 0 }
    }

    const items = JSON.parse(localData)
    let success = 0
    let failed = 0

    for (const item of items) {
      try {
        await saveGalleryItem({
          images: item.images,
          title: item.title,
          caption: item.caption,
          category: item.category,
          size: item.size || 'normal'
        })
        success++
      } catch (error) {
        console.error('마이그레이션 실패:', error)
        failed++
      }
    }

    return { success, failed }
  } catch (error) {
    console.error('❌ 마이그레이션 실패:', error)
    throw error
  }
}

// Firestore 연결 테스트
export const testFirestoreConnection = async (): Promise<boolean> => {
  try {
    const testDoc = {
      title: '연결 테스트',
      caption: '테스트',
      category: '테스트',
      images: ['test'],
      size: 'normal' as const
    }
    
    const docRef = await addDoc(collection(db, 'gallery'), testDoc)
    await deleteDoc(docRef)
    
    console.log('✅ Firestore 연결 테스트 성공')
    return true
  } catch (error) {
    console.error('❌ 연결 테스트 실패:', error)
    return false
  }
}