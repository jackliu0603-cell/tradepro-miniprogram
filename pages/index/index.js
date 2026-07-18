// pages/index/index.js
const app = getApp();

Page({
  goPage(e) {
    const url = e.currentTarget.dataset.url;
    wx.navigateTo({ url });
  },

  syncFromPI() {
    const count = app.syncFromProforma();
    if (count === 0) {
      wx.showToast({ title: '所有字段已有数据', icon: 'none' });
    } else {
      wx.showToast({ title: '已同步' + count + '个字段', icon: 'success' });
    }
  },

  clearAll() {
    wx.showModal({
      title: '确认',
      content: '确定清空所有单据数据吗？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
          app.globalData.data = {
            proforma: { items: [] },
            salesContract: { items: [] },
            commercial: { items: [] },
            packing: { items: [] },
            marks: {},
            spec: {}
          };
          app.saveData();
          wx.showToast({ title: '已清空', icon: 'success' });
        }
      }
    });
  }
});
