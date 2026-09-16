import waslaLogo from "@/assets/wasla-logo.png";
import { useAuth } from "@/hooks/use-auth";

export function Header() {
  const { isAuthenticated } = useAuth();

  // Redirect to dashboard if authenticated (for landing page access)
  // Note: This is a client-side redirect, for SSR you'd want to handle this differently

  return (
    <header className="fixed top-0 inset-x-0 z-50 transition-all duration-300 px-gutter-mobile md:px-gutter-desktop py-space-xs">
      <div className="max-w-container-max mx-auto">
        <div className="h-20 bg-surface-container-lowest border-2 border-on-surface rounded-full px-space-md md:px-space-lg hard-shadow-sm flex items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-xs group transition-transform duration-200 hover:scale-105 active:scale-95">
            <a
              className="flex items-center gap-space-xs group transition-transform duration-200 hover:scale-105 active:scale-95"
              data-path="home"
              href="/"
            >
              <img
                alt="WASLA Logo"
                className="h-12 w-auto object-contain rounded-lg transition-transform duration-200 group-hover:rotate-3"
                src={waslaLogo}
              />
            </a>

            <div className="hidden xl:inline-flex items-center px-space-xs py-space-2xs bg-tertiary-fixed text-on-tertiary-fixed border border-on-surface rounded-full font-badge-sticker text-badge-sticker rotate-2 hover:rotate-0 transition-transform duration-200">
              تجارة اجتماعية ذكية
            </div>
          </div>
          <nav
            className="hidden lg:flex items-center gap-space-xs bg-surface-container-low p-space-2xs rounded-full border border-on-surface"
            data-active-classes="bg-primary text-on-primary font-bold shadow-[2px_2px_0px_#111c2d]"
          >
            <a
              className="px-space-md py-space-xs rounded-full font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all hover:scale-105 active:scale-95"
              data-path="product"
              href="/"
            >
              المنتج
            </a>
            <a
              className="px-space-md py-space-xs rounded-full font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all hover:scale-105 active:scale-95"
              data-path="solutions"
              href="/"
            >
              الحلول
            </a>
            <a
              className="px-space-md py-space-xs rounded-full font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all hover:scale-105 active:scale-95"
              data-path="pricing"
              href="/"
            >
              الأسعار
            </a>
            <a
              className="px-space-md py-space-xs rounded-full font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all hover:scale-105 active:scale-95"
              data-path="resources"
              href="/"
            >
              المصادر
            </a>
          </nav>
          <div className="flex items-center gap-space-xs md:gap-space-sm">
            <button
              className="flex items-center gap-space-2xs px-space-sm py-space-xs rounded-full bg-surface border-2 border-on-surface font-label-md text-label-md text-on-surface hover:bg-surface-container hard-shadow-sm hard-shadow-active cursor-pointer"
              id="langToggle"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">translate</span>
              <span className="font-bold">العربية | EN</span>
            </button>
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <a
                  href="/dashboard"
                  className="btn-interactive btn-shimmer inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-on-primary border-2 border-on-surface font-bold text-sm hard-shadow-sm hover:bg-primary-container"
                >
                  <span className="material-symbols-outlined text-[18px]">dashboard</span>
                  <span>لوحة التحكم</span>
                </a>
                <a
                  href="/dashboard/settings"
                  className="w-9 h-9 rounded-full bg-surface-container border-2 border-on-surface flex items-center justify-center hover:scale-105 transition-transform"
                  title="إعدادات المتجر"
                >
                  <span className="material-symbols-outlined text-primary text-[20px]">settings</span>
                </a>
              </div>
            ) : (
              <>
                <a
                  href="/auth/login"
                  className="hidden sm:inline-flex items-center justify-center px-space-md py-space-xs rounded-full border-2 border-on-surface bg-surface font-label-lg text-label-lg text-on-surface hover:bg-tertiary-fixed hard-shadow-sm hard-shadow-active cursor-pointer"
                  data-path="login"
                >
                  تسجيل الدخول
                </a>
                <a
                  href="/auth/signup"
                  className="btn-shimmer inline-flex items-center justify-center gap-space-xs px-space-md md:px-space-lg py-space-xs rounded-full bg-primary border-2 border-on-surface font-label-lg text-label-lg text-on-primary hard-shadow-sm hard-shadow-active hover:bg-primary-container cursor-pointer group"
                  data-path="signup"
                >
                  <span>ابدأ مجانًا</span>
                  <span className="material-symbols-outlined text-[18px] transition-transform duration-200 group-hover:-translate-x-1 rtl:group-hover:-translate-x-1">
                    arrow_forward
                  </span>
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}