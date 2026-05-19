/* SmartInvest — Interactive behaviors */

(function () {
  'use strict';

  // Navigation helpers
  window.SmartInvest = {
    navigate(path) {
      window.location.href = path;
    },

    openSheet(id) {
      const sheet = document.getElementById(id);
      if (sheet) sheet.classList.add('open');
    },

    closeSheet(id) {
      const sheet = document.getElementById(id);
      if (sheet) sheet.classList.remove('open');
    },

    toggleFavorite(button) {
      const isActive = button.classList.toggle('active');
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      button.innerHTML = isActive
        ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="#9fe870" stroke="#163300" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
        : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
    },

    filterAssets(category) {
      const chips = document.querySelectorAll('.chip[data-category]');
      const assets = document.querySelectorAll('.asset-item[data-type]');

      chips.forEach(chip => chip.classList.toggle('active', chip.dataset.category === category));
      assets.forEach(asset => {
        const show = category === 'all' || asset.dataset.type === category;
        asset.style.display = show ? 'flex' : 'none';
      });
    },

    updateInvestmentAmount(input, price) {
      const amount = parseFloat(input.value) || 0;
      const shares = amount / price;
      const shareEl = document.getElementById('shareEstimate');
      const feeEl = document.getElementById('feeEstimate');
      const totalEl = document.getElementById('totalEstimate');

      if (shareEl) shareEl.textContent = shares.toFixed(4) + ' shares';
      if (feeEl) feeEl.textContent = '$0.00';
      if (totalEl) totalEl.textContent = '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },

    confirmBuy() {
      const sheet = document.getElementById('buySheet');
      const success = document.getElementById('successSheet');
      if (sheet) sheet.classList.remove('open');
      setTimeout(() => {
        if (success) success.classList.add('open');
      }, 180);
    },

    toggleSwitch(el) {
      el.classList.toggle('on');
      el.setAttribute('aria-checked', el.classList.contains('on') ? 'true' : 'false');
    },

    copyAccountId(button) {
      const text = 'SMRT-2026-8149';
      if (navigator.clipboard) navigator.clipboard.writeText(text).catch(() => {});
      const old = button.textContent;
      button.textContent = 'Copied';
      setTimeout(() => { button.textContent = old; }, 1400);
    }
  };

  // Close sheets on overlay click
  document.addEventListener('click', function (e) {
    const overlay = e.target.closest('.sheet-overlay');
    if (overlay && e.target === overlay) {
      overlay.classList.remove('open');
    }
  });

  // Escape closes sheets
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.sheet-overlay.open').forEach(s => s.classList.remove('open'));
    }
  });
})();
