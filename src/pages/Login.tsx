import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Lock } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (login(email, password)) {
      toast({
        title: 'Login realizado com sucesso!',
        description: 'Bem-vindo ao PayGateway Dashboard',
      });
      navigate('/dashboard');
    } else {
      toast({
        title: 'Erro ao fazer login',
        description: 'Email ou senha incorretos',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4 animate-fade-in">
      <Card className="w-full max-w-md p-6 md:p-8 space-y-6 shadow-xl">
        <div className="text-center space-y-2">
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 mb-4 shadow-lg">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            PayGateway
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">Faça login para acessar sua dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl">
            Entrar
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          <p>Use as credenciais fornecidas para acessar</p>
        </div>
      </Card>
    </div>
  );
};

export default Login;
