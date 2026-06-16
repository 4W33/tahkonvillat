import { revalidatePath } from "next/cache";
import type { PropertyGroup } from "@/lib/admin/property-registry";

export function revalidatePropertyPaths(id: string, group: PropertyGroup) {
  if (group === "villa") {
    revalidatePath("/villat");
    revalidatePath("/en/villas");
    revalidatePath(`/villat/${id}`);
    revalidatePath(`/en/villas/${id}`);
    revalidatePath("/");
    revalidatePath("/en");
    return;
  }

  revalidatePath("/asunnot");
  revalidatePath("/en/apartments");
  revalidatePath("/");
  revalidatePath("/en");
}
