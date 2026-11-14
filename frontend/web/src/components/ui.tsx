'use client';

import {
  useEffect,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Bell,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  FileCheck2,
  HelpCircle,
  Landmark,
  LayoutDashboard,
  MapPin,
  PawPrint,
  Phone,
  Plus,
  QrCode,
  Radio,
  RefreshCw,
  ScanLine,
  Search,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Stethoscope,
  Trash2,
  User,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import type { WebNavItem } from '@/navigation.ts';

export type IconName =
  | WebNavItem['icon']
  | 'activity'
  | 'alert'
  | 'check'
  | 'clock'
  | 'phone'
  | 'plus'
  | 'qr'
  | 'refresh'
  | 'search'
  | 'shield-alert'
  | 'smartphone'
  | 'trash'
  | 'close'
  | 'chevron-right'
  | 'external'
  | 'copy'
  | 'map-pin';

export function WebIcon({
  name,
  className = 'w-5 h-5',
}: {
  name: IconName;
  className?: string;
}) {
  switch (name) {
    case 'layout-dashboard':
      return <LayoutDashboard className={className} aria-hidden="true" />;
    case 'file-check':
      return <FileCheck2 className={className} aria-hidden="true" />;
    case 'landmark':
      return <Landmark className={className} aria-hidden="true" />;
    case 'bell':
      return <Bell className={className} aria-hidden="true" />;
    case 'user':
      return <User className={className} aria-hidden="true" />;
    case 'calendar':
      return <Calendar className={className} aria-hidden="true" />;
    case 'paw':
      return <PawPrint className={className} aria-hidden="true" />;
    case 'shield-check':
      return <ShieldCheck className={className} aria-hidden="true" />;
    case 'users':
      return <Users className={className} aria-hidden="true" />;
    case 'book-open':
      return <BookOpen className={className} aria-hidden="true" />;
    case 'bar-chart-3':
      return <BarChart3 className={className} aria-hidden="true" />;
    case 'scan':
      return <ScanLine className={className} aria-hidden="true" />;
    case 'wallet':
      return <Wallet className={className} aria-hidden="true" />;
    case 'stethoscope':
      return <Stethoscope className={className} aria-hidden="true" />;
    case 'shopping-bag':
      return <ShoppingBag className={className} aria-hidden="true" />;
    case 'radio':
      return <Radio className={className} aria-hidden="true" />;
    case 'help-circle':
      return <HelpCircle className={className} aria-hidden="true" />;
    case 'activity':
      return <Activity className={className} aria-hidden="true" />;
    case 'alert':
      return <AlertTriangle className={className} aria-hidden="true" />;
    case 'check':
      return <CheckCircle2 className={className} aria-hidden="true" />;
    case 'clock':
      return <Clock className={className} aria-hidden="true" />;
    case 'phone':
      return <Phone className={className} aria-hidden="true" />;
    case 'plus':
      return <Plus className={className} aria-hidden="true" />;
    case 'qr':
      return <QrCode className={className} aria-hidden="true" />;
    case 'refresh':
      return <RefreshCw className={className} aria-hidden="true" />;
    case 'search':
      return <Search className={className} aria-hidden="true" />;
    case 'shield-alert':
      return <ShieldAlert className={className} aria-hidden="true" />;
    case 'smartphone':
      return <Smartphone className={className} aria-hidden="true" />;
    case 'trash':
      return <Trash2 className={className} aria-hidden="true" />;
    case 'close':
      return <X className={className} aria-hidden="true" />;
    case 'chevron-right':
      return <ChevronRight className={className} aria-hidden="true" />;
    case 'external':
      return <ArrowUpRight className={className} aria-hidden="true" />;
    case 'copy':
      return <Copy className={className} aria-hidden="true" />;
    case 'map-pin':
      return <MapPin className={className} aria-hidden="true" />;
  }
}

export type Tone = 'brand' | 'neutral' | 'success' | 'warning' | 'danger' | 'info';

const badgeStyles: Record<Tone, string> = {
  brand: 'bg-[#EBF4EE] text-[#0F602D] border-[#D8E9DE]',
  success: 'bg-[#EBF4EE] text-[#15803D] border-[#D8E9DE]',
  neutral: 'bg-[#F8FAFC] text-[#475569] border-[#E2E8F0]',
  warning: 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]',
  danger: 'bg-[#FFF1F2] text-[#BE123C] border-[#FECDD3]',
  info: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]',
};

export function Badge({
  children,
  tone = 'neutral',
  className = '',
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeStyles[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function toneForStatus(status: string): Tone {
  switch (status) {
    case 'healthy':
    case 'active':
    case 'approved':
    case 'completed':
    case 'paid':
    case 'settled':
    case 'delivered':
    case 'published':
    case 'resolved':
      return 'success';
    case 'attention':
    case 'requested':
    case 'submitted':
    case 'offered':
    case 'manual_review':
    case 'vet_review':
    case 'in_progress':
    case 'placed':
    case 'confirmed':
    case 'shipped':
    case 'acknowledged':
    case 'draft':
    case 'warning':
      return 'warning';
    case 'critical':
    case 'deceased':
    case 'rejected':
    case 'cancelled':
    case 'suspended':
    case 'escalated':
    case 'open':
      return 'danger';
    default:
      return 'info';
  }
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: IconName;
}) {
  const variants = {
    primary:
      'bg-[#15803D] text-white hover:bg-[#0F602D] active:bg-[#0A401E] border border-transparent shadow-xs',
    secondary:
      'bg-[#EBF4EE] text-[#0F602D] hover:bg-[#D8E9DE] border border-[#D8E9DE]',
    outline:
      'bg-white text-[#1F2937] hover:bg-[#F8FAFC] border border-[#E2E8F0]',
    danger:
      'bg-[#BE123C] text-white hover:bg-[#9F1239] border border-transparent',
    ghost:
      'bg-transparent text-[#475569] hover:bg-[#F8FAFC] hover:text-[#1F2937] border border-transparent',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-[8px]',
    md: 'px-4 py-2 text-sm rounded-[10px]',
    lg: 'px-5 py-2.5 text-base rounded-[12px]',
  };
  return (
    <button
      type="button"
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 font-semibold cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon ? <WebIcon name={icon} className="w-4 h-4 shrink-0" /> : null}
      {children}
    </button>
  );
}

export function Card({
  children,
  className = '',
  tinted = false,
}: {
  children: ReactNode;
  className?: string;
  tinted?: boolean;
}) {
  return (
    <div
      className={`rounded-[16px] border p-5 ${
        tinted
          ? 'bg-[#EBF4EE]/65 border-[#D8E9DE]'
          : 'bg-white border-[#E2E8F0]'
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function KpiCard({
  label,
  value,
  hint,
  tone = 'brand',
  icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: Tone;
  icon?: IconName;
}) {
  const iconColors: Record<Tone, string> = {
    brand: 'bg-[#EBF4EE] text-[#15803D]',
    success: 'bg-[#EBF4EE] text-[#15803D]',
    neutral: 'bg-[#F8FAFC] text-[#475569]',
    warning: 'bg-[#FFFBEB] text-[#92400E]',
    danger: 'bg-[#FFF1F2] text-[#BE123C]',
    info: 'bg-[#EFF6FF] text-[#1D4ED8]',
  };
  return (
    <div className="rounded-[16px] border border-[#E2E8F0] bg-white p-4 flex flex-col justify-between gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-[#64748B]">{label}</span>
        {icon ? (
          <span className={`p-2 rounded-[10px] ${iconColors[tone]}`}>
            <WebIcon name={icon} className="w-4 h-4" />
          </span>
        ) : null}
      </div>
      <div className="text-2xl font-bold text-[#1F2937] tabular-nums">{value}</div>
      {hint ? <div className="text-xs text-[#64748B]">{hint}</div> : null}
    </div>
  );
}

export function Field({
  label,
  hint,
  error,
  hintAbove = false,
  className = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
  hintAbove?: boolean;
}) {
  const id = useId();
  const inputId = props.id ?? id;
  const descId = error || hint ? `${inputId}-desc` : undefined;
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={inputId} className="text-sm font-semibold text-[#1F2937]">
        {label}
      </label>
      {hintAbove && hint && !error ? (
        <p id={descId} className="text-xs text-[#64748B]">
          {hint}
        </p>
      ) : null}
      <input
        id={inputId}
        aria-describedby={props['aria-describedby'] ?? descId}
        aria-invalid={error ? true : props['aria-invalid']}
        className="w-full rounded-[10px] border border-[#E2E8F0] bg-white px-3.5 py-2 text-sm text-[#1F2937] placeholder:text-[#94A3B8] focus:border-[#15803D]"
        {...props}
      />
      {error ? (
        <span id={descId} role="alert" className="text-xs font-medium text-[#BE123C]">
          {error}
        </span>
      ) : !hintAbove && hint ? (
        <span id={descId} className="text-xs text-[#64748B]">
          {hint}
        </span>
      ) : null}
    </div>
  );
}

export function SelectField({
  label,
  options,
  hint,
  className = '',
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: { value: string; label: string }[];
  hint?: string;
}) {
  const id = useId();
  const selectId = props.id ?? id;
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={selectId} className="text-sm font-semibold text-[#1F2937]">
        {label}
      </label>
      <select
        id={selectId}
        className="w-full rounded-[10px] border border-[#E2E8F0] bg-white px-3.5 py-2 text-sm text-[#1F2937] focus:border-[#15803D]"
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {hint ? <span className="text-xs text-[#64748B]">{hint}</span> : null}
    </div>
  );
}

export function TextareaField({
  label,
  hint,
  className = '',
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  hint?: string;
}) {
  const id = useId();
  const areaId = props.id ?? id;
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={areaId} className="text-sm font-semibold text-[#1F2937]">
        {label}
      </label>
      <textarea
        id={areaId}
        rows={props.rows ?? 3}
        className="w-full rounded-[10px] border border-[#E2E8F0] bg-white px-3.5 py-2 text-sm text-[#1F2937] placeholder:text-[#94A3B8] focus:border-[#15803D]"
        {...props}
      />
      {hint ? <span className="text-xs text-[#64748B]">{hint}</span> : null}
    </div>
  );
}

export function TabsBar<T extends string>({
  tabs,
  active,
  onChange,
  ariaLabel,
}: {
  tabs: { id: T; label: string; count?: number }[];
  active: T;
  onChange: (id: T) => void;
  ariaLabel: string;
}) {
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const selectedEl = listRef.current?.querySelector<HTMLElement>('[aria-selected="true"]');
    selectedEl?.scrollIntoView?.({
      block: 'nearest',
      inline: 'nearest',
      container: 'nearest',
    } as ScrollIntoViewOptions);
  }, [active]);

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={ariaLabel}
      {...({ focusgroup: 'tablist nomemory' } as Record<string, unknown>)}
      className="palito-tablist"
    >
      {tabs.map((tab) => {
        const selected = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            {...(selected ? ({ focusgroupstart: '' } as Record<string, unknown>) : {})}
            onClick={() => onChange(tab.id)}
            className="palito-tab inline-flex items-center gap-2"
          >
            <span>{tab.label}</span>
            {tab.count !== undefined ? (
              <span
                className={`rounded-full px-2 py-0.5 text-xs tabular-nums ${
                  selected
                    ? 'bg-[#EBF4EE] text-[#15803D]'
                    : 'bg-[#F8FAFC] text-[#64748B]'
                }`}
              >
                {tab.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Native HTML <dialog> modal following modern-web-guidance (dialog):
 * - Opened via showModal() for native top-layer, inert background, focus trap & Esc dismissal
 * - No redundant role="dialog" or aria-modal attributes
 * - Light-dismiss pointer check using bounding client rect
 */
export function ModalDialog({
  open,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-xl',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  maxWidth?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const titleId = useId();
  const pressedOutsideRef = useRef(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      {...({ closedby: 'any' } as Record<string, unknown>)}
      onClose={onClose}
      onPointerDown={(e) => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        const r = dialog.getBoundingClientRect();
        pressedOutsideRef.current =
          e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      }}
      onPointerUp={(e) => {
        const dialog = dialogRef.current;
        if (!dialog || !pressedOutsideRef.current) return;
        const r = dialog.getBoundingClientRect();
        const outside =
          e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
        if (outside) dialog.close();
      }}
      className={`m-auto w-[calc(100%-2rem)] ${maxWidth} rounded-[20px] border border-[#E2E8F0] bg-white p-0 text-[#1F2937] shadow-xl open:flex open:flex-col`}
    >
      <div className="flex items-start justify-between gap-4 border-b border-[#E2E8F0] px-6 py-4">
        <div>
          <h2 id={titleId} className="text-lg font-bold text-[#1F2937]">
            {title}
          </h2>
          {subtitle ? <p className="text-sm text-[#64748B] mt-0.5">{subtitle}</p> : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="rounded-[8px] p-1.5 text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1F2937] cursor-pointer"
        >
          <WebIcon name="close" className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6 overflow-y-auto max-h-[80vh]">{children}</div>
    </dialog>
  );
}

export function HealthScoreBar({
  score,
  label,
}: {
  score: number;
  label?: string;
}) {
  const clamped = Math.max(0, Math.min(100, score));
  const barColor =
    clamped >= 80 ? 'bg-[#15803D]' : clamped >= 60 ? 'bg-[#D97706]' : 'bg-[#BE123C]';
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs font-semibold">
        <span className="text-[#475569]">{label ?? 'Health Score'}</span>
        <span className="tabular-nums text-[#1F2937]">{clamped}/100</span>
      </div>
      <div className="h-2 w-full rounded-full bg-[#E2E8F0] overflow-hidden">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}

export function EmptyWorkspaceState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-[16px] border border-dashed border-[#CBD5E1] bg-white p-8 text-center flex flex-col items-center justify-center gap-2">
      <div className="p-3 rounded-full bg-[#EBF4EE] text-[#15803D]">
        <WebIcon name="file-check" className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-[#1F2937]">{title}</h3>
      <p className="text-sm text-[#64748B] max-w-md">{description}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

export function SplitWorkbench({
  masterTitle,
  masterCount,
  masterToolbar,
  masterList,
  detailPane,
}: {
  masterTitle: string;
  masterCount?: number;
  masterToolbar?: ReactNode;
  masterList: ReactNode;
  detailPane: ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <section className="lg:col-span-5 flex flex-col gap-3 rounded-[16px] border border-[#E2E8F0] bg-white p-4">
        <div className="flex items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
          <h2 className="text-base font-bold text-[#1F2937]">{masterTitle}</h2>
          {masterCount !== undefined ? (
            <Badge tone="brand" className="tabular-nums">
              {masterCount}
            </Badge>
          ) : null}
        </div>
        {masterToolbar ? <div>{masterToolbar}</div> : null}
        <div className="flex flex-col gap-2 max-h-[680px] overflow-y-auto pr-1">{masterList}</div>
      </section>
      <section className="lg:col-span-7 lg:sticky lg:top-20 flex flex-col gap-4">
        {detailPane}
      </section>
    </div>
  );
}
