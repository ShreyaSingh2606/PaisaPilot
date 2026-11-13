import React from 'react';
import {
  Utensils,
  Car,
  ShoppingBag,
  Film,
  GraduationCap,
  Home,
  HeartPulse,
  TrendingUp,
  Tag,
  Briefcase,
  Laptop,
  Wallet,
  PiggyBank,
  Coffee,
  HelpCircle,
} from 'lucide-react';

const iconMap = {
  Utensils,
  Car,
  ShoppingBag,
  Film,
  GraduationCap,
  Home,
  HeartPulse,
  TrendingUp,
  Tag,
  Briefcase,
  Laptop,
  Wallet,
  PiggyBank,
  Coffee,
};

export default function CategoryIcon({ name, size = 18, className = '', color = 'currentColor' }) {
  const IconComponent = iconMap[name] || HelpCircle;
  return <IconComponent size={size} className={className} color={color} />;
}
