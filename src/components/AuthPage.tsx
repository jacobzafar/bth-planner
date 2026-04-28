import { useState } from 'react';
import { GraduationCap, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type Mode = 'login' | 'signup' | 'forgot';

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Fyll i e-postadress');
      return;
    }
    if (mode !== 'forgot' && !password.trim()) {
      toast.error('Fyll i lösenord');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success('Inloggad!');
      } else if (mode === 'signup') {
        if (password.length < 6) {
          toast.error('Lösenordet måste vara minst 6 tecken');
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin }
        });
        if (error) throw error;
        toast.success('Konto skapat! Kontrollera din e-post för verifiering.');
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success('Återställningslänk skickad! Kontrollera din e-post.');
        setMode('login');
      }
    } catch (error: any) {
      toast.error(error.message || 'Något gick fel');
    } finally {
      setLoading(false);
    }
  };

  const title = mode === 'login' ? 'Logga in' : mode === 'signup' ? 'Skapa konto' : 'Glömt lösenord';

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="flex items-center gap-2 mb-8">
        <GraduationCap className="h-8 w-8 text-primary" />
        <span className="font-heading font-bold text-2xl text-foreground">BTH Studieplanerare</span>
      </div>

      <Card className="w-full max-w-md animate-slide-up">
        <CardHeader>
          <CardTitle className="font-heading text-center">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">E-postadress</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="din@email.se"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <Label htmlFor="password">Lösenord</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minst 6 tecken"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {mode === 'login' && (
                  <div className="mt-2 text-right">
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Glömt lösenord?
                    </button>
                  </div>
                )}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? 'Laddar...'
                : mode === 'login'
                ? 'Logga in'
                : mode === 'signup'
                ? 'Skapa konto'
                : 'Skicka återställningslänk'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            {mode === 'forgot' ? (
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
              >
                <ArrowLeft className="h-3 w-3" /> Tillbaka till inloggning
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {mode === 'login' ? 'Har du inget konto? Registrera dig' : 'Har du redan ett konto? Logga in'}
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
