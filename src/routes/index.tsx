import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { Header } from "@/components/landing/Header";
import { Ticker } from "@/components/landing/Ticker";
import { HeroSection } from "@/components/landing/HeroSection";
import { SaasPreviewSection } from "@/components/landing/SaasPreviewSection";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { PipelineSection } from "@/components/landing/PipelineSection";
import { InboxFeatureSection } from "@/components/landing/InboxFeatureSection";
import { OrdersKanbanSection } from "@/components/landing/OrdersKanbanSection";
import { AnalyticsSection } from "@/components/landing/AnalyticsSection";
import { VerticalsSection } from "@/components/landing/VerticalsSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { DemoSection } from "@/components/landing/DemoSection";
import { Footer } from "@/components/landing/Footer";

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
  }, []);

  return (
    <div className="bg-background font-body-md text-body-md text-on-background antialiased overflow-x-hidden">
      <Header />
      <main className="w-full pt-24 md:pt-28 bg-background min-h-screen">
        <div className="flex flex-col w-full overflow-x-hidden font-body-md text-on-background antialiased selection:bg-secondary-fixed selection:text-on-secondary-fixed" id="wasla-app">
          <Ticker />
          <HeroSection />
          <SaasPreviewSection />
          <ProblemSection />
          <PipelineSection />
          <InboxFeatureSection />
          <OrdersKanbanSection />
          <AnalyticsSection />
          <VerticalsSection />
          <PricingSection />
          <FaqSection />
          <DemoSection />
        </div>
      </main>
      <Footer />
    </div>
  );
}
