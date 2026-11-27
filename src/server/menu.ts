import { createServerFn } from '@tanstack/react-start'
import { asc, eq } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { menuCategories, menuProducts, menuCategoryProducts } from '@/db/schema'

export const getMenu = createServerFn({ method: 'GET' }).handler(async () => {
  const db = await getDb()
  const rows = await db.select({
    id: menuProducts.id, title: menuProducts.title, priceMinor: menuProducts.priceMinor,
    imageUrl: menuProducts.imageUrl, categoryId: menuCategories.id, category: menuCategories.title,
    hidden: menuCategoryProducts.hidden,
  }).from(menuCategoryProducts)
    .innerJoin(menuCategories, eq(menuCategoryProducts.categoryId, menuCategories.id))
    .innerJoin(menuProducts, eq(menuCategoryProducts.productId, menuProducts.id))
    .orderBy(asc(menuCategories.position), asc(menuCategories.id), asc(menuCategoryProducts.position), asc(menuCategoryProducts.id))
  return rows
})
