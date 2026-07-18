// pages/spec/spec.js
const app = getApp();

Page({
  data: {
    showPreview: false,
    form: {
      name: '', brand: '', model: '', origin: '', material: '',
      size: '', weight: '', package: '', description: ''
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
    const sp = app.globalData.data.spec || {};
    const company = app.globalData.company || {};
    this.setData({
      form: { ...this.data.form, ...sp },
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
    app.globalData.data.spec = this.data.form;
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
      content: '确定清空规格书数据吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            form: {
              name: '', brand: '', model: '', origin: '', material: '',
              size: '', weight: '', package: '', description: ''
            }
          });
          this.saveToGlobal();
          wx.showToast({ title: '已清空', icon: 'success' });
        }
      }
    });
  }
});
