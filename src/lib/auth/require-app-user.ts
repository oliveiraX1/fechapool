import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type AppRole = "owner" | "seller";

export const requireAppUser = cache(async () => {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const userId = claimsData?.claims?.sub;

  if (claimsError || typeof userId !== "string") {
    redirect("/entrar");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, organization_id, full_name, email, role")
    .eq("id", userId)
    .single();

  if (
    profileError ||
    !profile ||
    (profile.role !== "owner" && profile.role !== "seller")
  ) {
    console.error("[auth/context] Perfil válido não encontrado.", {
      code: profileError?.code,
    });

    throw new Error("Não foi possível carregar o perfil do usuário.");
  }

  const { data: organization, error: organizationError } =
    await supabase
      .from("organizations")
      .select("id, name")
      .eq("id", profile.organization_id)
      .single();

  if (organizationError || !organization) {
    console.error("[auth/context] Organização válida não encontrada.", {
      code: organizationError?.code,
    });

    throw new Error("Não foi possível carregar a empresa.");
  }

  return {
    supabase,
    user: {
      id: profile.id,
      organizationId: profile.organization_id,
      fullName: profile.full_name,
      email: profile.email,
      role: profile.role as AppRole,
    },
    organization: {
      id: organization.id,
      name: organization.name,
    },
  };
});