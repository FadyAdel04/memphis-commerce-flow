export function VerticalsSection() {
  return (
    <section className="w-full bg-surface-container py-space-3xl border-t-2 border-on-surface">
      <div className="max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-space-2xl">
          <span className="px-space-sm py-space-2xs rounded-full bg-secondary-fixed text-on-secondary-fixed border-2 border-on-surface font-badge-sticker text-badge-sticker font-bold mb-space-xs" data-i18n-key="verticals_tag">مصمم خصيصًا لتجارتك</span>
          <h3 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight mb-space-xs" data-i18n-key="verticals_title">مهما كان ما تبيعه.. وِصلة تضاعف سرعة مبيعاتك</h3>
          <p className="font-body-lg text-body-lg text-on-surface-variant" data-i18n-key="verticals_desc">تجار الموضة، مستحضرات التجميل، الأجهزة المنزلية والمتاجر الرقمية يعتمدون على وِصلة يوميًا.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-space-md">
          <div className="bg-surface-container-lowest p-space-md rounded-xl border-2 border-on-surface hard-shadow-sm -rotate-1 hover:rotate-0 transition-all text-center">
            <div className="text-3xl mb-space-2xs">👗</div>
            <h4 className="font-headline-sm text-base font-bold text-on-surface mb-1" data-i18n-key="vert1_title">الأزياء والموضة</h4>
            <p className="font-body-sm text-xs text-on-surface-variant" data-i18n-key="vert1_desc">إدارة المقاسات والألوان ومخزون الأقمشة بسهولة تامة.</p>
          </div>

          <div className="bg-surface-container-lowest p-space-md rounded-xl border-2 border-on-surface hard-shadow-sm rotate-1 hover:rotate-0 transition-all text-center">
            <div className="text-3xl mb-space-2xs">💄</div>
            <h4 className="font-headline-sm text-base font-bold text-on-surface mb-1" data-i18n-key="vert2_title">العناية والتجميل</h4>
            <p className="font-body-sm text-xs text-on-surface-variant" data-i18n-key="vert2_desc">حزم ترويجية (Bundles) وسرعة استجابة لاستفسارات البشرة.</p>
          </div>

          <div className="bg-surface-container-lowest p-space-md rounded-xl border-2 border-on-surface hard-shadow-sm -rotate-1 hover:rotate-0 transition-all text-center">
            <div className="text-3xl mb-space-2xs">📱</div>
            <h4 className="font-headline-sm text-base font-bold text-on-surface mb-1" data-i18n-key="vert3_title">الإلكترونيات والملحقات</h4>
            <p className="font-body-sm text-xs text-on-surface-variant" data-i18n-key="vert3_desc">تتبع الضمانات والأرقام التسلسلية وإشعارات الشحن.</p>
          </div>

          <div className="bg-surface-container-lowest p-space-md rounded-xl border-2 border-on-surface hard-shadow-sm rotate-1 hover:rotate-0 transition-all text-center">
            <div className="text-3xl mb-space-2xs">🛋️</div>
            <h4 className="font-headline-sm text-base font-bold text-on-surface mb-1" data-i18n-key="vert4_title">المنزل والديكور</h4>
            <p className="font-body-sm text-xs text-on-surface-variant" data-i18n-key="vert4_desc">مزامنة الشحنات ذات الأوزان الكبيرة ومواعيد التسليم.</p>
          </div>

          <div className="bg-surface-container-lowest p-space-md rounded-xl border-2 border-on-surface hard-shadow-sm -rotate-1 hover:rotate-0 transition-all text-center sm:col-span-2 lg:col-span-1">
            <div className="text-3xl mb-space-2xs">🛍️</div>
            <h4 className="font-headline-sm text-base font-bold text-on-surface mb-1" data-i18n-key="vert5_title">متاجر الإنستجرام</h4>
            <p className="font-body-sm text-xs text-on-surface-variant" data-i18n-key="vert5_desc">التحول من متجر شخصي هاوٍ إلى منظومة احترافية متكاملة.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
