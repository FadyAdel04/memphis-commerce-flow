import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import logoAsset from "@/assets/wasla-logo.png.asset.json";

const logo = logoAsset.url;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "وِصلة WASLA | مساحة عمل التجارة الاجتماعية في مصر" },
      {
        name: "description",
        content:
          "وِصلة تجمع واتساب وإنستجرام وفيسبوك ومبيعات متجرك في لوحة واحدة: محادثات، طلبات، مخازن، وبوالص شحن بنقرة زر.",
      },
      { property: "og:title", content: "وِصلة WASLA | حوّل محادثات العملاء إلى طلبات" },
      {
        property: "og:description",
        content:
          "لوحة تحكم واحدة لإدارة محادثات ومبيعات متجرك الاجتماعي في مصر: طلبات، مخزون، وشحن.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  useEffect(() => {
    document.documentElement.dir = "rtl";
    document.documentElement.lang = "ar";
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
    <div className="bg-background font-body-md text-body-md text-on-background antialiased overflow-x-hidden">
<header className="fixed top-0 inset-x-0 z-50 transition-all duration-300 px-gutter-mobile md:px-gutter-desktop py-space-xs"><div className="max-w-container-max mx-auto"><div className="h-20 bg-surface-container-lowest border-2 border-on-surface rounded-full px-space-md md:px-space-lg hard-shadow-sm flex items-center justify-between gap-space-sm"><div className="flex items-center gap-space-md"><a className="flex items-center gap-space-xs group" data-path="home" href="#"><img alt="WASLA Logo" className="h-10 w-auto object-contain rounded" src={logo} /><div className="flex flex-col"><span className="font-headline-sm text-headline-sm tracking-tight text-on-surface font-bold leading-none">وِصلة</span><span className="font-badge-sticker text-badge-sticker text-primary leading-none uppercase">WASLA</span></div></a><div className="hidden xl:inline-flex items-center px-space-xs py-space-2xs bg-tertiary-fixed text-on-tertiary-fixed border border-on-surface rounded-full font-badge-sticker text-badge-sticker rotate-2">تجارة اجتماعية ذكية</div></div><nav className="hidden lg:flex items-center gap-space-xs bg-surface-container-low p-space-2xs rounded-full border border-on-surface" data-active-classes="bg-primary text-on-primary font-bold shadow-[2px_2px_0px_#111c2d]"><a className="px-space-md py-space-xs rounded-full font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all" data-path="product" href="#">المنتج</a><a className="px-space-md py-space-xs rounded-full font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all" data-path="solutions" href="#">الحلول</a><a className="px-space-md py-space-xs rounded-full font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all" data-path="pricing" href="#">الأسعار</a><a className="px-space-md py-space-xs rounded-full font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all" data-path="resources" href="#">المصادر</a></nav><div className="flex items-center gap-space-xs md:gap-space-sm"><button className="flex items-center gap-space-2xs px-space-sm py-space-xs rounded-full bg-surface border-2 border-on-surface font-label-md text-label-md text-on-surface hover:bg-surface-container hard-shadow-active transition-all" id="langToggle" type="button"><span className="material-symbols-outlined text-[16px]">translate</span><span className="font-bold">العربية | EN</span></button><a className="hidden sm:inline-flex items-center justify-center px-space-md py-space-xs rounded-full border-2 border-on-surface bg-surface font-label-lg text-label-lg text-on-surface hover:bg-tertiary-fixed hard-shadow-active transition-all" data-path="login" href="#">تسجيل الدخول</a><a className="inline-flex items-center justify-center gap-space-xs px-space-md md:px-space-lg py-space-xs rounded-full bg-primary border-2 border-on-surface font-label-lg text-label-lg text-on-primary hard-shadow-sm hard-shadow-active hover:bg-primary-container transition-all group" data-path="signup" href="#"><span className="">ابدأ مجانًا</span><span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-[-2px] rtl:group-hover:translate-x-[2px]">arrow_forward</span></a><div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center border border-on-surface shrink-0"><span className="material-symbols-outlined text-on-primary text-[18px]">person</span></div></div></div></div></header><main className="w-full pt-20 bg-background min-h-screen"><div className="flex flex-col w-full overflow-x-hidden font-body-md text-on-background antialiased selection:bg-secondary-fixed selection:text-on-secondary-fixed" id="wasla-app">

<div className="w-full overflow-hidden py-space-2xl -my-space-xs">
<div className="w-[130%] -mx-[15%] bg-tertiary-fixed border-y-2 border-on-surface py-space-xs overflow-hidden select-none -rotate-[20deg] shadow-[0_6px_0_#111c2d]">
<div className="flex items-center gap-space-lg whitespace-nowrap animate-marquee tracking-wider font-badge-sticker text-badge-sticker text-on-tertiary-fixed font-bold uppercase">

<span className="flex items-center gap-space-2xs"><span className="w-2.5 h-2.5 rounded-full bg-primary border border-on-surface"></span> <span data-i18n-key="ticker_whatsapp" className="">واتساب كلاود API</span></span>
<span className="">★</span>
<span className="flex items-center gap-space-2xs"><span className="w-2.5 h-2.5 rounded-full bg-secondary border border-on-surface"></span> <span data-i18n-key="ticker_instagram" className="">رسائل واستوريز إنستجرام</span></span>
<span className="">★</span>
<span className="flex items-center gap-space-2xs"><span className="w-2.5 h-2.5 rounded-full bg-primary-container border border-on-surface"></span> <span data-i18n-key="ticker_facebook" className="">فيسبوك ماسنجر</span></span>
<span className="">★</span>
<span className="flex items-center gap-space-2xs"><span className="w-2.5 h-2.5 rounded-full bg-tertiary-fixed-dim border border-on-surface"></span> <span data-i18n-key="ticker_ai" className="">تحويل المحادثة لطلب بالذكاء الاصطناعي</span></span>
<span className="">★</span>
<span className="flex items-center gap-space-2xs"><span className="w-2.5 h-2.5 rounded-full bg-secondary-container border border-on-surface"></span> <span data-i18n-key="ticker_inventory" className="">مزامنة لحظية للمخازن</span></span>
<span className="">★</span>
<span className="flex items-center gap-space-2xs"><span className="w-2.5 h-2.5 rounded-full bg-primary border border-on-surface"></span> <span data-i18n-key="ticker_shipping" className="">بوالص الشحن لشركات مصر</span></span>
<span className="">★</span>
<span className="flex items-center gap-space-2xs"><span className="w-2.5 h-2.5 rounded-full bg-tertiary border border-on-surface"></span> <span data-i18n-key="ticker_analytics" className="">متابعة أرباح التاجر الحية</span></span>
<span className="">★</span>
<span className="flex items-center gap-space-2xs"><span className="w-2.5 h-2.5 rounded-full bg-primary border border-on-surface"></span> <span data-i18n-key="ticker_whatsapp" className="">واتساب كلاود API</span></span>
<span className="">★</span>
<span className="flex items-center gap-space-2xs"><span className="w-2.5 h-2.5 rounded-full bg-secondary border border-on-surface"></span> <span data-i18n-key="ticker_instagram" className="">رسائل واستوريز إنستجرام</span></span>
<span className="">★</span>
<span className="flex items-center gap-space-2xs"><span className="w-2.5 h-2.5 rounded-full bg-primary-container border border-on-surface"></span> <span data-i18n-key="ticker_facebook" className="">فيسبوك ماسنجر</span></span>
</div>
</div>

<section className="relative w-full max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop pt-space-2xl md:pt-space-3xl pb-space-3xl">

<div className="absolute -top-6 start-4 w-16 h-16 rounded-full bg-tertiary-fixed border-2 border-on-surface -z-10 opacity-70 hidden sm:block"></div>
<div className="absolute top-20 end-8 w-24 h-24 rounded-full bg-secondary-fixed border-2 border-on-surface -z-10 opacity-60"></div>
<div className="absolute top-48 start-1/4 w-8 h-8 rotate-45 bg-primary-fixed border-2 border-on-surface -z-10"></div>
<div className="absolute -bottom-10 end-1/3 w-32 h-10 rounded-full bg-surface-variant border-2 border-on-surface -z-10 rotate-12 hidden md:block"></div>
<div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-space-2xl">

<div className="inline-flex items-center gap-space-2xs px-space-md py-space-2xs rounded-full bg-tertiary-fixed text-on-tertiary-fixed border-2 border-on-surface hard-shadow-sm -rotate-1 mb-space-md hover:rotate-1 transition-transform">
<span className="material-symbols-outlined text-[18px]">bolt</span>
<span className="font-badge-sticker text-badge-sticker font-extrabold uppercase" data-i18n-key="hero_pill">مساحة عمل التجارة الاجتماعية الذكية #1 في مصر</span>
</div>

<h1 className="font-display-hero text-display-hero text-on-surface font-extrabold tracking-tight mb-space-md leading-[1.15]">
<span data-i18n-key="hero_h1_part1" className="">حوّل محادثات العملاء إلى</span>
<span className="relative inline-block text-primary mx-2">
<span data-i18n-key="hero_h1_part2" className="">طلبات فعلية</span>
<svg className="absolute -bottom-2 inset-x-0 w-full text-secondary-container" fill="currentColor" preserveAspectRatio="none" viewBox="0 0 100 20">
<path d="M0,12 Q25,3 50,14 T100,10 L98,18 Q75,12 50,18 T0,18 Z"></path>
</svg>
</span>
<span data-i18n-key="hero_h1_part3" className="">بدون مجهود.</span>
</h1>

<p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-space-xl leading-relaxed" data-i18n-key="hero_subhead">اجمع WhatsApp وInstagram وFacebook ومبيعات موقعك في لوحة تحكم واحدة فائقة السرعة. حلّل الرسائل، وأدر الطلبات والمخازن، واطبع بوالص الشحن بنقرة زر.</p>

<div className="flex flex-col sm:flex-row items-center justify-center gap-space-md w-full max-w-md">
<a className="w-full sm:w-auto inline-flex items-center justify-center gap-space-xs px-space-xl py-space-md rounded-full bg-primary text-on-primary border-2 border-on-surface hard-shadow-sm hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#111c2d] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all font-label-lg text-label-lg font-bold" href="#demo-section">
<span data-i18n-key="hero_cta_primary" className="">ابدأ تجربتك المجانية</span>
<span className="w-7 h-7 rounded-full bg-surface-container-lowest text-on-surface flex items-center justify-center border border-on-surface">
<span className="material-symbols-outlined text-[16px] rtl:rotate-180">arrow_forward</span>
</span>
</a>
<button className="w-full sm:w-auto inline-flex items-center justify-center gap-space-xs px-space-lg py-space-md rounded-full bg-surface-container-lowest text-on-surface border-2 border-on-surface hard-shadow-sm hover:bg-tertiary-fixed transition-all font-label-lg text-label-lg font-bold" type="button">
<span className="material-symbols-outlined text-primary text-[20px]">play_circle</span>
<span data-i18n-key="hero_cta_secondary" className="">شاهد كيف تعمل</span>
</button>
</div>

<div className="flex items-center justify-center gap-space-md mt-space-md text-on-surface-variant font-label-md text-label-md">
<div className="flex items-center gap-space-2xs">
<span className="material-symbols-outlined text-tertiary text-[18px]">verified</span>
<span data-i18n-key="hero_trust_1" className="">لا تحتاج لبطاقة ائتمانية</span>
</div>
<span className="">•</span>
<div className="flex items-center gap-space-2xs">
<span className="material-symbols-outlined text-primary text-[18px]">lock_reset</span>
<span data-i18n-key="hero_trust_2" className="">جاهز في 3 دقائق</span>
</div>
<span className="hidden sm:inline">•</span>
<div className="hidden sm:flex items-center gap-space-2xs">
<span className="material-symbols-outlined text-secondary text-[18px]">sentiment_very_satisfied</span>
<span data-i18n-key="hero_trust_3" className="">+1,400 متجر مصري يعتمد علينا</span>
</div>
</div>
</div>

<div className="w-full max-w-5xl mx-auto bg-surface-container-lowest border-2 border-on-surface rounded-xl hard-shadow-sm overflow-hidden relative" id="interactive-saas-preview">

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
<button className="w-full py-space-xs rounded-full bg-primary text-on-primary border-2 border-on-surface hard-shadow-sm active:translate-x-1 active:translate-y-1 active:shadow-none hover:bg-primary-container font-label-lg text-label-lg font-bold flex items-center justify-center gap-space-xs transition-all" id="create-order-btn" type="button">
<span className="material-symbols-outlined text-[18px]">receipt_long</span>
<span data-i18n-key="btn_approve_order" id="create-order-text" className="">إنشاء الطلب وإرسال البوليصة (نقرة واحدة)</span>
</button>
<p className="text-center font-label-md text-[11px] text-on-surface-variant" data-i18n-key="note_sync">يتم إرسال رسالة واتساب للعميل ببيانات التتبع ومزامنة المخزون تلقائيًا.</p>
</div>
</div>
</div>
</div>
</section>

<section className="w-full bg-surface-container py-space-3xl border-y-2 border-on-surface relative">
<div className="max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop">
<div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-space-2xl">
<span className="px-space-sm py-space-2xs rounded-full bg-error-container text-on-error-container border-2 border-on-surface font-badge-sticker text-badge-sticker font-bold rotate-2 mb-space-xs" data-i18n-key="problem_badge">المشكلة اليومية المؤلمة</span>
<h2 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight mb-space-xs" data-i18n-key="problem_title">عملاؤك يراسلونك في كل مكان.. وفريقك تائه بين الشاشات!</h2>
<p className="font-body-lg text-body-lg text-on-surface-variant" data-i18n-key="problem_desc">البيع عبر السوشيال ميديا في مصر قنبلة مبيعات، لكن إدارته يدويًا عبر 4 تطبيقات وشيتات إكسل تكلفك خسارة 30% من الطلبات كل شهر.</p>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">

<div className="bg-surface-container-lowest p-space-md rounded-xl border-2 border-on-surface hard-shadow-sm -rotate-1 hover:rotate-0 transition-transform">
<div className="w-12 h-12 rounded-lg bg-tertiary-fixed border-2 border-on-surface flex items-center justify-center mb-space-sm">
<span className="material-symbols-outlined text-[26px] text-on-tertiary-fixed">chat_bubble</span>
</div>
<h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-space-xs" data-i18n-key="prob1_title">واتساب غير منظم</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant" data-i18n-key="prob1_desc">رسائل مكدسة، عميل ينتظر بالساعات حتى يرد موظف المبيعات، ومحادثات تضيع بعد إغلاق التطبيق.</p>
</div>

<div className="bg-surface-container-lowest p-space-md rounded-xl border-2 border-on-surface hard-shadow-sm rotate-1 hover:rotate-0 transition-transform">
<div className="w-12 h-12 rounded-lg bg-secondary-fixed border-2 border-on-surface flex items-center justify-center mb-space-sm">
<span className="material-symbols-outlined text-[26px] text-on-secondary-fixed">photo_camera</span>
</div>
<h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-space-xs" data-i18n-key="prob2_title">ردود إنستجرام المفقودة</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant" data-i18n-key="prob2_desc">ردود الستوري تتداخل مع الرسائل الخاصة، ومشتري يسأل عن السعر والمقاس قبل أن يشتري من منافسك فورًا.</p>
</div>

<div className="bg-surface-container-lowest p-space-md rounded-xl border-2 border-on-surface hard-shadow-sm -rotate-1 hover:rotate-0 transition-transform">
<div className="w-12 h-12 rounded-lg bg-surface-container-high border-2 border-on-surface flex items-center justify-center mb-space-sm">
<span className="material-symbols-outlined text-[26px] text-primary">table_chart</span>
</div>
<h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-space-xs" data-i18n-key="prob3_title">جحيم ملفات الإكسل</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant" data-i18n-key="prob3_desc">نسخ ولصق الأسماء والعناوين يدويًا، أخطاء في أرقام الهواتف، وطلبات مكررة تسبب مرتجعات باهظة.</p>
</div>

<div className="bg-surface-container-lowest p-space-md rounded-xl border-2 border-on-surface hard-shadow-sm rotate-1 hover:rotate-0 transition-transform">
<div className="w-12 h-12 rounded-lg bg-tertiary-fixed-dim border-2 border-on-surface flex items-center justify-center mb-space-sm">
<span className="material-symbols-outlined text-[26px] text-on-surface">sync_problem</span>
</div>
<h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-space-xs" data-i18n-key="prob4_title">بيع منتجات غير متوفرة</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant" data-i18n-key="prob4_desc">بيع نفس القطعة لعميلين مختلفين على منصتين في نفس الدقيقة لعدم وجود ربط مباشر مع المخازن.</p>
</div>
</div>
</div>
</section>

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

<section className="w-full max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop py-space-3xl" id="pricing-plans">
<div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-space-2xl">
<span className="px-space-sm py-space-2xs rounded-full bg-primary-fixed text-on-primary-fixed border-2 border-on-surface font-badge-sticker text-badge-sticker font-bold mb-space-xs" data-i18n-key="pricing_tag">باقات اشتراك واضحة</span>
<h3 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight mb-space-xs" data-i18n-key="pricing_title">استثمر في راحة بالك ونمو أرباح متجرك</h3>
<p className="font-body-lg text-body-lg text-on-surface-variant" data-i18n-key="pricing_desc">بدون رسوم خفية أو نسب على مبيعاتك. كل باقة تمنحك قيمة حقيقية تفوق تكلفتها من أول أسبوع.</p>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg items-stretch">

<div className="bg-surface-container-lowest p-space-lg rounded-xl border-2 border-on-surface hard-shadow-sm flex flex-col justify-between">
<div>
<span className="font-badge-sticker text-badge-sticker text-on-surface-variant uppercase font-bold" data-i18n-key="tier1_badge">للبدايات الواعدة</span>
<h4 className="font-headline-lg text-headline-lg font-bold text-on-surface mt-1 mb-2" data-i18n-key="tier1_title">البداية المجانية</h4>
<div className="flex items-baseline gap-1 mb-space-md">
<span className="font-display-hero text-4xl font-extrabold text-on-surface">0</span>
<span className="font-label-md text-on-surface-variant" data-i18n-key="egp_month">ج.م / شهريًا</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md pb-space-md border-b border-outline-variant" data-i18n-key="tier1_desc">مثالية للمتاجر الناشئة التي تبدأ أولى خطواتها في التجارة الإلكترونية.</p>
<ul className="flex flex-col gap-space-xs font-body-sm text-body-sm text-on-surface mb-space-lg">
<li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[18px]">check</span> حتى 50 طلب شهريًا</li>
<li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[18px]">check</span> ربط رقم واتساب واحد</li>
<li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[18px]">check</span> مستخدم واحد للوحة التحكم</li>
<li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[18px]">check</span> مسودات الطلبات اليدوية</li>
</ul>
</div>
<a className="w-full py-space-xs rounded-full bg-surface-container text-on-surface border-2 border-on-surface font-label-lg font-bold text-center hover:bg-tertiary-fixed transition-colors" data-i18n-key="btn_tier1" href="#demo-section">ابدأ مجانًا بدون كارت</a>
</div>

<div className="bg-surface-container-lowest p-space-lg rounded-xl border-2 border-on-surface shadow-[6px_6px_0px_#6b38d4] flex flex-col justify-between relative -translate-y-2">
<div className="absolute -top-3.5 start-1/2 -translate-x-1/2 px-space-sm py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed border-2 border-on-surface font-badge-sticker text-badge-sticker font-black uppercase">
          ★ الأكثر اختيارًا ونموًا ★
        </div>
<div>
<span className="font-badge-sticker text-badge-sticker text-primary uppercase font-bold" data-i18n-key="tier2_badge">للتجار المحترفين</span>
<h4 className="font-headline-lg text-headline-lg font-bold text-on-surface mt-1 mb-2" data-i18n-key="tier2_title">باقة النمو (Growth)</h4>
<div className="flex items-baseline gap-1 mb-space-md">
<span className="font-display-hero text-4xl font-extrabold text-primary">599</span>
<span className="font-label-md text-on-surface-variant" data-i18n-key="egp_month">ج.م / شهريًا</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md pb-space-md border-b border-outline-variant" data-i18n-key="tier2_desc">كل ما تحتاجه لإدارة حجم رسائل ضخم وتسريع وتيرة تحضير الشحنات بدون أخطاء.</p>
<ul className="flex flex-col gap-space-xs font-body-sm text-body-sm text-on-surface mb-space-lg">
<li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[18px]">check_circle</span> طلبات غير محدودة</li>
<li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[18px]">check_circle</span> ربط واتساب وإنستجرام وفيسبوك</li>
<li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[18px]">check_circle</span> حتى 5 مستخدمين (وكلاء خدمة عملاء)</li>
<li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[18px]">check_circle</span> استخراج الطلبات الآلي بالذكاء الاصطناعي</li>
<li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[18px]">check_circle</span> الربط مع بوسطة، أرامكس، وشيتات الإكسل</li>
</ul>
</div>
<a className="w-full py-space-sm rounded-full bg-primary text-on-primary border-2 border-on-surface font-label-lg font-bold text-center hard-shadow-sm hover:bg-primary-container active:translate-x-1 active:translate-y-1 active:shadow-none transition-all" data-i18n-key="btn_tier2" href="#demo-section">ابدأ تجربة مجانية 14 يوم</a>
</div>

<div className="bg-surface-container-lowest p-space-lg rounded-xl border-2 border-on-surface hard-shadow-sm flex flex-col justify-between">
<div>
<span className="font-badge-sticker text-badge-sticker text-on-surface-variant uppercase font-bold" data-i18n-key="tier3_badge">للبراندات والشركات الكبرى</span>
<h4 className="font-headline-lg text-headline-lg font-bold text-on-surface mt-1 mb-2" data-i18n-key="tier3_title">باقة الاحتراف (Pro)</h4>
<div className="flex items-baseline gap-1 mb-space-md">
<span className="font-display-hero text-4xl font-extrabold text-on-surface">999</span>
<span className="font-label-md text-on-surface-variant" data-i18n-key="egp_month">ج.م / شهريًا</span>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md pb-space-md border-b border-outline-variant" data-i18n-key="tier3_desc">للمتاجر متعددة الفروع والمستودعات مع تدفقات عمل مخصصة ودعم فني مخصص.</p>
<ul className="flex flex-col gap-space-xs font-body-sm text-body-sm text-on-surface mb-space-lg">
<li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[18px]">check</span> كل مميزات باقة النمو</li>
<li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[18px]">check</span> مستخدمين غير محدودين</li>
<li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[18px]">check</span> إدارة مستودعات وفروع متعددة</li>
<li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[18px]">check</span> دعم WhatsApp مخصص ومدير حساب</li>
</ul>
</div>
<a className="w-full py-space-xs rounded-full bg-surface-container text-on-surface border-2 border-on-surface font-label-lg font-bold text-center hover:bg-tertiary-fixed transition-colors" data-i18n-key="btn_tier3" href="#demo-section">تواصل مع فريق المبيعات</a>
</div>
</div>
</section>

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

<section className="w-full max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop py-space-3xl" id="demo-section">
<div className="relative w-full bg-primary-fixed border-2 border-on-surface rounded-2xl p-space-xl md:p-space-3xl overflow-hidden hard-shadow-sm text-center">

<div className="absolute -top-12 -start-12 w-36 h-36 rounded-full bg-tertiary-fixed border-2 border-on-surface opacity-60"></div>
<div className="absolute -bottom-16 -end-16 w-48 h-48 rounded-full bg-secondary-fixed border-2 border-on-surface opacity-70"></div>
<div className="absolute top-1/2 end-12 w-6 h-6 rotate-12 bg-surface border-2 border-on-surface hidden md:block"></div>
<div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
<div className="inline-flex items-center gap-space-2xs px-space-md py-space-2xs rounded-full bg-surface-container-lowest border-2 border-on-surface font-badge-sticker text-badge-sticker font-bold mb-space-md">
          🚀 انضم لأكثر من 1,400 متجر رائد
        </div>
<h3 className="font-display-hero text-headline-xl md:text-display-hero font-extrabold text-on-primary-fixed mb-space-sm leading-tight" data-i18n-key="cta_final_title">جاهز لتحويل محادثاتك إلى ماكينة مبيعات حقيقية؟</h3>
<p className="font-body-lg text-body-lg text-on-primary-fixed-variant mb-space-xl" data-i18n-key="cta_final_desc">ابدأ اليوم مجانًا بدون أي التزام مالي. فريقنا جاهز لمساعدتك في إعداد حسابك وربط صفحاتك في دقائق معدودة.</p>
<div className="flex flex-col sm:flex-row items-center gap-space-md w-full max-w-md">
<input className="w-full px-space-md py-space-md rounded-full bg-surface-container-lowest border-2 border-on-surface font-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary hard-shadow-sm text-center" data-i18n-placeholder="input_placeholder" placeholder="رقم هاتفك أو بريدك الإلكتروني" type="text" />
<button className="w-full sm:w-auto shrink-0 px-space-xl py-space-md rounded-full bg-primary text-on-primary border-2 border-on-surface hard-shadow-sm hover:bg-primary-container active:translate-x-1 active:translate-y-1 active:shadow-none font-label-lg text-label-lg font-bold transition-all" data-i18n-key="btn_free_signup" type="button">ابدأ مجانًا</button>
</div>
<p className="font-label-md text-xs text-on-primary-fixed-variant mt-space-sm" data-i18n-key="cta_guarantee">تجربة مجانية لمدة 14 يومًا • تفعيل فوري • دعم فني متواصل</p>
</div>
</div>
</section>
</div>
</main><footer className="w-full bg-surface-container-low border-t-2 border-on-surface mt-space-4xl relative overflow-hidden"><div className="max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop py-space-3xl"><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-space-2xl mb-space-3xl"><div className="lg:col-span-2 flex flex-col items-start gap-space-md"><div className="flex flex-col items-start gap-space-xs"><img alt="WASLA | وِصلة" className="h-12 w-auto object-contain rounded bg-surface-container-lowest p-1 border border-on-surface hard-shadow-sm mb-space-xs" src={logo} /><div className="flex items-center gap-space-xs"><span className="font-headline-md text-headline-md font-bold text-on-surface">وِصلة | WASLA</span></div></div><p className="font-body-md text-body-md text-on-surface-variant max-w-sm">منصة واحدة لإدارة تجارتك التي تبدأ من المحادثة. المنصة الأولى لإدارة وتوسيع التجارة الاجتماعية في مصر والشرق الأوسط، أتمتة الرسائل، مزامنة المخازن، والربط اللوجستي بأعلى كفاءة وسرعة.</p><div className="flex items-center gap-space-xs mt-space-xs"><span className="px-space-sm py-space-2xs rounded-full bg-secondary-fixed text-on-secondary-fixed border border-on-surface font-badge-sticker text-badge-sticker">#1 Social Commerce</span><span className="px-space-sm py-space-2xs rounded-full bg-tertiary-fixed text-on-tertiary-fixed border border-on-surface font-badge-sticker text-badge-sticker">صُنع في مصر 🇪🇬</span></div></div><div><h4 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-space-md border-b-2 border-on-surface pb-space-2xs inline-block">المنتج</h4><ul className="flex flex-col gap-space-xs font-body-sm text-body-sm text-on-surface-variant"><li className=""><a className="hover:text-primary transition-colors" data-path="product" href="#">صندوق الوارد الموحد</a></li><li className=""><a className="hover:text-primary transition-colors" data-path="product" href="#">مزامنة مخازن TikTok وInstagram</a></li><li className=""><a className="hover:text-primary transition-colors" data-path="product" href="#">أتمتة شات بوت WhatsApp</a></li><li className=""><a className="hover:text-primary transition-colors" data-path="pricing" href="#">بوابات الدفع والتحصيل</a></li><li className=""><a className="hover:text-primary transition-colors" data-path="product" href="#">التكامل مع شركات الشحن</a></li></ul></div><div><h4 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-space-md border-b-2 border-on-surface pb-space-2xs inline-block">الحلول</h4><ul className="flex flex-col gap-space-xs font-body-sm text-body-sm text-on-surface-variant"><li className=""><a className="hover:text-primary transition-colors" data-path="solutions" href="#">لتجار الأزياء والموضة</a></li><li className=""><a className="hover:text-primary transition-colors" data-path="solutions" href="#">لمتاجر العناية والتجميل</a></li><li className=""><a className="hover:text-primary transition-colors" data-path="solutions" href="#">لصُنّاع الإلكترونيات</a></li><li className=""><a className="hover:text-primary transition-colors" data-path="solutions" href="#">للعلامات التجارية الناشئة</a></li><li className=""><a className="hover:text-primary transition-colors" data-path="solutions" href="#">الشركات متعدّدة الفروع</a></li></ul></div><div><h4 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-space-md border-b-2 border-on-surface pb-space-2xs inline-block">المصادر والشركة</h4><ul className="flex flex-col gap-space-xs font-body-sm text-body-sm text-on-surface-variant"><li className=""><a className="hover:text-primary transition-colors" data-path="resources" href="#">دليل نمو التجارة الاجتماعية</a></li><li className=""><a className="hover:text-primary transition-colors" data-path="resources" href="#">مدونة وِصلة</a></li><li className=""><a className="hover:text-primary transition-colors" data-path="resources" href="#">قصص نجاح التجار</a></li><li className=""><a className="hover:text-primary transition-colors" data-path="pricing" href="#">حاسبة العائد الاستثماري</a></li><li className=""><a className="hover:text-primary transition-colors" data-path="login" href="#">بوابة المطورين و API</a></li></ul></div></div><div className="pt-space-lg border-t-2 border-on-surface flex flex-col md:flex-row items-center justify-between gap-space-md font-body-sm text-body-sm text-on-surface-variant"><div className="flex flex-wrap items-center gap-space-md"><span className="">© 2025 منصة وِصلة (WASLA Tech LLC). جميع الحقوق محفوظة.</span><a className="hover:underline" data-path="resources" href="#">سياسة الخصوصية</a><a className="hover:underline" data-path="resources" href="#">شروط الخدمة</a><a className="hover:underline" data-path="resources" href="#">الأمان والامتثال</a></div><div className="flex items-center gap-space-xs"><span className="w-3 h-3 rounded-full bg-tertiary-fixed-dim border border-on-surface"></span><span className="w-3 h-3 rounded-full bg-secondary border border-on-surface"></span><span className="w-3 h-3 rounded-full bg-primary border border-on-surface"></span></div></div></div></footer>


    </div>
  );
}
