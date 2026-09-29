// ============================================================
// 旅行数据：网站中的统计、地图高亮、城市卡片和景点列表均由这里自动生成。
// 新增景点：直接在 nature / culture 数组中加一项字符串即可。
// 给景点加照片或区县信息：把字符串改成对象，例如：
// { name: '故宫博物院', photos: ['assets/photos/spots/beijing-gugong-01.jpg'], district: '东城区' }
// 新增城市：在对应 province.cities 中新增一个 city 对象；无需手动改统计数字。
// ============================================================

window.TRAVEL_DATA = {
  site: {
    owner: '李思成',
    title: '旅行图鉴',
    subtitle: '把走过的城市，做成一张不断生长的地图。',
    mapSources: [
      'https://cdn.jsdelivr.net/gh/zhChuXiao/ChinaGeoJson@master',
      'https://geo.datav.aliyun.com/areas_v3/bound'
    ]
  },
  provinces: [
    {
      name: "安徽省",
      adcode: '340000',
      cover: "assets/photos/provinces/安徽.png",
      cities: [
        {
          name: "阜阳",
          mapName: "阜阳市",
          adcode: '341200',
          date: "2003.01.19起",
          cover: "assets/photos/cities/阜阳.png",
          nature: [
            "阜阳生态园",
            "镜湖公园",
            "沙颍河湿地公园",
          ],
          culture: [
            "太和一中新校区",
          ]
        },
        {
          name: "合肥",
          mapName: "合肥市",
          adcode: '340100',
          date: "2024.04.06",
          cover: "assets/photos/cities/合肥.png",
          nature: [
            "翡翠湖公园",
          ],
          culture: [
            "合肥工业大学",
            "逍遥津公园",
            "中国科学技术大学",
          ]
        },
        {
          name: "淮北",
          mapName: "淮北市",
          adcode: '340600',
          date: "2025.07.18",
          cover: "assets/photos/cities/淮北.png",
          nature: [
            "相山公园",
            "南湖公园",
          ],
          culture: [
            "隋唐大运河古镇",
          ]
        }
      ]
    },
    {
      name: "北京市",
      adcode: '110000',
      cover: "assets/photos/provinces/北京.png",
      cities: [
        {
          name: "北京",
          mapName: "北京市",
          adcode: '110000',
          date: "2024.09起",
          cover: "assets/photos/cities/北京.png",
          nature: [
            { name: "奥林匹克森林公园", district: "朝阳区" },
            { name: "八达岭长城", district: "延庆区" },
            { name: "百望山", district: "海淀区" },
            { name: "百瑞谷", district: "房山区" },
            { name: "百善森林画廊", district: "昌平区" },
            { name: "北海公园", district: "西城区" },
            { name: "北坞公园", district: "海淀区" },
            { name: "北小河公园", district: "朝阳区" },
            { name: "朝阳公园", district: "朝阳区" },
            { name: "地坛公园", district: "东城区" },
            { name: "东沙河滨水公园", district: "昌平区" },
            { name: "国家植物园", district: "海淀区" },
            { name: "海淀公园", district: "海淀区" },
            { name: "虎峪村", district: "昌平区" },
            { name: "景山公园", district: "西城区" },
            { name: "居庸关长城", district: "昌平区" },
            { name: "灵慧山", district: "怀柔区" },
            { name: "欧洲小镇", district: "昌平区" },
            { name: "清河之洲", district: "海淀区" },
            { name: "沙河", district: "昌平区" },
            { name: "什刹海", district: "西城区" },
            { name: "十里堡", district: "朝阳区" },
            { name: "十三陵水库", district: "昌平区" },
            { name: "太阳宫公园", district: "朝阳区" },
            { name: "桃源仙谷", district: "密云区" },
            { name: "天坛公园", district: "东城区" },
            { name: "卧龙堂", district: "昌平区" },
            { name: "香山公园", district: "海淀区" },
            { name: "望和公园", district: "朝阳区" },
            { name: "颐和园", district: "海淀区" },
            { name: "银山塔林", district: "昌平区" },
            { name: "圆明园", district: "海淀区" },
            { name: "中山公园", district: "东城区" },
            { name: "紫竹院公园", district: "海淀区" },
          ],
          culture: [
            { name: "798艺术中心", district: "朝阳区" },
            { name: "北京大学", district: "海淀区" },
            { name: "北京航空航天大学", district: "海淀区" },
            { name: "北京孔庙", district: "东城区" },
            { name: "北京林业大学", district: "海淀区" },
            { name: "北京体育大学", district: "海淀区" },
            { name: "故宫博物院", district: "东城区" },
            { name: "国家博物馆", district: "东城区" },
            { name: "国家图书馆", district: "海淀区" },
            { name: "国子监", district: "东城区" },
            { name: "恭王府", district: "西城区" },
            { name: "毛主席纪念堂", district: "东城区" },
            { name: "清华大学", district: "海淀区" },
            { name: "人民大会堂", district: "西城区" },
            { name: "天安门", district: "东城区" },
            { name: "新华门", district: "西城区" },
            { name: "星光影视园", district: "大兴区" },
            { name: "正阳门", district: "东城区" },
            { name: "中国农业大学", district: "海淀区" },
            { name: "中国人民大学", district: "海淀区" },
            { name: "中央财经大学", district: "昌平区" },
          ]
        }
      ]
    },
    {
      name: "福建省",
      adcode: '350000',
      cover: "assets/photos/provinces/福建.png",
      cities: [
        {
          name: "三明",
          mapName: "三明市",
          adcode: '350400',
          date: "2026.05.29",
          cover: "assets/photos/cities/三明.png",
          nature: [
            "隆陂水库",
            "俞邦村",
          ],
          culture: [
            "客家祖地",
          ]
        }
      ]
    },
    {
      name: "贵州省",
      adcode: '520000',
      cover: "assets/photos/provinces/贵州.png",
      cities: [
        {
          name: "遵义",
          mapName: "遵义市",
          adcode: '520300',
          date: "2025.05.10",
          cover: "assets/photos/cities/遵义.png",
          nature: [
            "赤水",
            "娄山关",
            "茅台渡口",
            "青杠坡",
            "湘江",
          ],
          culture: [
            "贵州珍酒厂",
            "红军烈士陵园",
            "捞沙巷",
            "茅台镇",
            "四渡赤水纪念馆",
            "遵义会议会址",
          ]
        }
      ]
    },
    {
      name: "河北省",
      adcode: '130000',
      cover: "assets/photos/provinces/河北.png",
      cities: [
        {
          name: "邯郸",
          mapName: "邯郸市",
          adcode: '130400',
          date: "2025.10.02",
          cover: "assets/photos/cities/邯郸.png",
          nature: [
            "将军岭",
          ],
          culture: [
            "峰峰山底抗日地道战遗址",
            "邯郸道",
            "一二九师刘邓故居",
          ]
        },
        {
          name: "秦皇岛",
          mapName: "秦皇岛市",
          adcode: '130300',
          date: "2024.07.12--07.14",
          cover: "assets/photos/cities/秦皇岛.png",
          nature: [
            "北戴河",
            "鸽子窝",
            "海天一色",
            "金梦海湾",
            "老龙头",
            "秦皇求仙入海处",
            "山海关",
            "西港花园",
          ],
          culture: [
            "东北大学秦皇岛校区",
            "秦皇小巷",
            "王家大院",
            "新澳海底世界",
          ]
        },
        {
          name: "石家庄",
          mapName: "石家庄市",
          adcode: '130100',
          date: "2025.08.15",
          cover: "assets/photos/cities/石家庄.png",
          nature: [
            "西柏坡",
          ],
          culture: [
            "步行街",
          ]
        },
        {
          name: "张家口",
          mapName: "张家口市",
          adcode: '130700',
          date: "2026.05.02",
          cover: "assets/photos/cities/张家口.png",
          nature: [
            "成吉思汗公园",
            "花田草海",
            "天保那苏图",
            "野狐岭军事基地",
          ],
          culture: [
            "德胜村",
            "董存瑞纪念馆",
          ]
        }
      ]
    },
    {
      name: "黑龙江省",
      adcode: '230000',
      cover: "assets/photos/provinces/黑龙江.png",
      cities: [
        {
          name: "哈尔滨",
          mapName: "哈尔滨市",
          adcode: '230100',
          date: "2020.09--2024.06（多次）",
          cover: "assets/photos/cities/哈尔滨.png",
          nature: [
            "松花江",
            "太阳岛",
          ],
          culture: [
            "东北农业大学",
            "哈尔滨工程大学",
            "哈尔滨工业大学",
            "极乐寺",
            "圣索菲亚大教堂",
            "中华巴洛克",
            "中央大街",
          ]
        }
      ]
    },
    {
      name: "吉林省",
      adcode: '220000',
      cover: "assets/photos/provinces/吉林.png",
      cities: [
        {
          name: "长白山",
          mapName: "延边朝鲜族自治州",
          adcode: '222400',
          date: "2023.07.22",
          cover: "assets/photos/cities/长白山.png",
          note: "长白山旅行记录在地图上以延边朝鲜族自治州作为定位范围。",
          nature: [
            "谷底森林",
            "绿渊潭",
            "小天池",
          ],
          culture: [
          ]
        },
        {
          name: "长春",
          mapName: "长春市",
          adcode: '220100',
          date: "2023.07.20",
          cover: "assets/photos/cities/长春.png",
          nature: [
            "净月潭公园",
          ],
          culture: [
            "吉林大学",
            "伪满皇宫",
            "这有山",
          ]
        }
      ]
    },
    {
      name: "江苏省",
      adcode: '320000',
      cover: "assets/photos/provinces/江苏.png",
      cities: [
        {
          name: "南京",
          mapName: "南京市",
          adcode: '320100',
          date: "2025.04.05--04.06",
          cover: "assets/photos/cities/南京.png",
          nature: [
            "秦淮河",
            "玄武湖公园",
            "阅江楼",
            "瞻园",
          ],
          culture: [
            "夫子庙",
            "六朝博物馆",
            "美龄宫",
            "明孝陵",
            "南京大学",
            "牛首山地宫",
            "雨花台",
            "中山陵",
            "总统府",
          ]
        }
      ]
    },
    {
      name: "辽宁省",
      adcode: '210000',
      cover: "assets/photos/provinces/辽宁.png",
      cities: [
        {
          name: "大连",
          mapName: "大连市",
          adcode: '210200',
          date: "2024.08.01--08.03",
          cover: "assets/photos/cities/大连.png",
          nature: [
            "金沙滩",
            "老虎滩海洋公园",
            "莲花山",
            "星海湾",
          ],
          culture: [
            "威尼斯水城",
            "星海广场",
          ]
        },
        {
          name: "抚顺",
          mapName: "抚顺市",
          adcode: '210400',
          date: "2026.06.01",
          cover: "assets/photos/cities/抚顺.png",
          nature: [
            "萨尔浒",
            "西露天矿坑",
          ],
          culture: [
            "雷锋纪念馆",
            "辽宁雷锋干部学院",
            "煤矿博物馆",
          ]
        }
      ]
    },
    {
      name: "内蒙古自治区",
      adcode: '150000',
      cover: "assets/photos/provinces/内蒙古.png",
      cities: [
        {
          name: "阿拉善盟",
          mapName: "阿拉善盟",
          adcode: '152900',
          date: "2026.05.05",
          cover: "assets/photos/cities/阿拉善盟.png",
          nature: [
            "苏海图湖",
            "太阳湖",
            "腾格里沙漠",
            "天鹅湖",
            "乌兰湖",
          ],
          culture: [
          ]
        },
        {
          name: "呼和浩特",
          mapName: "呼和浩特市",
          adcode: '150100',
          date: "2026.05.03",
          cover: "assets/photos/cities/呼和浩特.png",
          nature: [
            "敕勒川草原",
            "大青山",
          ],
          culture: [
            "宝尔汗佛塔",
            "大盛魁",
            "内蒙古博物院",
            "青城公园",
            "清真大寺",
            "五塔寺",
          ]
        },
        {
          name: "乌兰察布",
          mapName: "乌兰察布市",
          adcode: '150900',
          date: "2026.05.02",
          cover: "assets/photos/cities/乌兰察布.png",
          nature: [
            "乌兰哈达火山",
          ],
          culture: [
          ]
        }
      ]
    },
    {
      name: "宁夏回族自治区",
      adcode: '640000',
      cover: "assets/photos/provinces/宁夏.png",
      cities: [
        {
          name: "银川",
          mapName: "银川市",
          adcode: '640100',
          date: "2026.05.07",
          cover: "assets/photos/cities/银川.png",
          nature: [
            "贺兰山岩画",
            "西夏王陵",
          ],
          culture: [
            "鼓楼",
            "览山公园",
            "南熏门",
            "宁夏博物馆",
            "玉皇阁",
            "镇北堡影视城",
            "中阿友好纪念碑",
          ]
        }
      ]
    },
    {
      name: "山东省",
      adcode: '370000',
      cover: "assets/photos/provinces/山东.png",
      cities: [
        {
          name: "威海",
          mapName: "威海市",
          adcode: '371000',
          date: "2022.07.15--07.17",
          cover: "assets/photos/cities/威海.png",
          nature: [
            "黄海",
            "刘公岛",
            "沙滩",
          ],
          culture: [
            "哈尔滨工业大学威海校区",
          ]
        }
      ]
    },
    {
      name: "陕西省",
      adcode: '610000',
      cover: "assets/photos/provinces/陕西.png",
      cities: [
        {
          name: "西安",
          mapName: "西安市",
          adcode: '610100',
          date: "2025.01.20--01.22",
          cover: "assets/photos/cities/西安.png",
          nature: [
            "大明宫",
            "大唐芙蓉园",
            "骊山",
          ],
          culture: [
            "兵马俑",
            "大唐不夜城",
            "大雁塔",
            "华清宫",
            "西安城墙",
            "西北工业大学",
            "永兴坊",
            "钟楼",
            "鼓楼",
          ]
        }
      ]
    },
    {
      name: "上海市",
      adcode: '310000',
      cover: "assets/photos/provinces/上海.png",
      cities: [
        {
          name: "上海",
          mapName: "上海市",
          adcode: '310000',
          date: "2025.02.02--02.04",
          cover: "assets/photos/cities/上海.png",
          nature: [
            { name: "黄浦江", districts: ["黄浦区", "浦东新区"] },
            { name: "豫园", district: "黄浦区" },
          ],
          culture: [
            { name: "东方明珠", district: "浦东新区" },
            { name: "朵云书院", district: "浦东新区" },
            { name: "复旦大学", district: "杨浦区" },
            { name: "陆家嘴", district: "浦东新区" },
            { name: "上海交通大学", district: "闵行区" },
            { name: "同济大学", district: "杨浦区" },
            { name: "徐家汇天主教堂", district: "徐汇区" },
            { name: "中共一大会址", district: "黄浦区" },
          ]
        }
      ]
    },
    {
      name: "四川省",
      adcode: '510000',
      cover: "assets/photos/provinces/四川.png",
      cities: [
        {
          name: "成都",
          mapName: "成都市",
          adcode: '510100',
          date: "2025.07.06",
          cover: "assets/photos/cities/成都.png",
          nature: [
          ],
          culture: [
            "锦里",
            "武侯祠",
            "人民公园",
          ]
        },
        {
          name: "凉山",
          mapName: "凉山彝族自治州",
          adcode: '513400',
          date: "2026.07.03--07.06",
          cover: "assets/photos/cities/凉山州.png",
          nature: [
            "谷克德",
            "泸山",
            "螺髻山",
            "邛海",
            "冶勒湖",
            "彝海",
          ],
          culture: [
            "大石板古村",
            "建昌古城",
            "会理古城",
            "会理会议遗址",
            "会理绿陶博物馆",
            "火把广场",
            "灵鹰寺",
            "三河村",
            "听涛谷",
            "西昌卫星发射中心",
          ]
        }
      ]
    },
    {
      name: "新疆维吾尔自治区",
      adcode: '650000',
      cover: "assets/photos/provinces/新疆.png",
      cities: [
        {
          name: "乌鲁木齐",
          mapName: "乌鲁木齐市",
          adcode: '650100',
          date: "2026.07.10--07.12",
          cover: "assets/photos/cities/乌鲁木齐.png",
          nature: [
            "红光山",
            "红山公园",
            "水磨沟公园",
            "新疆盐湖",
          ],
          culture: [
            "新疆国际大巴扎",
            "新疆维吾尔自治区博物馆",
          ]
        }
      ]
    },
    {
      name: "浙江省",
      adcode: '330000',
      cover: "assets/photos/provinces/浙江.png",
      cities: [
        {
          name: "杭州",
          mapName: "杭州市",
          adcode: '330100',
          date: "2025.02.05--02.06",
          cover: "assets/photos/cities/杭州.png",
          nature: [
            "西湖",
            "太子湾公园",
          ],
          culture: [
            "雷峰塔",
            "浙江大学",
          ]
        }
      ]
    }
  ]
};
