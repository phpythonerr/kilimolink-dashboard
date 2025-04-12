import { AppBreadCrumbs } from "@/components/app-breadcrumbs";
import { PermissionForm } from "../permission-form";

export default function NewPermissionPage() {
  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Admin", href: "/admin" },
    { label: "Permissions", href: "/admin/permissions" },
    { label: "New", href: "/admin/permissions/new", current: true },
  ];

  return (
    <div className="p-4 space-y-4">
      <AppBreadCrumbs items={breadcrumbs} />
      <PermissionForm />
    </div>
  );
}
