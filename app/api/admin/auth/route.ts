import { type NextRequest, NextResponse } from "next/server"

const ADMIN_PASSWORD = "laha229"

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (password === ADMIN_PASSWORD) {
      const response = NextResponse.json({ success: true })

      // Définir le cookie d'authentification (expire dans 24h)
      response.cookies.set("admin-auth", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60, // 24 heures
      })

      return response
    } else {
      return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 })
    }
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete("admin-auth")
  return response
}
