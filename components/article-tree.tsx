"use client"

import { useState } from 'react'
import { ChevronDown, ChevronRight, FileText, BookOpen, FolderOpen } from 'lucide-react'
import Link from 'next/link'

interface ArticleNode {
  id: string
  title: string
  type: 'livre' | 'titre' | 'article'
  children?: ArticleNode[]
  slug?: string
  isExpanded?: boolean
}

interface ArticleTreeProps {
  articles: ArticleNode[]
  currentSlug?: string
}

export function ArticleTree({ articles, currentSlug }: ArticleTreeProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  const renderNode = (node: ArticleNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id)
    const hasChildren = node.children && node.children.length > 0
    const isCurrent = currentSlug === node.slug

    return (
      <div key={node.id} className="w-full">
        <div 
          className={`
            flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer hover:bg-gray-100 transition-colors
            ${isCurrent ? 'bg-red-50 text-red-600 border-l-2 border-red-600' : ''}
          `}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleNode(node.id)}
              className="flex items-center justify-center w-4 h-4 text-gray-500 hover:text-gray-700"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          ) : (
            <div className="w-4 h-4" />
          )}

          <div className="flex items-center gap-2 flex-1">
            {node.type === 'livre' && <BookOpen className="w-4 h-4 text-blue-600" />}
            {node.type === 'titre' && <FolderOpen className="w-4 h-4 text-green-600" />}
            {node.type === 'article' && <FileText className="w-4 h-4 text-gray-600" />}
            
            {node.slug ? (
              <Link 
                href={`/article/${node.slug}`}
                className={`flex-1 text-sm hover:text-blue-600 transition-colors ${
                  isCurrent ? 'font-medium' : ''
                }`}
              >
                {node.title}
              </Link>
            ) : (
              <span className="flex-1 text-sm font-medium">{node.title}</span>
            )}
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="ml-4">
            {node.children!.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 text-sm">Sommaire</h3>
        <button className="text-gray-400 hover:text-gray-600">
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-1">
        {articles.map(node => renderNode(node))}
      </div>
    </div>
  )
}






