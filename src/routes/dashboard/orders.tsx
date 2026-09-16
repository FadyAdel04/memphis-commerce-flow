import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export const Route = createFileRoute("/dashboard/orders")({
  component: OrdersPage,
});

interface Order {
  id: string;
  order_number?: string;
  customer_name?: string;
  customer_phone?: string;
  total_amount?: number;
  status?: string;
  created_at?: string;
}

function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrders = async () => {
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
          setOrders([]);
          setLoading(false);
          return;
        }

        // Fetch real orders from database
        const { data, error } = await supabase
          .from("orders")
          .select(`
            id,
            customer_name,
            customer_phone,
            total_amount,
            status,
            created_at
          `)
          .eq("store_id", storeData.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setOrders(data || []);
      } catch (err: any) {
        console.error("Error loading orders:", err);
        setError("فشل في تحميل الطلبات");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout
        title="إدارة الطلبات والشحنات"
        subtitle="متابعة جميع الطلبات المستخرجة من المحادثات وطباعة بوالص الشحن بنقرة زر"
        activePath="/dashboard/orders"
        actions={
          <button
            type="button"
            className="btn-interactive btn-shimmer px-4 py-2 rounded-full bg-primary text-on-primary border-2 border-on-surface font-bold text-sm hard-shadow-sm cursor-pointer flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
            إنشاء طلب جديد
          </button>
        }
      >
        <div className="bg-surface-container-lowest border-2 border-on-surface rounded-2xl p-12 text-center hard-shadow-sm">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="font-bold text-on-surface-variant">جاري تحميل طلباتك...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout
        title="إدارة الطلبات والشحنات"
        subtitle="متابعة جميع الطلبات المستخرجة من المحادثات وطباعة بوالص الشحن بنقرة زر"
        activePath="/dashboard/orders"
        actions={
          <button
            type="button"
            className="btn-interactive btn-shimmer px-4 py-2 rounded-full bg-primary text-on-primary border-2 border-on-surface font-bold text-sm hard-shadow-sm cursor-pointer flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
            إنشاء طلب جديد
          </button>
        }
      >
        <div className="bg-error-container text-on-error-container border-2 border-on-surface p-4 rounded-2xl font-bold text-center">
          {error}
        </div>
      </DashboardLayout>
    );
  }

  // If no orders exist yet, show empty state
  if (orders.length === 0) {
    return (
      <DashboardLayout
        title="إدارة الطلبات والشحنات"
        subtitle="متابعة جميع الطلبات المستخرجة من المحادثات وطباعة بوالص الشحن بنقرة زر"
        activePath="/dashboard/orders"
        actions={
          <button
            type="button"
            className="btn-interactive btn-shimmer px-4 py-2 rounded-full bg-primary text-on-primary border-2 border-on-surface font-bold text-sm hard-shadow-sm cursor-pointer flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
            إنشاء طلب جديد
          </button>
        }
      >
        <div className="bg-surface-container-lowest border-2 border-on-surface rounded-2xl p-12 text-center">
          <p className="text-lg text-on-surface-variant mb-6">
            لا توجد طلبات بعد. ابدأ بتلقي أول طلب لك!
          </p>
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined">receipt</span>
              </div>
            </div>
            <p className="text-sm text-on-surface-variant max-w-xl">
              جميع الطلبات التي تستقبلها عبر واتساب وإنستجرام وفيسبوك ستظهر هنا تلقائيًا
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="إدارة الطلبات والشحنات"
      subtitle="متابعة جميع الطلبات المستخرجة من المحادثات وطباعة بوالص الشحن بنقرة زر"
      activePath="/dashboard/orders"
      actions={
        <button
          type="button"
          className="btn-interactive btn-shimmer px-4 py-2 rounded-full bg-primary text-on-primary border-2 border-on-surface font-bold text-sm hard-shadow-sm cursor-pointer flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
          إنشاء طلب جديد
        </button>
      }
    >
      <div className="bg-surface-container-lowest border-2 border-on-surface rounded-2xl p-6 hard-shadow-sm space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-medium text-start">
            <thead>
              <tr className="border-b-2 border-on-surface text-on-surface-variant font-bold text-xs uppercase">
                <th className="py-3 px-3 text-start">رقم الطلب</th>
                <th className="py-3 px-3 text-start">اسم العميل</th>
                <th className="py-3 px-3 text-start">الهاتف</th>
                <th className="py-3 px-3 text-start">المبلغ الإجمالي</th>
                <th className="py-3 px-3 text-start">الحالة</th>
                <th className="py-3 px-3 text-start">التاريخ</th>
                <th className="py-3 px-3 text-start">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-on-surface/10">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-surface-container/50 transition-colors">
                  <td className="py-4 px-3 font-mono font-bold text-primary">
                    {ord.order_number || ord.id.slice(0, 8)}...
                  </td>
                  <td className="py-4 px-3 font-bold text-on-surface">
                    {ord.customer_name || "عميل"}
                  </td>
                  <td className="py-4 px-3 font-mono text-xs text-on-surface-variant">
                    {ord.customer_phone || "-"}
                  </td>
                  <td className="py-4 px-3 font-extrabold text-on-surface">
                    {ord.total_amount?.toLocaleString() ?? "0"} ج.م
                  </td>
                  <td className="py-4 px-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      ord.status === "delivered"
                        ? "bg-emerald-100 text-emerald-800 border-emerald-500"
                        : ord.status === "shipped"
                        ? "bg-blue-100 text-blue-800 border-blue-500"
                        : ord.status === "processing"
                        ? "bg-amber-100 text-amber-800 border-amber-500"
                        : "bg-gray-100 text-gray-800 border-gray-400"
                    }`}>
                      {ord.status === "delivered" ? "مكتمل 🟢" : ord.status === "shipped" ? "تم الشحن 🚚" : ord.status === "processing" ? "قيد التحضير 📦" : "قيد الانتظار ⏳"}
                    </span>
                  </td>
                  <td className="py-4 px-3 text-xs text-on-surface-variant font-bold">
                    {ord.created_at ? new Date(ord.created_at).toLocaleDateString("ar-EG") : "-"}
                  </td>
                  <td className="py-4 px-3">
                    <button
                      type="button"
                      className="px-3 py-1 rounded-lg border-2 border-on-surface bg-surface text-xs font-bold hover:bg-tertiary-fixed transition-colors"
                    >
                      طباعة البوليصة 📄
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}