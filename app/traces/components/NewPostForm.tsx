// components/traces/NewPostForm.tsx
"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useUser } from "@/contexts/user-context";

export default function NewPostForm() {
  const user = useUser();
  const [content, setContent] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!user || user.role !== "approved") return alert("승인된 사용자만 글 작성 가능");

    await addDoc(collection(db, "posts"), {
      content,
      userId: user.firebaseUser.uid,
      email: user.firebaseUser.email,
      createdAt: serverTimestamp(),
    });

    setContent("");
  };

  if (!user) return null;

  return user.role === "approved" ? (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full p-2 border rounded"
        placeholder="무엇을 기록할까요?"
      />
      <button className="bg-blue-500 text-white px-4 py-2 rounded">
        글쓰기
      </button>
    </form>
  ) : (
    <p className="text-red-500">관리자의 승인 후 글쓰기가 가능합니다.</p>
  );
}
