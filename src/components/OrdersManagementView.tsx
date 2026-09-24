import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, Search, Phone, MessageSquare, Trash2, Printer, 
  CheckCircle, Clock, AlertCircle, RefreshCw, Copy, Check, 
  ExternalLink, ArrowRight, ShieldCheck, Filter, ChevronDown, ChevronUp
} from 'lucide-react';
import { Order, OrderStatus, Settings } from '../types';
import { formatPrice, formatRelativeTime, formatPersianDateTime, InvoiceModal } from './CartAndInvoiceModal';

interface OrdersManagementViewProps {
  onExit: () => void;
  settings: Settings;
}

export const OrdersManagementView: React.FC<OrdersManagementViewProps> = ({ onExit, settings }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Password authentication for secret direct access
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('ehsan_is_admin') === 'true' || localStorage.getItem('ehsan_orders_auth') === 'true';
  });
  const [enteredPassword, setEnteredPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Fetch orders failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPass = settings.adminPassword || 'admin123';
    if (enteredPassword === correctPass) {
      setIsAuthenticated(true);
      localStorage.setItem('ehsan_orders_auth', 'true');
      setAuthError('');
    } else {
      setAuthError('رمز عبور مدیر نادرست است');
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus, updatedAt: new Date().toISOString() } : o));
        showToast('وضعیت فاکتور با موفقیت بروز شد');
      }
    } catch (err) {
      alert('خطا در بروزرسانی وضعیت');
    }
  };

  const handleDeleteOrder = async (orderId: string, orderNumber: string) => {
    if (!window.confirm(`آیا از حذف پیش‌فاکتور ${orderNumber} مطمئن هستید؟`)) {
      return;
    }
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setOrders(prev => prev.filter(o => o.id !== orderId));
        showToast('فاکتور با موفقیت حذف شد');
      }
    } catch (err) {
      alert('خطا در حذف فاکتور');
    }
  };

  const copySecretLink = () => {
    const secretUrl = `${window.location.origin}/?panel=orders`;
    navigator.clipboard.writeText(secretUrl);
    setCopiedLink(true);
    showToast('لینک اختصاصی و مخفی پنل فاکتورها کپی شد');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans text-right" dir="rtl">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-slate-100"
        >
          <div className="w-14 h-14 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-xl font-black text-slate-900 text-center mb-1">ورود به پنل فاکتورها</h2>
          <p className="text-xs text-slate-500 text-center mb-6 font-medium">لطفاً جهت مشاهده پیش‌فاکتورها رمز عبور مدیریت را وارد نمایید.</p>
          
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {authError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold p-3 rounded-xl flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{authError}</span>
              </div>
            )}
            <input 
              type="password"
              placeholder="رمز عبور مدیر..."
              value={enteredPassword}
              onChange={(e) => setEnteredPassword(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-purple-600 focus:bg-white text-center transition-all"
              autoFocus
            />
            <button 
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 active:scale-[0.99] text-white py-3 rounded-xl font-black text-sm transition-all shadow-lg shadow-purple-600/30 cursor-pointer"
            >
              ورود به پنل
            </button>
            <button 
              type="button"
              onClick={onExit}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 text-center mt-2 cursor-pointer"
            >
              بازگشت به صفحه اصلی
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // Filter orders
  const filteredOrders = orders.filter(order => {
    if (selectedStatus !== 'all' && order.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = order.customerName.toLowerCase().includes(q);
      const matchPhone = order.customerPhone.includes(q);
      const matchNumber = order.orderNumber.toLowerCase().includes(q);
      return matchName || matchPhone || matchNumber;
    }
    return true;
  });

  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const confirmedCount = orders.filter(o => o.status === 'confirmed').length;

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-slate-800 font-sans pb-20 text-right selection:bg-purple-200" dir="rtl">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-[80] bg-slate-900 text-white px-5 py-2.5 rounded-full shadow-2xl text-xs font-black flex items-center gap-2 border border-slate-700"
          >
            <Check size={16} className="text-emerald-400" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 md:px-8 py-4 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-700 text-white rounded-xl flex items-center justify-center shadow-md shadow-purple-600/30">
              <FileText size={22} />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-black text-slate-900">پنل اختصاصی مدیریت فاکتورها</h1>
              <p className="text-xs text-slate-400 font-bold">احسان استور | بانک اطلاعاتی مستقل سفارشات</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={copySecretLink}
              className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              title="کپی لینک اختصاصی و مخفی برای ورود بدون منو"
            >
              {copiedLink ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copiedLink ? 'کپی شد!' : 'کپی لینک مخفی این پنل'}</span>
            </button>

            <button
              onClick={fetchOrders}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-xl transition-all cursor-pointer"
              title="بروزرسانی داده‌ها"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>

            <button
              onClick={onExit}
              className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>بازگشت به سایت</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 block mb-1">کل پیش‌فاکتورها</span>
            <div className="text-2xl font-black text-slate-900">{orders.length}</div>
          </div>

          <div className="bg-amber-50/70 border border-amber-200/60 p-5 rounded-2xl shadow-xs">
            <span className="text-[11px] font-bold text-amber-700 block mb-1">در انتظار بررسی</span>
            <div className="text-2xl font-black text-amber-900 flex items-center gap-2">
              <span>{pendingCount}</span>
              {pendingCount > 0 && <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>}
            </div>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200/60 p-5 rounded-2xl shadow-xs">
            <span className="text-[11px] font-bold text-emerald-700 block mb-1">تایید شده</span>
            <div className="text-2xl font-black text-emerald-900">{confirmedCount}</div>
          </div>

          <div className="bg-purple-50/70 border border-purple-200/60 p-5 rounded-2xl shadow-xs">
            <span className="text-[11px] font-bold text-purple-700 block mb-1">دیتابیس فاکتورها</span>
            <div className="text-xs font-black text-purple-900 mt-2 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>مستقل و تفکیک‌شده</span>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'همه' },
              { id: 'pending', label: 'در انتظار بررسی' },
              { id: 'processing', label: 'در حال آماده‌سازی' },
              { id: 'confirmed', label: 'تایید شده' },
              { id: 'completed', label: 'تکمیل شده' },
              { id: 'cancelled', label: 'لغو شده' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                  selectedStatus === tab.id
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="جستجو با شماره فاکتور، نام یا شماره تماس..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-4 py-2 text-xs font-bold text-slate-800 outline-none focus:border-purple-600 focus:bg-white transition-all text-right"
            />
            <Search size={15} className="absolute right-3 top-2.5 text-slate-400" />
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="py-20 text-center text-purple-600 font-bold">در حال بارگزاری فاکتورها...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 bg-purple-50 text-purple-400 rounded-2xl flex items-center justify-center">
              <FileText size={32} />
            </div>
            <h3 className="text-base font-black text-slate-700">هیچ فاکتوری یافت نشد</h3>
            <p className="text-xs text-slate-400 font-medium">سفارش یا پیش‌فاکتوری متناسب با این فیلتر وجود ندارد.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredOrders.map((order) => {
              const isExpanded = expandedOrderId === order.id;

              const getStatusBadge = (status: OrderStatus) => {
                switch (status) {
                  case 'pending':
                    return <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-lg text-[10px] font-black">در انتظار بررسی</span>;
                  case 'processing':
                    return <span className="bg-blue-100 text-blue-800 border border-blue-200 px-2.5 py-1 rounded-lg text-[10px] font-black">در حال آماده‌سازی</span>;
                  case 'confirmed':
                    return <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg text-[10px] font-black">تایید شده</span>;
                  case 'completed':
                    return <span className="bg-purple-100 text-purple-800 border border-purple-200 px-2.5 py-1 rounded-lg text-[10px] font-black">تحویل داده شده</span>;
                  case 'cancelled':
                    return <span className="bg-rose-100 text-rose-800 border border-rose-200 px-2.5 py-1 rounded-lg text-[10px] font-black">لغو شده</span>;
                }
              };

              return (
                <div 
                  key={order.id}
                  className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs transition-all hover:shadow-md flex flex-col gap-4"
                >
                  {/* Row 1: Header */}
                  <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-50 text-purple-700 px-3 py-1 rounded-xl text-xs font-black font-mono">
                        {order.orderNumber}
                      </div>
                      {getStatusBadge(order.status)}
                      <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                        <Clock size={12} />
                        <span>{formatRelativeTime(order.createdAt)}</span>
                        <span className="hidden sm:inline">({formatPersianDateTime(order.createdAt)})</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedOrderForInvoice(order)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                      >
                        <Printer size={13} />
                        <span>مشاهده و چاپ فاکتور</span>
                      </button>

                      <button
                        onClick={() => handleDeleteOrder(order.id, order.orderNumber)}
                        className="text-slate-400 hover:text-red-600 p-2 rounded-xl hover:bg-red-50 transition-all cursor-pointer"
                        title="حذف پیش‌فاکتور"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Row 2: Customer details and Quick actions */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block">نام خریدار:</span>
                      <span className="text-sm font-black text-slate-800">{order.customerName}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block">شماره تماس و ارتباط:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-black text-slate-800 font-mono" dir="ltr">{order.customerPhone}</span>
                        <a
                          href={`tel:${order.customerPhone}`}
                          className="bg-emerald-50 text-emerald-700 border border-emerald-200 p-1.5 rounded-lg hover:bg-emerald-100 transition-all"
                          title="تماس تلفنی"
                        >
                          <Phone size={13} />
                        </a>
                        <a
                          href={`https://wa.me/98${order.customerPhone.replace(/^0/, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-emerald-600 text-white p-1.5 rounded-lg hover:bg-emerald-700 transition-all"
                          title="پیام در واتساپ"
                        >
                          <MessageSquare size={13} />
                        </a>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block mb-1">تغییر وضعیت:</span>
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-black outline-none focus:border-purple-600 cursor-pointer w-full"
                      >
                        <option value="pending">در انتظار بررسی</option>
                        <option value="processing">در حال آماده‌سازی</option>
                        <option value="confirmed">تایید شده</option>
                        <option value="completed">تحویل داده شده</option>
                        <option value="cancelled">لغو شده</option>
                      </select>
                    </div>

                    {order.customerNotes && (
                      <div className="col-span-full border-t border-slate-200/60 pt-2 text-xs">
                        <span className="text-slate-400 font-bold text-[11px]">یادداشت سفارش: </span>
                        <span className="text-slate-700 font-bold">{order.customerNotes}</span>
                      </div>
                    )}
                  </div>

                  {/* Row 3: Totals & Toggle Items list */}
                  <div className="flex flex-wrap justify-between items-center gap-3 pt-1">
                    <div className="flex items-center gap-4 text-xs font-black">
                      {order.totalToman > 0 && (
                        <div className="text-slate-700">
                          <span>جمع تومانی: </span>
                          <span className="text-purple-700 font-mono text-sm">{formatPrice(order.totalToman)} تومان</span>
                        </div>
                      )}
                      {order.totalAED > 0 && (
                        <div className="text-slate-700">
                          <span>جمع درهمی: </span>
                          <span className="text-amber-600 font-mono text-sm">{formatPrice(order.totalAED)} درهم</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                      className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isExpanded ? 'بستن لیست اقلام' : `مشاهده اقلام کالاها (${order.items.length})`}</span>
                      {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                  </div>

                  {/* Expanded Items Drawer */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden border-t border-slate-100 pt-3"
                      >
                        <div className="bg-slate-50 rounded-xl p-3 divide-y divide-slate-200/60">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="py-2 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={item.image || 'https://ehsanstoreiran.ir/file/ehsan.jpg'}
                                  alt={item.productName}
                                  className="w-9 h-9 rounded-lg object-cover border border-slate-200 bg-white"
                                />
                                <div>
                                  <h4 className="font-black text-slate-800">{item.productName}</h4>
                                  <span className="text-[10px] text-slate-400 font-bold">
                                    تعداد: {item.quantity} عدد | قیمت واحد: {item.isDirham ? `${formatPrice(item.priceValue)} درهم` : `${formatPrice(item.priceValue)} تومان`}
                                  </span>
                                </div>
                              </div>
                              <span className="font-mono font-black text-slate-900">
                                {item.isDirham ? `${formatPrice(item.priceValue * item.quantity)} درهم` : `${formatPrice(item.priceValue * item.quantity)} تومان`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Invoice Modal for Viewing / Printing */}
      <AnimatePresence>
        {selectedOrderForInvoice && (
          <InvoiceModal
            order={selectedOrderForInvoice}
            onClose={() => setSelectedOrderForInvoice(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
