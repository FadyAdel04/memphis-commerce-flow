export function PipelineSection() {
  return (
    <section className="w-full max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop py-space-3xl">
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-space-2xl">
        <span className="px-space-sm py-space-2xs rounded-full bg-primary-fixed text-on-primary-fixed border-2 border-on-surface font-badge-sticker text-badge-sticker font-bold mb-space-xs" data-i18n-key="pipeline_tag">التدفق المتكامل السلس</span>
        <h2 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight mb-space-xs" data-i18n-key="pipeline_title">من أول استفسار إلى تحصيل قيمة الطلب بنقرات سريعة</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant" data-i18n-key="pipeline_desc">صممنا وِصلة لتعمل في الخلفية كمحرك فوري يختصر 80% من الخطوات اليدوية لفريق المبيعات والتشغيل.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-space-sm relative">
        <div className="bg-surface-container-lowest p-space-sm rounded-xl border-2 border-on-surface hard-shadow-sm flex flex-col items-center text-center">
          <span className="w-8 h-8 rounded-full bg-primary text-on-primary font-black flex items-center justify-center border border-on-surface mb-space-2xs">1</span>
          <span className="font-headline-sm text-base font-bold text-on-surface mb-1" data-i18n-key="pipe1_title">رسالة العميل</span>
          <p className="font-body-sm text-xs text-on-surface-variant" data-i18n-key="pipe1_desc">وصول استفسار أو طلب عبر WhatsApp أو Instagram</p>
        </div>

        <div className="bg-surface-container-lowest p-space-sm rounded-xl border-2 border-on-surface hard-shadow-sm flex flex-col items-center text-center">
          <span className="w-8 h-8 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-black flex items-center justify-center border border-on-surface mb-space-2xs">2</span>
          <span className="font-headline-sm text-base font-bold text-on-surface mb-1" data-i18n-key="pipe2_title">الاستخراج بالذكاء</span>
          <p className="font-body-sm text-xs text-on-surface-variant" data-i18n-key="pipe2_desc">فهم المقاس، اللون، والعنوان تلقائيًا وتحويلها لمسودة</p>
        </div>

        <div className="bg-surface-container-lowest p-space-sm rounded-xl border-2 border-on-surface hard-shadow-sm flex flex-col items-center text-center">
          <span className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container font-black flex items-center justify-center border border-on-surface mb-space-2xs">3</span>
          <span className="font-headline-sm text-base font-bold text-on-surface mb-1" data-i18n-key="pipe3_title">تأكيد الطلب</span>
          <p className="font-body-sm text-xs text-on-surface-variant" data-i18n-key="pipe3_desc">نقرة واحدة من موظف الدعم أو رد آلي معتمد</p>
        </div>

        <div className="bg-surface-container-lowest p-space-sm rounded-xl border-2 border-on-surface hard-shadow-sm flex flex-col items-center text-center">
          <span className="w-8 h-8 rounded-full bg-surface-variant text-on-surface font-black flex items-center justify-center border border-on-surface mb-space-2xs">4</span>
          <span className="font-headline-sm text-base font-bold text-on-surface mb-1" data-i18n-key="pipe4_title">خصم المخزون</span>
          <p className="font-body-sm text-xs text-on-surface-variant" data-i18n-key="pipe4_desc">تحديث فوري للأرصدة عبر جميع القنوات لمنع التضارب</p>
        </div>

        <div className="bg-surface-container-lowest p-space-sm rounded-xl border-2 border-on-surface hard-shadow-sm flex flex-col items-center text-center">
          <span className="w-8 h-8 rounded-full bg-primary-fixed text-on-primary-fixed font-black flex items-center justify-center border border-on-surface mb-space-2xs">5</span>
          <span className="font-headline-sm text-base font-bold text-on-surface mb-1" data-i18n-key="pipe5_title">بوليصة الشحن</span>
          <p className="font-body-sm text-xs text-on-surface-variant" data-i18n-key="pipe5_desc">إرسال تفاصيل الشحنة لأرامكس، بوسطة، أو مندوبك الخاص</p>
        </div>

        <div className="bg-surface-container-lowest p-space-sm rounded-xl border-2 border-on-surface hard-shadow-sm flex flex-col items-center text-center">
          <span className="w-8 h-8 rounded-full bg-tertiary text-on-tertiary font-black flex items-center justify-center border border-on-surface mb-space-2xs">6</span>
          <span className="font-headline-sm text-base font-bold text-on-surface mb-1" data-i18n-key="pipe6_title">التحصيل والتقارير</span>
          <p className="font-body-sm text-xs text-on-surface-variant" data-i18n-key="pipe6_desc">متابعة الأرباح والعملاء الأكثر ولاءً بدقة لحظية</p>
        </div>
      </div>
    </section>
  );
}
