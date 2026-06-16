import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/admin/auth";
import { getAdminProperties } from "@/lib/admin/properties";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export default async function AdminPage() {
  if (!(await isAuthenticated())) {
    redirect("/admin/login");
  }

  const properties = await getAdminProperties();

  return <AdminDashboard properties={properties} />;
}
