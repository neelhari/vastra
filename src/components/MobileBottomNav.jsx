import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Grid3x3, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function MobileBottomNav() {
  const { totalItemsCount, setIsCartOpen } = useCart();
  const { user, isAuthenticated, openLoginModal } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === '/checkout' || location.pathname === '/order-success') {
    return null;
  }

  const goTo = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const items = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      isActive: location.pathname === '/',
      onClick: () => goTo('/'),
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: Grid3x3,
      isActive: location.pathname === '/categories',
      onClick: () => goTo('/categories'),
    },
    {
      id: 'cart',
      label: 'Cart',
      icon: ShoppingBag,
      isActive: location.pathname === '/cart',
      badge: totalItemsCount > 0 ? totalItemsCount : null,
      onClick: () => setIsCartOpen(true),
    },
    {
      id: 'account',
      label: 'Account',
      icon: User,
      isActive: location.pathname === '/account' || location.pathname === '/login',
      onClick: () => goTo('/account'),
    },
  ];

  return (
    <nav
      className="xl:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 flex items-stretch shadow-[0_-2px_10px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={item.onClick}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold transition-colors relative ${
              item.isActive ? 'text-[#6B1518]' : 'text-gray-500 hover:text-[#6B1518]'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${item.isActive ? 'fill-[#F8F0F0]' : ''}`} strokeWidth={item.isActive ? 2.4 : 2} />
              {item.badge && (
                <span className="absolute -top-1.5 -right-2 bg-[#D3923A] text-[#6B1518] text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {item.badge}
                </span>
              )}
            </div>
            <span>{item.label}</span>
            {item.isActive && (
              <span className="absolute top-0 w-8 h-0.5 bg-[#6B1518] rounded-full" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
