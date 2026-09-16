import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export const Route = createFileRoute("/dashboard/products")({
  component: ProductsPage,
});

export interface ProductVariant {
  sku: string;
  color: string;
  size: string;
  price: number;
  stock: number;
}

export interface InventoryMovement {
  id?: string;
  product_id: string;
  store_id?: string;
  variant_sku?: string | null;
  quantity_change: number;
  previous_quantity: number;
  new_quantity: number;
  reason: "order" | "return" | "manual_adjustment" | "restock";
  notes?: string | null;
  created_at?: string;
}

export interface ProductItem {
  id: string;
  store_id?: string;
  name: string;
  sku: string;
  price: number;
  compare_price?: number | null;
  inventory_quantity: number;
  category: string;
  status: "active" | "draft" | "archived";
  description?: string | null;
  image_url?: string | null;
  images?: string[];
  variants?: ProductVariant[];
  created_at?: string;
}

function ProductsPage() {
  const { user } = useAuth();
  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Modal State (Add / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form State
  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    compare_price: "",
    sku: "",
    inventory_quantity: "10",
    category: "fashion",
    status: "active" as "active" | "draft" | "archived",
    description: "",
    images: [] as string[],
    newImageUrl: "",
    // Variants generator helpers
    genColors: "أسود, أبيض",
    genSizes: "S, M, L",
    variants: [] as ProductVariant[],
  });

  // Movement Ledger Modal State
  const [selectedProductForHistory, setSelectedProductForHistory] = useState<ProductItem | null>(null);
  const [movementsHistory, setMovementsHistory] = useState<InventoryMovement[]>([]);
  const [loadingMovements, setLoadingMovements] = useState(false);
  const [manualAdjustmentForm, setManualAdjustmentForm] = useState({
    changeAmount: "",
    reason: "manual_adjustment" as "manual_adjustment" | "restock" | "order" | "return",
    notes: "",
    variantSku: "",
  });

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3500);
  };

  // 1. Load Products from Supabase
  const loadProducts = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Get store info first
      const { data: storeData, error: storeError } = await supabase
        .from("stores")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (storeError) throw storeError;

      if (!storeData) {
        setStore(null);
        setProducts([]);
        setLoading(false);
        return;
      }

      setStore(storeData);

      // Fetch products
      const { data, error: prodsError } = await supabase
        .from("products")
        .select("*")
        .eq("store_id", storeData.id)
        .order("created_at", { ascending: false });

      if (prodsError) throw prodsError;

      const formatted: ProductItem[] = (data || []).map((p: any) => {
        let imgs: string[] = [];
        if (Array.isArray(p.images) && p.images.length > 0) {
          imgs = p.images;
        } else if (p.image_url) {
          imgs = [p.image_url];
        }

        let vars: ProductVariant[] = [];
        if (Array.isArray(p.variants)) {
          vars = p.variants;
        } else if (typeof p.variants === "string") {
          try {
            vars = JSON.parse(p.variants);
          } catch {}
        }

        return {
          id: p.id,
          store_id: p.store_id,
          name: p.name,
          sku: p.sku || "",
          price: Number(p.price) || 0,
          compare_price: p.compare_price ? Number(p.compare_price) : null,
          inventory_quantity: Number(p.inventory_quantity) || 0,
          category: p.category || "general",
          status: p.status || "active",
          description: p.description || "",
          image_url: imgs[0] || p.image_url || null,
          images: imgs,
          variants: vars,
          created_at: p.created_at,
        };
      });

      setProducts(formatted);
    } catch (err: any) {
      console.error("Error loading products:", err);
      setError("فشل في تحميل المنتجات من السحابة.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [user]);

  // 2. Record inventory movement in Supabase & local state
  const logMovement = async (movement: {
    productId: string;
    variantSku?: string | null;
    quantityChange: number;
    previousQuantity: number;
    newQuantity: number;
    reason: "order" | "return" | "manual_adjustment" | "restock";
    notes?: string;
  }) => {
    if (!store?.id) return;

    const newRecord: InventoryMovement = {
      product_id: movement.productId,
      store_id: store.id,
      variant_sku: movement.variantSku || null,
      quantity_change: movement.quantityChange,
      previous_quantity: movement.previousQuantity,
      new_quantity: movement.newQuantity,
      reason: movement.reason,
      notes: movement.notes || null,
      created_at: new Date().toISOString(),
    };

    // Optimistic local storage ledger
    try {
      const localLedgerKey = `wasla_movements_${movement.productId}`;
      const existing = JSON.parse(localStorage.getItem(localLedgerKey) || "[]");
      localStorage.setItem(localLedgerKey, JSON.stringify([newRecord, ...existing]));
    } catch {}

    // Save in Supabase table
    try {
      await supabase.from("inventory_movements").insert({
        store_id: store.id,
        product_id: movement.productId,
        variant_sku: movement.variantSku || null,
        quantity_change: movement.quantityChange,
        previous_quantity: movement.previousQuantity,
        new_quantity: movement.newQuantity,
        reason: movement.reason,
        notes: movement.notes || null,
      });
    } catch (err) {
      console.warn("Notice: Remote inventory_movements table insert notice:", err);
    }
  };

  // 3. Handle Multiple Image Uploads to Supabase Storage
  const handleMultipleFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    setError(null);

    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i]!;
      if (file.size > 5 * 1024 * 1024) {
        continue; // Skip files larger than 5MB
      }

      try {
        const fileExt = file.name.split(".").pop() || "jpg";
        const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const filePath = `${store?.id || "products"}/${cleanFileName}`;

        const { error: uploadError } = await supabase.storage
          .from("products")
          .upload(filePath, file, { cacheControl: "3600", upsert: true });

        if (uploadError) {
          // Fallback to Base64
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
          uploadedUrls.push(base64);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from("products")
            .getPublicUrl(filePath);
          uploadedUrls.push(publicUrl);
        }
      } catch {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        uploadedUrls.push(base64);
      }
    }

    setProductForm((prev) => ({
      ...prev,
      images: [...prev.images, ...uploadedUrls],
    }));
    setUploadingImage(false);
  };

  // Add Direct Image URL
  const handleAddDirectImageUrl = () => {
    if (!productForm.newImageUrl.trim()) return;
    setProductForm((prev) => ({
      ...prev,
      images: [...prev.images, prev.newImageUrl.trim()],
      newImageUrl: "",
    }));
  };

  // Remove Image
  const handleRemoveImage = (indexToRemove: number) => {
    setProductForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  // Set Primary Image
  const handleSetPrimaryImage = (index: number) => {
    setProductForm((prev) => {
      const target = prev.images[index]!;
      const remaining = prev.images.filter((_, idx) => idx !== index);
      return {
        ...prev,
        images: [target, ...remaining],
      };
    });
  };

  // 4. Variant Generator Logic
  const handleGenerateVariants = () => {
    const baseSku = productForm.sku.trim() || `SKU-${Date.now().toString().slice(-4)}`;
    const basePrice = parseFloat(productForm.price) || 0;
    const colors = productForm.genColors
      .split(/[,،]+/)
      .map((c) => c.trim())
      .filter(Boolean);
    const sizes = productForm.genSizes
      .split(/[,،]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (colors.length === 0 || sizes.length === 0) {
      setError("يرجى إدخال لون ومقاس واحد على الأقل لتوليد المتغيرات.");
      return;
    }

    const generated: ProductVariant[] = [];
    for (const color of colors) {
      for (const size of sizes) {
        const colorCode = color.slice(0, 3).toUpperCase();
        const sizeCode = size.toUpperCase();
        generated.push({
          sku: `${baseSku}-${colorCode}-${sizeCode}`,
          color,
          size,
          price: basePrice,
          stock: 10,
        });
      }
    }

    setProductForm((prev) => {
      const totalStock = generated.reduce((sum, v) => sum + (v.stock || 0), 0);
      return {
        ...prev,
        variants: generated,
        inventory_quantity: totalStock.toString(),
      };
    });
    showNotification(`تم توليد ${generated.length} متغيراً بنجاح! 🎨`);
  };

  // Add Single Custom Variant Row
  const handleAddCustomVariant = () => {
    const baseSku = productForm.sku.trim() || `SKU-${Date.now().toString().slice(-4)}`;
    const basePrice = parseFloat(productForm.price) || 0;
    const newVariant: ProductVariant = {
      sku: `${baseSku}-VAR-${productForm.variants.length + 1}`,
      color: "افتراضي",
      size: "M",
      price: basePrice,
      stock: 5,
    };

    setProductForm((prev) => {
      const updated = [...prev.variants, newVariant];
      const totalStock = updated.reduce((sum, v) => sum + (v.stock || 0), 0);
      return {
        ...prev,
        variants: updated,
        inventory_quantity: totalStock.toString(),
      };
    });
  };

  // Update Individual Variant
  const handleUpdateVariantField = (
    index: number,
    field: keyof ProductVariant,
    val: any
  ) => {
    setProductForm((prev) => {
      const updated = [...prev.variants];
      updated[index] = {
        ...updated[index]!,
        [field]: field === "price" || field === "stock" ? Number(val) || 0 : val,
      };
      const totalStock = updated.reduce((sum, v) => sum + (v.stock || 0), 0);
      return {
        ...prev,
        variants: updated,
        inventory_quantity: totalStock.toString(),
      };
    });
  };

  // Remove Variant
  const handleRemoveVariant = (index: number) => {
    setProductForm((prev) => {
      const updated = prev.variants.filter((_, i) => i !== index);
      const totalStock = updated.reduce((sum, v) => sum + (v.stock || 0), 0);
      return {
        ...prev,
        variants: updated,
        inventory_quantity: totalStock.toString(),
      };
    });
  };

  // Open Edit Modal
  const handleOpenEditModal = (product: ProductItem) => {
    setEditingProductId(product.id);
    setProductForm({
      name: product.name,
      price: product.price.toString(),
      compare_price: product.compare_price ? product.compare_price.toString() : "",
      sku: product.sku,
      inventory_quantity: product.inventory_quantity.toString(),
      category: product.category || "fashion",
      status: product.status || "active",
      description: product.description || "",
      images: product.images || (product.image_url ? [product.image_url] : []),
      newImageUrl: "",
      genColors: "أسود, أبيض",
      genSizes: "S, M, L",
      variants: product.variants || [],
    });
    setIsModalOpen(true);
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingProductId(null);
    setProductForm({
      name: "",
      price: "",
      compare_price: "",
      sku: "",
      inventory_quantity: "15",
      category: "fashion",
      status: "active",
      description: "",
      images: [],
      newImageUrl: "",
      genColors: "أسود, أبيض",
      genSizes: "S, M, L",
      variants: [],
    });
    setIsModalOpen(true);
  };

  // 5. Submit Add or Edit Product
  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store?.id) return;

    const priceNum = parseFloat(productForm.price);
    const comparePriceNum = productForm.compare_price
      ? parseFloat(productForm.compare_price)
      : null;
    const qtyNum = parseInt(productForm.inventory_quantity, 10) || 0;

    if (!productForm.name.trim()) {
      setError("يرجى إدخال اسم المنتج");
      return;
    }

    if (isNaN(priceNum) || priceNum < 0) {
      setError("يرجى إدخال سعر صحيح للمنتج");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const generatedSku =
        productForm.sku.trim() ||
        `SKU-${Date.now().toString().slice(-6)}`;

      const primaryImage = productForm.images[0] || null;

      if (editingProductId) {
        // --- EDIT PRODUCT ---
        const existing = products.find((p) => p.id === editingProductId);
        const prevQty = existing?.inventory_quantity || 0;

        const { error: updError } = await supabase
          .from("products")
          .update({
            name: productForm.name.trim(),
            price: priceNum,
            compare_price: comparePriceNum,
            sku: generatedSku,
            inventory_quantity: qtyNum,
            category: productForm.category,
            status: productForm.status,
            description: productForm.description.trim() || null,
            image_url: primaryImage,
            images: productForm.images,
            variants: productForm.variants,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingProductId);

        if (updError) throw updError;

        // Log movement if stock changed
        if (qtyNum !== prevQty) {
          await logMovement({
            productId: editingProductId,
            quantityChange: qtyNum - prevQty,
            previousQuantity: prevQty,
            newQuantity: qtyNum,
            reason: "manual_adjustment",
            notes: "تعديل كمية المخزون من شاشة تعديل المنتج",
          });
        }

        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProductId
              ? {
                  ...p,
                  name: productForm.name.trim(),
                  price: priceNum,
                  compare_price: comparePriceNum,
                  sku: generatedSku,
                  inventory_quantity: qtyNum,
                  category: productForm.category,
                  status: productForm.status,
                  description: productForm.description.trim() || null,
                  image_url: primaryImage,
                  images: productForm.images,
                  variants: productForm.variants,
                }
              : p
          )
        );

        showNotification(`تم تحديث بيانات المنتج "${productForm.name}" بنجاح! ✨`);
      } else {
        // --- CREATE PRODUCT ---
        const { data: newProd, error: insertError } = await supabase
          .from("products")
          .insert({
            store_id: store.id,
            name: productForm.name.trim(),
            price: priceNum,
            compare_price: comparePriceNum,
            sku: generatedSku,
            inventory_quantity: qtyNum,
            category: productForm.category,
            status: productForm.status,
            description: productForm.description.trim() || null,
            image_url: primaryImage,
            images: productForm.images,
            variants: productForm.variants,
            is_active: productForm.status === "active",
          })
          .select()
          .single();

        if (insertError) throw insertError;

        // Log initial stock movement
        if (newProd?.id && qtyNum > 0) {
          await logMovement({
            productId: newProd.id,
            quantityChange: qtyNum,
            previousQuantity: 0,
            newQuantity: qtyNum,
            reason: "restock",
            notes: "المخزون الافتتاحي عند إضافة المنتج",
          });
        }

        const formattedNew: ProductItem = {
          id: newProd.id,
          store_id: store.id,
          name: newProd.name,
          sku: newProd.sku || generatedSku,
          price: priceNum,
          compare_price: comparePriceNum,
          inventory_quantity: qtyNum,
          category: productForm.category,
          status: productForm.status,
          description: productForm.description.trim() || null,
          image_url: primaryImage,
          images: productForm.images,
          variants: productForm.variants,
          created_at: newProd.created_at,
        };

        setProducts((prev) => [formattedNew, ...prev]);

        // Update store product_count
        await supabase
          .from("stores")
          .update({ product_count: products.length + 1 })
          .eq("id", store.id);

        showNotification(`تمت إضافة منتج "${productForm.name}" بنجاح مع الصور والمتغيرات! 🛍️`);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Error submitting product:", err);
      setError(err.message || "حدث خطأ أثناء حفظ المنتج.");
    } finally {
      setSubmitting(false);
    }
  };

  // 6. Quick Stock Update with Movement Ledger Logging
  const handleQuickStockAdjustment = async (
    productId: string,
    delta: number,
    reason: "order" | "return" | "manual_adjustment" = "manual_adjustment"
  ) => {
    const current = products.find((p) => p.id === productId);
    if (!current) return;

    const prevQty = current.inventory_quantity || 0;
    const newQty = Math.max(0, prevQty + delta);
    const actualDelta = newQty - prevQty;

    if (actualDelta === 0) return;

    // Optimistic UI
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, inventory_quantity: newQty } : p
      )
    );

    // Record movement ledger
    await logMovement({
      productId,
      quantityChange: actualDelta,
      previousQuantity: prevQty,
      newQuantity: newQty,
      reason,
      notes:
        reason === "order"
          ? "خصم مخزون نتيجة طلب شراء"
          : reason === "return"
          ? "إرجاع منتج للمخزون"
          : "تعديل يدوي سريع للمخزون",
    });

    try {
      const { error: updErr } = await supabase
        .from("products")
        .update({ inventory_quantity: newQty })
        .eq("id", productId);

      if (updErr) throw updErr;
    } catch (err) {
      console.error("Stock update failed, reverting:", err);
      loadProducts();
    }
  };

  // 7. Delete Product
  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`هل أنت متأكد من حذف المنتج "${productName}"؟`)) return;

    try {
      const { error: delErr } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (delErr) throw delErr;

      setProducts((prev) => prev.filter((p) => p.id !== productId));

      if (store?.id) {
        await supabase
          .from("stores")
          .update({ product_count: Math.max(0, products.length - 1) })
          .eq("id", store.id);
      }

      showNotification("تم حذف المنتج بنجاح.");
    } catch (err: any) {
      console.error("Delete product error:", err);
      setError("تعذر حذف المنتج. يرجى إعادة المحاولة.");
    }
  };

  // 8. Load Movement Ledger History for a specific product
  const handleOpenHistoryModal = async (product: ProductItem) => {
    setSelectedProductForHistory(product);
    setLoadingMovements(true);
    setManualAdjustmentForm({
      changeAmount: "",
      reason: "manual_adjustment",
      notes: "",
      variantSku: "",
    });

    try {
      // 1. Try fetching from Supabase table
      const { data, error: moveErr } = await supabase
        .from("inventory_movements")
        .select("*")
        .eq("product_id", product.id)
        .order("created_at", { ascending: false });

      if (!moveErr && data && data.length > 0) {
        setMovementsHistory(data);
      } else {
        // Fallback to local storage
        const localKey = `wasla_movements_${product.id}`;
        const localData = JSON.parse(localStorage.getItem(localKey) || "[]");
        setMovementsHistory(localData);
      }
    } catch {
      const localKey = `wasla_movements_${product.id}`;
      const localData = JSON.parse(localStorage.getItem(localKey) || "[]");
      setMovementsHistory(localData);
    } finally {
      setLoadingMovements(false);
    }
  };

  // Submit Manual Movement from History Modal
  const handleSubmitManualMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForHistory) return;

    const delta = parseInt(manualAdjustmentForm.changeAmount, 10);
    if (isNaN(delta) || delta === 0) {
      alert("يرجى إدخال قيمة حركة صحيحة (مثال: +5 أو -2)");
      return;
    }

    const prevQty = selectedProductForHistory.inventory_quantity || 0;
    const newQty = Math.max(0, prevQty + delta);
    const actualDelta = newQty - prevQty;

    // Log movement
    await logMovement({
      productId: selectedProductForHistory.id,
      variantSku: manualAdjustmentForm.variantSku || null,
      quantityChange: actualDelta,
      previousQuantity: prevQty,
      newQuantity: newQty,
      reason: manualAdjustmentForm.reason,
      notes: manualAdjustmentForm.notes || "تسوية جرد يدوية من سجل الحركات",
    });

    // Update in Supabase
    await supabase
      .from("products")
      .update({ inventory_quantity: newQty })
      .eq("id", selectedProductForHistory.id);

    // Update local state
    const updatedProd = { ...selectedProductForHistory, inventory_quantity: newQty };
    setSelectedProductForHistory(updatedProd);
    setProducts((prev) =>
      prev.map((p) => (p.id === selectedProductForHistory.id ? updatedProd : p))
    );

    // Refresh movements history list
    const newHistoryItem: InventoryMovement = {
      product_id: selectedProductForHistory.id,
      quantity_change: actualDelta,
      previous_quantity: prevQty,
      new_quantity: newQty,
      reason: manualAdjustmentForm.reason,
      notes: manualAdjustmentForm.notes || "تسوية جرد يدوية",
      variant_sku: manualAdjustmentForm.variantSku || null,
      created_at: new Date().toISOString(),
    };
    setMovementsHistory((prev) => [newHistoryItem, ...prev]);

    setManualAdjustmentForm({
      changeAmount: "",
      reason: "manual_adjustment",
      notes: "",
      variantSku: "",
    });

    showNotification("تم تسجيل حركة المخزون وتحديث الرصيد بنجاح! 📋");
  };

  // Filtered products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || p.category === filterCategory;
    const matchesStatus =
      filterStatus === "all" || p.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading) {
    return (
      <DashboardLayout
        title="المنتجات والمخزون المتقدم"
        subtitle="إدارة الكتالوج، المتغيرات، وتتبع سجل حركات المخزون لحظياً"
        activePath="/dashboard/products"
      >
        <div className="bg-surface-container-lowest border-2 border-on-surface rounded-2xl p-12 text-center hard-shadow-sm">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="font-bold text-on-surface-variant">جاري تحميل المنتجات والمتغيرات من السحابة...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="المنتجات والجرد المتقدم"
      subtitle="إدارة الكتالوج، الصور المتعددة، المقاسات والألوان، وتتبع حركات المخزون بجدول inventory_movements"
      activePath="/dashboard/products"
      actions={
        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="btn-interactive btn-shimmer px-5 py-2.5 rounded-full bg-primary text-on-primary border-2 border-on-surface font-bold text-sm hard-shadow-sm cursor-pointer flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          إضافة منتج جديد
        </button>
      }
    >
      <div className="space-y-6">
        {/* Success / Error Banners */}
        {error && (
          <div className="bg-error-container text-on-error-container border-2 border-on-surface rounded-xl p-4 font-bold text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-xs font-bold underline">إغلاق</button>
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-100 text-emerald-950 border-2 border-emerald-600 rounded-xl p-4 font-bold text-sm flex items-center gap-2 animate-in fade-in">
            <span className="material-symbols-outlined text-emerald-700">check_circle</span>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-surface-container-lowest border-2 border-on-surface rounded-2xl p-4 hard-shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-on-surface-variant">إجمالي المنتجات</span>
              <div className="font-display-hero text-2xl font-extrabold text-on-surface">{products.length} منتج</div>
            </div>
            <span className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 border border-on-surface flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">category</span>
            </span>
          </div>

          <div className="bg-surface-container-lowest border-2 border-on-surface rounded-2xl p-4 hard-shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-on-surface-variant">المتوفر في المخزون</span>
              <div className="font-display-hero text-2xl font-extrabold text-emerald-700">
                {products.filter((p) => p.inventory_quantity > 0).length} متوفر
              </div>
            </div>
            <span className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 border border-on-surface flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">check_circle</span>
            </span>
          </div>

          <div className="bg-surface-container-lowest border-2 border-on-surface rounded-2xl p-4 hard-shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-on-surface-variant">قاربت على النفاد</span>
              <div className="font-display-hero text-2xl font-extrabold text-red-600">
                {products.filter((p) => p.inventory_quantity <= 5 && p.inventory_quantity > 0).length} منتج
              </div>
            </div>
            <span className="w-10 h-10 rounded-xl bg-red-100 text-red-800 border border-on-surface flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">warning</span>
            </span>
          </div>

          <div className="bg-surface-container-lowest border-2 border-on-surface rounded-2xl p-4 hard-shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-on-surface-variant">إجمالي المتغيرات (Variants)</span>
              <div className="font-display-hero text-2xl font-extrabold text-blue-700">
                {products.reduce((acc, p) => acc + (p.variants?.length || 0), 0)} متغير
              </div>
            </div>
            <span className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 border border-on-surface flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">style</span>
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-surface-container-lowest border-2 border-on-surface rounded-2xl p-4 hard-shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute start-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث باسم المنتج أو رمز SKU..."
              className="w-full ps-10 pe-4 py-2.5 rounded-xl border-2 border-on-surface bg-surface text-sm font-bold placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 rounded-xl border-2 border-on-surface bg-surface text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">جميع الفئات</option>
              <option value="fashion">أزياء وموضة 👗</option>
              <option value="beauty">عناية وتجميل 💄</option>
              <option value="electronics">إلكترونيات 📱</option>
              <option value="food">طعام ومشروبات ☕</option>
              <option value="general">عام 📦</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-xl border-2 border-on-surface bg-surface text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">جميع الحالات</option>
              <option value="active">نشط للبيع ✅</option>
              <option value="draft">مسودة 📝</option>
              <option value="archived">مؤرشف 🗄️</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-surface-container-lowest border-2 border-on-surface rounded-2xl p-12 text-center hard-shadow-sm space-y-4">
            <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center text-on-surface-variant mx-auto">
              <span className="material-symbols-outlined text-3xl">inventory_2</span>
            </div>
            <h3 className="font-display-hero text-xl font-bold text-on-surface">
              {searchTerm ? "لا توجد منتجات مطابقة لبحثك" : "لا توجد منتجات مسجلة حتى الآن"}
            </h3>
            <p className="font-body-md text-xs text-on-surface-variant max-w-md mx-auto">
              أضف منتجاتك وصورها ومتغيرات الألوان والمقاسات لبدء المزامنة مع روبوت الذكاء الاصطناعي وشركات الشحن.
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="btn-interactive btn-shimmer px-6 py-3 rounded-full bg-primary text-on-primary font-bold text-sm border-2 border-on-surface hard-shadow-sm cursor-pointer"
            >
              + إضافة أول منتج الآن
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProducts.map((product) => {
              const qty = product.inventory_quantity;
              const isLowStock = qty <= 5 && qty > 0;
              const isOutOfStock = qty === 0;
              const hasDiscount =
                product.compare_price && product.compare_price > product.price;
              const discountPercent = hasDiscount
                ? Math.round(((product.compare_price! - product.price) / product.compare_price!) * 100)
                : 0;
              const variantsCount = product.variants?.length || 0;

              return (
                <div
                  key={product.id}
                  className="bg-surface-container-lowest border-2 border-on-surface rounded-2xl p-5 hard-shadow-sm flex flex-col justify-between hover:shadow-[6px_6px_0px_#111c2d] transition-all"
                >
                  <div className="space-y-3">
                    {/* Header: SKU badge & Status & Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded-md bg-surface-container border border-on-surface text-primary">
                          {product.sku || "NO-SKU"}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                            product.status === "active"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-500"
                              : product.status === "draft"
                              ? "bg-amber-100 text-amber-800 border-amber-500"
                              : "bg-gray-100 text-gray-800 border-gray-400"
                          }`}
                        >
                          {product.status === "active"
                            ? "نشط"
                            : product.status === "draft"
                            ? "مسودة"
                            : "مؤرشف"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(product)}
                          className="p-1 rounded-lg text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                          title="تعديل تفاصيل المنتج والصور والمتغيرات"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id, product.name)}
                          className="p-1 rounded-lg text-error hover:bg-error/10 transition-colors cursor-pointer"
                          title="حذف المنتج"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </div>

                    {/* Image / Gallery Preview */}
                    <div className="relative w-full h-40 rounded-xl border-2 border-on-surface/20 bg-surface-container/30 flex items-center justify-center overflow-hidden group">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-on-surface-variant/70">
                          <span className="material-symbols-outlined text-4xl">shopping_bag</span>
                          <span className="text-xs font-bold">لا توجد صورة</span>
                        </div>
                      )}

                      {/* Image count badge */}
                      {product.images && product.images.length > 1 && (
                        <span className="absolute bottom-2 start-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-mono font-bold backdrop-blur-xs flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">collections</span>
                          <span>{product.images.length} صور</span>
                        </span>
                      )}

                      {/* Discount Tag */}
                      {hasDiscount && (
                        <span className="absolute top-2 end-2 px-2 py-0.5 rounded-full bg-red-600 text-white font-extrabold text-[10px] shadow-sm">
                          خصم {discountPercent}%
                        </span>
                      )}
                    </div>

                    {/* Name & Description */}
                    <div>
                      <h3 className="font-display-hero text-base font-extrabold text-on-surface line-clamp-1">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="font-body-md text-xs text-on-surface-variant line-clamp-2 mt-1">
                          {product.description}
                        </p>
                      )}
                    </div>

                    {/* Variants Chips (if any) */}
                    {variantsCount > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <span className="text-[11px] font-bold text-on-surface-variant">المتغيرات:</span>
                        {product.variants!.slice(0, 3).map((v, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-surface border border-on-surface/30 text-[10px] font-mono font-bold"
                          >
                            {v.color} / {v.size} ({v.stock})
                          </span>
                        ))}
                        {variantsCount > 3 && (
                          <span className="text-[10px] font-bold text-primary">
                            +{variantsCount - 3} آخرين
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Price & Stock Adjustment footer */}
                  <div className="pt-4 mt-3 border-t-2 border-on-surface/10 space-y-3">
                    <div className="flex items-baseline justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="font-extrabold text-xl text-primary">
                          {product.price.toLocaleString()} ج.م
                        </span>
                        {hasDiscount && (
                          <span className="line-through text-xs font-bold text-on-surface-variant/70">
                            {product.compare_price?.toLocaleString()} ج.م
                          </span>
                        )}
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${
                          isOutOfStock
                            ? "bg-gray-100 text-gray-800 border-gray-400"
                            : isLowStock
                            ? "bg-red-100 text-red-800 border-red-500"
                            : "bg-emerald-100 text-emerald-800 border-emerald-500"
                        }`}
                      >
                        {isOutOfStock ? "نفد المخزون ❌" : `المخزون: ${qty} قطعة`}
                      </span>
                    </div>

                    {/* Stock Stepper & Movement Ledger Button */}
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenHistoryModal(product)}
                        className="flex-1 py-1.5 px-2.5 rounded-xl border border-on-surface bg-surface-container hover:bg-surface-container-high text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        title="عرض سجل حركات المخزون (inventory_movements)"
                      >
                        <span className="material-symbols-outlined text-[15px]">history</span>
                        <span>سجل الحركات</span>
                      </button>

                      <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-on-surface/30">
                        <button
                          type="button"
                          onClick={() => handleQuickStockAdjustment(product.id, -1, "manual_adjustment")}
                          disabled={qty <= 0}
                          className="w-7 h-7 rounded-lg bg-surface-container border border-on-surface flex items-center justify-center hover:bg-surface-container-high disabled:opacity-30 cursor-pointer font-bold text-sm"
                          title="خصم 1 من المخزون وتسجيل الحركة"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-mono font-bold text-xs">{qty}</span>
                        <button
                          type="button"
                          onClick={() => handleQuickStockAdjustment(product.id, 1, "manual_adjustment")}
                          className="w-7 h-7 rounded-lg bg-surface-container border border-on-surface flex items-center justify-center hover:bg-surface-container-high cursor-pointer font-bold text-sm"
                          title="إضافة 1 للمخزون وتسجيل الحركة"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MODAL 1: Add / Edit Product with Variants & Multiple Images */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-surface-container-lowest border-2 border-on-surface rounded-2xl max-w-2xl w-full p-6 md:p-8 hard-shadow-sm space-y-5 animate-in zoom-in-95 my-8">
              <div className="flex items-center justify-between border-b-2 border-on-surface/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-2xl">
                    {editingProductId ? "edit_note" : "add_box"}
                  </span>
                  <h2 className="font-display-hero text-xl font-extrabold text-on-surface">
                    {editingProductId ? "تعديل بيانات المنتج والمتغيرات" : "إضافة منتج جديد للمتجر"}
                  </h2>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-surface-container text-on-surface-variant cursor-pointer text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitProduct} className="space-y-5">
                {/* 1. Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-on-surface mb-1">اسم المنتج *</label>
                    <input
                      type="text"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      placeholder="مثال: تي شيرت قطن سادة كاجوال (T-Shirt)"
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-on-surface bg-surface font-bold text-sm"
                      autoFocus
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">السعر الحالي (ج.م) *</label>
                    <input
                      type="number"
                      step="0.5"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      placeholder="350"
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-on-surface bg-surface font-bold text-sm"
                      required
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">
                      السعر قبل الخصم (Compare Price)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={productForm.compare_price}
                      onChange={(e) => setProductForm({ ...productForm, compare_price: e.target.value })}
                      placeholder="450 (اختياري)"
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-on-surface bg-surface font-bold text-sm"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">رمز المنتج (SKU الرئيسي)</label>
                    <input
                      type="text"
                      value={productForm.sku}
                      onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                      placeholder="TSHIRT-01"
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-on-surface bg-surface font-mono text-xs uppercase font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">حالة المنتج</label>
                    <select
                      value={productForm.status}
                      onChange={(e) => setProductForm({ ...productForm, status: e.target.value as any })}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-on-surface bg-surface text-xs font-bold"
                    >
                      <option value="active">نشط للبيع فوراً ✅</option>
                      <option value="draft">مسودة مؤقتة 📝</option>
                      <option value="archived">مؤرشف 🗄️</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">التصنيف</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-on-surface bg-surface text-xs font-bold"
                    >
                      <option value="fashion">أزياء وموضة 👗</option>
                      <option value="beauty">عناية وتجميل 💄</option>
                      <option value="electronics">إلكترونيات 📱</option>
                      <option value="food">طعام ومشروبات ☕</option>
                      <option value="general">عام 📦</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">
                      إجمالي كمية المخزن {productForm.variants.length > 0 && "(محسوب تلقائياً)"} *
                    </label>
                    <input
                      type="number"
                      value={productForm.inventory_quantity}
                      onChange={(e) => setProductForm({ ...productForm, inventory_quantity: e.target.value })}
                      placeholder="20"
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-on-surface bg-surface font-bold text-sm"
                      required
                      min="0"
                    />
                  </div>
                </div>

                {/* 2. Multiple Images Management */}
                <div className="space-y-3 p-4 rounded-xl border-2 border-on-surface/30 bg-surface">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px] text-primary">photo_library</span>
                      <span>صور المنتج (يمكنك إضافة أكثر من صورة)</span>
                    </label>
                    <span className="text-[11px] font-bold text-on-surface-variant">
                      {productForm.images.length} صور مضافة
                    </span>
                  </div>

                  {/* Thumbnail List */}
                  {productForm.images.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
                      {productForm.images.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className="relative h-24 rounded-xl border-2 border-on-surface overflow-hidden bg-surface-container group"
                        >
                          <img src={imgUrl} alt={`صورة ${idx + 1}`} className="w-full h-full object-cover" />
                          
                          {idx === 0 ? (
                            <span className="absolute top-1 start-1 px-1.5 py-0.5 rounded bg-primary text-on-primary text-[9px] font-black">
                              رئيسية
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryImage(idx)}
                              className="absolute top-1 start-1 px-1.5 py-0.5 rounded bg-surface/90 text-on-surface text-[9px] font-bold border border-on-surface hover:bg-primary hover:text-on-primary"
                              title="تعيين كصورة رئيسية"
                            >
                              اجعلها رئيسية
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1 end-1 w-5 h-5 rounded-full bg-error text-on-error flex items-center justify-center text-[10px] font-bold hover:scale-110 cursor-pointer shadow-sm"
                            title="حذف الصورة"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload box & Direct URL */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-on-surface/40 hover:border-primary rounded-xl bg-surface-container/30 hover:bg-surface-container/60 cursor-pointer transition-colors text-center">
                      {uploadingImage ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-xs font-bold text-primary">جاري رفع الصور...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-xl text-primary">cloud_upload</span>
                          <span className="text-xs font-bold text-on-surface">اضغط لرفع صورة أو أكثر</span>
                        </div>
                      )}
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleMultipleFilesUpload}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                    </label>

                    <div className="flex items-center gap-1.5">
                      <input
                        type="url"
                        value={productForm.newImageUrl}
                        onChange={(e) => setProductForm({ ...productForm, newImageUrl: e.target.value })}
                        placeholder="أو أضف رابط صورة مباشر..."
                        className="flex-1 px-3 py-2 rounded-xl border-2 border-on-surface bg-surface text-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleAddDirectImageUrl}
                        className="px-3 py-2 rounded-xl border-2 border-on-surface bg-primary text-on-primary text-xs font-bold cursor-pointer"
                      >
                        إضافة
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. Variants Builder (Colors / Sizes / SKU / Price / Stock) */}
                <div className="space-y-3 p-4 rounded-xl border-2 border-on-surface/30 bg-surface">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[18px] text-primary">style</span>
                        <span>متغيرات المنتج (Variants: المقاسات والألوان والأسعار)</span>
                      </h4>
                      <p className="text-[11px] text-on-surface-variant mt-0.5">
                        مثال: Black / S, M, L و White / S, M, L مع مخزون وسعر مستقل لكل متغير
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddCustomVariant}
                      className="px-3 py-1 rounded-full border border-on-surface bg-surface-container text-xs font-bold hover:bg-surface-container-high cursor-pointer"
                    >
                      + إضافة متغير يدوي
                    </button>
                  </div>

                  {/* Quick Generator Row */}
                  <div className="p-3 rounded-xl bg-surface-container/50 border border-on-surface/20 space-y-2">
                    <span className="text-[11px] font-extrabold text-on-surface block">
                      ⚡ توليد المتغيرات تلقائياً (Generator):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-on-surface-variant block mb-1">الألوان (مفصولة بفواصل):</span>
                        <input
                          type="text"
                          value={productForm.genColors}
                          onChange={(e) => setProductForm({ ...productForm, genColors: e.target.value })}
                          placeholder="أسود, أبيض"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-on-surface text-xs font-bold"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-on-surface-variant block mb-1">المقاسات (مفصولة بفواصل):</span>
                        <input
                          type="text"
                          value={productForm.genSizes}
                          onChange={(e) => setProductForm({ ...productForm, genSizes: e.target.value })}
                          placeholder="S, M, L"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-on-surface text-xs font-bold"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={handleGenerateVariants}
                          className="w-full py-2 rounded-lg border-2 border-on-surface bg-secondary-fixed text-on-secondary-fixed text-xs font-extrabold hard-shadow-sm hover:scale-[1.02] cursor-pointer"
                        >
                          توليد جميع المتغيرات
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Variants Table */}
                  {productForm.variants.length > 0 && (
                    <div className="overflow-x-auto border-2 border-on-surface rounded-xl">
                      <table className="w-full text-start text-xs">
                        <thead className="bg-surface-container text-on-surface-variant font-extrabold border-b border-on-surface">
                          <tr>
                            <th className="p-2 text-start">اللون (Color)</th>
                            <th className="p-2 text-start">المقاس (Size)</th>
                            <th className="p-2 text-start">رمز المتغير (SKU)</th>
                            <th className="p-2 text-start">السعر (ج.م)</th>
                            <th className="p-2 text-start">المخزون (Stock)</th>
                            <th className="p-2 text-end">إجراء</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-on-surface/10 bg-surface">
                          {productForm.variants.map((variant, vIdx) => (
                            <tr key={vIdx}>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={variant.color}
                                  onChange={(e) => handleUpdateVariantField(vIdx, "color", e.target.value)}
                                  className="w-20 px-2 py-1 rounded border border-on-surface font-bold text-xs"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={variant.size}
                                  onChange={(e) => handleUpdateVariantField(vIdx, "size", e.target.value)}
                                  className="w-16 px-2 py-1 rounded border border-on-surface font-bold text-xs"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={variant.sku}
                                  onChange={(e) => handleUpdateVariantField(vIdx, "sku", e.target.value)}
                                  className="w-32 px-2 py-1 rounded border border-on-surface font-mono text-xs uppercase"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  value={variant.price}
                                  onChange={(e) => handleUpdateVariantField(vIdx, "price", e.target.value)}
                                  className="w-20 px-2 py-1 rounded border border-on-surface font-bold text-xs"
                                  min="0"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  value={variant.stock}
                                  onChange={(e) => handleUpdateVariantField(vIdx, "stock", e.target.value)}
                                  className="w-16 px-2 py-1 rounded border border-on-surface font-bold text-xs"
                                  min="0"
                                />
                              </td>
                              <td className="p-2 text-end">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveVariant(vIdx)}
                                  className="text-error hover:bg-error-container/40 p-1 rounded cursor-pointer"
                                  title="حذف المتغير"
                                >
                                  <span className="material-symbols-outlined text-[16px]">close</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* 4. Description */}
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">وصف وتفاصيل المنتج (اختياري)</label>
                  <textarea
                    rows={2}
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="الخامة، تعليمات الغسيل، جدول المقاسات بالسنتيمتر..."
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-on-surface bg-surface text-xs"
                  />
                </div>

                {/* Submit Actions */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-on-surface/10">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-full border-2 border-on-surface bg-surface text-xs font-bold hover:bg-surface-container cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-interactive btn-shimmer px-6 py-2.5 rounded-full bg-primary text-on-primary border-2 border-on-surface font-bold text-xs hard-shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? "جاري الحفظ في السحابة..." : editingProductId ? "تحديث المنتج" : "حفظ المنتج"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: Inventory Movements Ledger History (سجل حركات المخزون) */}
        {selectedProductForHistory && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-surface-container-lowest border-2 border-on-surface rounded-2xl max-w-2xl w-full p-6 md:p-8 hard-shadow-sm space-y-5 animate-in zoom-in-95 my-8">
              <div className="flex items-center justify-between border-b-2 border-on-surface/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-2xl">history_edu</span>
                  <div>
                    <h2 className="font-display-hero text-xl font-extrabold text-on-surface">
                      سجل حركات المخزون (Inventory Movements)
                    </h2>
                    <p className="text-xs text-on-surface-variant font-medium">
                      المنتج: {selectedProductForHistory.name} | الرصيد الحالي: {selectedProductForHistory.inventory_quantity} قطعة
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProductForHistory(null)}
                  className="p-1.5 rounded-full hover:bg-surface-container text-on-surface-variant cursor-pointer text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Manual Movement Entry Form */}
              <form
                onSubmit={handleSubmitManualMovement}
                className="p-4 rounded-xl border-2 border-primary bg-surface space-y-3"
              >
                <span className="text-xs font-extrabold text-on-surface block">
                  + تسجيل حركة مخزون جديدة (تسوية جرد / إضافة / خصم):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-on-surface-variant block mb-1">الكمية (+ أو -):</span>
                    <input
                      type="number"
                      value={manualAdjustmentForm.changeAmount}
                      onChange={(e) => setManualAdjustmentForm({ ...manualAdjustmentForm, changeAmount: e.target.value })}
                      placeholder="مثال: +10 أو -2"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-on-surface text-xs font-bold font-mono"
                      required
                    />
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-on-surface-variant block mb-1">السبب:</span>
                    <select
                      value={manualAdjustmentForm.reason}
                      onChange={(e) => setManualAdjustmentForm({ ...manualAdjustmentForm, reason: e.target.value as any })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-on-surface text-xs font-bold"
                    >
                      <option value="manual_adjustment">تعديل يدوي (تسوية جرد)</option>
                      <option value="restock">إعادة تزويد (شحنة جديدة)</option>
                      <option value="order">طلب شراء عميل (Order)</option>
                      <option value="return">مرتجع من عميل (Return)</option>
                    </select>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-on-surface-variant block mb-1">ملاحظة / السبب:</span>
                    <input
                      type="text"
                      value={manualAdjustmentForm.notes}
                      onChange={(e) => setManualAdjustmentForm({ ...manualAdjustmentForm, notes: e.target.value })}
                      placeholder="فحص دوري / استبدال"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-on-surface text-xs"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-2 rounded-lg border-2 border-on-surface bg-primary text-on-primary text-xs font-bold hard-shadow-sm cursor-pointer"
                    >
                      تسجيل الحركة
                    </button>
                  </div>
                </div>
              </form>

              {/* Movements Timeline Table */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-on-surface">سجل الحركات التاريخي:</span>
                {loadingMovements ? (
                  <div className="text-center py-6">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </div>
                ) : movementsHistory.length === 0 ? (
                  <div className="p-6 text-center text-xs text-on-surface-variant border border-on-surface/20 rounded-xl">
                    لا توجد حركات مسجلة بعد لهذا المنتج. أي تعديل للمخزون سيظهر هنا بالرصيد السابق والجديد فوراً.
                  </div>
                ) : (
                  <div className="overflow-x-auto border-2 border-on-surface rounded-xl max-h-64 overflow-y-auto">
                    <table className="w-full text-start text-xs">
                      <thead className="bg-surface-container text-on-surface-variant font-extrabold sticky top-0 border-b border-on-surface">
                        <tr>
                          <th className="p-2.5 text-start">التاريخ والوقت</th>
                          <th className="p-2.5 text-start">الحركة (التغيير)</th>
                          <th className="p-2.5 text-start">الرصيد السابق ➔ الجديد</th>
                          <th className="p-2.5 text-start">السبب</th>
                          <th className="p-2.5 text-start">ملاحظات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-on-surface/10 bg-surface">
                        {movementsHistory.map((m, idx) => {
                          const isPositive = m.quantity_change > 0;
                          return (
                            <tr key={m.id || idx} className="hover:bg-surface-container/40">
                              <td className="p-2.5 font-mono text-[11px] text-on-surface-variant">
                                {m.created_at
                                  ? new Date(m.created_at).toLocaleString("ar-EG", {
                                      dateStyle: "short",
                                      timeStyle: "short",
                                    })
                                  : "الآن"}
                              </td>
                              <td className="p-2.5">
                                <span
                                  className={`px-2 py-0.5 rounded-full font-mono font-black text-xs border ${
                                    isPositive
                                      ? "bg-emerald-100 text-emerald-800 border-emerald-500"
                                      : "bg-red-100 text-red-800 border-red-500"
                                  }`}
                                >
                                  {isPositive ? `+${m.quantity_change}` : m.quantity_change}
                                </span>
                              </td>
                              <td className="p-2.5 font-mono font-bold">
                                <span>{m.previous_quantity}</span>
                                <span className="text-on-surface-variant mx-1.5">➔</span>
                                <span className="text-primary font-black">{m.new_quantity}</span>
                              </td>
                              <td className="p-2.5">
                                <span className="px-2 py-0.5 rounded bg-surface-container text-[11px] font-bold border border-on-surface/20">
                                  {m.reason === "order"
                                    ? "طلب شراء (Order)"
                                    : m.reason === "return"
                                    ? "مرتجع (Return)"
                                    : m.reason === "restock"
                                    ? "توريد بضاعة"
                                    : "تعديل يدوي"}
                                </span>
                              </td>
                              <td className="p-2.5 text-on-surface-variant text-[11px]">
                                {m.notes || "—"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-3 border-t border-on-surface/10">
                <button
                  type="button"
                  onClick={() => setSelectedProductForHistory(null)}
                  className="px-5 py-2.5 rounded-full border-2 border-on-surface bg-surface text-xs font-bold hover:bg-surface-container cursor-pointer"
                >
                  إغلاق السجل
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}