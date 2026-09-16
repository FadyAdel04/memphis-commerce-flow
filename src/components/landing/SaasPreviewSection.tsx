export function SaasPreviewSection() {
  return (
    <section className="w-full max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop pb-space-3xl">
      <div className="w-full max-w-5xl mx-auto bg-surface-container-lowest border-2 border-on-surface rounded-xl hard-shadow-sm overflow-hidden relative transition-all duration-300 hover:shadow-[6px_6px_0px_#111c2d]" id="interactive-saas-preview">
      <div className="bg-surface-container px-space-md py-space-xs border-b-2 border-on-surface flex items-center justify-between">
        <div className="flex items-center gap-space-xs">
          <span className="w-3.5 h-3.5 rounded-full bg-error border border-on-surface"></span>
          <span className="w-3.5 h-3.5 rounded-full bg-tertiary-fixed-dim border border-on-surface"></span>
          <span className="w-3.5 h-3.5 rounded-full bg-secondary-fixed border border-on-surface"></span>
          <span className="ms-space-sm font-label-md text-label-md text-on-surface-variant font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">domain_verification</span>
            app.wasla.tech / workspace-live
          </span>
        </div>
        <div className="flex items-center gap-space-xs">
          <span className="px-space-xs py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed border border-on-surface font-badge-sticker text-[11px] font-bold">
            <span className="inline-block w-2 h-2 rounded-full bg-secondary animate-pulse me-1"></span>LIVE SYNC
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
        <aside className="hidden lg:flex lg:col-span-2 bg-surface-container-low border-e-2 border-on-surface flex-col justify-between p-space-sm">
          <div className="flex flex-col gap-space-xs">
            <div className="flex items-center gap-space-xs px-space-xs py-space-2xs font-badge-sticker text-badge-sticker text-on-surface-variant uppercase font-bold" data-i18n-key="app_menu">القائمة</div>
            <a className="flex items-center gap-space-xs px-space-xs py-space-2xs rounded-lg text-on-surface-variant hover:bg-surface-container font-label-md text-label-md" href="#">
              <span className="material-symbols-outlined text-[18px]">space_dashboard</span>
              <span data-i18n-key="app_nav_home" className="">الرئيسية</span>
            </a>
            <a className="flex items-center justify-between px-space-xs py-space-2xs rounded-lg bg-primary text-on-primary font-label-md text-label-md font-bold" href="#">
              <span className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[18px]">chat</span>
                <span data-i18n-key="app_nav_conversations" className="">المحادثات</span>
              </span>
              <span className="px-1.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-extrabold border border-on-surface">4</span>
            </a>
            <a className="flex items-center gap-space-xs px-space-xs py-space-2xs rounded-lg text-on-surface-variant hover:bg-surface-container font-label-md text-label-md" href="#">
              <span className="material-symbols-outlined text-[18px]">inventory_2</span>
              <span data-i18n-key="app_nav_orders" className="">الطلبات</span>
            </a>
            <a className="flex items-center gap-space-xs px-space-xs py-space-2xs rounded-lg text-on-surface-variant hover:bg-surface-container font-label-md text-label-md" href="#">
              <span className="material-symbols-outlined text-[18px]">category</span>
              <span data-i18n-key="app_nav_inventory" className="">المخازن</span>
            </a>
            <a className="flex items-center gap-space-xs px-space-xs py-space-2xs rounded-lg text-on-surface-variant hover:bg-surface-container font-label-md text-label-md" href="#">
              <span className="material-symbols-outlined text-[18px]">local_shipping</span>
              <span data-i18n-key="app_nav_shipping" className="">الشحن</span>
            </a>
            <a className="flex items-center gap-space-xs px-space-xs py-space-2xs rounded-lg text-on-surface-variant hover:bg-surface-container font-label-md text-label-md" href="#">
              <span className="material-symbols-outlined text-[18px]">analytics</span>
              <span data-i18n-key="app_nav_analytics" className="">التقارير</span>
            </a>
          </div>
          <div className="p-space-xs rounded-lg bg-surface-container border border-on-surface text-center">
            <span className="font-badge-sticker text-[11px] text-tertiary font-bold block" data-i18n-key="app_plan_tag">خطة النمو</span>
            <span className="font-label-md text-label-md font-bold text-on-surface block" data-i18n-key="app_plan_limits">940 / 1000 طلب</span>
          </div>
        </aside>

        <div className="lg:col-span-5 bg-surface-container-lowest p-space-md border-b-2 lg:border-b-0 lg:border-e-2 border-on-surface flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant mb-space-sm">
              <div className="flex items-center gap-space-xs">
                <div className="w-9 h-9 rounded-full bg-primary-fixed border border-on-surface flex items-center justify-center font-bold text-on-primary-fixed text-sm">
                  MA
                </div>
                <div>
                  <h4 className="font-label-lg text-label-lg font-bold text-on-surface leading-none">محمد أحمد</h4>
                  <span className="font-body-sm text-[12px] text-on-surface-variant flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-tertiary-fixed-dim"></span> WhatsApp • +20 102 345 6789
                  </span>
                </div>
              </div>
              <span className="px-space-xs py-0.5 rounded-full bg-surface-container text-on-surface-variant font-badge-sticker text-[11px] border border-on-surface" data-i18n-key="chat_status_open">نشط الآن</span>
            </div>

            <div className="flex flex-col gap-space-sm text-sm">
              <div className="self-start max-w-[85%] bg-surface-container p-space-sm rounded-xl rounded-ts-none border border-on-surface">
                <p className="font-body-sm text-body-sm text-on-surface" data-i18n-key="mock_msg_1">مساء الخير، لو سمحت التيشيرت الأوفرسايز الأسود مقاس L متاح؟ وعايز منه ٢ تيشيرت للشحن في مدينة نصر.</p>
                <span className="block text-end font-label-md text-[10px] text-on-surface-variant mt-1">11:42 AM</span>
              </div>
              <div className="self-end max-w-[85%] bg-primary-fixed text-on-primary-fixed p-space-sm rounded-xl rounded-te-none border border-on-surface">
                <p className="font-body-sm text-body-sm" data-i18n-key="mock_msg_2">أهلاً بحضرتك يا فندم! نعم متوفر في المخزن وجاهز للشحن الفوري. تكلفة القطعتين 1,198 ج.م والشحن 45 ج.م.</p>
                <span className="block text-end font-label-md text-[10px] text-on-primary-fixed-variant mt-1">11:43 AM • تلقائي عبر وِصلة</span>
              </div>
              <div className="self-start max-w-[85%] bg-surface-container p-space-sm rounded-xl rounded-ts-none border border-on-surface">
                <p className="font-body-sm text-body-sm text-on-surface" data-i18n-key="mock_msg_3">تمام اعتمدلي الطلب بالدفع عند الاستلام. العنوان: عمارة ٢٤ شارع عباس العقاد، شقة ٦.</p>
                <span className="block text-end font-label-md text-[10px] text-on-surface-variant mt-1">11:44 AM</span>
              </div>
            </div>
          </div>

          <div className="mt-space-md pt-space-xs border-t border-outline-variant flex items-center justify-between text-on-surface-variant text-xs">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-primary">auto_fix_high</span>
              <span data-i18n-key="mock_ai_indicator" className="">محرك وِصلة قرأ البيانات تلقائيًا</span>
            </span>
            <span className="font-label-md text-label-md font-bold text-primary">دقة 98%</span>
          </div>
        </div>

        <div className="lg:col-span-5 bg-surface-container-low p-space-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-space-sm bg-tertiary-fixed text-on-tertiary-fixed px-space-sm py-space-xs rounded-lg border-2 border-on-surface hard-shadow-sm">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[20px]">smart_toy</span>
                <span className="font-label-lg text-label-lg font-bold" data-i18n-key="ai_order_title">اكتشفنا مسودة طلب مؤكدة!</span>
              </div>
              <span className="px-space-xs py-0.5 rounded-full bg-surface-container-lowest text-on-surface font-badge-sticker text-[11px] font-black border border-on-surface">AI READY</span>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-space-sm border-2 border-on-surface mb-space-sm">
              <div className="flex justify-between items-start mb-space-xs pb-space-xs border-b border-outline-variant">
                <div>
                  <span className="font-badge-sticker text-[11px] text-on-surface-variant uppercase font-bold" data-i18n-key="card_client">العميل</span>
                  <h5 className="font-label-lg text-label-lg font-bold text-on-surface">محمد أحمد</h5>
                  <p className="font-body-sm text-[12px] text-on-surface-variant">مدينة نصر، القاهرة</p>
                </div>
                <span className="px-space-xs py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-badge-sticker text-[11px] border border-on-surface" data-i18n-key="badge_cod">دفع عند الاستلام</span>
              </div>

              <div className="flex items-center justify-between py-space-2xs">
                <div className="flex items-center gap-space-xs">
                  <div className="w-9 h-9 rounded-lg bg-surface-container border border-on-surface flex items-center justify-center font-bold text-xs">
                    👕
                  </div>
                  <div>
                    <h6 className="font-label-md text-label-md font-bold text-on-surface" data-i18n-key="mock_prod_name">تيشيرت أوفرسايز (أسود)</h6>
                    <div className="flex gap-1 text-[11px] text-on-surface-variant">
                      <span className="bg-surface-container-high px-1 rounded border border-outline">L</span>
                      <span className="">× 2</span>
                    </div>
                  </div>
                </div>
                <span className="font-label-lg text-label-lg font-bold text-on-surface">1,198 ج.م</span>
              </div>

              <div className="mt-space-xs p-space-2xs rounded bg-surface-container text-[12px] flex items-center justify-between border border-outline-variant">
                <span className="flex items-center gap-1 text-on-surface font-medium">
                  <span className="material-symbols-outlined text-[16px] text-tertiary">inventory</span>
                  <span data-i18n-key="stock_left" className="">المخزن: متبقي 14 قطعة</span>
                </span>
                <span className="font-bold text-primary font-badge-sticker text-[11px]" data-i18n-key="auto_sync">حجز فوري تلقائي</span>
              </div>

              <div className="mt-space-sm pt-space-xs border-t border-outline-variant flex flex-col gap-1 text-xs">
                <div className="flex justify-between text-on-surface-variant">
                  <span data-i18n-key="subtotal" className="">المجموع الفرعي:</span>
                  <span className="">1,198 ج.م</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span data-i18n-key="shipping_fee" className="">الشحن (القاهرة):</span>
                  <span className="">45 ج.م</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-on-surface pt-1 border-t border-outline-variant">
                  <span data-i18n-key="total_amount" className="">الإجمالي المطلوب:</span>
                  <span className="text-primary font-extrabold text-base">1,243 ج.م</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-space-2xs">
            <button className="btn-interactive btn-shimmer w-full py-space-xs rounded-full bg-primary text-on-primary border-2 border-on-surface hard-shadow-sm hover:bg-primary-container font-label-lg text-label-lg font-bold flex items-center justify-center gap-space-xs cursor-pointer group" id="create-order-btn" type="button">
              <span className="material-symbols-outlined text-[18px] transition-transform duration-200 group-hover:scale-110">receipt_long</span>
              <span data-i18n-key="btn_approve_order" id="create-order-text" className="">إنشاء الطلب وإرسال البوليصة (نقرة واحدة)</span>
            </button>
            <p className="text-center font-label-md text-[11px] text-on-surface-variant" data-i18n-key="note_sync">يتم إرسال رسالة واتساب للعميل ببيانات التتبع ومزامنة المخزون تلقائيًا.</p>
          </div>
        </div>
      </div>
    </div>
    </section>
  );
}
