"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  Search,
  Printer,
  Download,
  Share2,
  Menu,
  X,
  ChevronUp,
  Highlighter,
  Edit3,
  Bookmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { LahalexHeaderResponsive } from "@/components/lahalex-header-responsive";
import { LahalexBreadcrumbResponsive } from "@/components/lahalex-breadcrumb-responsive";
import { Footer } from "@/components/footer";

interface DocumentReaderProps {
  document: any;
  article: any;
  processedContent: string;
}

const getDocumentTypeLabel = (type: string) => {
  const typeLabels = {
    constitution: "Constitutions",
    codes: "Codes",
    code: "Codes",
    loi: "Lois",
    decret: "Décrets",
    other: "Autres documents",
  };
  return typeLabels[type as keyof typeof typeLabels] || "Documents";
};

const getDocumentSource = (document: any, currentPath?: string) => {
  console.log('=== DEBUG getDocumentSource ==='); // Debug log
  console.log('Full document object:', JSON.stringify(document, null, 2)); // Debug log
  console.log('Current path:', currentPath); // Debug log

  // 1. Vérifier le type du document (priorité absolue)
  const docType = document.type || "";
  console.log('Document type:', docType); // Debug log

  if (docType === "ceeac" || docType === "cemac" || docType === "cedeao" || docType === "uemoa") {
    console.log('Document type is regional organization - returning Source régionale');
    return "Source régionale";
  }

  // 2. Vérifier la catégorie du document
  const category = document.category || document.document_type || "";
  console.log('Document category:', category); // Debug log

  if (
    category.includes("cemac") ||
    category.includes("ceeac") ||
    category.includes("cedeao") ||
    category.includes("uemoa")
  ) {
    console.log('Detected regional organization from category'); // Debug log
    return "Source régionale";
  } else if (
    category.includes("ohada") ||
    category.includes("union-africaine") ||
    category.includes("conventions-internationales")
  ) {
    console.log('Detected international organization from category'); // Debug log
    return "Source internationale";
  }

  // 3. Vérifier l'URL actuelle pour déterminer la source
  if (currentPath) {
    if (currentPath.startsWith('/source-regional')) {
      console.log('Detected source from URL: régionale'); // Debug log
      return "Source régionale";
    } else if (currentPath.startsWith('/source-international')) {
      console.log('Detected source from URL: internationale'); // Debug log
      return "Source internationale";
    }
  }

  // 4. Vérifier la propriété source du document si elle existe
  const source = document.source || "";
  if (source) {
    console.log('Source property found:', source); // Debug log
    if (source.toLowerCase().includes('regional')) {
      console.log('Detected source from document: régionale'); // Debug log
      return "Source régionale";
    } else if (source.toLowerCase().includes('international')) {
      console.log('Detected source from document: internationale'); // Debug log
      return "Source internationale";
    } else if (source.toLowerCase().includes('national')) {
      console.log('Detected source from document: nationale'); // Debug log
      return "Source nationale";
    }
  } else {
    console.log('No source property found in document'); // Debug log
  }

  // 5. Fallback par défaut
  console.log('Using default fallback: nationale'); // Debug log
  return "Source nationale";
};

export function DocumentReader({
  document,
  article,
  processedContent,
}: DocumentReaderProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [documentSearch, setDocumentSearch] = useState("");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );
  const [highlightedContent, setHighlightedContent] = useState<string>("");
  const [searchMatches, setSearchMatches] = useState<HTMLElement[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(-1);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const sidebarMobileRef = useRef<HTMLDivElement>(null);
  const articleContentRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const pathname = usePathname();

  // Auto-expand sections contenant l'article actuel
  useEffect(() => {
    if (article?.metadata?.path) {
      const newExpanded = new Set(expandedSections);
      article.metadata.path.forEach((parentId: string) => {
        newExpanded.add(parentId);
      });
      setExpandedSections(newExpanded);
    }
  }, [article?.metadata?.id]);

  // Scroll vers l'article actuel dans la sidebar (desktop + mobile)
  useEffect(() => {
    const ref = isMobile ? sidebarMobileRef : sidebarRef;
    if (article?.metadata?.id) {
      setTimeout(() => {
        const currentElement = ref.current?.querySelector(
          `[data-article-id="${article.metadata.id}"]`
        );
        if (currentElement) {
          currentElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 100);
    }
  }, [article?.metadata?.id, isMobile]);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [article.id, isMobile]);

  // Fonction pour échapper les caractères spéciaux dans les regex
  const escapeRegex = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };

  // Logique de recherche dans le document
  const performDocumentSearch = useCallback(() => {
    if (!articleContentRef.current || !documentSearch || !processedContent) {
      setHighlightedContent(processedContent || "");
      setSearchMatches([]);
      setCurrentMatchIndex(-1);
      return;
    }

    const searchTerm = escapeRegex(documentSearch);
    let newHighlightedHtml = processedContent;
    let matchCounter = 0;

    const regex = new RegExp(`(?<!<mark[^>]*>)((${searchTerm}))`, "gi");

    newHighlightedHtml = processedContent.replace(regex, (match, p1) => {
      const id = `search-match-${matchCounter++}`;
      return `<mark id="${id}" class="bg-yellow-300">${p1}</mark>`;
    });

    setHighlightedContent(newHighlightedHtml);
  }, [documentSearch, processedContent]);

  // Effet pour trouver et faire défiler les correspondances
  useEffect(() => {
    if (articleContentRef.current && documentSearch) {
      const marks = Array.from(
        articleContentRef.current.querySelectorAll("mark.bg-yellow-300")
      ) as HTMLElement[];
      setSearchMatches(marks);
      if (marks.length > 0) {
        setCurrentMatchIndex(0);
        requestAnimationFrame(() => {
          marks[0].scrollIntoView({ behavior: "smooth", block: "center" });
        });
      } else {
        setCurrentMatchIndex(-1);
      }
    } else {
      setHighlightedContent(processedContent || "");
      setSearchMatches([]);
      setCurrentMatchIndex(-1);
    }
  }, [highlightedContent, documentSearch, processedContent]);

  const handleNextResult = () => {
    if (searchMatches.length === 0) return;
    const nextIndex = (currentMatchIndex + 1) % searchMatches.length;
    setCurrentMatchIndex(nextIndex);
    requestAnimationFrame(() => {
      searchMatches[nextIndex].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  };

  const handlePrevResult = () => {
    if (searchMatches.length === 0) return;
    const prevIndex =
      (currentMatchIndex - 1 + searchMatches.length) % searchMatches.length;
    setCurrentMatchIndex(prevIndex);
    requestAnimationFrame(() => {
      searchMatches[prevIndex].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  };

  const handleDocumentSearchChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDocumentSearch(e.target.value);
    if (e.target.value === "") {
      setHighlightedContent(processedContent || "");
      setSearchMatches([]);
      setCurrentMatchIndex(-1);
    }
  };

  const handleDocumentSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performDocumentSearch();
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const getColorByType = (
    type: string,
    level: number,
    isCurrentArticle: boolean
  ) => {
    if (isCurrentArticle) return "text-primary-lahalex font-semibold";
    if (type === "article") return "text-blue-600 hover:text-blue-700";

    switch (level) {
      case 1:
        return "text-gray-900 font-semibold";
      case 2:
        return "text-gray-800 font-medium";
      case 3:
        return "text-gray-700 font-medium";
      case 4:
        return "text-gray-700";
      case 5:
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  const renderSection = (section: any, level = 0) => {
    const hasChildren = section.children && section.children.length > 0;
    const isExpanded = expandedSections.has(section.id);
    const isCurrentArticle = article.metadata.id === section.id;
    const colorClass = getColorByType(
      section.type,
      section.level,
      isCurrentArticle
    );

    return (
      <div key={section.id} className="w-full">
        <div
          data-article-id={section.type === "article" ? section.id : undefined}
          className={`flex items-start w-full px-3 py-2 text-sm transition-all duration-200 group ${
            isCurrentArticle ? "" : "hover:bg-gray-50"
          }`}
          style={{ paddingLeft: `${12 + level * 16}px` }}
        >
          {hasChildren && section.type !== "article" && (
            <button
              onClick={() => toggleSection(section.id)}
              className="flex-shrink-0 mr-2 p-0.5 hover:bg-gray-200 rounded transition-colors mt-0.5"
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3 text-gray-500" />
              ) : (
                <ChevronRight className="w-3 h-3 text-gray-500" />
              )}
            </button>
          )}

          {(!hasChildren || section.type === "article") && (
            <div className="w-4 mr-2 flex-shrink-0" />
          )}

          {section.type === "article" ? (
            <Link
              href={`/documents/${document.id}/${section.id}`}
              className={`flex-1 text-left leading-relaxed ${
                isCurrentArticle ? colorClass : ""
              }`}
              onClick={() => isMobile && setSidebarOpen(false)}
              title={section.title}
              style={
                isCurrentArticle
                  ? undefined
                  : { color: "rgba(16, 130, 201, 1)" }
              }
            >
              <span className="block break-words">{section.title}</span>
            </Link>
          ) : (
            <button
              onClick={() => hasChildren && toggleSection(section.id)}
              className={`flex-1 text-left ${colorClass} leading-relaxed`}
              title={section.title}
            >
              <span className="block break-words">{section.title}</span>
            </button>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="border-l border-gray-200 ml-6">
            {section.children.map((childId: string) => {
              const childSection = document.structure.sections.find(
                (s: any) => s.id === childId
              );
              return childSection
                ? renderSection(childSection, level + 1)
                : null;
            })}
          </div>
        )}
      </div>
    );
  };

  // Calcul de la source pour le fil d'ariane
  const currentSource = getDocumentSource(document, pathname);
  console.log('Final source for breadcrumb:', currentSource); // Debug log

  const breadcrumbItems = [
    { label: "Accueil", href: "/" },
    { label: "Textes", href: "/documents" },
    { label: currentSource, href: "/documents" },
    {
      label: getDocumentTypeLabel(document.type),
      href: `/documents?type=${document.type}`,
    },
    { label: document.title, href: `/documents/${document.id}` },
    { label: article.metadata.title, isActive: true },
  ];

  return (
    <div className="min-h-screen bg-white">
      <LahalexHeaderResponsive
        searchValue={searchValue}
        onSearchChange={setSearchValue}
      />
      <LahalexBreadcrumbResponsive items={breadcrumbItems} />

      <div className="flex min-h-[calc(100vh-200px)]">
        {/* Sidebar Gauche */}
        <div
          className="hidden lg:block w-80 border-r border-gray-200 flex flex-col h-[calc(100vh-200px)] overflow-y-auto"
          style={{ backgroundColor: "#F8F3F4" }}
        >
          <div
            className="p-4 border-b border-gray-200 flex-shrink-0"
            style={{ backgroundColor: "#F8F3F4" }}
          >
            <h2 className="text-lg font-bold text-gray-900">
              {getDocumentTypeLabel(document.type)}
            </h2>
          </div>

          <ScrollArea className="flex-1 h-full" ref={sidebarRef}>
            <div className="p-2 space-y-1">
              {document.structure.sections
                .filter((section: any) => section.level === 1)
                .map((section: any) => renderSection(section))}
            </div>
          </ScrollArea>
        </div>

        {/* Contenu Principal - Milieu */}
        <div className="flex-1 min-w-0 overflow-y-auto h-[calc(100vh-200px)]">
          <div
            className="max-w-4xl mx-auto p-4 lg:p-8 bg-white"
            style={{ backgroundColor: "#FFFFFF" }}
          >
            <div className="mb-8">
              <div className="text-sm text-gray-600 font-bold mb-6">
                {document.description}
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-6">
                {article.metadata.title}
              </h1>
            </div>

            <article
              className="prose prose-lg max-w-none text-gray-900 leading-loose font-sans [&>*]:text-justify"
              style={{
                wordBreak: "break-word",
                fontFamily:
                  '"SF Pro Text", "SF Pro Display", "SF Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, "Noto Sans", sans-serif',
                fontWeight: 400,
                fontStyle: "normal",
                fontSize: "17px",
                lineHeight: "30.1px",
                letterSpacing: "0",
                textAlign: "justify",
                textJustify: "inter-word",
                hyphens: "auto",
              }}
            >
              <div
                className="overflow-auto"
                dangerouslySetInnerHTML={{ __html: processedContent }}
              />
              <style>
                {`
      .prose table {
        border-collapse: collapse;
        width: 100%;
        margin-bottom: 2em;
      }
      .prose th, .prose td {
        border: 1px solid #d1d5db;
        padding: 0.75em;
        text-align: left;
      }
      .prose th {
        background: #f3f4f6;
        font-weight: 600;
      }
      .prose tr:nth-child(even) td {
        background: #f9fafb;
      }
    `}
              </style>
            </article>
          </div>
        </div>

        {/* Sidebar Droite */}
        <div
          className="hidden lg:block w-80 border-l border-gray-200 h-[calc(100vh-200px)] overflow-y-auto"
          style={{ backgroundColor: "#FFFFFF" }}
        >
          <div
            className="p-4 sticky top-0 border-b border-gray-200"
            style={{ backgroundColor: "#FFFFFF" }}
          >
            {/* Recherche dans le document */}
            <div className="mb-6">
              <form onSubmit={handleDocumentSearchSubmit} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Rechercher dans le document"
                  value={documentSearch}
                  onChange={handleDocumentSearchChange}
                  className="pl-10 text-sm rounded-[6px] placeholder-[#89898A] border"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.06)",
                    borderColor: "#BCBCBC",
                  }}
                />
                {documentSearch && searchMatches.length > 0 && (
                  <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                    <span className="text-xs text-gray-500">
                      {currentMatchIndex + 1}/{searchMatches.length}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handlePrevResult}
                      className="p-1 h-6 w-6"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleNextResult}
                      className="p-1 h-6 w-6"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </form>
            </div>

            {/* Outils d'annotation */}
            <div
              className="space-y-2 rounded-[5px] p-2"
              style={{ backgroundColor: "rgba(250, 245, 239, 0.5)" }}
            >
              <div
                className="text-xs font-medium mb-1"
                style={{ color: "rgba(0,0,0,0.7)" }}
              >
                Outils d'annotation
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start rounded-[5px]"
                style={{ backgroundColor: "rgba(238, 238, 238, 0)" }}
              >
                <Highlighter className="w-4 h-4 mr-2" />
                Surligner
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start rounded-[5px]"
                style={{ backgroundColor: "rgba(238, 238, 238, 0)" }}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Annoter
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start rounded-[5px]"
                style={{ backgroundColor: "rgba(238, 238, 238, 0)" }}
              >
                <Bookmark className="w-4 h-4 mr-2" />
                Marquer
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile: Boutons flottants */}
        {isMobile && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="fixed bottom-4 left-4 z-40 shadow-lg bg-white"
            >
              <Menu className="w-4 h-4 mr-2" />
              Navigation
            </Button>

            {/* Mobile Sidebar */}
            {sidebarOpen && (
              <div className="fixed inset-0 z-50">
                <div
                  className="absolute inset-0 bg-black/50"
                  onClick={() => setSidebarOpen(false)}
                />
                <div
                  className="absolute left-0 top-0 h-full w-80 flex flex-col"
                  style={{ backgroundColor: "#FFFFFF" }}
                >
                  <div
                    className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <h2 className="text-lg font-bold text-gray-900">
                      {getDocumentTypeLabel(document.type)}
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <ScrollArea className="flex-1" ref={sidebarMobileRef}>
                    <div className="p-2 space-y-1">
                      {document.structure.sections
                        .filter((section: any) => section.level === 1)
                        .map((section: any) => renderSection(section))}
                    </div>
                  </ScrollArea>

                  {/* Recherche mobile */}
                  <div className="p-4 border-t border-gray-200 flex-shrink-0">
                    <form
                      onSubmit={handleDocumentSearchSubmit}
                      className="relative mb-4"
                    >
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="text"
                        placeholder="Rechercher dans le document"
                        value={documentSearch}
                        onChange={handleDocumentSearchChange}
                        className="pl-10 text-sm rounded-[6px] placeholder-[#89898A] border"
                        style={{
                          backgroundColor: "rgba(255, 255, 255, 0.06)",
                          borderColor: "#BCBCBC",
                        }}
                      />
                    </form>

                    <div
                      className="space-y-2 rounded-[5px] p-2"
                      style={{ backgroundColor: "rgba(250, 245, 239, 0.5)" }}
                    >
                      <div
                        className="text-xs font-medium mb-1"
                        style={{ color: "rgba(0,0,0,0.7)" }}
                      >
                        Outils d'annotation
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start rounded-[5px]"
                        style={{ backgroundColor: "rgba(238, 238, 238, 0)" }}
                      >
                        <Highlighter className="w-4 h-4 mr-2" />
                        Surligner
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start rounded-[5px]"
                        style={{ backgroundColor: "rgba(238, 238, 238, 0)" }}
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Annoter
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start rounded-[5px]"
                        style={{ backgroundColor: "rgba(238, 238, 238, 0)" }}
                      >
                        <Bookmark className="w-4 h-4 mr-2" />
                        Marquer
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
