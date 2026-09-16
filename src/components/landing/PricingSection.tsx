export function PricingSection() {
  return (
    <section className="w-full max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop py-space-3xl" id="pricing-plans">
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-space-2xl">
        <span className="px-space-sm py-space-2xs rounded-full bg-primary-fixed text-on-primary-fixed border-2 border-on-surface font-badge-sticker text-badge-sticker font-bold mb-space-xs" data-i18n-key="pricing_tag">باقات اشتراك واضحة</span>
        <h3 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight mb-space-xs" data-i18n-key="pricing_title">استثمر في راحة بالك ونمو أرباح متجرك</h3>
        <p className="font-body-lg text-body-lg text-on-surface-variant" data-i18n-key="pricing_desc">بدون رسوم خفية أو نسب على مبيعاتك. كل باقة تمنحك قيمة حقيقية تفوق تكلفتها من أول أسبوع.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg items-stretch">
        <div className="bg-surface-container-lowest p-space-lg rounded-xl border-2 border-on-surface hard-shadow-sm flex flex-col justify-between">
          <div>
            <span className="font-badge-sticker text-badge-sticker text-on-surface-variant uppercase font-bold" data-i18n-key="tier1_badge">للبدايات الواعدة</span>
            <h4 className="font-headline-lg text-headline-lg font-bold text-on-surface mt-1 mb-2" data-i18n-key="tier1_title">البداية المجانية</h4>
            <div className="flex items-baseline gap-1 mb-space-md">
              <span className="font-display-hero text-4xl font-extrabold text-on-surface">0</span>
              <span className="font-label-md text-on-surface-variant" data-i18n-key="egp_month">ج.م / شهريًا</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md pb-space-md border-b border-outline-variant" data-i18n-key="tier1_desc">مثالية للمتاجر الناشئة التي تبدأ أولى خطواتها في التجارة الإلكترونية.</p>
            <ul className="flex flex-col gap-space-xs font-body-sm text-body-sm text-on-surface mb-space-lg">
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[18px]">check</span> حتى 50 طلب شهريًا</li>
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[18px]">check</span> ربط رقم واتساب واحد</li>
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[18px]">check</span> مستخدم واحد للوحة التحكم</li>
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[18px]">check</span> مسودات الطلبات اليدوية</li>
            </ul>
          </div>
          <a className="btn-interactive w-full py-space-xs rounded-full bg-surface-container text-on-surface border-2 border-on-surface font-label-lg font-bold text-center hover:bg-tertiary-fixed transition-all cursor-pointer" data-i18n-key="btn_tier1" href="#demo-section">ابدأ مجانًا بدون كارت</a>
        </div>

        <div className="bg-surface-container-lowest p-space-lg rounded-xl border-2 border-on-surface shadow-[6px_6px_0px_#6b38d4] hover:shadow-[8px_8px_0px_#6b38d4] hover:-translate-y-3 transition-all duration-300 flex flex-col justify-between relative -translate-y-2">
          <div className="absolute -top-3.5 start-1/2 -translate-x-1/2 px-space-sm py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed border-2 border-on-surface font-badge-sticker text-badge-sticker font-black uppercase shadow-sm animate-pulse">
            ★ الأكثر اختيارًا ونموًا ★
          </div>
          <div>
            <span className="font-badge-sticker text-badge-sticker text-primary uppercase font-bold" data-i18n-key="tier2_badge">للتجار المحترفين</span>
            <h4 className="font-headline-lg text-headline-lg font-bold text-on-surface mt-1 mb-2" data-i18n-key="tier2_title">باقة النمو (Growth)</h4>
            <div className="flex items-baseline gap-1 mb-space-md">
              <span className="font-display-hero text-4xl font-extrabold text-primary">599</span>
              <span className="font-label-md text-on-surface-variant" data-i18n-key="egp_month">ج.م / شهريًا</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md pb-space-md border-b border-outline-variant" data-i18n-key="tier2_desc">كل ما تحتاجه لإدارة حجم رسائل ضخم وتسريع وتيرة تحضير الشحنات بدون أخطاء.</p>
            <ul className="flex flex-col gap-space-xs font-body-sm text-body-sm text-on-surface mb-space-lg">
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[18px]">check_circle</span> طلبات غير محدودة</li>
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[18px]">check_circle</span> ربط واتساب وإنستجرام وفيسبوك</li>
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[18px]">check_circle</span> حتى 5 مستخدمين (وكلاء خدمة عملاء)</li>
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[18px]">check_circle</span> استخراج الطلبات الآلي بالذكاء الاصطناعي</li>
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[18px]">check_circle</span> الربط مع بوسطة، أرامكس، وشيتات الإكسل</li>
            </ul>
          </div>
          <a className="btn-interactive btn-shimmer w-full py-space-sm rounded-full bg-primary text-on-primary border-2 border-on-surface font-label-lg font-bold text-center hard-shadow-sm hover:bg-primary-container cursor-pointer transition-all" data-i18n-key="btn_tier2" href="#demo-section">ابدأ تجربة مجانية 14 يوم</a>
        </div>

        <div className="bg-surface-container-lowest p-space-lg rounded-xl border-2 border-on-surface hard-shadow-sm hover:shadow-[6px_6px_0px_#111c2d] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
          <div>
            <span className="font-badge-sticker text-badge-sticker text-on-surface-variant uppercase font-bold" data-i18n-key="tier3_badge">للبراندات والشركات الكبرى</span>
            <h4 className="font-headline-lg text-headline-lg font-bold text-on-surface mt-1 mb-2" data-i18n-key="tier3_title">باقة الاحتراف (Pro)</h4>
            <div className="flex items-baseline gap-1 mb-space-md">
              <span className="font-display-hero text-4xl font-extrabold text-on-surface">999</span>
              <span className="font-label-md text-on-surface-variant" data-i18n-key="egp_month">ج.م / شهريًا</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md pb-space-md border-b border-outline-variant" data-i18n-key="tier3_desc">للمتاجر متعددة الفروع والمستودعات مع تدفقات عمل مخصصة ودعم فني مخصص.</p>
            <ul className="flex flex-col gap-space-xs font-body-sm text-body-sm text-on-surface mb-space-lg">
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[18px]">check</span> كل مميزات باقة النمو</li>
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[18px]">check</span> مستخدمين غير محدودين</li>
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[18px]">check</span> إدارة مستودعات وفروع متعددة</li>
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[18px]">check</span> دعم WhatsApp مخصص ومدير حساب</li>
            </ul>
          </div>
          <a className="btn-interactive w-full py-space-xs rounded-full bg-surface-container text-on-surface border-2 border-on-surface font-label-lg font-bold text-center hover:bg-tertiary-fixed transition-all cursor-pointer" data-i18n-key="btn_tier3" href="#demo-section">تواصل مع فريق المبيعات</a>
        </div>
      </div>
    </section>
  );
}
