// app/api/create-employee/route.ts
import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';

// Firebase Admin 초기화 (한 번만)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, phone, gender, birthYear, address, joinDate, position, department, note } = await request.json();

    // 1. Firebase Auth에 사용자 생성
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    // 2. Firestore에 사용자 정보 저장
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      email,
      name,
      phone: phone || '',
      gender: gender || '남',
      birthYear: birthYear || '',
      address: address || '',
      joinDate: joinDate || '',
      position: position || '주임',
      department: department || '없음',
      note: note || '',
      profileImage: '',
      role: 'approved',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ 
      success: true, 
      uid: userRecord.uid,
      message: '직원 등록이 완료되었습니다.'
    });
  } catch (error: any) {
    console.error('직원 등록 실패:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}