export function AnalyticsSection() {
  return (
    <section className="w-full max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop py-space-3xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        <div className="lg:col-span-7 bg-surface-container-lowest border-2 border-on-surface rounded-xl p-space-lg hard-shadow-sm">
          <div className="flex items-center justify-between mb-space-md">
            <div>
              <span className="font-badge-sticker text-badge-sticker text-primary uppercase font-bold" data-i18n-key="analytics_tag">تحليلات المبيعات الحية</span>
              <h4 className="font-headline-md text-headline-md font-bold text-on-surface" data-i18n-key="analytics_title">أداء متجرك خلال الشهر الحالي</h4>
            </div>
            <span className="px-space-xs py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed border border-on-surface font-badge-sticker text-xs font-bold">
              +32.4% مقارنة بالشهر السابق
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm mb-space-lg">
            <div className="p-space-sm rounded-lg bg-surface-container border border-on-surface">
              <span className="font-body-sm text-xs text-on-surface-variant block" data-i18n-key="kpi_sales">إجمالي المبيعات</span>
              <span className="font-headline-md text-headline-md font-extrabold text-on-surface">342,850 <span className="text-sm font-normal">ج.م</span></span>
            </div>
            <div className="p-space-sm rounded-lg bg-surface-container border border-on-surface">
              <span className="font-body-sm text-xs text-on-surface-variant block" data-i18n-key="kpi_orders">عدد الطلبات المنفذة</span>
              <span className="font-headline-md text-headline-md font-extrabold text-on-surface">482 <span className="text-sm font-normal">طلب</span></span>
            </div>
            <div className="p-space-sm rounded-lg bg-surface-container border border-on-surface">
              <span className="font-body-sm text-xs text-on-surface-variant block" data-i18n-key="kpi_conv">معدل تحويل المحادثات</span>
              <span className="font-headline-md text-headline-md font-extrabold text-primary">24.6%</span>
            </div>
          </div>

          <div>
            <span className="font-label-md text-label-md font-bold text-on-surface mb-2 block" data-i18n-key="channels_breakdown">توزيع المبيعات حسب القناة:</span>
            <div className="flex flex-col gap-space-xs font-body-sm text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="">واتساب (WhatsApp Cloud)</span>
                  <span className="font-bold">62% (212,500 ج.م)</span>
                </div>
                <div className="w-full h-3 rounded-full bg-surface-container overflow-hidden border border-on-surface">
                  <div className="h-full bg-primary rounded-full" style={{"width": "62%"}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="">إنستجرام (Instagram Direct)</span>
                  <span className="font-bold">26% (89,140 ج.م)</span>
                </div>
                <div className="w-full h-3 rounded-full bg-surface-container overflow-hidden border border-on-surface">
                  <div className="h-full bg-secondary rounded-full" style={{"width": "26%"}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="">ماسنجر والموقع الإلكتروني</span>
                  <span className="font-bold">12% (41,210 ج.م)</span>
                </div>
                <div className="w-full h-3 rounded-full bg-surface-container overflow-hidden border border-on-surface">
                  <div className="h-full bg-tertiary-fixed-dim rounded-full" style={{"width": "12%"}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 bg-surface-container-low border-2 border-on-surface rounded-xl p-space-lg hard-shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-space-xs">
              <span className="font-badge-sticker text-badge-sticker text-secondary uppercase font-bold" data-i18n-key="inv_tag">المزامنة الحية للمخازن</span>
              <span className="w-3 h-3 rounded-full bg-primary animate-ping"></span>
            </div>
            <h4 className="font-headline-md text-headline-md font-bold text-on-surface mb-space-xs" data-i18n-key="inv_title">انعدام المرتجعات بسبب نفاد الكميات</h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md" data-i18n-key="inv_desc">بمجرد أن يُنشئ البوت أو الموظف مسودة طلب، يتم حجز القطعة فورًا ومنع بيعها على القنوات الأخرى.</p>

            <div className="flex flex-col gap-space-xs">
              <div className="flex items-center justify-between p-space-xs rounded bg-surface-container-lowest border border-on-surface">
                <div>
                  <span className="font-label-md font-bold text-on-surface block">تيشيرت بيسك أبيض (M)</span>
                  <span className="text-[11px] text-on-surface-variant">SKU: WSK-001-WHT-M</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-bold">24 متبقي</span>
              </div>
              <div className="flex items-center justify-between p-space-xs rounded bg-surface-container-lowest border border-on-surface">
                <div>
                  <span className="font-label-md font-bold text-on-surface block">حقيبة يد جلد طبيعي (أسود)</span>
                  <span className="text-[11px] text-on-surface-variant">SKU: BAG-LEA-09</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-bold">3 متبقي (تنبيه)</span>
              </div>
            </div>
          </div>
          <div className="mt-space-md p-space-xs rounded-lg bg-tertiary-fixed text-on-tertiary-fixed border border-on-surface flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-[20px]">notifications_active</span>
            <span className="font-label-md text-label-md font-bold" data-i18n-key="inv_alert">تنبيهات تلقائية في تليجرام أو واتساب عند اقتراب نفاد صنف!</span>
          </div>
        </div>
      </div>
    </section>
  );
}
