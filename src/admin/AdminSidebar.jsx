import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Grid,
  Layers,
  PackageCheck,
  ShoppingCart,
  Users,
  Tag,
  Image as ImageIcon,
  Settings,
  Sparkles,
  ArrowLeft,
  Store
} from 'lucide-react';

import { BRAND } from '../config/brand';

export default function AdminSidebar({ onClose }) {
  const menuSections = [
    {
      title: 'OVERVIEW',
      items: [{ label: 'Dashboard', icon: LayoutDashboard, path: '/admin' }],
    },
    {
      title: 'CATALOG',
      items: [
        { label: 'Products', icon: ShoppingBag, path: '/admin/products' },
        { label: 'Categories', icon: Grid, path: '/admin/categories' },
        { label: 'Inventory', icon: PackageCheck, path: '/admin/inventory' },
      ],
    },
    {
      title: 'ORDERS & CUSTOMERS',
      items: [
        { label: 'Orders & Customers', icon: ShoppingCart, path: '/admin/orders' },
      ],
    },
    {
      title: 'MARKETING & CONTENT',
      items: [
        { label: 'Coupons', icon: Tag, path: '/admin/coupons' },
        { label: 'Hero Banners', icon: ImageIcon, path: '/admin/banners' },
      ],
    },

    {
      title: 'SYSTEM',
      items: [{ label: 'Store Settings', icon: Settings, path: '/admin/settings' }],
    },
  ];

  return (
    <aside className="w-64 bg-[#6B1518] text-white flex flex-col h-full shadow-2xl border-r border-[#831A1D]">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#831A1D] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FAF5EE] ring-2 ring-[#D3923A]/60 flex items-center justify-center overflow-hidden p-0.5 shadow-sm shrink-0">
            <img src="/logo-icon.png" alt={BRAND.name} className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold tracking-wide text-white leading-tight">
              {BRAND.name}
            </h2>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#D3923A]">
              Store CMS Admin
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6 hide-scroll">
        {menuSections.map((sec, idx) => (
          <div key={idx} className="space-y-1.5">
            <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-[#D3923A]/90 px-3">
              {sec.title}
            </h3>
            <div className="space-y-1">
              {sec.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/admin'}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                        isActive
                          ? 'bg-[#D3923A] text-[#6B1518] shadow-md transform translate-x-1'
                          : 'text-gray-200 hover:bg-[#831A1D] hover:text-white'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Storefront Link Footer */}
      <div className="p-4 border-t border-[#831A1D] bg-[#531012]">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="w-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-colors border border-white/10"
        >
          <Store className="w-4 h-4 text-[#D3923A]" />
          <span>View Live Storefront →</span>
        </a>
      </div>
    </aside>
  );
}
