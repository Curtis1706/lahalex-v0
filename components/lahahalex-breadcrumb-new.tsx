"use client"

import { ChevronRight, Home } from 'lucide-react'
import Link from "next/link"

interface BreadcrumbItem {
  label: string
  href?: string
  isActive?: boolean
}

interface LahalexBreadcrumbProps {
  items: BreadcrumbItem[]
}

export function LahalexBreadcrumbNew({ items }: LahalexBreadcrumbProps) {
  return (
    <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
      <nav className="flex items-center space-x-2 text-sm max-w-7xl mx-auto overflow-x-auto">
        <Link href="/" className="flex items-center text-blue-600 hover:text-blue-800 flex-shrink-0">
          <Home className="w-4 h-4" />
        </Link>

        {items.map((item, index) => (
          <div key={index} className="flex items-center space-x-2 flex-shrink-0">
            <ChevronRight className="w-4 h-4 text-gray-400" />
            {item.href && !item.isActive ? (
              <Link
                href={item.href}
                className="text-blue-600 hover:text-blue-800 hover:underline whitespace-nowrap"
              >
                {item.label}
              </Link>
            ) : (
              <span className={`whitespace-nowrap ${item.isActive ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                {item.label}
              </span>
            )}
          </div>
        ))}
      </nav>
    </div>
  )
}
