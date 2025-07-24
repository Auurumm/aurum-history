"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Mail, Lock, User, Phone } from "lucide-react";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !pw || (!isLogin && (!name || !phone || !pwConfirm))) return;
    if (!isLogin && pw !== pwConfirm) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, pw);
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, pw);
        await setDoc(doc(db, "users", cred.user.uid), {
          email,
          name,
          phone,
          role: "pending",
          createdAt: serverTimestamp(),
        });
      }

      router.push("/");
    } catch (error) {
      alert("오류가 발생했습니다.");
      console.error(error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white text-black dark:bg-black dark:text-white px-4">
      <div className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-10 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">
            {isLogin ? "로그인" : "회원가입"}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            오럼의 구성원만 {isLogin ? "로그인" : "회원가입"}할 수 있습니다.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex items-center border px-4 py-3 rounded-md border-gray-300 dark:border-gray-600 bg-transparent">
            <Mail className="h-5 w-5 mr-3 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일 주소"
              className="w-full bg-transparent focus:outline-none text-lg"
              required
            />
          </div>

          <div className="flex items-center border px-4 py-3 rounded-md border-gray-300 dark:border-gray-600 bg-transparent">
            <Lock className="h-5 w-5 mr-3 text-gray-400" />
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="비밀번호"
              className="w-full bg-transparent focus:outline-none text-lg"
              required
            />
          </div>

          {!isLogin && (
            <>
              <div className="flex items-center border px-4 py-3 rounded-md border-gray-300 dark:border-gray-600 bg-transparent">
                <Lock className="h-5 w-5 mr-3 text-gray-400" />
                <input
                  type="password"
                  value={pwConfirm}
                  onChange={(e) => setPwConfirm(e.target.value)}
                  placeholder="비밀번호 확인"
                  className="w-full bg-transparent focus:outline-none text-lg"
                  required
                />
              </div>

              <div className="flex items-center border px-4 py-3 rounded-md border-gray-300 dark:border-gray-600 bg-transparent">
                <User className="h-5 w-5 mr-3 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="이름"
                  className="w-full bg-transparent focus:outline-none text-lg"
                  required
                />
              </div>

              <div className="flex items-center border px-4 py-3 rounded-md border-gray-300 dark:border-gray-600 bg-transparent">
                <Phone className="h-5 w-5 mr-3 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="휴대폰 번호"
                  className="w-full bg-transparent focus:outline-none text-lg"
                  required
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full py-4 rounded-md bg-yellow-400 hover:bg-yellow-500 text-black font-semibold text-lg transition-colors"
          >
            {isLogin ? "로그인" : "회원가입"}
          </button>
        </form>

        <div className="text-center">
          <p className="text-lg">
            {isLogin ? "계정이 없으신가요?" : "이미 계정이 있으신가요?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-yellow-400 hover:underline font-semibold"
            >
              {isLogin ? "회원가입" : "로그인"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
