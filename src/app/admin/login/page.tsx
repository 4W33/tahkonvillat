import Image from "next/image";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/admin/auth";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { BRAND_LOGO, BRAND_NAME } from "@/lib/constants";

export default async function AdminLoginPage() {
  if (await isAuthenticated()) {
    redirect("/admin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <Image
            src={BRAND_LOGO}
            alt={BRAND_NAME}
            width={128}
            height={128}
            className="h-28 w-28 object-contain sm:h-32 sm:w-32"
          />
          <p className="mt-3 text-sm text-slate-600">Varausten hallinta</p>
        </div>
        <AdminLoginForm />
      </div>
    </main>
  );
}
