/**
 * NÂNG CAO (TÙY CHỌN)
 * ---------------------------------------------------------------------------
 * Cloud Function này gửi push notification nhắc nhở NGAY CẢ KHI app đã đóng
 * hẳn / điện thoại khóa màn hình. Việc này đòi hỏi bật gói Blaze (pay-as-you-go)
 * trên Firebase — vẫn miễn phí trong hạn mức sử dụng cá nhân bình thường,
 * nhưng bắt buộc phải liên kết phương thức thanh toán.
 *
 * Nếu bạn không muốn làm bước này, KHÔNG SAO CẢ — app vẫn nhắc bạn qua banner
 * trong app và local notification mỗi khi mở app (xem src/hooks/useReminder.ts).
 *
 * Deploy: cd functions && npm install && npm run deploy
 */
const { onSchedule } = require('firebase-functions/v2/scheduler')
const { initializeApp } = require('firebase-admin/app')
const { getFirestore } = require('firebase-admin/firestore')
const { getMessaging } = require('firebase-admin/messaging')

initializeApp()

const CHECK_WINDOW_MINUTES = 30

function currentHHMMInWindow(nowUtc) {
  // Compare against Asia/Ho_Chi_Minh (UTC+7) by default; adjust if needed.
  const vnOffsetMs = 7 * 60 * 60 * 1000
  const vnNow = new Date(nowUtc.getTime() + vnOffsetMs)
  return `${String(vnNow.getUTCHours()).padStart(2, '0')}:${String(vnNow.getUTCMinutes()).padStart(2, '0')}`
}

function todayISOInVN(nowUtc) {
  const vnOffsetMs = 7 * 60 * 60 * 1000
  const vnNow = new Date(nowUtc.getTime() + vnOffsetMs)
  return vnNow.toISOString().slice(0, 10)
}

exports.sendDailyReminders = onSchedule(
  { schedule: `every ${CHECK_WINDOW_MINUTES} minutes`, timeoutSeconds: 120 },
  async () => {
    const db = getFirestore()
    const messaging = getMessaging()
    const now = new Date()
    const nowHHMM = currentHHMMInWindow(now)
    const todayISO = todayISOInVN(now)

    const usersSnap = await db.collection('users').where('pushEnabled', '==', true).get()

    const sends = []
    for (const doc of usersSnap.docs) {
      const u = doc.data()
      if (!u.reminderEnabled) continue
      if (u.lastLoggedDate === todayISO) continue
      if (!Array.isArray(u.fcmTokens) || u.fcmTokens.length === 0) continue

      // Only send within the same 30-minute bucket as the user's reminder time.
      const [rh, rm] = String(u.reminderTime || '20:00').split(':').map(Number)
      const [nh, nm] = nowHHMM.split(':').map(Number)
      const reminderMinutes = rh * 60 + rm
      const nowMinutes = nh * 60 + nm
      if (Math.abs(reminderMinutes - nowMinutes) > CHECK_WINDOW_MINUTES / 2) continue

      sends.push(
        messaging
          .sendEachForMulticast({
            tokens: u.fcmTokens,
            notification: {
              title: 'Loop nhắc bạn 👋',
              body: 'Hôm nay bạn chưa ghi chi tiêu nào — dành 10 giây ghi lại nhé!',
            },
            webpush: {
              fcmOptions: { link: '/' },
              notification: { icon: '/icons/icon-192.png' },
            },
          })
          .catch((err) => console.error(`Gửi push lỗi cho user ${doc.id}:`, err))
      )
    }

    await Promise.all(sends)
    console.log(`Đã kiểm tra ${usersSnap.size} user, gửi ${sends.length} thông báo.`)
  }
)
