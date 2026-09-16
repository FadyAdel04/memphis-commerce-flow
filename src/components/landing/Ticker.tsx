interface TickerItem {
  key: string;
  text: string;
  color: string;
}

const items: TickerItem[] = [
  { key: "ticker_whatsapp", text: "واتساب كلاود API", color: "bg-primary" },
  { key: "ticker_instagram", text: "رسائل واستوريز إنستجرام", color: "bg-secondary" },
  { key: "ticker_facebook", text: "فيسبوك ماسنجر", color: "bg-primary-container" },
  { key: "ticker_ai", text: "تحويل المحادثة لطلب بالذكاء الاصطناعي", color: "bg-tertiary-fixed-dim" },
  { key: "ticker_inventory", text: "مزامنة لحظية للمخازن", color: "bg-secondary-container" },
  { key: "ticker_shipping", text: "بوالص الشحن لشركات مصر", color: "bg-primary" },
  { key: "ticker_analytics", text: "متابعة أرباح التاجر الحية", color: "bg-tertiary" },
  { key: "ticker_integrations", text: "تكامل فوري وشامل", color: "bg-primary-container" },
];

function TickerTrack({ "aria-hidden": ariaHidden }: { "aria-hidden"?: boolean }) {
  return (
    <div
      aria-hidden={ariaHidden}
      className="flex shrink-0 items-center gap-space-lg pe-space-lg whitespace-nowrap tracking-wider font-badge-sticker text-badge-sticker text-on-tertiary-fixed font-bold uppercase"
    >
      {items.map((item, idx) => (
        <span key={`${item.key}-${idx}`} className="inline-flex items-center gap-space-lg">
          <span className="inline-flex items-center gap-space-2xs">
            <span className={`w-2.5 h-2.5 rounded-full ${item.color} border border-on-surface shrink-0`}></span>
            <span data-i18n-key={item.key}>{item.text}</span>
          </span>
          <span className="text-on-tertiary-fixed/60 select-none">★</span>
        </span>
      ))}
    </div>
  );
}

export function Ticker() {
  return (
    <div className="w-full bg-tertiary-fixed border-y-2 border-on-surface py-2.5 overflow-hidden select-none" dir="ltr">
      <div className="flex w-max animate-marquee-smooth">
        <TickerTrack />
        <TickerTrack aria-hidden />
      </div>
    </div>
  );
}
