import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { AppBreadCrumbs } from "@/components/app-breadcrumbs";
import { PermissionForm } from "../permission-form";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function EditPermissionPage({ params }: any) {
  const supabase = await createClient();

  // Fetch permission data
  const { data: permission } = await supabase
    .from("permissions")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!permission) {
    notFound();
  }

  const breadcrumbs = [
    { title: "Admin", href: "/admin" },
    { title: "Permissions", href: "/admin/permissions" },
    { title: "Edit", href: `/admin/permissions/${params.id}` },
  ];

  return (
    <div className="p-4 space-y-4">
      <AppBreadCrumbs items={breadcrumbs} />
      <PermissionForm permission={permission} />
    </div>
  );
}
