import waslaLogo from "@/assets/wasla-logo.png";

export function Footer() {
  return (
    <footer className="w-full bg-surface-container-low border-t-2 border-on-surface mt-space-4xl relative overflow-hidden">
      <div className="max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop py-space-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-space-2xl mb-space-3xl">
          <div className="lg:col-span-2 flex flex-col items-start gap-space-md">
            <div className="flex flex-col items-start gap-space-xs">
              <div className="p-2 bg-surface-container-lowest rounded-2xl border-2 border-on-surface hard-shadow-sm mb-space-xs inline-flex items-center transition-transform hover:scale-105 duration-200">
                <img
                  alt="WASLA | وِصلة"
                  className="h-16 w-auto object-contain"
                  src={waslaLogo}
                />
              </div>
              <div className="flex items-center gap-space-xs">
                <span className="font-headline-md text-headline-md font-bold text-on-surface">
                  وِصلة | WASLA
                </span>
              </div>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
              منصة واحدة لإدارة تجارتك التي تبدأ من المحادثة. المنصة الأولى لإدارة وتوسيع التجارة الاجتماعية في مصر والشرق الأوسط، أتمتة الرسائل، مزامنة المخازن، والربط اللوجستي بأعلى كفاءة وسرعة.
            </p>
            <div className="flex items-center gap-space-xs mt-space-xs">
              <span className="px-space-sm py-space-2xs rounded-full bg-secondary-fixed text-on-secondary-fixed border border-on-surface font-badge-sticker text-badge-sticker transition-transform hover:-rotate-2 duration-200 cursor-default">
                #1 Social Commerce
              </span>
              <span className="px-space-sm py-space-2xs rounded-full bg-tertiary-fixed text-on-tertiary-fixed border border-on-surface font-badge-sticker text-badge-sticker transition-transform hover:rotate-2 duration-200 cursor-default">
                صُنع في مصر <span className="material-symbols-outlined">flag</span>
              </span>
            </div>
          </div>
          <div>
            <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-space-md border-b-2 border-on-surface pb-space-2xs inline-block">
              المنتج
            </h4>
            <ul className="flex flex-col gap-space-xs font-body-sm text-body-sm text-on-surface-variant">
              <li>
                <a className="hover:text-primary hover:translate-x-1 inline-block transition-all duration-200" data-path="product" href="#">
                  صندوق الوارد الموحد
                </a>
              </li>
              <li>
                <a className="hover:text-primary hover:translate-x-1 inline-block transition-all duration-200" data-path="product" href="#">
                  مزامنة مخازن TikTok وInstagram
                </a>
              </li>
              <li>
                <a className="hover:text-primary hover:translate-x-1 inline-block transition-all duration-200" data-path="product" href="#">
                  أتمتة شات بوت WhatsApp
                </a>
              </li>
              <li>
                <a className="hover:text-primary hover:translate-x-1 inline-block transition-all duration-200" data-path="pricing" href="#">
                  بوابات الدفع والتحصيل
                </a>
              </li>
              <li>
                <a className="hover:text-primary hover:translate-x-1 inline-block transition-all duration-200" data-path="product" href="#">
                  التكامل مع شركات الشحن
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-space-md border-b-2 border-on-surface pb-space-2xs inline-block">
              الحلول
            </h4>
            <ul className="flex flex-col gap-space-xs font-body-sm text-body-sm text-on-surface-variant">
              <li>
                <a className="hover:text-primary hover:translate-x-1 inline-block transition-all duration-200" data-path="solutions" href="#">
                  لتجار الأزياء والموضة
                </a>
              </li>
              <li>
                <a className="hover:text-primary hover:translate-x-1 inline-block transition-all duration-200" data-path="solutions" href="#">
                  لمتاجر العناية والتجميل
                </a>
              </li>
              <li>
                <a className="hover:text-primary hover:translate-x-1 inline-block transition-all duration-200" data-path="solutions" href="#">
                  لصُنّاع الإلكترونيات
                </a>
              </li>
              <li>
                <a className="hover:text-primary hover:translate-x-1 inline-block transition-all duration-200" data-path="solutions" href="#">
                  للعلامات التجارية الناشئة
                </a>
              </li>
              <li>
                <a className="hover:text-primary hover:translate-x-1 inline-block transition-all duration-200" data-path="solutions" href="#">
                  الشركات متعدّدة الفروع
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-space-md border-b-2 border-on-surface pb-space-2xs inline-block">
              المصادر والشركة
            </h4>
            <ul className="flex flex-col gap-space-xs font-body-sm text-body-sm text-on-surface-variant">
              <li>
                <a className="hover:text-primary hover:translate-x-1 inline-block transition-all duration-200" data-path="resources" href="#">
                  دليل نمو التجارة الاجتماعية
                </a>
              </li>
              <li>
                <a className="hover:text-primary hover:translate-x-1 inline-block transition-all duration-200" data-path="resources" href="#">
                  مدونة وِصلة
                </a>
              </li>
              <li>
                <a className="hover:text-primary hover:translate-x-1 inline-block transition-all duration-200" data-path="resources" href="#">
                  قصص نجاح التجار
                </a>
              </li>
              <li>
                <a className="hover:text-primary hover:translate-x-1 inline-block transition-all duration-200" data-path="pricing" href="#">
                  حاسبة العائد الاستثماري
                </a>
              </li>
              <li>
                <a className="hover:text-primary hover:translate-x-1 inline-block transition-all duration-200" data-path="login" href="#">
                  بوابة المطورين و API
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-space-lg border-t-2 border-on-surface flex flex-col md:flex-row items-center justify-between gap-space-md font-body-sm text-body-sm text-on-surface-variant">
          <div className="flex flex-wrap items-center gap-space-md">
            <span>© 2025 منصة وِصلة (WASLA Tech LLC). جميع الحقوق محفوظة.</span>
            <a className="hover:underline hover:text-primary transition-colors" data-path="resources" href="#">
              سياسة الخصوصية
            </a>
            <a className="hover:underline hover:text-primary transition-colors" data-path="resources" href="#">
              شروط الخدمة
            </a>
            <a className="hover:underline hover:text-primary transition-colors" data-path="resources" href="#">
              الأمان والامتثال
            </a>
          </div>
          <div className="flex items-center gap-space-xs">
            <span className="w-3 h-3 rounded-full bg-tertiary-fixed-dim border border-on-surface hover:scale-125 transition-transform"></span>
            <span className="w-3 h-3 rounded-full bg-secondary border border-on-surface hover:scale-125 transition-transform"></span>
            <span className="w-3 h-3 rounded-full bg-primary border border-on-surface hover:scale-125 transition-transform"></span>
          </div>
        </div>
      </div>
    </footer>
  );
}
