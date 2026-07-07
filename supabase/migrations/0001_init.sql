-- ==========================================================
-- Strix — Schema inicial (Etapa 1: fundação)
-- ==========================================================

create type user_role as enum ('personal', 'aluno');
create type status_aluno as enum ('ativo', 'inativo');
create type status_aula as enum ('agendada', 'concluida', 'cancelada', 'reagendada');
create type status_pagamento as enum ('pago', 'pendente', 'atrasado');
create type categoria_treino as enum (
  'hipertrofia', 'emagrecimento', 'iniciante', 'intermediario', 'avancado', 'mobilidade', 'cardio'
);

-- ---------- usuários ----------
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  nome text not null,
  telefone text,
  foto_url text,
  role user_role not null,
  created_at timestamptz not null default now()
);

create table personal_profiles (
  id uuid primary key references users(id) on delete cascade,
  nome_negocio text,
  bio text,
  meta_financeira_mes numeric(10, 2)
);

create table aluno_profiles (
  id uuid primary key references users(id) on delete cascade,
  personal_id uuid references personal_profiles(id) on delete set null,
  objetivo text,
  peso_atual numeric(5, 2),
  altura numeric(5, 2),
  plano text,
  status status_aluno not null default 'ativo'
);

-- ---------- avaliação física ----------
create table avaliacoes_fisicas (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references aluno_profiles(id) on delete cascade,
  data date not null default current_date,
  peso numeric(5, 2),
  percentual_gordura numeric(4, 1),
  massa_muscular numeric(5, 2),
  medidas jsonb,
  fotos text[]
);

-- ---------- treinos ----------
create table treinos_biblioteca (
  id uuid primary key default gen_random_uuid(),
  personal_id uuid not null references personal_profiles(id) on delete cascade,
  nome text not null,
  objetivo text,
  categoria categoria_treino not null,
  observacoes text,
  created_at timestamptz not null default now()
);

create table exercicios (
  id uuid primary key default gen_random_uuid(),
  treino_id uuid not null references treinos_biblioteca(id) on delete cascade,
  nome text not null,
  series int,
  repeticoes text,
  carga text,
  tempo text,
  descanso text,
  midia_url text,
  ordem int not null default 0
);

create table treinos_atribuidos (
  id uuid primary key default gen_random_uuid(),
  treino_id uuid not null references treinos_biblioteca(id) on delete cascade,
  aluno_id uuid not null references aluno_profiles(id) on delete cascade,
  data_envio timestamptz not null default now(),
  status text not null default 'pendente',
  data_conclusao timestamptz
);

create table execucao_exercicios (
  id uuid primary key default gen_random_uuid(),
  treino_atribuido_id uuid not null references treinos_atribuidos(id) on delete cascade,
  exercicio_id uuid not null references exercicios(id) on delete cascade,
  concluido boolean not null default false,
  carga_realizada text,
  observacao_aluno text
);

-- ---------- dieta ----------
create table dietas (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references aluno_profiles(id) on delete cascade,
  data date not null default current_date
);

create table refeicoes (
  id uuid primary key default gen_random_uuid(),
  dieta_id uuid not null references dietas(id) on delete cascade,
  tipo text not null,
  horario time,
  alimentos jsonb,
  calorias int,
  proteinas numeric(5, 1),
  carboidratos numeric(5, 1),
  gorduras numeric(5, 1),
  concluida boolean not null default false
);

-- ---------- agenda ----------
create table agenda_aulas (
  id uuid primary key default gen_random_uuid(),
  personal_id uuid not null references personal_profiles(id) on delete cascade,
  aluno_id uuid not null references aluno_profiles(id) on delete cascade,
  data_hora timestamptz not null,
  local text,
  status status_aula not null default 'agendada',
  observacoes text,
  cor text
);

-- ---------- financeiro ----------
create table pagamentos (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references aluno_profiles(id) on delete cascade,
  personal_id uuid not null references personal_profiles(id) on delete cascade,
  valor numeric(10, 2) not null,
  data_vencimento date not null,
  data_pagamento date,
  status status_pagamento not null default 'pendente'
);

-- ---------- água ----------
create table registro_agua (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references aluno_profiles(id) on delete cascade,
  data date not null default current_date,
  quantidade_ml int not null default 0,
  meta_ml int not null default 3000
);

-- ---------- índices ----------
create index idx_aluno_personal on aluno_profiles(personal_id);
create index idx_agenda_data on agenda_aulas(data_hora);
create index idx_treinos_atribuidos_aluno on treinos_atribuidos(aluno_id);
create index idx_pagamentos_status on pagamentos(status);

-- ==========================================================
-- Row Level Security
-- ==========================================================
alter table users enable row level security;
alter table personal_profiles enable row level security;
alter table aluno_profiles enable row level security;
alter table avaliacoes_fisicas enable row level security;
alter table treinos_biblioteca enable row level security;
alter table exercicios enable row level security;
alter table treinos_atribuidos enable row level security;
alter table execucao_exercicios enable row level security;
alter table dietas enable row level security;
alter table refeicoes enable row level security;
alter table agenda_aulas enable row level security;
alter table pagamentos enable row level security;
alter table registro_agua enable row level security;

-- usuário só lê/edita o próprio registro em `users`
create policy "usuario_le_proprio_registro" on users
  for select using (auth.uid() = id);
create policy "usuario_edita_proprio_registro" on users
  for update using (auth.uid() = id);

-- personal só enxerga seu próprio perfil de negócio
create policy "personal_le_proprio_perfil" on personal_profiles
  for all using (auth.uid() = id);

-- aluno lê o próprio perfil; personal lê os perfis dos seus alunos
create policy "aluno_le_proprio_perfil" on aluno_profiles
  for select using (auth.uid() = id or auth.uid() = personal_id);
create policy "aluno_edita_proprio_perfil" on aluno_profiles
  for update using (auth.uid() = id);
create policy "personal_gerencia_alunos" on aluno_profiles
  for all using (auth.uid() = personal_id);

-- treinos: só o personal dono da biblioteca
create policy "personal_gerencia_treinos" on treinos_biblioteca
  for all using (auth.uid() = personal_id);

-- exercícios seguem a permissão do treino
create policy "acesso_exercicios_via_treino" on exercicios
  for all using (
    exists (
      select 1 from treinos_biblioteca t
      where t.id = exercicios.treino_id and t.personal_id = auth.uid()
    )
  );

-- treinos atribuídos: aluno lê os seus, personal lê/gerencia os que enviou
create policy "aluno_le_treinos_atribuidos" on treinos_atribuidos
  for select using (auth.uid() = aluno_id);
create policy "personal_gerencia_treinos_atribuidos" on treinos_atribuidos
  for all using (
    exists (
      select 1 from treinos_biblioteca t
      where t.id = treinos_atribuidos.treino_id and t.personal_id = auth.uid()
    )
  );

-- execução de exercícios: só o próprio aluno
create policy "aluno_gerencia_execucao" on execucao_exercicios
  for all using (
    exists (
      select 1 from treinos_atribuidos ta
      where ta.id = execucao_exercicios.treino_atribuido_id and ta.aluno_id = auth.uid()
    )
  );

-- dieta e refeições: só o próprio aluno (personal edita via função dedicada, se necessário)
create policy "aluno_gerencia_dieta" on dietas
  for all using (auth.uid() = aluno_id);
create policy "acesso_refeicoes_via_dieta" on refeicoes
  for all using (
    exists (select 1 from dietas d where d.id = refeicoes.dieta_id and d.aluno_id = auth.uid())
  );

-- agenda: aluno lê as suas aulas, personal gerencia as que criou
create policy "aluno_le_proprias_aulas" on agenda_aulas
  for select using (auth.uid() = aluno_id);
create policy "personal_gerencia_agenda" on agenda_aulas
  for all using (auth.uid() = personal_id);

-- pagamentos: aluno lê os seus, personal gerencia os que emitiu
create policy "aluno_le_proprios_pagamentos" on pagamentos
  for select using (auth.uid() = aluno_id);
create policy "personal_gerencia_pagamentos" on pagamentos
  for all using (auth.uid() = personal_id);

-- registro de água: só o próprio aluno
create policy "aluno_gerencia_agua" on registro_agua
  for all using (auth.uid() = aluno_id);
