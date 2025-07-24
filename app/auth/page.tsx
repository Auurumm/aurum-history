"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { Mail, Lock, User, Phone, AtSign } from "lucide-react";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState(""); // 🔥 닉네임 필드 추가
  const [phone, setPhone] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !pw || (!isLogin && (!name || !nickname || !phone || !pwConfirm))) {
      setError("모든 항목을 입력해주세요.");
      return;
    }

    if (!isLogin && pw !== pwConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (pw.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return;
    }

    // 🔥 닉네임 유효성 검사
    if (!isLogin) {
      if (nickname.length < 2 || nickname.length > 10) {
        setError("닉네임은 2-10자 사이여야 합니다.");
        return;
      }
      if (!/^[a-zA-Z0-9가-힣_]+$/.test(nickname)) {
        setError("닉네임은 한글, 영문, 숫자, 언더바(_)만 사용 가능합니다.");
        return;
      }
    }

    try {
      if (isLogin) {
        const cred = await signInWithEmailAndPassword(auth, email, pw);
        const userDoc = await getDoc(doc(db, "users", cred.user.uid));
        const userData = userDoc.data();

        if (!userDoc.exists() || userData?.role !== "approved") {
          setError("아직 관리자 승인 대기 중입니다.\n승인 후 로그인이 가능합니다.");
          return;
        }

        // 🔥 닉네임으로 환영 메시지 표시
        const displayName = userData.nickname || userData.name;
        setSuccess(`오럼의 멋진 전사 ${displayName}님, 환영합니다!`);
        
        setTimeout(() => {
          router.push("/traces");
        }, 2000);

      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, pw);
        
        // 🔥 닉네임 포함해서 사용자 정보 저장
        await setDoc(doc(db, "users", cred.user.uid), {
          email,
          name,
          nickname, // 닉네임 저장
          phone,
          role: "pending",
          createdAt: serverTimestamp(),
        });

        setSuccess("회원가입 완료! 관리자의 승인 후 로그인할 수 있습니다.");
        
        setTimeout(() => {
          setIsLogin(true);
          setSuccess("");
        }, 3000);
      }
    } catch (err: any) {
      const msg =
        err?.code === "auth/email-already-in-use"
          ? "이미 사용 중인 이메일입니다."
          : err?.code === "auth/weak-password"
          ? "비밀번호가 너무 약합니다."
          : err?.code === "auth/invalid-email"
          ? "유효하지 않은 이메일 주소입니다."
          : err?.code === "auth/user-not-found"
          ? "등록되지 않은 이메일입니다."
          : err?.code === "auth/wrong-password"
          ? "비밀번호가 올바르지 않습니다."
          : err?.message || "오류가 발생했습니다.";
      setError(msg);
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
          {error && (
            <div className="text-red-500 text-sm text-center font-semibold bg-red-50 dark:bg-red-900/20 p-3 rounded-md whitespace-pre-line">
              {error}
            </div>
          )}
          
          {success && (
            <div className="text-green-600 text-sm text-center font-semibold bg-green-50 dark:bg-green-900/20 p-3 rounded-md whitespace-pre-line">
              {success}
            </div>
          )}

          <InputField
            icon={<Mail className="h-5 w-5 mr-3 text-gray-400" />}
            type="email"
            value={email}
            setValue={setEmail}
            placeholder="이메일 주소"
          />

          <InputField
            icon={<Lock className="h-5 w-5 mr-3 text-gray-400" />}
            type="password"
            value={pw}
            setValue={setPw}
            placeholder="비밀번호"
          />

          {!isLogin && (
            <>
              <InputField
                icon={<Lock className="h-5 w-5 mr-3 text-gray-400" />}
                type="password"
                value={pwConfirm}
                setValue={setPwConfirm}
                placeholder="비밀번호 확인"
              />
              <InputField
                icon={<User className="h-5 w-5 mr-3 text-gray-400" />}
                type="text"
                value={name}
                setValue={setName}
                placeholder="실명 (관리자 확인용)"
              />
              {/* 🔥 닉네임 입력 필드 */}
              <InputField
                icon={<AtSign className="h-5 w-5 mr-3 text-gray-400" />}
                type="text"
                value={nickname}
                setValue={setNickname}
                placeholder="닉네임 (게시글에 표시될 이름)"
              />
              <InputField
                icon={<Phone className="h-5 w-5 mr-3 text-gray-400" />}
                type="tel"
                value={phone}
                setValue={setPhone}
                placeholder="휴대폰 번호"
              />
            </>
          )}

          <button
            type="submit"
            disabled={!!success}
            className="w-full py-4 rounded-md bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-black font-semibold text-lg transition-colors"
          >
            {success ? "처리 중..." : isLogin ? "로그인" : "회원가입"}
          </button>
        </form>

        <div className="text-center">
          <p className="text-lg">
            {isLogin ? "계정이 없으신가요?" : "이미 계정이 있으신가요?"}{" "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setSuccess("");
              }}
              className="text-yellow-400 hover:underline font-semibold"
              disabled={!!success}
            >
              {isLogin ? "회원가입" : "로그인"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function InputField({
  icon,
  type,
  value,
  setValue,
  placeholder,
}: {
  icon: React.ReactNode;
  type: string;
  value: string;
  setValue: (val: string) => void;
  placeholder: string;
}) {
  return (
    <div className="flex items-center border px-4 py-3 rounded-md border-gray-300 dark:border-gray-600 bg-transparent">
      {icon}
      <input
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent focus:outline-none text-lg"
        required
      />
    </div>
  );
}