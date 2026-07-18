// app.js
App({
  globalData: {
    company: {},
    data: {
      proforma: { items: [] },
      salesContract: { items: [] },
      commercial: { items: [] },
      packing: { items: [] },
      marks: {},
      spec: {}
    }
  },

  onLaunch() {
    this.loadData();
  },

  // —— 数据持久化 ——
  loadData() {
    try {
      const stored = wx.getStorageSync('tradepro_data');
      if (stored) {
        this.globalData.data = stored;
      }
      const company = wx.getStorageSync('tradepro_company');
      if (company) {
        this.globalData.company = company;
      }
    } catch (e) {
      console.error('loadData error:', e);
    }
  },

  saveData() {
    try {
      wx.setStorageSync('tradepro_data', this.globalData.data);
    } catch (e) {
      console.error('saveData error:', e);
    }
  },

  saveCompany() {
    try {
      wx.setStorageSync('tradepro_company', this.globalData.company);
    } catch (e) {
      console.error('saveCompany error:', e);
    }
  },

  // —— 工具函数 ——
  fmtNum(n, decimals) {
    if (decimals === undefined) decimals = 2;
    const num = parseFloat(n) || 0;
    return num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  },

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  // —— 一键同步：PI → 其他单据 ——
  syncFromProforma() {
    const pi = this.globalData.data.proforma || {};
    if (!pi.no && !pi.buyerName && (!pi.items || pi.items.length === 0)) {
      wx.showToast({ title: '形式发票为空', icon: 'none' });
      return 0;
    }

    let synced = 0;
    const self = this;

    function syncVal(target, key, val) {
      if (!val) return;
      if (!target[key]) {
        target[key] = val;
        synced++;
      }
    }

    const sc = this.globalData.data.salesContract || { items: [] };
    syncVal(sc, 'no', pi.no);
    syncVal(sc, 'date', pi.date);
    syncVal(sc, 'terms', pi.terms);
    syncVal(sc, 'from', pi.from);
    syncVal(sc, 'to', pi.to);
    syncVal(sc, 'payment', pi.payment);
    syncVal(sc, 'delivery', pi.delivery);
    syncVal(sc, 'currency', pi.currency);
    syncVal(sc, 'buyerName', pi.buyerName);
    syncVal(sc, 'buyerContact', pi.buyerContact);
    syncVal(sc, 'buyerAddr', pi.buyerAddr);
    syncVal(sc, 'buyerTel', pi.buyerTel);
    syncVal(sc, 'buyerEmail', pi.buyerEmail);
    this.globalData.data.salesContract = sc;

    const ci = this.globalData.data.commercial || { items: [] };
    syncVal(ci, 'contract', pi.no);
    syncVal(ci, 'date', pi.date);
    syncVal(ci, 'terms', pi.terms);
    syncVal(ci, 'from', pi.from);
    syncVal(ci, 'to', pi.to);
    syncVal(ci, 'currency', pi.currency);
    syncVal(ci, 'buyerName', pi.buyerName);
    syncVal(ci, 'buyerContact', pi.buyerContact);
    syncVal(ci, 'buyerAddr', pi.buyerAddr);
    syncVal(ci, 'buyerTel', pi.buyerTel);
    syncVal(ci, 'buyerEmail', pi.buyerEmail);
    this.globalData.data.commercial = ci;

    const pl = this.globalData.data.packing || { items: [] };
    syncVal(pl, 'invNo', pi.no);
    syncVal(pl, 'date', pi.date);
    syncVal(pl, 'terms', pi.terms);
    syncVal(pl, 'from', pi.from);
    syncVal(pl, 'to', pi.to);
    syncVal(pl, 'buyer', pi.buyerName);
    this.globalData.data.packing = pl;

    const mk = this.globalData.data.marks || {};
    syncVal(mk, 'consignee', pi.buyerName);
    syncVal(mk, 'port', pi.to);
    if (pi.items && pi.items.length > 0) {
      syncVal(mk, 'item', pi.items[0].desc);
      syncVal(mk, 'spec', pi.items[0].spec);
    }
    this.globalData.data.marks = mk;

    const sp = this.globalData.data.spec || {};
    if (pi.items && pi.items.length > 0) {
      syncVal(sp, 'name', pi.items[0].desc);
      syncVal(sp, 'brand', this.globalData.company.en || this.globalData.company.cn || '');
    }
    this.globalData.data.spec = sp;

    // Sync items to SC/CI/PL tables if empty
    if (pi.items && pi.items.length > 0) {
      if (!sc.items || sc.items.length === 0) {
        sc.items = pi.items.map(it => ({
          desc: it.desc, spec: it.spec, qty: it.qty,
          unit: it.unit, price: it.price, img: it.img
        }));
        synced += pi.items.length;
      }
      if (!ci.items || ci.items.length === 0) {
        ci.items = pi.items.map(it => ({
          desc: it.desc, qty: it.qty, unit: it.unit, price: it.price, img: it.img
        }));
        synced += pi.items.length;
      }
      if (!pl.items || pl.items.length === 0) {
        pl.items = pi.items.map((it, i) => ({
          cartonNo: 'C-' + (i + 1), desc: it.desc, qty: it.qty, unit: it.unit
        }));
        synced += pi.items.length;
      }
    }

    this.saveData();
    return synced;
  }
});
