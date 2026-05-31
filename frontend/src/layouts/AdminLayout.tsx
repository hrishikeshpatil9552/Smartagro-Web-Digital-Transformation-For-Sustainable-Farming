import React from 'react';
import { LogOut, Shield } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

export const AdminLayout = ({ children, onLogout }: AdminLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      
      {/* --- ADMIN HEADER --- */}
      <header className="bg-green-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-yellow-400" />
              <h1 className="text-xl font-bold tracking-wider">
                AgriSarthi <span className="text-green-300 text-sm font-normal">| Admin Panel</span>
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-green-200 hidden sm:block">Logged in as Administrator</span>
              <button 
                onClick={onLogout} 
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT (Add/Edit/Delete Consultant) --- */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[500px] p-6">
          {children}
        </div>
      </main>

      {/* --- ADMIN FOOTER --- */}
      <footer className="bg-gray-800 text-gray-400 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} AgriSarthi Admin Portal. Authorized Personnel Only.
          </p>
        </div>
      </footer>

    </div>
  );
};