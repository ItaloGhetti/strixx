import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { response, user, supabase } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/cadastro");

  // Não autenticado tentando acessar área protegida → login
  if (!user && !isAuthRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Autenticado tentando acessar login/cadastro → manda para a área certa
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single<{ role: "personal" | "aluno" }>();

    const role = profile?.role;
    const home = role === "personal" ? "/dashboard" : "/hoje";

    if (isAuthRoute) {
      return NextResponse.redirect(new URL(home, request.url));
    }

    // Impede que um aluno acesse rotas do personal e vice-versa
    const isPersonalRoute = ["/dashboard", "/financeiro", "/treinos", "/agenda", "/alunos"].some((p) =>
      pathname.startsWith(p)
    );
    const isAlunoRoute = ["/hoje", "/dieta", "/progresso", "/meus-treinos"].some((p) =>
      pathname.startsWith(p)
    );

    if (role === "aluno" && isPersonalRoute) {
      return NextResponse.redirect(new URL("/hoje", request.url));
    }
    if (role === "personal" && isAlunoRoute) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
