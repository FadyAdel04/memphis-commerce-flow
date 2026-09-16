export function OrdersKanbanSection() {
  return (
    <section className="w-full bg-surface-container-low py-space-3xl border-t-2 border-on-surface">
      <div className="max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-space-2xl">
          <span className="px-space-sm py-space-2xs rounded-full bg-tertiary-fixed text-on-tertiary-fixed border-2 border-on-surface font-badge-sticker text-badge-sticker font-bold mb-space-xs" data-i18n-key="orders_tag">إدارة تدفق الطلبات (Kanban)</span>
          <h3 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight mb-space-xs" data-i18n-key="orders_title">تتبّع كل طلب من المسودة إلى التسليم واستلام الكاش</h3>
          <p className="font-body-lg text-body-lg text-on-surface-variant" data-i18n-key="orders_desc">لوحة بصرية مصممة خصيصًا لطبيعة التجارة الاجتماعية والدفع عند الاستلام في مصر، مع تحديث الحالات تلقائيًا عبر شركات الشحن.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
          <div className="bg-surface-container-lowest p-space-sm rounded-xl border-2 border-on-surface hard-shadow-sm flex flex-col gap-space-sm">
            <div className="flex items-center justify-between pb-space-2xs border-b border-outline-variant">
              <span className="font-label-lg text-label-lg font-bold flex items-center gap-1 text-on-surface">
                <span className="w-2.5 h-2.5 rounded-full bg-tertiary-fixed-dim"></span>
                <span data-i18n-key="kanban_draft" className="">مسودة جديدة</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-surface-container font-badge-sticker text-xs font-bold">3</span>
            </div>

            <div className="p-space-xs rounded-lg bg-surface-container border border-on-surface">
              <div className="flex justify-between items-center mb-1">
                <span className="font-badge-sticker text-xs font-bold text-primary">#ORD-9842</span>
                <span className="font-badge-sticker text-[11px] text-on-surface-variant">WhatsApp</span>
              </div>
              <p className="font-label-md font-bold text-on-surface">كريم يوسف (الإسكندرية)</p>
              <p className="font-body-sm text-xs text-on-surface-variant">سماعة بلوتوث Pro • 1 قطار</p>
              <div className="flex justify-between items-center mt-2 pt-1 border-t border-outline-variant">
                <span className="font-label-md font-bold text-on-surface">750 ج.م</span>
                <span className="px-1.5 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold">بانتظار التأكيد</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-space-sm rounded-xl border-2 border-on-surface hard-shadow-sm flex flex-col gap-space-sm">
            <div className="flex items-center justify-between pb-space-2xs border-b border-outline-variant">
              <span className="font-label-lg text-label-lg font-bold flex items-center gap-1 text-on-surface">
                <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                <span data-i18n-key="kanban_confirmed" className="">مؤكد ومجهز</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-surface-container font-badge-sticker text-xs font-bold">6</span>
            </div>
            <div className="p-space-xs rounded-lg bg-primary-fixed/20 border border-on-surface">
              <div className="flex justify-between items-center mb-1">
                <span className="font-badge-sticker text-xs font-bold text-primary">#ORD-9840</span>
                <span className="font-badge-sticker text-[11px] text-on-surface-variant">Instagram</span>
              </div>
              <p className="font-label-md font-bold text-on-surface">رانيا عادل (التجمع الخامس)</p>
              <p className="font-body-sm text-xs text-on-surface-variant">فستان حرير بيج • مقاس M</p>
              <div className="flex justify-between items-center mt-2 pt-1 border-t border-outline-variant">
                <span className="font-label-md font-bold text-on-surface">1,450 ج.م</span>
                <span className="px-1.5 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold">جاهز للشحن</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-space-sm rounded-xl border-2 border-on-surface hard-shadow-sm flex flex-col gap-space-sm">
            <div className="flex items-center justify-between pb-space-2xs border-b border-outline-variant">
              <span className="font-label-lg text-label-lg font-bold flex items-center gap-1 text-on-surface">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                <span data-i18n-key="kanban_shipped" className="">مع شركة الشحن</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-surface-container font-badge-sticker text-xs font-bold">14</span>
            </div>
            <div className="p-space-xs rounded-lg bg-surface-container border border-on-surface">
              <div className="flex justify-between items-center mb-1">
                <span className="font-badge-sticker text-xs font-bold text-primary">#ORD-9831</span>
                <span className="font-badge-sticker text-[11px] text-on-surface-variant">بوسطة (Bosta)</span>
              </div>
              <p className="font-label-md font-bold text-on-surface">مروان شكري (الجيزة)</p>
              <p className="font-body-sm text-xs text-on-surface-variant">حذاء رياضي جلد • 43</p>
              <div className="flex justify-between items-center mt-2 pt-1 border-t border-outline-variant">
                <span className="font-label-md font-bold text-on-surface">890 ج.م</span>
                <span className="px-1.5 py-0.5 rounded bg-surface-variant text-on-surface text-[10px] font-bold">خارج للتوصيل</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-space-sm rounded-xl border-2 border-on-surface hard-shadow-sm flex flex-col gap-space-sm">
            <div className="flex items-center justify-between pb-space-2xs border-b border-outline-variant">
              <span className="font-label-lg text-label-lg font-bold flex items-center gap-1 text-on-surface">
                <span className="w-2.5 h-2.5 rounded-full bg-tertiary"></span>
                <span data-i18n-key="kanban_delivered" className="">تم التسليم والتحصيل</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-surface-container font-badge-sticker text-xs font-bold">29</span>
            </div>
            <div className="p-space-xs rounded-lg bg-tertiary-fixed/30 border border-on-surface">
              <div className="flex justify-between items-center mb-1">
                <span className="font-badge-sticker text-xs font-bold text-primary">#ORD-9820</span>
                <span className="font-badge-sticker text-[11px] text-tertiary font-bold">COD محصّل</span>
              </div>
              <p className="font-label-md font-bold text-on-surface">سلمى حسام (المعادي)</p>
              <p className="font-body-sm text-xs text-on-surface-variant">مجموعة سيروم العناية الكاملة</p>
              <div className="flex justify-between items-center mt-2 pt-1 border-t border-outline-variant">
                <span className="font-label-md font-bold text-on-surface">1,820 ج.م</span>
                <span className="material-symbols-outlined text-tertiary text-[18px]">check_circle</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
