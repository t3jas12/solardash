import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
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
  
  const [chartLabels, setChartLabels] = useState([]);
  const [generationData, setGenerationData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [yieldData, setYieldData] = useState([]);
  const [envData, setEnvData] = useState({ co2: 0, trees: 0, coal: 0 });

  const [kpiData, setKpiData] = useState({
    capacityMWp: 0, totalSites: 0, revenueCr: 0, generationMWh: 0, 
    co2Tonnes: 0, treesPlanted: 0, coalTonnes: 0, avgYield: 0, avgCUF: 0
  });

  // Updated Filter States
  const [siteFilter, setSiteFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');
  const [monthFilter, setMonthFilter] = useState('All');
  const [availableSites, setAvailableSites] = useState([]);

  // Generate Years Dynamically (from 2017 to Current Year)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 2017 + 1 }, (_, i) => currentYear - i);

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
      const queryParams = `?siteName=${siteFilter}&year=${yearFilter}&month=${monthFilter}`;
      
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
          co2Tonnes: kpi.totalCO2.toLocaleString('en-IN', { maximumFractionDigits: 1 }),
          treesPlanted: kpi.totalTrees.toLocaleString('en-IN'),
          coalTonnes: kpi.totalCoal.toLocaleString('en-IN', { maximumFractionDigits: 1 }),
          avgYield: (kpi.avgYield || 0).toFixed(2),
          avgCUF: ((kpi.avgCUF || 0) * 100).toFixed(2) 
        });

        const charts = chartRes.data.data;
        setChartLabels(charts.map(row => excelToDate(row._id)));
        setGenerationData(charts.map(row => row.monthlyGeneration));
        setRevenueData(charts.map(row => row.monthlyRevenue));
        setYieldData(charts.map(row => row.monthlyYield));

        setEnvData({ 
          co2: charts.reduce((sum, row) => sum + row.monthlyCO2, 0),
          trees: charts.reduce((sum, row) => sum + row.monthlyTrees, 0),
          coal: charts.reduce((sum, row) => sum + (row.monthlyCoal || 0), 0)
        });
      }
    } catch (error) {
      if (error.response && error.response.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  // --- CHART CONFIGURATIONS (Animations kept intact) ---
  const genChartConfig = { labels: chartLabels, datasets: [{ label: 'Generation (KWH)', data: generationData, backgroundColor: 'rgba(37, 99, 235, 0.85)', hoverBackgroundColor: 'rgba(37, 99, 235, 1)', borderRadius: 6, borderSkipped: false, maxBarThickness: 45 }]};
  const yieldChartConfig = { labels: chartLabels, datasets: [{ label: 'Specific Yield', data: yieldData, borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', fill: true, tension: 0.3, pointBackgroundColor: '#ffffff', pointBorderColor: '#ef4444', pointBorderWidth: 2, pointRadius: 4 }]};
  const revenueChartConfig = { labels: chartLabels, datasets: [{ label: 'Revenue (INR)', data: revenueData, backgroundColor: 'rgba(16, 185, 129, 0.85)', hoverBackgroundColor: 'rgba(16, 185, 129, 1)', borderRadius: 6, borderSkipped: false, maxBarThickness: 45 }]};
  const envChartConfig = { labels: ['CO2 Reduced (Tonnes)', 'Coal Saved (Tonnes)'], datasets: [{ data: [envData.co2, envData.coal], backgroundColor: ['#8b5cf6', '#4b5563'], borderWidth: 0, hoverOffset: 4 }]};

  const premiumOptions = { maintainAspectRatio: false, animation: { duration: 800, easing: 'easeOutQuart' }, plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(17, 24, 39, 0.9)', padding: 12, cornerRadius: 8, displayColors: false } }, scales: { x: { grid: { display: false, drawBorder: false }, ticks: { color: '#6b7280' } }, y: { grid: { color: 'rgba(156, 163, 175, 0.2)', borderDash: [5, 5], drawBorder: false }, ticks: { color: '#6b7280', padding: 10 }, beginAtZero: true } }, interaction: { mode: 'index', intersect: false } };
  const doughnutOptions = { maintainAspectRatio: false, cutout: '75%', animation: { duration: 800, easing: 'easeOutQuart' }, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } }, tooltip: { backgroundColor: 'rgba(17, 24, 39, 0.9)', padding: 12, cornerRadius: 8 } } };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl relative">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-base-content">ASSET UNDER MANAGEMENT</h2>
          <p className="text-base-content/70 mt-1">System-wide performance metrics</p>
        </div>
        <Link to="/dashboard" className="btn btn-outline btn-sm">Back to Dashboard</Link>
      </div>

      {/* NEW Dynamic 3-Column Filter Bar */}
      <div className="card bg-base-100 shadow-md border border-base-300 mb-8 relative z-10">
        <div className="card-body p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Dynamic Year Filter */}
            <div>
              <label className="label py-1"><span className="label-text text-xs uppercase font-semibold text-base-content/70">Financial Year</span></label>
              <select className="select select-bordered select-sm w-full font-medium" value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
                <option value="All">All Time</option>
                {yearOptions.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* New Monthly Filter */}
            <div>
              <label className="label py-1"><span className="label-text text-xs uppercase font-semibold text-base-content/70">Monthly Comparison</span></label>
              <select className="select select-bordered select-sm w-full font-medium" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
                <option value="All">All Months</option>
                <option value="0">January</option>
                <option value="1">February</option>
                <option value="2">March</option>
                <option value="3">April</option>
                <option value="4">May</option>
                <option value="5">June</option>
                <option value="6">July</option>
                <option value="7">August</option>
                <option value="8">September</option>
                <option value="9">October</option>
                <option value="10">November</option>
                <option value="11">December</option>
              </select>
            </div>

            {/* Specific Asset Filter */}
            <div>
              <label className="label py-1"><span className="label-text text-xs uppercase font-semibold text-base-content/70">Specific Asset</span></label>
              <select className="select select-bordered select-sm w-full font-medium" value={siteFilter} onChange={(e) => setSiteFilter(e.target.value)}>
                <option value="All">System Total (All Sites)</option>
                {availableSites.map(site => (
                  <option key={site} value={site}>{site}</option>
                ))}
              </select>
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
        <KpiCard title="Total Generation" value={`${kpiData.generationMWh} MWH`} />
        <KpiCard title="Avg Specific Yield" value={`${kpiData.avgYield}`} color="text-error" />
        <KpiCard title="Avg AC CUF" value={`${kpiData.avgCUF}%`} />
        <KpiCard title="Coal Saved" value={`${kpiData.coalTonnes} T`} color="text-base-content/70" />
        <KpiCard title="CO2 Reduced" value={`${kpiData.co2Tonnes} T`} color="text-success" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="card bg-base-100 shadow-xl border border-base-300 lg:col-span-2">
          <div className="card-body p-5">
            <h6 className="card-title text-sm font-semibold text-base-content/70 mb-4 uppercase">Revenue Projection</h6>
            <div className="relative h-72 w-full"><Bar data={revenueChartConfig} options={premiumOptions} /></div>
          </div>
        </div>
        <div className="card bg-base-100 shadow-xl border border-base-300">
          <div className="card-body p-5 flex flex-col">
            <h6 className="card-title text-sm font-semibold text-base-content/70 mb-4 uppercase">Environmental Impact</h6>
            <div className="relative flex-grow min-h-[200px] flex justify-center"><Doughnut data={envChartConfig} options={doughnutOptions} /></div>
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

const KpiCard = ({ title, value, highlight, color = "text-base-content" }) => (
  <div className={`card shadow-md border ${highlight ? 'bg-neutral text-neutral-content border-neutral' : 'bg-base-100 border-base-300'}`}>
    <div className="card-body p-4 justify-center">
      <h6 className={`text-xs uppercase tracking-wider font-semibold truncate mb-2 ${highlight ? 'text-neutral-content/70' : 'text-base-content/70'}`}>{title}</h6>
      <h4 className={`text-2xl font-bold ${highlight ? 'text-white' : color}`}>{value}</h4>
    </div>
  </div>
);

export default Analytics;