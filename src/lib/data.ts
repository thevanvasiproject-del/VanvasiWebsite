import {
  Batch,
  DashboardStockSummary,
  DeliveryArea,
  FulfilmentType,
  InventoryMovement,
  MovementType,
  Order,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Product,
  VariantAvailability,
} from "@/types";
import { prisma } from "./prisma";

// Business rule constants
export const MIN_SELLABLE_DAYS = 7; // Batches expiring within 7 days cannot be sold to customers
export const EXPIRY_ALERT_DAYS = 14; // Alert admin when a batch is within 14 days of expiry
export const LOW_STOCK_THRESHOLD = 5; // Alert admin when a variant has 5 or fewer sellable units

/**
 * Calculates days remaining between today and a given date string (YYYY-MM-DD).
 */
export function getDaysUntil(dateString: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateString);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Checks whether a batch is sellable under the rule:
 * bestBefore must be more than MIN_SELLABLE_DAYS (7) days away and quantityRemaining > 0.
 */
export function isBatchSellable(batch: Batch): boolean {
  if (batch.quantityRemaining <= 0) return false;
  const daysUntil = getDaysUntil(batch.bestBefore);
  return daysUntil > MIN_SELLABLE_DAYS;
}

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "prod_hhb",
    name: "Hot Honey Butter",
    slug: "hot-honey-butter",
    characterTitle: "The Fiery Artisan",
    tagline: "Whipped highland butter infused with raw honey & smoked bird's eye chili.",
    description: "Crafted in small batches using slow-churned butter from mountain dairies, blended with uncooked Himalayan honey and whole bird's eye chilies smoked over oak chips.",
    ingredients: [
      "Cultured highland butter (pasteurized cow's milk, live cultures)",
      "Raw multifloral wild honey (unpasteurized, sourced from Makwanpur)",
      "Bird's eye chili flakes & smoked pods",
      "Hand-harvested Himalayan pink mineral salt",
    ],
    isActive: true,
    createdAt: "2026-09-10T00:00:00.000Z",
    updatedAt: "2026-09-10T00:00:00.000Z",
    images: [
      {
        id: "img_hhb_1",
        productId: "prod_hhb",
        url: "/images/hot-honey-butter.svg",
        altText: "Hot Honey Butter Jar",
        isPrimary: true,
        sortOrder: 1,
      },
    ],
    variants: [
      { id: "var_hhb_100", productId: "prod_hhb", size: "100 g", price: 450, sku: "TVP-HHB-100", isActive: true, createdAt: "2026-09-10T00:00:00.000Z", sellableStock: 18 },
      { id: "var_hhb_250", productId: "prod_hhb", size: "250 g", price: 950, sku: "TVP-HHB-250", isActive: true, createdAt: "2026-09-10T00:00:00.000Z", sellableStock: 14 },
    ],
    minPrice: 450,
  },
  {
    id: "prod_gb",
    name: "Garlic Butter",
    slug: "garlic-butter",
    characterTitle: "The Roasted Classic",
    tagline: "Slow-roasted garlic confit folded into sea-salted alpine butter.",
    description: "Whole local garlic cloves poached at 85°C for four hours in cold-pressed mustard oil until spreadable like cream, then beaten into fresh butter.",
    ingredients: [
      "Cultured highland butter (pasteurized cow's milk)",
      "Roasted local organic garlic confit",
      "Cold-pressed virgin mustard oil",
      "Fresh dried mountain thyme",
      "Flaky sea salt",
    ],
    isActive: true,
    createdAt: "2026-09-14T00:00:00.000Z",
    updatedAt: "2026-09-14T00:00:00.000Z",
    images: [
      {
        id: "img_gb_1",
        productId: "prod_gb",
        url: "/images/garlic-butter.svg",
        altText: "Garlic Butter Jar",
        isPrimary: true,
        sortOrder: 1,
      },
    ],
    variants: [
      { id: "var_gb_100", productId: "prod_gb", size: "100 g", price: 400, sku: "TVP-GB-100", isActive: true, createdAt: "2026-09-14T00:00:00.000Z", sellableStock: 22 },
      { id: "var_gb_250", productId: "prod_gb", size: "250 g", price: 850, sku: "TVP-GB-250", isActive: true, createdAt: "2026-09-14T00:00:00.000Z", sellableStock: 8 },
    ],
    minPrice: 400,
  },
];

const FALLBACK_DELIVERY_AREAS: DeliveryArea[] = [
  { id: "area_ktm_ring", name: "Inside Kathmandu Ring Road", deliveryFee: 100, isActive: true, createdAt: "2026-09-10T00:00:00.000Z" },
  { id: "area_ktm_outer", name: "Outside Ring Road (up to 5 km)", deliveryFee: 150, isActive: true, createdAt: "2026-09-10T00:00:00.000Z" },
  { id: "area_lalitpur", name: "Lalitpur (Patan, Pulchowk, Jhamsikhel)", deliveryFee: 100, isActive: true, createdAt: "2026-09-10T00:00:00.000Z" },
  { id: "area_bhaktapur", name: "Bhaktapur Core", deliveryFee: 200, isActive: true, createdAt: "2026-09-10T00:00:00.000Z" },
];

/**
 * Fetches all active products with their variants, images, and live sellable stock.
 */
export async function getProducts(): Promise<Product[]> {
  try {
    const dbProducts = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: {
          where: { isActive: true },
          include: { batches: true },
        },
      },
    });

    if (!dbProducts || dbProducts.length === 0) {
      return FALLBACK_PRODUCTS;
    }

    return dbProducts.map((p) => {
      let parsedIngredients: string[] = [];
      try {
        parsedIngredients = JSON.parse(p.ingredients);
      } catch {
        parsedIngredients = p.ingredients.split(",").map((s) => s.trim());
      }

      const variantsWithStock = p.variants.map((v) => {
        const sellableStock = v.batches
          .filter((b) => b.quantityRemaining > 0 && getDaysUntil(b.bestBefore) > MIN_SELLABLE_DAYS)
          .reduce((sum, b) => sum + b.quantityRemaining, 0);

        return {
          id: v.id,
          productId: v.productId,
          size: v.size,
          price: v.price,
          sku: v.sku,
          isActive: v.isActive,
          createdAt: v.createdAt.toISOString(),
          sellableStock,
        };
      });

      const minPrice = variantsWithStock.reduce(
        (min, v) => (v.price < min ? v.price : min),
        variantsWithStock[0]?.price ?? 0
      );

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        characterTitle: p.characterTitle || undefined,
        tagline: p.tagline,
        description: p.description,
        ingredients: parsedIngredients,
        isActive: p.isActive,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
        images: p.images.map((img) => ({
          id: img.id,
          productId: img.productId,
          url: img.url,
          altText: img.altText,
          isPrimary: img.isPrimary,
          sortOrder: img.sortOrder,
        })),
        variants: variantsWithStock,
        minPrice,
      };
    });
  } catch (error) {
    console.error("Database unavailable in getProducts, using fallback:", error);
    return FALLBACK_PRODUCTS;
  }
}

/**
 * Fetches a single product by slug from Prisma.
 */
export async function getProduct(slug: string): Promise<Product | null> {
  try {
    const p = await prisma.product.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: {
          where: { isActive: true },
          include: { batches: true },
        },
      },
    });

    if (!p) {
      return FALLBACK_PRODUCTS.find((item) => item.slug === slug) || null;
    }

  let parsedIngredients: string[] = [];
  try {
    parsedIngredients = JSON.parse(p.ingredients);
  } catch {
    parsedIngredients = p.ingredients.split(",").map((s) => s.trim());
  }

  const variantsWithStock = p.variants.map((v) => {
    const sellableStock = v.batches
      .filter((b) => b.quantityRemaining > 0 && getDaysUntil(b.bestBefore) > MIN_SELLABLE_DAYS)
      .reduce((sum, b) => sum + b.quantityRemaining, 0);

    return {
      id: v.id,
      productId: v.productId,
      size: v.size,
      price: v.price,
      sku: v.sku,
      isActive: v.isActive,
      createdAt: v.createdAt.toISOString(),
      sellableStock,
    };
  });

  const minPrice = variantsWithStock.reduce(
    (min, v) => (v.price < min ? v.price : min),
    variantsWithStock[0]?.price ?? 0
  );

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    characterTitle: p.characterTitle || undefined,
    tagline: p.tagline,
    description: p.description,
    ingredients: parsedIngredients,
    isActive: p.isActive,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    images: p.images.map((img) => ({
      id: img.id,
      productId: img.productId,
      url: img.url,
      altText: img.altText,
      isPrimary: img.isPrimary,
      sortOrder: img.sortOrder,
    })),
    variants: variantsWithStock,
    minPrice,
  };
  } catch (error) {
    console.error("Database unavailable in getProduct, using fallback:", error);
    return FALLBACK_PRODUCTS.find((item) => item.slug === slug) || null;
  }
}

/**
 * Fetches a product by its ID.
 */
export async function getProductById(id: string): Promise<Product | null> {
  const p = await prisma.product.findUnique({ where: { id } });
  if (!p) return null;
  return getProduct(p.slug);
}

/**
 * Uncached availability endpoint for client-side stock checking against live batches.
 */
export async function getAvailability(
  variantIds: string[]
): Promise<Record<string, VariantAvailability>> {
  const result: Record<string, VariantAvailability> = {};

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: {
      batches: {
        where: { quantityRemaining: { gt: 0 } },
        orderBy: { bestBefore: "asc" },
      },
    },
  });

  for (const v of variants) {
    const sellableBatches = v.batches.filter(
      (b) => getDaysUntil(b.bestBefore) > MIN_SELLABLE_DAYS
    );

    const stock = sellableBatches.reduce((sum, b) => sum + b.quantityRemaining, 0);

    result[v.id] = {
      variantId: v.id,
      sellableStock: stock,
      isAvailable: stock > 0,
      earliestBestBefore: sellableBatches[0]?.bestBefore,
    };
  }

  return result;
}

/**
 * Fetches active delivery areas in Kathmandu from Prisma.
 */
export async function getDeliveryAreas(): Promise<DeliveryArea[]> {
  try {
    const areas = await prisma.deliveryArea.findMany({
      where: { isActive: true },
      orderBy: { deliveryFee: "asc" },
    });

    if (!areas || areas.length === 0) {
      return FALLBACK_DELIVERY_AREAS;
    }

    return areas.map((a) => ({
      id: a.id,
      name: a.name,
      deliveryFee: a.deliveryFee,
      isActive: a.isActive,
      createdAt: a.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("Database unavailable in getDeliveryAreas, using fallback:", error);
    return FALLBACK_DELIVERY_AREAS;
  }
}

/**
 * Fetches all orders from Prisma (for admin list).
 */
export async function getOrders(): Promise<Order[]> {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: { batches: true },
        },
      },
    });

    return orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      customerEmail: o.customerEmail || undefined,
      fulfilmentType: o.fulfilmentType as FulfilmentType,
      deliveryAddress: o.deliveryAddress || undefined,
      deliveryAreaId: o.deliveryAreaId || undefined,
      subtotalAmount: o.subtotal,
      deliveryFee: o.deliveryFee,
      totalAmount: o.totalAmount,
      orderStatus: o.orderStatus as OrderStatus,
      paymentMethod: o.paymentMethod as PaymentMethod,
      paymentStatus: o.paymentStatus as PaymentStatus,
      customerNotes: o.customerNotes || undefined,
      createdAt: o.createdAt.toISOString(),
      items: o.items.map((i) => ({
        id: i.id,
        orderId: i.orderId,
        productId: i.productId,
        variantId: i.variantId,
        productName: i.productName,
        variantSize: i.variantSize,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
        totalPrice: i.totalPrice,
        batches: i.batches.map((b) => ({
          id: b.id,
          orderItemId: b.orderItemId,
          batchId: b.batchId,
          batchCode: b.batchCode,
          quantity: b.quantity,
        })),
      })),
    }));
  } catch (error) {
    console.error("Database unavailable in getOrders, returning empty array:", error);
    return [];
  }
}

/**
 * Fetches a single order by ID from Prisma.
 */
export async function getOrder(id: string): Promise<Order | null> {
  try {
    const o = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { batches: true },
        },
      },
    });

    if (!o) return null;

    return {
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      customerEmail: o.customerEmail || undefined,
      fulfilmentType: o.fulfilmentType as FulfilmentType,
      deliveryAddress: o.deliveryAddress || undefined,
      deliveryAreaId: o.deliveryAreaId || undefined,
      subtotalAmount: o.subtotal,
      deliveryFee: o.deliveryFee,
      totalAmount: o.totalAmount,
      orderStatus: o.orderStatus as OrderStatus,
      paymentMethod: o.paymentMethod as PaymentMethod,
      paymentStatus: o.paymentStatus as PaymentStatus,
      customerNotes: o.customerNotes || undefined,
      createdAt: o.createdAt.toISOString(),
      items: o.items.map((i) => ({
        id: i.id,
        orderId: i.orderId,
        productId: i.productId,
        variantId: i.variantId,
        productName: i.productName,
        variantSize: i.variantSize,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
        totalPrice: i.totalPrice,
        batches: i.batches.map((b) => ({
          id: b.id,
          orderItemId: b.orderItemId,
          batchId: b.batchId,
          batchCode: b.batchCode,
          quantity: b.quantity,
        })),
      })),
    };
  } catch (error) {
    console.error("Database unavailable in getOrder, returning null:", error);
    return null;
  }
}

/**
 * Consolidated stock summary for the Admin Dashboard from Prisma.
 */
export async function getDashboardStockSummary(): Promise<DashboardStockSummary> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const batches = await prisma.batch.findMany({
      include: {
        variant: {
          include: { product: true },
        },
      },
      orderBy: { bestBefore: "asc" },
    });

    const expiringBatches = [];
    const expiredWithStock = [];

    for (const b of batches) {
      if (b.quantityRemaining <= 0) continue;
      const days = getDaysUntil(b.bestBefore);
      if (days >= 0 && days <= EXPIRY_ALERT_DAYS) {
        expiringBatches.push({
          id: b.id,
          variantId: b.variantId,
          batchCode: b.batchCode,
          madeOn: b.madeOn,
          bestBefore: b.bestBefore,
          quantityReceived: b.quantityReceived,
          quantityRemaining: b.quantityRemaining,
          createdAt: b.createdAt.toISOString(),
          productName: b.variant.product.name,
          variantSize: b.variant.size,
          daysRemaining: days,
        });
      } else if (days < 0) {
        expiredWithStock.push({
          id: b.id,
          variantId: b.variantId,
          batchCode: b.batchCode,
          madeOn: b.madeOn,
          bestBefore: b.bestBefore,
          quantityReceived: b.quantityReceived,
          quantityRemaining: b.quantityRemaining,
          createdAt: b.createdAt.toISOString(),
          productName: b.variant.product.name,
          variantSize: b.variant.size,
        });
      }
    }

    // Low stock variants
    const variants = await prisma.productVariant.findMany({
      where: { isActive: true },
      include: {
        product: true,
        batches: true,
      },
    });

    const lowStockVariants = [];
    for (const v of variants) {
      const sellableStock = v.batches
        .filter((b) => b.quantityRemaining > 0 && getDaysUntil(b.bestBefore) > MIN_SELLABLE_DAYS)
        .reduce((sum, b) => sum + b.quantityRemaining, 0);

      if (sellableStock <= LOW_STOCK_THRESHOLD) {
        lowStockVariants.push({
          id: v.id,
          productId: v.productId,
          size: v.size,
          price: v.price,
          sku: v.sku,
          isActive: v.isActive,
          createdAt: v.createdAt.toISOString(),
          productName: v.product.name,
          sellableStock,
        });
      }
    }

    return {
      expiringBatches,
      expiredWithStock,
      lowStockVariants,
    };
  } catch (error) {
    console.error("Database unavailable in getDashboardStockSummary:", error);
    return {
      expiringBatches: [],
      expiredWithStock: [],
      lowStockVariants: [],
    };
  }
}

/**
 * Returns all batches with flavour and variant details from Prisma.
 */
export async function getAllBatches(): Promise<
  (Batch & { productName: string; variantSize: string; price: number })[]
> {
  try {
    const batches = await prisma.batch.findMany({
      include: {
        variant: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return batches.map((b) => ({
      id: b.id,
      variantId: b.variantId,
      batchCode: b.batchCode,
      madeOn: b.madeOn,
      bestBefore: b.bestBefore,
      quantityReceived: b.quantityReceived,
      quantityRemaining: b.quantityRemaining,
      createdAt: b.createdAt.toISOString(),
      productName: b.variant.product.name,
      variantSize: b.variant.size,
      price: b.variant.price,
    }));
  } catch (error) {
    console.error("Database unavailable in getAllBatches, returning empty array:", error);
    return [];
  }
}

/**
 * Returns the inventory movement audit trail from Prisma.
 */
export async function getInventoryMovements(): Promise<
  (InventoryMovement & {
    productName: string;
    variantSize: string;
    batchCode: string;
  })[]
> {
  try {
    const movements = await prisma.inventoryMovement.findMany({
      orderBy: { timestamp: "desc" },
      include: {
        variant: {
          include: { product: true },
        },
        batch: true,
      },
    });

    return movements.map((m) => ({
      id: m.id,
      variantId: m.variantId,
      batchId: m.batchId,
      changeAmount: m.changeAmount,
      type: m.type as MovementType,
      reason: m.reason,
      createdBy: m.createdBy,
      timestamp: m.timestamp.toISOString(),
      productName: m.variant.product.name,
      variantSize: m.variant.size,
      batchCode: m.batch.batchCode,
    }));
  } catch (error) {
    console.error("Database unavailable in getInventoryMovements, returning empty array:", error);
    return [];
  }
}
