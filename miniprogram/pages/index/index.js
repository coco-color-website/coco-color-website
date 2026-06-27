const content = {
  brand: {
    title: "Coco Color",
    subtitle: "色彩诊断 · 整体形象设计",
    heroText:
      "韩国一站式全套形象诊断体系，用专业的色彩科学，找到最适合你的颜色、妆容与风格。"
  },
  teacher: {
    name: "COCO",
    role: "主理人 · 资深形象顾问",
    bio: [
      "COCO 老师拥有韩国系统的形象设计训练背景，累计完成数千例色彩与形象诊断，擅长结合东方肤色特点，给出真正可落地的色彩与造型建议。",
      "每一位顾客都由老师现场亲自诊断，确保结果精准、贴合个人气质。"
    ]
  },
  features: [
    { t: "进口诊断工具", d: "进口顶级工具精准测定肤色基调" },
    { t: "专业诊断师", d: "资深诊断师现场亲自一对一诊断" },
    { t: "终身答疑", d: "诊断后持续线上跟进答疑" }
  ],
  services: [
    { en: "BASIC", zh: "基础色彩测试", desc: "经典八季型定基调，快速了解自身适配色。", price: { COCO: 699, 乐飞: 599 } },
    { en: "PLUS", zh: "进阶色彩测试", desc: "在八季型基础上细分，色彩判断更精准。", price: { COCO: 998, 乐飞: 799 } },
    { en: "ADVANCED", zh: "高阶色彩测试", desc: "二十一季型深度诊断，全维度色彩适配。", price: { COCO: 1098 } },
    { en: "BODY", zh: "骨骼体型诊断", desc: "分析骨骼与体型，定制整体形象设计方案。", price: { COCO: 1098 } },
    { en: "WEDDING", zh: "婚礼诊断", desc: "将色彩诊断、骨骼体型诊断与婚礼场景美学结合，为新娘定制专属婚礼形象方案。", price: { COCO: 1098 } }
  ],
  details: [
    {
      en: "BASIC",
      zh: "基础色彩诊断",
      items: [
        "讲解色彩诊断知识",
        "肤色测量仪诊断肤色",
        "服装色彩诊断【经典八季型定基调】",
        "首饰适配材质诊断",
        "适配发色推荐",
        "现有化妆包筛查 + 适配彩妆推荐",
        "实体纸质诊断报告 / 随身购物参考色卡 / PDF 电子存档报告"
      ]
    },
    {
      en: "PLUS",
      zh: "进阶色彩诊断",
      items: [
        "讲解十二季型与十六季型色彩理论",
        "在经典八季型基础上深入冷暖、明度、纯度三维分析",
        "定位个人专属季型，避免简单「春/夏/秋/冬」一刀切",
        "服装用色范围与禁区色明确标注",
        "眼影、腮红、唇色适配推荐",
        "日常通勤妆与约会/聚会场合妆容区分设计",
        "个人色彩与衣橱单品匹配建议",
        "适配发色与挑染方案建议",
        "首饰材质与配色进阶搭配",
        "季节性衣橱胶囊搭配思路",
        "电子诊断报告 + 随身参考色卡",
        "诊断后 7 日线上答疑跟进"
      ]
    },
    {
      en: "ADVANCED",
      zh: "高阶色彩诊断",
      items: [
        "讲解色彩诊断知识",
        "肤色测量仪诊断肤色",
        "二十一季型色彩定位诊断",
        "骨骼体型诊断",
        "服装色彩诊断",
        "首饰适配材质诊断",
        "适配发色推荐",
        "现有化妆包筛查 + 适配彩妆推荐",
        "美瞳颜色推荐",
        "美甲颜色推荐",
        "纹绣颜色推荐",
        "医美项目推荐",
        "个人形象设计报告",
        "永久线上答疑"
      ]
    },
    {
      en: "BODY",
      zh: "骨骼体型诊断",
      items: [
        "骨骼、肌肉、脂肪三维度体型分析",
        "判断直线型 / 曲线型 / 自然型骨架",
        "肩、背、腰、臀线条比例测量",
        "适合的面料、廓形、图案推荐",
        "H 型 / A 型 / X 型 / O 型外套适配",
        "领型、袖型、裤型适配建议",
        "裙长、腰线与视觉比例平衡法则",
        "鞋包配饰与体型平衡建议",
        "腰臀比优化与显瘦穿搭策略",
        "日常穿搭避雷指南",
        "配饰点位：项链、耳环、腰带建议",
        "四季必备单品购物清单",
        "整体形象设计方案 PDF 报告"
      ]
    },
    {
      en: "WEDDING",
      zh: "婚礼诊断",
      items: [
        "新娘整体形象定制 · 全维度诊断服务",
        "婚前礼服诊断",
        "晨袍色彩版型诊断",
        "中式秀禾色彩版型诊断",
        "晚宴敬酒服专属选型方案",
        "主婚纱精细化专业诊断",
        "身形适配婚纱廓形分析",
        "个人色彩适配婚纱颜色分析",
        "婚纱面料及质感诊断",
        "婚纱领型建议",
        "婚纱袖型建议",
        "婚纱刺绣钉珠装饰适配诊断",
        "婚纱版型剪裁避坑要点解析",
        "婚礼场景造型配套设计",
        "头纱、发饰成套搭配规划",
        "婚礼场地、灯光适配美学方案",
        "手捧花色系与婚纱配色指导",
        "婚纱照拍摄风格精准定位",
        "适配五官的妆容 + 发型全套设计"
      ]
    }
  ],
  process: [
    { step: "01", title: "线上沟通", desc: "了解需求，预约到店时间" },
    { step: "02", title: "现场到诊", desc: "自然光环境，仪器测肤" },
    { step: "03", title: "全彩诊断", desc: "服装 / 妆容 / 配饰逐项分析" },
    { step: "04", title: "诊断报告", desc: "纸质报告 + 色卡 + 电子存档" }
  ],
  contact: {
    address: "广州市天河区 华强路2号 富力盈丰大厦A座 3楼336室",
    hours: "营业时间：11:00 - 18:00",
    phone: "18696690085",
    wechat: "cococolorgz",
    latitude: 23.13,
    longitude: 113.32
  }
};

Page({
  data: {
    ...content,
    cocoServices: content.services.filter((s) => s.price.COCO),
    lefeiServices: content.services.filter((s) => s.price.乐飞),
  },

  // 滚动到「诊断项目」区域
  scrollToProjects() {
    const query = wx.createSelectorQuery();
    query.select("#projects").boundingClientRect();
    query.selectViewport().scrollOffset();
    query.exec((res) => {
      const rect = res[0];
      const scroll = res[1];
      if (rect && scroll) {
        wx.pageScrollTo({ scrollTop: rect.top + scroll.scrollTop, duration: 300 });
      }
    });
  },

  // 复制门店地址
  copyAddress() {
    wx.setClipboardData({
      data: content.contact.address,
      success() {
        wx.showToast({ title: "地址已复制", icon: "none" });
      }
    });
  },

  // 打开内置地图
  openMap() {
    wx.openLocation({
      latitude: content.contact.latitude,
      longitude: content.contact.longitude,
      name: "Coco Color 色彩诊断",
      address: content.contact.address,
      scale: 16
    });
  },

  // 拨打门店电话
  callPhone() {
    wx.makePhoneCall({ phoneNumber: content.contact.phone });
  },

  // 复制微信号
  copyWechat() {
    wx.setClipboardData({
      data: content.contact.wechat,
      success() {
        wx.showModal({
          title: "微信号已复制",
          content: "微信号 " + content.contact.wechat + " 已复制，请到微信「添加朋友」粘贴添加预约。",
          showCancel: false,
          confirmText: "好的"
        });
      }
    });
  },

  // 预约方式选择面板（悬浮按钮 / 顶部按钮）
  contactSheet() {
    const phone = content.contact.phone;
    wx.showActionSheet({
      itemList: ["拨打电话 " + phone, "复制微信号 " + content.contact.wechat],
      success: (res) => {
        if (res.tapIndex === 0) this.callPhone();
        else if (res.tapIndex === 1) this.copyWechat();
      }
    });
  }
});
