import { useEffect } from "react";

export function FaqSection() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest("[data-faq-trigger]");
      if (!btn) return;
      const content = btn.parentElement?.querySelector(".faq-content");
      const icon = btn.querySelector(".faq-icon");
      content?.classList.toggle("hidden");
      icon?.classList.toggle("rotate-180");
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <section className="w-full bg-surface-container py-space-3xl border-t-2 border-on-surface">
      <div className="max-w-3xl mx-auto px-gutter-mobile md:px-gutter-desktop">
        <div className="flex flex-col items-center text-center mb-space-2xl">
          <span className="px-space-sm py-space-2xs rounded-full bg-secondary-fixed text-on-secondary-fixed border-2 border-on-surface font-badge-sticker text-badge-sticker font-bold mb-space-xs" data-i18n-key="faq_tag">الأسئلة الشائعة</span>
          <h3 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight mb-space-xs" data-i18n-key="faq_title">إجابات واضحة لكل ما يدور في ذهنك</h3>
        </div>
        <div className="flex flex-col gap-space-sm" id="faq-accordion-group">
          <div className="bg-surface-container-lowest rounded-xl border-2 border-on-surface hard-shadow-sm overflow-hidden">
            <button data-faq-trigger className="w-full p-space-md text-start flex items-center justify-between gap-space-sm font-label-lg text-label-lg font-bold text-on-surface hover:bg-surface-container transition-colors" type="button">
              <span data-i18n-key="faq_q1" className="">هل أحتاج إلى رقم واتساب جديد أم يمكنني استخدام رقمي الحالي؟</span>
              <span className="material-symbols-outlined text-primary transform transition-transform faq-icon">expand_more</span>
            </button>
            <div className="px-space-md pb-space-md pt-0 font-body-sm text-body-sm text-on-surface-variant hidden faq-content" data-i18n-key="faq_a1">يمكنك استخدام رقمك الحالي بكل سهولة. نحن نوفر الربط عبر WhatsApp Cloud API الرسمي من Meta، مما يضمن أمان رقمك تمامًا ضد الحظر مع إمكانية فتح الحساب من أجهزة متعددة في نفس الوقت.</div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl border-2 border-on-surface hard-shadow-sm overflow-hidden">
            <button data-faq-trigger className="w-full p-space-md text-start flex items-center justify-between gap-space-sm font-label-lg text-label-lg font-bold text-on-surface hover:bg-surface-container transition-colors" type="button">
              <span data-i18n-key="faq_q2" className="">كيف يفهم الذكاء الاصطناعي اللهجة العامية المصرية؟</span>
              <span className="material-symbols-outlined text-primary transform transition-transform faq-icon">expand_more</span>
            </button>
            <div className="px-space-md pb-space-md pt-0 font-body-sm text-body-sm text-on-surface-variant hidden faq-content" data-i18n-key="faq_a2">تم تدريب نماذج الذكاء الاصطناعي في وِصلة على مئات الآلاف من المحادثات التجارية بالعامية المصرية وعربيزي ومختلف لهجات المحافظات. يفهم النظام طلبات مثل 'عايز اتنين من التيشيرت التيجر مقاس لارج شحن لفيصل' ويستخرج المنتج والكمية والعنوان بدقة تفوق 96%.</div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl border-2 border-on-surface hard-shadow-sm overflow-hidden">
            <button data-faq-trigger className="w-full p-space-md text-start flex items-center justify-between gap-space-sm font-label-lg text-label-lg font-bold text-on-surface hover:bg-surface-container transition-colors" type="button">
              <span data-i18n-key="faq_q3" className="">ما هي شركات الشحن المدعومة في مصر؟</span>
              <span className="material-symbols-outlined text-primary transform transition-transform faq-icon">expand_more</span>
            </button>
            <div className="px-space-md pb-space-md pt-0 font-body-sm text-body-sm text-on-surface-variant hidden faq-content" data-i18n-key="faq_a3">ندعم التكامل المباشر بنقرة زر مع كبرى شركات الشحن المصرية: بوسطة (Bosta)، أرامكس (Aramex)، إم تي إل (MTL)، شيب بلو (ShipBlu)، بالإضافة إلى إمكانية تصدير بوالص الشحن لسيارات ومندوبي متجرك الخاص.</div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl border-2 border-on-surface hard-shadow-sm overflow-hidden">
            <button data-faq-trigger className="w-full p-space-md text-start flex items-center justify-between gap-space-sm font-label-lg text-label-lg font-bold text-on-surface hover:bg-surface-container transition-colors" type="button">
              <span data-i18n-key="faq_q4" className="">هل يمكنني نقل بيانات منتجاتي وعملائي من إكسل إلى وِصلة؟</span>
              <span className="material-symbols-outlined text-primary transform transition-transform faq-icon">expand_more</span>
            </button>
            <div className="px-space-md pb-space-md pt-0 font-body-sm text-body-sm text-on-surface-variant hidden faq-content" data-i18n-key="faq_a4">نعم، نوفر أداة استيراد ذكية تمكنك من رفع ملف Excel أو CSV ليقوم النظام بتوزيع المنتجات والمخزون والعملاء خلال أقل من 30 ثانية دون أي تعقيد.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
