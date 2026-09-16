import { ReactNode, useState, useEffect } from "react";
import waslaLogo from "@/assets/wasla-logo.png";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  activePath: string;
  actions?: ReactNode;
}

const navItems = [
  { path: "/dashboard/", label: "الرئيسية", icon: "space_dashboard" },
  { path: "/dashboard/inbox", label: "صندوق الرسائل (Live Inbox)", icon: "inbox", badge: "جديد" },
  { path: "/dashboard/channels", label: "الربط والقنوات", icon: "hub" },
  { path: "/dashboard/orders", label: "الطلبات والعملاء", icon: "shopping_cart" },
  { path: "/dashboard/products", label: "المنتجات والمخزون", icon: "inventory_2" },
  { path: "/dashboard/customers", label: "قاعدة العملاء", icon: "group" },
  { path: "/dashboard/analytics", label: "التقارير والأرباح", icon: "analytics" },
  { path: "/dashboard/settings", label: "إعدادات المتجر", icon: "settings" },
];

export function DashboardLayout({ children, title, subtitle, activePath, actions }: DashboardLayoutProps) {
  const { user, signOut } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Store Plan & Trial State
  const [storeName, setStoreName] = useState("متجر نيل شوب");
  const [storeId, setStoreId] = useState<string | null>(null);
  const [plan, setPlan] = useState("growth");
  const [subscriptionStatus, setSubscriptionStatus] = useState<"trial" | "active" | "expired">("trial");
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(14);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<"fawry" | "card" | "wallet">("fawry");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);

    const loadStorePlan = async () => {
      if (!user) return;
      try {
        const { data: storeData } = await supabase
          .from("stores")
          .select("id, name, plan, trial_ends_at, subscription_status")
          .eq("user_id", user.id)
          .maybeSingle();

        if (storeData) {
          if (storeData.name) setStoreName(storeData.name);
          if (storeData.id) setStoreId(storeData.id);
          if (storeData.plan) setPlan(storeData.plan);
          if (storeData.subscription_status) {
            setSubscriptionStatus(storeData.subscription_status as any);
          }

          if (storeData.trial_ends_at) {
            const ms = new Date(storeData.trial_ends_at).getTime() - Date.now();
            const days = Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
            setTrialDaysLeft(days);
          } else {
            setTrialDaysLeft(14);
          }
        } else {
          // Check local fallback
          const localEnds = localStorage.getItem("wasla_trial_ends_at");
          if (localEnds) {
            const ms = new Date(localEnds).getTime() - Date.now();
            setTrialDaysLeft(Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24))));
          }
          const localStatus = localStorage.getItem("wasla_subscription_status");
          if (localStatus === "active") setSubscriptionStatus("active");
        }
      } catch (err) {
        console.warn("Could not fetch store plan:", err);
      }
    };

    loadStorePlan();
  }, [user]);

  const handleConfirmPayment = async () => {
    setProcessingPayment(true);
    try {
      if (storeId) {
        await supabase
          .from("stores")
          .update({
            subscription_status: "active",
            trial_ends_at: null,
          })
          .eq("id", storeId);
      }
      localStorage.setItem("wasla_subscription_status", "active");
      setSubscriptionStatus("active");
      setPaymentSuccess(true);
      setTimeout(() => {
        setPaymentSuccess(false);
        setShowPayModal(false);
      }, 2500);
    } catch (err) {
      console.error("Payment confirmation error:", err);
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.warn("Sign out err:", err);
    } finally {
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
  };

  return (
    <div className="min-h-screen bg-background font-body-md text-on-surface antialiased flex flex-col" dir="rtl" suppressHydrationWarning>
      {/* Top Navbar - sticky with z-index higher than sidebar */}
      <header className="sticky top-0 z-50 bg-surface-container-lowest border-b-2 border-on-surface px-4 md:px-8 py-3 hard-shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-xl border-2 border-on-surface bg-surface hover:bg-surface-container hard-shadow-sm cursor-pointer"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              type="button"
              title="القائمة"
            >
              <span className="material-symbols-outlined text-[22px]">
                {mobileSidebarOpen ? "close" : "menu"}
              </span>
            </button>

            {/* Brand Logo */}
            <a href="/" className="flex items-center gap-2 group transition-transform hover:scale-105">
              <img src={waslaLogo} alt="وِصلة" className="h-8 md:h-10 w-auto object-contain rounded-lg" />
              <div className="flex flex-col">
                <span className="font-headline-sm text-base md:text-lg font-bold text-on-surface leading-none">وِصلة</span>
                <span className="hidden md:inline-block font-badge-sticker text-[10px] text-primary leading-none uppercase mt-0.5">WASLA DASHBOARD</span>
              </div>
            </a>

            <div className="hidden lg:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed border border-on-surface text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              {storeName} | LIVE SYNC
            </div>

            {/* Plan Counter & Payment Trigger */}
            {subscriptionStatus === "trial" && trialDaysLeft !== null && (
              <div className="hidden md:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-950 border-2 border-amber-500 text-xs font-extrabold hard-shadow-sm">
                <span className="material-symbols-outlined text-[16px] text-amber-700 animate-bounce">timer</span>
                <span>باقة النمو ({trialDaysLeft} يوم)</span>
                <button
                  type="button"
                  onClick={() => setShowPayModal(true)}
                  className="px-2.5 py-0.5 rounded-full bg-primary text-on-primary text-[10px] font-black border border-on-surface hover:bg-primary-container cursor-pointer transition-transform hover:scale-105"
                  title="دفع الاشتراك والترقية"
                >
                  تفعيل 💳
                </button>
              </div>
            )}

            {subscriptionStatus === "active" && (
              <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border-2 border-emerald-600 text-xs font-extrabold">
                <span className="material-symbols-outlined text-[16px] text-emerald-700">verified</span>
                <span>باقة النمو (اشتراك نشط ✅)</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border-2 border-on-surface bg-surface text-xs font-bold hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">storefront</span>
              معاينة الموقع
            </a>

            <div className="flex items-center gap-2">
              <a
                href="/dashboard/settings"
                suppressHydrationWarning
                className="w-9 h-9 rounded-full bg-primary text-on-primary border-2 border-on-surface hard-shadow-sm flex items-center justify-center font-bold text-sm shrink-0 hover:scale-105 transition-transform"
                title={user?.email ? `حساب: ${user.email}` : "الملف الشخصي"}
              >
                {mounted ? (user?.email?.[0]?.toUpperCase() || "W") : "W"}
              </a>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full border-2 border-on-surface hover:bg-error-container/40 text-error font-bold text-xs transition-colors cursor-pointer"
                title="تسجيل الخروج والعودة للرئيسية"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                <span className="hidden sm:inline">خروج</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 md:px-8 py-6 gap-6 relative">
        {/* Sidebar - fixed with top offset for navbar */}
        <aside
          className={`fixed lg:sticky lg:top-[calc(theme(spacing.16)+1.5rem)] z-[60] lg:z-40 inset-y-0 start-0 w-64 bg-surface-container-lowest border-2 border-on-surface lg:rounded-2xl p-4 hard-shadow-sm flex flex-col justify-between transition-transform duration-300 h-[100dvh] lg:h-[calc(100vh-theme(spacing.16)-3rem)] ${
            mobileSidebarOpen ? "translate-x-0 shadow-2xl" : "translate-x-full lg:translate-x-0"
          }`}
          style={{
            top: mobileSidebarOpen ? '0' : undefined,
            right: mobileSidebarOpen ? '0' : undefined,
            left: mobileSidebarOpen ? 'auto' : undefined,
          }}
        >
          {mobileSidebarOpen && (
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden absolute top-4 end-4 p-2 rounded-xl bg-surface hover:bg-surface-container text-on-surface border-2 border-on-surface cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
          <div className="space-y-4 overflow-y-auto flex-1 mt-10 lg:mt-0">
            <div className="px-2 py-1 font-badge-sticker text-xs text-on-surface-variant uppercase font-bold">
              القائمة الرئيسية
            </div>
            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const isActive = activePath === item.path;
                return (
                  <a
                    key={item.path}
                    href={item.path}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl border-2 transition-all font-label-lg text-sm font-bold ${
                      isActive
                        ? "bg-primary text-on-primary border-on-surface hard-shadow-sm"
                        : "border-transparent text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                      <span>{item.label}</span>
                    </span>
                    {item.badge && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-black border border-on-surface ${
                          isActive
                            ? "bg-tertiary-fixed text-on-tertiary-fixed"
                            : "bg-primary-container text-on-primary-container"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </a>
                );
              })}
            </nav>
          </div>

          <div className="pt-4 border-t-2 border-on-surface/10 mt-6 space-y-3 flex-shrink-0">
            <div className="p-3 rounded-xl bg-tertiary-fixed border border-on-surface">
              <div className="font-bold text-xs text-on-tertiary-fixed mb-1">💡 نصيحة التجارة الذكية</div>
              <p className="text-xs text-on-tertiary-fixed/90 leading-tight">
                ربطت واتساب؟ تفعيل الرد التلقائي يرفع نسبة إتمام الشراء بـ 35%.
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border-2 border-on-surface text-error hover:bg-error-container/30 font-bold text-xs transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span>تسجيل الخروج من الحساب</span>
            </button>
          </div>
        </aside>

        {/* Backdrop for mobile */}
        {mobileSidebarOpen && (
          <div
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 z-[50] bg-black/40 backdrop-blur-xs lg:hidden"
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container-lowest p-6 rounded-2xl border-2 border-on-surface hard-shadow-sm">
            <div>
              <h1 className="font-display-hero text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">
                {title}
              </h1>
              {subtitle && <p className="font-body-md text-sm text-on-surface-variant mt-1">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
          </div>

          {children}
        </main>
      </div>

      {/* Payment / Upgrade Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface-container-lowest border-2 border-on-surface rounded-3xl max-w-lg w-full p-6 md:p-8 hard-shadow-sm space-y-6 animate-in zoom-in-95">
            {paymentSuccess ? (
              <div className="text-center py-6 space-y-4 animate-in fade-in">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-800 border-2 border-emerald-600 rounded-2xl flex items-center justify-center mx-auto text-3xl hard-shadow-sm">
                  ✓
                </div>
                <h3 className="font-display-hero text-2xl font-extrabold text-on-surface">
                  تم سداد الاشتراك وتفعيل المتجر بنجاح! 🎉
                </h3>
                <p className="font-body-md text-sm text-on-surface-variant max-w-sm mx-auto">
                  تمت ترقية متجرك إلى باقة النمو المدفوعة بدون قيود زمنية. أهلاً بك في عالم التجارة الذكية.
                </p>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-600 text-xs font-bold">
                    رقم العملية: WASLA-INV-{Date.now().toString().slice(-6)}
                  </span>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b-2 border-on-surface/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold text-lg border border-on-surface">
                      💳
                    </span>
                    <div>
                      <h2 className="font-display-hero text-lg font-extrabold text-on-surface">
                        ترقية وتفعيل باقة النمو (Growth)
                      </h2>
                      <p className="text-xs text-on-surface-variant font-medium">
                        متبقي في فترتك التجريبية {trialDaysLeft} يوماً — ادفع الآن لتجنب انقطاع الخدمة
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPayModal(false)}
                    className="p-1.5 rounded-full hover:bg-surface-container text-on-surface-variant cursor-pointer text-sm font-bold"
                  >
                    ✕
                  </button>
                </div>

                {/* Plan Summary Card */}
                <div className="p-4 rounded-2xl border-2 border-on-surface bg-surface flex items-center justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[10px] font-extrabold uppercase border border-on-surface">
                      باقة النمو السنوية/الشهرية
                    </span>
                    <h4 className="font-display-hero font-bold text-base text-on-surface mt-1">
                      اشتراك وِصلة الكامل + الذكاء الاصطناعي
                    </h4>
                    <p className="text-xs text-on-surface-variant">مزامنة واتساب وإنستجرام + عدد غير محدود من المنتجات</p>
                  </div>
                  <div className="text-end shrink-0">
                    <div className="font-display-hero text-2xl font-black text-primary">599 ج.م</div>
                    <span className="text-[11px] font-bold text-on-surface-variant">شهرياً شامل الضريبة</span>
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-on-surface">اختر طريقة السداد المفضلة:</label>
                  <div className="grid grid-cols-1 gap-2.5">
                    <label
                      onClick={() => setSelectedMethod("fawry")}
                      className={`p-3.5 rounded-xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                        selectedMethod === "fawry"
                          ? "bg-amber-100 border-amber-600 font-bold hard-shadow-sm"
                          : "bg-surface border-on-surface/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="payment_method"
                          checked={selectedMethod === "fawry"}
                          onChange={() => setSelectedMethod("fawry")}
                          className="w-4 h-4 text-amber-600"
                        />
                        <div>
                          <div className="text-xs font-bold text-on-surface">فوري (Fawry Pay)</div>
                          <div className="text-[11px] text-on-surface-variant">إصدار كود سداد فوري من أقرب ماكينة أو محفظة</div>
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded bg-amber-400 text-amber-950 font-black text-xs">FAWRY</span>
                    </label>

                    <label
                      onClick={() => setSelectedMethod("card")}
                      className={`p-3.5 rounded-xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                        selectedMethod === "card"
                          ? "bg-blue-100 border-blue-600 font-bold hard-shadow-sm"
                          : "bg-surface border-on-surface/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="payment_method"
                          checked={selectedMethod === "card"}
                          onChange={() => setSelectedMethod("card")}
                          className="w-4 h-4 text-blue-600"
                        />
                        <div>
                          <div className="text-xs font-bold text-on-surface">البطاقات البنكية (Visa / Mastercard / ميزة)</div>
                          <div className="text-[11px] text-on-surface-variant">خصم مباشر وآمن مشفر بمعايير 3D Secure</div>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-blue-700">credit_card</span>
                    </label>

                    <label
                      onClick={() => setSelectedMethod("wallet")}
                      className={`p-3.5 rounded-xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                        selectedMethod === "wallet"
                          ? "bg-red-100 border-red-600 font-bold hard-shadow-sm"
                          : "bg-surface border-on-surface/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="payment_method"
                          checked={selectedMethod === "wallet"}
                          onChange={() => setSelectedMethod("wallet")}
                          className="w-4 h-4 text-red-600"
                        />
                        <div>
                          <div className="text-xs font-bold text-on-surface">المحافظ الإلكترونية الذكية (Smart Wallets)</div>
                          <div className="text-[11px] text-on-surface-variant">فودافون كاش، إنستاباي InstaPay، أورنج، وي باي</div>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-red-700">phone_iphone</span>
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-on-surface/10">
                  <button
                    type="button"
                    onClick={() => setShowPayModal(false)}
                    className="px-5 py-2.5 rounded-full border-2 border-on-surface bg-surface text-xs font-bold hover:bg-surface-container cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmPayment}
                    disabled={processingPayment}
                    className="btn-interactive btn-shimmer px-6 py-2.5 rounded-full bg-primary text-on-primary border-2 border-on-surface font-bold text-xs hard-shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    {processingPayment ? (
                      <>
                        <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                        <span>جاري تأكيد السداد...</span>
                      </>
                    ) : (
                      <>
                        <span>سداد 599 ج.م وتفعيل المتجر</span>
                        <span className="material-symbols-outlined text-[16px]">verified</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}