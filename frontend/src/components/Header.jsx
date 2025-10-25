import React from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Search, Bell, Settings } from 'lucide-react';

const Header = () => {
  const location = useLocation();
  const navItems = [
    { name: 'Home', path: '/dashboard' },
    { name: 'Meal Plans', path: '/meal-plan' },
    { name: 'Nutrition', path: '/nutrition' },
    { name: 'Analytics', path: '/analytics' },
    { name: 'Order Groceries', path: '/order-groceries' },
    { name: 'Recipes', path: '/recipes', badge: '2' },
    { name: 'Forum', path: '/forum' },
  ];

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <div className="h-40 bg-transparent"></div>
      <motion.nav 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="absolute top-0 left-0 right-0 z-10 px-6 py-4"
        style={{ background: 'rgba(245, 245, 245, 0.85)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #e5e7eb' }}
      >
        <div className="flex items-center justify-between">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="font-bold text-2xl text-black tracking-tight"
          >
            WellNest
          </motion.div>
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ y: -2 }}
                  className="relative"
                >
                  <Link
                    to={item.path}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-colors duration-200 shadow-sm ${
                      isActive
                        ? 'bg-green-500 text-black'
                        : 'bg-gray-100 text-black hover:bg-green-100 hover:text-black'
                    }`}
                    style={{ minWidth: '100px', display: 'inline-block', textAlign: 'center' }}
                  >
                    {item.name}
                  </Link>
                  {item.badge && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      {item.badge}
                    </motion.span>
                  )}
                </motion.div>
              );
            })}
          </div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-4"
          >
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Bell className="w-5 h-5 text-green-100 hover:text-white cursor-pointer transition-colors" />
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Settings className="w-5 h-5 text-green-100 hover:text-white cursor-pointer transition-colors" />
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">J</span>
              </div>
              <div className="text-white">
                <div className="text-sm font-medium">Jessica</div>
                <div className="text-xs text-green-100">jesshammer</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.nav>
    </motion.header>
  );
};

export default Header;
