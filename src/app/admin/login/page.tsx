import { redirect } from "next/navigation";

/** Alias legacy: el login unificado vive en /login. */
export default function AdminLoginAlias() {
  redirect("/login");
}
