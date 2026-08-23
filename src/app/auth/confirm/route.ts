import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

const allowedConfirmationTypes: EmailOtpType[] = ["email", "signup"];

function isAllowedConfirmationType(
  value: string | null,
): value is EmailOtpType {
  return (
    value !== null &&
    allowedConfirmationTypes.includes(value as EmailOtpType)
  );
}

function dashboardRedirect(requestUrl: URL) {
  return NextResponse.redirect(
    new URL("/dashboard", requestUrl.origin),
  );
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return dashboardRedirect(requestUrl);
    }
  }

  if (tokenHash && isAllowedConfirmationType(type)) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (!error) {
      return dashboardRedirect(requestUrl);
    }
  }

  return NextResponse.redirect(
    new URL("/entrar?erro=confirmacao", requestUrl.origin),
  );
}