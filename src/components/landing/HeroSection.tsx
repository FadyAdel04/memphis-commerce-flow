export function HeroSection() {
  return (
    <section className="relative w-full max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop pt-8 md:pt-14 pb-8 md:pb-12">
      <div className="absolute -top-6 start-4 w-16 h-16 rounded-full bg-tertiary-fixed border-2 border-on-surface -z-10 opacity-70 hidden sm:block animate-pulse"></div>
      <div className="absolute top-20 end-8 w-24 h-24 rounded-full bg-secondary-fixed border-2 border-on-surface -z-10 opacity-60"></div>
      <div className="absolute top-48 start-1/4 w-8 h-8 rotate-45 bg-primary-fixed border-2 border-on-surface -z-10"></div>
      <div className="absolute -bottom-10 end-1/3 w-32 h-10 rounded-full bg-surface-variant border-2 border-on-surface -z-10 rotate-12 hidden md:block"></div>

      <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-space-2xs px-space-md py-space-2xs rounded-full bg-tertiary-fixed text-on-tertiary-fixed border-2 border-on-surface hard-shadow-sm -rotate-1 mb-space-md hover:rotate-1 hover:scale-105 transition-all duration-200 cursor-default select-none">
          <span className="material-symbols-outlined text-[18px] text-amber-700 animate-bounce">bolt</span>
          <span className="font-badge-sticker text-badge-sticker font-extrabold uppercase" data-i18n-key="hero_pill">
            مساحة عمل التجارة الاجتماعية الذكية #1 في مصر
          </span>
        </div>

        <h1 className="font-display-hero text-3xl sm:text-4xl md:text-display-hero text-on-surface font-extrabold tracking-tight mb-space-md leading-[1.2] md:leading-[1.15]">
          <span data-i18n-key="hero_h1_part1">حوّل محادثات العملاء إلى</span>
          <span className="relative inline-block text-primary mx-2">
            <span data-i18n-key="hero_h1_part2">طلبات فعلية</span>
          </span>
          <span data-i18n-key="hero_h1_part3">بدون مجهود.</span>
        </h1>

        <p
          className="font-body-lg text-body-md md:text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-space-xl leading-relaxed"
          data-i18n-key="hero_subhead"
        >
          اجمع WhatsApp وInstagram وFacebook ومبيعات موقعك في لوحة تحكم واحدة فائقة السرعة. حلّل الرسائل، وأدر الطلبات والمخازن، واطبع بوالص الشحن بنقرة زر.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-space-md w-full max-w-md">
          <a
            className="btn-shimmer btn-interactive w-full sm:w-auto inline-flex items-center justify-center gap-space-xs px-space-xl py-space-md rounded-full bg-primary text-on-primary border-2 border-on-surface hard-shadow-sm font-label-lg text-label-lg font-bold group cursor-pointer"
            href="#demo-section"
          >
            <span data-i18n-key="hero_cta_primary">ابدأ تجربتك المجانية</span>
            <span className="w-7 h-7 rounded-full bg-surface-container-lowest text-on-surface flex items-center justify-center border border-on-surface transition-transform duration-200 group-hover:-translate-x-1 rtl:group-hover:-translate-x-1">
              <span className="material-symbols-outlined text-[16px] rtl:rotate-180">arrow_forward</span>
            </span>
          </a>
          <button
            className="btn-interactive w-full sm:w-auto inline-flex items-center justify-center gap-space-xs px-space-lg py-space-md rounded-full bg-surface-container-lowest text-on-surface border-2 border-on-surface hard-shadow-sm hover:bg-tertiary-fixed font-label-lg text-label-lg font-bold group cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-primary text-[20px] transition-transform duration-200 group-hover:scale-125">play_circle</span>
            <span data-i18n-key="hero_cta_secondary">شاهد كيف تعمل</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-space-md gap-y-space-xs mt-space-lg text-on-surface-variant font-label-md text-label-md">
          <div className="flex items-center gap-space-2xs">
            <span className="material-symbols-outlined text-tertiary text-[18px]">verified</span>
            <span data-i18n-key="hero_trust_1">لا تحتاج لبطاقة ائتمانية</span>
          </div>
          <span className="hidden sm:inline opacity-50">•</span>
          <div className="flex items-center gap-space-2xs">
            <span className="material-symbols-outlined text-primary text-[18px]">lock_reset</span>
            <span data-i18n-key="hero_trust_2">جاهز في 3 دقائق</span>
          </div>
          <span className="hidden sm:inline opacity-50">•</span>
          <div className="flex items-center gap-space-2xs">
            <span className="material-symbols-outlined text-secondary text-[18px]">sentiment_very_satisfied</span>
            <span data-i18n-key="hero_trust_3">+1,400 متجر مصري يعتمد علينا</span>
          </div>
        </div>
      </div>
    </section>
  );
}