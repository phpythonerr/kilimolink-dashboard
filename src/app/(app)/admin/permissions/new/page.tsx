import { AppBreadCrumbs } from "@/components/app-breadcrumbs";
import { PermissionForm } from "../permission-form";

export default function NewPermissionPage() {
  const breadcrumbs = [
    { title: "Admin", href: "/admin" },
    { title: "Permissions", href: "/admin/permissions" },
    { title: "New", href: "/admin/permissions/new" },
  ];

  return (
    <div className="p-4 space-y-4">
      <AppBreadCrumbs items={breadcrumbs} />
      <PermissionForm />
    </div>
  );
}
