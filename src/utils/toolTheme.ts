import React from 'react';
import {
  FileText,
  Users,
  Calendar,
  ClipboardList,
  CheckSquare,
  Folder,
  Calculator,
  Briefcase,
  ShieldCheck,
  Bookmark,
  FileSpreadsheet,
  Layers,
  Search,
  Globe,
  Wrench,
  Clock,
  Inbox,
  MessageSquare,
  BarChart3,
  LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  FileText,
  Users,
  Calendar,
  ClipboardList,
  CheckSquare,
  Folder,
  Calculator,
  Briefcase,
  ShieldCheck,
  Bookmark,
  FileSpreadsheet,
  Layers,
  Search,
  Globe,
  Wrench,
  Clock,
  Inbox,
  MessageSquare,
  BarChart3,
};

export function getToolIcon(iconName?: string): LucideIcon {
  if (iconName && ICON_MAP[iconName]) {
    return ICON_MAP[iconName];
  }
  return Wrench;
}

export interface ColorTheme {
  name: string;
  badgeBg: string;
  badgeText: string;
  iconBg: string;
  iconText: string;
  headerGrad: string;
  borderAccent: string;
}

const COLOR_THEMES: Record<string, ColorTheme> = {
  azul: {
    name: 'azul',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-800',
    iconBg: 'bg-blue-100/80',
    iconText: 'text-blue-700',
    headerGrad: 'from-blue-700 via-blue-600 to-indigo-800',
    borderAccent: 'hover:border-blue-300',
  },
  verde: {
    name: 'verde',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-800',
    iconBg: 'bg-emerald-100/80',
    iconText: 'text-emerald-700',
    headerGrad: 'from-emerald-700 via-emerald-600 to-teal-800',
    borderAccent: 'hover:border-emerald-300',
  },
  roxo: {
    name: 'roxo',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-800',
    iconBg: 'bg-purple-100/80',
    iconText: 'text-purple-700',
    headerGrad: 'from-purple-700 via-purple-600 to-indigo-800',
    borderAccent: 'hover:border-purple-300',
  },
  laranja: {
    name: 'laranja',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    iconBg: 'bg-amber-100/80',
    iconText: 'text-amber-800',
    headerGrad: 'from-amber-600 via-orange-600 to-red-700',
    borderAccent: 'hover:border-amber-300',
  },
  rosa: {
    name: 'rosa',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-800',
    iconBg: 'bg-rose-100/80',
    iconText: 'text-rose-700',
    headerGrad: 'from-rose-600 via-pink-600 to-red-700',
    borderAccent: 'hover:border-rose-300',
  },
};

export function getToolColorTheme(colorName?: string): ColorTheme {
  if (colorName && COLOR_THEMES[colorName.toLowerCase()]) {
    return COLOR_THEMES[colorName.toLowerCase()];
  }
  return COLOR_THEMES.azul;
}
