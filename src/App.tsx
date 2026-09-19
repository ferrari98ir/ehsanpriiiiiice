import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Settings as SettingsIcon, 
  LogOut, 
  Image as ImageIcon, 
  Video, 
  Share2, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  Package,
  Layers,
  Search,
  ShoppingCart,
  X,
  PlusCircle,
  Trash2,
  Edit,
  Save,
  CheckCircle2,
  Download,
  History,
  ArrowRightLeft,
  Calendar,
  MessageCircle,
  Phone,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Headphones,
  PlugZap,
  Speaker,
  Cable,
  Car,
  Mic,
  Lightbulb,
  Gamepad2,
  Crown,
  Battery,
  Sparkles,
  Camera,
  Zap,
  Fingerprint,
  Apple,
  Music,
  AudioLines,
  GripVertical,
  FolderPlus,
  FolderMinus
} from 'lucide-react';
import { Product, Category, Settings, Currency, PriceHistory, Media, BannerItem } from './types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_SETTINGS } from './data';
import { LazyImage } from './components/LazyImage';

const DEFAULT_IMAGE = "https://ehsanstoreiran.ir/file/ehsan.jpg";

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Headphones,
  PlugZap,
  Speaker,
  Cable,
  Car,
  Mic,
  Lightbulb,
  Gamepad2,
  Crown,
  Battery,
  Sparkles,
  Camera,
  Zap,
  Fingerprint,
  Apple,
  Music,
  AudioLines,
  Layers,
  Package,
  CheckCircle2,
  TrendingUp,
  ShoppingCart,
  Video
};

const SELECTABLE_ICONS = [
  { name: 'Headphones', label: 'هندزفری', icon: Headphones },
  { name: 'PlugZap', label: 'آداپتور', icon: PlugZap },
  { name: 'Speaker', label: 'اسپیکر', icon: Speaker },
  { name: 'Cable', label: 'کابل', icon: Cable },
  { name: 'Car', label: 'فندکی', icon: Car },
  { name: 'Mic', label: 'میکروفون', icon: Mic },
  { name: 'Lightbulb', label: 'روشنایی', icon: Lightbulb },
  { name: 'Gamepad2', label: 'بازی', icon: Gamepad2 },
  { name: 'Crown', label: 'برند', icon: Crown },
  { name: 'Battery', label: 'باتری', icon: Battery },
  { name: 'Sparkles', label: 'درخشش', icon: Sparkles },
  { name: 'Camera', label: 'دوربین', icon: Camera },
  { name: 'Zap', label: 'انرژی', icon: Zap },
  { name: 'Fingerprint', label: 'ناتینگ', icon: Fingerprint },
  { name: 'Apple', label: 'اپل', icon: Apple },
  { name: 'Music', label: 'جی‌بی‌ال', icon: Music },
  { name: 'AudioLines', label: 'هارمن', icon: AudioLines },
  { name: 'Layers', label: 'متفرقه', icon: Layers },
  { name: 'ShoppingCart', label: 'خرید', icon: ShoppingCart },
  { name: 'Video', label: 'ویدیو', icon: Video }
];

const getCategoryIconComponent = (cat: Category, isActive: boolean, size: number = 24) => {
  const props = {
    size,
    className: `${isActive ? 'text-white' : 'text-purple-600'} w-6 h-6 md:w-9 md:h-9`
  };

  if (cat.icon && ICON_MAP[cat.icon]) {
    const IconComp = ICON_MAP[cat.icon];
    return <IconComp {...props} />;
  }

  switch(cat.id) {
    case 'cat-handsfree': return <Headphones {...props} />;
    case 'cat-adapter': return <PlugZap {...props} />;
    case 'cat-speaker': return <Speaker {...props} />;
    case 'cat-cable': return <Cable {...props} />;
    case 'cat-charger': return <Car {...props} />;
    case 'cat-mic-headset': return <Mic {...props} />;
    case 'cat-lighting-fan': return <Lightbulb {...props} />;
    case 'cat-console-games': return <Gamepad2 {...props} />;
    case 'cat-ferrari': return <Crown {...props} />;
    case 'cat-anker': return <Battery {...props} />;
    case 'cat-philips': return <Sparkles {...props} />;
    case 'cat-dji': return <Camera {...props} />;
    case 'cat-hollyland': return <Mic {...props} />;
    case 'cat-powerology': return <Zap {...props} />;
    case 'cat-nothing': return <Fingerprint {...props} />;
    case 'cat-apple-misc': return <Apple {...props} />;
    case 'cat-jbl': return <Music {...props} />;
    case 'cat-harman-kardon': return <AudioLines {...props} />;
    case 'cat-hopestar': return <Music {...props} />;
    default: {
      const name = cat.name ? cat.name.toLowerCase() : '';
      if (name.includes('هندزفری') || name.includes('handsfree') || name.includes('ایرپاد')) return <Headphones {...props} />;
      if (name.includes('اسپیکر') || name.includes('speaker') || name.includes('بلندگو')) return <Speaker {...props} />;
      if (name.includes('کابل') || name.includes('cable')) return <Cable {...props} />;
      if (name.includes('شارژر') || name.includes('charger')) return <Car {...props} />;
      if (name.includes('میکروفون') || name.includes('mic')) return <Mic {...props} />;
      if (name.includes('فن') || name.includes('روشنایی')) return <Lightbulb {...props} />;
      if (name.includes('بازی') || name.includes('کنسول')) return <Gamepad2 {...props} />;
      if (name.includes('فراری') || name.includes('ferrari')) return <Crown {...props} />;
      if (name.includes('انکر') || name.includes('anker')) return <Battery {...props} />;
      if (name.includes('اپل') || name.includes('apple')) return <Apple {...props} />;
      if (name.includes('موزیک') || name.includes('music') || name.includes('جی بی ال') || name.includes('jbl')) return <Music {...props} />;
      return <Layers {...props} />;
    }
  }
};

// --- Utilities ---
const normalizeFarsi = (str: string) => {
  if (!str) return '';
  return str
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .toLowerCase()
    .trim();
};

const convertToWebP = (file: File, quality: number = 0.82): Promise<File> => {
  return new Promise((resolve) => {
    // Only optimize image files that are not SVG
    if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Max limit of 1600px width/height to keep size extremely small without losing quality
        const MAX_WIDTH = 1600;
        const MAX_HEIGHT = 1600;
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          if (width > height) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          } else {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(file);
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP format
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const webpFile = new File(
                [blob],
                file.name.replace(/\.[^/.]+$/, "") + ".webp",
                { type: 'image/webp', lastModified: Date.now() }
              );
              
              // Only use the webp file if it's actually smaller (sometimes very tiny PNGs might be smaller than WebP)
              if (webpFile.size < file.size) {
                console.log(`Image optimized successfully: ${(file.size / 1024).toFixed(1)}KB -> ${(webpFile.size / 1024).toFixed(1)}KB`);
                resolve(webpFile);
              } else {
                resolve(file);
              }
            } else {
              resolve(file);
            }
          },
          'image/webp',
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = event.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fa-IR').format(Math.round(price));
};

const convertToToman = (value: number, currency: Currency, rates: Settings) => {
  if (currency === 'IRT') return value;
  if (currency === 'CNY') return value * Number(rates.cnyRate);
  if (currency === 'AED') return value * Number(rates.aedRate);
  return value;
};

// --- Components ---

const ProductDetail = ({ product, onClose, rates, isStaffView }: { product: Product, onClose: () => void, rates: Settings, isStaffView?: boolean }) => {
  const displayToman = product.priceIRT !== undefined && product.priceIRT > 0 ? product.priceIRT : (product.currency === 'IRT' ? product.priceValue : null);
  const displayDirham = product.priceAED !== undefined && product.priceAED > 0 ? product.priceAED : (product.currency === 'AED' ? product.priceValue : null);
  const displayYuan = product.priceCNY !== undefined && product.priceCNY > 0 ? product.priceCNY : (product.currency === 'CNY' ? product.priceValue : null);

  const finalToman = displayToman !== null ? displayToman : convertToToman(product.priceValue, product.currency, rates);
  
  const hasDirham = displayDirham !== null;
  const hasYuan = displayYuan !== null;
  const [copied, setCopied] = useState(false);
  
  const share = async () => {
    // Construct the direct link to this product
    const url = new URL(window.location.href);
    url.searchParams.set('p', product.id);
    const shareUrl = url.toString();

    if (navigator.share) {
      try {
        await navigator.share({
          title: `لیست قیمت احسان استور - ${product.name}`,
          text: product.description.substring(0, 100) + '...',
          url: shareUrl,
        });
      } catch (err) {
        console.error("Share failed", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Clipboard failed", err);
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed inset-0 z-50 bg-white overflow-y-auto pb-20"
    >
      <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 px-4 py-4 flex justify-between items-center border-b border-slate-100">
        <button onClick={onClose} className="p-2.5 bg-slate-100 rounded-2xl text-slate-600 hover:bg-slate-200 transition-colors">
          <X size={20} />
        </button>
        <span className="font-bold text-lg text-slate-800">{product.name}</span>
        <button 
          onClick={share} 
          className={`p-2.5 rounded-2xl transition-all flex items-center gap-2 ${
            copied ? 'bg-purple-600 text-white' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
          }`}
        >
          {copied ? <CheckCircle2 size={20} /> : <Share2 size={20} />}
          {copied && <span className="text-xs font-bold">لینک کپی شد</span>}
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-6 mt-6 pb-20">
        {/* Gallery */}
        <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar snap-x">
          {(product.media.images.length > 0 ? product.media.images : [DEFAULT_IMAGE]).map((img, i) => (
            <LazyImage 
              key={i} 
              src={img} 
              className="w-full h-80 md:h-[450px] bg-slate-50/50 rounded-[40px] flex-shrink-0 snap-center shadow-sm border border-slate-100"
              imgClassName="object-contain"
              alt={product.name}
            />
          ))}
        </div>

        {/* Content */}
        <div className="mt-6 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <h2 className="text-2xl font-black text-gray-900">{product.name}</h2>
            <div className="flex flex-wrap gap-2 items-center">
              <div className="bg-indigo-600 text-white px-4 py-2 rounded-xl border border-indigo-700 shadow-sm shadow-indigo-100">
                <span className="text-xl font-black">{formatPrice(finalToman)}</span>
                <span className="text-xs mr-1">تومان</span>
              </div>
              {hasDirham && (
                <div className="bg-amber-50 text-amber-700 px-4 py-2 rounded-xl border border-amber-100">
                  <span className="text-xl font-black">{formatPrice(displayDirham)}</span>
                  <span className="text-xs mr-1">درهم</span>
                </div>
              )}
              {hasYuan && (
                <div className="bg-purple-50 text-purple-700 px-4 py-2 rounded-xl border border-purple-100">
                  <span className="text-xl font-black">{formatPrice(displayYuan)}</span>
                  <span className="text-xs mr-1">یوان</span>
                </div>
              )}
            </div>
          </div>

          {product.currency === 'AED' && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl text-xs font-bold leading-relaxed flex items-center gap-2 text-right justify-start">
              <span className="text-base shrink-0">⚠️</span>
              <span>قیمت‌ها بر اساس نرخ لحظه‌ای درهم محاسبه می‌شود؛ برای استعلام دقیق قیمت تماس بگیرید.</span>
            </div>
          )}

          {isStaffView && (
            <div className="bg-violet-50/70 border-2 border-dashed border-violet-200 p-5 rounded-3xl text-right animate-fade-in shadow-inner">
              <h4 className="text-xs font-black text-violet-800 mb-2 flex items-center justify-end gap-1">
                <span>قیمت‌های خرید کالا (مخصوص پرسنل)</span>
                <span className="text-sm">🔑</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white p-3 rounded-2xl border border-violet-100 flex justify-between items-center shadow-xs">
                  <span className="text-sm font-black text-violet-700">{product.purchasePriceIRT ? `${formatPrice(product.purchasePriceIRT)} تومان` : 'ثبت نشده'}</span>
                  <span className="text-[10px] font-bold text-slate-400">خرید به تومان:</span>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-violet-100 flex justify-between items-center shadow-xs">
                  <span className="text-sm font-black text-violet-700">{product.purchasePriceAED ? `${formatPrice(product.purchasePriceAED)} درهم` : 'ثبت نشده'}</span>
                  <span className="text-[10px] font-bold text-slate-400">خرید به درهم:</span>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-violet-100 flex justify-between items-center shadow-xs">
                  <span className="text-sm font-black text-violet-700">{product.purchasePriceCNY ? `${formatPrice(product.purchasePriceCNY)} یوان` : 'ثبت نشده'}</span>
                  <span className="text-[10px] font-bold text-slate-400">خرید به یوان:</span>
                </div>
              </div>
            </div>
          )}

          <div className="text-gray-600 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
            {product.description}
          </div>

          {/* Multimedia */}
          {product.media.video && (
            <div className="mt-4">
              <h3 className="text-sm font-bold mb-2 flex items-center gap-2">
                <Video size={16} /> ویدیو معرفی
              </h3>
              <video src={product.media.video} controls className="w-full rounded-2xl bg-black aspect-video shadow-lg" />
            </div>
          )}

          {product.media.audio && (
            <div className="mt-4 mb-10">
              <h3 className="text-sm font-bold mb-2 flex items-center gap-2">
                <Mic size={16} /> پیام صوتی
              </h3>
              <audio src={product.media.audio} controls className="w-full" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const FloatingContact = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'main' | 'fixed'>('main');
  const phone = "09002953333";
  const internationalPhone = "989002953333";
  
  const mainContacts = [
    { name: "پیام در بله", url: `https://ble.ir/ehsanstore33`, color: "bg-blue-500", shadow: "shadow-blue-200", icon: <MessageCircle size={18} /> },
    { name: "پیام در روبیکا", url: `https://rubika.ir/ehsanstoreshiraz`, color: "bg-purple-600", shadow: "shadow-purple-200", icon: <MessageCircle size={18} /> },
    { name: "پیام در واتساپ", url: `https://wa.me/${internationalPhone}`, color: "bg-emerald-500", shadow: "shadow-emerald-200", icon: <MessageCircle size={18} /> },
    { name: "تماس با همراه", url: `tel:${phone}`, color: "bg-indigo-600", shadow: "shadow-indigo-200", icon: <Phone size={18} /> },
    { name: "تماس با امور مالی", url: "tel:09374613008", color: "bg-rose-500", shadow: "shadow-rose-200", icon: <Phone size={18} /> },
  ];

  const fixedLines = [
    { name: "تلفن ثابت ۱", url: "tel:07191094550", color: "bg-slate-600", shadow: "shadow-slate-200" },
    { name: "تلفن ثابت ۲", url: "tel:07132347077", color: "bg-slate-600", shadow: "shadow-slate-200" },
    { name: "تلفن ثابت ۳", url: "tel:07132347076", color: "bg-slate-600", shadow: "shadow-slate-200" },
  ];

  const handleToggle = () => {
    if (isOpen) {
      setTimeout(() => setView('main'), 300);
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3 translate-x-0">
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            key={view}
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            className="flex flex-col gap-3 mb-2"
          >
            {view === 'main' ? (
              <>
                {mainContacts.map((contact, idx) => (
                  <motion.a
                    key={idx}
                    href={contact.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05, x: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className={`${contact.color} text-white flex items-center justify-end gap-3 px-6 py-3 rounded-2xl shadow-xl ${contact.shadow} font-bold group`}
                  >
                    <span className="text-sm whitespace-nowrap">{contact.name}</span>
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                      {contact.icon}
                    </div>
                  </motion.a>
                ))}
                <motion.button
                  onClick={() => setView('fixed')}
                  whileHover={{ scale: 1.05, x: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-orange-400 text-white flex items-center justify-end gap-3 px-6 py-3 rounded-2xl shadow-xl shadow-orange-100 font-bold group"
                >
                  <span className="text-sm">مشاوره فروش</span>
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                    <Phone size={18} />
                  </div>
                </motion.button>
              </>
            ) : (
              <>
                <motion.button
                  onClick={() => setView('main')}
                  whileHover={{ scale: 1.05, x: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-slate-400 text-white flex items-center justify-end gap-3 px-6 py-2 rounded-xl shadow-lg border border-white/20 font-bold mb-1"
                >
                  <span className="text-xs">بازگشت</span>
                  <ArrowRight size={16} />
                </motion.button>
                {fixedLines.map((line, idx) => (
                  <motion.a
                    key={idx}
                    href={line.url}
                    whileHover={{ scale: 1.05, x: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className={`${line.color} text-white flex items-center justify-end gap-3 px-6 py-3 rounded-2xl shadow-xl ${line.shadow} font-bold group`}
                  >
                    <span className="text-sm ltr font-mono">{line.url.replace('tel:', '')}</span>
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                      <Phone size={18} />
                    </div>
                  </motion.a>
                ))}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Toggle Button */}
      <motion.button
        onClick={handleToggle}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-2xl transition-all duration-300 ${
          isOpen ? 'bg-slate-800 text-white rotate-90' : 'bg-indigo-600 text-white'
        }`}
      >
        {isOpen ? <X size={28} /> : <Phone size={28} />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500"></span>
          </span>
        )}
      </motion.button>
    </div>
  );
};

const HistoryView = ({ onExit, history }: { onExit: () => void, history: PriceHistory[] }) => {
  const loading = false;

  // Group by date
  const groupedHistory = useMemo(() => {
    const groups: { [date: string]: PriceHistory[] } = {};
    history.forEach(h => {
      const date = new Date(h.changedAt).toLocaleDateString('fa-IR');
      if (!groups[date]) groups[date] = [];
      groups[date].push(h);
    });
    return groups;
  }, [history]);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white border-b border-slate-200 px-4 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white">
            <History size={18} />
          </div>
          <h1 className="text-xl font-bold">تغییرات قیمت کالاها</h1>
        </div>
        <button onClick={onExit} className="p-2 text-slate-500 rounded-xl bg-slate-100">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="p-6 max-w-2xl mx-auto space-y-10">
        {loading ? (
          <div className="text-center py-20 text-slate-400">در حال بارگزاری تاریخچه...</div>
        ) : Object.keys(groupedHistory).length === 0 ? (
          <div className="text-center py-20 text-slate-400">هیچ سابقه تغییر قیمتی یافت نشد.</div>
        ) : (
          (Object.entries(groupedHistory) as [string, PriceHistory[]][]).map(([date, items]) => (
            <div key={date} className="space-y-4">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <Calendar size={16} />
                <span className="text-sm font-bold">{date === new Date().toLocaleDateString('fa-IR') ? 'امروز' : date}</span>
              </div>
              <div className="space-y-3">
                {items.map(item => (
                  <div key={item.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <span className="font-black text-slate-800">{item.productName}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(item.changedAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] font-bold text-slate-400">قبلی</span>
                        <span className="text-sm font-bold text-slate-500 line-through">{formatPrice(item.oldPrice)}</span>
                      </div>
                      <ArrowRightLeft size={16} className="text-indigo-300" />
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] font-bold text-purple-500">جدید</span>
                        <span className="text-lg font-black text-purple-600">{formatPrice(item.newPrice)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const AdminView = ({ 
  onExit, 
  products, 
  setProducts, 
  categories, 
  setCategories, 
  settings, 
  setSettings 
}: { 
  onExit: () => void,
  products: Product[],
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>,
  categories: Category[],
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>,
  settings: Settings,
  setSettings: React.Dispatch<React.SetStateAction<Settings>>
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'quick-edit' | 'categories' | 'settings'>('products');
  const [draggedCatIndex, setDraggedCatIndex] = useState<number | null>(null);
  
  // Quick Edit States & Helpers
  const [draftProducts, setDraftProducts] = useState<Product[]>([]);
  const [quickEditSearch, setQuickEditSearch] = useState('');
  const [quickEditCategory, setQuickEditCategory] = useState('');
  const [quickEditUploadId, setQuickEditUploadId] = useState<string | null>(null);
  const [uploadingForProductId, setUploadingForProductId] = useState<string | null>(null);
  const quickEditFileInputRef = useRef<HTMLInputElement | null>(null);

  const [isBulkAddOpen, setIsBulkAddOpen] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [bulkCategoryIds, setBulkCategoryIds] = useState<string[]>([]);

  const applyBulkCategories = () => {
    if (selectedProductIds.length === 0 || bulkCategoryIds.length === 0) return;
    setDraftProducts(prev => prev.map(p => {
      if (!selectedProductIds.includes(p.id)) return p;
      const currentIds = p.categoryIds || [];
      const mergedIds = Array.from(new Set([...currentIds, ...bulkCategoryIds]));
      return { ...p, categoryIds: mergedIds };
    }));
    setSelectedProductIds([]);
    setBulkCategoryIds([]);
  };

  const removeBulkCategories = () => {
    if (selectedProductIds.length === 0 || bulkCategoryIds.length === 0) return;
    setDraftProducts(prev => prev.map(p => {
      if (!selectedProductIds.includes(p.id)) return p;
      const currentIds = p.categoryIds || [];
      const filteredIds = currentIds.filter(id => !bulkCategoryIds.includes(id));
      return { ...p, categoryIds: filteredIds };
    }));
    setSelectedProductIds([]);
    setBulkCategoryIds([]);
  };

  useEffect(() => {
    if (activeTab === 'quick-edit') {
      setDraftProducts(products);
    }
  }, [activeTab, products]);

  const hasChanges = useMemo(() => {
    return JSON.stringify(products) !== JSON.stringify(draftProducts);
  }, [products, draftProducts]);

  const isProductModified = (draftP: Product) => {
    const originalP = products.find(p => p.id === draftP.id);
    if (!originalP) return false;
    return (
      (draftP.priceIRT || 0) !== (originalP.priceIRT || 0) ||
      (draftP.priceAED || 0) !== (originalP.priceAED || 0) ||
      (draftP.priceCNY || 0) !== (originalP.priceCNY || 0) ||
      draftP.priceValue !== originalP.priceValue ||
      draftP.currency !== originalP.currency ||
      draftP.isOutOfStock !== originalP.isOutOfStock ||
      JSON.stringify(draftP.media.images) !== JSON.stringify(originalP.media.images)
    );
  };

  const handleQuickProductChange = (id: string, updates: Partial<Product>) => {
    setDraftProducts(prev => prev.map(p => {
      if (p.id !== id) return p;
      const updated = { ...p, ...updates };
      
      // Update priceValue if corresponding manually overridden currency price was changed
      if (updates.priceIRT !== undefined && updated.currency === 'IRT') {
        updated.priceValue = updates.priceIRT;
      }
      if (updates.priceAED !== undefined && updated.currency === 'AED') {
        updated.priceValue = updates.priceAED;
      }
      if (updates.priceCNY !== undefined && updated.currency === 'CNY') {
        updated.priceValue = updates.priceCNY;
      }
      if (updates.currency !== undefined) {
        if (updates.currency === 'IRT' && updated.priceIRT !== undefined) updated.priceValue = updated.priceIRT;
        else if (updates.currency === 'AED' && updated.priceAED !== undefined) updated.priceValue = updated.priceAED;
        else if (updates.currency === 'CNY' && updated.priceCNY !== undefined) updated.priceValue = updated.priceCNY;
      }
      if (updates.priceValue !== undefined) {
        if (updated.currency === 'IRT') updated.priceIRT = updates.priceValue;
        if (updated.currency === 'AED') updated.priceAED = updates.priceValue;
        if (updated.currency === 'CNY') updated.priceCNY = updates.priceValue;
      }
      return updated;
    }));
  };

  const handleQuickImageClick = (productId: string) => {
    setQuickEditUploadId(productId);
    if (quickEditFileInputRef.current) {
      quickEditFileInputRef.current.click();
    }
  };

  const handleQuickImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !quickEditUploadId) return;
    const rawFile = e.target.files[0];
    const prodId = quickEditUploadId;
    setUploadingForProductId(prodId);
    
    try {
      const file = await convertToWebP(rawFile);
      let finalUrl = '';
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        if (res.ok) {
          const resData = await res.json();
          if (resData && resData.url) {
            finalUrl = resData.url;
          }
        }
      } catch (uploadErr) {
        console.warn("Server upload failed in quick edit, falling back to base64", uploadErr);
      }

      if (!finalUrl) {
        finalUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      setDraftProducts(prev => prev.map(p => {
        if (p.id !== prodId) return p;
        const imgs = [...p.media.images];
        if (imgs.length > 0) {
          imgs[0] = finalUrl;
        } else {
          imgs.push(finalUrl);
        }
        return {
          ...p,
          media: {
            ...p.media,
            images: imgs
          }
        };
      }));
    } catch (err) {
      console.error("Quick edit image upload failed", err);
      alert("بارگذاری عکس ناموفق بود.");
    } finally {
      setUploadingForProductId(null);
      setQuickEditUploadId(null);
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const saveQuickEdits = () => {
    setProducts(draftProducts);
    alert("تمامی تغییرات با موفقیت ذخیره شدند.");
  };

  const saveSingleProduct = (pDraft: Product) => {
    setProducts(prev => prev.map(p => p.id === pDraft.id ? pDraft : p));
  };

  const filteredQuickProducts = useMemo(() => {
    let result = draftProducts;
    if (quickEditCategory) {
      result = result.filter(p => p.categoryIds && p.categoryIds.includes(quickEditCategory));
    }
    if (quickEditSearch.trim()) {
      const q = normalizeFarsi(quickEditSearch);
      result = result.filter(p => 
        normalizeFarsi(p.name).includes(q) || 
        (p.description && normalizeFarsi(p.description).includes(q))
      );
    }
    return result;
  }, [draftProducts, quickEditSearch, quickEditCategory]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Category Edit State
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [catEditName, setCatEditName] = useState('');
  const [catEditIcon, setCatEditIcon] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('');

  // Form State
  const [pForm, setPForm] = useState({
    name: '',
    description: '',
    categoryIds: [] as string[],
    priceValue: 0,
    currency: 'IRT' as Currency,
    priceIRT: 0,
    priceCNY: 0,
    priceAED: 0,
    purchasePriceIRT: 0,
    purchasePriceAED: 0,
    purchasePriceCNY: 0,
    media: { images: [] as string[], video: '', audio: '' } as Required<Media>,
    isOutOfStock: false,
    createdAt: new Date().toISOString()
  });

  const [uploading, setUploading] = useState(false);
  const [exportingProject, setExportingProject] = useState(false);

  const handleExportProject = async () => {
    setExportingProject(true);
    try {
      const res = await fetch('/api/admin/export');
      if (!res.ok) {
        throw new Error(`مشکلی با کد ${res.status} در سرور پیش آمد`);
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'EhsanStore-Complete-Project.zip');
      document.body.appendChild(link);
      link.click();
      if (link.parentNode) link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err);
      alert(`خطا در دریافت پکیج ZIP: ${err.message || err}`);
    } finally {
      setExportingProject(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'images' | 'video' | 'audio') => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    try {
      const rawFile = e.target.files[0];
      const file = type === 'images' ? await convertToWebP(rawFile) : rawFile;
      
      // Try to upload the file to our Express backend
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        if (res.ok) {
          const resData = await res.json();
          if (resData && resData.url) {
            if (type === 'images') {
              setPForm(prev => ({ ...prev, media: { ...prev.media, images: [...prev.media.images, resData.url] } }));
            } else {
              setPForm(prev => ({ ...prev, media: { ...prev.media, [type]: resData.url } }));
            }
            setUploading(false);
            return;
          }
        }
      } catch (uploadErr) {
        console.warn("Server upload failed, falling back to base64", uploadErr);
      }

      // Fallback to local Base64 Reader
      const reader = new FileReader();
      reader.onloadend = () => {
        const url = reader.result as string;
        if (type === 'images') {
          setPForm(prev => ({ ...prev, media: { ...prev.media, images: [...prev.media.images, url] } }));
        } else {
          setPForm(prev => ({ ...prev, media: { ...prev.media, [type]: url } }));
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Upload failed", err);
      setUploading(false);
    }
  };

  const saveProduct = () => {
    if (editingId) {
      setProducts(prev => prev.map(p => p.id === editingId ? { ...pForm, id: editingId } : p));
    } else {
      const newProduct: Product = { ...pForm, id: Math.random().toString(36).substring(2, 9) };
      setProducts(prev => [newProduct, ...prev]);
    }
    
    setIsFormOpen(false);
    resetForm();
  };

  const getProductThumbnail = (p: Product) => {
    return p.media.images.length > 0 ? p.media.images[0] : DEFAULT_IMAGE;
  };

  const resetForm = () => {
    setEditingId(null);
    setPForm({
      name: '',
      description: '',
      categoryIds: [],
      priceValue: 0,
      currency: 'IRT' as Currency,
      priceIRT: 0,
      priceCNY: 0,
      priceAED: 0,
      purchasePriceIRT: 0,
      purchasePriceAED: 0,
      purchasePriceCNY: 0,
      media: { images: [], video: '', audio: '' },
      isOutOfStock: false,
      createdAt: new Date().toISOString()
    });
  };

  const editProduct = (p: Product) => {
    setEditingId(p.id);
    setPForm({
      name: p.name,
      description: p.description,
      categoryIds: p.categoryIds || [],
      priceValue: p.priceValue,
      currency: p.currency,
      priceIRT: p.priceIRT || 0,
      priceCNY: p.priceCNY || 0,
      priceAED: p.priceAED || 0,
      purchasePriceIRT: p.purchasePriceIRT || 0,
      purchasePriceAED: p.purchasePriceAED || 0,
      purchasePriceCNY: p.purchasePriceCNY || 0,
      media: {
        images: p.media.images,
        video: p.media.video || '',
        audio: p.media.audio || ''
      },
      isOutOfStock: p.isOutOfStock,
      createdAt: p.createdAt
    });
    setIsFormOpen(true);
  };

  const deleteProduct = (id: string) => {
    if (confirm("آیا از حذف این کالا مطمئن هستید؟")) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const saveRates = () => {
    alert("نرخ‌ها بروزرسانی شد");
  };

  const addCategory = (name: string, icon: string) => {
    const id = 'cat-' + Math.random().toString(36).substring(2, 5);
    setCategories(prev => [...prev, { id, name, icon }]);
    setNewCatIcon('');
  };

  const deleteCategory = (id: string) => {
    if (confirm("آیا از حذف این دسته‌بندی مطمئن هستید؟ (محصولات این دسته ممکن است بدون دسته بمانند)")) {
      setCategories(prev => prev.filter(c => c.id !== id));
    }
  };

  const updateCategory = (id: string) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, name: catEditName, icon: catEditIcon } : c));
    setEditingCategoryId(null);
    setCatEditIcon('');
  };

  const handleCatMoveUp = (idx: number) => {
    if (idx === 0) return;
    const reordered = [...categories];
    const temp = reordered[idx];
    reordered[idx] = reordered[idx - 1];
    reordered[idx - 1] = temp;
    setCategories(reordered);
  };

  const handleCatMoveDown = (idx: number) => {
    if (idx === categories.length - 1) return;
    const reordered = [...categories];
    const temp = reordered[idx];
    reordered[idx] = reordered[idx + 1];
    reordered[idx + 1] = temp;
    setCategories(reordered);
  };

  const handleCatDragStart = (e: React.DragEvent, index: number) => {
    setDraggedCatIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleCatDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedCatIndex === null || draggedCatIndex === index) return;
    const reordered = [...categories];
    const draggedItem = reordered[draggedCatIndex];
    reordered.splice(draggedCatIndex, 1);
    reordered.splice(index, 0, draggedItem);
    setDraggedCatIndex(index);
    setCategories(reordered);
  };

  const handleCatDragEnd = () => {
    setDraggedCatIndex(null);
  };

  const handleCatIconUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const rawFile = e.target.files[0];
    const file = await convertToWebP(rawFile);
    const reader = new FileReader();
    reader.onloadend = () => {
      const url = reader.result as string;
      if (isEdit) setCatEditIcon(url);
      else setNewCatIcon(url);
    };
    reader.readAsDataURL(file);
  };

  const renderProductForm = (forEditingId: string | null) => {
    return (
      <div className="bg-white p-6 rounded-3xl border border-gray-200 flex flex-col gap-4 shadow-xl text-right font-sans" dir="rtl">
        <div className="flex justify-between items-center mb-2">
           <h2 className="text-lg font-bold">{forEditingId ? 'ویرایش کالا' : 'افزودن کالای جدید'}</h2>
           <button onClick={() => { setIsFormOpen(false); setEditingId(null); }}><X size={20}/></button>
        </div>
        <input 
          type="text" placeholder="نام کالا" className="bg-gray-50 p-4 rounded-xl outline-none"
          value={pForm.name}
          onChange={e => setPForm({...pForm, name: e.target.value})}
        />
        <textarea 
          placeholder="توضیحات" className="bg-gray-50 p-4 rounded-xl outline-none h-32"
          value={pForm.description}
          onChange={e => setPForm({...pForm, description: e.target.value})}
        />
        <div className="bg-gray-50 p-4 rounded-xl">
          <p className="text-xs font-bold text-gray-500 mb-3">انتخاب دسته‌بندی‌ها</p>
          <div className="grid grid-cols-2 gap-2">
            {categories.map(c => (
              <label key={c.id} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 accent-blue-600"
                  checked={pForm.categoryIds.includes(c.id)}
                  onChange={e => {
                    if (e.target.checked) {
                      setPForm({...pForm, categoryIds: [...pForm.categoryIds, c.id]});
                    } else {
                      setPForm({...pForm, categoryIds: pForm.categoryIds.filter(id => id !== c.id)});
                    }
                  }}
                />
                <span className="text-xs font-medium">{c.name}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
          <span className="text-xs font-bold text-slate-500 block">ثبت مستقل قیمت‌ها:</span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">قیمت به تومان (دستی)</label>
              <input 
                type="number" 
                placeholder="تومان" 
                className="bg-white p-3 rounded-lg outline-none w-full border border-slate-200 text-sm font-bold text-slate-800"
                value={pForm.priceIRT || ''}
                onChange={e => {
                  const val = Number(e.target.value);
                  setPForm({
                    ...pForm, 
                    priceIRT: val,
                    priceValue: pForm.currency === 'IRT' ? val : pForm.priceValue
                  });
                }}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">قیمت به درهم (دستی)</label>
              <input 
                type="number" 
                placeholder="درهم" 
                className="bg-white p-3 rounded-lg outline-none w-full border border-slate-200 text-sm font-bold text-slate-800"
                value={pForm.priceAED || ''}
                onChange={e => {
                  const val = Number(e.target.value);
                  setPForm({
                    ...pForm,
                    priceAED: val,
                    priceValue: pForm.currency === 'AED' ? val : pForm.priceValue
                  });
                }}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">قیمت به یوان (دستی)</label>
              <input 
                type="number" 
                placeholder="یوان" 
                className="bg-white p-3 rounded-lg outline-none w-full border border-slate-200 text-sm font-bold text-slate-800"
                value={pForm.priceCNY || ''}
                onChange={e => {
                  const val = Number(e.target.value);
                  setPForm({
                    ...pForm,
                    priceCNY: val,
                    priceValue: pForm.currency === 'CNY' ? val : pForm.priceValue
                  });
                }}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
            <span className="text-[10px] font-bold text-slate-400">ارز پیش‌فرض کالا:</span>
            <select 
              className="bg-white border border-slate-200 p-2 rounded-lg text-xs font-bold outline-none cursor-pointer"
              value={pForm.currency}
              onChange={e => {
                const curr = e.target.value as Currency;
                let fallbackVal = pForm.priceValue;
                if (curr === 'IRT' && pForm.priceIRT) fallbackVal = pForm.priceIRT;
                if (curr === 'AED' && pForm.priceAED) fallbackVal = pForm.priceAED;
                if (curr === 'CNY' && pForm.priceCNY) fallbackVal = pForm.priceCNY;
                setPForm({...pForm, currency: curr, priceValue: fallbackVal});
              }}
            >
              <option value="IRT">تومان</option>
              <option value="CNY">یوان</option>
              <option value="AED">درهم</option>
            </select>
            
            <input 
              type="number" 
              placeholder="مقدار کالا" 
              className="bg-white border border-slate-200 p-2 rounded-lg text-xs font-bold outline-none flex-1"
              value={pForm.priceValue || ''}
              onChange={e => setPForm({...pForm, priceValue: Number(e.target.value)})}
            />
          </div>
        </div>

        <div className="space-y-3 bg-violet-50/40 p-4 rounded-xl border border-violet-100 shadow-sm">
          <span className="text-xs font-bold text-violet-700 block">ثبت مستقل قیمت‌های خرید (مخصوص کارمندان):</span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-violet-600 mb-1">قیمت خرید به تومان</label>
              <input 
                type="number" 
                placeholder="تومان" 
                className="bg-white p-3 rounded-lg outline-none w-full border border-violet-200 text-sm font-bold text-slate-800"
                value={pForm.purchasePriceIRT || ''}
                onChange={e => setPForm({...pForm, purchasePriceIRT: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-violet-600 mb-1">قیمت خرید به درهم</label>
              <input 
                type="number" 
                placeholder="درهم" 
                className="bg-white p-3 rounded-lg outline-none w-full border border-violet-200 text-sm font-bold text-slate-800"
                value={pForm.purchasePriceAED || ''}
                onChange={e => setPForm({...pForm, purchasePriceAED: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-violet-600 mb-1">قیمت خرید به یوان</label>
              <input 
                type="number" 
                placeholder="یوان" 
                className="bg-white p-3 rounded-lg outline-none w-full border border-violet-200 text-sm font-bold text-slate-800"
                value={pForm.purchasePriceCNY || ''}
                onChange={e => setPForm({...pForm, purchasePriceCNY: Number(e.target.value)})}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 p-4 rounded-xl">
          <input 
            type="checkbox" id="outOfStock" className="w-5 h-5 accent-red-500"
            checked={pForm.isOutOfStock}
            onChange={e => setPForm({...pForm, isOutOfStock: e.target.checked})}
          />
          <label htmlFor="outOfStock" className="text-sm font-bold text-gray-700 cursor-pointer">ناموجود (تمام شده)</label>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <label className="bg-gray-100 p-4 rounded-xl text-[10px] font-bold flex flex-col items-center gap-2 cursor-pointer relative overflow-hidden">
            {uploading ? <div className="text-blue-500 animate-pulse">در حال آپلود...</div> : (
              <>
                <ImageIcon size={20} /> عکس‌ها
                <input type="file" multiple hidden onChange={e => handleUpload(e, 'images')} disabled={uploading} />
              </>
            )}
          </label>
          <label className={`bg-gray-100 p-4 rounded-xl text-[10px] font-bold flex flex-col items-center gap-2 cursor-pointer ${uploading ? 'opacity-50' : ''}`}>
            <Video size={20} /> ویدیو
            <input type="file" hidden onChange={e => handleUpload(e, 'video')} disabled={uploading} />
          </label>
          <label className={`bg-gray-100 p-4 rounded-xl text-[10px] font-bold flex flex-col items-center gap-2 cursor-pointer ${uploading ? 'opacity-50' : ''}`}>
            <Mic size={20} /> صوت
            <input type="file" hidden onChange={e => handleUpload(e, 'audio')} disabled={uploading} />
          </label>
        </div>

        <div className="flex gap-2 flex-wrap">
          {pForm.media.images.map((img, i) => (
            <div key={i} className="relative">
              <img src={img} className="w-12 h-12 rounded-lg object-cover" />
              <button 
                onClick={() => setPForm({...pForm, media: { ...pForm.media, images: pForm.media.images.filter((_, idx) => idx !== i)}})}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-4">
          <button onClick={saveProduct} className="flex-1 bg-green-600 text-white p-4 rounded-xl font-bold">ذخیره نهایی</button>
          <button onClick={() => { setIsFormOpen(false); setEditingId(null); }} className="flex-1 bg-gray-200 p-4 rounded-xl font-bold">انصراف</button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white border-b border-slate-200 px-4 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-white">
            <SettingsIcon size={18} />
          </div>
          <h1 className="text-xl font-bold">پنل مدیریت احسان استور</h1>
        </div>
        <button onClick={onExit} className="p-2 text-red-500 rounded-xl bg-red-50">
          <LogOut size={20} />
        </button>
      </div>

      <div className="flex gap-2 p-4 overflow-x-auto bg-white border-b border-gray-100 shadow-sm sticky top-[68px] z-30 font-sans">
        {(['products', 'quick-edit', 'categories', 'settings'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${
              activeTab === tab ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'
            }`}
          >
            {tab === 'products' ? 'محصولات' : tab === 'quick-edit' ? 'ویرایش سریع کالاها' : tab === 'categories' ? 'دسته‌بندی' : 'تنظیمات نرخ'}
          </button>
        ))}
      </div>

      <div className="p-4 max-w-4xl mx-auto">
        {activeTab === 'products' && (
          <div className="flex flex-col gap-4 font-sans">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button 
                onClick={() => { resetForm(); setIsFormOpen(true); setIsBulkAddOpen(false); }}
                className="flex items-center justify-center gap-2 bg-blue-600 text-white p-4 rounded-2xl font-bold shadow-lg hover:bg-blue-750 transition-all"
              >
                <PlusCircle size={20} /> افزودن کالا (انفرادی)
              </button>
              <button 
                onClick={() => { setIsBulkAddOpen(!isBulkAddOpen); setIsFormOpen(false); }}
                className="flex items-center justify-center gap-2 bg-purple-600 text-white p-4 rounded-2xl font-bold shadow-lg hover:bg-purple-750 transition-all"
              >
                <Plus size={20} /> افزودن دسته جمعی کالاها
              </button>
            </div>

            {isBulkAddOpen && (
              <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4 animate-fade-in text-right">
                <div className="flex justify-between items-center">
                  <h3 className="font-extrabold text-slate-800 text-sm">افزودن دسته جمعی کالاها (بدون قیمت)</h3>
                  <button onClick={() => setIsBulkAddOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X size={18} />
                  </button>
                </div>
                
                <p className="text-[11px] text-slate-500 leading-relaxed font-bold">
                  نام هر کالا را در یک خط جداگانه وارد کنید. کالاها به طور خودکار ایجاد می‌شوند و پس از آن می‌توانید در برگه «ویرایش سریع» یا دکمه‌های ویرایش، قیمت و تصویر آن‌ها را ثبت کنید.
                </p>

                <textarea
                  rows={6}
                  placeholder="مثال:&#10;آیفون ۱۵ پرو مکس ۲۵۶ گیگ&#10;سامسونگ S24 اولترا ۵۱۲ گیگ&#10;آیپد پرو ۱۱ اینچ ۲۰۲۴"
                  className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs font-bold leading-relaxed outline-none focus:border-purple-500 focus:bg-white transition-all text-right placeholder:text-slate-300 font-sans"
                  id="bulkProductNames"
                />

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const textarea = document.getElementById('bulkProductNames') as HTMLTextAreaElement;
                      if (!textarea) return;
                      const text = textarea.value || '';
                      const names = text.split('\n').map(n => n.trim()).filter(n => n.length > 0);
                      if (names.length === 0) {
                        alert("لطفاً نام حداقل یک کالا را وارد کنید.");
                        return;
                      }

                      const newProducts: Product[] = names.map(name => ({
                        id: 'prod-' + Math.random().toString(36).substring(2, 7) + Date.now().toString().slice(-4),
                        name,
                        description: 'کالای وارد شده به صورت دسته جمعی',
                        categoryIds: [],
                        priceValue: 0,
                        currency: 'IRT',
                        media: { images: [] },
                        isOutOfStock: false,
                        createdAt: new Date().toISOString()
                      }));

                      setProducts(prev => [...newProducts, ...prev]);
                      textarea.value = '';
                      setIsBulkAddOpen(false);
                      alert(`${newProducts.length} کالا با موفقیت اضافه شد. برای ثبت قیمت به تب «ویرایش سریع» بروید.`);
                    }}
                    className="flex-1 bg-purple-600 text-white p-4 rounded-xl font-bold text-xs shadow-md shadow-purple-100 hover:bg-purple-700 transition-all"
                  >
                    ثبت و ایجاد کالاها
                  </button>
                  <button
                    onClick={() => setIsBulkAddOpen(false)}
                    className="bg-slate-100 text-slate-600 p-4 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all"
                  >
                    انصراف
                  </button>
                </div>
              </div>
            )}

            {isFormOpen && !editingId && renderProductForm(null)}

            <div className="grid gap-4">
              {products.map(p => {
                if (isFormOpen && editingId === p.id) {
                  return (
                    <div key={p.id} className="scroll-mt-28" id={`edit-form-${p.id}`}>
                      {renderProductForm(p.id)}
                    </div>
                  );
                }
                return (
                  <div key={p.id} className="bg-white p-4 rounded-2xl flex gap-4 items-center border border-gray-100 shadow-sm">
                    <LazyImage 
                      src={getProductThumbnail(p)} 
                      className="w-16 h-16 rounded-xl bg-gray-50 shrink-0" 
                      imgClassName="object-cover rounded-xl"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-slate-800 max-w-full">{p.name}</h3>
                        {p.isOutOfStock ? (
                          <span className="text-[9px] bg-red-650 text-white px-1.5 py-0.5 rounded-full font-bold whitespace-nowrap">ناموجود</span>
                        ) : (
                          <span className="text-[9px] bg-purple-600 text-white px-1.5 py-0.5 rounded-full font-bold whitespace-nowrap">موجود</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 flex flex-wrap gap-2 pt-1 font-medium">
                        {(p.priceIRT !== undefined && p.priceIRT > 0) || p.currency === 'IRT' ? (
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">تومان: {formatPrice(p.priceIRT || p.priceValue)}</span>
                        ) : null}
                        {(p.priceAED !== undefined && p.priceAED > 0) || p.currency === 'AED' ? (
                          <span className="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded text-[10px]">درهم: {formatPrice(p.priceAED || p.priceValue)}</span>
                        ) : null}
                        {(p.priceCNY !== undefined && p.priceCNY > 0) || p.currency === 'CNY' ? (
                          <span className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded text-[10px]">یوان: {formatPrice(p.priceCNY || p.priceValue)}</span>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button className="p-3 text-blue-500" onClick={() => {
                        editProduct(p);
                        setTimeout(() => {
                          const element = document.getElementById(`edit-form-${p.id}`);
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }
                        }, 100);
                      }}>
                        <Edit size={18} />
                      </button>
                      <button className="p-3 text-red-500" onClick={() => deleteProduct(p.id)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'quick-edit' && (
          <div className="flex flex-col gap-4 font-sans">
            <input 
              type="file" 
              ref={quickEditFileInputRef} 
              onChange={handleQuickImageUpload} 
              accept="image/*" 
              className="hidden" 
            />
            {/* Top Bar for Search, Filter, and Save Buttons */}
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3 justify-between items-center sticky top-[132px] z-30">
              <div className="flex flex-1 flex-col sm:flex-row gap-2 w-full">
                {/* Search */}
                <div className="relative flex-1">
                  <Search size={18} className="absolute right-3 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="جستجو کالا برای ویرایش قیمت..."
                    value={quickEditSearch}
                    onChange={e => setQuickEditSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-3 pr-10 rounded-xl outline-none text-xs font-bold text-slate-800 focus:border-blue-500 transition-colors"
                  />
                </div>
                {/* Category Filter */}
                <select
                  value={quickEditCategory}
                  onChange={e => setQuickEditCategory(e.target.value)}
                  className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-bold outline-none cursor-pointer text-slate-700 min-w-[150px]"
                >
                  <option value="">همه دسته‌بندی‌ها</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Global Actions */}
              <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
                <button
                  onClick={() => setDraftProducts(products)}
                  disabled={!hasChanges}
                  className={`px-4 py-3 rounded-xl font-bold text-xs border transition-all ${
                    hasChanges
                      ? 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                  }`}
                >
                  بازنشانی همه
                </button>
                <button
                  onClick={saveQuickEdits}
                  disabled={!hasChanges}
                  className={`px-6 py-3 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm ${
                    hasChanges
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Save size={16} />
                  <span>ذخیره نهایی کل کالاها</span>
                  {hasChanges && (
                    <span className="bg-white text-blue-600 text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-black animate-pulse">
                      !
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Bulk Category Assignment Card */}
            {selectedProductIds.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-purple-50 p-5 rounded-3xl border border-purple-250 shadow-sm flex flex-col gap-4 text-right"
              >
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div className="text-right">
                    <h4 className="font-extrabold text-purple-950 text-sm">
                      تغییر دسته جمعی دسته‌بندی‌ها ({selectedProductIds.length} کالا انتخاب شده)
                    </h4>
                    <p className="text-[10px] text-purple-700 mt-0.5 font-bold">
                      دسته‌بندی‌های مد نظر را تیک بزنید و دکمه اعمال را کلیک کنید تا کالاها به آنها اضافه یا کسر شوند.
                    </p>
                  </div>
                  <button 
                    onClick={() => setSelectedProductIds([])}
                    className="text-[10px] font-bold bg-white text-slate-500 border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-all"
                  >
                    لغو انتخاب‌ها
                  </button>
                </div>

                <div className="flex flex-wrap gap-3 bg-white p-3.5 rounded-2xl border border-purple-100">
                  {categories.map(c => {
                    const isSelected = bulkCategoryIds.includes(c.id);
                    return (
                      <label 
                        key={c.id} 
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer select-none transition-all ${
                          isSelected 
                            ? 'bg-purple-600 border-purple-500 text-white shadow-xs' 
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/60'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={e => {
                            if (e.target.checked) {
                              setBulkCategoryIds(prev => [...prev, c.id]);
                            } else {
                              setBulkCategoryIds(prev => prev.filter(id => id !== c.id));
                            }
                          }}
                          className="hidden"
                        />
                        <span>{c.name}</span>
                      </label>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={applyBulkCategories}
                    disabled={bulkCategoryIds.length === 0}
                    className={`flex-1 p-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      bulkCategoryIds.length > 0 
                        ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-md shadow-purple-100' 
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <FolderPlus size={16} />
                    <span>افزودن کالاهای انتخابی به این دسته‌بندی‌ها</span>
                  </button>
                  <button
                    onClick={removeBulkCategories}
                    disabled={bulkCategoryIds.length === 0}
                    className={`p-3 px-4 rounded-2xl font-bold text-xs border flex items-center justify-center gap-1.5 transition-all ${
                      bulkCategoryIds.length > 0 
                        ? 'bg-white border-red-200 text-red-600 hover:bg-red-50' 
                        : 'bg-slate-100 text-slate-300 border-slate-100 cursor-not-allowed'
                    }`}
                    title="حذف از دسته‌بندی‌های انتخابی"
                  >
                    <FolderMinus size={16} />
                    <span>حذف از این دسته‌ها</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* List / Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Desktop Header */}
              <div className="hidden md:grid grid-cols-12 gap-3 bg-slate-50/70 p-4 border-b border-slate-100 text-[11px] font-extrabold text-slate-500 text-center items-center">
                <div className="col-span-1 flex justify-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                    checked={filteredQuickProducts.length > 0 && selectedProductIds.length === filteredQuickProducts.length}
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedProductIds(filteredQuickProducts.map(p => p.id));
                      } else {
                        setSelectedProductIds([]);
                      }
                    }}
                  />
                </div>
                <div className="col-span-3 text-right">عنوان کالا</div>
                <div className="col-span-2">قیمت تومان</div>
                <div className="col-span-2">قیمت درهم</div>
                <div className="col-span-2">قیمت یوان</div>
                <div className="col-span-1">موجودی</div>
                <div className="col-span-1">عملیات</div>
              </div>

              {/* Rows */}
              {filteredQuickProducts.length === 0 ? (
                <div className="p-12 text-center text-slate-400 font-medium text-xs">
                  کالایی پیدا نشد.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredQuickProducts.map(p => {
                    const isChanged = isProductModified(p);
                    return (
                      <div
                        key={p.id}
                        className={`p-4 transition-all duration-150 ${
                          isChanged ? 'bg-indigo-50/35 hover:bg-indigo-50/50' : 'hover:bg-slate-50/50'
                        }`}
                      >
                        {/* Desktop Layout */}
                        <div className="hidden md:grid grid-cols-12 gap-3 items-center text-center">
                          {/* Checkbox */}
                          <div className="col-span-1 flex justify-center">
                            <input
                              type="checkbox"
                              checked={selectedProductIds.includes(p.id)}
                              onChange={e => {
                                if (e.target.checked) {
                                  setSelectedProductIds(prev => [...prev, p.id]);
                                } else {
                                  setSelectedProductIds(prev => prev.filter(id => id !== p.id));
                                }
                              }}
                              className="w-4 h-4 accent-purple-650 rounded cursor-pointer"
                            />
                          </div>
                          {/* Image & name */}
                          <div className="col-span-3 flex items-center gap-3 text-right">
                            <div 
                              onClick={() => handleQuickImageClick(p.id)}
                              className="relative w-10 h-10 rounded-lg bg-gray-50 shrink-0 border border-slate-100 cursor-pointer overflow-hidden group/img-desc"
                              title="برای تغییر عکس کلیک کنید"
                            >
                              {uploadingForProductId === p.id ? (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                </div>
                              ) : (
                                <div className="absolute inset-0 bg-black/0 group-hover/img-desc:bg-black/40 flex items-center justify-center z-10 transition-colors duration-150">
                                  <Camera size={14} className="text-white opacity-0 group-hover/img-desc:opacity-100 transition-opacity duration-150" />
                                </div>
                              )}
                              <LazyImage
                                src={getProductThumbnail(p)}
                                className="w-full h-full"
                                imgClassName="object-cover rounded-lg"
                              />
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-slate-800 text-xs truncate max-w-[150px] lg:max-w-[200px]" title={p.name}>
                                {p.name}
                              </h4>
                              <p className="text-[9px] text-slate-400 font-bold block mt-0.5">
                                ارز: {p.currency === 'IRT' ? 'تومان' : p.currency === 'AED' ? 'درهم' : 'یوان'} | مقدار: {p.priceValue}
                              </p>
                            </div>
                          </div>

                          {/* Price Toman */}
                          <div className="col-span-2">
                            <input
                              type="number"
                              value={p.priceIRT === undefined || p.priceIRT === 0 ? '' : p.priceIRT}
                              placeholder="تومان دستی"
                              onChange={e => handleQuickProductChange(p.id, { priceIRT: e.target.value === '' ? undefined : Number(e.target.value) })}
                              className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-black text-slate-800 outline-none text-center focus:bg-white focus:ring-1 focus:ring-blue-500"
                            />
                          </div>

                          {/* Price Dirham */}
                          <div className="col-span-2">
                            <input
                              type="number"
                              value={p.priceAED === undefined || p.priceAED === 0 ? '' : p.priceAED}
                              placeholder="درهم دستی"
                              onChange={e => handleQuickProductChange(p.id, { priceAED: e.target.value === '' ? undefined : Number(e.target.value) })}
                              className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-black text-slate-800 outline-none text-center focus:bg-white focus:ring-1 focus:ring-blue-500"
                            />
                          </div>

                          {/* Price Yuan */}
                          <div className="col-span-2">
                            <input
                              type="number"
                              value={p.priceCNY === undefined || p.priceCNY === 0 ? '' : p.priceCNY}
                              placeholder="یوان دستی"
                              onChange={e => handleQuickProductChange(p.id, { priceCNY: e.target.value === '' ? undefined : Number(e.target.value) })}
                              className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-black text-slate-800 outline-none text-center focus:bg-white focus:ring-1 focus:ring-blue-500"
                            />
                          </div>

                          {/* Out of Stock */}
                          <div className="col-span-1 flex justify-center items-center">
                            <label className="flex items-center gap-1 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={p.isOutOfStock}
                                onChange={e => handleQuickProductChange(p.id, { isOutOfStock: e.target.checked })}
                                className="w-4 h-4 accent-red-500 cursor-pointer"
                              />
                              <span className={`text-[10px] font-bold ${p.isOutOfStock ? 'text-red-500' : 'text-slate-500'}`}>
                                {p.isOutOfStock ? '❌' : '✅'}
                              </span>
                            </label>
                          </div>

                          {/* Icon Actions */}
                          <div className="col-span-1 flex justify-center">
                            {isChanged ? (
                              <button
                                onClick={() => saveSingleProduct(p)}
                                className="p-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center justify-center gap-1 text-[10px] font-bold shadow-md shadow-indigo-100"
                                title="ذخیره این کالا"
                              >
                                <span>ذخیره</span>
                              </button>
                            ) : (
                              <div className="text-purple-500 p-2 flex items-center justify-center bg-purple-50 rounded-lg">
                                <CheckCircle2 size={16} />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Mobile Layout */}
                        <div className="flex md:hidden flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {/* Mobile Checkbox */}
                              <input
                                type="checkbox"
                                checked={selectedProductIds.includes(p.id)}
                                onChange={e => {
                                  if (e.target.checked) {
                                    setSelectedProductIds(prev => [...prev, p.id]);
                                  } else {
                                    setSelectedProductIds(prev => prev.filter(id => id !== p.id));
                                  }
                                }}
                                className="w-4 h-4 accent-purple-650 rounded cursor-pointer shrink-0 ml-1"
                              />
                              <div 
                                onClick={() => handleQuickImageClick(p.id)}
                                className="relative w-8 h-8 rounded-lg bg-gray-50 shrink-0 border border-slate-100 cursor-pointer overflow-hidden group/img-mob"
                              >
                                {uploadingForProductId === p.id ? (
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                                  </div>
                                ) : (
                                  <div className="absolute inset-0 bg-black/0 active:bg-black/30 flex items-center justify-center z-10 transition-colors duration-155">
                                    <Camera size={12} className="text-white opacity-0 group-hover/img-mob:opacity-100 active:opacity-100 transition-opacity duration-155" />
                                  </div>
                                )}
                                <LazyImage
                                  src={getProductThumbnail(p)}
                                  className="w-full h-full"
                                  imgClassName="object-cover rounded-lg"
                                />
                              </div>
                              <h4 className="font-extrabold text-slate-800 text-xs truncate max-w-[180px]">
                                {p.name}
                              </h4>
                            </div>
                            <div>
                              <button
                                onClick={() => handleQuickProductChange(p.id, { isOutOfStock: !p.isOutOfStock })}
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors ${
                                  p.isOutOfStock ? 'bg-red-50 text-red-650' : 'bg-purple-50 text-purple-650'
                                }`}
                              >
                                {p.isOutOfStock ? 'ناموجود' : 'موجود'}
                              </button>
                            </div>
                          </div>

                          {/* Mobile inputs grid */}
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="block text-[8px] font-bold text-slate-400 mb-0.5">قیمت تومان</label>
                              <input
                                type="number"
                                value={p.priceIRT === undefined || p.priceIRT === 0 ? '' : p.priceIRT}
                                placeholder="دستی"
                                onChange={e => handleQuickProductChange(p.id, { priceIRT: e.target.value === '' ? undefined : Number(e.target.value) })}
                                className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-black text-slate-800 outline-none text-center"
                              />
                            </div>
                            <div>
                              <label className="block text-[8px] font-bold text-slate-400 mb-0.5">قیمت درهم</label>
                              <input
                                type="number"
                                value={p.priceAED === undefined || p.priceAED === 0 ? '' : p.priceAED}
                                placeholder="دستی"
                                onChange={e => handleQuickProductChange(p.id, { priceAED: e.target.value === '' ? undefined : Number(e.target.value) })}
                                className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-black text-slate-800 outline-none text-center"
                              />
                            </div>
                            <div>
                              <label className="block text-[8px] font-bold text-slate-400 mb-0.5">قیمت یوان</label>
                              <input
                                type="number"
                                value={p.priceCNY === undefined || p.priceCNY === 0 ? '' : p.priceCNY}
                                placeholder="دستی"
                                onChange={e => handleQuickProductChange(p.id, { priceCNY: e.target.value === '' ? undefined : Number(e.target.value) })}
                                className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-black text-slate-800 outline-none text-center"
                              />
                            </div>
                          </div>

                          {/* Mobile Save Row */}
                          {isChanged && (
                            <button
                              onClick={() => saveSingleProduct(p)}
                              className="w-full bg-indigo-600 text-white p-2 rounded-lg font-bold text-xs flex justify-center items-center gap-1 shadow-sm"
                            >
                              <Save size={14} />
                              <span>ذخیره همین کالا</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom Sticky Action box if modified */}
            {hasChanges && (
              <div className="bg-indigo-650 p-4 rounded-3xl text-white flex justify-between items-center shadow-lg flex-col sm:flex-row gap-3">
                <div className="text-right">
                  <h4 className="font-bold text-sm">تغییرات قیمت ویرایش شده اعمال نشده‌اند!</h4>
                  <p className="text-[10px] text-indigo-200 mt-0.5 font-medium">برای همگام‌سازی نهایی در دیتابیس گزینه ذخیره کل کالاها را بزنید.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setDraftProducts(products)}
                    className="flex-1 sm:flex-initial px-4 py-2 bg-indigo-850 hover:bg-indigo-900 rounded-xl font-bold text-xs text-white"
                  >
                    لغو همه
                  </button>
                  <button
                    onClick={saveQuickEdits}
                    className="flex-1 sm:flex-initial px-5 py-2 bg-white hover:bg-slate-50 rounded-xl font-bold text-xs text-indigo-700 shadow-sm"
                  >
                    ذخیره کل کالاها
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white p-6 rounded-3xl space-y-6 shadow-sm border border-slate-100">
            <div>
              <label className="block text-sm font-bold mb-2">نرخ یوان (به تومان)</label>
              <input 
                type="number" 
                value={settings.cnyRate} 
                onChange={e => setSettings({...settings, cnyRate: e.target.value})}
                className="w-full bg-gray-50 p-4 rounded-2xl outline-none font-bold"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">نرخ درهم (به تومان)</label>
              <input 
                type="number" 
                value={settings.aedRate} 
                onChange={e => setSettings({...settings, aedRate: e.target.value})}
                className="w-full bg-gray-50 p-4 rounded-2xl outline-none font-bold"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">رمز عبور مدیر (Admin)</label>
                <input 
                  type="text" 
                  value={settings.adminPassword || ''} 
                  onChange={e => setSettings({...settings, adminPassword: e.target.value})}
                  className="w-full bg-white border border-slate-200 p-4 rounded-xl outline-none font-bold text-indigo-650"
                  placeholder="رمز عبور مدیر"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">رمز عبور کارمندان (Staff)</label>
                <input 
                  type="text" 
                  value={settings.staffPassword || ''} 
                  onChange={e => setSettings({...settings, staffPassword: e.target.value})}
                  className="w-full bg-white border border-slate-200 p-4 rounded-xl outline-none font-bold text-indigo-650"
                  placeholder="رمز عبور کارمندان"
                />
              </div>
            </div>
            
             <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 flex flex-col gap-5">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-sm">تنظیمات بنرهای معرفی (صفحه اصلی - انباشته متصل به هم بدون حاشیه)</h3>
                <button
                  onClick={() => {
                    const currentBanners = settings.banners || (settings.bannerUrl || settings.bannerUrlDesktop ? [{
                      id: Date.now().toString(),
                      bannerUrl: settings.bannerUrl || '',
                      bannerUrlDesktop: settings.bannerUrlDesktop || '',
                      bannerRedirect: settings.bannerRedirect || ''
                    }] : []);
                    const newBanner = {
                      id: (Date.now() + 1).toString(),
                      bannerUrl: '',
                      bannerUrlDesktop: '',
                      bannerRedirect: ''
                    };
                    setSettings({
                      ...settings,
                      banners: [...currentBanners, newBanner],
                      bannerUrl: undefined,
                      bannerUrlDesktop: undefined,
                      bannerRedirect: undefined
                    });
                  }}
                  className="bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <Plus size={14} />
                  <span>افزودن بنر جدید</span>
                </button>
              </div>

              {/* Banners List */}
              {(() => {
                const activeBanners = settings.banners && settings.banners.length > 0 
                  ? settings.banners 
                  : (settings.bannerUrl || settings.bannerUrlDesktop 
                      ? [{ 
                          id: 'legacy', 
                          bannerUrl: settings.bannerUrl || '', 
                          bannerUrlDesktop: settings.bannerUrlDesktop || '', 
                          bannerRedirect: settings.bannerRedirect || '' 
                        }] 
                      : []
                    );

                if (activeBanners.length === 0) {
                  return (
                    <div className="border border-dashed border-slate-200 bg-white rounded-2xl p-8 text-center text-xs text-slate-400 font-bold">
                      هیچ بنری تعریف نشده است. نوشته متنی پیش‌فرض در صفحه اصلی نمایش داده می‌شود.
                    </div>
                  );
                }

                return (
                  <div className="space-y-6">
                    {activeBanners.map((b, idx) => {
                      const updateBannerField = (updates: Partial<BannerItem>) => {
                        const updated = activeBanners.map(item => item.id === b.id ? { ...item, ...updates } : item);
                        setSettings({
                          ...settings,
                          banners: updated,
                          bannerUrl: undefined,
                          bannerUrlDesktop: undefined,
                          bannerRedirect: undefined
                        });
                      };

                      const handleMoveUp = () => {
                        if (idx === 0) return;
                        const copy = [...activeBanners];
                        const temp = copy[idx];
                        copy[idx] = copy[idx - 1];
                        copy[idx - 1] = temp;
                        setSettings({
                          ...settings,
                          banners: copy,
                          bannerUrl: undefined,
                          bannerUrlDesktop: undefined,
                          bannerRedirect: undefined
                        });
                      };

                      const handleMoveDown = () => {
                        if (idx === activeBanners.length - 1) return;
                        const copy = [...activeBanners];
                        const temp = copy[idx];
                        copy[idx] = copy[idx + 1];
                        copy[idx + 1] = temp;
                        setSettings({
                          ...settings,
                          banners: copy,
                          bannerUrl: undefined,
                          bannerUrlDesktop: undefined,
                          bannerRedirect: undefined
                        });
                      };

                      const handleDelete = () => {
                        const filtered = activeBanners.filter(item => item.id !== b.id);
                        setSettings({
                          ...settings,
                          banners: filtered,
                          bannerUrl: undefined,
                          bannerUrlDesktop: undefined,
                          bannerRedirect: undefined
                        });
                      };

                      return (
                        <div key={b.id || idx} className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col gap-4 relative shadow-xs">
                          {/* Banner Header with controls */}
                          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                            <span className="text-xs font-black text-purple-700">بنر شماره {idx + 1}</span>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={handleMoveUp}
                                disabled={idx === 0}
                                title="انتقال به بالا"
                                className="p-1.5 text-slate-400 hover:text-purple-600 disabled:opacity-35 transition-colors"
                              >
                                <ArrowUp size={14} />
                              </button>
                              <button
                                onClick={handleMoveDown}
                                disabled={idx === activeBanners.length - 1}
                                title="انتقال به پایین"
                                className="p-1.5 text-slate-400 hover:text-purple-600 disabled:opacity-35 transition-colors"
                              >
                                <ArrowDown size={14} />
                              </button>
                              <button
                                onClick={handleDelete}
                                title="حذف این بنر"
                                className="p-1.5 text-red-400 hover:text-red-600 transition-colors mr-2"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Mobile Banner portion */}
                            <div className="flex flex-col gap-2">
                              <span className="text-[10px] font-black text-slate-600">تصویر بنر موبایل</span>
                              {b.bannerUrl ? (
                                <div className="relative rounded-xl overflow-hidden border border-slate-150 bg-slate-50 p-1.5">
                                  <img 
                                    src={b.bannerUrl} 
                                    alt="پیش‌نمایش موبایل" 
                                    className="w-full h-auto max-h-32 object-contain rounded-lg"
                                  />
                                </div>
                              ) : (
                                <div className="border border-dashed border-slate-200 bg-slate-50 rounded-xl p-3 text-center text-[10px] text-slate-400 font-bold">
                                  تصویر موبایل تنظیم نشده است
                                </div>
                              )}
                              <div className="flex gap-2">
                                <input 
                                  type="text" 
                                  value={b.bannerUrl || ''} 
                                  onChange={e => updateBannerField({ bannerUrl: e.target.value })}
                                  className="flex-1 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg outline-none text-xs font-bold font-mono text-left"
                                  placeholder="https://example.com/mobile-banner.jpg"
                                  dir="ltr"
                                />
                                <div className="relative">
                                  <button className="bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors h-full">
                                    <Camera size={12} />
                                    <span>آپلود</span>
                                  </button>
                                  <input 
                                    type="file" 
                                    accept="image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                    onChange={async (e) => {
                                      if (!e.target.files || e.target.files.length === 0) return;
                                      const rawFile = e.target.files[0];
                                      const file = await convertToWebP(rawFile);
                                      try {
                                        const formData = new FormData();
                                        formData.append('file', file);
                                        const res = await fetch('/api/upload', { method: 'POST', body: formData });
                                        if (res.ok) {
                                          const resData = await res.json();
                                          if (resData && resData.url) {
                                            updateBannerField({ bannerUrl: resData.url });
                                            alert("تصویر بنر موبایل با موفقیت به فرمت WebP تبدیل و آپلود شد.");
                                          }
                                        } else {
                                          const reader = new FileReader();
                                          reader.onloadend = () => {
                                            updateBannerField({ bannerUrl: reader.result as string });
                                            alert("تصویر بنر موبایل به فرمت WebP فشرده شد و ذخیره گردید.");
                                          };
                                          reader.readAsDataURL(file);
                                        }
                                      } catch (err) {
                                        alert("خطا در بارگذاری فایل.");
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Desktop Banner portion */}
                            <div className="flex flex-col gap-2">
                              <span className="text-[10px] font-black text-slate-600">تصویر بنر دسکتاپ</span>
                              {b.bannerUrlDesktop ? (
                                <div className="relative rounded-xl overflow-hidden border border-slate-150 bg-slate-50 p-1.5">
                                  <img 
                                    src={b.bannerUrlDesktop} 
                                    alt="پیش‌نمایش دسکتاپ" 
                                    className="w-full h-auto max-h-32 object-contain rounded-lg"
                                  />
                                </div>
                              ) : (
                                <div className="border border-dashed border-slate-200 bg-slate-50 rounded-xl p-3 text-center text-[10px] text-slate-400 font-bold">
                                  تصویر دسکتاپ تنظیم نشده است
                                </div>
                              )}
                              <div className="flex gap-2">
                                <input 
                                  type="text" 
                                  value={b.bannerUrlDesktop || ''} 
                                  onChange={e => updateBannerField({ bannerUrlDesktop: e.target.value })}
                                  className="flex-1 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg outline-none text-xs font-bold font-mono text-left"
                                  placeholder="https://example.com/desktop-banner.jpg"
                                  dir="ltr"
                                />
                                <div className="relative">
                                  <button className="bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors h-full">
                                    <Camera size={12} />
                                    <span>آپلود</span>
                                  </button>
                                  <input 
                                    type="file" 
                                    accept="image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                    onChange={async (e) => {
                                      if (!e.target.files || e.target.files.length === 0) return;
                                      const rawFile = e.target.files[0];
                                      const file = await convertToWebP(rawFile);
                                      try {
                                        const formData = new FormData();
                                        formData.append('file', file);
                                        const res = await fetch('/api/upload', { method: 'POST', body: formData });
                                        if (res.ok) {
                                          const resData = await res.json();
                                          if (resData && resData.url) {
                                            updateBannerField({ bannerUrlDesktop: resData.url });
                                            alert("تصویر بنر دسکتاپ با موفقیت به فرمت WebP تبدیل و آپلود شد.");
                                          }
                                        } else {
                                          const reader = new FileReader();
                                          reader.onloadend = () => {
                                            updateBannerField({ bannerUrlDesktop: reader.result as string });
                                            alert("تصویر بنر دسکتاپ به فرمت WebP فشرده شد و ذخیره گردید.");
                                          };
                                          reader.readAsDataURL(file);
                                        }
                                      } catch (err) {
                                        alert("خطا در بارگذاری فایل.");
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Redirect URL */}
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-slate-500">لینک مقصد بنر (اختیاری - کابر با کلیک روی این بنر به این صفحه هدایت می‌شود)</label>
                            <input 
                              type="text" 
                              value={b.bannerRedirect || ''} 
                              onChange={e => updateBannerField({ bannerRedirect: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl outline-none text-xs font-bold text-left"
                              placeholder="مثال: /?category=cat-nothing"
                              dir="ltr"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Slider Customization Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                <div>
                  <label className="block text-xs font-black text-slate-600 mb-2">زمان تغییر خودکار اسلایدها:</label>
                  <div className="flex items-center gap-3 bg-white border border-slate-200 px-3 py-2 rounded-xl">
                    <input 
                      type="range" 
                      min="2" 
                      max="15" 
                      step="1"
                      value={settings.bannerInterval || 5} 
                      onChange={e => setSettings({ ...settings, bannerInterval: parseInt(e.target.value, 10) })}
                      className="w-full accent-purple-600 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-800 whitespace-nowrap min-w-[50px] text-center" dir="ltr">
                      {settings.bannerInterval || 5} ثانیه
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-600 mb-2">مدل ورق خوردن (انیمیشن تغییر اسلاید):</label>
                  <select
                    value={settings.bannerTransition || 'slide'}
                    onChange={e => setSettings({ ...settings, bannerTransition: e.target.value as any })}
                    className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl outline-none text-xs font-bold text-slate-700 cursor-pointer"
                  >
                    <option value="slide">⬅️ کشویی ساده (اسلاید پهلو)</option>
                    <option value="fade">✨ محو شدن ملایم (Fade)</option>
                    <option value="scale">🔍 زوم دینامیک (Scale & Fade)</option>
                    <option value="flip">📖 ورق خوردن کتاب (چرخش سه‌بعدی 3D)</option>
                    <option value="rotate">🔄 چرخش سه بعدی (3D Spin)</option>
                    <option value="slideUp">⬆️ حرکت رو به بالا (Slide Up)</option>
                    <option value="shutter">📸 شاتر دوربین (Rotate & Scale)</option>
                    <option value="elastic">🔮 حالت ارتجاعی (Elastic Slide)</option>
                    <option value="blur">🌫️ افکت تاری رویایی (Blur & Fade)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <input 
                type="checkbox" 
                id="showGlobalRates" 
                className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                checked={settings.showGlobalRates !== false} 
                onChange={e => setSettings({...settings, showGlobalRates: e.target.checked})}
              />
              <label htmlFor="showGlobalRates" className="text-sm font-bold text-slate-700 cursor-pointer select-none">
                نمایش نرخ یوان و درهم در بالای صفحه اصلی
              </label>
            </div>

            {/* Default Virtual Categories Visibility */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-1">نمایش دسته‌بندی‌های پیش‌فرض ابتدای سایت:</h4>
              
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="showAllProductsCategory" 
                  className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
                  checked={settings.showAllProductsCategory !== false} 
                  onChange={e => setSettings({...settings, showAllProductsCategory: e.target.checked})}
                />
                <label htmlFor="showAllProductsCategory" className="text-sm font-bold text-slate-700 cursor-pointer select-none">
                  نمایش دسته‌بندی «همه کالاها»
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="showAvailableCategory" 
                  className="w-5 h-5 accent-purple-650 rounded cursor-pointer"
                  checked={settings.showAvailableCategory !== false} 
                  onChange={e => setSettings({...settings, showAvailableCategory: e.target.checked})}
                />
                <label htmlFor="showAvailableCategory" className="text-sm font-bold text-slate-700 cursor-pointer select-none">
                  نمایش دسته‌بندی «موجودها»
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="showOutOfStockCategory" 
                  className="w-5 h-5 accent-purple-650 rounded cursor-pointer"
                  checked={settings.showOutOfStockCategory !== false} 
                  onChange={e => setSettings({...settings, showOutOfStockCategory: e.target.checked})}
                />
                <label htmlFor="showOutOfStockCategory" className="text-sm font-bold text-slate-700 cursor-pointer select-none">
                  نمایش دسته‌بندی «ناموجودها»
                </label>
              </div>
            </div>

            <button onClick={saveRates} className="w-full bg-black text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-2">
              <Save size={20} /> بروزرسانی نرخ‌های روزانه
            </button>

            {/* Removed the zip export block */}
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl flex flex-col gap-3 shadow-sm border border-slate-100">
              <div className="flex gap-2 items-center">
                <div className="relative w-14 h-14 bg-purple-50 rounded-xl border border-dashed border-purple-200 flex items-center justify-center shrink-0 overflow-hidden">
                   {newCatIcon && ICON_MAP[newCatIcon] ? (
                     (() => {
                       const IconComp = ICON_MAP[newCatIcon];
                       return <IconComp size={24} className="text-purple-600" />;
                     })()
                   ) : newCatIcon ? (
                     <img src={newCatIcon} className="w-full h-full object-cover" />
                   ) : (
                     <Layers size={24} className="text-purple-400" />
                   )}
                </div>
                <input 
                  id="cat-name" type="text" placeholder="نام دسته‌بندی جدید" 
                  className="flex-1 bg-gray-50 p-4 rounded-xl outline-none font-bold text-xs"
                />
              </div>

              {/* Icon Picker Grid */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">انتخاب آیکون دسته‌بندی (بیرنگ که با انتخاب بنفش می‌شود):</label>
                <div className="grid grid-cols-5 gap-2 max-h-[160px] overflow-y-auto p-2 border border-slate-100 rounded-xl bg-slate-50">
                  {SELECTABLE_ICONS.map(item => {
                    const IconComponent = item.icon;
                    const isSelected = newCatIcon === item.name;
                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => setNewCatIcon(item.name)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all duration-200 ${
                          isSelected
                            ? 'bg-purple-100 border-purple-400 text-purple-600 shadow-xs scale-105'
                            : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300'
                        }`}
                        title={item.label}
                      >
                        <IconComponent size={20} />
                        <span className="text-[8px] mt-1 font-bold">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Upload image option if they want */}
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-bold text-slate-400">یا بارگذاری تصویر سفارشی:</span>
                <div className="relative w-8 h-8 bg-gray-50 rounded-lg border border-dashed border-gray-300 flex items-center justify-center shrink-0 cursor-pointer overflow-hidden">
                   <ImageIcon size={14} className="text-gray-300" />
                   <input type="file" hidden onChange={e => handleCatIconUpload(e)} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                {newCatIcon && (newCatIcon.startsWith('http') || newCatIcon.startsWith('data:')) && (
                  <button type="button" onClick={() => setNewCatIcon('')} className="text-[10px] text-red-500 font-bold hover:underline">حذف تصویر</button>
                )}
              </div>

              <button 
                onClick={() => {
                  const el = document.getElementById('cat-name') as HTMLInputElement;
                  if (el.value) {
                    addCategory(el.value, newCatIcon);
                    el.value = '';
                  }
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold text-sm mt-2 transition-colors"
              >
                افزودن دسته‌بندی
              </button>
            </div>

            <div className="grid gap-2">
              {categories.map((c, idx) => {
                const isDragged = draggedCatIndex === idx;
                return (
                  <div 
                    key={c.id} 
                    draggable={editingCategoryId !== c.id}
                    onDragStart={(e) => handleCatDragStart(e, idx)}
                    onDragOver={(e) => handleCatDragOver(e, idx)}
                    onDragEnd={handleCatDragEnd}
                    className={`bg-white p-4 rounded-xl flex justify-between items-center border shadow-sm transition-all duration-150 ${
                      isDragged ? 'opacity-40 border-purple-300 bg-purple-50/20' : 'border-gray-100 hover:bg-slate-50'
                    } ${editingCategoryId !== c.id ? 'cursor-grab active:cursor-grabbing' : ''}`}
                  >
                    {editingCategoryId === c.id ? (
                      <div className="flex-1 flex flex-col gap-3">
                        <div className="flex gap-2 items-center">
                          <div className="relative w-12 h-12 bg-purple-50 rounded-lg border border-dashed border-purple-200 flex items-center justify-center shrink-0 overflow-hidden">
                             {catEditIcon && ICON_MAP[catEditIcon] ? (
                               (() => {
                                 const IconComp = ICON_MAP[catEditIcon];
                                 return <IconComp size={20} className="text-purple-600" />;
                               })()
                             ) : catEditIcon ? (
                               <img src={catEditIcon} className="w-full h-full object-cover" />
                             ) : (
                               <Layers size={20} className="text-purple-400" />
                             )}
                          </div>
                          <input 
                            className="flex-1 bg-white p-2 rounded-lg border border-indigo-200 outline-none font-bold text-xs"
                            value={catEditName}
                            onChange={e => setCatEditName(e.target.value)}
                            autoFocus
                          />
                        </div>

                        {/* Edit Icon Picker Grid */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1.5">تغییر آیکون دسته‌بندی (بیرنگ که با انتخاب بنفش می‌شود):</label>
                          <div className="grid grid-cols-5 gap-1.5 max-h-[140px] overflow-y-auto p-1.5 border border-slate-100 rounded-xl bg-slate-50">
                            {SELECTABLE_ICONS.map(item => {
                              const IconComponent = item.icon;
                              const isSelected = catEditIcon === item.name;
                              return (
                                <button
                                  key={item.name}
                                  type="button"
                                  onClick={() => setCatEditIcon(item.name)}
                                  className={`flex flex-col items-center justify-center p-1.5 rounded-lg border transition-all duration-200 ${
                                    isSelected
                                      ? 'bg-purple-100 border-purple-400 text-purple-600 shadow-xs scale-105'
                                      : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300'
                                  }`}
                                  title={item.label}
                                >
                                  <IconComponent size={16} />
                                  <span className="text-[8px] mt-0.5 font-bold">{item.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Upload image option if they want */}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400">یا تصویر سفارشی:</span>
                          <div className="relative w-6 h-6 bg-gray-50 rounded border border-dashed border-gray-300 flex items-center justify-center shrink-0 cursor-pointer overflow-hidden">
                             <ImageIcon size={12} className="text-gray-300" />
                             <input type="file" hidden onChange={e => handleCatIconUpload(e, true)} className="absolute inset-0 opacity-0 cursor-pointer" />
                          </div>
                          {catEditIcon && (catEditIcon.startsWith('http') || catEditIcon.startsWith('data:')) && (
                            <button type="button" onClick={() => setCatEditIcon('')} className="text-[9px] text-red-500 font-bold hover:underline">حذف تصویر</button>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button onClick={() => updateCategory(c.id)} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-bold text-xs font-sans">بروزرسانی</button>
                          <button onClick={() => setEditingCategoryId(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 py-2 rounded-lg font-bold text-xs text-slate-500">انصراف</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <div className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing p-1" title="برای جابجایی بکشید">
                            <GripVertical size={16} />
                          </div>
                          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0 overflow-hidden">
                            {c.icon && ICON_MAP[c.icon] ? (
                              (() => {
                                const IconComp = ICON_MAP[c.icon];
                                return <IconComp size={20} className="text-purple-600" />;
                              })()
                            ) : c.icon ? (
                              <img src={c.icon} className="w-full h-full object-cover" />
                            ) : (
                              <Layers size={20} className="text-purple-400" />
                            )}
                          </div>
                          <span className="font-bold text-slate-700">{c.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleCatMoveUp(idx)}
                            disabled={idx === 0}
                            title="انتقال به بالا"
                            className="p-1.5 text-slate-400 hover:text-purple-600 disabled:opacity-30 transition-colors"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            onClick={() => handleCatMoveDown(idx)}
                            disabled={idx === categories.length - 1}
                            title="انتقال به پایین"
                            className="p-1.5 text-slate-400 hover:text-purple-600 disabled:opacity-30 transition-colors"
                          >
                            <ArrowDown size={14} />
                          </button>
                          <button onClick={() => { setEditingCategoryId(c.id); setCatEditName(c.name); setCatEditIcon(c.icon || ''); }} className="px-3 py-1.5 text-xs font-bold text-blue-500 bg-blue-50 hover:bg-blue-100/50 rounded-lg transition-colors mr-1">ویرایش</button>
                          <button onClick={() => deleteCategory(c.id)} className="px-3 py-1.5 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100/50 rounded-lg transition-colors">حذف</button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ES_PATTERN_SVG = `data:image/svg+xml;utf8,<svg width="110" height="110" viewBox="0 0 110 110" xmlns="http://www.w3.org/2000/svg"><text x="25" y="30" font-family="'Inter', system-ui, sans-serif" font-weight="900" font-size="12" fill="%238b5cf6" opacity="0.06" text-anchor="middle">ES</text><text x="80" y="85" font-family="'Inter', system-ui, sans-serif" font-weight="900" font-size="12" fill="%236d28d9" opacity="0.04" text-anchor="middle">ES</text></svg>`;

export default function App() {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('ehsan_products');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 500) {
          return parsed;
        }
      } catch (err) {
        // Fallback
      }
    }
    return INITIAL_PRODUCTS;
  });
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('ehsan_categories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        // Fallback
      }
    }
    return INITIAL_CATEGORIES;
  });
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('ehsan_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        // Fallback
      }
    }
    return INITIAL_SETTINGS;
  });

  const [currentSlide, setCurrentSlide] = useState(0);

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const activeBanners = settings.banners && settings.banners.length > 0 
      ? settings.banners 
      : (settings.bannerUrl || settings.bannerUrlDesktop 
          ? [{ 
              id: 'legacy', 
              bannerUrl: settings.bannerUrl || '', 
              bannerUrlDesktop: settings.bannerUrlDesktop || '', 
              bannerRedirect: settings.bannerRedirect || '' 
            }] 
          : []
        );

    if (activeBanners.length <= 1) return;

    const intervalSec = settings.bannerInterval || 5;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % activeBanners.length);
    }, intervalSec * 1000);

    return () => clearInterval(timer);
  }, [settings.banners, settings.bannerUrl, settings.bannerUrlDesktop, settings.bannerInterval]);

  const activeBannersCount = (settings.banners && settings.banners.length > 0)
    ? settings.banners.length
    : ((settings.bannerUrl || settings.bannerUrlDesktop) ? 1 : 0);

  useEffect(() => {
    if (activeBannersCount > 0 && currentSlide >= activeBannersCount) {
      setCurrentSlide(0);
    }
  }, [activeBannersCount, currentSlide]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/data');
        if (res.ok) {
          const data = await res.json();
          if (data.products && Array.isArray(data.products) && data.products.length > 0) {
            setProducts(data.products);
          }
          if (data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
            setCategories(data.categories);
          }
          if (data.settings && typeof data.settings === 'object' && Object.keys(data.settings).length > 0) {
            setSettings(data.settings);
          }
        }
      } catch (err) {
        console.error("Failed to fetch data from database, falling back to local files & localStorage", err);
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem('ehsan_products', JSON.stringify(products));
    if (isInitialized) {
      fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products })
      }).catch(err => console.error("Error saving products:", err));
    }
  }, [products, isInitialized]);

  useEffect(() => {
    localStorage.setItem('ehsan_categories', JSON.stringify(categories));
    if (isInitialized) {
      fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories })
      }).catch(err => console.error("Error saving categories:", err));
    }
  }, [categories, isInitialized]);

  useEffect(() => {
    localStorage.setItem('ehsan_settings', JSON.stringify(settings));
    if (isInitialized) {
      fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      }).catch(err => console.error("Error saving settings:", err));
    }
  }, [settings, isInitialized]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isStaff, setIsStaff] = useState<boolean>(() => localStorage.getItem('ehsan_is_staff') === 'true');
  const [showStaffLogin, setShowStaffLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'shop' | 'admin' | 'history' | 'staff'>('shop');

  // Handle back button for popup and views
  useEffect(() => {
    const handlePopState = () => {
      // If a product is selected, close it
      if (selectedProduct) {
        setSelectedProduct(null);
      } 
      // If we are in a different view, return to shop
      else if (viewMode !== 'shop') {
        setViewMode('shop');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [selectedProduct, viewMode]);

  // Push history state whenever a product is selected or view mode changes
  useEffect(() => {
    if (selectedProduct || viewMode !== 'shop') {
      // Using a flag to identify our pushed state if needed
      window.history.pushState({ modal: true }, "");
    }
  }, [selectedProduct !== null, viewMode !== 'shop']);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const mode = searchParams.get('mode');
    if (mode === 'admin') setViewMode('admin');
    else if (mode === 'staff') setViewMode('staff');
    else setViewMode('shop');
  }, []);

  // Separate effect to handle deep linking once products are loaded
  useEffect(() => {
    if (products.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const productId = params.get('p');
      if (productId) {
        const p = products.find(prod => prod.id === productId);
        if (p) setSelectedProduct(p);
      }
    }
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = products;
    if (selectedCategory === 'available') {
      result = products.filter(p => !p.isOutOfStock);
    } else if (selectedCategory === 'out-of-stock') {
      result = products.filter(p => p.isOutOfStock);
    } else if (selectedCategory) {
      result = products.filter(p => p.categoryIds && p.categoryIds.includes(selectedCategory));
    }

    if (searchQuery.trim()) {
      const q = normalizeFarsi(searchQuery);
      result = result.filter(p => 
        normalizeFarsi(p.name).includes(q) || 
        normalizeFarsi(p.description).includes(q)
      );
    }
    return result;
  }, [products, selectedCategory, searchQuery]);

  useEffect(() => {
    if (viewMode === 'admin' && !isAdmin) {
      setShowLogin(true);
    }
  }, [viewMode, isAdmin]);

  useEffect(() => {
    if (viewMode === 'staff' && !isStaff) {
      setShowStaffLogin(true);
    }
  }, [viewMode, isStaff]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const pass = (e.target as any).password.value;
    const correctPass = settings.adminPassword || 'admin123';
    if (pass === correctPass) {
      setIsAdmin(true);
      setShowLogin(false);
    } else {
      alert('رمز عبور اشتباه است');
    }
  };

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const pass = (e.target as any).password.value;
    const correctPass = settings.staffPassword || 'staff123';
    if (pass === correctPass) {
      setIsStaff(true);
      localStorage.setItem('ehsan_is_staff', 'true');
      setShowStaffLogin(false);
    } else {
      alert('رمز عبور پرسنل اشتباه است');
    }
  };

  const [showScrollHint, setShowScrollHint] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const getCategoryIcon = (id: string, active: boolean) => {
    const props = {
      size: 28,
      className: "text-white"
    };
    
    switch(id) {
      case 'cat-handsfree': return <Headphones {...props} />;
      case 'cat-adapter': return <PlugZap {...props} />;
      case 'cat-speaker': return <Speaker {...props} />;
      case 'cat-cable': return <Cable {...props} />;
      case 'cat-charger': return <Car {...props} />;
      case 'cat-mic-headset': return <Mic {...props} />;
      case 'cat-lighting-fan': return <Lightbulb {...props} />;
      case 'cat-console-games': return <Gamepad2 {...props} />;
      case 'cat-ferrari': return <Crown {...props} />;
      case 'cat-anker': return <Battery {...props} />;
      case 'cat-philips': return <Sparkles {...props} />;
      case 'cat-dji': return <Camera {...props} />;
      case 'cat-hollyland': return <Mic {...props} />;
      case 'cat-powerology': return <Zap {...props} />;
      case 'cat-nothing': return <Fingerprint {...props} />;
      case 'cat-apple-misc': return <Apple {...props} />;
      case 'cat-jbl': return <Music {...props} />;
      case 'cat-harman-kardon': return <AudioLines {...props} />;
      case 'cat-hopestar': return <Music {...props} />;
      default: return <Layers {...props} />;
    }
  };

  const getCategoryColor = (id: string) => {
    switch(id) {
      case 'cat-handsfree': return 'bg-indigo-500';
      case 'cat-adapter': return 'bg-orange-500';
      case 'cat-speaker': return 'bg-pink-600';
      case 'cat-cable': return 'bg-blue-600';
      case 'cat-charger': return 'bg-cyan-600';
      case 'cat-mic-headset': return 'bg-purple-600';
      case 'cat-lighting-fan': return 'bg-amber-500';
      case 'cat-console-games': return 'bg-emerald-600';
      case 'cat-ferrari': return 'bg-red-600';
      case 'cat-anker': return 'bg-sky-600';
      case 'cat-philips': return 'bg-teal-600';
      case 'cat-dji': return 'bg-zinc-800';
      case 'cat-hollyland': return 'bg-indigo-600';
      case 'cat-powerology': return 'bg-lime-600';
      case 'cat-nothing': return 'bg-stone-900';
      case 'cat-apple-misc': return 'bg-rose-500';
      case 'cat-jbl': return 'bg-orange-600';
      case 'cat-harman-kardon': return 'bg-violet-700';
      case 'cat-hopestar': return 'bg-fuchsia-600';
      default: return 'bg-slate-700';
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    // In RTL, scrollLeft is 0 at the start (rightmost) and decreases (becomes negative) as you scroll left
    // Some browsers do it differently, but usually if scrollLeft is far from the negative max, there's more to scroll.
    // Simplifying: if user scrolled at all, hide hint.
    if (Math.abs(target.scrollLeft) > 20) {
      setShowScrollHint(false);
    }
  };

  if (viewMode === 'admin' && isAdmin) return (
    <AdminView 
      onExit={() => { setViewMode('shop'); setIsAdmin(false); window.history.replaceState(null, '', window.location.pathname); }} 
      products={products}
      setProducts={setProducts}
      categories={categories}
      setCategories={setCategories}
      settings={settings}
      setSettings={setSettings}
    />
  );
  if (viewMode === 'history') return <HistoryView onExit={() => { setViewMode('shop'); window.history.replaceState(null, '', window.location.pathname); }} history={[]} />;

  return (
    <div 
      className="min-h-screen bg-[#FAF9FF] text-slate-800 pb-20 font-sans antialiased relative selection:bg-purple-200"
      style={{ 
        backgroundImage: `radial-gradient(circle at center, rgba(250, 249, 255, 0.45) 0%, rgba(243, 240, 255, 0.98) 100%), url("${ES_PATTERN_SVG}")`, 
        backgroundAttachment: 'fixed', 
        backgroundPosition: 'center', 
        backgroundSize: 'auto', 
        backgroundRepeat: 'repeat' 
      }}
    >
      <FloatingContact />
      
      {viewMode === 'staff' && (
        <div className="bg-gradient-to-r from-purple-700 to-violet-850 text-white px-6 py-3.5 flex flex-wrap justify-between items-center text-xs md:text-sm font-black text-right gap-3 shadow-md border-b border-purple-500/30 animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse"></span>
            <span>پنل اختصاصی پرسنل احسان استور | در حال نمایش قیمت‌های خرید همکاران 🔐</span>
          </div>
          <button 
            onClick={() => {
              setViewMode('shop');
              setIsStaff(false);
              localStorage.removeItem('ehsan_is_staff');
              window.history.replaceState(null, '', window.location.pathname);
            }}
            className="bg-white/10 hover:bg-white/20 active:bg-white/30 text-white border border-white/20 px-3.5 py-1.5 rounded-xl transition-all font-bold"
          >
            خروج از حالت همکار
          </button>
        </div>
      )}

      {/* Header */}
      <header className="h-20 px-8 flex justify-between items-center sticky top-0 bg-white/70 backdrop-blur-md border-b border-purple-100 z-30 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-purple-500/30 shadow-lg">
            <ShoppingCart className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black tracking-tight text-purple-950">احسان استور</h1>
          </div>
        </div>

        {settings.showGlobalRates !== false && (
          <div className="hidden md:flex gap-4">
            <div className="bg-purple-50 border border-purple-100 rounded-xl px-4 py-1.5 flex items-center gap-3 shadow-xs">
              <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">نرخ یوان</span>
              <span className="text-lg font-bold text-purple-700">{formatPrice(Number(settings.cnyRate))}</span>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-1.5 flex items-center gap-3 shadow-xs">
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">نرخ درهم</span>
              <span className="text-lg font-bold text-amber-700">{formatPrice(Number(settings.aedRate))}</span>
            </div>
          </div>
        )}
      </header>

      {/* 1. Search Box - First item at the top */}
      <div className="max-w-xl md:max-w-4xl lg:max-w-5xl mx-auto px-4 mt-8 animate-fade-in">
        <div className="relative flex items-center bg-white rounded-full border border-purple-200/80 focus-within:border-purple-500/80 focus-within:ring-2 focus-within:ring-purple-200/50 transition-all duration-350 shadow-md">
          {/* Blue Search Button on Right */}
          <div className="absolute right-2.5 p-2 bg-[#3B82F6] hover:bg-blue-600 active:bg-blue-700 text-white rounded-full cursor-pointer transition-all duration-150 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Search size={18} />
          </div>
          
          <input 
            type="text" 
            placeholder="جستجو در بین کالاها..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent pr-14 pl-12 py-4.5 text-sm font-bold text-slate-800 outline-none text-right placeholder:text-slate-400"
            dir="rtl"
          />

          {/* Quick Clear icon on the Left */}
          <div className="absolute left-4 flex items-center gap-3 text-slate-400">
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="p-1 hover:bg-purple-50 rounded-full text-slate-500 transition-all duration-150"
                title="پاک کردن"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
        
        {/* Search Results count */}
        {searchQuery.trim() && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-right mt-3 mr-4 text-xs font-bold text-purple-700"
          >
            {filteredProducts.length === 0 ? (
              <span>هیچ موردی یافت نشد 📦</span>
            ) : (
              <span>{filteredProducts.length} کالا متناسب با جستجوی شما یافت شد ✨</span>
            )}
          </motion.div>
        )}
      </div>

      {/* 2. Banner Area - Customizable images (motion slider) or elegant default marketing card */}
      {(() => {
        const activeBanners = settings.banners && settings.banners.length > 0 
          ? settings.banners 
          : (settings.bannerUrl || settings.bannerUrlDesktop 
              ? [{ 
                  id: 'legacy', 
                  bannerUrl: settings.bannerUrl || '', 
                  bannerUrlDesktop: settings.bannerUrlDesktop || '', 
                  bannerRedirect: settings.bannerRedirect || '' 
                }] 
              : []
            );

        if (activeBanners.length > 0) {
          const transitionType = settings.bannerTransition || 'slide';
          const b = activeBanners[currentSlide] || activeBanners[0];

          // Motion transition configuration based on selected type
          const getTransitionProps = () => {
            switch (transitionType) {
              case 'fade':
                return {
                  initial: { opacity: 0 },
                  animate: { opacity: 1 },
                  exit: { opacity: 0 },
                  transition: { duration: 0.6, ease: 'easeInOut' }
                };
              case 'scale':
                return {
                  initial: { opacity: 0, scale: 0.93 },
                  animate: { opacity: 1, scale: 1 },
                  exit: { opacity: 0, scale: 1.05 },
                  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
                };
              case 'flip':
                return {
                  initial: { opacity: 0, rotateY: 90, transformOrigin: 'center left' },
                  animate: { opacity: 1, rotateY: 0 },
                  exit: { opacity: 0, rotateY: -90, transformOrigin: 'center right' },
                  transition: { duration: 0.7, ease: 'easeInOut' }
                };
              case 'rotate':
                return {
                  initial: { opacity: 0, rotate: -45, scale: 0.85 },
                  animate: { opacity: 1, rotate: 0, scale: 1 },
                  exit: { opacity: 0, rotate: 45, scale: 0.85 },
                  transition: { duration: 0.55, ease: 'easeOut' }
                };
              case 'slideUp':
                return {
                  initial: { opacity: 0, y: 80 },
                  animate: { opacity: 1, y: 0 },
                  exit: { opacity: 0, y: -80 },
                  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
                };
              case 'shutter':
                return {
                  initial: { opacity: 0, scale: 0, rotate: -180 },
                  animate: { opacity: 1, scale: 1, rotate: 0 },
                  exit: { opacity: 0, scale: 0, rotate: 180 },
                  transition: { duration: 0.65, ease: [0.34, 1.56, 0.64, 1] }
                };
              case 'elastic':
                return {
                  initial: { opacity: 0, x: 250 },
                  animate: { opacity: 1, x: 0 },
                  exit: { opacity: 0, x: -250 },
                  transition: { type: "spring", stiffness: 120, damping: 14 }
                };
              case 'blur':
                return {
                  initial: { opacity: 0, filter: 'blur(20px)', scale: 1.05 },
                  animate: { opacity: 1, filter: 'blur(0px)', scale: 1 },
                  exit: { opacity: 0, filter: 'blur(20px)', scale: 0.95 },
                  transition: { duration: 0.6, ease: 'easeInOut' }
                };
              case 'slide':
              default:
                return {
                  initial: { opacity: 0, x: 150 },
                  animate: { opacity: 1, x: 0 },
                  exit: { opacity: 0, x: -150 },
                  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
                };
            }
          };

          const motionProps = getTransitionProps();

          return (
            <div className="max-w-xl md:max-w-4xl lg:max-w-5xl mx-auto px-4 mt-8 md:mt-12 animate-fade-in relative group/slider">
              {/* Slider Core Container */}
              <div className="relative overflow-hidden rounded-3xl border border-purple-100/50 shadow-md bg-purple-50/50 w-full h-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={b.id || currentSlide}
                    {...motionProps}
                    className="w-full h-auto block"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <a 
                      href={b.bannerRedirect || '#'} 
                      className="block w-full h-auto relative"
                    >
                      {b.bannerUrlDesktop ? (
                        <>
                          <img 
                            src={b.bannerUrl || b.bannerUrlDesktop} 
                            alt={`Ehsan Store Banner Mobile ${currentSlide + 1}`} 
                            className="w-full h-auto md:hidden block" 
                          />
                          <img 
                            src={b.bannerUrlDesktop} 
                            alt={`Ehsan Store Banner Desktop ${currentSlide + 1}`} 
                            className="hidden md:block w-full h-auto" 
                          />
                        </>
                      ) : (
                        <img 
                          src={b.bannerUrl} 
                          alt={`Ehsan Store Banner ${currentSlide + 1}`} 
                          className="w-full h-auto block" 
                        />
                      )}
                    </a>
                  </motion.div>
                </AnimatePresence>

                {/* Left/Right Navigation controls (only if more than 1 banner) */}
                {activeBanners.length > 1 && (
                  <>
                    {/* Next Button */}
                    <button
                      onClick={() => setCurrentSlide(prev => (prev + 1) % activeBanners.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur-xs border border-white/10 opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300 z-10 cursor-pointer"
                      title="اسلاید بعدی"
                    >
                      <ChevronLeft size={20} />
                    </button>

                    {/* Prev Button */}
                    <button
                      onClick={() => setCurrentSlide(prev => (prev - 1 + activeBanners.length) % activeBanners.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur-xs border border-white/10 opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300 z-10 cursor-pointer"
                      title="اسلاید قبلی"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>

              {/* Indicator Dots outside the slider */}
              {activeBanners.length > 1 && (
                <div className="flex justify-center items-center gap-1.5 mt-4">
                  {activeBanners.map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      onClick={() => setCurrentSlide(dotIdx)}
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        dotIdx === currentSlide 
                          ? 'bg-purple-600 w-5 shadow-xs' 
                          : 'bg-slate-300 hover:bg-slate-400 w-2'
                      }`}
                      title={`اسلاید ${dotIdx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        }

        return (
          <div className="max-w-xl md:max-w-4xl lg:max-w-5xl mx-auto px-4 mt-6 animate-fade-in relative group/banner">
            {/* Default beautiful Glassy Info Banner, matching the screenshot layout */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50/50 border border-purple-100 backdrop-blur-md p-6 rounded-3xl shadow-sm flex flex-col md:flex-row gap-6 justify-between items-center relative overflow-hidden group">
              {/* Ambient aura */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/10 transition-all duration-500" />

              <div className="flex-1 text-right mt-2 md:mt-0">
                <span className="bg-purple-100 border border-purple-200 text-purple-700 px-3 py-1 rounded-full text-[10px] font-black tracking-wider shadow-xs uppercase">
                  فروشگاه تخصصی احسان استور
                </span>
                <h2 className="text-lg font-extrabold text-purple-950 mt-3 leading-tight">واردات مستقیم و بی‌واسطه لوازم جانبی</h2>
                <p className="text-slate-600 text-[11px] mt-2 font-medium leading-relaxed">
                  ارائه برترین برندهای روز دنیا (JBL, Anker, Ferrari) با تضمین اصالت و بهترین قیمت بازار همراه با تحویل فوری.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 justify-start md:justify-end">
                  <span className="bg-purple-50 border border-purple-100 text-purple-700 px-2.5 py-1 rounded-lg text-[9px] font-bold">
                    ⚡ همکار صنف دیجیتال
                  </span>
                  <span className="bg-purple-50 border border-purple-100 text-purple-700 px-2.5 py-1 rounded-lg text-[9px] font-bold">
                    📦 امکان خرید عمده و تک
                  </span>
                </div>
              </div>
              
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center border border-purple-200 shadow-purple-200/20 shadow-lg shrink-0">
                <Sparkles size={28} className="text-purple-600 animate-pulse" />
              </div>
            </div>
          </div>
        );
      })()}

      {/* 3. Categories Grid - 3 Columns on mobile, 6 Columns on desktop, Glassmorphic */}
      <div className="max-w-xl md:max-w-4xl lg:max-w-5xl mx-auto px-4 mt-8 animate-fade-in font-sans">
        <h3 className="text-right text-xs font-black text-purple-700 mb-3 uppercase tracking-wider mr-2">دسته‌بندی‌ها</h3>
        
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 md:gap-7 lg:gap-8">
          {/* All products button */}
          {settings.showAllProductsCategory !== false && (
            <motion.div
              onClick={() => setSelectedCategory(null)}
              className={`border rounded-3xl p-3 md:p-5 flex flex-col items-center justify-center cursor-pointer transition-all duration-350 relative overflow-hidden group ${
                selectedCategory === null 
                  ? 'bg-purple-600 border-purple-500 text-white shadow-[0_10px_25px_-5px_rgba(139,92,246,0.3)] scale-[1.03]' 
                  : 'bg-white/80 backdrop-blur-md border-purple-100 hover:bg-purple-50/50 shadow-sm text-slate-700 hover:border-purple-300'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl flex items-center justify-center mb-2.5 md:mb-3 group-hover:scale-110 transition-transform ${
                selectedCategory === null ? 'bg-white/20 text-white' : 'bg-purple-50 text-purple-600 group-hover:bg-purple-100/80'
              }`}>
                <Package className={selectedCategory === null ? 'text-white w-6 h-6 md:w-9 md:h-9' : 'text-purple-600 w-6 h-6 md:w-9 md:h-9'} />
              </div>
              <span className={`text-[11px] md:text-sm font-extrabold truncate max-w-full tracking-tight ${selectedCategory === null ? 'text-white' : 'text-slate-800'}`}>
                همه کالاها
              </span>
            </motion.div>
          )}

          {/* Available products button */}
          {settings.showAvailableCategory !== false && (
            <motion.div
              onClick={() => setSelectedCategory('available')}
              className={`border rounded-3xl p-3 md:p-5 flex flex-col items-center justify-center cursor-pointer transition-all duration-350 relative overflow-hidden group ${
                selectedCategory === 'available' 
                  ? 'bg-purple-600 border-purple-500 text-white shadow-[0_10px_25px_-5px_rgba(139,92,246,0.3)] scale-[1.03]' 
                  : 'bg-white/80 backdrop-blur-md border-purple-100 hover:bg-purple-50/50 shadow-sm text-slate-700 hover:border-purple-300'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl flex items-center justify-center mb-2.5 md:mb-3 group-hover:scale-110 transition-transform ${
                selectedCategory === 'available' ? 'bg-white/20 text-white' : 'bg-purple-50 text-purple-600 group-hover:bg-purple-100/80'
              }`}>
                <CheckCircle2 className={selectedCategory === 'available' ? 'text-white w-6 h-6 md:w-9 md:h-9' : 'text-purple-600 w-6 h-6 md:w-9 md:h-9'} />
              </div>
              <span className={`text-[11px] md:text-sm font-extrabold truncate max-w-full tracking-tight ${selectedCategory === 'available' ? 'text-white' : 'text-slate-800'}`}>
                موجودها
              </span>
            </motion.div>
          )}

          {/* Out of Stock products button */}
          {settings.showOutOfStockCategory !== false && (
            <motion.div
              onClick={() => setSelectedCategory('out-of-stock')}
              className={`border rounded-3xl p-3 md:p-5 flex flex-col items-center justify-center cursor-pointer transition-all duration-350 relative overflow-hidden group ${
                selectedCategory === 'out-of-stock' 
                  ? 'bg-red-600 border-red-500 text-white shadow-[0_10px_25px_-5px_rgba(220,38,38,0.25)] scale-[1.03]' 
                  : 'bg-white/80 backdrop-blur-md border-purple-100 hover:bg-red-50/30 shadow-sm text-slate-700 hover:border-red-300'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl flex items-center justify-center mb-2.5 md:mb-3 group-hover:scale-110 transition-transform ${
                selectedCategory === 'out-of-stock' ? 'bg-white/20 text-white' : 'bg-red-50 text-red-500 group-hover:bg-red-100/50'
              }`}>
                <X className={selectedCategory === 'out-of-stock' ? 'text-white w-6 h-6 md:w-9 md:h-9' : 'text-red-500 w-6 h-6 md:w-9 md:h-9'} />
              </div>
              <span className={`text-[11px] md:text-sm font-extrabold truncate max-w-full tracking-tight ${selectedCategory === 'out-of-stock' ? 'text-white' : 'text-slate-800'}`}>
                ناموجودها
              </span>
            </motion.div>
          )}

          {/* Map through dynamic categories */}
          {categories.map(cat => {
            const isActive = selectedCategory === cat.id;
            return (
              <motion.div
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`border rounded-3xl p-3 md:p-5 flex flex-col items-center justify-center cursor-pointer transition-all duration-350 relative overflow-hidden group ${
                  isActive 
                    ? 'bg-purple-600 border-purple-500 text-white shadow-[0_10px_25px_-5px_rgba(139,92,246,0.3)] scale-[1.03]' 
                    : 'bg-white/80 backdrop-blur-md border-purple-100 hover:bg-purple-50/50 shadow-sm text-slate-700 hover:border-purple-300'
                }`}
                whileTap={{ scale: 0.95 }}
                title={cat.name}
              >
                <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl flex items-center justify-center mb-2.5 md:mb-3 group-hover:scale-110 transition-transform ${
                  isActive ? 'bg-white/20 text-white' : 'bg-purple-50 text-purple-600 group-hover:bg-purple-100/80'
                }`}>
                  {getCategoryIconComponent(cat, isActive, 24)}
                </div>
                <span className={`text-[11px] md:text-sm font-extrabold truncate max-w-full tracking-tight ${isActive ? 'text-white' : 'text-slate-800'}`}>
                  {cat.name}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Decorative transition layout that flows all the way to All Products */}
      <div className="max-w-7xl mx-auto mt-16 px-4 md:px-8 flex flex-col items-center gap-2">
        <div className="w-1 h-12 bg-gradient-to-b from-purple-400 to-transparent rounded-full animate-pulse" />
        <h2 className="text-center font-black text-lg md:text-2xl text-purple-950 flex items-center gap-2">
          <span>لیست کالاها</span>
        </h2>
      </div>

      {/* Main Grid */}
      <main className="px-4 md:px-8 py-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 max-w-7xl mx-auto">
        {loading ? (
             <div className="col-span-full py-20 text-center animate-pulse text-purple-700">در حال بارگزاری کالاها...</div>
        ) : (
          <>
            {filteredProducts.length === 0 ? (
               <div className="col-span-full py-20 text-center text-slate-500 font-bold flex flex-col items-center justify-center gap-4">
                 <div className="w-16 h-16 bg-white border border-purple-100 rounded-2xl flex items-center justify-center text-purple-400 shadow-sm animate-bounce">
                  <Search size={32} />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-lg text-slate-800">کالایی یافت نشد</span>
                  <span className="text-xs text-slate-400 font-medium">لطفاً عبارت دیگری را جستجو کنید یا فیلتر دسته‌بندی را تغییر دهید.</span>
                </div>
              </div>
            ) : (
              filteredProducts.map((p, index) => {
                const displayToman = p.priceIRT !== undefined && p.priceIRT > 0 ? p.priceIRT : (p.currency === 'IRT' ? p.priceValue : null);
                const displayDirham = p.priceAED !== undefined && p.priceAED > 0 ? p.priceAED : (p.currency === 'AED' ? p.priceValue : null);
                const displayYuan = p.priceCNY !== undefined && p.priceCNY > 0 ? p.priceCNY : (p.currency === 'CNY' ? p.priceValue : null);

                const finalToman = displayToman !== null ? displayToman : convertToToman(p.priceValue, p.currency, settings);
                
                const hasDirham = displayDirham !== null;
                const hasYuan = displayYuan !== null;
                return (
                  <motion.div 
                    layoutId={`product-${p.id}`}
                    key={p.id}
                    className="group bg-white rounded-2xl md:rounded-3xl overflow-hidden border border-purple-100 hover:border-purple-300 shadow-md hover:shadow-[0_20px_40px_-15px_rgba(109,40,217,0.12)] transition-all duration-300 flex flex-col cursor-pointer"
                    whileHover={{ 
                      y: -8, 
                      scale: 1.03,
                      transition: { duration: 0.25, ease: "easeOut" }
                    }}
                  >
                    {/* Image Container */}
                    <div 
                      className="relative aspect-square overflow-hidden cursor-pointer bg-purple-50/20 flex items-center justify-center p-2 border-b border-purple-100"
                      onClick={() => setSelectedProduct(p)}
                    >
                      <LazyImage 
                        src={p.media.images.length > 0 ? p.media.images[0] : DEFAULT_IMAGE} 
                        alt={p.name}
                        priority={index < 20}
                        className="w-full h-full"
                        imgClassName="object-contain p-4 md:p-6 group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="p-3 md:p-5 flex flex-col flex-1 text-right">
                      <div className="flex flex-wrap items-center gap-1 md:gap-1.5 mb-2 md:mb-3">
                        {p.isOutOfStock ? (
                          <span className="bg-red-50 border border-red-200 text-red-600 px-2.5 py-0.5 rounded-lg text-[8px] md:text-[10px] font-black tracking-wider shadow-sm">
                            ناموجود
                          </span>
                        ) : (
                          <span className="bg-emerald-50 border border-emerald-200 text-emerald-600 px-2.5 py-0.5 rounded-lg text-[8px] md:text-[10px] font-black tracking-wider shadow-sm">
                            موجود
                          </span>
                        )}
                        {(p.priceIRT !== undefined && p.priceIRT > 0) || p.currency === 'IRT' ? (
                          <span className="bg-purple-100/50 border border-purple-200/40 text-purple-800 px-1.5 py-0.5 rounded-lg text-[7px] md:text-[9px] font-extrabold uppercase tracking-wider whitespace-nowrap">
                            تومانی
                          </span>
                        ) : null}
                        {(p.priceAED !== undefined && p.priceAED > 0) || p.currency === 'AED' ? (
                          <span className="bg-amber-50 border border-amber-200 text-amber-700 px-1.5 py-0.5 rounded-lg text-[7px] md:text-[9px] font-extrabold uppercase tracking-wider whitespace-nowrap animate-none">
                            درهمی
                          </span>
                        ) : null}
                        {(p.priceCNY !== undefined && p.priceCNY > 0) || p.currency === 'CNY' ? (
                          <span className="bg-teal-50 border border-teal-200 text-teal-700 px-1.5 py-0.5 rounded-lg text-[7px] md:text-[9px] font-extrabold uppercase tracking-wider whitespace-nowrap">
                            یوانی
                          </span>
                        ) : null}
                      </div>
                      
                      <h3 className="font-extrabold text-sm md:text-base text-purple-950 group-hover:text-purple-700 transition-colors mb-1 md:mb-2 leading-tight">{p.name}</h3>
                      
                      <p className="text-slate-500 text-[10px] md:text-xs mb-4 line-clamp-2 leading-relaxed">
                        {p.description}
                      </p>

                      <div className="mt-auto flex items-center justify-between border-t border-purple-100 pt-3 md:pt-4">
                        <div className="flex flex-col gap-1 w-[calc(100%-3.2rem)] text-right">
                          <span className="text-slate-500 text-[8px] md:text-[9px] font-bold uppercase tracking-wider">قیمت مصرف کننده</span>
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-baseline gap-0.5 md:gap-1 h-6 md:h-8 overflow-hidden relative">
                              <div className="flex items-baseline gap-0.5 md:gap-1">
                                <AnimatePresence mode="popLayout" initial={false}>
                                  <motion.span
                                    key={finalToman}
                                    initial={{ y: 15, opacity: 0, color: "#10b981" }}
                                    animate={{ 
                                      y: 0, 
                                      opacity: 1, 
                                      color: ["#10b981", "#10b981", "#6d28d9"],
                                      transition: {
                                        y: { type: "spring", stiffness: 260, damping: 20 },
                                        opacity: { duration: 0.15 },
                                        color: { duration: 1.5, times: [0, 0.5, 1] }
                                      }
                                    }}
                                    exit={{ y: -15, opacity: 0 }}
                                    className="text-sm md:text-xl font-black inline-block text-purple-700"
                                  >
                                    {formatPrice(finalToman)}
                                  </motion.span>
                                </AnimatePresence>
                                <span className="text-[10px] font-bold text-slate-500 self-center">تومان</span>
                              </div>
                            </div>
                            {hasDirham && (
                              <div className="flex items-baseline gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100 self-start text-amber-700">
                                <span className="text-[11px] md:text-xs font-black">{formatPrice(displayDirham)}</span>
                                <span className="text-[9px] font-bold text-amber-500">درهم</span>
                              </div>
                            )}
                            {hasYuan && !hasDirham && (
                              <div className="flex items-baseline gap-1 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-100 self-start text-teal-700">
                                <span className="text-[11px] md:text-xs font-black">{formatPrice(displayYuan)}</span>
                                <span className="text-[9px] font-bold text-teal-500">یوان</span>
                              </div>
                            )}
                            {p.currency === 'AED' && (
                              <div className="text-[8px] md:text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200/50 px-2 py-1.5 rounded-lg leading-normal mt-1 text-right w-full">
                                ⚠️ نرخ لحظه‌ای درهم؛ برای استعلام دقیق تماس بگیرید.
                              </div>
                            )}
                          </div>
                        </div>
                        <button 
                          onClick={() => setSelectedProduct(p)}
                          className="w-8 h-8 md:w-10 md:h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all shadow-xs shrink-0"
                        >
                          <ChevronLeft size={16} className="md:w-5 md:h-5" />
                        </button>
                      </div>

                      {viewMode === 'staff' && (
                        <div className="mt-3.5 pt-3 border-t border-dashed border-purple-200 bg-purple-50 p-2.5 rounded-xl text-right text-[10px] md:text-xs">
                          <span className="font-extrabold text-purple-800 block mb-1.5 flex items-center justify-end gap-1">
                            <span>قیمت‌های خرید (پرسنل)</span>
                            <span className="text-xs">🔐</span>
                          </span>
                          <div className="space-y-1 font-bold">
                            {p.purchasePriceIRT ? (
                              <div className="flex justify-between items-center bg-white px-2 py-1 rounded-lg border border-purple-100 shadow-xs">
                                <span className="text-purple-700 font-extrabold">{formatPrice(p.purchasePriceIRT)} تومان</span>
                                <span className="text-[8px] md:text-[9px] text-slate-500">خرید تومان</span>
                              </div>
                            ) : null}
                            {p.purchasePriceAED ? (
                              <div className="flex justify-between items-center bg-white px-2 py-1 rounded-lg border border-purple-100 shadow-xs">
                                <span className="text-purple-700 font-extrabold">{formatPrice(p.purchasePriceAED)} درهم</span>
                                <span className="text-[8px] md:text-[9px] text-slate-500">خرید درهم</span>
                              </div>
                            ) : null}
                            {p.purchasePriceCNY ? (
                              <div className="flex justify-between items-center bg-white px-2 py-1 rounded-lg border border-purple-100 shadow-xs">
                                <span className="text-purple-700 font-extrabold">{formatPrice(p.purchasePriceCNY)} یوان</span>
                                <span className="text-[8px] md:text-[9px] text-slate-500">خرید یوان</span>
                              </div>
                            ) : null}
                            {!p.purchasePriceIRT && !p.purchasePriceAED && !p.purchasePriceCNY && (
                              <span className="text-[9px] text-slate-500 block text-center py-1.5 bg-purple-50/50 rounded-lg border border-dashed border-purple-150">ثبت نشده</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
            
            {/* Moved Promo Card to Footer */}
          </>
        )}
      </main>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductDetail 
            product={selectedProduct} 
            onClose={() => setSelectedProduct(null)} 
            rates={settings}
            isStaffView={viewMode === 'staff'}
          />
        )}
      </AnimatePresence>

      <footer className="bg-purple-100/50 p-8 text-slate-800 relative overflow-hidden mt-10 border-t border-purple-200/50">
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-200/20 rounded-full"></div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <div className="flex-1 text-center md:text-right">
            <h2 className="text-2xl font-black mb-3 text-purple-950">تضمین قیمت احسان</h2>
            <p className="text-slate-600 text-sm leading-relaxed max-w-xl mx-auto md:mx-0">تمام قیمتها به صورت لحظهای بر اساس نرخ یوان و درهم بازار آزاد تهران آپدیت میشوند. خریدی مطمئن و بدون واسطه.</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
            <div className="bg-white/80 backdrop-blur-md border border-purple-100 rounded-2xl p-4 min-w-[150px] shadow-xs">
               <div className="text-[10px] uppercase font-bold text-purple-700 mb-1 text-center">وضعیت شبکه</div>
               <div className="flex items-center justify-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-xs font-bold text-slate-700">شبکه فعال</span>
               </div>
            </div>
            <div className="bg-white/80 backdrop-blur-md border border-purple-100 rounded-2xl p-4 min-w-[150px] shadow-xs">
               <div className="text-[10px] uppercase font-bold text-purple-700 mb-1 text-center">آخرین بروزرسانی</div>
               <div className="text-xs font-bold text-center text-slate-700 font-sans">لحظاتی پیش</div>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-purple-200/40 text-center text-purple-600 text-[10px] font-bold">
          © {new Date().getFullYear()} احسان استور - تمامی حقوق محفوظ است
        </div>
      </footer>

      {/* Login Modal */}
      <AnimatePresence>
        {showLogin && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center px-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-white w-full max-w-sm rounded-[32px] p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black">ورود مدیر</h3>
                <button onClick={() => setShowLogin(false)}><X /></button>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <input 
                  name="password" type="password" placeholder="رمز عبور"
                  className="w-full bg-gray-50 border-none p-5 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-inter"
                />
                <button className="w-full bg-black text-white p-5 rounded-2xl font-bold shadow-xl">ورود به پنل</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Staff Login Modal */}
      <AnimatePresence>
        {showStaffLogin && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center px-6 animate-fade-in"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-white w-full max-w-sm rounded-[32px] p-8 text-right font-sans shadow-2xl"
              dir="rtl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-800">ورود همکاران و پرسنل</h3>
                <button onClick={() => {
                  setShowStaffLogin(false);
                  setViewMode('shop');
                  window.history.replaceState(null, '', window.location.pathname);
                }} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={20} /></button>
              </div>
              <p className="text-xs text-slate-500 mb-6 font-medium leading-relaxed">
                لطفاً برای دسترسی به پنل اختصاصی پرسنل و مشاهده قیمت‌های خرید، رمز عبور همکار را وارد کنید.
              </p>
              <form onSubmit={handleStaffLogin} className="space-y-4">
                <input 
                  name="password" type="password" placeholder="رمز عبور همکار" required autoFocus
                  className="w-full bg-gray-50 border-none p-5 rounded-2xl outline-none focus:ring-2 focus:ring-violet-500 font-inter text-center font-bold text-slate-800"
                />
                <button className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-5 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:shadow-xl transition-all">تایید و ورود به پنل</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
