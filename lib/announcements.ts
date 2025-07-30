// lib/announcements.ts

import { db } from './firebase'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore'
import { Announcement } from '@/types/announcement'

const COLLECTION = 'announcements'

// 전체 공지 가져오기
export async function getAllAnnouncements(): Promise<Announcement[]> {
  const q = query(
    collection(db, COLLECTION),
    where('published', '==', true),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Announcement[]
}

// 특정 카테고리 가져오기
export async function getAnnouncementsByCategory(category: string): Promise<Announcement[]> {
  const q = query(
    collection(db, COLLECTION),
    where('published', '==', true),
    where('category', '==', category),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Announcement[]
}

// 개별 공지 가져오기
export async function getAnnouncementById(id: string): Promise<Announcement | null> {
  const ref = doc(db, COLLECTION, id)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Announcement
}

// 공지 생성
export async function createAnnouncement(announcement: Omit<Announcement, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...announcement,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  return docRef.id
}

// 공지 수정
export async function updateAnnouncement(id: string, updates: Partial<Announcement>) {
  const ref = doc(db, COLLECTION, id)
  await updateDoc(ref, { ...updates, updatedAt: new Date() })
}

// 공지 삭제
export async function deleteAnnouncement(id: string) {
  const ref = doc(db, COLLECTION, id)
  await deleteDoc(ref)
}
