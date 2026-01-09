'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bot,
  FileText,
  Gem,
  Home,
  MessageCircle,
  Package,
  ShoppingCart,
  Users,
} from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const links = [
  { href: '/dashboard', label: 'لوحة التحكم', icon: Home },
  { href: '/dashboard/invoices', label: 'الفواتير', icon: FileText },
  { href: '/dashboard/inventory', label: 'المخزون', icon: Package },
  { href: '/dashboard/customers', label: 'العملاء', icon: Users },
  { href: '/dashboard/team', label: 'الفريق', icon: Gem },
  { href: '/dashboard/reports', label: 'التقارير', icon: ShoppingCart },
  { href: '/dashboard/chat', label: 'الدردشة', icon: MessageCircle },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {links.map((link) => (
        <SidebarMenuItem key={link.href}>
          <Link href={link.href}>
            <SidebarMenuButton
              isActive={pathname === link.href}
              className={cn('w-full', pathname === link.href && 'bg-sidebar-accent')}
              tooltip={link.label}
            >
              <link.icon className="h-5 w-5" />
              <span>{link.label}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
