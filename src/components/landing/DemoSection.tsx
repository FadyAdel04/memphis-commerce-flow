export function DemoSection() {
  return (
    <section className="w-full max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop py-space-3xl" id="demo-section">
      <div className="relative w-full bg-primary-fixed border-2 border-on-surface rounded-2xl p-space-xl md:p-space-3xl overflow-hidden hard-shadow-sm text-center">
        <div className="absolute -top-12 -start-12 w-36 h-36 rounded-full bg-tertiary-fixed border-2 border-on-surface opacity-60"></div>
        <div className="absolute -bottom-16 -end-16 w-48 h-48 rounded-full bg-secondary-fixed border-2 border-on-surface opacity-70"></div>
        <div className="absolute top-1/2 end-12 w-6 h-6 rotate-12 bg-surface border-2 border-on-surface hidden md:block"></div>
        
        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-space-2xs px-space-md py-space-2xs rounded-full bg-surface-container-lowest border-2 border-on-surface font-badge-sticker text-badge-sticker font-bold mb-space-md">
            <span className="material-symbols-outlined font-badge-sticker text-badge-sticker">rocket</span> انضم لأكثر من 1,400 متجر رائد
          </div>
          <h3 className="font-display-hero text-headline-xl md:text-display-hero font-extrabold text-on-primary-fixed mb-space-sm leading-tight" data-i18n-key="cta_final_title">جاهز لتحويل محادثاتك إلى ماكينة مبيعات حقيقية؟</h3>
          <p className="font-body-lg text-body-lg text-on-primary-fixed-variant mb-space-xl" data-i18n-key="cta_final_desc">ابدأ اليوم مجانًا بدون أي التزام مالي. فريقنا جاهز لمساعدتك في إعداد حسابك وربط صفحاتك في دقائق معدودة.</p>
          <div className="flex flex-col sm:flex-row items-center gap-space-md w-full max-w-md">
            <input className="w-full px-space-md py-space-md rounded-full bg-surface-container-lowest border-2 border-on-surface font-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary hard-shadow-sm text-center" data-i18n-placeholder="input_placeholder" placeholder="رقم هاتفك أو بريدك الإلكتروني" type="text" />
            <button className="btn-interactive btn-shimmer w-full sm:w-auto shrink-0 px-space-xl py-space-md rounded-full bg-primary text-on-primary border-2 border-on-surface hard-shadow-sm hover:bg-primary-container font-label-lg text-label-lg font-bold cursor-pointer transition-all" data-i18n-key="btn_free_signup" type="button">ابدأ مجانًا</button>
          </div>
          <p className="font-label-md text-xs text-on-primary-fixed-variant mt-space-sm" data-i18n-key="cta_guarantee">تجربة مجانية لمدة 14 يومًا • تفعيل فوري • دعم فني متواصل</p>
        </div>
      </div>
    </section>
  );
}
