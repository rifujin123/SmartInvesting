// SmartInvest Shared Utilities

// 1. Mock Portfolio & Market Data
const MOCK_DATA = {
  portfolio: {
    totalValue: 12450.75,
    todayChangePercent: 1.84,
    todayChangeValue: 224.50,
    invested: 11000.00,
    gainPercent: 13.18,
    gainValue: 1450.75,
    cash: 1450.00 // Cash balance that cannot be topped up or paid out! (Only used from assets/liquidations)
  },
  holdings: [
    { id: 'AAPL', name: 'Apple Inc.', category: 'Stock', shares: 12.5, avgPrice: 165.20, currentPrice: 184.50, logo: '🍏', color: '#163300' },
    { id: 'VOO', name: 'Vanguard S&P 500 ETF', category: 'ETF', shares: 15.2, avgPrice: 380.00, currentPrice: 425.10, logo: '📈', color: '#054d28' },
    { id: 'MSFT', name: 'Microsoft Corp.', category: 'Stock', shares: 4.8, avgPrice: 310.50, currentPrice: 350.20, logo: '💻', color: '#0e0f0c' },
    { id: 'VTI', name: 'Vanguard Total Stock Market', category: 'ETF', shares: 6.0, avgPrice: 205.00, currentPrice: 220.80, logo: '📊', color: '#868685' }
  ],
  explore: [
    { id: 'AAPL', name: 'Apple Inc.', category: 'Stock', price: 184.50, change: 1.25, popular: true, description: 'Design and manufacture of mobile communication and media devices, personal computers, and portable digital music players.' },
    { id: 'VOO', name: 'Vanguard S&P 500 ETF', category: 'ETF', price: 425.10, change: 0.85, popular: true, description: 'Tracks the S&P 500 Index, representing 500 of the largest U.S. companies across all major industries.' },
    { id: 'MSFT', name: 'Microsoft Corporation', category: 'Stock', price: 350.20, change: 2.10, popular: true, description: 'Global developer of software, services, devices, and solutions.' },
    { id: 'VTI', name: 'Vanguard Total Stock Market', category: 'ETF', price: 220.80, change: 0.45, popular: false, description: 'Broadly diversified index fund holding thousands of US stocks.' },
    { id: 'TSLA', name: 'Tesla Inc.', category: 'Stock', price: 218.60, change: -3.40, popular: true, description: 'Designs and manufactures electric vehicles, battery energy storage from home to grid-scale.' },
    { id: 'NVDA', name: 'NVIDIA Corporation', category: 'Stock', price: 485.30, change: 5.80, popular: true, description: 'Pioneer of GPU-accelerated computing, AI chips, and graphics processing units.' },
    { id: 'VXUS', name: 'Vanguard Total International Stock', category: 'ETF', price: 58.20, change: -0.20, popular: false, description: 'Provides exposure to international equity markets excluding the US.' },
    { id: 'BND', name: 'Vanguard Total Bond Market ETF', category: 'ETF', price: 71.40, change: 0.10, popular: false, description: 'Tracks a broad, market-weighted index of US dollar-denominated investment-grade bonds.' }
  ],
  transactions: [
    { id: 'TX001', type: 'Buy', asset: 'VOO', name: 'Vanguard S&P 500 ETF', shares: 1.5, amount: 637.65, date: '2026-05-14', status: 'Completed' },
    { id: 'TX002', type: 'Buy', asset: 'AAPL', name: 'Apple Inc.', shares: 2.0, amount: 369.00, date: '2026-05-10', status: 'Completed' },
    { id: 'TX003', type: 'Buy', asset: 'MSFT', name: 'Microsoft Corp.', shares: 0.5, amount: 175.10, date: '2026-05-02', status: 'Completed' }
  ]
};

// 2. LocalStorage helper
const store = {
  get: (key, fallback) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      return fallback;
    }
  },
  set: (key, val) => {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.error(e);
    }
  }
};

// 3. Initialize state
let appState = store.get('smartinvest_state', MOCK_DATA);

function saveState() {
  store.set('smartinvest_state', appState);
}

// 4. Formatting helper functions
function formatCurrency(val) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
}

function formatPercent(val) {
  const plus = val >= 0 ? '+' : '';
  return `${plus}${val.toFixed(2)}%`;
}

function formatShares(val) {
  return val.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 4 });
}

// Share functions globally
window.SmartInvest = {
  MOCK_DATA,
  appState,
  saveState,
  formatCurrency,
  formatPercent,
  formatShares
};
