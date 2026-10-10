import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifySessionToken, ADMIN_COOKIE } from "@/lib/adminAuth";

export default async function AdminIndexPage() {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!verifySessionToken(token)) {
    redirect("/admin/login");
  }
  redirect("/admin/pilots");
}
