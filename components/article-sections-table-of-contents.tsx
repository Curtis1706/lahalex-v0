"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronRight, ChevronDown } from 'lucide-react'
import { GenericTree } from "./generic-tree" // Import the new GenericTree component

// Define the type for a section as it comes from the API
interface ArticleSection {
  id: string
  title: string
  level: number
  order: number
}

// Define the type for a node in our hierarchical tree
interface ArticleSectionNode extends ArticleSection {
  children: ArticleSectionNode[]
}

interface ArticleSectionsTableOfContentsProps {
  sections: ArticleSection[]
  // activeSectionId will be used to highlight the currently viewed section
  activeSectionId: string | null
  // Callback to update the active section ID, useful for scroll-based highlighting
  onSetActiveSection: (id: string | null) => void
}

/**
 * Builds a hierarchical tree from a flat array of sections based on their level.
 * @param sections A flat array of sections with 'level' property.
 * @returns A tree-like structure of sections.
 */
function buildArticleSectionTree(sections: ArticleSection[]): ArticleSectionNode[] {
  const root: ArticleSectionNode = { id: "root", title: "Root", level: 0, order: 0, children: [] }
  const stack: ArticleSectionNode[] = [root]

  sections.forEach((section) => {
    const newNode: ArticleSectionNode = { ...section, children: [] }

    // Pop elements from stack until we find a parent with a lower level
    // This ensures correct parent-child relationship based on hierarchy level
    while (stack.length > 0 && stack[stack.length - 1].level >= newNode.level) {
      stack.pop()
    }

    // Add new node as child of current top of stack
    if (stack.length > 0) {
      stack[stack.length - 1].children.push(newNode)
    } else {
      // Fallback: if stack is empty, it's a top-level section (should go into root's children)
      root.children.push(newNode)
    }

    stack.push(newNode)
  })

  return root.children
}

// Main Table of Contents component
export const ArticleSectionsTableOfContents: React.FC<ArticleSectionsTableOfContentsProps> = ({
  sections,
  activeSectionId,
  onSetActiveSection,
}) => {
  const sectionTree = React.useMemo(() => buildArticleSectionTree(sections), [sections])

  // Determine initial expanded nodes based on active section
  const initialExpandedNodes = React.useMemo(() => {
    const expanded = new Set<string>()
    if (activeSectionId) {
      const findParents = (nodes: ArticleSectionNode[], targetId: string): boolean => {
        for (const node of nodes) {
          if (node.id === targetId) {
            return true
          }
          if (node.children && findParents(node.children, targetId)) {
            expanded.add(node.id)
            return true
          }
        }
        return false
      }
      findParents(sectionTree, activeSectionId)
    }
    return expanded
  }, [sectionTree, activeSectionId])

  if (sections.length === 0) {
    return null
  }

  // Render function for each item in the tree
  const renderTableOfContentsItem = React.useCallback(
    (node: ArticleSectionNode, level: number, isExpanded: boolean, toggleExpansion: () => void) => {
      const hasChildren = node.children && node.children.length > 0
      const isActive = activeSectionId === node.id
      const paddingLeft = level * 16 // 16px indentation per level

      return (
        <div>
          {hasChildren ? (
            <button
              onClick={toggleExpansion}
              className="w-full flex items-center p-2 text-left hover:bg-gray-100 rounded focus:outline-none"
              style={{ paddingLeft: `${paddingLeft}px` }}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 mr-2 flex-shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 mr-2 flex-shrink-0" />
              )}
              <span className={`text-sm ${isActive ? "text-primary-lahalex font-medium" : "text-gray-900"}`}>
                {node.title}
              </span>
            </button>
          ) : (
            <Link
              href={`#section-${node.id}`}
              className={`block p-2 text-sm hover:underline ${isActive ? "bg-primary-lahalex text-white font-medium" : "text-gray-900"}`}
              style={{ paddingLeft: `${paddingLeft + 24}px` }} // Add extra padding for leaf nodes (to align with icon space)
              onClick={() => {
                onSetActiveSection(node.id) // Update active state immediately on click
                document.getElementById(`section-${node.id}`)?.scrollIntoView({ behavior: "smooth" })
              }}
            >
              {node.title}
            </Link>
          )}
        </div>
      )
    },
    [activeSectionId, onSetActiveSection],
  )

  return (
    <div className="p-4 rounded-lg" style={{ backgroundColor: "#F8F3F4" }}>
      <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Sommaire</h3>
      <GenericTree
        nodes={sectionTree}
        renderItem={renderTableOfContentsItem}
        initialExpandedNodes={initialExpandedNodes}
      />
    </div>
  )
}
