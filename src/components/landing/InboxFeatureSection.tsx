export function InboxFeatureSection() {
  return (
    <section className="w-full bg-surface py-space-3xl border-t-2 border-on-surface">
      <div className="max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-2xl items-center">
          <div className="lg:col-span-5 flex flex-col items-start">
            <div className="px-space-xs py-space-2xs rounded-full bg-secondary-fixed text-on-secondary-fixed border-2 border-on-surface font-badge-sticker text-badge-sticker font-bold mb-space-xs">
              صندوق الوارد الموحد
            </div>
            <h3 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight mb-space-sm" data-i18n-key="inbox_feature_title">كل رسائل العملاء في شاشة واحدة. لا محادثة تُنسى بعد اليوم.</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-space-md" data-i18n-key="inbox_feature_desc">وصّل قنوات التواصل الاجتماعي بالكامل في 60 ثانية. يمكن لأكثر من 10 موظفين خدمة عملاء العمل من رقم واتساب رسمي واحد وتوزيع التذاكر بكفاءة عالية.</p>
            <div className="flex flex-col gap-space-xs w-full mb-space-lg">
              <div className="flex items-center gap-space-xs p-space-xs rounded-lg bg-surface-container border border-on-surface">
                <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-bold">✓</span>
                <span className="font-label-lg text-label-lg font-bold text-on-surface" data-i18n-key="inbox_bullet_1">رقم واتساب موحد لجميع أفراد الفريق مع صلاحيات مخصصة</span>
              </div>
              <div className="flex items-center gap-space-xs p-space-xs rounded-lg bg-surface-container border border-on-surface">
                <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-bold">✓</span>
                <span className="font-label-lg text-label-lg font-bold text-on-surface" data-i18n-key="inbox_bullet_2">عرض تاريخ المشتريات السابقة لكل عميل بمجرد فتح الشات</span>
              </div>
              <div className="flex items-center gap-space-xs p-space-xs rounded-lg bg-surface-container border border-on-surface">
                <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-bold">✓</span>
                <span className="font-label-lg text-label-lg font-bold text-on-surface" data-i18n-key="inbox_bullet_3">ردود سريعة وقوالب جاهزة لأشهر أسئلة المقاسات والأسعار</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-surface-container-lowest border-2 border-on-surface rounded-xl p-space-md hard-shadow-sm">
            <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant mb-space-sm">
              <div className="flex items-center gap-space-xs">
                <span className="font-headline-sm text-base font-bold" data-i18n-key="inbox_mock_title">صندوق الرسائل الواردة</span>
                <span className="px-space-xs py-0.5 rounded-full bg-primary text-on-primary font-badge-sticker text-xs">12 غير مقروء</span>
              </div>
              <div className="flex gap-1">
                <button className="px-2 py-1 rounded bg-primary text-on-primary text-xs font-bold" type="button">الكل</button>
                <button className="px-2 py-1 rounded bg-surface-container text-on-surface text-xs" type="button">واتساب</button>
                <button className="px-2 py-1 rounded bg-surface-container text-on-surface text-xs" type="button">إنستجرام</button>
              </div>
            </div>

            <div className="flex flex-col gap-space-xs">
              <div className="p-space-xs rounded-lg bg-primary-fixed/30 border-2 border-on-surface flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="w-3 h-3 rounded-full bg-primary"></span>
                  <div>
                    <div className="flex items-center gap-space-xs">
                      <span className="font-label-md font-bold text-on-surface">سارة محمود</span>
                      <span className="px-1.5 py-0.2 rounded bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold">WhatsApp</span>
                    </div>
                    <p className="font-body-sm text-xs text-on-surface-variant truncate max-w-xs">الفستان البيج مقاس 38 متوفر في فرع المعادي؟</p>
                  </div>
                </div>
                <span className="font-badge-sticker text-[11px] text-on-surface-variant font-bold">منذ 3 د</span>
              </div>

              <div className="p-space-xs rounded-lg bg-surface-container-lowest border border-on-surface flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="w-3 h-3 rounded-full bg-transparent"></span>
                  <div>
                    <div className="flex items-center gap-space-xs">
                      <span className="font-label-md font-bold text-on-surface">أحمد خيري</span>
                      <span className="px-1.5 py-0.2 rounded bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold">Instagram</span>
                    </div>
                    <p className="font-body-sm text-xs text-on-surface-variant truncate max-w-xs">عايز كود الخصم بتاع العرض الترويجي لو سمحت</p>
                  </div>
                </div>
                <span className="font-badge-sticker text-[11px] text-on-surface-variant font-bold">منذ 15 د</span>
              </div>

              <div className="p-space-xs rounded-lg bg-surface-container-lowest border border-on-surface flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="w-3 h-3 rounded-full bg-transparent"></span>
                  <div>
                    <div className="flex items-center gap-space-xs">
                      <span className="font-label-md font-bold text-on-surface">نور الدين</span>
                      <span className="px-1.5 py-0.2 rounded bg-surface-container-high text-on-surface text-[10px] font-bold">Facebook</span>
                    </div>
                    <p className="font-body-sm text-xs text-on-surface-variant truncate max-w-xs">تم تحويل المبلغ عن طريق فودافون كاش ومرفق الإيصال</p>
                  </div>
                </div>
                <span className="font-badge-sticker text-[11px] text-on-surface-variant font-bold">منذ 28 د</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
