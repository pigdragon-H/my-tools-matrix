import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function AdminUsers() {
  const { lang } = useLanguage();
  const users = trpc.admin.recentUsers.useQuery({ limit: 50 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
          <Users className="h-6 w-6" />
          {lang === "zh" ? "用戶管理" : "Users"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {lang === "zh"
            ? "從 Supabase Auth 讀取的最近用戶。Phase E.8 將加入 admin role 設定。"
            : "Recent users from Supabase Auth. Phase E.8 will add role assignment."}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {lang === "zh" ? "最近用戶 (前 50)" : "Recent users (top 50)"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {users.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (users.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {lang === "zh"
                ? "尚無用戶（或 SUPABASE_SERVICE_ROLE_KEY 未設定）。"
                : "No users yet (or SUPABASE_SERVICE_ROLE_KEY missing)."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Role</th>
                    <th className="py-2 pr-4">{lang === "zh" ? "註冊時間" : "Created"}</th>
                    <th className="py-2 pr-4">{lang === "zh" ? "最後登入" : "Last sign-in"}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.data!.map((u) => (
                    <tr key={u.id} className="border-b border-dashed last:border-0">
                      <td className="py-2 pr-4 font-mono text-xs">{u.email}</td>
                      <td className="py-2 pr-4">{u.name ?? "—"}</td>
                      <td className="py-2 pr-4">
                        <Badge
                          variant={u.role === "admin" ? "default" : "outline"}
                          className="text-[10px]"
                        >
                          {u.role}
                        </Badge>
                      </td>
                      <td className="py-2 pr-4 text-xs text-muted-foreground">
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString(
                              lang === "zh" ? "zh-TW" : "en-US"
                            )
                          : "—"}
                      </td>
                      <td className="py-2 pr-4 text-xs text-muted-foreground">
                        {u.lastSignInAt
                          ? new Date(u.lastSignInAt).toLocaleString(
                              lang === "zh" ? "zh-TW" : "en-US"
                            )
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
