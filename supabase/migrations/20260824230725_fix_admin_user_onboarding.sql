begin;

-- Permite que usuários criados pelo painel administrativo do Supabase
-- recebam nomes provisórios quando o painel não enviar metadados.
-- Cadastros realizados pelo FechaPool continuam utilizando os nomes
-- informados e validados no formulário da aplicação.

create or replace function private.handle_new_auth_user()
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
  submitted_company_name := coalesce(
    nullif(
      btrim(
        coalesce(new.raw_user_meta_data ->> 'company_name', '')
      ),
      ''
    ),
    'Empresa em configuração'
  );

  submitted_full_name := coalesce(
    nullif(
      btrim(
        coalesce(new.raw_user_meta_data ->> 'full_name', '')
      ),
      ''
    ),
    'Usuário em configuração'
  );

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

commit;