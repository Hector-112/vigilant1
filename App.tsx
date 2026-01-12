
import React, { useState, useEffect, useMemo } from 'react';
import { Product, Statistics, UserProfile, NotificationLog, TransmissionConfig } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import AddProduct from './pages/AddProduct';
import Insights from './pages/Insights';
import Assistant from './pages/Assistant';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import { dataService } from './services/dataService';
import { notificationService } from './services/notificationService';
import { auth, isFirebaseConfigured } from './services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { triggerHaptic } from './services/hapticService';
import { getTranslation } from './services/translations';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'inventory' | 'add' | 'insights' | 'assistant' | 'settings'>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [notifLogs, setNotifLogs] = useState<NotificationLog[]>([]);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [virtualSms, setVirtualSms] = useState<{body: string, from: string, to: string, timestamp: string} | null>(null);
  
  // Settings State - Default theme set to 'light'
  const [config, setConfig] = useState<TransmissionConfig>({
    enabled: true,
    smsEnabled: true,
    theme: 'light',
    language: 'English'
  });

  const t = useMemo(() => getTranslation(config.language), [config.language]);

  // Theme Manager
  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = (theme: string) => {
      if (theme === 'dark' || (theme === 'system' && mediaQuery.matches)) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme(config.theme);

    const listener = (e: MediaQueryListEvent) => {
      if (config.theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [config.theme]);

  useEffect(() => {
    const handleSms = (e: any) => {
      setVirtualSms(e.detail);
      triggerHaptic('heavy');
      setTimeout(() => setVirtualSms(null), 10000);
    };
    window.addEventListener('vigilant-sms-received', handleSms);
    return () => window.removeEventListener('vigilant-sms-received', handleSms);
  }, []);

  const handleSweep = async (u?: UserProfile) => {
    const targetUser = u || user;
    if (targetUser) {
      const logs = await notificationService.processGlobalSweep(targetUser);
      setNotifLogs(logs);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('vigilant_active_session');
    if (savedUser && !user) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      dataService.syncUserToGlobalDirectory(parsed);
      loadData(parsed.uid);
      
      const userConfig = notificationService.getConfig(parsed.uid);
      setConfig(userConfig);
    }
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setIsLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const profile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          photoURL: firebaseUser.photoURL,
          phoneNumber: firebaseUser.phoneNumber
        };
        setUser(profile);
        dataService.syncUserToGlobalDirectory(profile).then(() => handleSweep(profile));
        localStorage.setItem('vigilant_active_session', JSON.stringify(profile));
        
        const userConfig = notificationService.getConfig(profile.uid);
        setConfig(userConfig);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loadData = async (uid: string) => {
    const fetchedProducts = await dataService.getProducts(uid);
    setProducts(fetchedProducts);
    setNotifLogs(notificationService.getLogs(uid));
    const connected = await dataService.checkConnectivity();
    setIsBackendConnected(connected);
  };

  const handleLogin = async (identifier: string, pass: string) => {
    const localUsers = JSON.parse(localStorage.getItem('vigilant_local_users') || '[]');
    const matchedUser = localUsers.find((u: any) => u.phoneNumber === identifier && u.password === pass);

    if (matchedUser) {
      triggerHaptic('heavy');
      const profile: UserProfile = {
        uid: matchedUser.uid,
        email: matchedUser.email || null,
        displayName: matchedUser.displayName || `User ${identifier.slice(-4)}`,
        photoURL: null,
        phoneNumber: matchedUser.phoneNumber
      };
      setUser(profile);
      await dataService.syncUserToGlobalDirectory(profile);
      localStorage.setItem('vigilant_active_session', JSON.stringify(profile));
      loadData(profile.uid);
      setConfig(notificationService.getConfig(profile.uid));
    } else {
      triggerHaptic('error');
      alert("Invalid login credentials.");
    }
  };

  const handleRegister = async (emailRaw: string | null, pass: string, phone: string) => {
    const localUsers = JSON.parse(localStorage.getItem('vigilant_local_users') || '[]');
    if (localUsers.some((u: any) => u.phoneNumber === phone)) {
      triggerHaptic('error');
      alert("This phone number is already registered.");
      return;
    }

    const newUser = {
      uid: `local-${Math.random().toString(36).substring(2, 11)}`,
      email: null,
      password: pass,
      displayName: `User ${phone.slice(-4)}`,
      phoneNumber: phone
    };

    localUsers.push(newUser);
    localStorage.setItem('vigilant_local_users', JSON.stringify(localUsers));
    
    triggerHaptic('heavy');
    const profile: UserProfile = {
      uid: newUser.uid,
      email: null,
      displayName: newUser.displayName,
      photoURL: null,
      phoneNumber: newUser.phoneNumber
    };
    setUser(profile);
    await dataService.syncUserToGlobalDirectory(profile);
    localStorage.setItem('vigilant_active_session', JSON.stringify(profile));
    loadData(profile.uid);
    setConfig(notificationService.getConfig(profile.uid));
  };

  const handleDemoLogin = () => {
    const guestUser: UserProfile = {
      uid: 'demo-user',
      email: null,
      displayName: 'Guest Operative',
      photoURL: null,
      phoneNumber: '+15550009999'
    };
    setUser(guestUser);
    dataService.syncUserToGlobalDirectory(guestUser);
    localStorage.setItem('vigilant_active_session', JSON.stringify(guestUser));
    loadData(guestUser.uid);
    setConfig(notificationService.getConfig(guestUser.uid));
  };

  const handleLogout = async () => {
    if (auth && isFirebaseConfigured) {
      try { await signOut(auth); } catch(e) {}
    }
    localStorage.removeItem('vigilant_active_session');
    setUser(null);
    setAuthView('login');
  };

  const addProduct = async (productData: Omit<Product, 'userId'>) => {
    if (!user) return;
    const newProduct: Product = {
      ...productData,
      userId: user.uid
    };
    setProducts(prev => [newProduct, ...prev]);
    await dataService.saveProduct(newProduct);
    setTimeout(() => handleSweep(), 500); 
  };

  const deleteProduct = async (id: string) => {
    if (!user) return;
    setProducts(prev => prev.filter(p => p.id !== id));
    await dataService.deleteProduct(id, user.uid);
  };

  const statistics: Statistics = useMemo(() => {
    const now = new Date();
    const stats = { total: products.length, fresh: 0, soon: 0, expired: 0 };
    products.forEach(p => {
      const expiry = new Date(p.expiryDate);
      const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) stats.expired++;
      else if (diffDays <= 3) stats.soon++;
      else stats.fresh++;
    });
    return stats;
  }, [products]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafaf9] dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-[3px] border-slate-100 dark:border-slate-800 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return authView === 'login' ? (
      <Login 
        onLogin={handleLogin} 
        onSwitchToRegister={() => setAuthView('register')} 
        onDemoLogin={handleDemoLogin}
      />
    ) : (
      <Register 
        onRegister={handleRegister} 
        onSwitchToLogin={() => setAuthView('login')} 
      />
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard products={products} stats={statistics} onNavigate={setCurrentPage} logs={notifLogs} onSweep={() => handleSweep()} user={user} t={t} />;
      case 'inventory': return <Inventory products={products} onDelete={deleteProduct} t={t} />;
      case 'add': return <AddProduct onAdd={addProduct} onNavigate={setCurrentPage} t={t} />;
      case 'insights': return <Insights products={products} t={t} />;
      case 'assistant': return <Assistant products={products} t={t} />;
      case 'settings': return <Settings user={user} onConfigChange={setConfig} t={t} />;
      default: return <Dashboard products={products} stats={statistics} onNavigate={setCurrentPage} logs={notifLogs} onSweep={() => handleSweep()} user={user} t={t} />;
    }
  };

  return (
    <div className="flex min-h-screen text-slate-900 dark:text-slate-100 bg-[#fafaf9] dark:bg-slate-950 relative overflow-hidden transition-colors duration-300">
      <Sidebar 
        currentPage={currentPage} 
        onNavigate={setCurrentPage} 
        isConnected={isBackendConnected} 
        onLogout={handleLogout}
        user={user}
        t={t}
      />
      <main className="flex-1 lg:ml-64 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto h-full">
          {renderPage()}
        </div>
      </main>
    </div>
  );
};

export default App;
