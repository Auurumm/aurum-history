"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Moon, Sun, Menu, X, ChevronDown, User, LogOut, UserCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "../contexts/theme-context"
import { useResponsive } from "../contexts/responsive-context"
import Link from "next/link"
import { useLanguage } from "@/app/contexts/language-context"

// Firebase imports - optional로 처리
let auth: any = null;
let db: any = null;
let onAuthStateChanged: any = null;
let signOut: any = null;
let doc: any = null;
let getDoc: any = null;

try {
  const firebase = require("@/lib/firebase");
  auth = firebase.auth;
  db = firebase.db;
  const firebaseAuth = require("firebase/auth");
  onAuthStateChanged = firebaseAuth.onAuthStateChanged;
  signOut = firebaseAuth.signOut;
  const firestore = require("firebase/firestore");
  doc = firestore.doc;
  getDoc = firestore.getDoc;
} catch (error) {
  console.log("Firebase not configured, authentication features disabled");
}

interface UserData {
  uid: string;
  name: string;
  nickname?: string;
  email: string;
  profileImage?: string;
  role: string;
}

export default function Header() {
  const { theme, toggleTheme } = useTheme()
  const { isMobile, isTablet, isDesktop } = useResponsive()
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

  // 사용자 인증 상태 확인 (Firebase가 있는 경우만)
  useEffect(() => {
    if (!auth || !onAuthStateChanged) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: any) => {
      if (firebaseUser && db && doc && getDoc) {
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
      title: t("company") || "회사",
      items: [
        { name: t("culture") || "문화", href: getLocalizedPath("/message") },
        { name: t("history") || "연혁", href: getLocalizedPath("/history") },
        { name: t("welcome") || "오시는 길", href: getLocalizedPath("/company-info") },
      ],
    },
    {
      title: t("services") || "서비스",
      items: [
        { name: t("brand") || "브랜드", href: getLocalizedPath("/brand") },
        { name: t("marketing") || "마케팅", href: getLocalizedPath("/marketing") },
        { name: t("entertainment") || "엔터테인먼트", href: getLocalizedPath("/entertainment") },
        { name: t("life") || "라이프", href: getLocalizedPath("/life") },
      ],
    },
    {
      title: t("responsibility") || "소통",
      items: [
        { name: t("gallery") || "갤러리", href: getLocalizedPath("/gallery") },
        { name: t("members") || "구성원", href: getLocalizedPath("/members") },
        { name: t("recruitment") || "채용", href: getLocalizedPath("/career") },
      ],
    },
    {
      title: t("community") || "커뮤니티",
      items: [
        { name: t("announcements") || "공지사항", href: getLocalizedPath("/announcements") },
        { name: t("traces") || "흔적들", href: getLocalizedPath("/traces") },
        { name: t("wonders") || "궁금한 것들", href: getLocalizedPath("/wonders") },
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

  // 로그아웃 처리
  const handleLogout = async () => {
    if (!signOut || !auth) return;
    
    try {
      await signOut(auth);
      setUserMenuOpen(false);
      router.push("/auth");
    } catch (error) {
      console.error("로그아웃 오류:", error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full font-pretendard">
      <div className="absolute inset-0 bg-white/95 dark:bg-black/95 backdrop-blur-sm border-b border-gray-200/20 dark:border-gray-700/20"></div>

      <div className="w-full px-4 sm:px-6 lg:px-8 lg:max-w-7xl lg:mx-auto relative z-10">
        <div className={`flex items-center justify-between w-full ${isMobile ? 'h-16' : 'h-20'}`}>
          {/* Logo */}
          <div className="flex-shrink-0 min-w-0">
            <Link
              href={getLocalizedPath("/")}
              className="flex items-center space-x-2 font-bold transition-opacity hover:opacity-80 text-black dark:text-white"
            >
              <span className="text-black dark:text-white text-xs">●</span>
              <span className={`${
                isMobile ? 'text-xl' : isTablet ? 'text-2xl' : 'text-2xl'
              } font-bold tracking-tight`}>
                Aurum
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {isDesktop && (
            <nav className="flex space-x-8">
              {menuItems.map((item) => (
                <div
                  key={item.title}
                  className="relative group"
                  onMouseEnter={() => handleMouseEnter(item.title)}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    type="button"
                    className="flex items-center px-3 py-2 text-sm font-medium transition-colors text-gray-800 hover:text-black dark:text-gray-200 dark:hover:text-white tracking-tight"
                  >
                    {item.title}
                    <ChevronDown className="ml-1 h-3 w-3 transition-transform group-hover:rotate-180" />
                  </button>

                  {activeDropdown === item.title && (
                    <div
                      className="absolute top-full left-1/2 transform -translate-x-1/2 mt-0 z-50"
                      onMouseEnter={handleDropdownMouseEnter}
                      onMouseLeave={handleDropdownMouseLeave}
                    >
                      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg min-w-[160px] w-auto py-2 space-y-1 text-sm border border-gray-200 dark:border-gray-700 backdrop-blur-sm">
                        <ul>
                          {item.items.map((subItem, itemIndex) => (
                            <li key={itemIndex}>
                              <Link
                                href={subItem.href}
                                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 whitespace-nowrap font-medium tracking-tight"
                                onClick={() => setActiveDropdown(null)}
                              >
                                {subItem.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>
          )}

          {/* Right Side - 모바일에서 확실하게 보이도록 수정 */}
          <div className={`flex items-center ${isMobile ? 'flex-shrink-0' : 'space-x-2'}`}>
            {/* Desktop only items */}
            {!isMobile && (
              <div className="flex items-center space-x-4">
                {isSearchOpen && (
                  <form onSubmit={handleSearchSubmit}>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t("searchPlaceholder") || "검색어를 입력하세요"}
                      className="px-3 py-1 text-sm border rounded-md dark:bg-gray-800 dark:text-white dark:border-gray-600 focus:outline-none font-medium tracking-tight"
                      autoFocus
                    />
                  </form>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheme}
                  className="transition-colors text-gray-800 hover:text-black dark:text-gray-200 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-label={theme === "dark" ? t("lightMode") || "라이트 모드" : t("darkMode") || "다크 모드"}
                >
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>

                {/* 사용자 메뉴 또는 로그인 버튼 */}
                {loading ? (
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                ) : user ? (
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-yellow-400">
                        {user.profileImage ? (
                          <img 
                            src={user.profileImage} 
                            alt={`${user.nickname || user.name} 프로필`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-yellow-400 flex items-center justify-center text-black font-bold text-sm">
                            {(user.nickname || user.name || "?")[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      {!isTablet && (
                        <div className="text-left">
                          <div className="text-sm font-medium text-gray-900 dark:text-white tracking-tight">
                            {user.nickname || user.name || "사용자"}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 tracking-tight">
                            {user.role === "approved" ? "승인됨" : "승인 대기"}
                          </div>
                        </div>
                      )}
                    </button>

                    {userMenuOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setUserMenuOpen(false)}
                        ></div>
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 backdrop-blur-sm">
                          <div className="py-1">
                            <Link
                              href="/mypage"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium tracking-tight"
                            >
                              <UserCircle className="h-4 w-4" />
                              마이페이지
                            </Link>
                            
                            <hr className="border-gray-200 dark:border-gray-600" />
                            
                            <button
                              onClick={handleLogout}
                              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium tracking-tight"
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
                  <Link href="/auth">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-sm font-medium px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 tracking-tight"
                    >
                      {t("login") || "로그인"}
                    </Button>
                  </Link>
                )}
              </div>
            )}

            {/* 🔧 모바일 햄버거 메뉴 - 확실하게 보이도록 수정 */}
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                className="p-2 ml-2 transition-colors text-gray-800 hover:text-black dark:text-gray-200 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="메뉴 토글"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            )}
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {isMobile && isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 w-full bg-white/95 dark:bg-black/95 backdrop-blur-sm border-b border-gray-200/20 dark:border-gray-700/20 shadow-lg">
            <div className="px-4 py-6 space-y-6 max-h-[calc(100vh-4rem)] overflow-y-auto">
              {/* 사용자 정보 (로그인된 경우) */}
              {user && (
                <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-yellow-400 flex-shrink-0">
                    {user.profileImage ? (
                      <img 
                        src={user.profileImage} 
                        alt={`${user.nickname || user.name} 프로필`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-yellow-400 flex items-center justify-center text-black font-bold">
                        {(user.nickname || user.name || "?")[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900 dark:text-white tracking-tight truncate">
                      {user.nickname || user.name || "사용자"}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 tracking-tight">
                      {user.role === "approved" ? "승인됨" : "승인 대기"}
                    </div>
                  </div>
                </div>
              )}

              {/* 메인 네비게이션 메뉴 */}
              <div className="space-y-4">
                {menuItems.map((item) => (
                  <div key={item.title} className="space-y-2">
                    <div className="font-semibold text-gray-900 dark:text-white px-2 py-1 tracking-tight">
                      {item.title}
                    </div>
                    <div className="pl-4 space-y-1">
                      {item.items.map((subItem, index) => (
                        <Link
                          key={index}
                          href={subItem.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block px-2 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors font-medium tracking-tight"
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* 사용자 액션 및 설정 */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                {user && (
                  <>
                    <Link
                      href="/mypage"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-2 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors font-medium tracking-tight"
                    >
                      <UserCircle className="h-4 w-4 flex-shrink-0" />
                      마이페이지
                    </Link>
                    
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-2 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors font-medium tracking-tight"
                    >
                      <LogOut className="h-4 w-4 flex-shrink-0" />
                      로그아웃
                    </button>
                  </>
                )}

                {/* 다크모드 토글 */}
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-3 w-full px-2 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors font-medium tracking-tight"
                >
                  {theme === "dark" ? <Sun className="h-4 w-4 flex-shrink-0" /> : <Moon className="h-4 w-4 flex-shrink-0" />}
                  {theme === "dark" ? (t("lightMode") || "라이트 모드") : (t("darkMode") || "다크 모드")}
                </button>

                {/* 로그인 버튼 (로그인되지 않은 경우) */}
                {!user && (
                  <Link
                    href="/auth"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full text-center px-4 py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition-colors tracking-tight"
                  >
                    {t("login") || "로그인"}
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}