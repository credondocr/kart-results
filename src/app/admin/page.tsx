import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/adminPageAuth";

export default async function AdminIndexPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/login");
  }
  redirect("/admin/pilots");
}
