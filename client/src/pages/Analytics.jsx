import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import Select from 'react-select';
import api from '../library/api'; 

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

const excelToDate = (serial) => {
  if (!serial || isNaN(serial)) return serial;
  const days = parseInt(serial);
  const date = new Date((days - (25567 + 2)) * 86400 * 1000);
  return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
};

const Analytics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isGridView, setIsGridView] = useState(true);
  
  const [chartLabels, setChartLabels] = useState([]);
  const [generationDatasets, setGenerationDatasets] = useState([]);
  const [revenueDatasets, setRevenueDatasets] = useState([]);
  const [yieldDatasets, setYieldDatasets] = useState([]);
  const [envData, setEnvData] = useState({ co2: 0, trees: 0, coal: 0 });

  const [kpiData, setKpiData] = useState({
    capacityMWp: 0, totalSites: 0, revenueCr: 0, generationMWh: 0, rawGenerationMWh: 0,
    co2Tonnes: 0, treesPlanted: 0, coalTonnes: 0, avgYield: 0, avgCUF: 0
  });

  const [rawChartData, setRawChartData] = useState([]);
  const [targetMWh, setTargetMWh] = useState('');

  // Generate Years Dynamically (from 2017 to Current Year)
  const currentYear = new Date().getFullYear();
  const yearOptionsArray = Array.from({ length: currentYear - 2017 + 1 }, (_, i) => currentYear - i);

  // React Select Options
  const yearOptionsData = yearOptionsArray.map(year => ({ value: year.toString(), label: year.toString() }));

  // Updated Filter States for Multi-Select
  const [siteFilter, setSiteFilter] = useState([]);
  const [yearFilter, setYearFilter] = useState([{ value: currentYear.toString(), label: currentYear.toString() }]);
  const [monthFilter, setMonthFilter] = useState([]);
  const [availableSites, setAvailableSites] = useState([]);
  const monthOptionsData = [
    { value: '0', label: 'January' }, { value: '1', label: 'February' },
    { value: '2', label: 'March' }, { value: '3', label: 'April' },
    { value: '4', label: 'May' }, { value: '5', label: 'June' },
    { value: '6', label: 'July' }, { value: '7', label: 'August' },
    { value: '8', label: 'September' }, { value: '9', label: 'October' },
    { value: '10', label: 'November' }, { value: '11', label: 'December' }
  ];
  const siteOptionsData = availableSites.map(site => ({ value: site, label: site }));

  // 1. Fetch available sites on initial load
  useEffect(() => {
    const fetchSites = async () => {
      try {
        const res = await api.get(`/analytics/sites`);
        if (res.data.success) {
          setAvailableSites(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch sites");
      }
    };
    fetchSites();
  }, []);

  // 2. Fetch main analytics data whenever ANY filter changes
  useEffect(() => {
    fetchAnalyticsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteFilter, yearFilter, monthFilter]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const siteQuery = siteFilter.length > 0 ? siteFilter.map(s => s.value).join(',') : 'All';
      const yearQuery = yearFilter.length > 0 ? yearFilter.map(y => y.value).join(',') : 'All';
      const monthQuery = monthFilter.length > 0 ? monthFilter.map(m => m.value).join(',') : 'All';

      const queryParams = `?siteName=${siteQuery}&year=${yearQuery}&month=${monthQuery}`;
      
      const [kpiRes, chartRes] = await Promise.all([
        api.get(`/analytics/kpi${queryParams}`),
        api.get(`/analytics/charts${queryParams}`)
      ]);

      if (kpiRes.data.success && chartRes.data.success) {
        const kpi = kpiRes.data.data;
        setKpiData({
          capacityMWp: (kpi.totalCapacity / 1000).toFixed(2),
          totalSites: kpi.totalSitesCount,
          revenueCr: (kpi.totalRevenue / 10000000).toFixed(2),
          generationMWh: (kpi.totalGeneration / 1000).toLocaleString('en-IN', { maximumFractionDigits: 1 }),
          rawGenerationMWh: kpi.totalGeneration / 1000,
          co2Tonnes: kpi.totalCO2.toLocaleString('en-IN', { maximumFractionDigits: 1 }),
          treesPlanted: kpi.totalTrees.toLocaleString('en-IN'),
          coalTonnes: kpi.totalCoal.toLocaleString('en-IN', { maximumFractionDigits: 1 }),
          avgYield: (kpi.avgYield || 0).toFixed(2),
          avgCUF: ((kpi.avgCUF || 0) * 100).toFixed(2) 
        });

        setRawChartData(chartRes.data.data);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  // Re-build charts instantly when raw data or target changes
  useEffect(() => {
    if (rawChartData.length === 0) {
      setGenerationDatasets([]);
      setRevenueDatasets([]);
      setYieldDatasets([]);
      return;
    }
    
    const uniqueMonths = [...new Set(rawChartData.map(row => row._id.month))].sort((a, b) => parseInt(a) - parseInt(b));
    setChartLabels(uniqueMonths.map(m => excelToDate(m)));

    const uniqueSites = [...new Set(rawChartData.map(row => row._id.site))].sort();
    const CHART_COLORS = ['#2563eb', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#3b82f6', '#f87171', '#34d399', '#fbbf24', '#a78bfa'];

    const genSets = [];
    const revSets = [];
    const yieldSets = [];

    uniqueSites.forEach((site, index) => {
       const color = CHART_COLORS[index % CHART_COLORS.length];
       
       const genData = uniqueMonths.map(month => {
           const row = rawChartData.find(r => r._id.month === month && r._id.site === site);
           return row ? row.monthlyGeneration : 0;
       });

       const revData = uniqueMonths.map(month => {
           const row = rawChartData.find(r => r._id.month === month && r._id.site === site);
           return row ? row.monthlyRevenue : 0;
       });

       const yldData = uniqueMonths.map(month => {
           const row = rawChartData.find(r => r._id.month === month && r._id.site === site);
           return row ? row.monthlyYield : 0;
       });

       genSets.push({ label: site, data: genData, backgroundColor: color, borderRadius: 6, maxBarThickness: 45 });
       revSets.push({ label: site, data: revData, backgroundColor: color, borderRadius: 6, maxBarThickness: 45 });
       yieldSets.push({ label: site, data: yldData, borderColor: color, backgroundColor: color + '20', fill: true, tension: 0.3, pointBackgroundColor: '#ffffff', pointBorderColor: color, pointBorderWidth: 2, pointRadius: 4 });
    });

    if (targetMWh && !isNaN(targetMWh) && parseFloat(targetMWh) > 0) {
       const monthlyTargetKwh = (parseFloat(targetMWh) * 1000) / uniqueMonths.length;
       genSets.push({
           type: 'line',
           label: 'Target Goal (KWH)',
           data: Array(uniqueMonths.length).fill(monthlyTargetKwh),
           borderColor: '#f43f5e',
           backgroundColor: '#f43f5e',
           borderWidth: 2,
           borderDash: [5, 5],
           fill: false,
           pointRadius: 0,
           tension: 0
       });
    }

    setGenerationDatasets(genSets);
    setRevenueDatasets(revSets);
    setYieldDatasets(yieldSets);

    setEnvData({ 
      co2: rawChartData.reduce((sum, row) => sum + row.monthlyCO2, 0),
      trees: rawChartData.reduce((sum, row) => sum + row.monthlyTrees, 0),
      coal: rawChartData.reduce((sum, row) => sum + (row.monthlyCoal || 0), 0)
    });
  }, [rawChartData, targetMWh]);

  // --- CHART CONFIGURATIONS (Animations kept intact) ---
  const genChartConfig = { labels: chartLabels, datasets: generationDatasets };
  const yieldChartConfig = { labels: chartLabels, datasets: yieldDatasets };
  const revenueChartConfig = { labels: chartLabels, datasets: revenueDatasets };
  const envChartConfig = { labels: ['CO2 Reduced (Tonnes)', 'Coal Saved (Tonnes)'], datasets: [{ data: [envData.co2, envData.coal], backgroundColor: ['#8b5cf6', '#4b5563'], borderWidth: 0, hoverOffset: 4 }]};

  const premiumOptions = { maintainAspectRatio: false, animation: { duration: 800, easing: 'easeOutQuart' }, plugins: { legend: { display: true, position: 'top', labels: { usePointStyle: true, padding: 15 } }, tooltip: { backgroundColor: 'rgba(17, 24, 39, 0.9)', padding: 12, cornerRadius: 8, displayColors: true } }, scales: { x: { grid: { display: false, drawBorder: false }, ticks: { color: '#6b7280' } }, y: { grid: { color: 'rgba(156, 163, 175, 0.2)', borderDash: [5, 5], drawBorder: false }, ticks: { color: '#6b7280', padding: 10 }, beginAtZero: true } }, interaction: { mode: 'index', intersect: false } };
  const doughnutOptions = { maintainAspectRatio: false, cutout: '75%', animation: { duration: 800, easing: 'easeOutQuart' }, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } }, tooltip: { backgroundColor: 'rgba(17, 24, 39, 0.9)', padding: 12, cornerRadius: 8 } } };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl relative">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-base-content">ASSET UNDER MANAGEMENT</h2>
          <p className="text-base-content/70 mt-1">System-wide performance metrics</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="form-control">
            <label className="label cursor-pointer gap-2">
              <span className="label-text text-sm font-medium text-base-content/80">Grid View</span> 
              <input type="checkbox" className="toggle toggle-primary toggle-sm" checked={isGridView} onChange={() => setIsGridView(!isGridView)} />
            </label>
          </div>
          <Link to="/dashboard" className="btn btn-outline btn-sm">Back to Dashboard</Link>
        </div>
      </div>

      {/* NEW Dynamic Filter Bar */}
      <div className="card bg-base-100 shadow-md border border-base-300 mb-8 relative z-10">
        <div className="card-body p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* Dynamic Year Filter */}
            <div>
              <label className="label py-1"><span className="label-text text-xs uppercase font-semibold text-base-content/70">Financial Year</span></label>
              <Select 
                isMulti 
                options={yearOptionsData} 
                value={yearFilter} 
                onChange={setYearFilter} 
                placeholder="All Time" 
                className="text-sm font-medium text-base-content"
                classNamePrefix="select"
                styles={{
                  control: (base) => ({ ...base, borderColor: 'var(--fallback-bc,oklch(var(--bc)/0.2))', backgroundColor: 'transparent', minHeight: '2rem' }),
                  menu: (base) => ({ ...base, zIndex: 9999, backgroundColor: '#ffffff', color: 'var(--fallback-bc,oklch(var(--bc)/1))', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }),
                  multiValue: (base) => ({ ...base, backgroundColor: 'var(--fallback-b2,oklch(var(--b2)/1))' }),
                  multiValueLabel: (base) => ({ ...base, color: 'var(--fallback-bc,oklch(var(--bc)/1))' })
                }}
              />
            </div>

            {/* New Monthly Filter */}
            <div>
              <label className="label py-1"><span className="label-text text-xs uppercase font-semibold text-base-content/70">Monthly Comparison</span></label>
              <Select 
                isMulti 
                options={monthOptionsData} 
                value={monthFilter} 
                onChange={setMonthFilter} 
                placeholder="All Months" 
                className="text-sm font-medium text-base-content"
                classNamePrefix="select"
                styles={{
                  control: (base) => ({ ...base, borderColor: 'var(--fallback-bc,oklch(var(--bc)/0.2))', backgroundColor: 'transparent', minHeight: '2rem' }),
                  menu: (base) => ({ ...base, zIndex: 9999, backgroundColor: '#ffffff', color: 'var(--fallback-bc,oklch(var(--bc)/1))', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }),
                  multiValue: (base) => ({ ...base, backgroundColor: 'var(--fallback-b2,oklch(var(--b2)/1))' }),
                  multiValueLabel: (base) => ({ ...base, color: 'var(--fallback-bc,oklch(var(--bc)/1))' })
                }}
              />
            </div>

            {/* Specific Asset Filter */}
            <div>
              <label className="label py-1"><span className="label-text text-xs uppercase font-semibold text-base-content/70">Specific Asset</span></label>
              <Select 
                isMulti 
                options={siteOptionsData} 
                value={siteFilter} 
                onChange={setSiteFilter} 
                placeholder="System Total (All Sites)" 
                className="text-sm font-medium text-base-content"
                classNamePrefix="select"
                styles={{
                  control: (base) => ({ ...base, borderColor: 'var(--fallback-bc,oklch(var(--bc)/0.2))', backgroundColor: 'transparent', minHeight: '2rem' }),
                  menu: (base) => ({ ...base, zIndex: 9999, backgroundColor: '#ffffff', color: 'var(--fallback-bc,oklch(var(--bc)/1))', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }),
                  multiValue: (base) => ({ ...base, backgroundColor: 'var(--fallback-b2,oklch(var(--b2)/1))' }),
                  multiValueLabel: (base) => ({ ...base, color: 'var(--fallback-bc,oklch(var(--bc)/1))' })
                }}
              />
            </div>
            {/* Target Goal Filter */}
            <div>
              <label className="label py-1"><span className="label-text text-xs uppercase font-semibold text-base-content/70">Target Goal (MWH)</span></label>
              <input 
                type="number" 
                placeholder="Enter Target..." 
                className="input input-bordered input-sm w-full font-medium h-[2rem]" 
                value={targetMWh} 
                onChange={(e) => setTargetMWh(e.target.value)} 
              />
            </div>

          </div>
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 bg-base-200/40 z-50 flex flex-col items-center pt-64 backdrop-blur-[1px]">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-base-content font-medium drop-shadow-md">Crunching data pipeline...</p>
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard title="Installed DC Capacity" value={`${kpiData.capacityMWp} MWp`} />
        <KpiCard title="Total Sites" value={kpiData.totalSites} />
        <KpiCard title="Total Revenue" value={`₹${kpiData.revenueCr} Cr`} highlight />
        <KpiCard 
           title="Total Generation" 
           value={`${kpiData.generationMWh} MWH`} 
           subtitle={targetMWh && parseFloat(targetMWh) > 0 ? `${((kpiData.rawGenerationMWh / parseFloat(targetMWh)) * 100).toFixed(1)}% Achieved` : null}
        />
        <KpiCard title="Avg Specific Yield" value={`${kpiData.avgYield}`} color="text-error" />
        <KpiCard title="Avg AC CUF" value={`${kpiData.avgCUF}%`} />
        <KpiCard title="Coal Saved" value={`${kpiData.coalTonnes} T`} color="text-base-content/70" />
        <KpiCard title="CO2 Reduced" value={`${kpiData.co2Tonnes} T`} color="text-success" />
      </div>

      {/* Charts Row 1 */}
      <div className={`grid grid-cols-1 ${isGridView ? 'lg:grid-cols-2' : ''} gap-6 mb-6`}>
        <div className="card bg-base-100 shadow-xl border border-base-300">
          <div className="card-body p-5">
            <h6 className="card-title text-sm font-semibold text-base-content/70 mb-4 uppercase">Total Generation Trend</h6>
            <div className="relative h-72 w-full"><Bar data={genChartConfig} options={premiumOptions} /></div>
          </div>
        </div>
        <div className="card bg-base-100 shadow-xl border border-base-300">
          <div className="card-body p-5">
            <h6 className="card-title text-sm font-semibold text-base-content/70 mb-4 uppercase">Specific Yield</h6>
            <div className="relative h-72 w-full"><Line data={yieldChartConfig} options={premiumOptions} /></div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className={`grid grid-cols-1 ${isGridView ? 'lg:grid-cols-3' : ''} gap-6 mb-8`}>
        <div className={`card bg-base-100 shadow-xl border border-base-300 ${isGridView ? 'lg:col-span-2' : ''}`}>
          <div className="card-body p-5">
            <h6 className="card-title text-sm font-semibold text-base-content/70 mb-4 uppercase">Revenue Projection</h6>
            <div className="relative h-72 w-full"><Bar data={revenueChartConfig} options={premiumOptions} /></div>
          </div>
        </div>
        <div className="card bg-base-100 shadow-xl border border-base-300">
          <div className="card-body p-5 flex flex-col">
            <h6 className="card-title text-sm font-semibold text-base-content/70 mb-4 uppercase">Environmental Impact</h6>
            <div className="relative grow min-h-50 flex justify-center"><Doughnut data={envChartConfig} options={doughnutOptions} /></div>
            <div className="text-center mt-6 pt-4 border-t border-base-200">
              <h4 className="text-2xl text-success font-bold mb-1">🌲 {kpiData.treesPlanted}</h4>
              <p className="text-xs text-base-content/70 uppercase tracking-wide">Equivalent Trees Planted</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const KpiCard = ({ title, value, subtitle, highlight, color = "text-base-content" }) => (
  <div className={`card shadow-md border ${highlight ? 'bg-neutral text-neutral-content border-neutral' : 'bg-base-100 border-base-300'}`}>
    <div className="card-body p-4 justify-center">
      <h6 className={`text-xs uppercase tracking-wider font-semibold truncate mb-2 ${highlight ? 'text-neutral-content/70' : 'text-base-content/70'}`}>{title}</h6>
      <div className="flex items-baseline gap-2">
        <h4 className={`text-2xl font-bold ${highlight ? 'text-white' : color}`}>{value}</h4>
        {subtitle && <span className={`text-sm font-semibold ${highlight ? 'text-neutral-content/80' : 'text-success'}`}>{subtitle}</span>}
      </div>
    </div>
  </div>
);

export default Analytics;