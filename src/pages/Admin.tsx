import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  CreditCard,
  DollarSign,
  Settings,
  TrendingUp,
  Users,
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface PaymentMethod {
  id: string;
  name: string;
  provider: "stripe" | "mercadopago" | "lastlink" | "pix" | "custom";
  enabled: boolean;
  apiKey?: string;
  secretKey?: string;
}

const Admin = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: "1", name: "Stripe", provider: "stripe", enabled: true },
    { id: "2", name: "Mercado Pago", provider: "mercadopago", enabled: false },
    { id: "3", name: "Lastlink", provider: "lastlink", enabled: false },
    { id: "4", name: "PIX", provider: "pix", enabled: true },
  ]);

  const [prices, setPrices] = useState({
    card1: "6.00",
    card5: "25.00",
    card10: "45.00",
  });

  const mockStats = {
    totalRevenue: 12540.0,
    todayRevenue: 456.0,
    totalSales: 2089,
    todaySales: 76,
    activeUsers: 1543,
  };

  const mockTransactions = [
    { id: "TRX001", date: "2024-01-15", amount: 25.0, cards: 5, status: "completed", method: "PIX" },
    { id: "TRX002", date: "2024-01-15", amount: 6.0, cards: 1, status: "completed", method: "Stripe" },
    { id: "TRX003", date: "2024-01-15", amount: 45.0, cards: 10, status: "pending", method: "Mercado Pago" },
    { id: "TRX004", date: "2024-01-14", amount: 25.0, cards: 5, status: "completed", method: "PIX" },
    { id: "TRX005", date: "2024-01-14", amount: 6.0, cards: 1, status: "failed", method: "Stripe" },
  ];

  const togglePaymentMethod = (id: string) => {
    setPaymentMethods((prev) =>
      prev.map((pm) =>
        pm.id === id ? { ...pm, enabled: !pm.enabled } : pm
      )
    );
    toast({
      title: "Configuração atualizada",
      description: "O método de pagamento foi atualizado.",
    });
  };

  const handleSaveSettings = () => {
    toast({
      title: "Configurações salvas",
      description: "Todas as alterações foram salvas com sucesso.",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-success/10 text-success text-xs font-medium">
            <Check className="w-3 h-3" />
            Concluído
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-warning/10 text-warning text-xs font-medium">
            Pendente
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-medium">
            <X className="w-3 h-3" />
            Falhou
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Voltar ao site</span>
            </Link>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">Admin</span>
            </div>
          </div>

          <Button variant="cta" size="sm" onClick={handleSaveSettings}>
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">Salvar alterações</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs">Receita Total</span>
            </div>
            <p className="text-xl md:text-2xl font-bold text-foreground">
              R$ {mockStats.totalRevenue.toLocaleString("pt-BR")}
            </p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <TrendingUp className="w-4 h-4 text-accent" />
              <span className="text-xs">Receita Hoje</span>
            </div>
            <p className="text-xl md:text-2xl font-bold text-accent">
              R$ {mockStats.todayRevenue.toLocaleString("pt-BR")}
            </p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <CreditCard className="w-4 h-4" />
              <span className="text-xs">Vendas Total</span>
            </div>
            <p className="text-xl md:text-2xl font-bold text-foreground">
              {mockStats.totalSales}
            </p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <CreditCard className="w-4 h-4 text-accent" />
              <span className="text-xs">Vendas Hoje</span>
            </div>
            <p className="text-xl md:text-2xl font-bold text-accent">
              {mockStats.todaySales}
            </p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Users className="w-4 h-4" />
              <span className="text-xs">Usuários Ativos</span>
            </div>
            <p className="text-xl md:text-2xl font-bold text-foreground">
              {mockStats.activeUsers}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="payments" className="space-y-6">
          <TabsList className="bg-secondary">
            <TabsTrigger value="payments" className="gap-2">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Pagamentos</span>
            </TabsTrigger>
            <TabsTrigger value="cashflow" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Fluxo de Caixa</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Configurações</span>
            </TabsTrigger>
          </TabsList>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">
                Métodos de Pagamento
              </h2>

              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          method.enabled
                            ? "bg-accent/10 text-accent"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {method.name}
                        </p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {method.provider}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Button variant="ghost" size="sm">
                        Configurar
                      </Button>
                      <Switch
                        checked={method.enabled}
                        onCheckedChange={() => togglePaymentMethod(method.id)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="outline" className="mt-6">
                <Plus className="w-4 h-4" />
                Adicionar método
              </Button>
            </div>

            {/* Price Configuration */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">
                Preços dos Cartões
              </h2>

              <div className="grid sm:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="card1">1 Cartão (3 combinações)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      R$
                    </span>
                    <Input
                      id="card1"
                      value={prices.card1}
                      onChange={(e) =>
                        setPrices({ ...prices, card1: e.target.value })
                      }
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="card5">5 Cartões (15 combinações)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      R$
                    </span>
                    <Input
                      id="card5"
                      value={prices.card5}
                      onChange={(e) =>
                        setPrices({ ...prices, card5: e.target.value })
                      }
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="card10">10 Cartões (30 combinações)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      R$
                    </span>
                    <Input
                      id="card10"
                      value={prices.card10}
                      onChange={(e) =>
                        setPrices({ ...prices, card10: e.target.value })
                      }
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Cash Flow Tab */}
          <TabsContent value="cashflow" className="space-y-6">
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">
                  Transações Recentes
                </h2>
                <Select defaultValue="7d">
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Hoje</SelectItem>
                    <SelectItem value="7d">Últimos 7 dias</SelectItem>
                    <SelectItem value="30d">Últimos 30 dias</SelectItem>
                    <SelectItem value="all">Tudo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        ID
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Data
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Valor
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Cartões
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Método
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockTransactions.map((tx) => (
                      <tr
                        key={tx.id}
                        className="border-b border-border hover:bg-secondary/30 transition-colors"
                      >
                        <td className="py-3 px-4 text-sm font-mono text-foreground">
                          {tx.id}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {tx.date}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-foreground">
                          R$ {tx.amount.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {tx.cards}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {tx.method}
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(tx.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">
                Configurações Gerais
              </h2>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">
                      Modo de manutenção
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Desabilita vendas temporariamente
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="h-px bg-border" />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">
                      Notificações por email
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Receber alertas de novas vendas
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="h-px bg-border" />

                <div className="space-y-2">
                  <Label htmlFor="webhook">URL do Webhook (API externa)</Label>
                  <Input
                    id="webhook"
                    placeholder="https://api.exemplo.com/generate"
                  />
                  <p className="text-xs text-muted-foreground">
                    Endpoint POST para gerar combinações
                  </p>
                </div>
              </div>
            </div>

            {/* API Keys Section */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">
                Chaves de API
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="stripe-key">Stripe Secret Key</Label>
                  <Input
                    id="stripe-key"
                    type="password"
                    placeholder="sk_live_..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mp-key">Mercado Pago Access Token</Label>
                  <Input
                    id="mp-key"
                    type="password"
                    placeholder="APP_USR-..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastlink-key">Lastlink API Key</Label>
                  <Input
                    id="lastlink-key"
                    type="password"
                    placeholder="..."
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
