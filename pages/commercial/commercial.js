// pages/commercial/commercial.js
const app = getApp();

Page({
  data: {
    showPreview: false,
    form: {
      no: '', date: '', contract: '', lc: '', terms: 'FOB', from: '', to: '',
      currency: 'USD', origin: '', transport: '',
      buyerName: '', buyerContact: '', buyerAddr: '', buyerTel: '', buyerEmail: '',
      items: []
    },
    termsList: ['FOB', 'CFR', 'CIF', 'EXW', 'FCA', 'DAP', 'DDP'],
    transportList: ['By Sea', 'By Air', 'By Land', 'By Rail', 'Multimodal'],
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
    const ci = app.globalData.data.commercial || { items: [] };
    const company = app.globalData.company || {};
    const termsIdx = this.data.termsList.indexOf(ci.terms);
    const transportIdx = this.data.transportList.indexOf(ci.transport);
    this.setData({
      form: {
        ...this.data.form,
        ...ci,
        items: ci.items || [],
        termsIndex: termsIdx >= 0 ? termsIdx : 0,
        transportIndex: transportIdx >= 0 ? transportIdx : 0
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
    const list = key === 'terms' ? this.data.termsList : this.data.transportList;
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
    items.push({ img: '', desc: '', hs: '', qty: '', unit: 'PCS', price: '' });
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
    app.globalData.data.commercial = this.data.form;
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
      content: '确定清空商业发票数据吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            form: {
              no: '', date: '', contract: '', lc: '', terms: 'FOB', from: '', to: '',
              currency: 'USD', origin: '', transport: '',
              buyerName: '', buyerContact: '', buyerAddr: '', buyerTel: '', buyerEmail: '',
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
