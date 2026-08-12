export type Lang = 'vi' | 'en'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TranslateFn = (...args: any[]) => string
type Dict = Record<string, string | TranslateFn>

const vi: Dict = {
  // Login
  'login.tagline': 'Ghi lại từng khoản chi trong một vòng lặp thói quen nhẹ nhàng.',
  'login.signin': 'Đăng nhập',
  'login.signup': 'Tạo tài khoản',
  'login.emailPlaceholder': 'Email',
  'login.passwordPlaceholder': 'Mật khẩu (ít nhất 6 ký tự)',
  'login.forgotPassword': 'Quên mật khẩu?',
  'login.processing': 'Đang xử lý…',
  'login.syncNote': 'Dữ liệu của bạn được đồng bộ an toàn và riêng tư giữa các thiết bị.',
  'login.notConfiguredTitle': 'Chưa cấu hình Firebase',
  'login.notConfiguredBody':
    'Tạo file .env từ .env.example và điền thông tin dự án Firebase của bạn. Xem hướng dẫn trong README.md.',
  'login.err.invalidEmail': 'Email không hợp lệ.',
  'login.err.userNotFound': 'Không tìm thấy tài khoản với email này. Bấm "Tạo tài khoản" nếu đây là lần đầu.',
  'login.err.wrongPassword': 'Sai mật khẩu, thử lại nhé.',
  'login.err.invalidCredential': 'Email hoặc mật khẩu không đúng.',
  'login.err.emailInUse': 'Email này đã có tài khoản — thử đăng nhập thay vì tạo mới.',
  'login.err.weakPassword': 'Mật khẩu cần ít nhất 6 ký tự.',
  'login.err.tooManyRequests': 'Bạn thử sai quá nhiều lần, vui lòng đợi một lát rồi thử lại.',
  'login.err.generic': (code: string) => `Có lỗi xảy ra (${code}).`,
  'login.err.fillFields': 'Nhập đầy đủ email và mật khẩu nhé.',
  'login.err.somethingWrong': 'Có lỗi xảy ra, thử lại nhé.',
  'login.err.enterEmailFirst': 'Nhập email của bạn ở ô trên trước, rồi bấm "Quên mật khẩu?" lại nhé.',
  'login.err.resetFailed': 'Không gửi được email đặt lại mật khẩu.',
  'login.resetSent': 'Đã gửi email đặt lại mật khẩu — kiểm tra hộp thư của bạn.',

  // Bottom nav
  'nav.home': 'Trang chủ',
  'nav.transactions': 'Giao dịch',
  'nav.stats': 'Thống kê',
  'nav.settings': 'Cài đặt',
  'nav.addAria': 'Thêm giao dịch',

  // Reminder banner
  'reminder.title': 'Hôm nay bạn chưa ghi chi tiêu nào',
  'reminder.streakWarning': (n: number) => `Đừng để đứt chuỗi ${n} ngày liên tiếp nhé!`,
  'reminder.startStreak': 'Ghi lại ngay để bắt đầu chuỗi thói quen của bạn.',

  // Month switcher
  'month.prev': 'Tháng trước',
  'month.next': 'Tháng sau',
  'locale.code': 'vi-VN',

  // Add transaction sheet
  'tx.expense': 'Chi tiêu',
  'tx.income': 'Thu nhập',
  'tx.notePlaceholder': 'Ghi chú (tuỳ chọn)',
  'tx.delete': 'Xoá giao dịch',
  'tx.unknownCategory': 'Không rõ danh mục',

  // Budget progress
  'budget.over': (amount: string) => `Vượt ngân sách ${amount}`,
  'budget.warningNear': (name: string, percent: number, spent: string, total: string) =>
    `Bạn đã dùng ${percent}% ngân sách ${name} tháng này (${spent}/${total})`,
  'budget.warningOver': (name: string, amount: string) =>
    `Bạn đã vượt ngân sách ${name} tháng này ${amount}`,

  // Common
  'common.noData': 'Chưa có dữ liệu để hiển thị',
  'common.other': 'Khác',
  'common.totalExpense': 'Tổng chi',

  // Home
  'home.greeting': 'Xin chào,',
  'home.you': 'bạn',
  'home.expenseThisMonth': 'Chi tiêu tháng này',
  'home.incomeThisMonth': 'Thu nhập tháng này',
  'home.vsLastMonthSuffix': 'so với tháng trước',
  'home.balanceThisMonth': 'Số dư tháng này',
  'home.byCategory': 'Chi tiêu theo danh mục',
  'home.details': 'Chi tiết',
  'home.trend14': 'Xu hướng 14 ngày qua',
  'home.recentTx': 'Giao dịch gần đây',
  'home.viewAll': 'Xem tất cả',
  'home.noTx': 'Chưa có giao dịch nào',

  // Transactions page
  'txPage.title': 'Giao dịch',
  'txPage.expenseShort': 'Chi',
  'txPage.incomeShort': 'Thu',
  'txPage.searchPlaceholder': 'Tìm theo danh mục hoặc ghi chú',
  'txPage.filterAll': 'Tất cả',
  'txPage.filterExpense': 'Chi tiêu',
  'txPage.filterIncome': 'Thu nhập',
  'txPage.noneMatch': 'Không có giao dịch nào phù hợp',
  'txPage.select': 'Chọn',
  'txPage.doneSelect': 'Xong',
  'txPage.selectedCount': (n: number) => `Đã chọn ${n}`,
  'txPage.deleteSelected': 'Xoá',

  // Toast
  'toast.deletedOne': 'Đã xoá giao dịch',
  'toast.deletedMany': (n: number) => `Đã xoá ${n} giao dịch`,
  'toast.undo': 'Hoàn tác',

  // Stats page
  'statsPage.title': 'Thống kê',
  'statsPage.byMonth': 'Theo tháng',
  'statsPage.byYear': 'Theo năm',
  'statsPage.totalExpense': 'Tổng chi',
  'statsPage.totalIncome': 'Tổng thu',
  'statsPage.vsLastMonth': 'so với tháng trước',
  'statsPage.breakdown': 'Phân bổ chi tiêu',
  'statsPage.noExpenseThisMonth': 'Chưa có chi tiêu tháng này',
  'statsPage.budgetsThisMonth': 'Ngân sách tháng này',
  'statsPage.totalExpenseYear': 'Tổng chi cả năm',
  'statsPage.totalIncomeYear': 'Tổng thu cả năm',
  'statsPage.monthlyChart': 'Chi thu theo tháng',
  'statsPage.topCategoriesYear': 'Danh mục chi nhiều nhất trong năm',
  'statsPage.noDataYear': (year: number) => `Chưa có dữ liệu năm ${year}`,

  // Budgets page
  'budgetsPage.title': 'Ngân sách',
  'budgetsPage.notSet': 'Chưa đặt ngân sách',
  'budgetsPage.save': 'Lưu',
  'budgetsPage.set': 'Đặt',

  // Categories page
  'categoriesPage.title': 'Danh mục',
  'categoriesPage.expense': 'Chi tiêu',
  'categoriesPage.income': 'Thu nhập',
  'categoriesPage.namePlaceholder': 'Tên danh mục',
  'categoriesPage.icon': 'Biểu tượng',
  'categoriesPage.color': 'Màu sắc',
  'categoriesPage.cancel': 'Huỷ',
  'categoriesPage.addCategory': 'Thêm danh mục',
  'categoriesPage.addNew': 'Thêm danh mục mới',

  // Settings page
  'settingsPage.title': 'Cài đặt',
  'settingsPage.defaultUser': 'Người dùng Loop',
  'settingsPage.currentStreak': 'Chuỗi ghi chép hiện tại',
  'settingsPage.days': (n: number) => `${n} ngày`,
  'settingsPage.bestStreak': (n: number) => `Kỷ lục: ${n} ngày`,
  'settingsPage.reminderSection': 'Nhắc nhở & thói quen',
  'settingsPage.reminderInApp': 'Nhắc trong app',
  'settingsPage.reminderInAppDesc': 'Banner + thông báo cục bộ khi mở app',
  'settingsPage.reminderTime': 'Giờ nhắc',
  'settingsPage.everyDay': 'Mỗi ngày',
  'settingsPage.pushAdvanced': 'Push nâng cao',
  'settingsPage.pushAdvancedDesc': 'Nhắc kể cả khi đã đóng app (cần cấu hình Firebase Cloud Messaging)',
  'settingsPage.manageSection': 'Quản lý',
  'settingsPage.budgetsByCategory': 'Ngân sách theo danh mục',
  'settingsPage.categoriesLink': 'Danh mục chi tiêu / thu nhập',
  'settingsPage.appearanceSection': 'Giao diện',
  'settingsPage.light': 'Sáng',
  'settingsPage.dark': 'Tối',
  'settingsPage.system': 'Tự động',
  'settingsPage.languageSection': 'Ngôn ngữ',
  'settingsPage.langVi': 'Tiếng Việt',
  'settingsPage.langEn': 'English',
  'settingsPage.dataSection': 'Dữ liệu',
  'settingsPage.exportCsv': 'Xuất CSV',
  'settingsPage.exportJson': 'Xuất JSON (sao lưu đầy đủ)',
  'settingsPage.signOut': 'Đăng xuất',
  'settingsPage.version': 'Loop · phiên bản 1.0',

  // CSV export
  'csv.date': 'Ngày',
  'csv.type': 'Loại',
  'csv.category': 'Danh mục',
  'csv.amount': 'Số tiền',
  'csv.note': 'Ghi chú',
  'csv.expense': 'Chi tiêu',
  'csv.income': 'Thu nhập',
}

const en: Dict = {
  // Login
  'login.tagline': 'Log every expense in one gentle habit loop.',
  'login.signin': 'Sign in',
  'login.signup': 'Create account',
  'login.emailPlaceholder': 'Email',
  'login.passwordPlaceholder': 'Password (at least 6 characters)',
  'login.forgotPassword': 'Forgot password?',
  'login.processing': 'Working…',
  'login.syncNote': 'Your data syncs securely and privately across your devices.',
  'login.notConfiguredTitle': 'Firebase not configured',
  'login.notConfiguredBody':
    'Create a .env file from .env.example and fill in your Firebase project details. See README.md for instructions.',
  'login.err.invalidEmail': 'That email doesn’t look right.',
  'login.err.userNotFound': 'No account found for this email. Tap "Create account" if this is your first time.',
  'login.err.wrongPassword': 'Wrong password, try again.',
  'login.err.invalidCredential': 'Email or password is incorrect.',
  'login.err.emailInUse': 'This email already has an account — try signing in instead.',
  'login.err.weakPassword': 'Password needs at least 6 characters.',
  'login.err.tooManyRequests': 'Too many attempts — please wait a moment and try again.',
  'login.err.generic': (code: string) => `Something went wrong (${code}).`,
  'login.err.fillFields': 'Please enter both email and password.',
  'login.err.somethingWrong': 'Something went wrong, please try again.',
  'login.err.enterEmailFirst': 'Enter your email above first, then tap "Forgot password?" again.',
  'login.err.resetFailed': 'Could not send the password reset email.',
  'login.resetSent': 'Password reset email sent — check your inbox.',

  // Bottom nav
  'nav.home': 'Home',
  'nav.transactions': 'Transactions',
  'nav.stats': 'Stats',
  'nav.settings': 'Settings',
  'nav.addAria': 'Add transaction',

  // Reminder banner
  'reminder.title': "You haven't logged anything today",
  'reminder.streakWarning': (n: number) => `Don't break your ${n}-day streak!`,
  'reminder.startStreak': 'Log one now to start your habit streak.',

  // Month switcher
  'month.prev': 'Previous month',
  'month.next': 'Next month',
  'locale.code': 'en-US',

  // Add transaction sheet
  'tx.expense': 'Expense',
  'tx.income': 'Income',
  'tx.notePlaceholder': 'Note (optional)',
  'tx.delete': 'Delete transaction',
  'tx.unknownCategory': 'Unknown category',

  // Budget progress
  'budget.over': (amount: string) => `Over budget by ${amount}`,
  'budget.warningNear': (name: string, percent: number, spent: string, total: string) =>
    `You've used ${percent}% of your ${name} budget this month (${spent}/${total})`,
  'budget.warningOver': (name: string, amount: string) =>
    `You've gone over your ${name} budget this month by ${amount}`,

  // Common
  'common.noData': 'No data to display yet',
  'common.other': 'Other',
  'common.totalExpense': 'Total spent',

  // Home
  'home.greeting': 'Hello,',
  'home.you': 'there',
  'home.expenseThisMonth': 'Spent this month',
  'home.incomeThisMonth': 'Income this month',
  'home.vsLastMonthSuffix': 'vs last month',
  'home.balanceThisMonth': 'Balance this month',
  'home.byCategory': 'Spending by category',
  'home.details': 'Details',
  'home.trend14': 'Last 14 days',
  'home.recentTx': 'Recent transactions',
  'home.viewAll': 'View all',
  'home.noTx': 'No transactions yet',

  // Transactions page
  'txPage.title': 'Transactions',
  'txPage.expenseShort': 'Expense',
  'txPage.incomeShort': 'Income',
  'txPage.searchPlaceholder': 'Search category or note',
  'txPage.filterAll': 'All',
  'txPage.filterExpense': 'Expense',
  'txPage.filterIncome': 'Income',
  'txPage.noneMatch': 'No matching transactions',
  'txPage.select': 'Select',
  'txPage.doneSelect': 'Done',
  'txPage.selectedCount': (n: number) => `${n} selected`,
  'txPage.deleteSelected': 'Delete',

  // Toast
  'toast.deletedOne': 'Transaction deleted',
  'toast.deletedMany': (n: number) => `${n} transactions deleted`,
  'toast.undo': 'Undo',

  // Stats page
  'statsPage.title': 'Stats',
  'statsPage.byMonth': 'By month',
  'statsPage.byYear': 'By year',
  'statsPage.totalExpense': 'Total expense',
  'statsPage.totalIncome': 'Total income',
  'statsPage.vsLastMonth': 'vs last month',
  'statsPage.breakdown': 'Spending breakdown',
  'statsPage.noExpenseThisMonth': 'No expenses this month',
  'statsPage.budgetsThisMonth': "This month's budgets",
  'statsPage.totalExpenseYear': 'Total expense (year)',
  'statsPage.totalIncomeYear': 'Total income (year)',
  'statsPage.monthlyChart': 'Income & expense by month',
  'statsPage.topCategoriesYear': 'Top spending categories this year',
  'statsPage.noDataYear': (year: number) => `No data for ${year}`,

  // Budgets page
  'budgetsPage.title': 'Budgets',
  'budgetsPage.notSet': 'No budget set',
  'budgetsPage.save': 'Save',
  'budgetsPage.set': 'Set',

  // Categories page
  'categoriesPage.title': 'Categories',
  'categoriesPage.expense': 'Expense',
  'categoriesPage.income': 'Income',
  'categoriesPage.namePlaceholder': 'Category name',
  'categoriesPage.icon': 'Icon',
  'categoriesPage.color': 'Color',
  'categoriesPage.cancel': 'Cancel',
  'categoriesPage.addCategory': 'Add category',
  'categoriesPage.addNew': 'Add new category',

  // Settings page
  'settingsPage.title': 'Settings',
  'settingsPage.defaultUser': 'Loop user',
  'settingsPage.currentStreak': 'Current streak',
  'settingsPage.days': (n: number) => `${n} days`,
  'settingsPage.bestStreak': (n: number) => `Best: ${n} days`,
  'settingsPage.reminderSection': 'Reminders & habits',
  'settingsPage.reminderInApp': 'In-app reminder',
  'settingsPage.reminderInAppDesc': 'Banner + local notification when the app is open',
  'settingsPage.reminderTime': 'Reminder time',
  'settingsPage.everyDay': 'Every day',
  'settingsPage.pushAdvanced': 'Advanced push',
  'settingsPage.pushAdvancedDesc': 'Notify even when the app is closed (requires Firebase Cloud Messaging setup)',
  'settingsPage.manageSection': 'Manage',
  'settingsPage.budgetsByCategory': 'Budgets by category',
  'settingsPage.categoriesLink': 'Expense / income categories',
  'settingsPage.appearanceSection': 'Appearance',
  'settingsPage.light': 'Light',
  'settingsPage.dark': 'Dark',
  'settingsPage.system': 'Auto',
  'settingsPage.languageSection': 'Language',
  'settingsPage.langVi': 'Tiếng Việt',
  'settingsPage.langEn': 'English',
  'settingsPage.dataSection': 'Data',
  'settingsPage.exportCsv': 'Export CSV',
  'settingsPage.exportJson': 'Export JSON (full backup)',
  'settingsPage.signOut': 'Sign out',
  'settingsPage.version': 'Loop · version 1.0',

  // CSV export
  'csv.date': 'Date',
  'csv.type': 'Type',
  'csv.category': 'Category',
  'csv.amount': 'Amount',
  'csv.note': 'Note',
  'csv.expense': 'Expense',
  'csv.income': 'Income',
}

export const dictionaries: Record<Lang, Dict> = { vi, en }

/** Default category names are stored in Firestore as the Vietnamese label
 *  (so they stay meaningful in exports/CSV regardless of UI language). This
 *  maps those known labels to a display translation; custom user-created
 *  categories fall through unchanged since they're free text. */
const CATEGORY_NAME_EN: Record<string, string> = {
  'Ăn uống': 'Food & drink',
  'Di chuyển': 'Transport',
  'Mua sắm': 'Shopping',
  'Hóa đơn & tiện ích': 'Bills & utilities',
  'Nhà ở': 'Housing',
  'Sức khỏe': 'Health',
  'Giải trí': 'Entertainment',
  'Giáo dục': 'Education',
  'Du lịch': 'Travel',
  'Gia đình & bạn bè': 'Family & friends',
  'Tiết kiệm & đầu tư': 'Savings & investing',
  Khác: 'Other',
  'Lương': 'Salary',
  'Thưởng': 'Bonus',
  'Đầu tư': 'Investment',
  'Thu nhập khác': 'Other income',
}

export function localizeCategoryName(name: string, lang: Lang): string {
  if (lang === 'vi') return name
  return CATEGORY_NAME_EN[name] ?? name
}
