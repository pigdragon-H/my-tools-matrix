// CategoryIcon - 動態渲染 lucide-react 圖示
import {
  TrendingUp, Heart, Briefcase, Code2, GraduationCap,
  Scale, Palette, FlaskConical, Languages, ShoppingCart,
  Globe, Sparkles, Car, Dumbbell, Calculator, BookOpen,
  Layers, LucideProps,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  TrendingUp,
  Heart,
  Briefcase,
  Code2,
  GraduationCap,
  Scale,
  Palette,
  FlaskConical,
  Languages,
  ShoppingCart,
  Globe,
  Sparkles,
  Car,
  Dumbbell,
  Calculator,
  BookOpen,
  Layers,
};

interface CategoryIconProps extends LucideProps {
  iconName: string;
}

export function CategoryIcon({ iconName, ...props }: CategoryIconProps) {
  const Icon = iconMap[iconName] ?? Calculator;
  return <Icon {...props} />;
}
