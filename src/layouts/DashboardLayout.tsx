import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';
import { 
  Heart, 
  LayoutDashboard, 
  Palette, 
  Mail, 
  Users, 
  MessageSquareHeart, 
  Menu,
  X,
  UserCircle,
  LogOut,
  Bell,
  Search,
  ScanLine,
  CreditCard,
  Settings,
  AlertCircle
} from 'lucide-react';

const MENU_ITEMS = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['super_admin', 'customer'] },
  { name: 'Template', icon: Palette, path: '/dashboard/templates', roles: ['super_admin'] },
  { name: 'Undangan', icon: Mail, path: '/dashboard/invitations', roles: ['super_admin', 'customer'] },
  { name: 'Tamu', icon: Users, path: '/dashboard/guests', roles: ['super_admin', 'customer'] },
  { name: 'RSVP', icon: MessageSquareHeart, path: '/dashboard/rsvp', roles: ['super_admin', 'customer'] },
  { name: 'Ucapan', icon: MessageSquareHeart, path: '/dashboard/wishes', roles: ['super_admin', 'customer'] },
  { name: 'Transaksi', icon: CreditCard, path: '/dashboard/transactions', roles: ['super_admin', 'customer'] },
  { name: 'Pengaturan', icon: Settings, path: '/dashboard/settings', roles: ['super_admin', 'customer'] },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hasPaid, setHasPaid] = useState<boolean | null>(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuthStore();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  // Check if customer has at least one successful transaction purchase
  useEffect(() => {
    async function checkPurchase() {
      if (!profile || profile.role !== 'customer') {
        setHasPaid(true);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('id')
          .eq('user_id', profile.id)
          .eq('payment_status', 'success')
          .limit(1);

        if (!error && data && data.length > 0) {
          setHasPaid(true);
        } else {
          setHasPaid(false);
        }
      } catch (err) {
        console.error('Error checking active package:', err);
        setHasPaid(true); // default fallback to prevent annoying banner on database failure
      }
    }
    checkPurchase();
  }, [profile, location.pathname]); // Re-verify on navigation to update state in real time


  // Filter menu items based on user role
  const filteredNavItems = MENU_ITEMS.filter(item => {
    if (!profile) return false;
    return item.roles.includes(profile.role);
  });

  // Verify access for current route based on MENU_ITEMS and user role
  useEffect(() => {
    if (profile) {
      const currentPath = location.pathname;
      const activeMenuItem = MENU_ITEMS.find(item => 
        currentPath === item.path || (currentPath.startsWith(item.path) && item.path !== '/dashboard')
      );

      if (activeMenuItem && !activeMenuItem.roles.includes(profile.role)) {
        // User does not have the required role for this route
        navigate('/dashboard', { replace: true });
      }
    }
  }, [location.pathname, profile, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-gray-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary-500" fill="currentColor" />
            <span className="text-xl font-bold text-gray-900 tracking-tight">NikahYuk!</span>
          </Link>
          <button 
            className="ml-auto lg:hidden text-gray-500 hover:text-gray-700"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4 space-y-1 h-[calc(100vh-4rem)] overflow-y-auto">
          {filteredNavItems.map((item) => {
             const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/dashboard');
             return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-primary-500' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content Info */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700 rounded-md"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="hidden sm:flex max-w-sm w-full lg:max-w-xs relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                className="block w-full bg-gray-50 border border-gray-200 rounded-full py-1.5 pl-9 pr-3 text-sm placeholder-gray-500 focus:outline-none focus:text-gray-900 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-shadow"
                placeholder="Cari sesuatu..."
                type="search"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-gray-500 relative transition-colors">
              <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
              <Bell className="w-5 h-5" />
            </button>
            <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
            <div className="flex items-center gap-3 relative">
               <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-medium text-gray-900">{profile?.name || 'User'}</span>
                  <span className="text-xs text-gray-500 capitalize">{profile?.role?.replace('_', ' ')}</span>
               </div>
               <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
               >
                  <UserCircle className="w-8 h-8 text-gray-400" />
               </button>

               {dropdownOpen && (
                 <>
                   <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)}></div>
                   <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-lg border border-gray-100 p-2 z-20">
                     <button 
                       onClick={handleLogout}
                       className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                     >
                       <LogOut className="w-4 h-4" />
                       Keluar
                     </button>
                   </div>
                 </>
               )}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none p-4 sm:p-6 lg:p-8 space-y-6">
          {hasPaid === false && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-in slide-in-from-top duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-amber-900 text-sm">Akun Anda Belum Memiliki Paket Aktif</h4>
                  <p className="text-xs text-amber-800 leading-normal mt-0.5">
                    Silakan lakukan pembelian paket layanan untuk menghilangkan batasan kuota tamu/foto, mengaktifkan fitur premium, dan menerbitkan undangan Anda secara publik.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => navigate('/dashboard/transactions')}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md transition whitespace-nowrap self-stretch sm:self-auto flex items-center justify-center"
              >
                Aktifkan Paket Sekarang
              </button>
            </div>
          )}
          <Outlet />
        </main>

        {/* Floating WhatsApp Support Button for Customer */}
        {profile?.role === 'customer' && (
          <a
            href="https://wa.me/6287701672479?text=Halo%20Admin%20NikahYuk!,%20saya%20butuh%20bantuan%20terkait%20dashboard%20undangan%20saya..."
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 group flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white p-3.5 sm:p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-emerald-500/30 active:scale-95 cursor-pointer"
            title="Butuh bantuan? Hubungi Admin"
          >
            {/* Floating text revealed on hover */}
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap text-sm font-semibold pr-0 group-hover:pr-2">
              Butuh Bantuan?
            </span>
            {/* Clean WhatsApp SVG */}
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.335 4.963L2 22l5.233-1.372a9.912 9.912 0 0 0 4.779 1.229h.004c5.505 0 9.988-4.479 9.989-9.985-.001-2.668-1.039-5.176-2.927-7.066A9.925 9.925 0 0 0 12.012 2zm5.835 14.129c-.32.9-1.845 1.748-2.54 1.806-.595.051-1.37.088-2.228-.188a10.05 10.05 0 0 1-5.187-3.218 10.024 10.024 0 0 1-2.148-3.905c-.32-.916.059-1.579.432-1.921.284-.26.592-.303.789-.303.197 0 .394.002.559.01.176.008.411-.064.642.492.239.578.814 1.99.884 2.135.07.145.118.314.021.507-.096.194-.145.314-.29.483-.145.17-.306.379-.437.507-.145.142-.297.297-.127.59.17.291.751 1.238 1.61 2.003.111.099.986.772 1.688 1.018.257.09.497.096.685-.084.188-.182.812-.942 1.03-1.266.218-.323.437-.27.728-.162.29.109 1.845.87 2.162 1.029.317.159.528.239.605.372.078.134.078.777-.242 1.677z" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}
