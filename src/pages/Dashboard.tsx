
import { useState, useEffect } from 'react';
import { useKAK } from '@/contexts/KAKContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { FileText, DollarSign, CalendarClock, ArrowUp, ArrowDown } from 'lucide-react';

// Helper function to format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Helper function to get month name
const getMonthName = (date: string) => {
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const monthIndex = new Date(date).getMonth();
  return monthNames[monthIndex];
};

const Dashboard = () => {
  const { kaks } = useKAK();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Calculate summary data
  const totalKAK = kaks.length;
  const totalAnggaran = kaks.reduce((sum, kak) => sum + kak.paguAnggaran, 0);
  
  // Get current month and year
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  // KAKs in current month
  const currentMonthKAKs = kaks.filter(kak => {
    const pengajuanDate = new Date(kak.tanggalPengajuan);
    return pengajuanDate.getMonth() === currentMonth && 
           pengajuanDate.getFullYear() === currentYear;
  });
  
  const totalCurrentMonthAnggaran = currentMonthKAKs.reduce(
    (sum, kak) => sum + kak.paguAnggaran, 0
  );

  // Data for KAK by type chart
  const kakByTypeData = kaks.reduce((acc: any[], kak) => {
    const existing = acc.find(item => item.name === kak.jenisKAK);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: kak.jenisKAK, value: 1 });
    }
    return acc;
  }, []);

  // Data for budget allocation by program chart
  const budgetByProgramData = kaks.reduce((acc: any[], kak) => {
    const existing = acc.find(item => item.name === kak.programPembebanan);
    if (existing) {
      existing.value += kak.paguAnggaran;
    } else {
      acc.push({ name: kak.programPembebanan, value: kak.paguAnggaran });
    }
    return acc;
  }, []);

  // Data for monthly trend chart
  const monthlyData = kaks.reduce((acc: any, kak) => {
    const month = getMonthName(kak.tanggalPengajuan);
    const pengajuanDate = new Date(kak.tanggalPengajuan);
    const monthYear = `${month} ${pengajuanDate.getFullYear()}`;
    
    if (!acc[monthYear]) {
      acc[monthYear] = {
        month: monthYear,
        count: 0,
        total: 0
      };
    }
    
    acc[monthYear].count += 1;
    acc[monthYear].total += kak.paguAnggaran;
    
    return acc;
  }, {});
  
  const monthlyTrendData = Object.values(monthlyData).sort((a: any, b: any) => {
    const [aMonth, aYear] = a.month.split(' ');
    const [bMonth, bYear] = b.month.split(' ');
    
    const aDate = new Date(`${aMonth} 1, ${aYear}`);
    const bDate = new Date(`${bMonth} 1, ${bYear}`);
    
    return aDate.getTime() - bDate.getTime();
  });

  // Color schemes
  const COLORS = ['#9c2b2e', '#e63946', '#e85d04', '#ee9b00', '#2a9d8f'];
  const CHART_COLORS = {
    primary: 'hsl(355, 83%, 35%)',
    secondary: '#2a9d8f',
    tertiary: '#ee9b00'
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="text-center">
          <div className="animate-pulse h-32 w-32 bg-secondary rounded-full mx-auto flex items-center justify-center mb-6">
            <FileText className="h-16 w-16 text-primary opacity-50" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Memuat Dashboard</h2>
          <p className="text-muted-foreground">Menyiapkan data statistik dan grafik...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KAK Counter */}
        <Card className="staggered-item hover-scale">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Total KAK
                </p>
                <h3 className="text-2xl font-bold">{totalKAK}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Dokumen KAK
                </p>
              </div>
              <div className="bg-primary/10 p-2 rounded-full">
                <FileText className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Total Budget */}
        <Card className="staggered-item hover-scale">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Total Anggaran
                </p>
                <h3 className="text-2xl font-bold">{formatCurrency(totalAnggaran)}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Keseluruhan Anggaran
                </p>
              </div>
              <div className="bg-green-100 p-2 rounded-full">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Current Month Budget */}
        <Card className="staggered-item hover-scale">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Anggaran Bulan Ini
                </p>
                <h3 className="text-2xl font-bold">{formatCurrency(totalCurrentMonthAnggaran)}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date().toLocaleDateString('id-ID', {month: 'long', year: 'numeric'})}
                </p>
              </div>
              <div className="bg-blue-100 p-2 rounded-full">
                <CalendarClock className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Average Budget */}
        <Card className="staggered-item hover-scale">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Rata-rata Anggaran
                </p>
                <h3 className="text-2xl font-bold">
                  {formatCurrency(totalKAK > 0 ? totalAnggaran / totalKAK : 0)}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Per KAK
                </p>
              </div>
              <div className="bg-amber-100 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
                  <path d="M12 20V4" />
                  <path d="M5 12H2" />
                  <path d="M22 12h-3" />
                  <path d="m4.93 4.93 2.83 2.83" />
                  <path d="m16.24 16.24 2.83 2.83" />
                  <path d="m4.93 19.07 2.83-2.83" />
                  <path d="m16.24 7.76 2.83-2.83" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* KAK Submission Trend */}
        <Card className="staggered-item">
          <CardHeader>
            <CardTitle>Tren Pengajuan KAK</CardTitle>
            <CardDescription>
              Jumlah dan total anggaran KAK per bulan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyTrendData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    angle={-45} 
                    textAnchor="end" 
                    height={70}
                  />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value: any, name: string) => {
                      if (name === "KAK") return value;
                      return formatCurrency(value);
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="count"
                    stroke={CHART_COLORS.primary}
                    name="KAK"
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="total"
                    stroke={CHART_COLORS.secondary}
                    name="Total Anggaran"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Budget Allocation by Program */}
        <Card className="staggered-item">
          <CardHeader>
            <CardTitle>Alokasi Anggaran per Program</CardTitle>
            <CardDescription>
              Distribusi anggaran berdasarkan program
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={budgetByProgramData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={100}
                    interval={0}
                  />
                  <YAxis />
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  <Legend />
                  <Bar 
                    dataKey="value" 
                    name="Jumlah Anggaran" 
                    fill={CHART_COLORS.primary}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KAK by Type */}
        <Card className="staggered-item">
          <CardHeader>
            <CardTitle>KAK Berdasarkan Jenis</CardTitle>
            <CardDescription>
              Distribusi jumlah KAK per jenis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={kakByTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {kakByTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any, name: any) => [value, name]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Recent KAK Activity */}
        <Card className="col-span-1 lg:col-span-2 staggered-item">
          <CardHeader>
            <CardTitle>Aktivitas KAK Terbaru</CardTitle>
            <CardDescription>
              KAK yang terakhir diajukan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {kaks.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Belum ada data KAK</p>
                </div>
              ) : (
                kaks
                  .sort((a, b) => new Date(b.tanggalPengajuan).getTime() - new Date(a.tanggalPengajuan).getTime())
                  .slice(0, 5)
                  .map((kak, index) => (
                    <div 
                      key={kak.id}
                      className="flex items-start space-x-4 p-3 rounded-lg bg-secondary/50"
                    >
                      <div className="bg-primary/10 p-2 rounded-full flex-shrink-0">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium truncate">
                            {kak.jenisKAK}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {new Date(kak.tanggalPengajuan).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mb-1">
                          {kak.komponenOutput}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold">
                            {formatCurrency(kak.paguAnggaran)}
                          </p>
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                            {kak.items.length} item
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
