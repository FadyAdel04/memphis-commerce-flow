# WASLA Order Lifecycle, Inventory & AI Detection

## 1. Order Lifecycle State Machine

```text
       [AI Order Detection] / [Manual Agent Entry]
                           │
                           v
                       [ DRAFT ]
                           │
             Merchant sends quote to customer
                           │
                           v
              [ PENDING_CONFIRMATION ]
                           │
             Customer confirms via WhatsApp/Chat
                           │
                           v
                     [ CONFIRMED ]
                           │ (Triggers: inventory reservation/movement)
                           v
                    [ PREPARING ]
                           │ (Waybill & packing slip generated)
                           v
                      [ SHIPPED ]
                           │ (Courier tracking number attached)
                           v
                     [ DELIVERED ]
```

### Cancellation and Return Paths
- From `DRAFT`, `PENDING_CONFIRMATION`, or `CONFIRMED`: Can transition to `CANCELLED`. If confirmed, stock reservation is released.
- From `DELIVERED`: Can transition to `RETURNED`. Triggers inbound inventory movement and refunds if applicable.

---

## 2. Inventory Movements
Every physical stock alteration must write an immutable entry to `inventory_movements`:
- `movement_type = 'reserved'`: Order enters `CONFIRMED`.
- `movement_type = 'out'`: Order enters `SHIPPED`.
- `movement_type = 'in'`: Order cancelled or returned, or manual supplier restock.
- `movement_type = 'adjustment'`: Physical inventory audit corrections.

---

## 3. AI Order Detection Pipeline

### Hybrid Architecture
1. **Rule-based triage**:
   - Check if message contains commercial purchase keywords ("عايز", "عاوز", "طلب", "اشتري", "احجزلي", "سعر", "مقاس", "شحن").
   - If not relevant, skip LLM to save latency and token cost.
2. **LLM Extraction**:
   - Prompt LLM with system context + merchant's available product list (names & variants).
   - Require structured output conforming to Zod schema:
   ```typescript
   import { z } from 'zod';

   export const OrderDetectionSchema = z.object({
     intent: z.enum(['purchase', 'inquiry', 'complaint', 'other']),
     confidence: z.number().min(0).max(1),
     customer_name: z.string().optional(),
     items: z.array(
       z.object({
         product_query: z.string(),
         variant_query: z.string().optional(),
         quantity: z.number().int().positive().default(1),
         size: z.string().optional(),
         color: z.string().optional(),
       })
     ),
     shipping_address: z.object({
       governorate: z.string().optional(),
       city: z.string().optional(),
       street: z.string().optional(),
     }).optional(),
     payment_method: z.enum(['cod', 'instapay', 'card']).optional(),
   });
   ```
3. **Draft Creation**:
   - Save detection event to `ai_order_detections`.
   - Insert `orders` record with `status: 'DRAFT'`.
   - Insert `order_items` mapped to closest SKU.
   - Show interactive banner in merchant inbox for one-click review and confirmation.
