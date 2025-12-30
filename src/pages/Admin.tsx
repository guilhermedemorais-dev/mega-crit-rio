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
  Check,
  X,
  Database,
  Upload,
  RefreshCw,
  FileSpreadsheet,
  Globe,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

interface PaymentMethod {
  id: string;
  name: string;
  provider: "stripe" | "mercadopago" | "lastlink" | "pix" | "custom";
  enabled: boolean;
  apiKey?: string;
  secretKey?: string;
}

interface LotteryResult {
  concurso: number;
  data: string;
  numeros: number[];
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

  const [lotteryResults, setLotteryResults] = useState<LotteryResult[]>([
    { concurso: 2800, data: "2024-01-13", numeros: [4, 12, 23, 34, 45, 58] },
    { concurso: 2799, data: "2024-01-10", numeros: [7, 15, 22, 31, 49, 56] },
    { concurso: 2798, data: "2024-01-06", numeros: [3, 18, 25, 37, 42, 51] },
  ]);

  const [isImporting, setIsImporting] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [lastSync, setLastSync] = useState<string | null>("2024-01-15 14:32");
  const [autoSync, setAutoSync] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFetchFromCaixa = async () => {
    setIsFetching(true);
    // Simular busca da API da Caixa
    await new Promise((resolve) => setTimeout(resolve, 3000));
    
    // Adicionar resultado fictício
    const newResult: LotteryResult = {
      concurso: 2801,
      data: new Date().toISOString().split('T')[0],
      numeros: [8, 17, 26, 33, 44, 52],
    };
    
    setLotteryResults([newResult, ...lotteryResults]);
    setLastSync(new Date().toLocaleString('pt-BR'));
    setIsFetching(false);
    
    toast({
      title: "Sincronização concluída",
      description: "Resultados atualizados com sucesso da Caixa.",
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!validTypes.includes(file.type) && !file.name.endsWith('.csv')) {
      toast({
        title: "Formato inválido",
        description: "Por favor, envie um arquivo CSV ou Excel.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    setImportProgress(0);

    // Simular processamento do arquivo
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      setImportProgress(i);
    }

    // Simular adição de resultados
    const newResults: LotteryResult[] = [
      { concurso: 2802, data: "2024-01-17", numeros: [2, 14, 28, 35, 47, 59] },
      { concurso: 2801, data: "2024-01-15", numeros: [8, 17, 26, 33, 44, 52] },
    ];

    setLotteryResults([...newResults, ...lotteryResults]);
    setIsImporting(false);
    setImportProgress(0);
    
    // Limpar input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    toast({
      title: "Importação concluída",
      description: `${newResults.length} novos resultados foram importados.`,
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
        <Tabs defaultValue="data" className="space-y-6">
          <TabsList className="bg-secondary">
            <TabsTrigger value="data" className="gap-2">
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline">Dados</span>
            </TabsTrigger>
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

          {/* Data Tab - NEW */}
          <TabsContent value="data" className="space-y-6">
            {/* Import Section */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Automatic Fetch */}
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Buscar da Caixa</h3>
                    <p className="text-sm text-muted-foreground">Atualização automática</p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  Busca os resultados mais recentes diretamente do site da Caixa Econômica Federal.
                </p>

                {lastSync && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    Última sincronização: {lastSync}
                  </div>
                )}

                <Button
                  variant="cta"
                  className="w-full mb-4"
                  onClick={handleFetchFromCaixa}
                  disabled={isFetching}
                >
                  {isFetching ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Sincronizar agora
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <p className="text-sm font-medium text-foreground">Sincronização automática</p>
                    <p className="text-xs text-muted-foreground">Atualiza a cada 6 horas</p>
                  </div>
                  <Switch checked={autoSync} onCheckedChange={setAutoSync} />
                </div>
              </div>

              {/* Manual Import */}
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Importar Planilha</h3>
                    <p className="text-sm text-muted-foreground">Upload manual</p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  Faça upload de um arquivo CSV ou Excel com os resultados históricos da Mega-Sena.
                </p>

                <div className="bg-secondary/30 rounded-lg p-4 mb-4">
                  <p className="text-xs text-muted-foreground mb-2">
                    <strong>Formato esperado:</strong>
                  </p>
                  <code className="text-xs text-foreground">
                    concurso, data, n1, n2, n3, n4, n5, n6
                  </code>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />

                {isImporting ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Processando...</span>
                      <span className="text-accent font-medium">{importProgress}%</span>
                    </div>
                    <Progress value={importProgress} className="h-2" />
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4" />
                    Selecionar arquivo
                  </Button>
                )}
              </div>
            </div>

            {/* Results Table */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Resultados Importados
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {lotteryResults.length} sorteios na base de dados
                  </p>
                </div>
                <Select defaultValue="recent">
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Ordenar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Mais recentes</SelectItem>
                    <SelectItem value="oldest">Mais antigos</SelectItem>
                    <SelectItem value="concurso">Por concurso</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Concurso</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Números Sorteados</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lotteryResults.map((result) => (
                      <TableRow key={result.concurso}>
                        <TableCell className="font-mono font-medium">
                          #{result.concurso}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {result.data}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1.5">
                            {result.numeros.map((num, idx) => (
                              <span
                                key={idx}
                                className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium"
                              >
                                {num.toString().padStart(2, "0")}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-center mt-6">
                <Button variant="ghost" size="sm">
                  Carregar mais resultados
                </Button>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground mb-1">
                  Fonte oficial dos dados
                </p>
                <p className="text-sm text-muted-foreground">
                  Os resultados são obtidos diretamente da{" "}
                  <a
                    href="https://loterias.caixa.gov.br/Paginas/Mega-Sena.aspx"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    Caixa Econômica Federal
                  </a>
                  . A sincronização automática garante dados sempre atualizados para a análise estatística.
                </p>
              </div>
            </div>
          </TabsContent>

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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Cartões</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockTransactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="font-mono text-foreground">
                          {tx.id}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {tx.date}
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                          R$ {tx.amount.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {tx.cards}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {tx.method}
                        </TableCell>
                        <TableCell>{getStatusBadge(tx.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
