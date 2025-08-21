"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, ChevronDown } from "lucide-react"

// Définition de la structure d'un élément du sommaire
interface SidebarItem {
  id: string
  title: string
  type: "preambule" | "titre" | "chapitre" | "article"
  href?: string
  isNew?: boolean
  children?: SidebarItem[]
}

// Données hiérarchiques de la constitution
const constitutionStructure: SidebarItem[] = [
  {
    id: "preambule",
    title: "Préambule",
    type: "preambule",
    href: "/textes/constitution/preambule",
  },
  {
    id: "titre-premier",
    title: "Titre premier : de l'état et de la souveraineté",
    type: "titre",
    children: [
      { id: "article-1", title: "Article 1", type: "article", href: "/textes/constitution/article-1" },
      { id: "article-2", title: "Article 2", type: "article", href: "/textes/constitution/article-2" },
      { id: "article-3", title: "Article 3", type: "article", href: "/textes/constitution/article-3" },
      { id: "article-4", title: "Article 4", type: "article", href: "/textes/constitution/article-4" },
      {
        id: "article-5",
        title: "Article 5 (nouveau)",
        type: "article",
        href: "/textes/constitution/article-5",
        isNew: true,
      },
      { id: "article-6", title: "Article 6", type: "article", href: "/textes/constitution/article-6" },
    ],
  },
  { id: "titre-ii", title: "Titre II : Des droits et des devoirs de la personne humaine", type: "titre" },
  { id: "titre-iii", title: "Titre III : Du pouvoir exécutif", type: "titre" },
  { id: "titre-iv", title: "Titre IV : Du pouvoir législatif", type: "titre" },
  { id: "titre-v", title: "Titre V : De la Cour constitutionnelle", type: "titre" },
  { id: "titre-vi", title: "Titre VI : Du pouvoir judiciaire", type: "titre" },
  { id: "titre-vii", title: "Titre VII : Du conseil économique et sociale", type: "titre" },
  {
    id: "titre-viii",
    title: "Titre VIII : De la haute autorité de l'audiovisuel et de la communication",
    type: "titre",
  },
  { id: "titre-ix", title: "Titre IX : Des traités et accords internationnaux", type: "titre" },
  { id: "titre-x", title: "Titre X : Des collectivités territoriales", type: "titre" },
  { id: "titre-x-1", title: "Titre X-1 (nouveau) : Des élections générales", type: "titre", isNew: true },
  { id: "titre-xi", title: "Titre XI : De la révision", type: "titre" },
  { id: "titre-xii", title: "Titre XII : Dispositions transitoires et finales", type: "titre" },
]

// Composant récursif pour afficher chaque élément et ses enfants
const SidebarMenuItem = ({ item, level }: { item: SidebarItem; level: number }) => {
  const pathname = usePathname()
  const isActive = item.href ? pathname === item.href : false
  const hasChildren = item.children && item.children.length > 0

  // Détermine si la section doit être dépliée par défaut
  const isInitiallyExpanded = hasChildren && (item.children?.some((child) => child.href === pathname) || false)
  const [isExpanded, setIsExpanded] = useState(isInitiallyExpanded)

  // Met à jour l'état si la page change
  useEffect(() => {
    setIsExpanded(isInitiallyExpanded)
  }, [pathname, isInitiallyExpanded])

  const toggleExpansion = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded)
    }
  }

  const paddingLeft = level * 16 // 16px d'indentation par niveau

  // Cas d'un élément avec enfants (ex: Titre)
  if (hasChildren) {
    return (
      <div>
        <button
          onClick={toggleExpansion}
          className="w-full flex items-center p-2 text-left hover:bg-gray-100 rounded"
          style={{ paddingLeft: `${paddingLeft}px` }}
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 mr-2 flex-shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 mr-2 flex-shrink-0" />
          )}
          <span className={`text-sm ${item.isNew ? "text-blue-600" : "text-gray-900"}`}>{item.title}</span>
        </button>
        {isExpanded && (
          <div className="space-y-1">
            {item.children?.map((child) => (
              <SidebarMenuItem key={child.id} item={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  // Cas d'un élément sans enfant (ex: Article)
  return (
    <Link
      href={item.href || "#"}
      className={`block p-2 text-sm hover:underline ${
        isActive ? "text-red-600 font-medium" : item.isNew ? "text-blue-600" : "text-gray-900"
      }`}
      style={{ paddingLeft: `${paddingLeft}px` }}
    >
      {item.title}
    </Link>
  )
}

// Composant principal du sommaire
export function ConstitutionSidebar() {
  return (
    <div className="lg:w-80 lg:flex-shrink-0 bg-gray-50 p-4 rounded-lg">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Textes</h2>
      <nav className="space-y-1">
        {constitutionStructure.map((item) => (
          <SidebarMenuItem key={item.id} item={item} level={0} />
        ))}
      </nav>
    </div>
  )
}
