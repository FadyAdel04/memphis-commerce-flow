export function ProblemSection() {
  return (
    <section className="w-full bg-surface-container py-space-3xl border-y-2 border-on-surface relative">
      <div className="max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-space-2xl">
          <span className="px-space-sm py-space-2xs rounded-full bg-error-container text-on-error-container border-2 border-on-surface font-badge-sticker text-badge-sticker font-bold rotate-2 mb-space-xs" data-i18n-key="problem_badge">المشكلة اليومية المؤلمة</span>
          <h2 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight mb-space-xs" data-i18n-key="problem_title">عملاؤك يراسلونك في كل مكان.. وفريقك تائه بين الشاشات!</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant" data-i18n-key="problem_desc">البيع عبر السوشيال ميديا في مصر قنبلة مبيعات، لكن إدارته يدويًا عبر 4 تطبيقات وشيتات إكسل تكلفك خسارة 30% من الطلبات كل شهر.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
          <div className="bg-surface-container-lowest p-space-md rounded-xl border-2 border-on-surface hard-shadow-sm -rotate-1 hover:rotate-0 transition-transform">
            <div className="w-12 h-12 rounded-lg bg-tertiary-fixed border-2 border-on-surface flex items-center justify-center mb-space-sm">
              <span className="material-symbols-outlined text-[26px] text-on-tertiary-fixed">chat_bubble</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-space-xs" data-i18n-key="prob1_title">واتساب غير منظم</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant" data-i18n-key="prob1_desc">رسائل مكدسة، عميل ينتظر بالساعات حتى يرد موظف المبيعات، ومحادثات تضيع بعد إغلاق التطبيق.</p>
          </div>

          <div className="bg-surface-container-lowest p-space-md rounded-xl border-2 border-on-surface hard-shadow-sm rotate-1 hover:rotate-0 transition-transform">
            <div className="w-12 h-12 rounded-lg bg-secondary-fixed border-2 border-on-surface flex items-center justify-center mb-space-sm">
              <span className="material-symbols-outlined text-[26px] text-on-secondary-fixed">photo_camera</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-space-xs" data-i18n-key="prob2_title">ردود إنستجرام المفقودة</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant" data-i18n-key="prob2_desc">ردود الستوري تتداخل مع الرسائل الخاصة، ومشتري يسأل عن السعر والمقاس قبل أن يشتري من منافسك فورًا.</p>
          </div>

          <div className="bg-surface-container-lowest p-space-md rounded-xl border-2 border-on-surface hard-shadow-sm -rotate-1 hover:rotate-0 transition-transform">
            <div className="w-12 h-12 rounded-lg bg-surface-container-high border-2 border-on-surface flex items-center justify-center mb-space-sm">
              <span className="material-symbols-outlined text-[26px] text-primary">table_chart</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-space-xs" data-i18n-key="prob3_title">جحيم ملفات الإكسل</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant" data-i18n-key="prob3_desc">نسخ ولصق الأسماء والعناوين يدويًا، أخطاء في أرقام الهواتف، وطلبات مكررة تسبب مرتجعات باهظة.</p>
          </div>

          <div className="bg-surface-container-lowest p-space-md rounded-xl border-2 border-on-surface hard-shadow-sm rotate-1 hover:rotate-0 transition-transform">
            <div className="w-12 h-12 rounded-lg bg-tertiary-fixed-dim border-2 border-on-surface flex items-center justify-center mb-space-sm">
              <span className="material-symbols-outlined text-[26px] text-on-surface">sync_problem</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-space-xs" data-i18n-key="prob4_title">بيع منتجات غير متوفرة</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant" data-i18n-key="prob4_desc">بيع نفس القطعة لعميلين مختلفين على منصتين في نفس الدقيقة لعدم وجود ربط مباشر مع المخازن.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
