'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

interface SearchMatch {
  element: HTMLElement
  index: number
}

export function useDocumentSearch() {
  const [searchTerm, setSearchTerm] = useState('')
  const [matches, setMatches] = useState<SearchMatch[]>([])
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1)
  const [isSearching, setIsSearching] = useState(false)
  const contentRef = useRef<HTMLElement>(null)

  const escapeRegex = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  const performSearch = useCallback(() => {
    if (!contentRef.current || !searchTerm.trim()) {
      clearHighlights()
      setMatches([])
      setCurrentMatchIndex(-1)
      return
    }

    setIsSearching(true)
    
    // Nettoyer les highlights précédents
    clearHighlights()

    const content = contentRef.current
    const searchRegex = new RegExp(`(${escapeRegex(searchTerm.trim())})`, 'gi')
    const walker = document.createTreeWalker(
      content,
      NodeFilter.SHOW_TEXT,
      null
    )

    const textNodes: Text[] = []
    let node: Node | null

    // Collecter tous les nœuds de texte
    while (node = walker.nextNode()) {
      if (node.nodeValue && searchRegex.test(node.nodeValue)) {
        textNodes.push(node as Text)
      }
    }

    const newMatches: SearchMatch[] = []
    let matchIndex = 0

    // Créer les highlights
    textNodes.forEach(textNode => {
      const parent = textNode.parentNode
      if (!parent) return

      const text = textNode.nodeValue || ''
      const parts = text.split(searchRegex)
      const fragment = document.createDocumentFragment()

      parts.forEach((part, index) => {
        if (index % 2 === 0) {
          // Texte normal
          if (part) fragment.appendChild(document.createTextNode(part))
        } else {
          // Texte à surligner
          const mark = document.createElement('mark')
          mark.className = 'bg-yellow-300 search-highlight'
          mark.id = `search-match-${matchIndex}`
          mark.textContent = part
          fragment.appendChild(mark)
          
          newMatches.push({
            element: mark,
            index: matchIndex
          })
          matchIndex++
        }
      })

      parent.replaceChild(fragment, textNode)
    })

    setMatches(newMatches)
    setCurrentMatchIndex(newMatches.length > 0 ? 0 : -1)
    setIsSearching(false)

    // Scroll vers le premier résultat
    if (newMatches.length > 0) {
      scrollToMatch(0)
    }
  }, [searchTerm])

  const clearHighlights = useCallback(() => {
    if (!contentRef.current) return

    const highlights = contentRef.current.querySelectorAll('.search-highlight')
    highlights.forEach(highlight => {
      const parent = highlight.parentNode
      if (parent) {
        parent.replaceChild(document.createTextNode(highlight.textContent || ''), highlight)
        parent.normalize()
      }
    })
  }, [])

  const scrollToMatch = useCallback((index: number) => {
    if (index >= 0 && index < matches.length) {
      const match = matches[index]
      
      // Retirer la classe active des autres matches
      matches.forEach(m => m.element.classList.remove('bg-orange-300'))
      
      // Ajouter la classe active au match courant
      match.element.classList.add('bg-orange-300')
      
      // Scroll vers l'élément
      match.element.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  }, [matches])

  const nextMatch = useCallback(() => {
    if (matches.length === 0) return
    const nextIndex = (currentMatchIndex + 1) % matches.length
    setCurrentMatchIndex(nextIndex)
    scrollToMatch(nextIndex)
  }, [currentMatchIndex, matches, scrollToMatch])

  const previousMatch = useCallback(() => {
    if (matches.length === 0) return
    const prevIndex = currentMatchIndex <= 0 ? matches.length - 1 : currentMatchIndex - 1
    setCurrentMatchIndex(prevIndex)
    scrollToMatch(prevIndex)
  }, [currentMatchIndex, matches, scrollToMatch])

  const clearSearch = useCallback(() => {
    setSearchTerm('')
    clearHighlights()
    setMatches([])
    setCurrentMatchIndex(-1)
  }, [clearHighlights])

  // Effectuer la recherche quand le terme change
  useEffect(() => {
    const timeoutId = setTimeout(performSearch, 300) // Debounce
    return () => clearTimeout(timeoutId)
  }, [performSearch])

  // Nettoyer au démontage
  useEffect(() => {
    return () => clearHighlights()
  }, [clearHighlights])

  return {
    searchTerm,
    setSearchTerm,
    matches,
    currentMatchIndex,
    isSearching,
    contentRef,
    nextMatch,
    previousMatch,
    clearSearch,
    hasMatches: matches.length > 0
  }
}