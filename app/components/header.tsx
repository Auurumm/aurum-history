"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Search, Moon, Sun, Menu, X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "../contexts/theme-context"
import Link from "next/link"
import { useLanguage } from "@/app/contexts/language-context"
import LanguageSwitcher from "./language-switcher"

export default function Header() {
  const { theme, toggleTheme } = useTheme()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()
  const { t, locale } = useLanguage()

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
            { name: t("footprints"), href: getLocalizedPath("/footprints") },
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
              {/* Search input + toggle button */}
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

              {/* 
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex transition-colors text-gray-800 hover:text-black dark:text-gray-200 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label={t("search")}
                onClick={() => setIsSearchOpen((prev) => !prev)}
              >
                <Search className="h-4 w-4" />
              </Button>
              */}

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

              {/* Mobile menu */}
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
        </div>
      </header>
    </>
  )
}
