
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
import { FileText, DollarSign, CalendarClock, ArrowUp, ArrowDown, Users } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { formatDate } from '@/lib/utils';

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

type TimeRange = 'all' | 'month' | 'quarter' | 'semester' | 'year' | 'custom';
type DateRange = { start: Date | null; end: Date | null };

const Dashboard = () => {
  const { kaks, loading, fetchKAKs } = useKAK();
  const { user } = useAuth();
  const [filteredKAKs, setFilteredKAKs] = useState(kaks);
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
  const [customDateRange, setCustomDateRange] = useState<DateRange>({ start: null, end: null });

  // Refresh data on mount
  useEffect(() => {
    fetchKAKs();
  }, []);
  
  // Filter KAKs based on selected time range
  useEffect(() => {
    let filtered = [...kaks];
    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = null;
    
    switch (timeRange) {
      case 'month':
        // Current month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'quarter':
        // Current quarter
        const currentQuarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
        endDate = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0);
        break;
      case 'semester':
        // Current semester
        const currentSemester = Math.floor(now.getMonth() / 6);
        startDate = new Date(now.getFullYear(), currentSemester * 6, 1);
        endDate = new Date(now.getFullYear(), (currentSemester + 1) * 6, 0);
        break;
      case 'year':
        // Current year
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      case 'custom':
        // Custom date range
        startDate = customDateRange.start;
        endDate = customDateRange.end;
        break;
      case 'all':
      default:
        // Show all data
        break;
    }
    
    setDateRange({ start: startDate, end: endDate });
    
    // Apply date filter if set
    if (startDate && endDate) {
      filtered = filtered.filter(kak => {
        const kakDate = new Date(kak.tanggalPengajuan);
        return kakDate >= startDate! && kakDate <= endDate!;
      });
    }
    
    setFilteredKAKs(filtered);
  }, [kaks, timeRange, customDateRange]);

  // Calculate summary data
  const totalKAK = filteredKAKs.length;
  const totalAnggaran = filteredKAKs.reduce((sum, kak) => sum + kak.paguAnggaran, 0);
  
  // Get current month and year
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  // KAKs in current month
  const currentMonthKAKs = filteredKAKs.filter(kak => {
    const pengajuanDate = new Date(kak.tanggalPengajuan);
    return pengajuanDate.getMonth() === currentMonth && 
           pengajuanDate.getFullYear() === currentYear;
  });
  
  const totalCurrentMonthAnggaran = currentMonthKAKs.reduce(
    (sum, kak) => sum + kak.paguAnggaran, 0
  );

  // Data for KAK by type chart
  const kakByTypeData = filteredKAKs.reduce((acc: any[], kak) => {
    const existing = acc.find(item => item.name === kak.jenisKAK);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: kak.jenisKAK, value: 1 });
    }
    return acc;
  }, []);

  // Data for budget allocation by activity
  const budgetByActivityData = filteredKAKs.reduce((acc: any[], kak) => {
    const existing = acc.find(item => item.name === kak.kegiatan);
    if (existing) {
      existing.value += kak.paguAnggaran;
    } else {
      acc.push({ name: kak.kegiatan, value: kak.paguAnggaran });
    }
    return acc;
  }, []);

  // Data for users who submitted KAKs
  const userSubmissionData = filteredKAKs.reduce((acc: any[], kak) => {
    const existing = acc.find(item => item.name === kak.createdBy.name);
    if (existing) {
      existing.count += 1;
      existing.totalBudget += kak.paguAnggaran;
    } else {
      acc.push({ 
        name: kak.createdBy.name, 
        count: 1,
        totalBudget: kak.paguAnggaran,
        role: kak.createdBy.role
      });
    }
    return acc;
  }, []);
  
  // Sort by submission count
  userSubmissionData.sort((a, b) => b.count - a.count);

  // Color schemes
  const COLORS = ['#FF9800', '#F57C00', '#EF6C00', '#E65100', '#ED4B00'];
  const CHART_COLORS = {
    primary: '#FF9800',
    secondary: '#E65100',
    tertiary: '#FFB74D'
  };

  const handleCustomDateChange = (field: 'start' | 'end', value: string) => {
    if (!value) return;
    
    const date = new Date(value);
    setCustomDateRange(prev => ({
      ...prev,
      [field]: date
    }));
  };

  const applyCustomDateRange = () => {
    if (customDateRange.start && customDateRange.end) {
      setTimeRange('custom');
    }
  };

  const getDateRangeText = () => {
    if (!dateRange.start || !dateRange.end) return 'Semua Data';
    
    return `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`;
  };

  if (loading) {
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        
        {/* Time range filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <Label className="mr-2">Rentang Waktu:</Label>
            <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Pilih Rentang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Data</SelectItem>
                <SelectItem value="month">Bulanan</SelectItem>
                <SelectItem value="quarter">Triwulanan</SelectItem>
                <SelectItem value="semester">Semesteran</SelectItem>
                <SelectItem value="year">Tahunan</SelectItem>
                <SelectItem value="custom">Kustom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {timeRange === 'custom' && (
            <div className="flex flex-wrap gap-2 items-end">
              <div>
                <Label htmlFor="startDate" className="block mb-1">Tanggal Mulai</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={customDateRange.start ? customDateRange.start.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleCustomDateChange('start', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="endDate" className="block mb-1">Tanggal Akhir</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={customDateRange.end ? customDateRange.end.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleCustomDateChange('end', e.target.value)}
                />
              </div>
              <Button 
                variant="outline" 
                onClick={applyCustomDateRange}
                disabled={!customDateRange.start || !customDateRange.end}
              >
                Terapkan
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {dateRange.start && dateRange.end && (
        <div className="bg-orange-50 p-3 rounded-md border border-orange-200 text-orange-800">
          <p className="text-sm font-medium">Menampilkan data: {getDateRangeText()}</p>
        </div>
      )}
      
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
              <div className="bg-orange-100 p-2 rounded-full">
                <FileText className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Total Budget - Renamed */}
        <Card className="staggered-item hover-scale">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Total Pengajuan Anggaran
                </p>
                <h3 className="text-2xl font-bold">{formatCurrency(totalAnggaran)}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Keseluruhan Anggaran
                </p>
              </div>
              <div className="bg-orange-100 p-2 rounded-full">
                <DollarSign className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Current Month Budget - Renamed */}
        <Card className="staggered-item hover-scale">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Total Pengajuan Anggaran Bulan Ini
                </p>
                <h3 className="text-2xl font-bold">{formatCurrency(totalCurrentMonthAnggaran)}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date().toLocaleDateString('id-ID', {month: 'long', year: 'numeric'})}
                </p>
              </div>
              <div className="bg-orange-100 p-2 rounded-full">
                <CalendarClock className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Average Budget - Renamed */}
        <Card className="staggered-item hover-scale">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Rata-rata Anggaran Diajukan
                </p>
                <h3 className="text-2xl font-bold">
                  {formatCurrency(totalKAK > 0 ? totalAnggaran / totalKAK : 0)}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Per KAK
                </p>
              </div>
              <div className="bg-orange-100 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-600">
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
      
      {/* Charts - Now one per row */}
      <div className="space-y-6">
        {/* Jumlah User Pengajuan KAK */}
        <Card className="staggered-item">
          <CardHeader>
            <CardTitle>Jumlah User Pengajuan KAK</CardTitle>
            <CardDescription>
              User dan jumlah dokumen KAK yang diajukan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={userSubmissionData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={70}
                    interval={0}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any, name: string) => {
                      if (name === "Jumlah KAK") return value;
                      return formatCurrency(value);
                    }}
                    labelFormatter={(value) => `${value} (${userSubmissionData.find(item => item.name === value)?.role || ''})`}
                  />
                  <Legend />
                  <Bar 
                    dataKey="count" 
                    name="Jumlah KAK" 
                    fill={CHART_COLORS.primary}
                  />
                  <Bar 
                    dataKey="totalBudget" 
                    name="Total Anggaran" 
                    fill={CHART_COLORS.secondary}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Budget Allocation by Activity */}
        <Card className="staggered-item">
          <CardHeader>
            <CardTitle>Alokasi Anggaran per Kegiatan</CardTitle>
            <CardDescription>
              Distribusi anggaran berdasarkan kegiatan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={budgetByActivityData}
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
                    outerRadius={120}
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
        <Card className="staggered-item">
          <CardHeader>
            <CardTitle>Aktivitas KAK Terbaru</CardTitle>
            <CardDescription>
              KAK yang terakhir diajukan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredKAKs.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Belum ada data KAK</p>
                </div>
              ) : (
                filteredKAKs
                  .sort((a, b) => new Date(b.tanggalPengajuan).getTime() - new Date(a.tanggalPengajuan).getTime())
                  .slice(0, 5)
                  .map((kak, index) => (
                    <div 
                      key={kak.id}
                      className="flex items-start space-x-4 p-3 rounded-lg bg-secondary/50"
                    >
                      <div className="bg-orange-100 p-2 rounded-full flex-shrink-0">
                        <FileText className="h-5 w-5 text-orange-600" />
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
                          <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                            {kak.createdBy.name}
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
