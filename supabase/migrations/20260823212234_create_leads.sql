begin;

-- Permite criar chaves estrangeiras que também validam a empresa.
alter table public.profiles
add constraint profiles_organization_id_id_key
unique (organization_id, id);

create type public.lead_source as enum (
  'whatsapp',
  'instagram',
  'facebook',
  'google',
  'referral',
  'website',
  'advertisement',
  'other'
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null,
  assigned_to uuid not null,
  created_by uuid not null,

  name text not null,
  phone text not null,
  email text,
  city text not null,
  source public.lead_source not null,
  source_detail text,
  notes text,

  entered_at timestamp with time zone not null default now(),
  archived_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  constraint leads_organization_id_fkey
    foreign key (organization_id)
    references public.organizations(id)
    on delete restrict,

  constraint leads_assigned_to_same_organization_fkey
    foreign key (organization_id, assigned_to)
    references public.profiles(organization_id, id)
    on delete restrict,

  constraint leads_created_by_same_organization_fkey
    foreign key (organization_id, created_by)
    references public.profiles(organization_id, id)
    on delete restrict,

  constraint leads_name_length
    check (char_length(btrim(name)) between 2 and 120),

  constraint leads_name_no_control_characters
    check (name !~ '[[:cntrl:]]'),

  constraint leads_phone_format
    check (phone ~ '^[+][1-9][0-9]{7,14}$'),

  constraint leads_email_length
    check (
      email is null
      or char_length(email) between 3 and 254
    ),

  constraint leads_email_format
    check (
      email is null
      or position('@' in email) > 1
    ),

  constraint leads_city_length
    check (char_length(btrim(city)) between 2 and 120),

  constraint leads_city_no_control_characters
    check (city !~ '[[:cntrl:]]'),

  constraint leads_source_detail_length
    check (
      source_detail is null
      or char_length(source_detail) <= 120
    ),

  constraint leads_notes_length
    check (
      notes is null
      or char_length(notes) <= 5000
    )
);

comment on table public.leads is
  'Clientes e oportunidades comerciais isolados por organização.';

comment on column public.leads.phone is
  'Telefone normalizado no formato internacional E.164, como +5511999999999.';

comment on column public.leads.archived_at is
  'Data de arquivamento. A API não permite exclusão definitiva direta.';

create index leads_organization_created_at_idx
  on public.leads (organization_id, created_at desc);

create index leads_organization_assigned_idx
  on public.leads (organization_id, assigned_to, archived_at);

create index leads_organization_phone_idx
  on public.leads (organization_id, phone);

create index leads_organization_source_idx
  on public.leads (organization_id, source);

create trigger leads_set_updated_at
before update on public.leads
for each row
execute function private.set_updated_at();

revoke all privileges on table public.leads
  from anon, authenticated;

grant select on table public.leads
  to authenticated;

grant insert (
  organization_id,
  assigned_to,
  created_by,
  name,
  phone,
  email,
  city,
  source,
  source_detail,
  notes,
  entered_at
)
on public.leads
to authenticated;

grant update (
  assigned_to,
  name,
  phone,
  email,
  city,
  source,
  source_detail,
  notes,
  entered_at,
  archived_at
)
on public.leads
to authenticated;

grant usage on type public.lead_source
  to authenticated, service_role;

grant all privileges on table public.leads
  to service_role;

alter table public.leads enable row level security;

create policy leads_select_allowed
on public.leads
for select
to authenticated
using (
  organization_id = (select private.current_organization_id())
  and (
    (select private.current_user_role()) = 'owner'::public.app_role
    or assigned_to = (select auth.uid())
  )
);

create policy leads_insert_allowed
on public.leads
for insert
to authenticated
with check (
  organization_id = (select private.current_organization_id())
  and created_by = (select auth.uid())
  and (
    (select private.current_user_role()) = 'owner'::public.app_role
    or assigned_to = (select auth.uid())
  )
);

create policy leads_update_allowed
on public.leads
for update
to authenticated
using (
  organization_id = (select private.current_organization_id())
  and (
    (select private.current_user_role()) = 'owner'::public.app_role
    or assigned_to = (select auth.uid())
  )
)
with check (
  organization_id = (select private.current_organization_id())
  and (
    (select private.current_user_role()) = 'owner'::public.app_role
    or assigned_to = (select auth.uid())
  )
);

commit;