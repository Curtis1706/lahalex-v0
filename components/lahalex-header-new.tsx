"use client"

import { useState } from "react"
import { Search, Menu, X, Bell, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import Image from "next/image"

interface LahalexHeaderProps {
  searchValue?: string
  onSearchChange?: (value: string) => void
}

export function LahalexHeaderNew({ searchValue = "", onSearchChange }: LahalexHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-primary-lahalex text-white relative z-50">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Logo et menu mobile */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-accent-lahalex hover:bg-white/10 p-2 lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>

            {/* Logo LAHALEX */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 flex items-center justify-center">
                <Image
                  src="/images/lahalex-logo-icon.png"
                  alt="LAHALEX Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="h-8 flex items-center">
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

          {/* Barre de recherche centrale */}
          <div className="flex-1 max-w-2xl mx-8 hidden md:block">
            <div className="relative">
              <Input
                type="text"
                placeholder="Tapez votre mot clé"
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="w-full bg-white text-gray-900 border-0 rounded-md pr-12 placeholder:text-gray-500 focus:ring-2 focus:ring-accent-lahalex"
              />
              <Button className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-primary-lahalex hover:bg-primary-lahalex/90 px-3 h-8">
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Actions droite */}
          <div className="flex items-center space-x-2">
            {/* Pays */}
            <Button
              variant="ghost"
              size="sm"
              className="text-accent-lahalex hover:bg-white/10 hidden lg:flex items-center space-x-1"
            >
              <span className="text-sm">🇧🇯</span>
              <span className="text-sm">Pays</span>
              <ChevronDown className="w-4 h-4" />
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="text-accent-lahalex hover:bg-white/10 p-2">
              <Bell className="w-4 h-4" />
            </Button>

            {/* Déconnexion */}
            <Button
              variant="ghost"
              size="sm"
              className="text-accent-lahalex hover:bg-white/10 hidden sm:flex items-center space-x-1"
            >
              <span className="text-sm">Déconnexion</span>
              <div className="w-2 h-2 bg-accent-lahalex rounded-full"></div>
            </Button>

            {/* Menu mobile */}
            <Button variant="ghost" size="sm" className="text-accent-lahalex hover:bg-white/10 p-2 lg:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Menu mobile */}
        {mobileMenuOpen && (
          <div className="mt-4 lg:hidden bg-primary-lahalex/90 rounded-lg p-4">
            <div className="mb-4">
              <Input
                type="text"
                placeholder="Tapez votre mot clé"
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="w-full bg-white text-gray-900 border-0 rounded-md placeholder:text-gray-500"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Link href="/" className="block py-2 px-3 text-accent-lahalex hover:bg-white/10 rounded-md">
                Veille juridique
              </Link>
              <Link href="/" className="block py-2 px-3 text-accent-lahalex hover:bg-white/10 rounded-md">
                Textes
              </Link>
              <Link href="/codes" className="block py-2 px-3 text-accent-lahalex hover:bg-white/10 rounded-md">
                Codes
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
