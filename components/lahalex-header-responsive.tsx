"use client"

import type React from "react"

import { useState } from "react"
import { Search, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import Image from "next/image"

interface LahalexHeaderProps {
  searchValue?: string
  onSearchChange?: (value: string) => void
  onSearchSubmit?: (query: string) => void
}

export function LahalexHeaderResponsive({ searchValue = "", onSearchChange, onSearchSubmit }: LahalexHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchValue.trim() && onSearchSubmit) {
      onSearchSubmit(searchValue.trim())
    }
  }

  const handleSearchButtonClick = () => {
    if (searchValue.trim() && onSearchSubmit) {
      onSearchSubmit(searchValue.trim())
    }
  }

  return (
    <>
      <header
        className="bg-[#770D28] text-white relative z-50"
        style={{
          backgroundImage: `linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.03) 50%, transparent 60%), linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.02) 50%, transparent 60%), radial-gradient(circle at 20% 50%, rgba(255,255,255,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.03) 0%, transparent 50%)`,
          backgroundSize: "20px 20px, 15px 15px, 10px 10px, 8px 8px",
        }}
      >
        <div className="container-responsive py-2 sm:py-3">
          <div className="flex items-center justify-between">
            {/* Logo et menu mobile */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Menu hamburger mobile */}
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10 p-1.5 sm:p-2 lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>

              {/* Logo LAHALEX */}
              <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                  <Image
                    src="/images/lahalex-logo-icon.png"
                    alt="LAHALEX Logo"
                    width={40}
                    height={40}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="h-6 sm:h-8 flex-shrink-0">
                  <Image
                    src="/images/lahalex-logo-text.png"
                    alt="LAHALEX"
                    width={120}
                    height={32}
                    className="h-full w-auto object-contain"
                  />
                </div>
              </Link>
            </div>

            {/* Barre de recherche centrale - Desktop - Plus longue */}
            <div className="flex-1 max-w-4xl mx-4 sm:mx-8 hidden md:block">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Input
                  type="text"
                  placeholder="Tapez des mots clés"
                  value={searchValue}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  className="w-full bg-white text-gray-900 border-0 rounded-md pr-24 placeholder:text-gray-500 focus:ring-2 focus:ring-white/30 text-sm sm:text-base h-12"
                />
                <Button
                  type="submit"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-[#770D28] hover:bg-[#8a0f2e] border border-white/20 px-4 h-10 text-white font-medium"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </form>
            </div>

            {/* Actions droite */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* Recherche mobile */}
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10 p-1.5 sm:p-2 md:hidden"
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </div>

          {/* Barre de recherche mobile - Plus longue */}
          {mobileSearchOpen && (
            <div className="mt-3 md:hidden">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Input
                  type="text"
                  placeholder="Tapez des mots clés"
                  value={searchValue}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  className="w-full bg-white text-gray-900 border-0 rounded-md pr-24 placeholder:text-gray-500 text-sm h-12"
                />
                <Button
                  type="submit"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-[#770D28] hover:bg-[#8a0f2e] border border-white/20 px-4 h-10 text-white font-medium"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </form>
            </div>
          )}
        </div>
      </header>

      {/* Menu mobile overlay */}
      {mobileMenuOpen && (
        <div className="sidebar-mobile open lg:hidden">
          <div className="sidebar-content bg-white shadow-xl">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Image src="/images/lahalex-logo-icon.png" alt="LAHALEX" width={32} height={32} className="w-8 h-8" />
                  <Image
                    src="/images/lahalex-logo-text.png"
                    alt="LAHALEX"
                    width={100}
                    height={24}
                    className="h-6 w-auto"
                  />
                </div>
                <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(false)} className="p-1">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <nav className="p-4">
              <div className="space-y-3">
                <Link
                  href="/" // Updated link
                  className="block py-2 px-3 text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Veille juridique
                </Link>
                <Link
                  href="/textes"
                  className="block py-2 px-3 text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Textes
                </Link>
                <Link
                  href="/codes"
                  className="block py-2 px-3 text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Codes
                </Link>
                <Link
                  href="/droit-prive"
                  className="block py-2 px-3 text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Droit privé
                </Link>
                <Link
                  href="/droit-public"
                  className="block py-2 px-3 text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Droit public
                </Link>
                <Link
                  href="/dictionnaire"
                  className="block py-2 px-3 text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dictionnaire
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
