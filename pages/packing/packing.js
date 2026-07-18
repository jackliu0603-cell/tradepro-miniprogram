// pages/packing/packing.js
const app = getApp();

Page({
  data: {
    showPreview: false,
    form: {
      invNo: '', date: '', terms: 'FOB', from: '', to: '', buyer: '',
      items: []
    },
    termsList: ['FOB', 'CFR', 'CIF', 'EXW', 'FCA', 'DAP', 'DDP'],
    companyName: '',
    companyAddr: '',
    totalQty: '0',
    totalNW: '0.00',
    totalGW: '0.00',
    totalCBM: '0.000'
  },

  onLoad() {
    this.loadFormData();
  },

  onShow() {
    this.loadFormData();
  },

  loadFormData() {
    const pl = app.globalData.data.packing || { items: [] };
    const company = app.globalData.company || {};
    const termsIdx = this.data.termsList.indexOf(pl.terms);
    this.setData({
      form: {
        ...this.data.form,
        ...pl,
        items: pl.items || [],
        termsIndex: termsIdx >= 0 ? termsIdx : 0
      },
      companyName: company.en || company.cn || 'Your Company Name',
      companyAddr: company.address || ''
    });
    this.calcTotal();
  },

  onInput(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ ['form.' + key]: e.detail.value });
  },

  onDateChange(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ ['form.' + key]: e.detail.value });
  },

  onPickerChange(e) {
    const key = e.currentTarget.dataset.key;
    const idx = e.detail.value;
    const list = this.data.termsList;
    this.setData({
      ['form.' + key]: list[idx],
      ['form.' + key + 'Index']: idx
    });
  },

  onItemInput(e) {
    const idx = e.currentTarget.dataset.index;
    const key = e.currentTarget.dataset.key;
    this.setData({ ['form.items[' + idx + '].' + key]: e.detail.value });
    this.calcTotal();
  },

  addRow() {
    const items = this.data.form.items || [];
    items.push({ cartonNo: '', desc: '', qty: '', unit: 'PCS', nw: '', gw: '', l: '', w: '', h: '', cbm: '' });
    this.setData({ 'form.items': items });
  },

  delRow(e) {
    const idx = e.currentTarget.dataset.index;
    const items = this.data.form.items;
    items.splice(idx, 1);
    this.setData({ 'form.items': items });
    this.calcTotal();
  },

  calcTotal() {
    let totalQty = 0, totalNW = 0, totalGW = 0, totalCBM = 0;
    const items = this.data.form.items || [];
    items.forEach(item => {
      const qty = parseFloat(item.qty) || 0;
      const nw = parseFloat(item.nw) || 0;
      const gw = parseFloat(item.gw) || 0;
      const l = parseFloat(item.l) || 0;
      const w = parseFloat(item.w) || 0;
      const h = parseFloat(item.h) || 0;
      const cbm = (l * w * h) / 1000000;
      item._cbm = cbm.toFixed(4);
      totalQty += qty;
      totalNW += nw;
      totalGW += gw;
      totalCBM += cbm;
    });
    this.setData({
      'form.items': items,
      totalQty: totalQty.toString(),
      totalNW: totalNW.toFixed(2),
      totalGW: totalGW.toFixed(2),
      totalCBM: totalCBM.toFixed(4)
    });
  },

  onSave() {
    this.saveToGlobal();
    wx.showToast({ title: '已保存', icon: 'success' });
  },

  saveToGlobal() {
    app.globalData.data.packing = this.data.form;
    app.saveData();
  },

  onPreview() {
    if (this.data.showPreview) {
      this.setData({ showPreview: false });
    } else {
      this.saveToGlobal();
      this.calcTotal();
      this.setData({ showPreview: true });
    }
  },

  onClear() {
    wx.showModal({
      title: '确认',
      content: '确定清空装箱单数据吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            form: {
              invNo: '', date: '', terms: 'FOB', from: '', to: '', buyer: '',
              items: []
            },
            totalQty: '0',
            totalNW: '0.00',
            totalGW: '0.00',
            totalCBM: '0.000'
          });
          this.saveToGlobal();
          wx.showToast({ title: '已清空', icon: 'success' });
        }
      }
    });
  }
});
