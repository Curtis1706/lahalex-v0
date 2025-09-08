import { NextResponse } from 'next/server'
import { DocumentManager } from '@/lib/document-manager'
import { promises as fs } from 'fs'
import { join } from 'path'
import type { DocumentMetadata } from '@/types/document'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.toLowerCase().trim()

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        documents: [],
        message: 'Query too short'
      })
    }

    // Get all documents
    const documents = await DocumentManager.listDocuments()

    // Search through documents
    const searchResults: (DocumentMetadata & {
      searchScore?: number
      matchDetails?: {
        title: boolean
        subject: boolean
        content: boolean
      }
    })[] = []

    for (const document of documents) {
      let isMatch = false
      let matchScore = 0
      let matchDetails = {
        title: false,
        subject: false,
        content: false
      }

      // Search in title
      if (document.title?.toLowerCase().includes(query)) {
        isMatch = true
        matchScore += 10
        matchDetails.title = true
      }

      // Search in description
      if (document.description?.toLowerCase().includes(query)) {
        isMatch = true
        matchScore += 8
        matchDetails.subject = true
      }

      // Only search in content for longer queries (3+ characters) to avoid performance issues
      if (query.length >= 3) {
        try {
          const documentDir = join(process.cwd() || '.', 'content', 'documents', document.id)
          const content = await searchInDocumentContent(documentDir, query)
          if (content.found) {
            isMatch = true
            matchScore += content.score
            matchDetails.content = true
          }
        } catch (error) {
          console.error(`Error searching in document ${document.id}:`, error)
        }
      }

      if (isMatch) {
        searchResults.push({
          ...document,
          searchScore: matchScore,
          matchDetails
        })
      }
    }

    // Sort by relevance score
    searchResults.sort((a, b) => (b.searchScore || 0) - (a.searchScore || 0))

    return NextResponse.json({
      success: true,
      documents: searchResults.slice(0, 50), // Limit results
      totalFound: searchResults.length
    })

  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({
      error: 'Search failed',
      success: false
    }, { status: 500 })
  }
}

async function searchInDocumentContent(documentDir: string, query: string) {
  let found = false
  let score = 0

  try {
    const entries = await fs.readdir(documentDir, { withFileTypes: true })

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const subDir = join(documentDir, entry.name)
        const subResult = await searchInDocumentContent(subDir, query)
        if (subResult.found) {
          found = true
          score += subResult.score
        }
      } else if (entry.name.endsWith('.md')) {
        try {
          const content = await fs.readFile(join(documentDir, entry.name), 'utf-8')
          const lowerContent = content.toLowerCase()

          if (lowerContent.includes(query)) {
            found = true
            // Calculate score based on frequency
            const frequency = (lowerContent.match(new RegExp(query, 'g')) || []).length
            score += Math.min(frequency * 2, 20) // Cap at 20 points
          }
        } catch (error) {
          // Ignore file read errors
        }
      }
    }
  } catch (error) {
    // Ignore directory read errors
  }

  return { found, score }
}
