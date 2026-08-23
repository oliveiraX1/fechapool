"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function logout() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut({
    scope: "local",
  });

  if (error) {
    console.error("[auth/logout] Não foi possível encerrar a sessão.", {
      name: error.name,
      status: error.status,
    });

    redirect("/dashboard?erro=logout");
  }

  redirect("/entrar");
}