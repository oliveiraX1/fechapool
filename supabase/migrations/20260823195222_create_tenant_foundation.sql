begin;

-- Funções internas de segurança ficam fora da API pública.
create schema if not exists private;

revoke all on schema private from public;
grant usage on schema private to authenticated, service_role;

-- Funções permitidas dentro de uma empresa.
create type public.app_role as enum ('owner', 'seller');

-- Cada registro representa uma empresa cliente do FechaPool.
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  constraint organizations_name_length
    check (char_length(btrim(name)) between 2 and 120),

  constraint organizations_name_no_control_characters
    check (name !~ '[[:cntrl:]]')
);

comment on table public.organizations is
  'Empresas clientes do FechaPool. Cada organização representa um tenant isolado.';

-- Perfil comercial associado ao usuário protegido pelo Supabase Auth.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null
    references public.organizations(id) on delete restrict,
  full_name text not null,
  email text not null,
  role public.app_role not null default 'seller',
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  constraint profiles_full_name_length
    check (char_length(btrim(full_name)) between 2 and 120),

  constraint profiles_full_name_no_control_characters
    check (full_name !~ '[[:cntrl:]]'),

  constraint profiles_email_length
    check (char_length(email) between 3 and 254),

  constraint profiles_email_format
    check (position('@' in email) > 1)
);

comment on table public.profiles is
  'Perfis dos usuários, associados obrigatoriamente a uma organização.';

create index profiles_organization_id_idx
  on public.profiles (organization_id);

create index profiles_organization_role_idx
  on public.profiles (organization_id, role);

-- Atualiza automaticamente a data de modificação.
create function private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function private.set_updated_at() from public;

create trigger organizations_set_updated_at
before update on public.organizations
for each row
execute function private.set_updated_at();

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function private.set_updated_at();

-- Retorna somente a organização do usuário autenticado.
create function private.current_organization_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select profile.organization_id
  from public.profiles as profile
  where profile.id = (select auth.uid())
  limit 1;
$$;

revoke all on function private.current_organization_id() from public;
grant execute on function private.current_organization_id()
  to authenticated, service_role;

-- Retorna somente a função do usuário autenticado.
create function private.current_user_role()
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $$
  select profile.role
  from public.profiles as profile
  where profile.id = (select auth.uid())
  limit 1;
$$;

revoke all on function private.current_user_role() from public;
grant execute on function private.current_user_role()
  to authenticated, service_role;

-- Cria uma empresa e seu primeiro dono após um cadastro no Auth.
create function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_organization_id uuid;
  submitted_company_name text;
  submitted_full_name text;
  submitted_email text;
begin
  submitted_company_name :=
    btrim(coalesce(new.raw_user_meta_data ->> 'company_name', ''));

  submitted_full_name :=
    btrim(coalesce(new.raw_user_meta_data ->> 'full_name', ''));

  submitted_email :=
    lower(btrim(coalesce(new.email, '')));

  if char_length(submitted_company_name) not between 2 and 120
    or submitted_company_name ~ '[[:cntrl:]]'
  then
    raise exception using
      errcode = '22023',
      message = 'Nome da empresa inválido.';
  end if;

  if char_length(submitted_full_name) not between 2 and 120
    or submitted_full_name ~ '[[:cntrl:]]'
  then
    raise exception using
      errcode = '22023',
      message = 'Nome do usuário inválido.';
  end if;

  if char_length(submitted_email) not between 3 and 254
    or position('@' in submitted_email) <= 1
  then
    raise exception using
      errcode = '22023',
      message = 'E-mail inválido.';
  end if;

  insert into public.organizations (name)
  values (submitted_company_name)
  returning id into new_organization_id;

  insert into public.profiles (
    id,
    organization_id,
    full_name,
    email,
    role
  )
  values (
    new.id,
    new_organization_id,
    submitted_full_name,
    submitted_email,
    'owner'
  );

  return new;
end;
$$;

revoke all on function private.handle_new_auth_user() from public;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function private.handle_new_auth_user();

-- Primeiro removemos permissões automáticas excessivas.
revoke all privileges on table public.organizations
  from anon, authenticated;

revoke all privileges on table public.profiles
  from anon, authenticated;

-- Usuários autenticados podem apenas consultar os registros permitidos.
grant select on table public.organizations
  to authenticated;

grant select on table public.profiles
  to authenticated;

-- Um dono pode alterar somente o nome da própria empresa.
grant update (name) on table public.organizations
  to authenticated;

-- Cada usuário pode alterar somente o próprio nome.
-- organization_id, role e email não podem ser alterados diretamente.
grant update (full_name) on table public.profiles
  to authenticated;

grant usage on type public.app_role
  to authenticated, service_role;

grant all privileges on table public.organizations
  to service_role;

grant all privileges on table public.profiles
  to service_role;

-- RLS aplica o isolamento mesmo que alguém tente acessar a API diretamente.
alter table public.organizations enable row level security;
alter table public.profiles enable row level security;

create policy organizations_select_own
on public.organizations
for select
to authenticated
using (
  id = (select private.current_organization_id())
);

create policy organizations_owner_update
on public.organizations
for update
to authenticated
using (
  id = (select private.current_organization_id())
  and (select private.current_user_role()) = 'owner'::public.app_role
)
with check (
  id = (select private.current_organization_id())
  and (select private.current_user_role()) = 'owner'::public.app_role
);

create policy profiles_select_same_organization
on public.profiles
for select
to authenticated
using (
  organization_id = (select private.current_organization_id())
);

create policy profiles_update_own_name
on public.profiles
for update
to authenticated
using (
  id = (select auth.uid())
  and organization_id = (select private.current_organization_id())
)
with check (
  id = (select auth.uid())
  and organization_id = (select private.current_organization_id())
);

commit;