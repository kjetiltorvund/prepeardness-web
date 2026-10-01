// Looks up product metadata for a scanned EAN/UPC barcode in Open Food Facts.
// The API is free and needs no key: https://openfoodfacts.github.io/openfoodfacts-server/api/

const OFF_URL = 'https://world.openfoodfacts.org/api/v2/product'
const FIELDS = [
  'product_name',
  'product_name_no',
  'product_name_nb',
  'generic_name',
  'brands',
  'categories',
  'product_quantity',
  'product_quantity_unit',
  'image_front_small_url',
].join(',')

export interface ProductInfo {
  name: string
  brand: string | null
  category: string | null
  quantity: number | null
  unit: string | null
  imageUrl: string | null
}

interface OffProduct {
  product_name?: string
  product_name_no?: string
  product_name_nb?: string
  generic_name?: string
  brands?: string
  categories?: string
  product_quantity?: number | string
  product_quantity_unit?: string
  image_front_small_url?: string
}

/** Returns product info, or null if the barcode is unknown or the lookup fails. */
export async function lookupProduct(barcode: string): Promise<ProductInfo | null> {
  try {
    const response = await fetch(`${OFF_URL}/${encodeURIComponent(barcode)}.json?fields=${FIELDS}`)
    if (!response.ok) return null

    const data: { status: number; product?: OffProduct } = await response.json()
    const product = data.product
    if (data.status !== 1 || !product) return null

    const name =
      product.product_name_no || product.product_name_nb || product.product_name || product.generic_name || ''
    const brand = firstOf(product.brands)
    const quantity = Number(product.product_quantity)

    return {
      name: brand && name && !name.toLowerCase().includes(brand.toLowerCase()) ? `${brand} ${name}` : name,
      brand,
      // Categories are ordered general → specific; entries like "fr:Nutella" are untranslated tags.
      category: firstOf(product.categories?.split(',').filter((c) => !c.includes(':')).join(',')),
      quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : null,
      unit: product.product_quantity_unit || null,
      imageUrl: product.image_front_small_url || null,
    }
  } catch (cause) {
    console.error('Product lookup failed', cause)
    return null
  }
}

function firstOf(list: string | undefined): string | null {
  return list?.split(',')[0]?.trim() || null
}
