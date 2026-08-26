begin;

-- Estados comerciais de um orçamento.
-- Os nomes ficam estáveis no banco e serão traduzidos na interface.

create type public.quote_status as enum (
  'new_lead',
  'in_service',
  'quote_preparation',
  'quote_sent',
  'waiting_customer',
  'follow_up',
  'negotiation',
  'won',
  'lost'
);

comment on type public.quote_status is
  'Etapas comerciais possíveis de um orçamento no FechaPool.';

-- A combinação abaixo permite que outras tabelas confirmem pelo próprio
-- banco que um lead pertence à organização informada.

alter table public.leads
add constraint leads_organization_id_id_unique
unique (organization_id, id);

-- Cada orçamento pertence obrigatoriamente a uma empresa e a um lead
-- da mesma empresa. As chaves compostas impedem vínculos entre tenants.

create table public.quotes (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null
    references public.organizations(id) on delete restrict,

  lead_id uuid not null,

  assigned_to uuid not null,

  created_by uuid not null,

  description text not null,

  product_type text not null,

  dimensions text,

  amount numeric(14, 2) not null,

  quote_date date not null default current_date,

  valid_until date,

  notes text,

  status public.quote_status not null default 'quote_preparation',

  won_at timestamp with time zone,

  lost_at timestamp with time zone,

  lost_reason text,

  archived_at timestamp with time zone,

  created_at timestamp with time zone not null default now(),

  updated_at timestamp with time zone not null default now(),

  constraint quotes_organization_id_id_key
    unique (organization_id, id),

  constraint quotes_lead_same_organization_fk
    foreign key (organization_id, lead_id)
    references public.leads (organization_id, id)
    on delete restrict,

  constraint quotes_assigned_to_same_organization_fk
    foreign key (organization_id, assigned_to)
    references public.profiles (organization_id, id)
    on delete restrict,

  constraint quotes_created_by_same_organization_fk
    foreign key (organization_id, created_by)
    references public.profiles (organization_id, id)
    on delete restrict,

  constraint quotes_description_length
    check (
      char_length(btrim(description)) between 2 and 2000
    ),

  constraint quotes_product_type_length
    check (
      char_length(btrim(product_type)) between 2 and 120
    ),

  constraint quotes_product_type_no_control_characters
    check (
      product_type !~ '[[:cntrl:]]'
    ),

  constraint quotes_dimensions_length
    check (
      dimensions is null
      or char_length(btrim(dimensions)) between 1 and 80
    ),

  constraint quotes_dimensions_no_control_characters
    check (
      dimensions is null
      or dimensions !~ '[[:cntrl:]]'
    ),

  constraint quotes_amount_positive
    check (
      amount > 0
    ),

  constraint quotes_validity_after_quote_date
    check (
      valid_until is null
      or valid_until >= quote_date
    ),

  constraint quotes_notes_length
    check (
      notes is null
      or char_length(notes) <= 5000
    ),

  constraint quotes_outcome_consistency
    check (
      (
        status = 'won'::public.quote_status
        and won_at is not null
        and lost_at is null
        and lost_reason is null
      )
      or
      (
        status = 'lost'::public.quote_status
        and lost_at is not null
        and won_at is null
        and char_length(btrim(coalesce(lost_reason, '')))
          between 2 and 500
      )
      or
      (
        status not in (
          'won'::public.quote_status,
          'lost'::public.quote_status
        )
        and won_at is null
        and lost_at is null
        and lost_reason is null
      )
    )
);

comment on table public.quotes is
  'Orçamentos comerciais ligados a leads e isolados por organização.';

comment on column public.quotes.amount is
  'Valor total do orçamento em reais, armazenado como decimal exato.';

comment on column public.quotes.won_at is
  'Momento em que o orçamento foi marcado como venda ganha.';

comment on column public.quotes.lost_at is
  'Momento em que o orçamento foi marcado como venda perdida.';

-- Índices para listagem, dashboard, filtros e futuros follow-ups.

create index quotes_organization_created_at_idx
  on public.quotes (
    organization_id,
    created_at desc
  )
  where archived_at is null;

create index quotes_organization_status_date_idx
  on public.quotes (
    organization_id,
    status,
    quote_date desc
  )
  where archived_at is null;

create index quotes_organization_lead_idx
  on public.quotes (
    organization_id,
    lead_id,
    created_at desc
  )
  where archived_at is null;

create index quotes_organization_assignee_status_idx
  on public.quotes (
    organization_id,
    assigned_to,
    status
  )
  where archived_at is null;

create index quotes_organization_validity_idx
  on public.quotes (
    organization_id,
    valid_until
  )
  where archived_at is null
    and valid_until is not null;

-- Reutiliza a função interna já criada para atualizar updated_at.

create trigger quotes_set_updated_at
before update on public.quotes
for each row
execute function private.set_updated_at();

-- Remove permissões automáticas excessivas.

revoke all privileges on table public.quotes
  from anon, authenticated;

-- Usuários autenticados podem consultar somente o que o RLS permitir.

grant select on table public.quotes
  to authenticated;

-- O navegador não pode escolher colunas internas fora desta lista.

grant insert (
  organization_id,
  lead_id,
  assigned_to,
  created_by,
  description,
  product_type,
  dimensions,
  amount,
  quote_date,
  valid_until,
  notes,
  status,
  won_at,
  lost_at,
  lost_reason
)
on table public.quotes
to authenticated;

-- organization_id, lead_id e created_by permanecem imutáveis.

grant update (
  assigned_to,
  description,
  product_type,
  dimensions,
  amount,
  quote_date,
  valid_until,
  notes,
  status,
  won_at,
  lost_at,
  lost_reason,
  archived_at
)
on table public.quotes
to authenticated;

grant usage on type public.quote_status
  to authenticated, service_role;

grant all privileges on table public.quotes
  to service_role;

-- RLS protege a tabela mesmo em chamadas diretas à API.

alter table public.quotes enable row level security;

-- Donos visualizam todos os orçamentos da empresa.
-- Vendedores visualizam somente os orçamentos atribuídos a eles.

create policy quotes_select_allowed
on public.quotes
for select
to authenticated
using (
  organization_id = (
    select private.current_organization_id()
  )
  and (
    (
      select private.current_user_role()
    ) = 'owner'::public.app_role
    or assigned_to = (
      select auth.uid()
    )
  )
);

-- Um orçamento só pode ser criado:
-- 1. dentro da empresa autenticada;
-- 2. pelo próprio usuário autenticado;
-- 3. para um lead acessível e não arquivado;
-- 4. com atribuição permitida para a função do usuário.

create policy quotes_insert_allowed
on public.quotes
for insert
to authenticated
with check (
  organization_id = (
    select private.current_organization_id()
  )
  and created_by = (
    select auth.uid()
  )
  and (
    (
      select private.current_user_role()
    ) = 'owner'::public.app_role
    or (
      (
        select private.current_user_role()
      ) = 'seller'::public.app_role
      and assigned_to = (
        select auth.uid()
      )
    )
  )
  and exists (
    select 1
    from public.leads as lead
    where lead.id = quotes.lead_id
      and lead.organization_id = quotes.organization_id
      and lead.archived_at is null
      and (
        (
          select private.current_user_role()
        ) = 'owner'::public.app_role
        or lead.assigned_to = (
          select auth.uid()
        )
      )
  )
);

-- Donos alteram orçamentos da própria empresa.
-- Vendedores alteram somente aqueles atribuídos a eles e não podem
-- transferi-los para outro vendedor por uma chamada direta à API.

create policy quotes_update_allowed
on public.quotes
for update
to authenticated
using (
  organization_id = (
    select private.current_organization_id()
  )
  and (
    (
      select private.current_user_role()
    ) = 'owner'::public.app_role
    or assigned_to = (
      select auth.uid()
    )
  )
)
with check (
  organization_id = (
    select private.current_organization_id()
  )
  and (
    (
      select private.current_user_role()
    ) = 'owner'::public.app_role
    or (
      (
        select private.current_user_role()
      ) = 'seller'::public.app_role
      and assigned_to = (
        select auth.uid()
      )
    )
  )
);

commit;