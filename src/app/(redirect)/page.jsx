import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  localeFromAcceptLanguage,
  normalizeLocale
} from "../../lib/locale";

export const dynamic = "force-dynamic";

export default async function HomeRedirect() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const requestedLocale = localeFromAcceptLanguage(headerStore.get("accept-language"));
  const locale = normalizeLocale(cookieStore.get(LOCALE_COOKIE)?.value, requestedLocale || DEFAULT_LOCALE);

  redirect(`/${locale}`);
}
