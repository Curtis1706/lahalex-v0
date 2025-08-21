'use client'

import { useEffect, useRef, useState } from 'react'

interface ScrollPosition {
  top: number
  behavior?: ScrollBehavior
}

export function useSmartScroll() {
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout>()

  const scrollToElement = (
    element: HTMLElement | string,
    options: ScrollIntoViewOptions = {}
  ) => {
    const targetElement = typeof element === 'string' 
      ? document.getElementById(element) || document.querySelector(element)
      : element

    if (targetElement) {
      setIsScrolling(true)
      
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        ...options
      })

      // Détecter la fin du scroll
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
      
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false)
      }, 1000)
    }
  }

  const scrollToTop = (smooth = true) => {
    window.scrollTo({
      top: 0,
      behavior: smooth ? 'smooth' : 'auto'
    })
  }

  const scrollToPosition = ({ top, behavior = 'smooth' }: ScrollPosition) => {
    window.scrollTo({
      top,
      behavior
    })
  }

  // Scroll vers une ancre avec offset pour les headers fixes
  const scrollToAnchor = (anchor: string, offset = 80) => {
    const element = document.getElementById(anchor)
    if (element) {
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  // Nettoyer les timeouts au démontage
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  return {
    isScrolling,
    scrollToElement,
    scrollToTop,
    scrollToPosition,
    scrollToAnchor
  }
}