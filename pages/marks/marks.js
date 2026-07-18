// pages/marks/marks.js
const app = getApp();

Page({
  data: {
    showPreview: false,
    form: {
      consignee: '', port: '', item: '', spec: '', cartonInfo: ''
    },
    companyName: '',
    companyAddr: ''
  },

  onLoad() {
    this.loadFormData();
  },

  onShow() {
    this.loadFormData();
  },

  loadFormData() {
    const mk = app.globalData.data.marks || {};
    const company = app.globalData.company || {};
    this.setData({
      form: { ...this.data.form, ...mk },
      companyName: company.en || company.cn || 'Your Company Name',
      companyAddr: company.address || ''
    });
  },

  onInput(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ ['form.' + key]: e.detail.value });
  },

  onSave() {
    this.saveToGlobal();
    wx.showToast({ title: '已保存', icon: 'success' });
  },

  saveToGlobal() {
    app.globalData.data.marks = this.data.form;
    app.saveData();
  },

  onPreview() {
    if (this.data.showPreview) {
      this.setData({ showPreview: false });
    } else {
      this.saveToGlobal();
      this.setData({ showPreview: true });
    }
  },

  onClear() {
    wx.showModal({
      title: '确认',
      content: '确定清空唛头数据吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            form: {
              consignee: '', port: '', item: '', spec: '', cartonInfo: ''
            }
          });
          this.saveToGlobal();
          wx.showToast({ title: '已清空', icon: 'success' });
        }
      }
    });
  }
});
