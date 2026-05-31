import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { Mail, Lock, Eye, EyeOff, Leaf } from 'lucide-react';
import { authAPI, setAuthToken } from '../services/api';

interface LoginProps {
  onLogin: (email: string) => void;
  onShowRegister: () => void;
}

export function Login({ onLogin, onShowRegister }: LoginProps) {
  const navigate = useNavigate(); // 2. Initialize hook
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await authAPI.login({ email, password });
      
      // 3. Save Token & User Data
      setAuthToken(response.token);
      localStorage.setItem('token', response.token);
      localStorage.setItem('role', response.user.role); // Important: Save role
      localStorage.setItem('user', JSON.stringify(response.user));

      // 4. Update Parent State (if needed for navbar/sidebar updates)
      onLogin(email); 

      // 5. REDIRECT BASED ON ROLE
      if (response.user.role === 'admin') {
        navigate('/admin/consultants');
      } else {
        navigate('/'); // Or dashboard
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header with agriculture branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <h1 className="text-5xl font-bold tracking-tight">
              <span className="text-green-600">SmartAgro</span>
              <span className="text-gray-700"> </span>
              <span className="text-orange-500">Web</span>
              <span className="relative inline-block text-orange-500">
                <span className="relative">
                  <Leaf className="w-3 h-3 text-green-600 absolute -top-1 left-1/2 -translate-x-1/2" style={{ strokeWidth: 2.5 }} />
                  <span className="opacity-0">i</span>
                </span>
                <span className="absolute left-0 top-0"></span>
              </span>
            </h1>
          </div>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg border-0">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@farm.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember"
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <Label htmlFor="remember" className="text-sm text-gray-600">
                    Remember me
                  </Label>
                </div>
                {/* <button
                  type="button"
                  className="text-sm text-green-600 hover:text-green-800 hover:underline"
                >
                  Forgot password?
                </button> */}
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing you in...
                  </div>
                ) : (
                  'Login'
                )}
              </Button>
            </form>

            {/* Register Button */}
            <div className="mt-4">
              <Button
                type="button"
                variant="outline"
                className="w-full border-green-600 text-green-600 hover:bg-green-50"
                onClick={onShowRegister}
              >
                Register
              </Button>
            </div>
            
            {/* Admin Hint */}
            <div className="mt-4 text-center border-t pt-4">
                <p className="text-xs text-gray-400">Admin Access:</p>
                <p className="text-xs text-gray-500 font-mono">admin@agrisarthi.com</p>
            </div>

          </CardContent>
        </Card>

        {/* Agriculture-themed features preview */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 mb-4">Keep your farm running smoothly</p>
          <div className="flex justify-center space-x-6 text-xs text-gray-500">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Check Your Crops
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Weather Updates
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Track Harvests
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}