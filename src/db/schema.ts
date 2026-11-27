export * from './auth-schema'
import { user } from './auth-schema'
import { index, integer, primaryKey, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core'

export const menuCategories = sqliteTable('menu_categories', {
  id: text('id').primaryKey(), title: text('title').notNull(),
  sourceFlag2: integer('source_flag_2', { mode: 'boolean' }).notNull().default(false),
  sourceFlag3: integer('source_flag_3', { mode: 'boolean' }).notNull().default(false),
  position: integer('position').notNull(), sourceRowJson: text('source_row_json'),
})
export const menuProducts = sqliteTable('menu_products', {
  id: text('id').primaryKey(), title: text('title').notNull(), priceMinor: integer('price_minor').notNull(),
  comparePriceMinor: integer('compare_price_minor'), imageUrl: text('image_url').notNull().default(''),
  sourceFlag6: integer('source_flag_6', { mode: 'boolean' }).notNull().default(false),
  sourceText7: text('source_text_7').notNull().default(''), sourceOptionsJson: text('source_options_json').notNull().default('[]'),
  sourceRowJson: text('source_row_json'),
})
export const menuCategoryProducts = sqliteTable('menu_category_products', {
  id: text('id').primaryKey(), categoryId: text('category_id').notNull().references(() => menuCategories.id, { onDelete: 'cascade' }),
  productId: text('product_id').notNull().references(() => menuProducts.id, { onDelete: 'cascade' }),
  position: integer('position').notNull(), hidden: integer('hidden', { mode: 'boolean' }).notNull().default(false),
}, (t) => [unique().on(t.categoryId, t.productId)])
export const coffeeNotes = sqliteTable('coffee_notes', {
  id: text('id').primaryKey(), userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  sourceId: text('source_id').unique(), title: text('title').notNull(), body: text('body').notNull(),
  fileKey: text('file_key'), fileName: text('file_name'), fileType: text('file_type'), fileSize: integer('file_size'),
  encryptionKey: text('encryption_key'), encryptionIv: text('encryption_iv'), createdAt: text('created_at').notNull(),
}, (t) => [index('coffee_notes_owner_idx').on(t.userId, t.createdAt)])
export const migrationIdentityMap = sqliteTable('migration_identity_map', {
  sourceSystem: text('source_system').notNull(), sourceUserId: text('source_user_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }), sourceProfileId: text('source_profile_id'),
}, (t) => [primaryKey({ columns: [t.sourceSystem, t.sourceUserId] })])
export const noteSaveAttempts = sqliteTable('note_save_attempts', {
  id: text('id').primaryKey(), userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  payloadHash: text('payload_hash').notNull(), state: text('state', { enum: ['pending', 'saved', 'failed'] }).notNull(),
  createdAt: text('created_at').notNull(),
}, (t) => [index('note_attempts_owner_idx').on(t.userId)])
export type CoffeeNote = typeof coffeeNotes.$inferSelect
