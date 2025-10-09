import { useMemo, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DollarSign, TrendingUp, Percent, Package } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MobileHeader } from '@/components/MobileHeader';

interface TicketData {
  id: string;
  ticket_value: number;
  delivery_rate: number;
  sent_at: string;
  link_used: string;
}

export const Dashboard = () => {
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minValue, setMinValue] = useState<string>('');
  const [maxValue, setMaxValue] = useState<string>('');

  useEffect(() => {
    fetchTickets();
    
    const channel = supabase
      .channel('tickets-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tickets_sent'
        },
        () => {
          fetchTickets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('tickets_sent')
        .select('*')
        .order('sent_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    return tickets.filter((ticket) => {
      const ticketDate = new Date(ticket.sent_at).toISOString().split('T')[0];
      
      if (startDate && ticketDate < startDate) return false;
      if (endDate && ticketDate > endDate) return false;
      if (minValue && ticket.ticket_value < parseFloat(minValue)) return false;
      if (maxValue && ticket.ticket_value > parseFloat(maxValue)) return false;
      
      return true;
    });
  }, [tickets, startDate, endDate, minValue, maxValue]);

  const stats = useMemo(() => {
    const totalRevenue = filteredData.reduce((sum, ticket) => sum + ticket.ticket_value, 0);
    const totalSales = filteredData.length;
    const avgTicket = totalSales > 0 ? totalRevenue / totalSales : 0;
    const avgDeliveryRate = totalSales > 0 
      ? filteredData.reduce((sum, ticket) => sum + ticket.delivery_rate, 0) / totalSales 
      : 0;

    return {
      totalRevenue: `€${totalRevenue.toFixed(2)}`,
      totalSales: totalSales.toString(),
      avgTicket: `€${avgTicket.toFixed(2)}`,
      avgDeliveryRate: `${avgDeliveryRate.toFixed(1)}%`,
    };
  }, [filteredData]);

  const chartData = useMemo(() => {
    const groupedByDate = filteredData.reduce((acc, ticket) => {
      const date = new Date(ticket.sent_at).toLocaleDateString('pt-BR');
      if (!acc[date]) {
        acc[date] = { date, revenue: 0, count: 0 };
      }
      acc[date].revenue += ticket.ticket_value;
      acc[date].count += 1;
      return acc;
    }, {} as Record<string, { date: string; revenue: number; count: number }>);

    return Object.values(groupedByDate).sort((a, b) => 
      new Date(a.date.split('/').reverse().join('-')).getTime() - 
      new Date(b.date.split('/').reverse().join('-')).getTime()
    );
  }, [filteredData]);

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
      <div className="container mx-auto p-4 md:p-8 space-y-8 max-w-7xl">
        <div className="space-y-2 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary-glow to-primary/60 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">Visão geral do sistema de tickets em tempo real</p>
        </div>

        <Card className="p-6 md:p-8 border-2 border-primary/10 bg-gradient-to-br from-card via-card to-primary/5 shadow-lg animate-scale-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1 bg-gradient-to-b from-primary to-primary-glow rounded-full" />
            <h2 className="text-xl font-semibold text-foreground">Filtros de Dados</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2 group">
              <Label htmlFor="start-date" className="text-sm font-medium flex items-center gap-2 text-foreground/80 group-hover:text-primary transition-colors">
                📅 Data Início
              </Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-background/80 border-2 border-border hover:border-primary/50 focus:border-primary transition-all duration-200 shadow-sm"
              />
            </div>

            <div className="space-y-2 group">
              <Label htmlFor="end-date" className="text-sm font-medium flex items-center gap-2 text-foreground/80 group-hover:text-primary transition-colors">
                📅 Data Fim
              </Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-background/80 border-2 border-border hover:border-primary/50 focus:border-primary transition-all duration-200 shadow-sm"
              />
            </div>

            <div className="space-y-2 group">
              <Label htmlFor="min-value" className="text-sm font-medium flex items-center gap-2 text-foreground/80 group-hover:text-primary transition-colors">
                💰 Valor Mínimo (€)
              </Label>
              <Input
                id="min-value"
                type="number"
                step="0.01"
                value={minValue}
                onChange={(e) => setMinValue(e.target.value)}
                className="bg-background/80 border-2 border-border hover:border-primary/50 focus:border-primary transition-all duration-200 shadow-sm"
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2 group">
              <Label htmlFor="max-value" className="text-sm font-medium flex items-center gap-2 text-foreground/80 group-hover:text-primary transition-colors">
                💰 Valor Máximo (€)
              </Label>
              <Input
                id="max-value"
                type="number"
                step="0.01"
                value={maxValue}
                onChange={(e) => setMaxValue(e.target.value)}
                className="bg-background/80 border-2 border-border hover:border-primary/50 focus:border-primary transition-all duration-200 shadow-sm"
                placeholder="100.00"
              />
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
          <StatCard
            title="Faturamento Total"
            value={stats.totalRevenue}
            icon={DollarSign}
          />
          <StatCard
            title="Total de Tickets"
            value={stats.totalSales}
            icon={Package}
          />
          <StatCard
            title="Ticket Médio"
            value={stats.avgTicket}
            icon={TrendingUp}
          />
          <StatCard
            title="Taxa Média de Entrega"
            value={stats.avgDeliveryRate}
            icon={Percent}
          />
        </div>

        <Card className="p-6 md:p-8 border-2 border-primary/10 bg-gradient-to-br from-card via-card to-primary/5 shadow-lg animate-scale-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1 bg-gradient-to-b from-primary to-primary-glow rounded-full" />
            <h2 className="text-xl font-semibold text-foreground">Faturamento ao Longo do Tempo</h2>
          </div>
          <div className="h-[350px] md:h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickMargin={8}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickMargin={8}
                  tickFormatter={(value) => `€${value.toFixed(0)}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                  formatter={(value: number) => [`€${value.toFixed(2)}`, 'Faturamento']}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', r: 5, strokeWidth: 2, stroke: 'hsl(var(--background))' }}
                  activeDot={{ r: 7, strokeWidth: 2 }}
                  fill="url(#colorRevenue)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;