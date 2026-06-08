import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

interface OrderItem {
  productName: string
  variantName: string
  price: number
  quantity: number
  subtotal: number
}

interface OrderEmailData {
  orderNumber: string
  customerName: string
  customerEmail: string
  items: OrderItem[]
  subtotal: number
  shipping: number
  total: number
  deliveryAddress: string
}

export async function sendOrderConfirmation(order: OrderEmailData) {
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #ffefd3;">${item.productName} ${item.variantName}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #ffefd3;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #ffefd3;text-align:right;">NT$ ${item.subtotal.toLocaleString()}</td>
      </tr>`
    )
    .join('')

  const html = `
<!DOCTYPE html>
<html lang="zh-TW">
<head><meta charset="utf-8"><title>訂購成功</title></head>
<body style="font-family:'Noto Sans TC',sans-serif;background:#fff8ed;margin:0;padding:20px;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#ff7d0a,#ffb347);padding:32px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:24px;">🥭 芒芒人海 MANG MANG</h1>
      <p style="color:#fff3e0;margin:8px 0 0;font-size:14px;">台南玉井 · 產地直送</p>
    </div>
    <div style="padding:32px;">
      <h2 style="color:#c74a00;margin:0 0 8px;">訂購成功！</h2>
      <p style="color:#666;margin:0 0 24px;">親愛的 ${order.customerName}，感謝您的訂購 🎉</p>

      <div style="background:#fff8ed;border-radius:8px;padding:16px;margin-bottom:24px;">
        <p style="margin:0;color:#888;font-size:12px;">訂單編號</p>
        <p style="margin:4px 0 0;color:#c74a00;font-size:18px;font-weight:bold;">${order.orderNumber}</p>
      </div>

      <h3 style="color:#333;margin:0 0 12px;font-size:16px;">訂購明細</h3>
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
        <thead>
          <tr style="background:#fff8ed;">
            <th style="padding:8px 12px;text-align:left;font-size:13px;color:#888;">品項</th>
            <th style="padding:8px 12px;text-align:center;font-size:13px;color:#888;">數量</th>
            <th style="padding:8px 12px;text-align:right;font-size:13px;color:#888;">小計</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <div style="text-align:right;border-top:2px solid #ffefd3;padding-top:12px;">
        <p style="margin:4px 0;color:#888;font-size:14px;">小計：NT$ ${order.subtotal.toLocaleString()}</p>
        <p style="margin:4px 0;color:#888;font-size:14px;">運費：NT$ ${order.shipping.toLocaleString()}</p>
        <p style="margin:8px 0 0;color:#c74a00;font-size:18px;font-weight:bold;">合計：NT$ ${order.total.toLocaleString()}</p>
      </div>

      <div style="background:#fff3e0;border:1px solid #ffcc80;border-radius:8px;padding:20px;margin-top:24px;">
        <h3 style="color:#e65100;margin:0 0 12px;font-size:16px;">💳 付款資訊</h3>
        <p style="margin:4px 0;font-size:14px;"><strong>銀行：</strong>新光銀行 (103)</p>
        <p style="margin:4px 0;font-size:14px;"><strong>帳號：</strong>1049500192076</p>
        <p style="margin:4px 0;font-size:14px;"><strong>金額：</strong>NT$ ${order.total.toLocaleString()}</p>
        <p style="margin:12px 0 0;font-size:13px;color:#888;">請完成匯款後，提供匯款末五碼或截圖作為付款憑證 (若已付款請稍等我們對帳，會再寄出一封匯款確認信)</p>
      </div>

      <p style="margin:24px 0 0;color:#888;font-size:13px;">如有任何問題，歡迎與我們聯繫。<br>收到款項後我們會盡快為您安排出貨。</p>
    </div>
    <div style="background:#f5f5f5;padding:16px;text-align:center;">
      <p style="margin:0;color:#aaa;font-size:12px;">芒芒人海 MANG MANG · 台南玉井產地直送</p>
    </div>
  </div>
</body>
</html>`

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: order.customerEmail,
    subject: `【芒芒人海】訂購成功通知 #${order.orderNumber}`,
    html,
  })
}

interface StatusUpdateData {
  orderNumber: string
  customerName: string
  customerEmail: string
  orderStatus?: 'PROCESSING' | 'SHIPPED'
  paymentStatus?: 'PAID' | 'UNPAID'
}

export async function sendStatusUpdate(data: StatusUpdateData) {
  const orderStatusLabel = {
    PROCESSING: '處理中',
    SHIPPED: '已出貨',
  }
  const paymentStatusLabel = {
    PAID: '已付款',
    UNPAID: '未付款',
  }

  let statusInfo = ''
  if (data.orderStatus) {
    statusInfo += `<p style="margin:4px 0;font-size:15px;">訂單狀態：<strong style="color:#c74a00;">${orderStatusLabel[data.orderStatus]}</strong></p>`
  }
  if (data.paymentStatus) {
    statusInfo += `<p style="margin:4px 0;font-size:15px;">付款狀態：<strong style="color:#c74a00;">${paymentStatusLabel[data.paymentStatus]}</strong></p>`
  }

  const isShipped = data.orderStatus === 'SHIPPED'
  const isPaid = data.paymentStatus === 'PAID'

  let subjectSuffix = '訂單狀態更新'
  if (isShipped) subjectSuffix = '您的芒果已出貨 🚚'
  else if (isPaid) subjectSuffix = '已確認付款 ✅'

  const html = `
<!DOCTYPE html>
<html lang="zh-TW">
<head><meta charset="utf-8"><title>訂單狀態更新</title></head>
<body style="font-family:'Noto Sans TC',sans-serif;background:#fff8ed;margin:0;padding:20px;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#ff7d0a,#ffb347);padding:32px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:24px;">🥭 芒芒人海 MANG MANG</h1>
    </div>
    <div style="padding:32px;">
      <h2 style="color:#c74a00;margin:0 0 8px;">${isShipped ? '您的芒果出發囉！🚚' : isPaid ? '收到您的付款了 ✅' : '訂單狀態更新'}</h2>
      <p style="color:#666;margin:0 0 24px;">親愛的 ${data.customerName}，</p>

      <div style="background:#fff8ed;border-radius:8px;padding:20px;margin-bottom:24px;">
        <p style="margin:0 0 8px;color:#888;font-size:13px;">訂單編號：${data.orderNumber}</p>
        ${statusInfo}
      </div>

      ${isShipped ? '<p style="color:#444;font-size:14px;">您的訂單已出貨，預計明天送達，請保持手機暢通，方便物流配送聯繫，若隔日五點前未送達請與我們聯繫。芒果收到後請立即拆箱將芒果取出，芒果霧感稍退即可進冰箱保存</p>' : ''}
      ${isPaid ? '<p style="color:#444;font-size:14px;">已確認收到您的付款，我們將盡快為您安排出貨，感謝您的耐心等候。</p>' : ''}

      <p style="margin:24px 0 0;color:#888;font-size:13px;">如有任何疑問，歡迎回覆此信聯繫我們。</p>
    </div>
    <div style="background:#f5f5f5;padding:16px;text-align:center;">
      <p style="margin:0;color:#aaa;font-size:12px;">芒芒人海 MANG MANG · 台南玉井產地直送</p>
    </div>
  </div>
</body>
</html>`

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: data.customerEmail,
    subject: `【芒芒人海】${subjectSuffix} #${data.orderNumber}`,
    html,
  })
}
