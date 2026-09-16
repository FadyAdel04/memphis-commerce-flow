import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import waslaLogo from "@/assets/wasla-logo.png";

export const Route = createFileRoute("/onboarding/")({
  component: Onboarding,
});

function Onboarding() {
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    storeName: "",
    category: "",
    platforms: {
      instagram: true,
      whatsapp: true,
      facebook: false,
      website: false,
    },
    productCount: "10",
    plan: "growth", // starter | growth | pro
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user && typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }
  }, [user, authLoading]);

  const categories = [
    { value: "fashion", label: "أزياء وموضة 👗" },
    { value: "beauty", label: "عناية وتجميل 💄" },
    { value: "electronics", label: "إلكترونيات وإكسسوارات 📱" },
    { value: "food", label: "أغذية ومشروبات ☕" },
    { value: "home", label: "ديكور ومنزل 🛋️" },
    { value: "accessories", label: "ساعات ومجوهرات 💍" },
    { value: "other", label: "مجال آخر 📦" },
  ];

  const platformsList = [
    { key: "instagram" as const, label: "إنستجرام (Instagram)", icon: "photo_camera" },
    { key: "whatsapp" as const, label: "واتساب للأعمال (WhatsApp)", icon: "chat" },
    { key: "facebook" as const, label: "فيسبوك ماسنجر (Facebook)", icon: "forum" },
    { key: "website" as const, label: "موقع إلكتروني مستقل (Web)", icon: "language" },
  ];

  const pricingPlans = [
    {
      id: "starter",
      name: "البداية (Starter)",
      price: "299",
      period: "ج.م / شهر",
      badge: null,
      desc: "مثالي للمتاجر الناشئة والبدايات البسيطة",
      features: [
        "حتى 50 منتج نشط",
        "قناة تواصل واحدة (واتساب)",
        "ردود سريعة ذكية أساسية",
        "تقارير مبيعات شهرية",
      ],
    },
    {
      id: "growth",
      name: "النمو (Growth)",
      price: "599",
      period: "ج.م / شهر",
      badge: "تجربة مجانية 14 يوم 🎁",
      popular: true,
      desc: "الأكثر اختياراً لزيادة المبيعات والأتمتة الشاملة",
      features: [
        "منتجات ومخزون غير محدود",
        "واتساب + إنستجرام + فيسبوك",
        "ذكاء اصطناعي تفاعلي متقدم للتفاوض",
        "ربط فوري بشركات الشحن (بوسطة / أرامكس)",
        "تجربة كاملة مجاناً لمدة 14 يوماً بدون دفع فوري",
      ],
    },
    {
      id: "pro",
      name: "الاحترافي (Pro)",
      price: "1,199",
      period: "ج.م / شهر",
      badge: "للمتاجر الكبيرة 🚀",
      desc: "للعلامات التجارية ذات الحجم العالي والفرق المتعددة",
      features: [
        "كل مميزات باقة النمو",
        "عدد غير محدود من الموظفين والمشرفين",
        "مدير حساب ودعم فني على مدار الساعة",
        "تخصيص نماذج ذكاء اصطناعي حصرية",
        "تقارير مالية وجرد لحظية متقدمة",
      ],
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      if (step === 1) {
        if (!formData.storeName.trim()) {
          setError("يرجى كتابة اسم المتجر أو علامتك التجارية");
          return;
        }
        setStep(2);
      } else if (step === 2) {
        if (!formData.category) {
          setError("يرجى اختيار تخصص وفئة متجرك");
          return;
        }
        setStep(3);
      } else if (step === 3) {
        const hasSelectedPlatform = Object.values(formData.platforms).some(Boolean);
        if (!hasSelectedPlatform) {
          setError("يرجى اختيار منصة واحدة على الأقل تتلقى منها الطلبات");
          return;
        }
        setStep(4);
      } else if (step === 4) {
        const count = parseInt(formData.productCount, 10);
        if (isNaN(count) || count < 0) {
          setError("يرجى إدخال عدد تقريبي صحيح لمنتجاتك");
          return;
        }
        setStep(5);
      } else if (step === 5) {
        if (!user) {
          throw new Error("لم يتم العثور على جلسة المستخدم. يرجى تسجيل الدخول مجددًا.");
        }

        setLoading(true);

        const count = parseInt(formData.productCount, 10) || 10;
        const isTrialPlan = formData.plan === "growth";
        const trialEndDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

        // 1. Create or upsert store record in Supabase with plan & trial data
        const { data: storeData, error: storeError } = await supabase
          .from("stores")
          .insert({
            user_id: user.id,
            name: formData.storeName.trim(),
            category: formData.category,
            platforms: formData.platforms,
            product_count: count,
            plan: formData.plan,
            trial_ends_at: isTrialPlan ? trialEndDate : null,
            subscription_status: isTrialPlan ? "trial" : "active",
            currency: "EGP",
            timezone: "Africa/Cairo",
          })
          .select()
          .single();

        if (storeError) {
          throw storeError;
        }

        // Explicitly link user as store owner in store_members
        try {
          await supabase.from("store_members").insert({
            store_id: storeData.id,
            user_id: user.id,
            role: "owner",
          });
        } catch (smErr) {
          console.warn("store_members creation notice:", smErr);
        }

        // Cache local trial info
        if (typeof window !== "undefined") {
          localStorage.setItem("wasla_store_plan", formData.plan);
          if (isTrialPlan) {
            localStorage.setItem("wasla_trial_ends_at", trialEndDate);
          }
        }

        // 2. Initialize default relations in store_settings (shipping & AI)
        if (storeData?.id) {
          try {
            await supabase.from("store_settings").insert([
              {
                store_id: storeData.id,
                key: "shipping_config",
                value: {
                  bosta_enabled: false,
                  bosta_api_key: "",
                  aramex_enabled: false,
                  aramex_account: "",
                  default_provider: "bosta",
                },
              },
              {
                store_id: storeData.id,
                key: "ai_config",
                value: {
                  welcome_message: "أهلاً بك في متجرنا! كيف يمكننا مساعدتك اليوم؟",
                  auto_confirm_orders: true,
                  persona: "friendly",
                  max_discount: 10,
                },
              },
            ]);
          } catch (seedErr) {
            console.warn("Notice: Default store settings initialization notice:", seedErr);
          }
        }

        // 3. Success notification & navigate directly to dashboard settings
        setSuccess("🎉 تم إعداد متجرك بنجاح وتفعيل التجربة المجانية 14 يوماً! جاري نقلك للمتجر...");
        setLoading(false);

        setTimeout(() => {
          window.location.href = "/dashboard/settings?first_time=true";
        }, 1200);
      }
    } catch (err: any) {
      console.error("Onboarding error:", err);
      setError(err.message || "حدث خطأ أثناء حفظ بيانات المتجر.");
      setLoading(false);
    }
  };

  const goBack = () => {
    if (step > 1) {
      setError(null);
      setStep(step - 1);
    }
  };

  return (
    <div className="min-h-screen bg-background font-body-md text-on-surface antialiased flex items-center justify-center px-4 py-12" dir="rtl">
      <div className="w-full max-w-lg space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <a href="/" className="inline-flex items-center gap-3 mb-4 group transition-transform hover:scale-105">
            <img src={waslaLogo} alt="وِصلة WASLA" className="h-14 w-auto object-contain rounded-xl p-1 bg-surface-container-lowest border-2 border-on-surface hard-shadow-sm" />
          </a>
          <h1 className="font-display-hero text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">
            تهيئة مساحة عمل متجرك
          </h1>
          <p className="font-body-md text-sm text-on-surface-variant mt-1">
            خطوات سريعة لإطلاق روبوت البيع الذكي وتفعيل قنواتك
          </p>

          {/* Stepper Dots */}
          <div className="flex items-center gap-2 mt-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  step === i
                    ? "w-8 bg-primary"
                    : step > i
                    ? "w-4 bg-primary/50"
                    : "w-2.5 bg-surface-container-highest"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Card Form */}
        <div className="bg-surface-container-lowest border-2 border-on-surface rounded-2xl p-6 md:p-8 hard-shadow-sm space-y-6">
          {error && (
            <div className="bg-error-container text-on-error-container border-2 border-on-surface rounded-xl p-4 text-sm font-bold text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-100 text-emerald-900 border-2 border-emerald-600 rounded-xl p-4 text-sm font-bold text-center flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-emerald-700">check_circle</span>
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Store Name */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-primary text-on-primary font-bold text-sm flex items-center justify-center">1</span>
                  <label className="text-base font-bold text-on-surface">
                    ما هو اسم متجرك أو علامتك التجارية؟
                  </label>
                </div>
                <input
                  type="text"
                  value={formData.storeName}
                  onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-on-surface bg-surface text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary font-bold text-base"
                  placeholder="مثال: لافندر بوتيك، كيك هاوس، إلخ"
                  autoFocus
                  required
                />
                <p className="text-xs text-on-surface-variant font-medium">
                  سيظهر هذا الاسم لعملائك وفي بوالص الشحن ورسائل التأكيد التلقائية.
                </p>
              </div>
            )}

            {/* Step 2: Category */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-primary text-on-primary font-bold text-sm flex items-center justify-center">2</span>
                  <label className="text-base font-bold text-on-surface">
                    ما هو تصنيف المنتجات الرئيسي لمتجرك؟
                  </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {categories.map((cat) => {
                    const isSelected = formData.category === cat.value;
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, category: cat.value })}
                        className={`p-3.5 rounded-xl border-2 text-start font-bold text-sm transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "bg-primary text-on-primary border-on-surface hard-shadow-sm scale-[1.02]"
                            : "bg-surface text-on-surface border-on-surface hover:bg-surface-container"
                        }`}
                      >
                        <span>{cat.label}</span>
                        {isSelected && (
                          <span className="material-symbols-outlined text-[18px]">check</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Platforms */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-primary text-on-primary font-bold text-sm flex items-center justify-center">3</span>
                  <label className="text-base font-bold text-on-surface">
                    أين تتلقى طلبات ومحادثات عملائك حالياً؟
                  </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {platformsList.map((platform) => {
                    const isChecked = formData.platforms[platform.key];
                    return (
                      <label
                        key={platform.key}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all cursor-pointer select-none ${
                          isChecked
                            ? "border-on-surface bg-secondary-fixed text-on-secondary-fixed hard-shadow-sm"
                            : "border-on-surface/40 bg-surface text-on-surface hover:bg-surface-container"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              platforms: {
                                ...formData.platforms,
                                [platform.key]: e.target.checked,
                              },
                            })
                          }
                          className="w-5 h-5 rounded border-2 border-on-surface text-primary focus:ring-primary cursor-pointer"
                        />
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[20px]">{platform.icon}</span>
                          <span className="font-bold text-sm">{platform.label}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 4: Product Count */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-primary text-on-primary font-bold text-sm flex items-center justify-center">4</span>
                  <label className="text-base font-bold text-on-surface">
                    كم عدد المنتجات المعروضة للبيع تقريبًا؟
                  </label>
                </div>
                <input
                  type="number"
                  value={formData.productCount}
                  onChange={(e) => setFormData({ ...formData, productCount: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-on-surface bg-surface text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary font-bold text-base"
                  placeholder="مثال: 25"
                  min="1"
                  required
                />
                <div className="p-4 rounded-xl bg-surface-container border border-on-surface/20 text-xs text-on-surface-variant leading-relaxed">
                  💡 <strong>الخطوة القادمة:</strong> اختر باقة نمو متجرك مع تجربة مجانية 14 يوماً بدون أي رسوم دفع فورية.
                </div>
              </div>
            )}

            {/* Step 5: Pricing Plans */}
            {step === 5 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-primary text-on-primary font-bold text-sm flex items-center justify-center">5</span>
                  <div>
                    <label className="text-base font-bold text-on-surface block">
                      اختر باقة نمو متجرك المناسبة
                    </label>
                    <span className="text-xs text-primary font-bold">
                      باقة النمو تتضمن 14 يوماً تجربة مجانية كاملة الميزات!
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {pricingPlans.map((plan) => {
                    const isSelected = formData.plan === plan.id;
                    return (
                      <div
                        key={plan.id}
                        onClick={() => setFormData({ ...formData, plan: plan.id })}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all relative ${
                          isSelected
                            ? "border-on-surface bg-secondary-fixed/40 hard-shadow-sm ring-2 ring-primary"
                            : "border-on-surface/30 bg-surface hover:border-on-surface"
                        }`}
                      >
                        {plan.badge && (
                          <span className="absolute -top-3 start-4 px-2.5 py-0.5 rounded-full bg-primary text-on-primary border border-on-surface text-[10px] font-extrabold uppercase">
                            {plan.badge}
                          </span>
                        )}

                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="plan"
                                checked={isSelected}
                                onChange={() => setFormData({ ...formData, plan: plan.id })}
                                className="w-4 h-4 text-primary"
                              />
                              <span className="font-display-hero font-extrabold text-base text-on-surface">
                                {plan.name}
                              </span>
                            </div>
                            <p className="text-xs text-on-surface-variant mt-1">{plan.desc}</p>
                          </div>

                          <div className="text-end shrink-0">
                            <span className="font-display-hero text-xl font-extrabold text-on-surface">
                              {plan.price}
                            </span>
                            <span className="text-[11px] font-bold text-on-surface-variant block">
                              {plan.period}
                            </span>
                          </div>
                        </div>

                        {/* Feature bullets */}
                        <ul className="mt-3 pt-3 border-t border-on-surface/10 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-on-surface-variant">
                          {plan.features.map((feat, idx) => (
                            <li key={idx} className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-primary text-[15px]">check_circle</span>
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50 border-2 border-amber-400 text-amber-950 text-xs font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-700 text-lg">verified_user</span>
                  <span>
                    تجربة باقة النمو مجانية تماماً لمدة 14 يوماً — لا يلزم إدخال بطاقة ائتمان الآن، ويمكنك الدفع والترقية لاحقاً من لوحة التحكم!
                  </span>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between gap-3 pt-2">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={goBack}
                  className="px-5 py-3 rounded-full border-2 border-on-surface bg-surface text-on-surface font-bold text-sm hover:bg-surface-container hard-shadow-sm cursor-pointer"
                >
                  السابق
                </button>
              ) : <div />}

              <button
                type="submit"
                disabled={loading}
                className="btn-interactive btn-shimmer px-8 py-3.5 rounded-full bg-primary text-on-primary border-2 border-on-surface font-bold text-sm hard-shadow-sm hover:bg-primary-container cursor-pointer flex items-center justify-center gap-2 transition-all disabled:opacity-50 mr-auto"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                    <span>جاري حفظ المتجر...</span>
                  </>
                ) : step === 5 ? (
                  <>
                    <span>إتمام التهيئة وبدء التجربة 14 يوماً 🚀</span>
                    <span className="material-symbols-outlined text-[18px] rtl:rotate-180">arrow_forward</span>
                  </>
                ) : (
                  <>
                    <span>متابعة</span>
                    <span className="material-symbols-outlined text-[18px] rtl:rotate-180">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}