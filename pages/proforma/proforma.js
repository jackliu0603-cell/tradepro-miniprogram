// pages/proforma/proforma.js
const app = getApp();

Page({
  data: {
    showPreview: false,
    form: {
      no: '', date: '', valid: '', terms: 'FOB', from: '', to: '',
      payment: 'T/T 30% deposit, 70% before shipment', currency: 'USD',
      delivery: '', buyerName: '', buyerContact: '', buyerAddr: '',
      buyerTel: '', buyerEmail: '', remarks: '', bank: '',
      items: []
    },
    termsList: ['FOB', 'CFR', 'CIF', 'EXW', 'FCA', 'DAP', 'DDP'],
    paymentList: [
      'T/T 30% deposit, 70% before shipment',
      'T/T 100% in advance',
      'L/C at sight',
      'L/C 60 days',
      'D/P at sight',
      'D/A 60 days'
    ],
    companyName: '',
    companyAddr: '',
    totalAmount: '0.00'
  },

  onLoad() {
    this.loadFormData();
  },

  onShow() {
    this.loadFormData();
  },

  loadFormData() {
    const pi = app.globalData.data.proforma || { items: [] };
    const company = app.globalData.company || {};
    const termsIdx = this.data.termsList.indexOf(pi.terms);
    const payIdx = this.data.paymentList.indexOf(pi.payment);
    this.setData({
      form: {
        ...this.data.form,
        ...pi,
        items: pi.items || [],
        termsIndex: termsIdx >= 0 ? termsIdx : 0,
        paymentIndex: payIdx >= 0 ? payIdx : 0
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
    const list = key === 'terms' ? this.data.termsList : this.data.paymentList;
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
    items.push({ desc: '', spec: '', qty: '', unit: 'PCS', price: '' });
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
    let total = 0;
    const items = this.data.form.items || [];
    items.forEach(item => {
      const qty = parseFloat(item.qty) || 0;
      const price = parseFloat(item.price) || 0;
      item._amt = (qty * price).toFixed(2);
      total += qty * price;
    });
    this.setData({
      'form.items': items,
      totalAmount: total.toFixed(2)
    });
  },

  onSave() {
    this.saveToGlobal();
    wx.showToast({ title: '已保存', icon: 'success' });
  },

  saveToGlobal() {
    app.globalData.data.proforma = this.data.form;
    app.saveData();
  },

  onSync() {
    this.saveToGlobal();
    const count = app.syncFromProforma();
    if (count === 0) {
      wx.showToast({ title: '所有字段已有数据', icon: 'none' });
    } else {
      wx.showToast({ title: '已同步' + count + '个字段', icon: 'success' });
    }
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
      content: '确定清空形式发票数据吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            form: {
              no: '', date: '', valid: '', terms: 'FOB', from: '', to: '',
              payment: 'T/T 30% deposit, 70% before shipment', currency: 'USD',
              delivery: '', buyerName: '', buyerContact: '', buyerAddr: '',
              buyerTel: '', buyerEmail: '', remarks: '', bank: '',
              items: []
            },
            totalAmount: '0.00'
          });
          this.saveToGlobal();
          wx.showToast({ title: '已清空', icon: 'success' });
        }
      }
    });
  }
});
