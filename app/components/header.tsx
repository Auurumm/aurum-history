"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Moon, Sun, Menu, X, ChevronDown, User, LogOut, UserCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "../contexts/theme-context"
import Link from "next/link"
import { useLanguage } from "@/app/contexts/language-context"
import LanguageSwitcher from "./language-switcher"
import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"

interface UserData {
  uid: string;
  name: string;
  nickname?: string; // 🔥 optional로 변경
  email: string;
  profileImage?: string;
  role: string;
}

export default function Header() {
  const { theme, toggleTheme } = useTheme()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [user, setUser] = useState<UserData | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()
  const { t, locale } = useLanguage()

  // 🔥 사용자 인증 상태 확인
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          const userData = userDoc.data();
          
          if (userDoc.exists() && userData) {
            setUser({
              uid: firebaseUser.uid,
              name: userData.name,
              nickname: userData.nickname,
              email: userData.email,
              profileImage: userData.profileImage,
              role: userData.role,
            });
          }
        } catch (error) {
          console.error("사용자 정보 가져오기 오류:", error);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getLocalizedPath = (path: string) => {
    return locale === "en" ? `/en${path}` : path
  }

  const menuItems = [
    {
      title: t("company"),
      columns: [
        {
          category: "",
          items: [
            { name: t("welcome"), href: getLocalizedPath("/company-info") },
            { name: t("culture"), href: getLocalizedPath("/message") },
            { name: t("history"), href: getLocalizedPath("/history") },
          ],
        },
      ],
    },
    {
      title: t("services"),
      columns: [
        {
          category: "",
          items: [
            { name: t("brand"), href: getLocalizedPath("/brand") },
            { name: t("marketing"), href: getLocalizedPath("/marketing") },
            { name: t("entertainment"), href: getLocalizedPath("/entertainment") },
            { name: t("life"), href: getLocalizedPath("/life") },
          ],
        },
      ],
    },
    {
      title: t("responsibility"),
      columns: [
        {
          category: "",
          items: [
            { name: t("gallery"), href: getLocalizedPath("/gallery") },
            { name: t("members"), href: getLocalizedPath("/members") },
            { name: t("recruitment"), href: getLocalizedPath("/career") },
          ],
        },
      ],
    },
    {
      title: t("community"),
      columns: [
        {
          category: "",
          items: [
            { name: t("announcements"), href: getLocalizedPath("/announcements") },
            { name: t("traces"), href: getLocalizedPath("/traces") },
            { name: t("wonders"), href: getLocalizedPath("/wonders") },
          ],
        },
      ],
    },
  ]

  const handleMouseEnter = (title: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setActiveDropdown(title)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null)
    }, 300)
  }

  const handleDropdownMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  const handleDropdownMouseLeave = () => {
    setActiveDropdown(null)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setIsSearchOpen(false)
    }
  }

  // 🔥 로그아웃 처리
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUserMenuOpen(false);
      router.push("/auth"); // "/auth/login" → "/auth"로 변경
    } catch (error) {
      console.error("로그아웃 오류:", error);
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="absolute inset-0 bg-white dark:bg-black"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-between h-24">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link
                href={getLocalizedPath("/")}
                className="flex items-center space-x-2 text-2xl font-bold transition-opacity hover:opacity-80 text-black dark:text-white"
              >
                <span className="text-black dark:text-white" style={{ fontSize: "0.875rem" }}>●</span>
                <span>Aurum</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {menuItems.map((item) => (
                <div
                  key={item.title}
                  className="relative group"
                  onMouseEnter={() => handleMouseEnter(item.title)}
                  onMouseLeave={handleMouseLeave}
                >
                  <a
                    href="#"
                    className="flex items-center px-3 py-2 text-sm font-medium transition-colors text-gray-800 hover:text-black dark:text-gray-200 dark:hover:text-white"
                  >
                    {item.title}
                    <ChevronDown className="ml-1 h-3 w-3 transition-transform group-hover:rotate-180" />
                  </a>

                  {activeDropdown === item.title && (
                    <div
                      className="absolute top-full left-1/2 transform -translate-x-1/2 mt-0 z-50"
                      onMouseEnter={handleDropdownMouseEnter}
                      onMouseLeave={handleDropdownMouseLeave}
                    >
                      <div className="bg-white dark:bg-gray-900 rounded-md shadow-lg min-w-[160px] w-auto py-2 space-y-1 text-sm border border-gray-200 dark:border-gray-700">
                        {item.columns.map((column, columnIndex) => (
                          <div key={columnIndex}>
                            {column.category && (
                              <h3 className="px-4 py-2 text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide border-b border-gray-200 dark:border-gray-700">
                                {column.category}
                              </h3>
                            )}
                            <ul>
                              {column.items.map((subItem, itemIndex) => (
                                <li key={itemIndex}>
                                  <Link
                                    href={subItem.href}
                                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 whitespace-nowrap leading-normal"
                                    onClick={() => setActiveDropdown(null)}
                                  >
                                    {subItem.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {isSearchOpen && (
                <form onSubmit={handleSearchSubmit}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("searchPlaceholder") || "검색어를 입력하세요"}
                    className="px-3 py-1 text-sm border rounded-md dark:bg-gray-800 dark:text-white dark:border-gray-600 focus:outline-none"
                    autoFocus
                  />
                </form>
              )}

              <LanguageSwitcher />

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="transition-colors text-gray-800 hover:text-black dark:text-gray-200 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label={theme === "dark" ? t("lightMode") : t("darkMode")}
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              {/* 🔥 사용자 메뉴 또는 로그인 버튼 */}
              {loading ? (
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
              ) : user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    {/* 프로필 이미지 */}
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-yellow-400">
                      {user.profileImage ? (
                        <img 
                          src={user.profileImage} 
                          alt={`${user.nickname || user.name} 프로필`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-yellow-400 flex items-center justify-center text-black font-bold text-sm">
                          {/* 🔥 안전한 닉네임/이름 처리 */}
                          {(user.nickname || user.name || "?")[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="hidden md:block text-left">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {/* 🔥 안전한 닉네임 표시 */}
                        {user.nickname || user.name || "사용자"}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {user.role === "approved" ? "승인됨" : "승인 대기"}
                      </div>
                    </div>
                  </button>

                  {/* 드롭다운 메뉴 */}
                  {userMenuOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setUserMenuOpen(false)}
                      ></div>
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-20">
                        <div className="py-1">
                          {/* 모바일에서 사용자 정보 표시 */}
                          <div className="md:hidden px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {user.nickname}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.role === "approved" ? "승인됨" : "승인 대기"}
                            </div>
                          </div>
                          
                          <Link
                            href="/mypage"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <UserCircle className="h-4 w-4" />
                            마이페이지
                          </Link>
                          
                          <hr className="border-gray-200 dark:border-gray-600" />
                          
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <LogOut className="h-4 w-4" />
                            로그아웃
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link href="/auth"> {/* "/auth/login" → "/auth"로 변경 */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-sm font-medium px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    {t("login") || "로그인"}
                  </Button>
                </Link>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="md:hidden transition-colors text-gray-800 hover:text-black dark:text-gray-200 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* 🔥 모바일 메뉴에 사용자 메뉴 추가 */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4">
              {user && (
                <>
                  <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-200 dark:border-gray-700 mb-4">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-yellow-400">
                      {user.profileImage ? (
                        <img 
                          src={user.profileImage} 
                          alt={`${user.nickname} 프로필`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-yellow-400 flex items-center justify-center text-black font-bold">
                          {/* 🔥 안전한 닉네임/이름 처리 */}
                          {(user.nickname || user.name || "?")[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {/* 🔥 안전한 닉네임 표시 */}
                        {user.nickname || user.name || "사용자"}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {user.role === "approved" ? "승인됨" : "승인 대기"}
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/mypage"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <UserCircle className="h-4 w-4" />
                    마이페이지
                  </Link>

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <LogOut className="h-4 w-4" />
                    로그아웃
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </header>
    </>
  )
}