import { AppBreadCrumbs } from "@/components/app-breadcrumbs";
import { RoleForm } from "../role-form";

export default function NewRolePage() {
  const breadcrumbs = [
    { title: "Admin", href: "/admin" },
    { title: "Roles", href: "/admin/roles" },
    { title: "New", href: "/admin/roles/new" },
  ];

  return (
    <div className="p-4 space-y-4">
      <AppBreadCrumbs items={breadcrumbs} />
      <RoleForm />
    </div>
  );
}
