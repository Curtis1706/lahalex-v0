import * as React from "react"
import { ChevronRight, ChevronDown } from 'lucide-react'

// Définition générique d'un nœud d'arbre
interface TreeNode {
  id: string
  children?: TreeNode[]
  [key: string]: any // Permet d'ajouter d'autres propriétés personnalisées
}

interface GenericTreeProps<T extends TreeNode> {
  nodes: T[]
  renderItem: (
    node: T,
    level: number,
    isExpanded: boolean,
    toggleExpansion: () => void,
  ) => React.ReactNode
  initialExpandedNodes?: Set<string>
}

// Composant récursif pour le rendu d'un nœud d'arbre
const TreeItem = <T extends TreeNode>({
  node,
  level,
  renderItem,
  initialExpandedNodes,
}: {
  node: T
  level: number
  renderItem: (
    node: T,
    level: number,
    isExpanded: boolean,
    toggleExpansion: () => void,
  ) => React.ReactNode
  initialExpandedNodes?: Set<string>
}) => {
  const hasChildren = node.children && node.children.length > 0
  const [isExpanded, setIsExpanded] = React.useState(
    hasChildren && initialExpandedNodes ? initialExpandedNodes.has(node.id) : false,
  )

  const toggleExpansion = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded)
    }
  }

  return (
    <div>
      {renderItem(node, level, isExpanded, toggleExpansion)}
      {isExpanded && hasChildren && (
        <div className="space-y-1">
          {node.children?.map((childNode, index) => (
            <TreeItem
              key={index} // Changed from childNode.id
              node={childNode as T}
              level={level + 1}
              renderItem={renderItem}
              initialExpandedNodes={initialExpandedNodes}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Composant principal de l'arbre générique
export function GenericTree<T extends TreeNode>({
  nodes,
  renderItem,
  initialExpandedNodes,
}: GenericTreeProps<T>) {
  if (!nodes || nodes.length === 0) {
    return null
  }

  return (
    <nav className="space-y-1">
      {nodes.map((node, index) => (
        <TreeItem
          key={index} // Changed from node.id
          node={node}
          level={0} // Le niveau initial pour les nœuds de premier niveau
          renderItem={renderItem}
          initialExpandedNodes={initialExpandedNodes}
        />
      ))}
    </nav>
  )
}
