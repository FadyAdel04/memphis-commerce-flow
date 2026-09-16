import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export const Route = createFileRoute("/dashboard/customers")({
  component: CustomersPage,
});

function CustomersPage() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCustomers = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Get store info first
        const { data: storeData, error: storeError } = await supabase
          .from("stores")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (storeError && storeError.code !== "PGRST116") {
          throw storeError;
        }

        if (!storeData) {
          // No store yet
          setCustomers([]);
          setLoading(false);
          return;
        }

        // Fetch real customers from database
        const { data, error } = await supabase
          .from("customers")
          .select(`
            id,
            name,
            phone,
            total_spent,
            order_count,
            last_order_at,
            created_at
          `)
          .eq("store_id", storeData.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setCustomers(data || []);
      } catch (err) {
        console.error("Error loading customers:", err);
        setError("فشل في تحميل العملاء");
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout
        title="قاعدة العملاء و CRM"
        subtitle="سجل موحد لكل عملائك وتاريخ محادثاتهم وطلباتهم عبر جميع المنصات"
        activePath="/dashboard/customers"
        actions={
          <button
            type="button"
            className="btn-interactive btn-shimmer px-4 py-2 rounded-full bg-primary text-on-primary border-2 border-on-surface font-bold text-sm hard-shadow-sm cursor-pointer flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            إضافة عميل جديد
          </button>
        }
      >
        <div className="bg-surface-container-lowest border-2 border-on-surface rounded-2xl p-12 text-center hard-shadow-sm">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="font-bold text-on-surface-variant">جاري تحميل عملائك...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout
        title="قاعدة العملاء و CRM"
        subtitle="سجل موحد لكل عملائك وتاريخ محادثاتهم وطلباتهم عبر جميع المنصات"
        activePath="/dashboard/customers"
        actions={
          <button
            type="button"
            className="btn-interactive btn-shimmer px-4 py-2 rounded-full bg-primary text-on-primary border-2 border-on-surface font-bold text-sm hard-shadow-sm cursor-pointer flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            إضافة عميل جديد
          </button>
        }
      >
        <div className="bg-error-container text-on-error-container border-2 border-on-surface rounded-2xl p-4">
          {error}
        </div>
      </DashboardLayout>
    );
  }

  // If no customers exist yet, show empty state
  if (customers.length === 0) {
    return (
      <DashboardLayout
        title="قاعدة العملاء و CRM"
        subtitle="سجل موحد لكل عملائك وتاريخ محادثاتهم وطلباتهم عبر جميع المنصات"
        activePath="/dashboard/customers"
        actions={
          <button
            type="button"
            className="btn-interactive btn-shimmer px-4 py-2 rounded-full bg-primary text-on-primary border-2 border-on-surface font-bold text-sm hard-shadow-sm cursor-pointer flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            إضافة عميل جديد
          </button>
        }
      >
        <div className="bg-surface-container-lowest border-2 border-on-surface rounded-2xl p-12 text-center">
          <p className="text-lg text-on-surface-variant mb-6">
            لا توجد عملاء بعد. ابدأ بتلقي أول طلب لك لتسجيل العملاء تلقائيًا!
          </p>
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined">people</span>
              </div>
            </div>
            <p className="text-sm text-on-surface-variant max-w-xl">
              كل عميل يطلب من خلال قنواتك سيتم aggiunto تلقائيًا إلى قاعدة العملاء مع تاريخ المحادثات والطلبات
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="قاعدة العملاء و CRM"
      subtitle="سجل موحد لكل عملائك وتاريخ محادثاتهم وطلباتهم عبر جميع المنصات"
      activePath="/dashboard/customers"
      actions={
        <button
          type="button"
          className="btn-interactive btn-shimmer px-4 py-2 rounded-full bg-primary text-on-primary border-2 border-on-surface font-bold text-sm hard-shadow-sm cursor-pointer flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          إضافة عميل جديد
        </button>
      }
    >
      <div className="bg-surface-container-lowest border-2 border-on-surface rounded-2xl p-6 hard-shadow-sm space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-medium text-start">
            <thead>
              <tr className="border-b-2 border-on-surface text-on-surface-variant font-bold text-xs uppercase">
                <th className="py-3 px-3 text-start">الاسم</th>
                <th className="py-3 px-3 text-start">رقم الهاتف</th>
                <th className="py-3 px-3 text-start">القناة الرئيسية</th>
                <th className="py-3 px-3 text-start">عدد الطلبات</th>
                <th className="py-3 px-3 text-start">إجمالي المشتريات</th>
                <th className="py-3 px-3 text-start">التصنيف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-on-surface/10">
              {customers.map((customer) => {
                // Determine customer tag based on order count and total spent
                let tag = "عميل جديد 🆕";
                if (customer.order_count >= 10) {
                  tag = "عميل مميز ⭐";
                } else if (customer.order_count >= 5) {
                  tag = "عميل دائم 💎";
                }

                return (
                  <tr key={customer.id} className="hover:bg-surface-container/50 transition-colors">
                    <td className="py-4 px-3 font-bold text-on-surface">
                      {customer.name}
                    </td>
                    <td className="py-4 px-3 font-mono text-xs font-bold text-on-surface-variant">
                      {customer.phone || "-"}
                    </td>
                    <td className="py-4 px-3 text-xs font-bold text-on-surface-variant">
                      {/* Channel would need to be stored or derived from conversations - placeholder */}
                      غير محدد
                    </td>
                    <td className="py-4 px-3 font-bold text-on-surface">
                      {customer.order_count} طلبات
                    </td>
                    <td className="py-4 px-3 font-extrabold text-primary">
                      {(customer.total_spent ?? 0).toLocaleString()} ج.م
                    </td>
                    <td className="py-4 px-3">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-tertiary-fixed text-on-tertiary-fixed border border-on-surface">
                        {tag}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}