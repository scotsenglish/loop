import type { Category } from '@/types'

export const DEFAULT_EXPENSE_CATEGORIES: Omit<Category, 'id'>[] = [
  { name: 'Ăn uống', icon: '🍜', color: '#F59E0B', type: 'expense', order: 0 },
  { name: 'Di chuyển', icon: '🚗', color: '#3B82F6', type: 'expense', order: 1 },
  { name: 'Mua sắm', icon: '🛍️', color: '#EC4899', type: 'expense', order: 2 },
  { name: 'Hóa đơn & tiện ích', icon: '💡', color: '#F43F5E', type: 'expense', order: 3 },
  { name: 'Nhà ở', icon: '🏠', color: '#8B5CF6', type: 'expense', order: 4 },
  { name: 'Sức khỏe', icon: '💊', color: '#10B981', type: 'expense', order: 5 },
  { name: 'Giải trí', icon: '🎬', color: '#A855F7', type: 'expense', order: 6 },
  { name: 'Giáo dục', icon: '📚', color: '#06B6D4', type: 'expense', order: 7 },
  { name: 'Du lịch', icon: '✈️', color: '#0EA5E9', type: 'expense', order: 8 },
  { name: 'Gia đình & bạn bè', icon: '🎁', color: '#F97316', type: 'expense', order: 9 },
  { name: 'Tiết kiệm & đầu tư', icon: '💰', color: '#059669', type: 'expense', order: 10 },
  { name: 'Khác', icon: '🔖', color: '#6B7280', type: 'expense', order: 11 },
]

export const DEFAULT_INCOME_CATEGORIES: Omit<Category, 'id'>[] = [
  { name: 'Lương', icon: '💼', color: '#10B981', type: 'income', order: 0 },
  { name: 'Thưởng', icon: '🎉', color: '#F59E0B', type: 'income', order: 1 },
  { name: 'Đầu tư', icon: '📈', color: '#6366F1', type: 'income', order: 2 },
  { name: 'Thu nhập khác', icon: '💵', color: '#14B8A6', type: 'income', order: 3 },
]

export const ALL_DEFAULT_CATEGORIES = [
  ...DEFAULT_EXPENSE_CATEGORIES,
  ...DEFAULT_INCOME_CATEGORIES,
]
