import { ReactNode } from 'react';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex">
      {/* Left section: Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary-50 items-center justify-center p-12">
        <div className="absolute inset-0 bg-primary-100/50"></div>
        <div className="z-10 text-center max-w-md">
          <div className="bg-white p-4 rounded-full inline-block mb-6 shadow-sm">
            <Heart className="w-12 h-12 text-primary-500" fill="currentColor" />
          </div>
          <h2 className="text-4xl font-serif font-bold text-gray-900 mb-4">
            Mulai Perjalanan Anda Bersama Kami
          </h2>
          <p className="text-gray-600 text-lg">
            Buat undangan digital impian, kelola tamu, dengan mudah dan elegan.
          </p>
        </div>
      </div>
      
      {/* Right section: Auth Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="flex justify-center lg:justify-start mb-8 lg:hidden">
             <Link to="/" className="flex items-center gap-2">
                <Heart className="w-8 h-8 text-primary-500" fill="currentColor" />
                <span className="text-2xl font-bold text-gray-900 tracking-tight">NikahYuk!</span>
             </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
