// pages/salescontract/salescontract.js
const app = getApp();

Page({
  data: {
    showPreview: false,
    form: {
      no: '', date: '', place: '', terms: 'FOB', from: '', to: '',
      payment: 'T/T 30% deposit, 70% before shipment', delivery: '',
      currency: 'USD', buyerName: '', buyerContact: '', buyerAddr: '',
      buyerTel: '', buyerEmail: '', items: [],
      clause_quality: '', clause_payment: '', clause_shipment: '', clause_insurance: '', clause_claim: ''
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
    clauses: [
      { key: 'quality', label: 'Quality Terms', placeholder: 'Quality guarantee terms...' },
      { key: 'payment', label: 'Payment Terms', placeholder: 'Payment terms...' },
      { key: 'shipment', label: 'Shipment Terms', placeholder: 'Shipment terms...' },
      { key: 'insurance', label: 'Insurance', placeholder: 'Insurance terms...' },
      { key: 'claim', label: 'Claim', placeholder: 'Claim terms...' }
    ],
    companyName: '',
    companyAddr: '',
    totalAmount: '0.00'
  },

  onLoad() { this.loadFormData(); },
  onShow() { this.loadFormData(); },

  loadFormData() {
    const sc = app.globalData.data.salesContract || { items: [] };
    const company = app.globalData.company || {};
    this.setData({
      form: { ...this.data.form, ...sc, items: sc.items || [] },
      companyName: company.en || company.cn || 'Your Company Name',
      companyAddr: company.address || ''
    });
    this.calcTotal();
  },

  onInput(e) {
    this.setData({ ['form.' + e.currentTarget.dataset.key]: e.detail.value });
  },

  onDateChange(e) {
    this.setData({ ['form.' + e.currentTarget.dataset.key]: e.detail.value });
  },

  onPickerChange(e) {
    const key = e.currentTarget.dataset.key;
    const idx = e.detail.value;
    const list = key === 'terms' ? this.data.termsList : this.data.paymentList;
    this.setData({ ['form.' + key]: list[idx] });
  },

  onClauseInput(e) {
    this.setData({ ['form.clause_' + e.currentTarget.dataset.key]: e.detail.value });
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
    this.data.form.items.splice(e.currentTarget.dataset.index, 1);
    this.setData({ 'form.items': this.data.form.items });
    this.calcTotal();
  },

  calcTotal() {
    let total = 0;
    const items = this.data.form.items || [];
    items.forEach(item => {
      total += (parseFloat(item.qty) || 0) * (parseFloat(item.price) || 0);
      item._amt = ((parseFloat(item.qty) || 0) * (parseFloat(item.price) || 0)).toFixed(2);
    });
    this.setData({ 'form.items': items, totalAmount: total.toFixed(2) });
  },

  onSave() {
    app.globalData.data.salesContract = this.data.form;
    app.saveData();
    wx.showToast({ title: '已保存', icon: 'success' });
  },

  onPreview() {
    if (this.data.showPreview) {
      this.setData({ showPreview: false });
    } else {
      this.calcTotal();
      this.setData({ showPreview: true });
    }
  },

  onClear() {
    wx.showModal({
      title: '确认', content: '确定清空销售合同数据吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            form: {
              no: '', date: '', place: '', terms: 'FOB', from: '', to: '',
              payment: 'T/T 30% deposit, 70% before shipment', delivery: '',
              currency: 'USD', buyerName: '', buyerContact: '', buyerAddr: '',
              buyerTel: '', buyerEmail: '', items: [],
              clause_quality: '', clause_payment: '', clause_shipment: '', clause_insurance: '', clause_claim: ''
            },
            totalAmount: '0.00'
          });
          app.globalData.data.salesContract = this.data.form;
          app.saveData();
          wx.showToast({ title: '已清空', icon: 'success' });
        }
      }
    });
  }
});
