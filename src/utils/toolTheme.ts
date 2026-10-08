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
  MapPin,
  Map,
  Phone,
  Mail,
  FileCheck,
  Sliders,
  Settings,
  Link,
  ExternalLink,
  Printer,
  Database,
  BookOpen,
  HelpCircle,
  Send,
  Archive,
  Tag,
  Sparkles,
  PieChart,
  Key,
  Lock,
  Building,
  Home,
  Scale,
  LucideIcon,
} from 'lucide-react';

export const ICON_MAP: Record<string, LucideIcon> = {
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
  MapPin,
  Map,
  Phone,
  Mail,
  FileCheck,
  Sliders,
  Settings,
  Link,
  ExternalLink,
  Printer,
  Database,
  BookOpen,
  HelpCircle,
  Send,
  Archive,
  Tag,
  Sparkles,
  PieChart,
  Key,
  Lock,
  Building,
  Home,
  Scale,
};

export interface IconOption {
  name: string;
  label: string;
}

export const AVAILABLE_ICONS: IconOption[] = [
  { name: 'FileText', label: 'Documento de texto' },
  { name: 'FileCheck', label: 'Documento conferido' },
  { name: 'FileSpreadsheet', label: 'Planilha' },
  { name: 'Folder', label: 'Pasta' },
  { name: 'Archive', label: 'Arquivo / Armazenamento' },
  { name: 'Users', label: 'Pessoas / Equipe' },
  { name: 'Calendar', label: 'Calendário / Agenda' },
  { name: 'Clock', label: 'Relógio / Prazos' },
  { name: 'ClipboardList', label: 'Lista de tarefas' },
  { name: 'CheckSquare', label: 'Checklist / Aprovação' },
  { name: 'Calculator', label: 'Calculadora' },
  { name: 'Briefcase', label: 'Maleta / Processos' },
  { name: 'Building', label: 'Prédio / Órgão público' },
  { name: 'Home', label: 'Início / Gabinete' },
  { name: 'ShieldCheck', label: 'Segurança / Validação' },
  { name: 'Scale', label: 'Balança / Jurídico' },
  { name: 'Bookmark', label: 'Marcador / Favorito' },
  { name: 'Tag', label: 'Etiqueta / Categoria' },
  { name: 'Layers', label: 'Camadas / Múltiplos' },
  { name: 'Search', label: 'Busca / Consulta' },
  { name: 'Globe', label: 'Internet / Portal' },
  { name: 'Link', label: 'Link / Endereço' },
  { name: 'ExternalLink', label: 'Link externo' },
  { name: 'Wrench', label: 'Ferramenta' },
  { name: 'Sliders', label: 'Ajustes / Parâmetros' },
  { name: 'Settings', label: 'Configuração' },
  { name: 'Phone', label: 'Telefone / Contato' },
  { name: 'Mail', label: 'Correio eletrônico' },
  { name: 'Inbox', label: 'Caixa de entrada' },
  { name: 'Send', label: 'Envio / Protocolo' },
  { name: 'MessageSquare', label: 'Mensagens / Conversa' },
  { name: 'BarChart3', label: 'Gráfico de barras' },
  { name: 'PieChart', label: 'Gráfico de pizza' },
  { name: 'Database', label: 'Banco de dados' },
  { name: 'BookOpen', label: 'Manual / Legislação' },
  { name: 'HelpCircle', label: 'Dúvidas / Ajuda' },
  { name: 'Printer', label: 'Impressão' },
  { name: 'MapPin', label: 'Localização' },
  { name: 'Map', label: 'Mapa territorial' },
  { name: 'Lock', label: 'Cadeado / Protegido' },
  { name: 'Key', label: 'Chave / Acesso' },
  { name: 'Sparkles', label: 'Destaque / Especial' },
];

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

export const COLOR_THEMES: Record<string, ColorTheme> = {
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
