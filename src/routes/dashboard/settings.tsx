import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export const Route = createFileRoute("/dashboard/settings")({
  component: SettingsPage,
});

type TabType = "store" | "channels" | "shipping" | "ai" | "staff";

function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("store");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isFirstTime, setIsFirstTime] = useState(false);

  // Store data state (public.stores)
  const [store, setStore] = useState<any>(null);
  const [storeForm, setStoreForm] = useState({
    name: "",
    logo_url: "",
    phone: "",
    address: "",
    currency: "EGP",
    timezone: "Africa/Cairo",
    category: "fashion",
    product_count: 10,
    platforms: {
      instagram: true,
      whatsapp: true,
      facebook: false,
      website: false,
    },
  });

  // Channel settings state (public.store_settings key="channel_config")
  const [channelForm, setChannelForm] = useState({
    whatsapp_enabled: true,
    whatsapp_phone: "+1 555-675-5082",
    whatsapp_phone_number_id: "1240261785844530",
    whatsapp_waba_id: "1600277904832671",
    meta_app_id: "1073045725476742",
    meta_webhook_verify_token: "wasla_meta_webhook_token_2026",
    whatsapp_status: "connected",
    whatsapp_catalog_sync: true,
    instagram_enabled: true,
    instagram_username: "@wasla_shop",
    instagram_status: "connected",
    instagram_dm_auto: true,
    facebook_enabled: false,
    facebook_page_name: "متجر وصلة الرسمي",
    facebook_status: "disconnected",
    facebook_messenger_sync: true,
  });


  // Shipping settings state (public.store_settings key="shipping_config")
  const [shippingForm, setShippingForm] = useState({
    default_provider: "bosta",
    bosta_enabled: false,
    bosta_api_key: "",
    bosta_pickup_city: "القاهرة",
    aramex_enabled: false,
    aramex_account: "",
    aramex_pin: "",
  });

  // AI settings state (public.store_settings key="ai_config")
  const [aiForm, setAiForm] = useState({
    welcome_message: "أهلاً بك في متجرنا! يسعدنا خدمتك، تفضل باختيار ما يناسبك وسنقوم بتجهيز طلبك فوراً 🛍️",
    auto_confirm_orders: true,
    persona: "friendly", // friendly | professional | fast
    max_discount: 10,
    language_support: "arabic_egyptian",
  });

  // Staff members state (public.staff)
  const [staffList, setStaffList] = useState<any[]>([]);
  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    phone: "",
    role: "staff", // admin | manager | staff
  });
  const [addingStaff, setAddingStaff] = useState(false);

  // Instagram Integration State
  const [igStatus, setIgStatus] = useState<{
    connected: boolean;
    username: string;
    name: string;
    profilePic: string;
    pageId: string;
    webhookSubscribed: boolean;
  }>({
    connected: false,
    username: "",
    name: "",
    profilePic: "",
    pageId: "",
    webhookSubscribed: false,
  });
  const [igConnecting, setIgConnecting] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("first_time") === "true") {
        setIsFirstTime(true);
      }
    }
  }, []);

  // Fetch Instagram integration status and listen for OAuth popup completion
  useEffect(() => {
    let igChannel: any = null;

    const loadIgStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const headers: Record<string, string> = {};
        if (session?.access_token) {
          headers["Authorization"] = `Bearer ${session.access_token}`;
        }

        let storeId = store?.id;
        if (!storeId && session?.user) {
          const { data: sm } = await supabase
            .from("store_members")
            .select("store_id")
            .eq("user_id", session.user.id)
            .limit(1)
            .maybeSingle();
          storeId = sm?.store_id;
          if (!storeId) {
            const { data: st } = await supabase
              .from("stores")
              .select("id")
              .eq("user_id", session.user.id)
              .limit(1)
              .maybeSingle();
            storeId = st?.id;
          }
        }

        if (!storeId) return;

        const res = await fetch(`/api/instagram/status?storeId=${storeId}`, { headers });
        const data = await res.json();
        if (data.success && data.integration && data.integration.status === "connected") {
          const ig = data.integration;
          setIgStatus({
            connected: true,
            username: ig.ig_username || "",
            name: ig.ig_name || "",
            profilePic: ig.ig_profile_pic || "",
            pageId: ig.ig_page_id || "",
            webhookSubscribed: ig.webhook_subscribed || false,
          });
        } else {
          setIgStatus({
            connected: false,
            username: "",
            name: "",
            profilePic: "",
            pageId: "",
            webhookSubscribed: false,
          });
        }

        // Realtime subscription scoped strictly to this store
        igChannel = supabase
          .channel(`realtime:settings:ig:${storeId}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "instagram_integrations",
              filter: `store_id=eq.${storeId}`,
            },
            (payload) => {
              if (payload.eventType === "DELETE") {
                setIgStatus({
                  connected: false,
                  username: "",
                  name: "",
                  profilePic: "",
                  pageId: "",
                  webhookSubscribed: false,
                });
                return;
              }
              const ig = payload.new as any;
              if (ig && ig.status === "connected") {
                setIgStatus({
                  connected: true,
                  username: ig.ig_username || "",
                  name: ig.ig_name || "",
                  profilePic: ig.ig_profile_pic || "",
                  pageId: ig.ig_page_id || "",
                  webhookSubscribed: ig.webhook_subscribed || false,
                });
                setIgConnecting(false);
              } else {
                setIgStatus({
                  connected: false,
                  username: "",
                  name: "",
                  profilePic: "",
                  pageId: "",
                  webhookSubscribed: false,
                });
              }
            }
          )
          .subscribe();
      } catch {
        // IG status load fallback
      }
    };
    loadIgStatus();

    const handleOAuthMessage = (event: MessageEvent) => {
      if (!event.data?.type) return;
      if (event.data.type === "ig_oauth_success") {
        setIgStatus({
          connected: true,
          username: event.data.username || "",
          name: event.data.username || "",
          profilePic: event.data.profilePic || "",
          pageId: event.data.igUserId || "",
          webhookSubscribed: true,
        });
        setIgConnecting(false);
        triggerSuccess(`تم ربط حساب Instagram بنجاح! تسجيل @${event.data.username} 🎉`);
      } else if (event.data.type === "ig_oauth_error") {
        setIgConnecting(false);
        setError(`خطأ Instagram OAuth: ${event.data.error}`);
      }
    };
    window.addEventListener("message", handleOAuthMessage);
    return () => {
      window.removeEventListener("message", handleOAuthMessage);
      if (igChannel) supabase.removeChannel(igChannel);
    };
  }, [store?.id]);

  const handleConnectInstagram = async () => {
    setIgConnecting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const storeId = store?.id || "";
      const res = await fetch(`/api/instagram/auth-url${storeId ? `?storeId=${storeId}` : ""}`, { headers });
      const data = await res.json();
      if (!data.success || !data.url) throw new Error(data.error || "تعذر إنشاء رابط تسجيل الدخول");

      const popup = window.open(
        data.url,
        "instagram-oauth",
        "width=600,height=700,scrollbars=yes,resizable=yes"
      );
      if (!popup) {
        setIgConnecting(false);
        setError("تعذر فتح نافذة Instagram. يرجى السماح بالنوافذ المنبثقة.");
      }
    } catch (err: any) {
      setIgConnecting(false);
      setError(err.message || "حدث خطأ أثناء بدء ربط Instagram");
    }
  };

  const handleDisconnectInstagram = async () => {
    if (!confirm("هل أنت متأكد من فصل حساب Instagram عن متجرك؟")) return;
    try {
      if (store?.id) {
        // Delete the row permanently so it never reappears on reload
        await supabase
          .from("instagram_integrations")
          .delete()
          .eq("store_id", store.id);

        if (store.platforms && Array.isArray(store.platforms)) {
          const updatedPlatforms = store.platforms.filter((p: string) => p !== "instagram");
          await supabase
            .from("stores")
            .update({ platforms: updatedPlatforms })
            .eq("id", store.id);
          setStore((prev: any) => prev ? { ...prev, platforms: updatedPlatforms } : prev);
        }
      }
      setIgStatus({
        connected: false,
        username: "",
        name: "",
        profilePic: "",
        pageId: "",
        webhookSubscribed: false,
      });
      triggerSuccess("تم فصل حساب Instagram بنجاح.");
    } catch (err: any) {
      setError("حدث خطأ أثناء فصل حساب Instagram");
    }
  };

  // Fetch store and related relational configurations from Supabase
  const loadAllStoreData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Get store record
      const { data: storeData, error: storeError } = await supabase
        .from("stores")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (storeError) throw storeError;

      if (!storeData) {
        setStore(null);
        setLoading(false);
        return;
      }

      setStore(storeData);
      setStoreForm({
        name: storeData.name || "",
        logo_url: storeData.logo_url || "",
        phone: storeData.phone || "01000000000",
        address: storeData.address || "القاهرة، مصر",
        currency: storeData.currency || "EGP",
        timezone: storeData.timezone || "Africa/Cairo",
        category: storeData.category || "fashion",
        product_count: storeData.product_count || 10,
        platforms: {
          instagram: storeData.platforms?.instagram ?? true,
          whatsapp: storeData.platforms?.whatsapp ?? true,
          facebook: storeData.platforms?.facebook ?? false,
          website: storeData.platforms?.website ?? false,
        },
      });

      // 2. Get store_settings (shipping_config, ai_config, channel_config)
      const { data: settingsData, error: settingsError } = await supabase
        .from("store_settings")
        .select("*")
        .eq("store_id", storeData.id);

      if (!settingsError && settingsData) {
        const shippingSetting = settingsData.find((s) => s.key === "shipping_config");
        if (shippingSetting?.value) {
          setShippingForm((prev) => ({
            ...prev,
            ...shippingSetting.value,
          }));
        }

        const aiSetting = settingsData.find((s) => s.key === "ai_config");
        if (aiSetting?.value) {
          setAiForm((prev) => ({
            ...prev,
            ...aiSetting.value,
          }));
        }

        const channelSetting = settingsData.find((s) => s.key === "channel_config");
        if (channelSetting?.value) {
          setChannelForm((prev) => ({
            ...prev,
            ...channelSetting.value,
          }));
        }
      }

      // 3. Get staff members
      const { data: staffData } = await supabase
        .from("staff")
        .select("*")
        .eq("store_id", storeData.id)
        .order("created_at", { ascending: true });

      if (staffData) {
        setStaffList(staffData);
      }
    } catch (err: any) {
      console.error("Error loading settings:", err);
      setError("فشل في استرداد بيانات المتجر من السحابة.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllStoreData();
  }, [user]);

  // Flash temporary success message
  const triggerSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
  };

  // Logo file upload handler
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("حجم الشعار كبير جداً. الحد الأقصى هو 5 ميجابايت.");
      return;
    }

    setUploadingLogo(true);
    setError(null);

    try {
      const fileExt = file.name.split(".").pop() || "png";
      const filePath = `store-logos/${store?.id || "store"}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(filePath, file, { cacheControl: "3600", upsert: true });

      if (uploadError) {
        // Fallback to Base64
        const reader = new FileReader();
        reader.onloadend = () => {
          setStoreForm((prev) => ({ ...prev, logo_url: reader.result as string }));
        };
        reader.readAsDataURL(file);
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from("products")
          .getPublicUrl(filePath);
        setStoreForm((prev) => ({ ...prev, logo_url: publicUrl }));
      }
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => {
        setStoreForm((prev) => ({ ...prev, logo_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingLogo(false);
    }
  };

  // 1. Save Store Profile
  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store?.id) return;

    setSaving(true);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from("stores")
        .update({
          name: storeForm.name.trim(),
          logo_url: storeForm.logo_url || null,
          phone: storeForm.phone.trim(),
          address: storeForm.address.trim(),
          currency: storeForm.currency,
          timezone: storeForm.timezone,
          category: storeForm.category,
          product_count: Number(storeForm.product_count),
          platforms: storeForm.platforms,
          updated_at: new Date().toISOString(),
        })
        .eq("id", store.id);

      if (updateError) throw updateError;

      setStore((prev: any) => ({
        ...prev,
        name: storeForm.name.trim(),
        logo_url: storeForm.logo_url,
        phone: storeForm.phone.trim(),
        address: storeForm.address.trim(),
        currency: storeForm.currency,
        timezone: storeForm.timezone,
        category: storeForm.category,
        product_count: Number(storeForm.product_count),
        platforms: storeForm.platforms,
      }));

      triggerSuccess("تم حفظ وتحديث بيانات المتجر والشعار بنجاح! 🎉");
    } catch (err: any) {
      console.error("Store update error:", err);
      setError(err.message || "حدث خطأ أثناء حفظ بيانات المتجر");
    } finally {
      setSaving(false);
    }
  };

  // 1b. Save Channels Settings (WhatsApp, Instagram, Facebook)
  const handleSaveChannels = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store?.id) return;

    setSaving(true);
    setError(null);
    try {
      // 1. Save in store_settings table
      const { error: upsertError } = await supabase.from("store_settings").upsert(
        {
          store_id: store.id,
          key: "channel_config",
          value: channelForm,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "store_id,key" }
      );

      if (upsertError) throw upsertError;

      // 2. Sync platforms flags in stores table
      await supabase
        .from("stores")
        .update({
          platforms: {
            ...storeForm.platforms,
            whatsapp: channelForm.whatsapp_enabled,
            instagram: channelForm.instagram_enabled,
            facebook: channelForm.facebook_enabled,
          },
        })
        .eq("id", store.id);

      setStoreForm((prev) => ({
        ...prev,
        platforms: {
          ...prev.platforms,
          whatsapp: channelForm.whatsapp_enabled,
          instagram: channelForm.instagram_enabled,
          facebook: channelForm.facebook_enabled,
        },
      }));

      triggerSuccess("تم حفظ ومزامنة قنوات البيع (واتساب، إنستجرام، فيسبوك) بنجاح! 📡");
    } catch (err: any) {
      console.error("Channel update error:", err);
      setError(err.message || "حدث خطأ أثناء حفظ إعدادات القنوات");
    } finally {
      setSaving(false);
    }
  };

  // 2. Save Shipping Providers Config (public.store_settings)
  const handleSaveShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store?.id) return;

    setSaving(true);
    setError(null);
    try {
      const { error: upsertError } = await supabase.from("store_settings").upsert(
        {
          store_id: store.id,
          key: "shipping_config",
          value: shippingForm,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "store_id,key" }
      );

      if (upsertError) throw upsertError;
      triggerSuccess("تم حفظ إعدادات بوسطة وأرامكس والشحن بنجاح! 🚚");
    } catch (err: any) {
      console.error("Shipping update error:", err);
      setError(err.message || "حدث خطأ أثناء حفظ إعدادات الشحن");
    } finally {
      setSaving(false);
    }
  };

  // 3. Save AI Configuration (public.store_settings)
  const handleSaveAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store?.id) return;

    setSaving(true);
    setError(null);
    try {
      const { error: upsertError } = await supabase.from("store_settings").upsert(
        {
          store_id: store.id,
          key: "ai_config",
          value: aiForm,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "store_id,key" }
      );

      if (upsertError) throw upsertError;
      triggerSuccess("تم تحديث إعدادات ونبرة الذكاء الاصطناعي بنجاح! 🤖");
    } catch (err: any) {
      console.error("AI update error:", err);
      setError(err.message || "حدث خطأ أثناء حفظ إعدادات الذكاء الاصطناعي");
    } finally {
      setSaving(false);
    }
  };

  // 4. Add Staff Member (public.staff)
  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store?.id || !newStaff.name.trim() || !newStaff.email.trim()) return;

    setSaving(true);
    setError(null);
    try {
      const { data, error: insertError } = await supabase
        .from("staff")
        .insert({
          store_id: store.id,
          name: newStaff.name.trim(),
          email: newStaff.email.trim().toLowerCase(),
          phone: newStaff.phone.trim() || null,
          role: newStaff.role,
          is_active: true,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setStaffList((prev) => [...prev, data]);
      setNewStaff({ name: "", email: "", phone: "", role: "staff" });
      setAddingStaff(false);
      triggerSuccess("تمت إضافة عضو جديد لفريق العمل بنجاح! 👥");
    } catch (err: any) {
      console.error("Add staff error:", err);
      setError(err.message || "تعذر إضافة الموظف. تأكد من أن البريد الإلكتروني غير مكرر.");
    } finally {
      setSaving(false);
    }
  };

  // Delete Staff Member
  const handleDeleteStaff = async (staffId: string) => {
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذا الموظف؟")) return;

    try {
      const { error: delError } = await supabase
        .from("staff")
        .delete()
        .eq("id", staffId);

      if (delError) throw delError;

      setStaffList((prev) => prev.filter((s) => s.id !== staffId));
      triggerSuccess("تم حذف الموظف من المتجر.");
    } catch (err: any) {
      console.error("Delete staff error:", err);
      setError("حدث خطأ أثناء حذف الموظف.");
    }
  };

  if (loading) {
    return (
      <DashboardLayout
        title="إعدادات المتجر"
        subtitle="جاري جلب إعدادات متجرك من قاعدة البيانات..."
        activePath="/dashboard/settings"
      >
        <div className="flex flex-col items-center justify-center p-12 bg-surface-container-lowest border-2 border-on-surface rounded-2xl hard-shadow-sm space-y-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="font-bold text-on-surface">جاري تحميل البيانات...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!store) {
    return (
      <DashboardLayout
        title="إعدادات المتجر"
        subtitle="لم يتم العثور على متجر مسجل لحسابك بعد"
        activePath="/dashboard/settings"
      >
        <div className="bg-surface-container-lowest border-2 border-on-surface rounded-2xl p-8 hard-shadow-sm text-center space-y-4">
          <span className="material-symbols-outlined text-5xl text-primary">storefront</span>
          <h2 className="font-display-hero text-2xl font-extrabold text-on-surface">
            أنت جاهز لإنشاء متجرك الأول!
          </h2>
          <p className="font-body-md text-on-surface-variant max-w-md mx-auto">
            قم بإكمال خطوة التهيئة السريعة لتفعيل روبوت المحادثات وربط شركات الشحن.
          </p>
          <div className="pt-2">
            <a
              href="/onboarding"
              className="btn-interactive btn-shimmer inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-on-primary font-bold text-sm border-2 border-on-surface hard-shadow-sm hover:bg-primary-container"
            >
              <span>بدء تهيئة المتجر الآن</span>
              <span className="material-symbols-outlined text-[18px] rtl:rotate-180">arrow_forward</span>
            </a>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="إعدادات المتجر والربط"
      subtitle="إدارة بيانات المتجر، ربط شركات الشحن (بوسطة / أرامكس)، وأتمتة الذكاء الاصطناعي"
      activePath="/dashboard/settings"
    >
      <div className="space-y-6">
        {/* First Time Welcome Banner */}
        {isFirstTime && (
          <div className="bg-secondary-fixed text-on-secondary-fixed border-2 border-on-surface rounded-2xl p-5 md:p-6 hard-shadow-sm relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-12 h-12 rounded-xl bg-surface-container-lowest border-2 border-on-surface flex items-center justify-center text-primary text-2xl shrink-0">
                🎉
              </span>
              <div>
                <h3 className="font-display-hero font-extrabold text-lg text-on-surface">
                  أهلاً بك في متجر &quot;{store.name}&quot;!
                </h3>
                <p className="font-body-md text-sm text-on-surface-variant mt-0.5">
                  تم حفظ بيانات متجرك الأساسية بنجاح. أكمل الآن ربط شركات الشحن أو ضبط ردود الذكاء الاصطناعي لبدء تشغيل النظام كاملاً.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsFirstTime(false)}
              className="text-xs font-bold text-on-surface border-2 border-on-surface bg-surface px-3 py-1.5 rounded-full hover:bg-surface-container cursor-pointer shrink-0 self-end md:self-center"
            >
              إغلاق الإشعار ✕
            </button>
          </div>
        )}

        {/* Global Feedback Messages */}
        {error && (
          <div className="bg-error-container text-on-error-container border-2 border-on-surface rounded-xl p-4 font-bold text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-error">error</span>
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-100 text-emerald-950 border-2 border-emerald-600 rounded-xl p-4 font-bold text-sm flex items-center gap-2 animate-in fade-in">
            <span className="material-symbols-outlined text-emerald-700">check_circle</span>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b-2 border-on-surface/10 pb-3">
          {[
            { id: "store", label: "بيانات المتجر والهوية", icon: "storefront" },
            { id: "channels", label: "قنوات البيع (WhatsApp / IG / FB)", icon: "hub" },
            { id: "shipping", label: "شركات الشحن (بوسطة / أرامكس)", icon: "local_shipping" },
            { id: "ai", label: "المساعد الذكي والأتمتة", icon: "smart_toy" },
            { id: "staff", label: "فريق العمل والمشرفين", icon: "badge" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-bold text-sm transition-all cursor-pointer ${
                  isActive
                    ? "bg-primary text-on-primary border-on-surface hard-shadow-sm scale-[1.02]"
                    : "bg-surface-container-lowest text-on-surface border-on-surface/30 hover:border-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: Store Information */}
        {activeTab === "store" && (
          <div className="bg-surface-container-lowest border-2 border-on-surface rounded-2xl p-6 md:p-8 hard-shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b-2 border-on-surface/10 pb-4">
              <div>
                <h2 className="font-display-hero text-xl font-extrabold text-on-surface">إعدادات وهوية المتجر (Store Settings)</h2>
                <p className="font-body-md text-xs text-on-surface-variant">
                  شعار المتجر، الاسم، أرقام التواصل، العملة الافتراضية والمنطقة الزمنية
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-surface-container px-3 py-1 rounded-full border border-on-surface">
                ID: {store.id.slice(0, 8)}...
              </span>
            </div>

            <form onSubmit={handleSaveStore} className="space-y-6">
              {/* Store Logo Upload & Preview */}
              <div className="p-4 rounded-xl border-2 border-on-surface/30 bg-surface flex flex-col sm:flex-row items-center gap-5">
                <div className="w-24 h-24 rounded-2xl border-2 border-on-surface bg-surface-container-lowest flex items-center justify-center overflow-hidden hard-shadow-sm shrink-0">
                  {storeForm.logo_url ? (
                    <img src={storeForm.logo_url} alt="شعار المتجر" className="w-full h-full object-contain p-1" />
                  ) : (
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant/60">storefront</span>
                  )}
                </div>

                <div className="space-y-2 flex-1 text-center sm:text-start">
                  <div className="font-bold text-sm text-on-surface">شعار المتجر (Store Logo)</div>
                  <p className="text-xs text-on-surface-variant">
                    يظهر الشعار في رأس الفواتير، بوالص الشحن، وصفحة المتجر الرئيسية.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1 justify-center sm:justify-start">
                    <label className="btn-interactive px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold border border-on-surface cursor-pointer hard-shadow-sm flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">upload</span>
                      <span>{uploadingLogo ? "جاري الرفع..." : "رفع شعار جديد"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={uploadingLogo}
                        className="hidden"
                      />
                    </label>

                    {storeForm.logo_url && (
                      <button
                        type="button"
                        onClick={() => setStoreForm((prev) => ({ ...prev, logo_url: "" }))}
                        className="px-3 py-2 rounded-xl border border-on-surface text-error hover:bg-error-container/30 text-xs font-bold cursor-pointer"
                      >
                        حذف الشعار
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Name & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-on-surface mb-2">اسم المتجر / العلامة التجارية *</label>
                  <input
                    type="text"
                    value={storeForm.name}
                    onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-on-surface bg-surface text-on-surface font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-on-surface mb-2">تخصص ونشاط المتجر (الفئة)</label>
                  <select
                    value={storeForm.category}
                    onChange={(e) => setStoreForm({ ...storeForm, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-on-surface bg-surface text-on-surface font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="fashion">أزياء وموضة 👗</option>
                    <option value="beauty">عناية وتجميل 💄</option>
                    <option value="electronics">إلكترونيات وإكسسوارات 📱</option>
                    <option value="food">أغذية ومشروبات ☕</option>
                    <option value="home">ديكور ومنزل 🛋️</option>
                    <option value="accessories">ساعات ومجوهرات 💍</option>
                    <option value="other">أخرى 📦</option>
                  </select>
                </div>
              </div>

              {/* Phone & Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-on-surface mb-2">رقم هاتف المتجر الرسمي (Phone)</label>
                  <input
                    type="tel"
                    value={storeForm.phone}
                    onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value })}
                    placeholder="01012345678"
                    className="w-full px-4 py-3 rounded-xl border-2 border-on-surface bg-surface text-on-surface font-mono font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-on-surface mb-2">عنوان ومقر المتجر (Address)</label>
                  <input
                    type="text"
                    value={storeForm.address}
                    onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
                    placeholder="شارع التحرير، الدقي، الجيزة، مصر"
                    className="w-full px-4 py-3 rounded-xl border-2 border-on-surface bg-surface text-on-surface font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Currency & Timezone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-on-surface mb-2">العملة الافتراضية (Currency)</label>
                  <select
                    value={storeForm.currency}
                    onChange={(e) => setStoreForm({ ...storeForm, currency: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-on-surface bg-surface text-on-surface font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="EGP">جنيه مصري (EGP - ج.م)</option>
                    <option value="SAR">ريال سعودي (SAR - ر.س)</option>
                    <option value="AED">درهم إماراتي (AED - د.إ)</option>
                    <option value="USD">دولار أمريكي (USD - $)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-on-surface mb-2">المنطقة الزمنية (Timezone)</label>
                  <select
                    value={storeForm.timezone}
                    onChange={(e) => setStoreForm({ ...storeForm, timezone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-on-surface bg-surface text-on-surface font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Africa/Cairo">توقيت القاهرة (Africa/Cairo - GMT+3)</option>
                    <option value="Asia/Riyadh">توقيت الرياض (Asia/Riyadh - GMT+3)</option>
                    <option value="Asia/Dubai">توقيت دبي (Asia/Dubai - GMT+4)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t-2 border-on-surface/10 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-interactive btn-shimmer px-6 py-3 rounded-full bg-primary text-on-primary border-2 border-on-surface font-bold text-sm hard-shadow-sm hover:bg-primary-container cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">save</span>
                      <span>حفظ إعدادات المتجر</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 1b: Channel Settings (WhatsApp, Instagram, Facebook) */}
        {activeTab === "channels" && (
          <div className="bg-surface-container-lowest border-2 border-on-surface rounded-2xl p-6 md:p-8 hard-shadow-sm space-y-6">
            <div className="border-b-2 border-on-surface/10 pb-4 flex items-center justify-between">
              <div>
                <h2 className="font-display-hero text-xl font-extrabold text-on-surface">إعدادات قنوات البيع (Channel Settings)</h2>
                <p className="font-body-md text-xs text-on-surface-variant">
                  ربط وتفعيل حسابات واتساب للأعمال، إنستجرام ماسنجر، وفيسبوك للمزامنة اللحظية
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-600 text-xs font-bold">
                مزامنة حية ⚡ LIVE SYNC
              </span>
            </div>

            <form onSubmit={handleSaveChannels} className="space-y-6">
              {/* 1. WhatsApp Channel */}
              <div className="p-5 rounded-2xl border-2 border-on-surface bg-surface space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 border-2 border-on-surface flex items-center justify-center font-bold text-xl hard-shadow-sm">
                      <span className="material-symbols-outlined">chat</span>
                    </span>
                    <div>
                      <div className="font-display-hero font-bold text-base text-on-surface">واتساب للأعمال الرسمي (WhatsApp Cloud API)</div>
                      <div className="text-xs text-on-surface-variant">الربط المباشر مع خوادم Meta الرسمية بدون أي أدوات غير مصرحة</div>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={channelForm.whatsapp_enabled}
                      onChange={(e) => setChannelForm({ ...channelForm, whatsapp_enabled: e.target.checked })}
                      className="w-5 h-5 rounded border-2 border-on-surface text-primary"
                    />
                    <span className="text-xs font-bold text-on-surface">تفعيل واتساب</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">رقم هاتف متجرك (WhatsApp Phone)</label>
                    <input
                      type="tel"
                      dir="ltr"
                      value={channelForm.whatsapp_phone}
                      onChange={(e) => setChannelForm({ ...channelForm, whatsapp_phone: e.target.value })}
                      placeholder="مثال: +201012345678"
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-on-surface bg-surface-container-lowest font-mono font-bold text-sm text-left"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">Phone Number ID (من Meta)</label>
                    <input
                      type="text"
                      dir="ltr"
                      value={channelForm.whatsapp_phone_number_id}
                      onChange={(e) => setChannelForm({ ...channelForm, whatsapp_phone_number_id: e.target.value })}
                      placeholder="مثال: 1240261785844530"
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-on-surface bg-surface-container-lowest font-mono font-bold text-xs text-left"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">WABA Account ID</label>
                    <input
                      type="text"
                      dir="ltr"
                      value={channelForm.whatsapp_waba_id}
                      onChange={(e) => setChannelForm({ ...channelForm, whatsapp_waba_id: e.target.value })}
                      placeholder="مثال: 1600277904832671"
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-on-surface bg-surface-container-lowest font-mono font-bold text-xs text-left"
                    />
                  </div>
                </div>

                {/* Webhook Connection Box */}
                <div className="p-4 rounded-xl border-2 border-on-surface/20 bg-surface-container-low space-y-3">
                  <div className="text-xs font-extrabold text-on-surface flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-primary">link</span>
                      بيانات الـ Webhook السحابية المنشورة على Supabase:
                    </span>
                    <a
                      href="https://developers.facebook.com/apps/1073045725476742/whatsapp-business/wa-configurations-v2/?business_id=505794150651828"
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline text-[11px]"
                    >
                      فتح صفحة Webhook في Meta ←
                    </a>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                    <div>
                      <div className="text-[11px] font-sans font-bold text-on-surface-variant mb-1">Callback URL (الرابط السحابي):</div>
                      <div className="flex items-center gap-1.5">
                        <input
                          readOnly
                          value="https://pslhhimiweiqzersnlvc.supabase.co/functions/v1/meta-webhook"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-on-surface/30 bg-surface text-[11px]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText("https://pslhhimiweiqzersnlvc.supabase.co/functions/v1/meta-webhook");
                            triggerSuccess("تم نسخ رابط Supabase Webhook!");
                          }}
                          className="px-2.5 py-1.5 rounded-lg border border-on-surface bg-surface text-xs font-bold cursor-pointer hover:bg-surface-container shrink-0"
                        >
                          نسخ
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] font-sans font-bold text-on-surface-variant mb-1">Verify Token:</div>
                      <div className="flex items-center gap-1.5">
                        <input
                          readOnly
                          value={channelForm.meta_webhook_verify_token}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-on-surface/30 bg-surface text-[11px]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(channelForm.meta_webhook_verify_token);
                            triggerSuccess("تم نسخ Verify Token!");
                          }}
                          className="px-2.5 py-1.5 rounded-lg border border-on-surface bg-surface text-xs font-bold cursor-pointer hover:bg-surface-container shrink-0"
                        >
                          نسخ
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    جاهز للفحص مع سيرفرات Meta Graph API v21.0
                  </span>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!channelForm.whatsapp_phone_number_id.trim()) {
                        setError("يرجى كتابة Phone Number ID لرقمك للتحقق منه مع Meta");
                        return;
                      }
                      try {
                        const res = await fetch("/api/meta/test-connection", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            phoneNumberId: channelForm.whatsapp_phone_number_id.trim(),
                          }),
                        });
                        const data = await res.json();
                        if (data.success && data.profile) {
                          triggerSuccess(`تم التحقق من رقم متجرك بنجاح! الرقم المعتمد: ${data.profile.display_phone_number || channelForm.whatsapp_phone} (${data.profile.verified_name || 'نشط'}) 🟢`);
                          setChannelForm(prev => ({
                            ...prev,
                            whatsapp_phone: data.profile.display_phone_number || prev.whatsapp_phone,
                            whatsapp_status: "connected",
                          }));
                        } else {
                          setError("فشل التحقق من الرقم: " + (data.error || "تأكد من أن Phone Number ID صحيح ومسجل في حساب Meta"));
                        }
                      } catch {
                        setError("تعذر الاتصال بالخادم للتحقق من الرقم");
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-xl border-2 border-on-surface bg-surface-container hover:bg-surface-container-high text-xs font-bold cursor-pointer hard-shadow-sm flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
                    التحقق من هذا الرقم المكتوب
                  </button>
                </div>

              </div>

              {/* 2. Instagram Channel */}
              <div className="p-5 rounded-2xl border-2 border-on-surface bg-surface space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white border-2 border-on-surface flex items-center justify-center font-bold text-xl hard-shadow-sm">
                      📸
                    </span>
                    <div>
                      <div className="font-display-hero font-bold text-base text-on-surface flex items-center gap-2">
                        إنستجرام (Instagram Direct & DMs)
                        {igStatus.connected ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-pink-100 text-pink-900 border border-pink-400">
                            <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span>
                            متصل LIVE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-surface-container text-on-surface-variant border border-on-surface/20">
                            غير متصل
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-on-surface-variant">الربط الرسمي المعتمد من Meta لاستقبال رسائل الدايركت والتعليقات تلقائياً</div>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={channelForm.instagram_enabled}
                      onChange={(e) => setChannelForm({ ...channelForm, instagram_enabled: e.target.checked })}
                      className="w-5 h-5 rounded border-2 border-on-surface text-primary"
                    />
                    <span className="text-xs font-bold text-on-surface">تفعيل القناة</span>
                  </label>
                </div>

                {igStatus.connected ? (
                  /* Connected State */
                  <div className="p-4 rounded-xl border-2 border-pink-400 bg-gradient-to-r from-purple-50/50 to-pink-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {igStatus.profilePic ? (
                        <img
                          src={igStatus.profilePic}
                          alt={igStatus.username}
                          className="w-12 h-12 rounded-xl object-cover border-2 border-pink-400 hard-shadow-sm shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center text-xl text-white border-2 border-pink-400 hard-shadow-sm shrink-0">
                          📸
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-display-hero font-extrabold text-sm text-on-surface">
                            @{igStatus.username}
                          </span>
                          <span className="text-[11px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-pink-300 text-pink-900">
                            ID: {igStatus.pageId || "Wasla-IG"}
                          </span>
                          {igStatus.webhookSubscribed && (
                            <span className="text-[11px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded border border-purple-300">
                              Webhook نشط ✔️
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-on-surface-variant mt-1">
                          الحساب متصل بنجاح مع تطبيق <span className="font-bold">Wasla-IG</span> (App ID: 1624922232609458)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <a
                        href="/dashboard/channels"
                        className="px-3.5 py-2 rounded-xl bg-surface border-2 border-on-surface font-bold text-xs hard-shadow-sm flex items-center gap-1.5 hover:bg-surface-container cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px] text-pink-600">forum</span>
                        صندوق الرسائل (Live Inbox)
                      </a>
                      <button
                        type="button"
                        onClick={handleDisconnectInstagram}
                        className="px-3 py-2 rounded-xl border-2 border-red-300 bg-red-50 text-red-700 font-bold text-xs hover:bg-red-100 cursor-pointer"
                      >
                        فصل الحساب
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Disconnected State */
                  <div className="p-5 rounded-xl border-2 border-dashed border-pink-300 bg-pink-50/40 space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <div className="font-bold text-sm text-on-surface">ربط حساب Instagram Business أو Creator</div>
                        <p className="text-xs text-on-surface-variant mt-1 max-w-lg leading-relaxed">
                          اضغط على الزر لفتح نافذة Meta الرسمية وتسجيل الدخول بحساب إنستجرام الخاص بمتجرك لمنح صلاحيات استقبال رسائل الدايركت (DMs) والرد الآلي.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleConnectInstagram}
                        disabled={igConnecting}
                        className="btn-interactive px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-2 border-on-surface font-extrabold text-xs hard-shadow-sm flex items-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
                      >
                        {igConnecting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>جاري فتح نافذة Meta...</span>
                          </>
                        ) : (
                          <>
                            <span className="text-base">📸</span>
                            <span>ربط حساب Instagram الآن (Meta OAuth)</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="text-[11px] text-on-surface-variant/80 border-t border-pink-200/60 pt-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[15px] text-pink-500">info</span>
                      <span>
                        المتطلبات: حساب Instagram احترافي (Business أو Creator) مرتبط بصفحة Facebook أو مسجل في تطبيق <strong>Wasla-IG (1624922232609458)</strong>.
                      </span>
                    </div>
                  </div>
                )}

                {/* Instagram Webhook Details Box */}
                <div className="p-4 rounded-xl border-2 border-on-surface/20 bg-surface-container-low space-y-3">
                  <div className="text-xs font-extrabold text-on-surface flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-pink-600">settings_ethernet</span>
                      بيانات Instagram Webhook في لوحة تحكم Meta:
                    </span>
                    <a
                      href="https://developers.facebook.com/apps/1073045725476742/instagram-business/webhook/?business_id=505794150651828"
                      target="_blank"
                      rel="noreferrer"
                      className="text-pink-600 hover:underline text-[11px] font-bold"
                    >
                      فتح صفحة Instagram Webhook في Meta ←
                    </a>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                    <div>
                      <div className="text-[11px] font-sans font-bold text-on-surface-variant mb-1">Callback URL:</div>
                      <div className="flex items-center gap-1.5">
                        <input
                          readOnly
                          value="https://pslhhimiweiqzersnlvc.supabase.co/functions/v1/meta-webhook"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-on-surface/30 bg-surface text-[11px]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText("https://pslhhimiweiqzersnlvc.supabase.co/functions/v1/meta-webhook");
                            triggerSuccess("تم نسخ رابط Instagram Webhook!");
                          }}
                          className="px-2.5 py-1.5 rounded-lg border border-on-surface bg-surface text-xs font-bold cursor-pointer hover:bg-surface-container shrink-0"
                        >
                          نسخ
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] font-sans font-bold text-on-surface-variant mb-1">Verify Token:</div>
                      <div className="flex items-center gap-1.5">
                        <input
                          readOnly
                          value="wasla_ig_webhook_token_2026"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-on-surface/30 bg-surface text-[11px]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText("wasla_ig_webhook_token_2026");
                            triggerSuccess("تم نسخ Verify Token الخاص بـ Instagram!");
                          }}
                          className="px-2.5 py-1.5 rounded-lg border border-on-surface bg-surface text-xs font-bold cursor-pointer hover:bg-surface-container shrink-0"
                        >
                          نسخ
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* OAuth Redirect URI configuration helper */}
                  <div className="pt-2 border-t border-on-surface/10">
                    <div className="text-[11px] font-sans font-bold text-pink-700 mb-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">link</span>
                      رابط إعادة التوجيه (Valid OAuth Redirect URI) — ضروري لحل خطأ Invalid redirect_uri:
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        readOnly
                        value="https://pslhhimiweiqzersnlvc.supabase.co/functions/v1/meta-webhook"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-pink-400/50 bg-pink-50/50 font-mono text-[11px] text-pink-950 font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText("https://pslhhimiweiqzersnlvc.supabase.co/functions/v1/meta-webhook");
                          triggerSuccess("تم نسخ رابط OAuth Redirect URI بنجاح!");
                        }}
                        className="px-3 py-1.5 rounded-lg border border-on-surface bg-pink-600 text-white text-xs font-bold cursor-pointer hover:bg-pink-700 shrink-0"
                      >
                        نسخ الرابط
                      </button>
                    </div>
                    <p className="text-[11px] text-on-surface-variant mt-1.5 leading-relaxed">
                      ⚠️ هذا الرابط السحابي المعتمد من Supabase صالح ومقبول 100% في Meta لكافة الحقول (OAuth Redirect URIs و Deauthorize و Data deletion).
                    </p>
                  </div>
                </div>
              </div>


              {/* 3. Facebook Messenger Channel */}
              <div className="p-5 rounded-2xl border-2 border-on-surface bg-surface space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 border-2 border-on-surface flex items-center justify-center font-bold text-xl hard-shadow-sm">
                      <span className="material-symbols-outlined">forum</span>
                    </span>
                    <div>
                      <div className="font-display-hero font-bold text-base text-on-surface">فيسبوك ماسنجر (Facebook Page Messenger)</div>
                      <div className="text-xs text-on-surface-variant">استقبال وتأكيد طلبات الشراء الواردة من صفحة الفيسبوك وإعلاناتك</div>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={channelForm.facebook_enabled}
                      onChange={(e) => setChannelForm({ ...channelForm, facebook_enabled: e.target.checked })}
                      className="w-5 h-5 rounded border-2 border-on-surface text-primary"
                    />
                    <span className="text-xs font-bold text-on-surface">تفعيل فيسبوك</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">اسم الصفحة المتصلة (Page Name)</label>
                    <input
                      type="text"
                      value={channelForm.facebook_page_name}
                      onChange={(e) => setChannelForm({ ...channelForm, facebook_page_name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-on-surface bg-surface-container-lowest font-bold text-sm"
                    />
                  </div>

                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-on-surface/30 bg-surface-container/50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={channelForm.facebook_messenger_sync}
                        onChange={(e) => setChannelForm({ ...channelForm, facebook_messenger_sync: e.target.checked })}
                        className="w-4 h-4 rounded border-2 border-on-surface text-primary"
                      />
                      <span className="text-xs font-bold text-on-surface">مزامنة محادثات ماسنجر في لوحة التحكم</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t-2 border-on-surface/10 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-interactive btn-shimmer px-6 py-3 rounded-full bg-primary text-on-primary border-2 border-on-surface font-bold text-sm hard-shadow-sm hover:bg-primary-container cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                      <span>جاري حفظ القنوات...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">hub</span>
                      <span>حفظ ومزامنة قنوات البيع</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: Shipping Integrations */}
        {activeTab === "shipping" && (
          <div className="bg-surface-container-lowest border-2 border-on-surface rounded-2xl p-6 md:p-8 hard-shadow-sm space-y-6">
            <div className="border-b-2 border-on-surface/10 pb-4">
              <h2 className="font-display-hero text-xl font-extrabold text-on-surface">ربط شركات الشحن (بوسطة وأرامكس)</h2>
              <p className="font-body-md text-xs text-on-surface-variant">
                يتم حفظ هذه البيانات تلقائياً في جدول store_settings لاستخراج البوالص بضغطة زر واحدة
              </p>
            </div>

            <form onSubmit={handleSaveShipping} className="space-y-6">
              {/* Default Provider */}
              <div>
                <label className="block text-sm font-bold text-on-surface mb-2">شركة الشحن الافتراضية للطلبات الواردة</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
                  <label
                    className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      shippingForm.default_provider === "bosta"
                        ? "bg-primary text-on-primary border-on-surface hard-shadow-sm font-bold"
                        : "bg-surface text-on-surface border-on-surface/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="default_provider"
                      value="bosta"
                      checked={shippingForm.default_provider === "bosta"}
                      onChange={() => setShippingForm({ ...shippingForm, default_provider: "bosta" })}
                      className="w-4 h-4 text-primary"
                    />
                    <span>بوسطة (Bosta) - توصيل محلي سريع</span>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      shippingForm.default_provider === "aramex"
                        ? "bg-primary text-on-primary border-on-surface hard-shadow-sm font-bold"
                        : "bg-surface text-on-surface border-on-surface/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="default_provider"
                      value="aramex"
                      checked={shippingForm.default_provider === "aramex"}
                      onChange={() => setShippingForm({ ...shippingForm, default_provider: "aramex" })}
                      className="w-4 h-4 text-primary"
                    />
                    <span>أرامكس (Aramex) - محلي وإقليمي</span>
                  </label>
                </div>
              </div>

              {/* Bosta Section */}
              <div className="p-5 rounded-xl border-2 border-on-surface bg-surface space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-red-100 text-red-700 font-extrabold text-sm flex items-center justify-center border border-on-surface">
                      B
                    </span>
                    <span className="font-extrabold text-base text-on-surface">إعدادات ربط بوسطة (Bosta)</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={shippingForm.bosta_enabled}
                      onChange={(e) => setShippingForm({ ...shippingForm, bosta_enabled: e.target.checked })}
                      className="w-5 h-5 rounded border-2 border-on-surface text-primary"
                    />
                    <span className="text-xs font-bold text-on-surface">تفعيل الشحن عبر بوسطة</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">مفتاح الربط (Bosta API Key)</label>
                    <input
                      type="password"
                      value={shippingForm.bosta_api_key}
                      onChange={(e) => setShippingForm({ ...shippingForm, bosta_api_key: e.target.value })}
                      placeholder="e.g. bosta_live_sk_..."
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-on-surface bg-surface-container-lowest font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">مدينة الاستلام الافتراضية لشحناتك</label>
                    <input
                      type="text"
                      value={shippingForm.bosta_pickup_city}
                      onChange={(e) => setShippingForm({ ...shippingForm, bosta_pickup_city: e.target.value })}
                      placeholder="القاهرة، الجيزة، الإسكندرية..."
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-on-surface bg-surface-container-lowest text-sm font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Aramex Section */}
              <div className="p-5 rounded-xl border-2 border-on-surface bg-surface space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 font-extrabold text-sm flex items-center justify-center border border-on-surface">
                      A
                    </span>
                    <span className="font-extrabold text-base text-on-surface">إعدادات ربط أرامكس (Aramex)</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={shippingForm.aramex_enabled}
                      onChange={(e) => setShippingForm({ ...shippingForm, aramex_enabled: e.target.checked })}
                      className="w-5 h-5 rounded border-2 border-on-surface text-primary"
                    />
                    <span className="text-xs font-bold text-on-surface">تفعيل الشحن عبر أرامكس</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">رقم الحساب (Aramex Account Number)</label>
                    <input
                      type="text"
                      value={shippingForm.aramex_account}
                      onChange={(e) => setShippingForm({ ...shippingForm, aramex_account: e.target.value })}
                      placeholder="e.g. 1029384"
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-on-surface bg-surface-container-lowest font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">الرمز السري للجهة (Entity Pin)</label>
                    <input
                      type="password"
                      value={shippingForm.aramex_pin}
                      onChange={(e) => setShippingForm({ ...shippingForm, aramex_pin: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-on-surface bg-surface-container-lowest text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t-2 border-on-surface/10 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-interactive btn-shimmer px-6 py-3 rounded-full bg-primary text-on-primary border-2 border-on-surface font-bold text-sm hard-shadow-sm hover:bg-primary-container cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                      <span>جاري حفظ إعدادات الشحن...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                      <span>حفظ إعدادات الشحن في قاعدة البيانات</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: AI & Automation */}
        {activeTab === "ai" && (
          <div className="bg-surface-container-lowest border-2 border-on-surface rounded-2xl p-6 md:p-8 hard-shadow-sm space-y-6">
            <div className="border-b-2 border-on-surface/10 pb-4">
              <h2 className="font-display-hero text-xl font-extrabold text-on-surface">إعدادات المساعد الذكي وروبوت المبيعات</h2>
              <p className="font-body-md text-xs text-on-surface-variant">
                تخصيص ردود وِصلة الذكية لتناسب هوية علامتك التجارية مع عملائك على واتساب وإنستجرام
              </p>
            </div>

            <form onSubmit={handleSaveAI} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-on-surface mb-2">رسالة الترحيب الأولى للعميل</label>
                <textarea
                  rows={3}
                  value={aiForm.welcome_message}
                  onChange={(e) => setAiForm({ ...aiForm, welcome_message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-on-surface bg-surface text-on-surface font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-on-surface mb-2">نبرة الحديث وشخصية الروبوت (Persona)</label>
                  <select
                    value={aiForm.persona}
                    onChange={(e) => setAiForm({ ...aiForm, persona: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-on-surface bg-surface text-on-surface font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="friendly">ودود وعفوي (لهجة مصرية ترحيبية وإيموجي) 😊</option>
                    <option value="professional">رسمي واحترافي (مباشر ومتقن) 💼</option>
                    <option value="fast">مختصر وسريع (إنهاء الطلب بأقل كلمات) ⚡</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-on-surface mb-2">
                    الحد الأقصى للخصم المسموح للذكاء الاصطناعي تقديمه للعميل المتردد
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={aiForm.max_discount}
                      onChange={(e) => setAiForm({ ...aiForm, max_discount: Number(e.target.value) || 0 })}
                      className="w-24 px-4 py-3 rounded-xl border-2 border-on-surface bg-surface text-on-surface font-bold text-center"
                      min="0"
                      max="50"
                    />
                    <span className="font-bold text-on-surface text-sm">% من قيمة السلة</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border-2 border-on-surface bg-surface flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-on-surface">التأكيد التلقائي للطلبات المكتملة</div>
                  <div className="text-xs text-on-surface-variant mt-0.5">
                    يقوم الروبوت بإنشاء بوليصة شحن فورية بمجرد تأكيد العميل لعنوانه ورقم هاتفه.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={aiForm.auto_confirm_orders}
                  onChange={(e) => setAiForm({ ...aiForm, auto_confirm_orders: e.target.checked })}
                  className="w-5 h-5 rounded border-2 border-on-surface text-primary cursor-pointer"
                />
              </div>

              <div className="pt-4 border-t-2 border-on-surface/10 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-interactive btn-shimmer px-6 py-3 rounded-full bg-primary text-on-primary border-2 border-on-surface font-bold text-sm hard-shadow-sm hover:bg-primary-container cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                      <span>حفظ إعدادات المساعد الذكي</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 4: Staff & Team */}
        {activeTab === "staff" && (
          <div className="bg-surface-container-lowest border-2 border-on-surface rounded-2xl p-6 md:p-8 hard-shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b-2 border-on-surface/10 pb-4">
              <div>
                <h2 className="font-display-hero text-xl font-extrabold text-on-surface">فريق العمل والموظفين</h2>
                <p className="font-body-md text-xs text-on-surface-variant">
                  إدارة المشرفين وممثلي خدمة العملاء المصرح لهم بمتابعة الشحنات والردود
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAddingStaff(!addingStaff)}
                className="btn-interactive px-4 py-2 rounded-full bg-primary text-on-primary border-2 border-on-surface font-bold text-xs hard-shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>إضافة موظف جديد</span>
              </button>
            </div>

            {/* Add Staff Form */}
            {addingStaff && (
              <form onSubmit={handleAddStaff} className="p-5 rounded-xl border-2 border-primary bg-surface space-y-4">
                <div className="font-bold text-sm text-on-surface">بيانات الموظف الجديد:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">الاسم الكامل</label>
                    <input
                      type="text"
                      value={newStaff.name}
                      onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                      placeholder="أحمد محمد"
                      className="w-full px-3 py-2 rounded-lg border-2 border-on-surface bg-surface-container-lowest text-xs font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">البريد الإلكتروني</label>
                    <input
                      type="email"
                      value={newStaff.email}
                      onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                      placeholder="ahmed@example.com"
                      className="w-full px-3 py-2 rounded-lg border-2 border-on-surface bg-surface-container-lowest text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">رقم الهاتف</label>
                    <input
                      type="tel"
                      value={newStaff.phone}
                      onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                      placeholder="01012345678"
                      className="w-full px-3 py-2 rounded-lg border-2 border-on-surface bg-surface-container-lowest text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">الدور والصلاحية</label>
                    <select
                      value={newStaff.role}
                      onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border-2 border-on-surface bg-surface-container-lowest text-xs font-bold"
                    >
                      <option value="admin">مدير متجر (كامل الصلاحيات)</option>
                      <option value="manager">مشرف عمليات وشحن</option>
                      <option value="staff">خدمة عملاء وردود</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setAddingStaff(false)}
                    className="px-4 py-2 rounded-full border-2 border-on-surface bg-surface text-xs font-bold hover:bg-surface-container cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-interactive px-5 py-2 rounded-full bg-primary text-on-primary border-2 border-on-surface text-xs font-bold hard-shadow-sm cursor-pointer"
                  >
                    {saving ? "جاري الإضافة..." : "حفظ الموظف"}
                  </button>
                </div>
              </form>
            )}

            {/* Staff Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-start border-collapse text-sm">
                <thead>
                  <tr className="border-b-2 border-on-surface text-xs font-extrabold text-on-surface-variant uppercase">
                    <th className="py-3 px-3 text-start">الاسم</th>
                    <th className="py-3 px-3 text-start">البريد الإلكتروني</th>
                    <th className="py-3 px-3 text-start">الهاتف</th>
                    <th className="py-3 px-3 text-start">الدور</th>
                    <th className="py-3 px-3 text-start">الحالة</th>
                    <th className="py-3 px-3 text-end">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-on-surface/10">
                  {staffList.map((m) => (
                    <tr key={m.id} className="hover:bg-surface-container/50 transition-colors">
                      <td className="py-3 px-3 font-bold text-on-surface">{m.name}</td>
                      <td className="py-3 px-3 font-mono text-xs text-on-surface-variant">{m.email}</td>
                      <td className="py-3 px-3 font-mono text-xs">{m.phone || "—"}</td>
                      <td className="py-3 px-3">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold border border-on-surface bg-surface-container">
                          {m.role === "admin" ? "مدير" : m.role === "manager" ? "مشرف" : "خدمة عملاء"}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          نشط
                        </span>
                      </td>
                      <td className="py-3 px-3 text-end">
                        <button
                          onClick={() => handleDeleteStaff(m.id)}
                          className="text-error hover:bg-error-container/30 p-1.5 rounded-lg transition-colors cursor-pointer"
                          title="حذف الموظف"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}

                  {staffList.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-on-surface-variant">
                        لا يوجد موظفون مضافون بعد. يمكنك إضافة أعضاء فريقك لمساعدتك في المبيعات والشحن.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}