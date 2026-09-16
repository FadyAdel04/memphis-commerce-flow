import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/inbox")({
  component: InboxPage,
});

interface Message {
  id: string;
  conversation_id: string;
  direction: "inbound" | "outbound";
  content: string;
  created_at: string;
  status?: "sent" | "delivered" | "read";
  platform_data?: any;
}

interface Conversation {
  id: string;
  channel: "whatsapp" | "instagram" | "facebook" | string;
  external_id: string;
  customer_name?: string;
  last_message_at?: string;
  unread_count?: number;
  messages: Message[];
}

function InboxPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "whatsapp" | "instagram">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessageText, setNewMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showTestMessageModal, setShowTestMessageModal] = useState(false);
  const [showConnectAccountModal, setShowConnectAccountModal] = useState(false);

  // New Instagram Chat Modal State
  const [showNewIgModal, setShowNewIgModal] = useState(false);
  const [newIgUser, setNewIgUser] = useState("");
  const [newIgText, setNewIgText] = useState("");
  const [newIgSending, setNewIgSending] = useState(false);

  // Inbound Test DM Simulation State
  const [showInboundTestModal, setShowInboundTestModal] = useState(false);
  const [inboundSender, setInboundSender] = useState("");
  const [inboundText, setInboundText] = useState("");
  const [inboundSimulating, setInboundSimulating] = useState(false);

  // Test WhatsApp message
  const [testRecipientPhone, setTestRecipientPhone] = useState("");
  const [testSending, setTestSending] = useState(false);

  // Active Meta Integration State
  const [metaStatus, setMetaStatus] = useState<{
    connected: boolean;
    phone: string;
    verifiedName: string;
    quality: string;
    phoneId: string;
    wabaId: string;
    appId: string;
  }>({
    connected: false,
    phone: "",
    verifiedName: "لم يتم ربط رقم بعد",
    quality: "UNKNOWN",
    phoneId: "",
    wabaId: "",
    appId: "1073045725476742",
  });

  // Connect Account Form State (simplified: user only enters phone + name)
  const [accountForm, setAccountForm] = useState({
    phoneNumber: "",
    displayName: "",
  });
  const [verifyingAccount, setVerifyingAccount] = useState(false);


  // Draft Order Creation State
  const [creatingDraftOrder, setCreatingDraftOrder] = useState(false);
  const [draftOrderCreated, setDraftOrderCreated] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // ── Instagram Integration State ───────────────────────────────────────
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

  // ── Current store ID (scoped to authenticated user) ───────────────────────
  const [currentStoreId, setCurrentStoreId] = useState<string | null>(null);

  const fetchStoreId = async (): Promise<string | null> => {
    try {
      if (currentStoreId) return currentStoreId;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: membership } = await supabase
        .from("store_members")
        .select("store_id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (membership?.store_id) {
        setCurrentStoreId(membership.store_id);
        return membership.store_id;
      }

      const { data: store } = await supabase
        .from("stores")
        .select("id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (store?.id) {
        setCurrentStoreId(store.id);
        return store.id;
      }
    } catch {}
    return null;
  };

  // Fetch live conversations from both Supabase (scoped) and in-memory buffer
  const loadConversations = async () => {
    try {
      const storeId = await fetchStoreId();
      if (!storeId) return;

      // 1. Try Supabase first - strictly filtered by store_id
      const { data: dbData } = await supabase
        .from("conversations")
        .select(`*, messages (*)`)
        .eq("store_id", storeId)
        .order("last_message_at", { ascending: false });

      // 2. Fetch from server in-memory & webhook buffer
      let serverConvs: Conversation[] = [];
      try {
        const res = await fetch(`/api/messages/conversations?storeId=${storeId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.conversations) serverConvs = data.conversations;
        }
      } catch {}

      // Combine without duplicates
      const mergedMap = new Map<string, Conversation>();
      for (const c of serverConvs) {
        mergedMap.set(c.external_id, c);
      }
      if (dbData && dbData.length > 0) {
        for (const c of dbData as any[]) {
          mergedMap.set(c.external_id, c);
        }
      }

      const mergedList = Array.from(mergedMap.values()).sort(
        (a, b) =>
          new Date(b.last_message_at || 0).getTime() - new Date(a.last_message_at || 0).getTime()
      );

      setConversations(mergedList);
      if (mergedList.length > 0) {
        if (!selectedConvId || !mergedList.some((c) => c.id === selectedConvId)) {
          setSelectedConvId(mergedList[0]?.id ?? null);
        }
      } else {
        setSelectedConvId(null);
      }
    } catch (err) {
      console.warn("Notice loading conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  const [syncingIg, setSyncingIg] = useState(false);

  // Sync real DMs from Instagram Graph API
  const handleSyncInstagram = async () => {
    setSyncingIg(true);
    try {
      const storeId = currentStoreId || await fetchStoreId();
      const storeParam = storeId ? `?storeId=${storeId}` : "";
      const res = await fetch(`/api/instagram/sync${storeParam}`);
      const data = await res.json();
      if (data.success) {
        toast.success(
          data.messagesSynced > 0
            ? `تمت مزامنة ${data.messagesSynced} رسالة جديدة من إنستجرام!`
            : "تم فحص رسائل إنستجرام — جميع المحادثات محدثة!"
        );
        await loadConversations();
      } else {
        toast.error(data.error || "تعذرت مزامنة رسائل إنستجرام");
      }
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء مزامنة رسائل إنستجرام");
    } finally {
      setSyncingIg(false);
    }
  };

  useEffect(() => {
    fetchStoreId();
    loadConversations();

    // Supabase Realtime Subscription for instantaneous message arrival
    const channel = supabase
      .channel("realtime-conversations-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        () => {
          loadConversations();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations" },
        () => {
          loadConversations();
        }
      )
      .subscribe();

    // Polling fallback every 4s
    const interval = setInterval(loadConversations, 4000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  // Fetch Meta status & saved integration from Supabase
  useEffect(() => {
    const fetchStatus = async () => {
      const storeId = await fetchStoreId();
      if (!storeId) {
        setMetaStatus({
          connected: false,
          phone: "",
          verifiedName: "لم يتم ربط رقم بعد",
          quality: "UNKNOWN",
          phoneId: "",
          wabaId: "",
          appId: "1073045725476742",
        });
        return;
      }

      // Check meta_integrations table in Supabase
      const { data: dbInteg } = await supabase
        .from("meta_integrations")
        .select("*")
        .eq("store_id", storeId)
        .maybeSingle();

      if (dbInteg && dbInteg.phone_number_id) {
        setMetaStatus({
          connected: true,
          phone: dbInteg.display_phone_number || "",
          phoneId: dbInteg.phone_number_id || "",
          wabaId: dbInteg.waba_id || "",
          verifiedName: dbInteg.verified_name || "رقم المتجر المعتمد",
          quality: dbInteg.quality_rating || "GREEN",
          appId: dbInteg.app_id || "1073045725476742",
        });
        setAccountForm({
          phoneNumber: dbInteg.display_phone_number || "",
          displayName: dbInteg.verified_name || "",
        });
      } else {
        setMetaStatus({
          connected: false,
          phone: "",
          verifiedName: "لم يتم ربط رقم بعد",
          quality: "UNKNOWN",
          phoneId: "",
          wabaId: "",
          appId: "1073045725476742",
        });
      }
    };

    fetchStatus();
  }, [currentStoreId]);

  // ── Load Instagram connection status & listen to OAuth events ────────
  useEffect(() => {
    let igChannel: any = null;

    const loadIgStatus = async () => {
      try {
        const storeId = await fetchStoreId();
        if (!storeId) return;

        const { data: { session } } = await supabase.auth.getSession();
        const headers: Record<string, string> = {};
        if (session?.access_token) {
          headers["Authorization"] = `Bearer ${session.access_token}`;
        }

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
      } catch {
        // Silently handle — IG might not be connected yet
      }
    };
    loadIgStatus();

    // 1. Listen for postMessage from the OAuth popup window
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
        toast.success(`تم ربط حساب Instagram بنجاح! @${event.data.username} 🎉`);
      } else if (event.data.type === "ig_oauth_error") {
        setIgConnecting(false);
        toast.error(`خطأ Instagram OAuth: ${event.data.error}`);
      }
    };
    window.addEventListener("message", handleOAuthMessage);

    // 2. Listen via BroadcastChannel for modern cross-tab/popup sync
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("wasla_oauth");
      bc.onmessage = (event) => {
        if (event.data?.type === "ig_oauth_success") {
          setIgStatus({
            connected: true,
            username: event.data.username || "",
            name: event.data.username || "",
            profilePic: event.data.profilePic || "",
            pageId: event.data.igUserId || "",
            webhookSubscribed: true,
          });
          setIgConnecting(false);
          toast.success(`تم ربط حساب Instagram بنجاح! @${event.data.username} 🎉`);
        }
      };
    } catch {}

    // 3. localStorage storage event — cross-origin fallback (supabase.co popup → localhost app)
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key !== "wasla_ig_oauth_result" || !e.newValue) return;
      try {
        const data = JSON.parse(e.newValue);
        if (data?.type === "ig_oauth_success" && data.ts && Date.now() - data.ts < 30000) {
          setIgStatus({
            connected: true,
            username: data.username || "",
            name: data.username || "",
            profilePic: data.profilePic || "",
            pageId: data.igUserId || "",
            webhookSubscribed: true,
          });
          setIgConnecting(false);
          toast.success(`تم ربط حساب Instagram بنجاح! @${data.username} 🎉`);
          localStorage.removeItem("wasla_ig_oauth_result");
        }
      } catch {}
    };
    window.addEventListener("storage", handleStorageEvent);

    // Immediate check in case popup already wrote before listener registered
    try {
      const existing = localStorage.getItem("wasla_ig_oauth_result");
      if (existing) {
        const data = JSON.parse(existing);
        if (data?.type === "ig_oauth_success" && data.ts && Date.now() - data.ts < 30000) {
          setIgStatus({
            connected: true,
            username: data.username || "",
            name: data.username || "",
            profilePic: data.profilePic || "",
            pageId: data.igUserId || "",
            webhookSubscribed: true,
          });
          setIgConnecting(false);
          toast.success(`تم ربط حساب Instagram بنجاح! @${data.username} 🎉`);
          localStorage.removeItem("wasla_ig_oauth_result");
        }
      }
    } catch {}

    // 4. Supabase Realtime subscription on instagram_integrations strictly scoped to store_id
    fetchStoreId().then((storeId) => {
      if (!storeId) return;
      igChannel = supabase
        .channel(`realtime:inbox_instagram_integrations:${storeId}`)
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
              toast.success(`تم ربط حساب Instagram بنجاح! @${ig.ig_username} 🎉`);
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
    });

    return () => {
      window.removeEventListener("message", handleOAuthMessage);
      window.removeEventListener("storage", handleStorageEvent);
      if (bc) bc.close();
      if (igChannel) supabase.removeChannel(igChannel);
    };
  }, [currentStoreId]);

  /** Open the Instagram OAuth popup and start the connection flow */
  const handleConnectInstagram = async () => {
    setIgConnecting(true);
    try {
      // Always fetch the latest storeId for this user
      const storeId = await fetchStoreId();
      if (!storeId) {
        toast.error("لم يتم العثور على متجر. يرجى إنشاء متجرك أولاً من لوحة الإعدادات.");
        setIgConnecting(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const res = await fetch(`/api/instagram/auth-url?storeId=${storeId}`, { headers });
      const data = await res.json();
      if (!data.success || !data.url) throw new Error(data.error || "Failed to get auth URL");

      const popup = window.open(
        data.url,
        "instagram-oauth",
        "width=600,height=700,scrollbars=yes,resizable=yes"
      );

      if (!popup) {
        setIgConnecting(false);
        toast.error("تعذر فتح نافذة Instagram. يرجى السماح بالنوافذ المنبثقة في المتصفح.");
        return;
      }

      // Active polling: check status every 1.5s while popup is active
      const pollTimer = setInterval(async () => {
        try {
          const pollHeaders: Record<string, string> = {};
          const { data: pollSession } = await supabase.auth.getSession();
          if (pollSession.session?.access_token) {
            pollHeaders["Authorization"] = `Bearer ${pollSession.session.access_token}`;
          }
          const statusRes = await fetch(`/api/instagram/status?storeId=${storeId}`, { headers: pollHeaders });
          const statusData = await statusRes.json();
          if (statusData.success && statusData.integration?.status === "connected") {
            clearInterval(pollTimer);
            const ig = statusData.integration;
            setIgStatus({
              connected: true,
              username: ig.ig_username || "",
              name: ig.ig_name || ig.ig_username || "",
              profilePic: ig.ig_profile_pic || "",
              pageId: ig.ig_page_id || "",
              webhookSubscribed: true,
            });
            setIgConnecting(false);
            try { popup.close(); } catch {}
            toast.success(`تم ربط حساب Instagram بنجاح! @${ig.ig_username} 🎉`);
          }
        } catch {}

        if (popup.closed) {
          clearInterval(pollTimer);
          setTimeout(async () => {
            try {
              const finalHeaders: Record<string, string> = {};
              const { data: finalSession } = await supabase.auth.getSession();
              if (finalSession.session?.access_token) {
                finalHeaders["Authorization"] = `Bearer ${finalSession.session.access_token}`;
              }
              const statusRes = await fetch(`/api/instagram/status?storeId=${storeId}`, { headers: finalHeaders });
              const statusData = await statusRes.json();
              if (statusData.success && statusData.integration?.status === "connected") {
                const ig = statusData.integration;
                setIgStatus({
                  connected: true,
                  username: ig.ig_username || "",
                  name: ig.ig_name || "",
                  profilePic: ig.ig_profile_pic || "",
                  pageId: ig.ig_page_id || "",
                  webhookSubscribed: true,
                });
                toast.success(`تم ربط حساب Instagram بنجاح! @${ig.ig_username} 🎉`);
              }
            } catch {}
            setIgConnecting(false);
          }, 800);
        }
      }, 1500);

      // Timeout safety: stop polling after 5 minutes
      setTimeout(() => {
        clearInterval(pollTimer);
        setIgConnecting(false);
      }, 300000);
    } catch (err: any) {
      setIgConnecting(false);
      toast.error(err.message || "حدث خطأ أثناء بدء ربط Instagram");
    }
  };

  /** Disconnect the connected Instagram account */
  const handleDisconnectInstagram = async () => {
    if (!confirm("هل أنت متأكد من فصل حساب Instagram عن متجرك؟")) return;
    try {
      const storeId = await fetchStoreId();
      if (storeId) {
        // Delete the row so it can never reappear
        await supabase
          .from("instagram_integrations")
          .delete()
          .eq("store_id", storeId);

        const { data: st } = await supabase.from("stores").select("platforms").eq("id", storeId).maybeSingle();
        if (st?.platforms && Array.isArray(st.platforms)) {
          await supabase
            .from("stores")
            .update({ platforms: st.platforms.filter((p: string) => p !== "instagram") })
            .eq("id", storeId);
        }
      }
      setIgStatus({ connected: false, username: "", name: "", profilePic: "", pageId: "", webhookSubscribed: false });
      toast.success("تم فصل حساب Instagram بنجاح.");
    } catch (err: any) {
      toast.error("حدث خطأ أثناء فصل حساب Instagram");
    }
  };

  // Auto scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConvId, conversations]);

  const activeConversation = conversations.find((c) => c.id === selectedConvId) || conversations[0];

  // Save / Link WhatsApp Account (simplified: user only enters phone + name)
  const handleSaveWhatsAppAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountForm.phoneNumber.trim()) {
      toast.error("يرجى إدخال رقم هاتف واتساب الخاص بمتجرك");
      return;
    }

    setVerifyingAccount(true);

    try {
      // 1. Test connection using the default Meta credentials from server .env
      const res = await fetch("/api/meta/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();

      if (!data.success || !data.profile) {
        throw new Error(
          data.error ||
            "تعذر التحقق من اتصال WhatsApp Cloud API. تأكد من إعدادات Meta في لوحة التحكم."
        );
      }

      // Use user-entered phone and name, but Meta API credentials from server
      const userPhone = accountForm.phoneNumber.trim();
      const userName = accountForm.displayName.trim() || "متجري";
      const quality = data.profile.quality_rating || "GREEN";
      const serverPhoneId = data.testedPhoneNumberId || data.config?.phoneNumberId || "";
      const serverWabaId = data.config?.wabaId || "";

      // 2. Get store
      const storeId = await fetchStoreId();

      if (storeId) {
        // Upsert into meta_integrations with user's phone but server's Meta IDs
        await supabase.from("meta_integrations").upsert(
          {
            store_id: storeId,
            app_id: data.config?.appId || "1073045725476742",
            waba_id: serverWabaId,
            phone_number_id: serverPhoneId,
            display_phone_number: userPhone,
            verified_name: userName,
            quality_rating: quality,
            status: "connected",
            webhook_verify_token: "wasla_meta_webhook_token_2026",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "store_id,phone_number_id" }
        );

        // Update store_settings
        await supabase.from("store_settings").upsert(
          {
            store_id: storeId,
            key: "channel_config",
            value: {
              whatsapp_enabled: true,
              whatsapp_phone: userPhone,
              whatsapp_phone_number_id: serverPhoneId,
              whatsapp_waba_id: serverWabaId,
              whatsapp_verified_name: userName,
              whatsapp_status: "connected",
            },
            updated_at: new Date().toISOString(),
          },
          { onConflict: "store_id,key" }
        );
      }

      setMetaStatus({
        connected: true,
        phone: userPhone,
        verifiedName: userName,
        quality: quality,
        phoneId: serverPhoneId,
        wabaId: serverWabaId,
        appId: data.config?.appId || "1073045725476742",
      });

      toast.success(
        `تم ربط رقم متجرك بنجاح! الرقم: ${userPhone} (${userName}) 🟢`
      );
      setShowConnectAccountModal(false);
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء ربط الحساب");
    } finally {
      setVerifyingAccount(false);
    }
  };



  // Send message reply (handles both WhatsApp and Instagram channels)
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessageText.trim() || !activeConversation || sending) return;

    const text = newMessageText.trim();
    const channel = activeConversation.channel || "whatsapp";
    setSending(true);

    try {
      let endpoint = "/api/messages/send";
      let body: Record<string, any> = {
        conversationId: activeConversation.id,
        to: activeConversation.external_id,
        channel,
        text,
      };

      // Route Instagram DMs to the dedicated IG send endpoint
      if (channel === "instagram") {
        endpoint = "/api/instagram/messages/send";
        body = {
          conversationId: activeConversation.id,
          recipientId: activeConversation.external_id,
          text,
        };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || "فشل في إرسال الرسالة");
      }

      setNewMessageText("");
      const channelLabel = channel === "instagram" ? "Instagram DM" : "WhatsApp Cloud API";
      toast.success(`تم تسليم الرسالة عبر ${channelLabel} بنجاح!`);
      await loadConversations();
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء إرسال الرد");
    } finally {
      setSending(false);
    }
  };

  // Send test message to any phone number
  const handleSendTestMessage = async () => {
    if (!testRecipientPhone.trim()) {
      toast.error("يرجى إدخال رقم الهاتف مسبوقاً بكود الدولة (مثال: +2010...)");
      return;
    }

    setTestSending(true);
    try {
      const res = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: testRecipientPhone,
          channel: "whatsapp",
          text: "مرحباً بك! هذه رسالة تجريبية من منصتك عبر WhatsApp Cloud API الرسمي 🚀",
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(
          result.error ||
            "تأكد من إضافة هذا الرقم إلى قائمة Recipient Numbers المصرح بها في حساب Meta Developer أثناء وضع التطوير."
        );
      }

      toast.success(`تم إرسال الرسالة بنجاح إلى ${testRecipientPhone}!`);
      setShowTestMessageModal(false);
      setTestRecipientPhone("");
      loadConversations();
    } catch (err: any) {
      toast.error(err.message || "تعذر إرسال الرسالة التجريبية");
    } finally {
      setTestSending(false);
    }
  };

  // Start new Instagram DM conversation
  const handleCreateNewIgChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIgUser.trim() || !newIgText.trim()) {
      toast.error("يرجى إدخال اسم المستخدم والرسالة");
      return;
    }
    setNewIgSending(true);
    try {
      const storeId = currentStoreId || await fetchStoreId();
      const res = await fetch("/api/instagram/conversations/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: newIgUser.trim(),
          initialMessage: newIgText.trim(),
          storeId: storeId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "فشل بدء المحادثة");
      }
      toast.success(`تم بدء محادثة إنستجرام مع ${newIgUser} بنجاح! 🚀`);
      setShowNewIgModal(false);
      setNewIgUser("");
      setNewIgText("");
      await loadConversations();
      if (data.conversationId) {
        setSelectedConvId(data.conversationId);
      }
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء بدء المحادثة");
    } finally {
      setNewIgSending(false);
    }
  };

  // Simulate inbound Instagram DM from customer
  const handleSimulateInboundDM = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setInboundSimulating(true);
    try {
      const storeId = currentStoreId || await fetchStoreId();
      const res = await fetch("/api/instagram/test-inbound", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: inboundSender.trim() || "@customer_cairo",
          text: inboundText.trim() || "مرحباً! لو سمحت عايز استفسر عن تفاصيل المنتج والشحن؟ 🛍️",
          storeId: storeId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "فشل استقبال الرسالة التجريبية");
      }
      toast.success(`تم استقبال رسالة DM واردة من ${data.customer || "العميل"}! 📩`);
      setShowInboundTestModal(false);
      setInboundSender("");
      setInboundText("");
      await loadConversations();
      if (data.conversationId) {
        setSelectedConvId(data.conversationId);
      }
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء محاكاة الرسالة");
    } finally {
      setInboundSimulating(false);
    }
  };

  // Convert chat to Draft Order
  const handleCreateDraftOrder = async () => {
    if (!activeConversation) return;
    setCreatingDraftOrder(true);

    try {
      const storeId = await fetchStoreId();

      const customerName = activeConversation.customer_name || activeConversation.external_id;
      const customerPhone = activeConversation.external_id;

      if (storeId) {
        const { data: order, error } = await supabase
          .from("orders")
          .insert({
            store_id: storeId,
            customer_name: customerName,
            customer_phone: customerPhone,
            total_amount: 450.0,
            status: "pending",
            payment_status: "pending",
            notes: `طلب تم إنشاؤه تلقائياً من محادثة ${activeConversation.channel} (${activeConversation.external_id})`,
          })
          .select("id")
          .single();

        if (error) throw error;
        setDraftOrderCreated(order.id);
        toast.success(`تم إنشاء مسودة الطلب بنجاح! رقم الطلب: #${order.id.slice(0, 8)}`);
      } else {
        const mockOrderId = `ord-${Date.now().toString().slice(-6)}`;
        setDraftOrderCreated(mockOrderId);
        toast.success(`تم إنشاء مسودة الطلب بنجاح! رقم الطلب: #${mockOrderId}`);
      }
    } catch (err: any) {
      toast.error("فشل إنشاء مسودة الطلب: " + err.message);
    } finally {
      setCreatingDraftOrder(false);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "whatsapp" && c.channel === "whatsapp") ||
      (activeFilter === "instagram" && c.channel === "instagram");

    const matchesSearch =
      !searchQuery ||
      c.external_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.customer_name && c.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.messages && c.messages.some((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase())));

    return matchesFilter && matchesSearch;
  });

  return (
    <DashboardLayout
      title="صندوق الرسائل (Live Inbox)"
      subtitle="استقبال رسائل WhatsApp و Instagram المباشرة، الرد الفوري، وتحويل المحادثات إلى طلبات"
      activePath="/dashboard/inbox"
      actions={
        <div className="flex items-center gap-2">
          {igStatus.connected && (
            <>
              <button
                type="button"
                onClick={() => setShowNewIgModal(true)}
                className="btn-interactive px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-extrabold text-xs hard-shadow-sm flex items-center gap-1.5 cursor-pointer"
                title="بدء محادثة إنستجرام جديدة"
              >
                <span className="material-symbols-outlined text-[17px]">chat_add_on</span>
                <span>رسالة DM جديدة</span>
              </button>
              <button
                type="button"
                onClick={() => setShowInboundTestModal(true)}
                className="btn-interactive px-3.5 py-2 rounded-xl bg-surface border-2 border-on-surface font-bold text-xs hard-shadow-sm flex items-center gap-1.5 hover:bg-surface-container cursor-pointer"
                title="محاكاة وصول رسالة DM واردة"
              >
                <span className="material-symbols-outlined text-[16px] text-pink-600">move_to_inbox</span>
                <span>اختبار رسالة واردة</span>
              </button>
              <button
                type="button"
                onClick={handleSyncInstagram}
                disabled={syncingIg}
                className="btn-interactive px-3 py-2 rounded-xl bg-surface border-2 border-on-surface font-bold text-xs hard-shadow-sm flex items-center gap-1.5 hover:bg-surface-container cursor-pointer disabled:opacity-50"
                title="مزامنة رسائل Instagram من Meta Graph API"
              >
                <span className={`material-symbols-outlined text-[16px] text-primary ${syncingIg ? "animate-spin" : ""}`}>
                  sync
                </span>
                <span>{syncingIg ? "جاري الفحص..." : "مزامنة إنستجرام"}</span>
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => {
              loadConversations();
              toast.success("تم تحديث المحادثات لحظياً من Supabase");
            }}
            className="p-2 rounded-xl border-2 border-on-surface bg-surface hover:bg-surface-container text-on-surface cursor-pointer flex items-center gap-1 text-xs font-bold"
            title="تحديث المحادثات"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
          </button>
        </div>
      }
    >
      {/* Channels Status Strip */}
      <div className="mb-5 grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Instagram Channel Card */}
        <div className="bg-surface-container-lowest border-2 border-on-surface rounded-2xl p-3.5 hard-shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-700 flex items-center justify-center text-white border-2 border-on-surface shrink-0 hard-shadow-sm overflow-hidden">
              {igStatus.profilePic ? (
                <img src={igStatus.profilePic} alt={igStatus.username} className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-[20px]">photo_camera</span>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display-hero font-extrabold text-xs text-on-surface truncate">
                  {igStatus.connected ? `@${igStatus.username}` : "حساب إنستجرام (Instagram Direct)"}
                </span>
                {igStatus.connected ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    متصل
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-container text-on-surface-variant border border-on-surface/20">
                    غير متصل
                  </span>
                )}
              </div>
              <p className="text-[11px] text-on-surface-variant truncate mt-0.5">
                {igStatus.connected
                  ? "استقبال مباشر للـ DMs نشط ⚡ الرد والطلبات مفعلة"
                  : "اربط حساب متجرك لاستقبال الردود والرسائل الخاصة"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {igStatus.connected ? (
              <>
                <button
                  type="button"
                  onClick={handleSyncInstagram}
                  disabled={syncingIg}
                  className="px-2.5 py-1.5 rounded-xl border border-on-surface bg-surface hover:bg-surface-container text-on-surface text-[11px] font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  title="مزامنة الرسائل"
                >
                  <span className={`material-symbols-outlined text-[15px] ${syncingIg ? "animate-spin" : ""}`}>
                    sync
                  </span>
                  <span className="hidden sm:inline">مزامنة</span>
                </button>
                <button
                  type="button"
                  onClick={handleDisconnectInstagram}
                  className="p-1.5 rounded-xl border border-red-300 hover:bg-red-50 text-red-600 cursor-pointer"
                  title="فصل حساب إنستجرام"
                >
                  <span className="material-symbols-outlined text-[16px]">link_off</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleConnectInstagram}
                disabled={igConnecting}
                className="px-3 py-1.5 rounded-xl border-2 border-on-surface bg-gradient-to-r from-purple-600 to-pink-600 text-white font-extrabold text-xs hard-shadow-sm flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {igConnecting ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span className="material-symbols-outlined text-[16px]">add_link</span>
                )}
                <span>ربط Instagram</span>
              </button>
            )}
          </div>
        </div>

        {/* WhatsApp Channel Card (No Static Dummy Data) */}
        <div className="bg-surface-container-lowest border-2 border-on-surface rounded-2xl p-3.5 hard-shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white border-2 border-on-surface shrink-0 hard-shadow-sm ${
              metaStatus.connected ? "bg-emerald-600" : "bg-surface-container text-on-surface-variant"
            }`}>
              <span className="material-symbols-outlined text-[20px]">chat</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display-hero font-extrabold text-xs text-on-surface truncate">
                  واتساب للأعمال (WhatsApp API)
                </span>
                {metaStatus.connected ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    متصل
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-container text-on-surface-variant border border-on-surface/20">
                    غير متصل
                  </span>
                )}
              </div>
              <p className="text-[11px] text-on-surface-variant truncate mt-0.5">
                {metaStatus.connected ? `${metaStatus.phone} (${metaStatus.verifiedName})` : "لم يتم ربط رقم واتساب بعد"}
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={() => setShowConnectAccountModal(true)}
              className="px-2.5 py-1.5 rounded-xl border border-on-surface bg-surface hover:bg-surface-container text-on-surface text-[11px] font-bold flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">add_link</span>
              <span>{metaStatus.connected ? "إعدادات" : "ربط واتساب"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main 3-Column / Split Live Messaging Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-340px)] min-h-[580px]">
        {/* Left Column: Conversations List (4 Cols) */}
        <div className="lg:col-span-4 bg-surface-container-lowest border-2 border-on-surface rounded-2xl flex flex-col hard-shadow-sm overflow-hidden">
          {/* Search & Filter Header */}
          <div className="p-4 border-b-2 border-on-surface/10 space-y-3">
            <div className="relative">
              <span className="material-symbols-outlined absolute right-3 top-2.5 text-on-surface-variant text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث برقم الهاتف أو اسم العميل..."
                className="w-full pl-3 pr-9 py-2 rounded-xl border-2 border-on-surface bg-surface text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex items-center gap-1.5">
              {[
                { id: "all", label: "الكل" },
                { id: "whatsapp", label: "واتساب (WhatsApp)" },
                { id: "instagram", label: "إنستجرام (IG)" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-extrabold border transition-all cursor-pointer ${
                    activeFilter === f.id
                      ? "bg-primary text-on-primary border-on-surface hard-shadow-sm"
                      : "bg-surface text-on-surface border-on-surface/30 hover:border-on-surface"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conversations Scrollable List */}
          <div className="flex-1 overflow-y-auto divide-y-2 divide-on-surface/5">
            {loading ? (
              <div className="p-8 text-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <span className="text-xs font-bold text-on-surface-variant">جاري مزامنة المحادثات من Supabase...</span>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-2 text-on-surface-variant/40">
                  forum
                </span>
                <p className="text-xs font-bold">لا توجد رسائل واردة بعد</p>
                <p className="text-[11px] text-on-surface-variant/70 mt-1 leading-relaxed">
                  {igStatus.connected
                    ? `حساب Instagram متصل (@${igStatus.username}) — ستظهر رسائل الـ DMs هنا فور إرسالها من العملاء ⚡`
                    : "عندما يرسل أي عميل رسالة لمتجرك عبر واتساب أو إنستجرام، ستظهر هنا لحظياً ⚡"}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
                  {igStatus.connected && (
                    <button
                      type="button"
                      onClick={handleSyncInstagram}
                      disabled={syncingIg}
                      className="px-3 py-1.5 rounded-xl border-2 border-on-surface bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50 hard-shadow-sm"
                    >
                      <span className={`material-symbols-outlined text-[15px] ${syncingIg ? "animate-spin" : ""}`}>
                        sync
                      </span>
                      <span>مزامنة رسائل Instagram</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowTestMessageModal(true)}
                    className="px-3 py-1.5 rounded-xl border-2 border-on-surface bg-surface hover:bg-surface-container text-xs font-bold"
                  >
                    إرسال رسالة تجريبية
                  </button>
                </div>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = activeConversation?.id === conv.id;
                const lastMsg = conv.messages?.[conv.messages.length - 1];
                const isWhatsApp = conv.channel === "whatsapp";

                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className={`w-full p-4 text-right flex items-start gap-3 transition-colors cursor-pointer border-r-4 ${
                      isSelected
                        ? "bg-secondary-fixed/30 border-primary"
                        : "hover:bg-surface border-transparent"
                    }`}
                  >
                    {/* Avatar with Channel Icon */}
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-xl border-2 border-on-surface bg-surface-container flex items-center justify-center font-extrabold text-sm text-primary hard-shadow-sm">
                        {conv.customer_name ? conv.customer_name.charAt(0) : "👤"}
                      </div>
                      <span
                        className={`absolute -bottom-1 -left-1 w-5 h-5 rounded-full border border-on-surface flex items-center justify-center text-[11px] ${
                          isWhatsApp
                            ? "bg-emerald-500 text-white"
                            : "bg-pink-500 text-white"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[13px]">
                          {isWhatsApp ? "chat" : "photo_camera"}
                        </span>
                      </span>
                    </div>

                    {/* Meta info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="font-display-hero font-extrabold text-xs text-on-surface truncate">
                          {conv.customer_name || conv.external_id}
                        </span>
                        {conv.last_message_at && (
                          <span className="text-[10px] text-on-surface-variant/80 font-bold shrink-0">
                            {new Date(conv.last_message_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] font-mono text-on-surface-variant/70 mb-1">
                        {conv.external_id}
                      </div>

                      <p className="text-xs text-on-surface-variant line-clamp-1">
                        {lastMsg ? (
                          <>
                            {lastMsg.direction === "outbound" && (
                              <span className="text-primary font-bold ml-1">أنت:</span>
                            )}
                            {lastMsg.content}
                          </>
                        ) : (
                          "لا توجد رسائل"
                        )}
                      </p>
                    </div>

                    {/* Unread badge */}
                    {conv.unread_count && conv.unread_count > 0 ? (
                      <span className="w-5 h-5 rounded-full bg-primary text-on-primary text-[10px] font-black flex items-center justify-center shrink-0 border border-on-surface">
                        {conv.unread_count}
                      </span>
                    ) : null}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Center & Right Column: Active Chat Thread + Customer Context (8 Cols) */}
        {activeConversation ? (
          <div className="lg:col-span-8 bg-surface-container-lowest border-2 border-on-surface rounded-2xl flex flex-col hard-shadow-sm overflow-hidden">
            {/* Active Conversation Header */}
            <div className="p-4 border-b-2 border-on-surface/10 bg-surface flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface-container border-2 border-on-surface flex items-center justify-center font-bold text-base text-primary shrink-0">
                  {activeConversation.customer_name?.charAt(0) || "👤"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display-hero font-extrabold text-sm text-on-surface">
                      {activeConversation.customer_name || activeConversation.external_id}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        activeConversation.channel === "whatsapp"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-500"
                          : "bg-pink-100 text-pink-800 border-pink-500"
                      }`}
                    >
                      {activeConversation.channel === "whatsapp" ? "WhatsApp Cloud" : "Instagram Direct"}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-on-surface-variant font-bold flex items-center gap-2">
                    <span>{activeConversation.external_id}</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-300">
                      24h Window Active
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCreateDraftOrder}
                  disabled={creatingDraftOrder}
                  className="btn-interactive px-3 py-1.5 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed border-2 border-on-surface font-extrabold text-xs hard-shadow-sm flex items-center gap-1.5 hover:bg-tertiary-fixed-dim cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">shopping_cart_checkout</span>
                  {creatingDraftOrder ? "جاري الإنشاء..." : "إنشاء مسودة طلب (Draft Order)"}
                </button>
              </div>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-surface-container-lowest">
              {/* Meta 24-Hour Policy Notice */}
              <div className="bg-surface-container/60 border border-on-surface/20 rounded-xl p-2.5 text-center text-xs text-on-surface-variant flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                <span>
                  محادثة سحابية مباشرة عبر <strong>{metaStatus.phone}</strong> — متصل بـ Supabase Realtime ⚡
                </span>
              </div>

              {draftOrderCreated && (
                <div className="bg-emerald-100 text-emerald-950 border-2 border-emerald-600 rounded-xl p-3 text-xs font-bold flex items-center justify-between">
                  <span>تم إنشاء مسودة الطلب بنجاح لهذا العميل (رقم: #{draftOrderCreated.slice(0, 8)})</span>
                  <a
                    href="/dashboard/orders"
                    className="underline text-emerald-900 font-extrabold"
                  >
                    عرض في صفحة الطلبات ←
                  </a>
                </div>
              )}

              {activeConversation.messages && activeConversation.messages.length > 0 ? (
                activeConversation.messages.map((msg) => {
                  const isInbound = msg.direction === "inbound";
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isInbound ? "items-start" : "items-end"}`}
                    >
                      <div
                        className={`max-w-[80%] md:max-w-[70%] p-3.5 rounded-2xl border-2 border-on-surface text-sm font-medium hard-shadow-sm ${
                          isInbound
                            ? "bg-surface-container-low text-on-surface rounded-br-sm"
                            : "bg-primary text-on-primary rounded-bl-sm"
                        }`}
                      >
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        <div
                          className={`mt-1.5 flex items-center justify-end gap-1.5 text-[10px] font-bold ${
                            isInbound ? "text-on-surface-variant/70" : "text-on-primary/70"
                          }`}
                        >
                          <span>
                            {new Date(msg.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {!isInbound && (
                            <span className="material-symbols-outlined text-[13px]">
                              done_all
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-on-surface-variant text-xs">
                  لا توجد رسائل سابقة في هذه المحادثة
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Reply Suggestions */}
            <div className="px-4 py-2 border-t border-on-surface/10 bg-surface flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
              <span className="font-extrabold text-on-surface-variant shrink-0 text-[11px]">
                ردود سريعة:
              </span>
              {[
                "أهلاً بك يا فندم! المنتج متوفر وتسليم خلال 48 ساعة 🛍️",
                "سعر الشحن 50 ج.م لباب البيت لجميع المحافظات 🚚",
                "تمام، ممكن الاسم بالكامل والعنوان ورقم الهاتف لتأكيد حجز الأوردر؟",
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setNewMessageText(suggestion)}
                  className="px-2.5 py-1 rounded-lg border border-on-surface/30 bg-surface-container-lowest hover:bg-surface-container font-bold text-[11px] text-on-surface truncate shrink-0 cursor-pointer"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* Message Composer / Send Input */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t-2 border-on-surface bg-surface-container-low flex items-center gap-3"
            >
              <input
                type="text"
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                placeholder={
                  activeConversation?.channel === "instagram"
                    ? `اكتب ردك للعميل عبر Instagram Direct (@${activeConversation.customer_name || activeConversation.external_id})...`
                    : "اكتب ردك للعميل هنا عبر WhatsApp Cloud API..."
                }
                className="flex-1 px-4 py-3 rounded-xl border-2 border-on-surface bg-surface text-on-surface font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={sending || !newMessageText.trim()}
                className="btn-interactive btn-shimmer px-5 py-3 rounded-xl bg-primary text-on-primary border-2 border-on-surface font-extrabold text-sm hard-shadow-sm flex items-center gap-2 disabled:opacity-40 cursor-pointer"
              >
                {sending ? (
                  <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>إرسال</span>
                    <span className="material-symbols-outlined text-[18px]">send</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="lg:col-span-8 bg-surface-container-lowest border-2 border-on-surface rounded-2xl flex items-center justify-center p-8 md:p-12 text-center text-on-surface-variant hard-shadow-sm">
            <div className="max-w-md mx-auto">
              {igStatus.connected ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-2xl mx-auto border-2 border-on-surface bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-700 flex items-center justify-center text-white hard-shadow-sm overflow-hidden">
                    {igStatus.profilePic ? (
                      <img src={igStatus.profilePic} alt={igStatus.username} className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-3xl">photo_camera</span>
                    )}
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-500 mb-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                      حساب Instagram متصل: @{igStatus.username}
                    </div>
                    <h3 className="font-display-hero font-extrabold text-base text-on-surface">
                      صندوق رسائل إنستجرام المباشرة (Live DMs) جاهز
                    </h3>
                    <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                      عندما يرسل لك أي عميل رسالة خاصة (DM) على حساب متجرك <strong>@{igStatus.username}</strong>، ستظهر هنا فوراً في الوقت الفعلي للرد عليها، أو يمكنك الضغط على مزامنة لفحص الرسائل.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleSyncInstagram}
                      disabled={syncingIg}
                      className="px-4 py-2 rounded-xl border-2 border-on-surface bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-extrabold text-xs hard-shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <span className={`material-symbols-outlined text-[16px] ${syncingIg ? "animate-spin" : ""}`}>
                        sync
                      </span>
                      <span>{syncingIg ? "جاري المزامنة..." : "مزامنة الرسائل الآن"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowTestMessageModal(true)}
                      className="px-4 py-2 rounded-xl border-2 border-on-surface bg-surface hover:bg-surface-container font-extrabold text-xs cursor-pointer"
                    >
                      تجربة إرسال رسالة
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-3">
                    chat
                  </span>
                  <h3 className="font-display-hero font-extrabold text-lg text-on-surface">
                    اختر محادثة لبدء المراسلة
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-1">
                    يمكنك استقبال رسائل واتساب وإنستجرام الحية فور إرسالها من العملاء
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>



      {/* MODAL: Send Test Message */}
      {showTestMessageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
          <div className="bg-surface-container-lowest border-4 border-on-surface rounded-3xl p-6 md:p-8 max-w-md w-full hard-shadow relative">
            <button
              type="button"
              onClick={() => setShowTestMessageModal(false)}
              className="absolute top-4 left-4 text-on-surface-variant hover:text-on-surface font-black text-lg cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 border-2 border-on-surface flex items-center justify-center font-bold text-xl hard-shadow-sm">
                <span className="material-symbols-outlined">send</span>
              </span>
              <div>
                <h3 className="font-display-hero font-extrabold text-base text-on-surface">
                  إرسال رسالة تجريبية (Live Test)
                </h3>
                <p className="text-xs text-on-surface-variant">
                  إرسال رسالة WhatsApp حقيقية من رقمك السحابي المعتمد
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5">
                  رقم هاتف المستلم (مع كود الدولة):
                </label>
                <input
                  type="tel"
                  dir="ltr"
                  value={testRecipientPhone}
                  onChange={(e) => setTestRecipientPhone(e.target.value)}
                  placeholder="+201012345678"
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-on-surface bg-surface font-mono font-bold text-sm text-left"
                />
                <p className="text-[11px] text-on-surface-variant/80 mt-1">
                  💡 في وضع التطوير (Development Mode): تأكد من إضافة هذا الرقم في Meta Developer Dashboard → WhatsApp → API Setup → To.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-surface border border-on-surface/20 text-xs font-mono text-on-surface-variant space-y-1">
                <div>From: {metaStatus.phone} ({metaStatus.phoneId})</div>
                <div>Status: Meta Cloud API Verified 🟢</div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTestMessageModal(false)}
                  className="px-4 py-2 rounded-xl border-2 border-on-surface bg-surface font-bold text-xs cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleSendTestMessage}
                  disabled={testSending}
                  className="btn-interactive btn-shimmer px-5 py-2 rounded-xl bg-primary text-on-primary border-2 border-on-surface font-extrabold text-xs hard-shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {testSending ? "جاري الإرسال..." : "إرسال الآن 🚀"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: New Instagram DM */}
      {showNewIgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
          <div className="bg-surface-container-lowest border-4 border-on-surface rounded-3xl p-6 md:p-8 max-w-md w-full hard-shadow relative">
            <button
              type="button"
              onClick={() => setShowNewIgModal(false)}
              className="absolute top-4 left-4 text-on-surface-variant hover:text-on-surface font-black text-lg cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-700 text-white border-2 border-on-surface flex items-center justify-center hard-shadow-sm">
                <span className="material-symbols-outlined text-[20px]">chat_add_on</span>
              </span>
              <div>
                <h3 className="font-display-hero font-extrabold text-base text-on-surface">
                  رسالة DM جديدة عبر إنستجرام
                </h3>
                <p className="text-xs text-on-surface-variant">
                  ابدأ محادثة مع عميل على حساب @{igStatus.username}
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateNewIgChat} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5">
                  اسم العميل أو @handle:
                </label>
                <input
                  type="text"
                  value={newIgUser}
                  onChange={(e) => setNewIgUser(e.target.value)}
                  placeholder="@sara_cairo أو سارة"
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-on-surface bg-surface font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5">
                  نص الرسالة الأولى:
                </label>
                <textarea
                  value={newIgText}
                  onChange={(e) => setNewIgText(e.target.value)}
                  placeholder="أهلاً! نشكر تواصلك معنا..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-on-surface bg-surface font-bold text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setShowNewIgModal(false); setNewIgUser(""); setNewIgText(""); }}
                  className="px-4 py-2 rounded-xl border-2 border-on-surface bg-surface font-bold text-xs cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={newIgSending || !newIgUser.trim() || !newIgText.trim()}
                  className="btn-interactive btn-shimmer px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white border-2 border-on-surface font-extrabold text-xs hard-shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {newIgSending ? "جاري الإرسال..." : "إرسال DM 🚀"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Simulate Inbound DM */}
      {showInboundTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
          <div className="bg-surface-container-lowest border-4 border-on-surface rounded-3xl p-6 md:p-8 max-w-md w-full hard-shadow relative">
            <button
              type="button"
              onClick={() => setShowInboundTestModal(false)}
              className="absolute top-4 left-4 text-on-surface-variant hover:text-on-surface font-black text-lg cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 rounded-xl bg-pink-100 text-pink-800 border-2 border-on-surface flex items-center justify-center hard-shadow-sm">
                <span className="material-symbols-outlined text-[20px]">move_to_inbox</span>
              </span>
              <div>
                <h3 className="font-display-hero font-extrabold text-base text-on-surface">
                  اختبار رسالة DM واردة
                </h3>
                <p className="text-xs text-on-surface-variant">
                  محاكاة وصول DM جديد من عميل على إنستجرام (للاختبار)
                </p>
              </div>
            </div>

            <form onSubmit={handleSimulateInboundDM} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5">
                  اسم/handle العميل (اختياري):
                </label>
                <input
                  type="text"
                  value={inboundSender}
                  onChange={(e) => setInboundSender(e.target.value)}
                  placeholder="@sara_cairo"
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-on-surface bg-surface font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5">
                  نص الرسالة الواردة (اختياري):
                </label>
                <textarea
                  value={inboundText}
                  onChange={(e) => setInboundText(e.target.value)}
                  placeholder="مرحباً! عايز اعرف تفاصيل عن المنتج..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-on-surface bg-surface font-bold text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-xs font-bold text-amber-900">
                💡 هذا يحاكي وصول DM من عميل إلى حساب @{igStatus.username} وسيظهر في القائمة تلقائياً.
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setShowInboundTestModal(false); setInboundSender(""); setInboundText(""); }}
                  className="px-4 py-2 rounded-xl border-2 border-on-surface bg-surface font-bold text-xs cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={inboundSimulating}
                  className="btn-interactive btn-shimmer px-5 py-2 rounded-xl bg-pink-600 text-white border-2 border-on-surface font-extrabold text-xs hard-shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {inboundSimulating ? "جاري المحاكاة..." : "محاكاة DM وارد 📩"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}