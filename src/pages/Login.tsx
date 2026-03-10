import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, PREDEFINED_USERS } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Loader2, Users, Moon, Sun, Eye, EyeOff } from 'lucide-react';
import { ROLE_LABELS } from '@/types/leave';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(email, password);
    if (result.success) {
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });
      navigate('/dashboard');
    } else {
      toast({
        title: 'Login failed',
        description: result.error || 'Invalid email or password.',
        variant: 'destructive',
      });
    }

    setLoading(false);
  };

  const handleQuickLogin = (userEmail: string, userPassword: string) => {
    setEmail(userEmail);
    setPassword(userPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-hero dark:bg-gradient-hero-dark flex items-center justify-center p-4 relative">
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 dark:bg-black/20 dark:hover:bg-black/30 transition-colors backdrop-blur-sm"
        aria-label="Toggle theme"
      >
        {isDark ? (
          <Sun className="h-4 w-4 text-yellow-300" />
        ) : (
          <Moon className="h-4 w-4 text-slate-600" />
        )}
      </button>
      <div className="w-full max-w-md animate-fade-up">
        <div className="text-center mb-8">
          <div className="mb-4">
            <img src="/yq-logo.svg" alt="ApproveIQ Logo" className="h-20 w-20 mx-auto" />
          </div>
          <h1 className="text-3xl font-display font-bold text-white dark:text-white">ApproveIQ</h1>
          <p className="text-white/80 dark:text-white/80 mt-2">Digital Leave Approval System</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="font-display">Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@approveiq.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                variant="hero"
                className="w-full h-11"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">Quick Login</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {PREDEFINED_USERS.map((u) => (
                  <Button
                    key={u.id}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs justify-start"
                    onClick={() => handleQuickLogin(u.email, u.password)}
                  >
                    {ROLE_LABELS[u.role]}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
