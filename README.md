# Strix

Plataforma que conecta Personal Trainers e Alunos. Etapa 1 do roadmap: fundação
(setup, autenticação, design system e schema de banco).

## O que já está implementado

- Next.js 14 (App Router) + TypeScript + Tailwind, com os tokens de cor/tipografia/sombra
  do design system já configurados em `tailwind.config.ts` e `app/globals.css`.
- Autenticação com Supabase: `/login` e `/cadastro` (com seleção de papel Personal/Aluno).
- Middleware (`middleware.ts`) que redireciona por papel e protege as rotas:
  não autenticado → `/login`; personal → área `(personal)`; aluno → área `(aluno)`.
- Layouts das duas áreas: sidebar fixa para o Personal, bottom navigation para o Aluno.
- Dashboard do Personal e tela "Hoje" do Aluno já puxando dados reais do Supabase
  (por enquanto mostrando zero/vazio, pois o banco está limpo).
- Schema completo do banco com Row Level Security em
  `supabase/migrations/0001_init.sql` (todas as tabelas do modelo de dados definido
  no planejamento: usuários, treinos, agenda, financeiro, dieta, água etc).

## Como rodar localmente

1. Instale as dependências:
   ```
   npm install
   ```

2. Crie um projeto em [supabase.com](https://supabase.com) e rode a migration:
   ```
   npx supabase db push
   ```
   (ou cole o conteúdo de `supabase/migrations/0001_init.sql` no SQL Editor do
   painel do Supabase)

3. Copie `.env.example` para `.env.local` e preencha com a URL e a anon key do
   seu projeto Supabase (Project Settings → API).

4. Rode o projeto:
   ```
   npm run dev
   ```
   Acesse `http://localhost:3000/cadastro` para criar a primeira conta.

## Próximos passos (Etapa 2 do roadmap)

- CRUD de Alunos + perfil completo
- Biblioteca de Treinos (criar, editar, duplicar, categorias)
- Atribuição de treino a aluno

## Sobre a logo

Assim que você enviar a logo do Strix, ela substitui o wordmark em texto usado
hoje em `components/layout/sidebar.tsx` e nas páginas de login/cadastro.
