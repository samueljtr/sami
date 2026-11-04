import React from 'react';
import {
  Utensils,
  Coffee,
  Pizza,
  Apple,
  Wine,
  CookingPot,
  IceCream,
  ShoppingCart,
  ShoppingBag,
  Store,
  Tag,
  Package,
  Shirt,
  Watch,
  Home,
  Lightbulb,
  Zap,
  Wifi,
  Wrench,
  Droplets,
  Trash2,
  Car,
  Bus,
  Plane,
  Fuel,
  Bike,
  Train,
  HeartPulse,
  Activity,
  Pill,
  Dumbbell,
  Smile,
  Sparkles,
  Film,
  Tv,
  Gamepad2,
  Music,
  Ticket,
  PartyPopper,
  Camera,
  PiggyBank,
  TrendingUp,
  Wallet,
  CreditCard,
  Banknote,
  Coins,
  DollarSign,
  Landmark,
  GraduationCap,
  Briefcase,
  Laptop,
  BookOpen,
  Gift,
  Baby,
  Dog,
  Shield,
  Star,
  HelpCircle,
  MoreHorizontal,
  LucideIcon,
} from 'lucide-react';

export interface IconDefinition {
  name: string;
  label: string;
  group: string;
  icon: LucideIcon;
}

export const CATEGORY_ICON_CATALOG: IconDefinition[] = [
  // Alimentación
  { name: 'Utensils', label: 'Comida', group: 'Alimentación', icon: Utensils },
  { name: 'ShoppingCart', label: 'Supermercado', group: 'Alimentación', icon: ShoppingCart },
  { name: 'Coffee', label: 'Café / Bebidas', group: 'Alimentación', icon: Coffee },
  { name: 'Pizza', label: 'Comida Rápida', group: 'Alimentación', icon: Pizza },
  { name: 'Apple', label: 'Frutas / Saludable', group: 'Alimentación', icon: Apple },
  { name: 'Wine', label: 'Bares / Vinos', group: 'Alimentación', icon: Wine },
  { name: 'CookingPot', label: 'Cocina', group: 'Alimentación', icon: CookingPot },
  { name: 'IceCream', label: 'Postres', group: 'Alimentación', icon: IceCream },

  // Hogar y Servicios
  { name: 'Home', label: 'Vivienda / Alquiler', group: 'Hogar y Servicios', icon: Home },
  { name: 'Zap', label: 'Electricidad / Luz', group: 'Hogar y Servicios', icon: Zap },
  { name: 'Droplets', label: 'Agua', group: 'Hogar y Servicios', icon: Droplets },
  { name: 'Wifi', label: 'Internet / Telefonía', group: 'Hogar y Servicios', icon: Wifi },
  { name: 'Lightbulb', label: 'Servicios Básicos', group: 'Hogar y Servicios', icon: Lightbulb },
  { name: 'Wrench', label: 'Mantenimiento', group: 'Hogar y Servicios', icon: Wrench },
  { name: 'Trash2', label: 'Aseo / Basura', group: 'Hogar y Servicios', icon: Trash2 },

  // Transporte
  { name: 'Car', label: 'Automóvil', group: 'Transporte', icon: Car },
  { name: 'Fuel', label: 'Gasolina / Combustible', group: 'Transporte', icon: Fuel },
  { name: 'Bus', label: 'Transporte Público', group: 'Transporte', icon: Bus },
  { name: 'Bike', label: 'Bicicleta', group: 'Transporte', icon: Bike },
  { name: 'Train', label: 'Tren / Metro', group: 'Transporte', icon: Train },
  { name: 'Plane', label: 'Viajes / Vuelos', group: 'Transporte', icon: Plane },

  // Compras y Estilo
  { name: 'ShoppingBag', label: 'Compras Generales', group: 'Compras', icon: ShoppingBag },
  { name: 'Shirt', label: 'Ropa / Moda', group: 'Compras', icon: Shirt },
  { name: 'Watch', label: 'Accesorios', group: 'Compras', icon: Watch },
  { name: 'Store', label: 'Tiendas', group: 'Compras', icon: Store },
  { name: 'Package', label: 'Paquetería / Envíos', group: 'Compras', icon: Package },
  { name: 'Gift', label: 'Regalos', group: 'Compras', icon: Gift },

  // Ocio y Entretenimiento
  { name: 'Film', label: 'Cine / Películas', group: 'Ocio', icon: Film },
  { name: 'Tv', label: 'Streaming / Series', group: 'Ocio', icon: Tv },
  { name: 'Gamepad2', label: 'Videojuegos', group: 'Ocio', icon: Gamepad2 },
  { name: 'Music', label: 'Música / Conciertos', group: 'Ocio', icon: Music },
  { name: 'Ticket', label: 'Eventos', group: 'Ocio', icon: Ticket },
  { name: 'PartyPopper', label: 'Fiestas / Salidas', group: 'Ocio', icon: PartyPopper },
  { name: 'Camera', label: 'Fotografía', group: 'Ocio', icon: Camera },

  // Salud y Bienestar
  { name: 'HeartPulse', label: 'Salud / Médico', group: 'Salud', icon: HeartPulse },
  { name: 'Pill', label: 'Farmacia / Medicinas', group: 'Salud', icon: Pill },
  { name: 'Dumbbell', label: 'Gimnasio / Deporte', group: 'Salud', icon: Dumbbell },
  { name: 'Activity', label: 'Bienestar', group: 'Salud', icon: Activity },
  { name: 'Smile', label: 'Cuidado Personal', group: 'Salud', icon: Smile },

  // Trabajo, Educación y Familia
  { name: 'Briefcase', label: 'Salario / Trabajo', group: 'Trabajo y Educación', icon: Briefcase },
  { name: 'GraduationCap', label: 'Educación / Cursos', group: 'Trabajo y Educación', icon: GraduationCap },
  { name: 'Laptop', label: 'Tecnología / Freelance', group: 'Trabajo y Educación', icon: Laptop },
  { name: 'BookOpen', label: 'Libros / Estudios', group: 'Trabajo y Educación', icon: BookOpen },
  { name: 'Baby', label: 'Hijos / Niños', group: 'Familia', icon: Baby },
  { name: 'Dog', label: 'Mascotas', group: 'Familia', icon: Dog },

  // Finanzas e Ingresos
  { name: 'PiggyBank', label: 'Ahorro', group: 'Finanzas', icon: PiggyBank },
  { name: 'TrendingUp', label: 'Inversiones / Rendimiento', group: 'Finanzas', icon: TrendingUp },
  { name: 'Wallet', label: 'Billetera / Efectivo', group: 'Finanzas', icon: Wallet },
  { name: 'CreditCard', label: 'Tarjetas / Crédito', group: 'Finanzas', icon: CreditCard },
  { name: 'Banknote', label: 'Billetes / Ingresos', group: 'Finanzas', icon: Banknote },
  { name: 'Coins', label: 'Monedas / Cambio', group: 'Finanzas', icon: Coins },
  { name: 'DollarSign', label: 'Dinero General', group: 'Finanzas', icon: DollarSign },
  { name: 'Landmark', label: 'Banco / Préstamos', group: 'Finanzas', icon: Landmark },

  // Otros
  { name: 'Tag', label: 'Etiqueta', group: 'Otros', icon: Tag },
  { name: 'Shield', label: 'Seguros', group: 'Otros', icon: Shield },
  { name: 'Star', label: 'Favorito', group: 'Otros', icon: Star },
  { name: 'Sparkles', label: 'Especial', group: 'Otros', icon: Sparkles },
  { name: 'HelpCircle', label: 'Imprevistos', group: 'Otros', icon: HelpCircle },
  { name: 'MoreHorizontal', label: 'Otros Gastos', group: 'Otros', icon: MoreHorizontal },
];

const ICON_MAP = new Map<string, LucideIcon>();
CATEGORY_ICON_CATALOG.forEach((item) => {
  ICON_MAP.set(item.name.toLowerCase(), item.icon);
});

export function getCategoryLucideIcon(iconName?: string): LucideIcon {
  if (!iconName) return Tag;
  const match = ICON_MAP.get(iconName.toLowerCase());
  return match || Tag;
}

export function renderCategoryIcon(
  iconName?: string,
  className = 'w-5 h-5 text-current'
): React.ReactElement {
  const IconComponent = getCategoryLucideIcon(iconName);
  return <IconComponent className={className} />;
}
