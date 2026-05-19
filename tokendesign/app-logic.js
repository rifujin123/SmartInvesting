let currentTab = 'dashboard';
let previousTab = 'dashboard';
let currentAsset = null;
let currentFilter = 'all';

function switchTab(tab) {
  if (tab !== 'detail') {
    previousTab = currentTab;
    currentTab = tab;
  }
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + (tab === 'detail' ? 'detail' : tab)).classList.add('active');
  document.querySelectorAll('.tab-item, .nav-item').forEach(t => t.classList.remove('active'));
  const tabEl = document.querySelector('[data-tab="' + tab + '"]');
  if (tabEl) tabEl.classList.add('active');
  document.getElementById('appContent').scrollTop = 0;
}

function renderHoldings() {
  const data = window.SmartInvest.MOCK_DATA;
  const el = document.getElementById('holdingsList');
  el.innerHTML = data.holdings.map(h => {
    const value = h.shares * h.currentPrice;
    const change = ((h.currentPrice - h.avgPrice) / h.avgPrice * 100);
    const isUp = change >= 0;
    return '<div class="holding-row" onclick="openDetail(\'' + h.id + '\')"><div class="holding-icon">' + h.logo + '</div><div class="holding-info"><div class="holding-name">' + h.name + '</div><div class="holding-shares">' + window.SmartInvest.formatShares(h.shares) + ' shares &middot; ' + h.category + '</div></div><div class="holding-value"><div class="holding-price tabular-nums">' + window.SmartInvest.formatCurrency(value) + '</div><div class="holding-change ' + (isUp ? 'text-success' : 'text-danger') + '">' + (isUp ? '+' : '') + change.toFixed(2) + '%</div></div></div>';
  }).join('');
}

function renderExplore(items) {
  const el = document.getElementById('exploreList');
  if (items.length === 0) {
    el.innerHTML = '<div class="empty-state"><p>No results found</p></div>';
    return;
  }
  el.innerHTML = items.map(item => {
    const isUp = item.change >= 0;
    return '<div class="explore-card" onclick="openDetail(\'' + item.id + '\')"><div class="explore-header"><div class="explore-icon">' + (item.category === 'ETF' ? '📊' : '🏢') + '</div><div><div class="explore-name">' + item.name + '</div><div class="explore-ticker">' + item.id + ' &middot; ' + item.category + '</div></div></div><div class="explore-price tabular-nums">' + window.SmartInvest.formatCurrency(item.price) + '</div><span class="badge ' + (isUp ? 'badge-success' : 'badge-danger') + '">' + (isUp ? '+' : '') + item.change.toFixed(2) + '% today</span><div class="explore-desc">' + item.description + '</div></div>';
  }).join('');
}

function setFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  document.querySelector('[data-filter="' + filter + '"]').classList.add('active');
  filterExplore();
}

function filterExplore() {
  const data = window.SmartInvest.MOCK_DATA;
  let items = [...data.explore];
  const search = (document.getElementById('searchInput').value || '').toLowerCase();
  if (search) items = items.filter(i => i.name.toLowerCase().includes(search) || i.id.toLowerCase().includes(search));
  if (currentFilter === 'stock') items = items.filter(i => i.category === 'Stock');
  if (currentFilter === 'etf') items = items.filter(i => i.category === 'ETF');
  if (currentFilter === 'popular') items = items.filter(i => i.popular);
  renderExplore(items);
}

function openDetail(ticker) {
  const data = window.SmartInvest.MOCK_DATA;
  const asset = data.explore.find(a => a.id === ticker) || data.holdings.find(a => a.id === ticker);
  if (!asset) return;
  currentAsset = asset;
  document.getElementById('detailTicker').textContent = asset.id;
  document.getElementById('detailName').textContent = asset.name;
  document.getElementById('detailPrice').textContent = window.SmartInvest.formatCurrency(asset.price || asset.currentPrice);
  const price = asset.price || asset.currentPrice;
  const isUp = asset.change >= 0;
  document.getElementById('detailChange').innerHTML = '<span class="' + (isUp ? 'text-success' : 'text-danger') + '">' + (isUp ? '+' : '') + asset.change.toFixed(2) + '% today</span>';
  document.getElementById('detailAbout').textContent = asset.description || 'Investment asset available for buy-and-hold on SmartInvest.';
  const statsEl = document.getElementById('detailStats');
  const holding = data.holdings.find(h => h.id === ticker);
  let statsHTML = '<div class="detail-stat"><div class="detail-stat-label">Category</div><div class="detail-stat-value">' + asset.category + '</div></div><div class="detail-stat"><div class="detail-stat-label">Today\'s change</div><div class="detail-stat-value tabular-nums ' + (isUp ? 'text-success' : 'text-danger') + '">' + (isUp ? '+' : '') + asset.change.toFixed(2) + '%</div></div>';
  if (holding) {
    statsHTML += '<div class="detail-stat"><div class="detail-stat-label">Your shares</div><div class="detail-stat-value tabular-nums">' + window.SmartInvest.formatShares(holding.shares) + '</div></div><div class="detail-stat"><div class="detail-stat-label">Your avg cost</div><div class="detail-stat-value tabular-nums">' + window.SmartInvest.formatCurrency(holding.avgPrice) + '</div></div>';
  } else {
    statsHTML += '<div class="detail-stat"><div class="detail-stat-label">Min. buy</div><div class="detail-stat-value">1 share</div></div><div class="detail-stat"><div class="detail-stat-label">Fee</div><div class="detail-stat-value">$0.00</div></div>';
  }
  statsEl.innerHTML = statsHTML;
  document.getElementById('buyPricePerShare').textContent = window.SmartInvest.formatCurrency(price);
  document.getElementById('buyAssetName').textContent = asset.name;
  switchTab('detail');
}

function goBack() { switchTab(previousTab); }

function openBuySheet() {
  if (!currentAsset) return;
  document.getElementById('buySharesInput').value = '';
  updateBuySummary();
  document.getElementById('buySheetOverlay').classList.add('open');
}

function closeBuySheet(e) {
  if (e && e.target !== document.getElementById('buySheetOverlay')) return;
  document.getElementById('buySheetOverlay').classList.remove('open');
}

function updateBuySummary() {
  if (!currentAsset) return;
  const shares = parseFloat(document.getElementById('buySharesInput').value) || 0;
  const price = currentAsset.price || currentAsset.currentPrice;
  const total = shares * price;
  document.getElementById('buyTotal').textContent = window.SmartInvest.formatCurrency(total);
}

function confirmBuy() {
  if (!currentAsset) return;
  const shares = parseFloat(document.getElementById('buySharesInput').value) || 0;
  if (shares <= 0) return;
  const price = currentAsset.price || currentAsset.currentPrice;
  const total = shares * price;
  document.getElementById('buySheetOverlay').classList.remove('open');
  document.getElementById('successMsg').textContent = 'You bought ' + window.SmartInvest.formatShares(shares) + ' share' + (shares !== 1 ? 's' : '') + ' of ' + currentAsset.id + ' for ' + window.SmartInvest.formatCurrency(total);
  document.getElementById('successOverlay').classList.add('open');
}

function closeSuccess() {
  document.getElementById('successOverlay').classList.remove('open');
  switchTab(previousTab);
}

function renderTransactions() {
  const data = window.SmartInvest.MOCK_DATA;
  const el = document.getElementById('txList');
  const txs = data.transactions;
  if (txs.length === 0) {
    el.innerHTML = '';
    document.getElementById('txEmpty').style.display = 'block';
    return;
  }
  const grouped = {};
  txs.forEach(tx => {
    if (!grouped[tx.date]) grouped[tx.date] = [];
    grouped[tx.date].push(tx);
  });
  let html = '';
  for (const date in grouped) {
    const items = grouped[date];
    const d = new Date(date);
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    html += '<div class="tx-group-date">' + label + '</div>';
    items.forEach(tx => {
      html += '<div class="tx-row"><div class="tx-icon buy">B</div><div class="tx-info"><div class="tx-name">' + tx.name + '</div><div class="tx-meta">' + window.SmartInvest.formatShares(tx.shares) + ' shares &middot; ' + tx.type + '</div></div><div class="tx-amount"><div class="tx-value tabular-nums">-' + window.SmartInvest.formatCurrency(tx.amount) + '</div><div class="tx-status">' + tx.status + '</div></div></div>';
    });
  }
  el.innerHTML = html;
}

function toggleSwitch(el) {
  const toggle = el.querySelector('.ios-toggle');
  if (toggle) toggle.classList.toggle('on');
}

document.addEventListener('DOMContentLoaded', function() {
  renderHoldings();
  renderExplore(window.SmartInvest.MOCK_DATA.explore);
  renderTransactions();
});

