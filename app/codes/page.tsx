import { LahalexHeaderResponsive } from "@/components/lahalex-header-responsive"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { DocumentManager } from "@/lib/document-manager"

export default async function CodesPage() {
  const documents = await DocumentManager.listAllDocuments()
  const codes = documents.filter((d) => d.type === "code")

  return (
    <div className="min-h-screen bg-white">
      <LahalexHeaderResponsive searchValue="" onSearchChange={() => {}} />

      <div className="container-responsive py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Codes</h1>
        </div>

        <div className="relative">
          <div className="absolute left-6 lg:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-red-300 via-red-500 to-red-300"></div>

          <ul className="space-y-6">
            {codes.map((code) => (
              <li key={code.id} className="relative pl-14 lg:pl-16">
                <span className="absolute left-6 lg:left-8 top-2 -translate-x-1/2">
                  <span className="block w-3.5 h-3.5 bg-red-600 rounded-full ring-4 ring-red-200"></span>
                </span>
                <Link
                  href={`/documents/${code.id}`}
                  className="text-base lg:text-lg font-semibold text-gray-900 hover:text-red-600"
                >
                  {code.title}
                </Link>
                {code.description && (
                  <p className="text-sm text-gray-600 mt-1">{code.description}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Footer />
    </div>
  )
}
