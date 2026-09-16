import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import waslaLogo from "@/assets/wasla-logo.png";

export const Route = createFileRoute("/auth/login")({
  component: Login,
});

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        throw signInError;
      }

      if (data?.session && typeof window !== "undefined") {
        // Save session locally to remember user across restarts
        localStorage.setItem("wasla_auth_user", JSON.stringify(data.session.user));
        localStorage.setItem("wasla_auth_session", "true");
        if (formData.rememberMe) {
          localStorage.setItem("wasla_remember_me", "true");
        }
      }

      // Check if this user already has an onboarded store
      const userId = data.user?.id;
      if (userId) {
        const { data: storeData } = await supabase
          .from("stores")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle();

        if (!storeData) {
          // New or unfinished merchant: guide to onboarding
          window.location.href = "/onboarding";
          return;
        }
      }

      // Existing store: go to dashboard
      window.location.href = "/dashboard";
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "حدث خطأ أثناء تسجيل الدخول. تحقق من بياناتك وأعد المحاولة.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-body-md text-on-surface antialiased flex items-center justify-center px-4 py-12" dir="rtl">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <a href="/" className="inline-flex items-center gap-3 mb-4 group transition-transform hover:scale-105">
            <img src={waslaLogo} alt="وِصلة WASLA" className="h-16 w-auto object-contain rounded-xl p-1 bg-surface-container-lowest border-2 border-on-surface hard-shadow-sm" />
          </a>
          <h1 className="font-display-hero text-3xl font-extrabold text-on-surface tracking-tight">
            تسجيل الدخول
          </h1>
          <p className="font-body-md text-sm text-on-surface-variant mt-1">
            أهلاً بعودتك إلى مساحة عمل وِصلة للتجارة الاجتماعية
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-surface-container-lowest border-2 border-on-surface rounded-2xl p-6 md:p-8 hard-shadow-sm space-y-6">
          {error && (
            <div className="bg-error-container text-on-error-container border-2 border-on-surface rounded-xl p-4 text-sm font-bold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-on-surface mb-2">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-on-surface bg-surface text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                placeholder="store@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-on-surface mb-2">
                كلمة المرور
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-on-surface bg-surface text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                  className="w-4 h-4 rounded border-2 border-on-surface text-primary focus:ring-primary cursor-pointer"
                />
                <span className="text-xs font-bold text-on-surface-variant">تذكر حسابي على هذا الجهاز</span>
              </label>
              <a href="#" className="text-xs text-on-surface-variant/80 hover:text-primary hover:underline">
                نسيت كلمة المرور؟
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-interactive btn-shimmer w-full py-3.5 rounded-full bg-primary text-on-primary border-2 border-on-surface font-bold text-base hard-shadow-sm hover:bg-primary-container cursor-pointer flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                  <span>جاري تسجيل الدخول...</span>
                </>
              ) : (
                <>
                  <span>تسجيل الدخول</span>
                  <span className="material-symbols-outlined text-[20px] rtl:rotate-180">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t-2 border-on-surface/10 flex flex-col items-center gap-2 text-sm text-on-surface-variant font-medium">
            <div>
              ليس لديك حساب؟{" "}
              <a href="/auth/signup" className="text-primary font-bold hover:underline">
                إنشاء حساب جديد مجانًا
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}