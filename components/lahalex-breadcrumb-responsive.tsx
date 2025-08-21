"use client"

import { ChevronRight, Home } from "lucide-react"
import Link from "next/link"

interface BreadcrumbItem {
  label: string
  href?: string
  isActive?: boolean
}

interface LahalexBreadcrumbProps {
  items: BreadcrumbItem[]
}

export function LahalexBreadcrumbResponsive({ items }: LahalexBreadcrumbProps) {
  return (
    <div className="bg-gray-50 border-b border-gray-200 px-2 sm:px-4 py-2 sm:py-3">
      <nav className="container-responsive">
        <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm overflow-x-auto custom-scrollbar">
          <Link href="/" className="flex items-center text-blue-600 hover:text-blue-800 flex-shrink-0 p-1">
            <Home className="w-3 h-3 sm:w-4 sm:h-4" />
          </Link>

          {items.map((item, index) => (
            <div key={index} className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
              {item.href && !item.isActive ? (
                <Link
                  href={item.href}
                  className="text-blue-600 hover:text-blue-800 hover:underline whitespace-nowrap p-1"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={`whitespace-nowrap p-1 ${item.isActive ? "text-gray-900 font-medium" : "text-gray-600"}`}
                >
                  {item.label}
                </span>
              )}
            </div>
          ))}
        </div>
      </nav>
    </div>
  )
}
