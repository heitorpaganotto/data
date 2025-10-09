import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Power, Clock, TrendingUp, DollarSign, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MobileHeader } from '@/components/MobileHeader';

interface SystemConfig {
  id: string;
  last_sent_at: string | null;
  interval_minutes: number;
}

export const Sync = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalTickets: 0,
    avgTicket: 0,
    avgDelivery: 0
  });

  useEffect(() => {
    fetchConfig();
    fetchStats();

    const channel = supabase
      .channel('config-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'system_config'
        },
        () => {
          fetchConfig();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('system_config')
        .select('*')
        .single();

      if (error) throw error;
      setConfig(data);
    } catch (error) {
      console.error('Error fetching config:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao carregar configurações',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('tickets_sent')
        .select('ticket_value, delivery_rate');

      if (error) throw error;

      const totalRevenue = data.reduce((sum, t) => sum + t.ticket_value, 0);
      const totalTickets = data.length;
      const avgTicket = totalTickets > 0 ? totalRevenue / totalTickets : 0;
      const avgDelivery = totalTickets > 0 
        ? data.reduce((sum, t) => sum + t.delivery_rate, 0) / totalTickets 
        : 0;

      setStats({
        totalRevenue,
        totalTickets,
        avgTicket,
        avgDelivery
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };



  const sendTicketNow = async () => {
    try {
      const response = await supabase.functions.invoke('send-ticket');
      
      if (response.error) throw response.error;

      toast({
        title: 'Sucesso',
        description: 'Ticket enviado com sucesso!',
      });

      fetchStats();
      fetchConfig();
    } catch (error) {
      console.error('Error sending ticket:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao enviar ticket',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <MobileHeader />
      <div className="container mx-auto p-4 md:p-8 space-y-6 max-w-6xl">
        <div className="space-y-2 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary-glow to-primary/60 bg-clip-text text-transparent">
            Monitoramento do Sistema
          </h1>
          <p className="text-muted-foreground text-lg">Sistema automático de envio de tickets</p>
        </div>

        <Card className="p-6 md:p-8 border-2 border-primary/20 bg-gradient-to-br from-card via-primary/5 to-card shadow-xl animate-scale-in">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-4">
                <div className="w-5 h-5 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50" />
                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  Sistema Ativo 24/7
                </h2>
              </div>
              {config?.last_sent_at && (
                <p className="text-base text-muted-foreground flex items-center gap-2 ml-9">
                  <Clock className="w-5 h-5" />
                  Último envio: {new Date(config.last_sent_at).toLocaleString('pt-BR')}
                </p>
              )}
              <p className="text-sm text-muted-foreground ml-9">
                Intervalo aleatório: 6-19 minutos entre envios
              </p>
            </div>
            
            <Button
              onClick={sendTicketNow}
              size="lg"
              className="w-full md:w-auto bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 shadow-lg"
            >
              <Power className="w-5 h-5 mr-2" />
              Enviar Agora
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 md:p-6 bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs md:text-sm font-medium text-muted-foreground">Faturamento Total</p>
                <p className="text-2xl md:text-3xl font-bold text-foreground">€{stats.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="p-2 md:p-3 rounded-xl bg-primary/10">
                <DollarSign className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-4 md:p-6 bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs md:text-sm font-medium text-muted-foreground">Total de Tickets</p>
                <p className="text-2xl md:text-3xl font-bold text-foreground">{stats.totalTickets}</p>
              </div>
              <div className="p-2 md:p-3 rounded-xl bg-primary/10">
                <Package className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-4 md:p-6 bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs md:text-sm font-medium text-muted-foreground">Ticket Médio</p>
                <p className="text-2xl md:text-3xl font-bold text-foreground">€{stats.avgTicket.toFixed(2)}</p>
              </div>
              <div className="p-2 md:p-3 rounded-xl bg-primary/10">
                <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-4 md:p-6 bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs md:text-sm font-medium text-muted-foreground">Taxa Média de Entrega</p>
                <p className="text-2xl md:text-3xl font-bold text-foreground">{stats.avgDelivery.toFixed(1)}%</p>
              </div>
              <div className="p-2 md:p-3 rounded-xl bg-primary/10">
                <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
            </div>
          </Card>
        </div>


        <Card className="p-6 md:p-8 border-2 border-primary/10 bg-gradient-to-br from-card to-card/50 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1 bg-gradient-to-b from-primary to-primary-glow rounded-full" />
            <h2 className="text-2xl font-bold">Tickets Disponíveis</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30 hover:border-primary/50 transition-all hover:shadow-lg group">
              <p className="text-2xl font-bold text-primary group-hover:scale-110 transition-transform">€57,90</p>
              <p className="text-sm text-muted-foreground mt-2">Ticket Básico</p>
            </div>
            <div className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30 hover:border-primary/50 transition-all hover:shadow-lg group">
              <p className="text-2xl font-bold text-primary group-hover:scale-110 transition-transform">€97,98</p>
              <p className="text-sm text-muted-foreground mt-2">Ticket Premium</p>
            </div>
            <div className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30 hover:border-primary/50 transition-all hover:shadow-lg group">
              <p className="text-2xl font-bold text-primary group-hover:scale-110 transition-transform">€39,00</p>
              <p className="text-sm text-muted-foreground mt-2">Ticket Econômico</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Sync;