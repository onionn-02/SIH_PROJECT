import { AdminTabs } from "@/components/admin/admin-tabs";
import { UserList } from "@/components/admin/user-list";
import { PageHeader } from "@/components/shared/page-header";
import { en } from "@/i18n/en";

export default function AdminUsersPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <AdminTabs />
      <PageHeader title={en.nav.adminUsers} description={en.admin.usersDescription} />
      <UserList />
    </div>
  );
}
