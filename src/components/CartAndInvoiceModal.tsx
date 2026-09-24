import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingCart, Trash2, Plus, Minus, X, CheckCircle2, 
  Printer, Share2, Phone, AlertCircle, FileText, ArrowRight, ExternalLink
} from 'lucide-react';
import { Product, CartItem, Order, OrderItem, Settings } from '../types';
import { isProductDirham } from '../App';

// Format number with commas
export const formatPrice = (price: number) => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Persian relative time formatter
export const formatRelativeTime = (dateInput?: string | number | Date): string => {
  if (!dateInput) return 'چند لحظه پیش';
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return 'چند لحظه پیش';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.max(0, Math.floor(diffMs / 1000));
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) {
      return 'چند لحظه پیش';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} دقیقه قبل`;
    } else if (diffHours < 24) {
      return `${diffHours} ساعت پیش`;
    } else if (diffDays < 30) {
      return `${diffDays} روز پیش`;
    } else {
      const diffMonths = Math.floor(diffDays / 30);
      return `${diffMonths} ماه پیش`;
    }
  } catch (e) {
    return 'چند لحظه پیش';
  }
};

// Shamsi / Persian readable date formatter
export const formatPersianDateTime = (dateInput?: string | Date): string => {
  if (!dateInput) return '';
  try {
    const date = new Date(dateInput);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch (e) {
    return String(dateInput);
  }
};

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onOrderSuccess: (order: Order) => void;
  rates: Settings;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOrderSuccess,
  rates
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Calculate pricing breakdown
  let totalToman = 0;
  let totalAED = 0;
  let hasAEDItems = false;

  const orderItems: OrderItem[] = cart.map(item => {
    const p = item.product;
    const isDirham = isProductDirham(p);
    let itemToman = 0;
    let itemPriceValue = 0;

    if (isDirham) {
      hasAEDItems = true;
      itemPriceValue = p.priceAED && p.priceAED > 0 ? p.priceAED : p.priceValue;
      totalAED += itemPriceValue * item.quantity;
    } else {
      const displayToman = p.priceIRT !== undefined && p.priceIRT > 0 ? p.priceIRT : (p.currency === 'IRT' ? p.priceValue : null);
      if (displayToman !== null) {
        itemToman = displayToman;
      } else if (p.currency === 'CNY') {
        itemToman = p.priceValue * Number(rates.cnyRate || 0);
      } else {
        itemToman = p.priceValue;
      }
      itemPriceValue = itemToman;
      totalToman += itemToman * item.quantity;
    }

    return {
      productId: p.id,
      productName: p.name,
      quantity: item.quantity,
      currency: isDirham ? 'AED' : p.currency,
      priceValue: itemPriceValue,
      tomanPrice: itemToman,
      isDirham,
      image: p.media?.images?.[0] || 'https://ehsanstoreiran.ir/file/ehsan.jpg'
    };
  });

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim()) {
      setErrorMsg('لطفاً نام و نام خانوادگی خود را وارد کنید.');
      return;
    }

    const cleanPhone = customerPhone.trim().replace(/\s+/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMsg('لطفاً شماره موبایل معتبر (مثال: ۰۹۱۲۳۴۵۶۷۸۹) وارد کنید.');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderPayload = {
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        customerNotes: customerNotes.trim(),
        items: orderItems,
        totalToman,
        totalAED,
        hasAEDItems
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: orderPayload })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'خطا در ثبت سفارش روی سرور');
      }

      onClearCart();
      onOrderSuccess(data.order);
      onClose();
    } catch (err: any) {
      console.error('Order creation error:', err);
      setErrorMsg(err.message || 'خطا در ارتباط با سرور، لطفاً مجدداً تلاش کنید.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-right font-sans my-auto border border-purple-100"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 to-indigo-800 p-5 text-white flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-xs">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black">سبد خرید و استعلام سفارش</h3>
              <p className="text-xs text-purple-200 mt-0.5">بدون نیاز به ثبت‌نام و با صدور فوری پیش‌فاکتور</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 md:p-6 overflow-y-auto flex-1 flex flex-col gap-6">
          {cart.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 bg-purple-50 text-purple-400 rounded-2xl flex items-center justify-center">
                <ShoppingCart size={32} />
              </div>
              <h4 className="text-base font-black text-slate-700">سبد خرید شما خالی است</h4>
              <p className="text-xs text-slate-400 font-medium">کالاهای مورد نظر خود را از صفحه اصلی به سبد خرید اضافه کنید.</p>
              <button
                onClick={onClose}
                className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all"
              >
                مشاهده لیست کالاها
              </button>
            </div>
          ) : (
            <>
              {/* Items List */}
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center text-xs font-bold text-slate-500 border-b border-slate-100 pb-2">
                  <span>اقلام انتخابی ({cart.reduce((sum, item) => sum + item.quantity, 0)} کالا)</span>
                  <button
                    onClick={onClearCart}
                    className="text-red-500 hover:text-red-700 flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>خالی کردن سبد</span>
                  </button>
                </div>

                <div className="divide-y divide-slate-100 flex flex-col max-h-60 overflow-y-auto pr-1">
                  {cart.map((item) => {
                    const p = item.product;
                    const isDirham = isProductDirham(p);
                    const imageSrc = p.media?.images?.[0] || 'https://ehsanstoreiran.ir/file/ehsan.jpg';

                    let unitPriceText = '';
                    if (isDirham) {
                      const dirhamVal = p.priceAED && p.priceAED > 0 ? p.priceAED : p.priceValue;
                      unitPriceText = `${formatPrice(dirhamVal)} درهم`;
                    } else {
                      const displayToman = p.priceIRT !== undefined && p.priceIRT > 0 ? p.priceIRT : (p.currency === 'IRT' ? p.priceValue : null);
                      let finalToman = displayToman !== null ? displayToman : (p.currency === 'CNY' ? p.priceValue * Number(rates.cnyRate || 0) : p.priceValue);
                      unitPriceText = `${formatPrice(finalToman)} تومان`;
                    }

                    return (
                      <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={imageSrc}
                            alt={p.name}
                            className="w-12 h-12 object-cover rounded-xl border border-slate-100 shrink-0 bg-slate-50"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-black text-slate-800 truncate max-w-[180px] md:max-w-[240px]">
                              {p.name}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[11px] font-bold text-purple-700">
                                {unitPriceText}
                              </span>
                              {isDirham && (
                                <span className="text-[9px] bg-amber-50 text-amber-800 border border-amber-200/60 px-1 py-0.5 rounded font-black">
                                  ⚠️ استعلام
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1 border border-slate-200">
                            <button
                              onClick={() => onUpdateQuantity(p.id, item.quantity + 1)}
                              className="w-6 h-6 rounded-lg bg-white hover:bg-purple-50 text-purple-700 flex items-center justify-center transition-all shadow-xs cursor-pointer"
                              title="افزایش"
                            >
                              <Plus size={12} />
                            </button>
                            <span className="text-xs font-black w-6 text-center text-slate-800">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => {
                                if (item.quantity > 1) {
                                  onUpdateQuantity(p.id, item.quantity - 1);
                                } else {
                                  onRemoveItem(p.id);
                                }
                              }}
                              className="w-6 h-6 rounded-lg bg-white hover:bg-red-50 text-red-600 flex items-center justify-center transition-all shadow-xs cursor-pointer"
                              title={item.quantity > 1 ? "کاهش" : "حذف"}
                            >
                              {item.quantity > 1 ? <Minus size={12} /> : <Trash2 size={12} />}
                            </button>
                          </div>

                          <button
                            onClick={() => onRemoveItem(p.id)}
                            className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg transition-colors cursor-pointer"
                            title="حذف از سبد"
                          >
                            <X size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Price Totals Summary */}
              <div className="bg-purple-50/70 border border-purple-100 rounded-2xl p-4 flex flex-col gap-2.5">
                {totalToman > 0 && (
                  <div className="flex justify-between items-center text-xs md:text-sm font-black text-slate-800">
                    <span>مجموع اقلام تومانی:</span>
                    <span className="text-purple-700 text-sm md:text-base">{formatPrice(totalToman)} تومان</span>
                  </div>
                )}
                {hasAEDItems && (
                  <div className="flex justify-between items-center text-xs md:text-sm font-black text-slate-800 border-t border-purple-100/80 pt-2">
                    <span>مجموع اقلام درهمی:</span>
                    <span className="text-amber-600 text-sm md:text-base">{formatPrice(totalAED)} درهم</span>
                  </div>
                )}
                {hasAEDItems && (
                  <div className="text-[10px] md:text-[11px] font-bold text-amber-900 bg-amber-100/50 border border-amber-200/50 p-2.5 rounded-xl leading-relaxed flex items-center gap-1.5 mt-1">
                    <span className="shrink-0 text-sm">⚠️</span>
                    <span>اقلام درهمی بر اساس نرخ روز تسویه می‌شوند؛ همکاران ما پس از ثبت پیش‌فاکتور قیمت دقیق ریالی را به شما اعلام خواهند کرد.</span>
                  </div>
                )}
              </div>

              {/* Customer Information Form */}
              <form onSubmit={handleSubmitOrder} className="flex flex-col gap-3.5 border-t border-slate-100 pt-4">
                <div className="flex items-center gap-2 text-xs font-black text-slate-800">
                  <FileText size={15} className="text-purple-600" />
                  <span>مشخصات خریدار جهت صدور پیش‌فاکتور</span>
                </div>

                {errorMsg && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      نام و نام خانوادگی <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: علی احمدی"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-purple-500 focus:bg-white transition-all text-right"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      شماره تماس همراه <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-purple-500 focus:bg-white transition-all text-left"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    آدرس یا یادداشت سفارش (اختیاری)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="شهر، آدرس پستی، باربری یا توضیحات در مورد کالاها..."
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 outline-none focus:border-purple-500 focus:bg-white transition-all text-right resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:scale-[0.99] text-white py-3.5 rounded-2xl font-black text-sm transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {isSubmitting ? (
                    <span>در حال ثبت پیش‌فاکتور...</span>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      <span>ثبت نهایی و صدور پیش‌فاکتور</span>
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- Printable Proforma Invoice Modal ---
interface InvoiceModalProps {
  order: Order | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    let msg = `سلام و احترام،\nپیش‌فاکتور جدید در احسان استور ثبت شد:\n`;
    msg += `📄 شماره فاکتور: ${order.orderNumber}\n`;
    msg += `👤 خریدار: ${order.customerName}\n`;
    msg += `📞 تماس: ${order.customerPhone}\n\n`;
    msg += `📦 اقلام سفارش:\n`;
    order.items.forEach((item, idx) => {
      const priceText = item.isDirham ? `${formatPrice(item.priceValue)} درهم` : `${formatPrice(item.priceValue)} تومان`;
      msg += `${idx + 1}. ${item.productName} (${item.quantity} عدد) - ${priceText}\n`;
    });
    if (order.totalToman > 0) msg += `\n💵 جمع تومانی: ${formatPrice(order.totalToman)} تومان\n`;
    if (order.totalAED > 0) msg += `🇦🇪 جمع درهمی: ${formatPrice(order.totalAED)} درهم\n`;
    if (order.customerNotes) msg += `📝 توضیحات: ${order.customerNotes}\n`;

    const encoded = encodeURIComponent(msg);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-right font-sans my-auto border border-purple-100"
      >
        {/* Actions Bar (Top) */}
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs md:text-sm font-bold">پیش‌فاکتور با موفقیت صادر شد</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="چاپ پیش‌فاکتور"
            >
              <Printer size={14} />
              <span>چاپ / ذخیره PDF</span>
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="ارسال فاکتور به واتساپ"
            >
              <Share2 size={14} />
              <span>ارسال به واتساپ</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div id="printable-invoice" className="p-6 md:p-10 overflow-y-auto flex-1 flex flex-col gap-6 bg-white">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-purple-900 pb-5">
            <div>
              <h1 className="text-2xl font-black text-purple-950">فروشگاه احسان (احسان استور)</h1>
            </div>
            <div className="text-left" dir="ltr">
              <div className="bg-purple-50 border border-purple-200 px-3.5 py-2 rounded-xl inline-block text-right">
                <span className="text-[10px] font-bold text-purple-700 block">شماره پیش‌فاکتور:</span>
                <span className="text-sm font-black text-slate-900 tracking-wider font-mono">{order.orderNumber}</span>
              </div>
              <div className="text-[11px] font-bold text-slate-500 mt-2 text-right">
                <span>تاریخ صدور: </span>
                <span>{formatPersianDateTime(order.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Customer Info Card */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-slate-400 font-bold block text-[10px]">خریدار:</span>
              <span className="font-black text-slate-800 text-sm mt-0.5 block">{order.customerName}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block text-[10px]">شماره تماس:</span>
              <span className="font-bold text-slate-800 text-sm mt-0.5 block font-mono" dir="ltr">{order.customerPhone}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block text-[10px]">وضعیت فاکتور:</span>
              <span className="inline-block bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-black text-[11px] mt-0.5">
                در انتظار تایید و استعلام
              </span>
            </div>
            {order.customerNotes && (
              <div className="col-span-full border-t border-slate-200/60 pt-2 mt-1">
                <span className="text-slate-400 font-bold text-[10px]">یادداشت / آدرس: </span>
                <span className="text-slate-700 font-bold">{order.customerNotes}</span>
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-right text-xs">
              <thead className="bg-purple-900 text-white font-black text-[11px]">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">#</th>
                  <th className="py-3 px-4">شرح کالا</th>
                  <th className="py-3 px-3 text-center w-20">تعداد</th>
                  <th className="py-3 px-4 text-center">قیمت واحد</th>
                  <th className="py-3 px-4 text-left">قیمت کل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                {order.items.map((item, idx) => {
                  const unitPrice = item.priceValue;
                  const totalPrice = unitPrice * item.quantity;
                  const unitText = item.isDirham ? `${formatPrice(unitPrice)} درهم` : `${formatPrice(unitPrice)} تومان`;
                  const totalText = item.isDirham ? `${formatPrice(totalPrice)} درهم` : `${formatPrice(totalPrice)} تومان`;

                  return (
                    <tr key={idx} className="hover:bg-slate-50/70">
                      <td className="py-3 px-3 text-center text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <img
                            src={item.image || 'https://ehsanstoreiran.ir/file/ehsan.jpg'}
                            alt={item.productName}
                            className="w-8 h-8 rounded-lg object-cover border border-slate-100 shrink-0"
                          />
                          <span className="font-black text-slate-800">{item.productName}</span>
                          {item.isDirham && (
                            <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[9px] px-1 rounded font-black">
                              درهمی
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center font-black">{item.quantity}</td>
                      <td className="py-3 px-4 text-center font-mono">{unitText}</td>
                      <td className="py-3 px-4 text-left font-mono font-black text-slate-900">{totalText}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 bg-purple-50/60 p-4 rounded-2xl border border-purple-100">
            <div className="text-[11px] text-slate-500 leading-relaxed font-bold max-w-sm">
              <p>📌 اقلام انتخابی تا ۲۴ ساعت آینده در انبار رزرو می‌مانند.</p>
              <p>📌 برای نهایی‌سازی خرید، تسویه حساب یا هماهنگی ارسال از طریق دکمه واتساپ یا تماس با فروشگاه در ارتباط باشید.</p>
            </div>
            <div className="w-full md:w-64 flex flex-col gap-2">
              {order.totalToman > 0 && (
                <div className="flex justify-between items-center text-xs font-black text-slate-800">
                  <span>جمع کل تومانی:</span>
                  <span className="text-purple-700 font-mono text-base">{formatPrice(order.totalToman)} تومان</span>
                </div>
              )}
              {order.totalAED > 0 && (
                <div className="flex justify-between items-center text-xs font-black text-slate-800 border-t border-purple-200/50 pt-1.5">
                  <span>جمع کل درهمی:</span>
                  <span className="text-amber-600 font-mono text-base">{formatPrice(order.totalAED)} درهم</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer Signature */}
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold border-t border-slate-100 pt-4 mt-auto">
            <span>سامانه فروشگاهی احسان استور | صادر شده توسط سیستم اتوماسیون</span>
            <span>امضا و مهر فروشگاه</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center print:hidden">
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-500 hover:text-slate-700 px-4 py-2 cursor-pointer"
          >
            بستن پنجره
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Printer size={15} />
              <span>چاپ فاکتور</span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
