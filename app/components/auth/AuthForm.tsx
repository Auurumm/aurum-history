"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");

    if (!email || !pw) {
      setError("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, pw);
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, pw);
        await setDoc(doc(db, "users", cred.user.uid), {
          email,
          role: "pending",
          createdAt: serverTimestamp(),
        });
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white dark:bg-neutral-900 p-8 shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-black dark:text-white">
        {isLogin ? "로그인" : "회원가입"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일 주소"
          className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-neutral-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="비밀번호"
          className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-neutral-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        <button
          type="submit"
          className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-white font-semibold rounded-md transition"
        >
          {isLogin ? "로그인" : "회원가입"}
        </button>
      </form>

      <p className="text-sm text-center mt-6 text-gray-600 dark:text-gray-400">
        {isLogin ? "계정이 없으신가요?" : "이미 계정이 있으신가요?"}
        <span
          onClick={() => setIsLogin(!isLogin)}
          className="ml-1 text-yellow-600 hover:underline cursor-pointer"
        >
          {isLogin ? "회원가입" : "로그인"}
        </span>
      </p>
    </div>
  );
}
