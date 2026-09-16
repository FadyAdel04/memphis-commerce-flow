import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import waslaLogo from "@/assets/wasla-logo.png";

export const Route = createFileRoute("/auth/signup")({
  component: SignUp,
});

function SignUp() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (step === 1) {
      if (!formData.name.trim()) {
        setError("يرجى إدخال الاسم الكامل");
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!formData.email.trim() || !formData.email.includes("@")) {
        setError("يرجى إدخال بريد إلكتروني صحيح");
        return;
      }
      setStep(3);
      return;
    }

    if (step === 3) {
      if (!formData.password || formData.password.length < 6) {
        setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
        return;
      }

      setLoading(true);
      try {
        const { error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: { name: formData.name },
          },
        });

        if (signUpError) throw signUpError;

        setSuccess("تم إنشاء حسابك بنجاح! جاري تحويلك إلى إعداد المتجر...");
        setTimeout(() => {
          window.location.href = "/onboarding";
        }, 1500);
      } catch (err: any) {
        console.error("Sign up error:", err);
        setError(err.message || "حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background font-body-md text-on-surface antialiased flex items-center justify-center px-4 py-12" dir="rtl">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center">
          <a href="/" className="inline-flex items-center gap-3 mb-4 group transition-transform hover:scale-105">
            <img src={waslaLogo} alt="وِصلة WASLA" className="h-16 w-auto object-contain rounded-xl p-1 bg-surface-container-lowest border-2 border-on-surface hard-shadow-sm" />
          </a>
          <h1 className="font-display-hero text-3xl font-extrabold text-on-surface tracking-tight">
            إنشاء حساب جديد
          </h1>
          <p className="font-body-md text-sm text-on-surface-variant mt-1">
            ابدأ تجربتك المجانية لمدة 14 يومًا بدون بطاقة ائتمان
          </p>

          {/* Stepper Pill */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className={`w-8 h-2 rounded-full transition-all ${step >= 1 ? "bg-primary border border-on-surface" : "bg-surface-container"}`}></span>
            <span className={`w-8 h-2 rounded-full transition-all ${step >= 2 ? "bg-primary border border-on-surface" : "bg-surface-container"}`}></span>
            <span className={`w-8 h-2 rounded-full transition-all ${step >= 3 ? "bg-primary border border-on-surface" : "bg-surface-container"}`}></span>
          </div>
        </div>

        <div className="bg-surface-container-lowest border-2 border-on-surface rounded-2xl p-6 md:p-8 hard-shadow-sm space-y-6">
          {error && (
            <div className="bg-error-container text-on-error-container border-2 border-on-surface rounded-xl p-4 text-sm font-bold text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-100 text-emerald-900 border-2 border-on-surface rounded-xl p-4 text-sm font-bold text-center">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 && (
              <div>
                <label className="block text-sm font-bold text-on-surface mb-2">
                  ما هو اسمك أو اسم العلامة التجارية؟
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-on-surface bg-surface text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                  placeholder="مثال: أحمد للتجارة / براند نيل"
                  required
                />
              </div>
            )}

            {step === 2 && (
              <div>
                <label className="block text-sm font-bold text-on-surface mb-2">
                  البريد الإلكتروني للعمل
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
            )}

            {step === 3 && (
              <div>
                <label className="block text-sm font-bold text-on-surface mb-2">
                  اختر كلمة مرور آمنة
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-on-surface bg-surface text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                  placeholder="•••••••• (6 أحرف على الأقل)"
                  required
                  minLength={6}
                />
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-2">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-5 py-3 rounded-full border-2 border-on-surface bg-surface text-on-surface font-bold text-sm hover:bg-surface-container transition-all"
                >
                  السابق
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="btn-interactive btn-shimmer flex-1 py-3.5 rounded-full bg-primary text-on-primary border-2 border-on-surface font-bold text-base hard-shadow-sm hover:bg-primary-container cursor-pointer flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span>جاري الإنشاء...</span>
                ) : step === 3 ? (
                  <>
                    <span>إنشاء الحساب</span>
                    <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
                  </>
                ) : (
                  <>
                    <span>التالي</span>
                    <span className="material-symbols-outlined text-[20px] rtl:rotate-180">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="pt-4 border-t-2 border-on-surface/10 text-center text-sm text-on-surface-variant font-medium">
            لديك حساب بالفعل؟{" "}
            <a href="/auth/login" className="text-primary font-bold hover:underline">
              تسجيل الدخول
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}