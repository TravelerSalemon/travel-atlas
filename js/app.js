(() => {
  'use strict';

  const DATA = window.TRAVEL_DATA;
  if (!DATA) {
    document.body.innerHTML = '<p style="padding:40px">旅行数据加载失败，请检查 data/travel-data.js。</p>';
    return;
  }

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  function normalizeSpot(spot, type) {
    const base = typeof spot === 'string' ? { name: spot } : { ...spot };
    const districts = Array.isArray(base.districts)
      ? base.districts.filter(Boolean)
      : (base.district ? [base.district] : []);
    return {
      photos: Array.isArray(base.photos) ? base.photos : [],
      ...base,
      type,
      district: districts[0] || '',
      districts
    };
  }

  function getSpotDistricts(spot) {
    if (Array.isArray(spot?.districts) && spot.districts.length) return spot.districts.filter(Boolean);
    return spot?.district ? [spot.district] : [];
  }

  function spotInDistrict(spot, district) {
    return getSpotDistricts(spot).includes(district);
  }

  function spotDistrictLabel(spot) {
    return getSpotDistricts(spot).join(' / ');
  }

  function districtSpotCounts(city) {
    const counts = new Map();
    if (!city) return counts;
    for (const spot of [...city.natureSpots, ...city.cultureSpots]) {
      for (const district of getSpotDistricts(spot)) {
        counts.set(district, (counts.get(district) || 0) + 1);
      }
    }
    return counts;
  }

  const provinces = DATA.provinces.map(province => ({
    ...province,
    cities: province.cities.map(city => ({
      ...city,
      provinceName: province.name,
      provinceAdcode: province.adcode,
      natureSpots: city.nature.map(s => normalizeSpot(s, 'nature')),
      cultureSpots: city.culture.map(s => normalizeSpot(s, 'culture'))
    }))
  }));

  const allCities = provinces.flatMap(p => p.cities);
  const allSpots = allCities.flatMap(c => [...c.natureSpots, ...c.cultureSpots]);
  const stats = {
    provinces: provinces.filter(p => p.cities.length).length,
    cities: allCities.length,
    spots: allSpots.length,
    nature: allCities.reduce((n, c) => n + c.natureSpots.length, 0),
    culture: allCities.reduce((n, c) => n + c.cultureSpots.length, 0)
  };

  const provinceByAdcode = new Map(provinces.map(p => [String(p.adcode), p]));
  const provinceByName = new Map(provinces.map(p => [p.name, p]));
  const provinceByNormalizedName = new Map(provinces.map(p => [normalizeRegionName(p.name), p]));
  const cityByAdcode = new Map(allCities.map(c => [String(c.adcode), c]));

  // 全国省级行政区标准 adcode。仅用于 GeoJSON 缺少 adcode 时按名称下钻；
  // 个人旅行统计仍然完全来自 travel-data.js。
  const standardProvinceAdcodes = new Map(Object.entries({
    北京:'110000', 天津:'120000', 河北:'130000', 山西:'140000', 内蒙古:'150000',
    辽宁:'210000', 吉林:'220000', 黑龙江:'230000', 上海:'310000', 江苏:'320000',
    浙江:'330000', 安徽:'340000', 福建:'350000', 江西:'360000', 山东:'370000',
    河南:'410000', 湖北:'420000', 湖南:'430000', 广东:'440000', 广西:'450000',
    海南:'460000', 重庆:'500000', 四川:'510000', 贵州:'520000', 云南:'530000',
    西藏:'540000', 陕西:'610000', 甘肃:'620000', 青海:'630000', 宁夏:'640000',
    新疆:'650000', 台湾:'710000', 香港:'810000', 澳门:'820000'
  }));
  let activeProvinceFilter = 'all';
  let searchQuery = '';
  let chart = null;
  let mapState = { level: 'country', province: null, geo: null };

  initText();
  renderMetrics();
  renderFilters();
  renderCities();
  bindUI();
  waitForECharts();

  function initText() {
    const owner = DATA.site?.owner || 'MY';
    $('#heroOwner').textContent = owner.split(' ')[0] || owner;
    $('#heroSubtitle').textContent = DATA.site?.subtitle || '把走过的城市，做成一张不断生长的地图。';
    $('#brandTitle').textContent = (DATA.site?.title || 'TRAVEL ATLAS').toUpperCase();
    document.title = `${DATA.site?.title || '旅行图鉴'} · Travel Atlas`;
  }

  function renderMetrics() {
    const items = [
      [stats.provinces, '省级地区 · PROVINCES'],
      [stats.cities, '城市 / 地区 · CITIES'],
      [stats.spots, '景点记录 · PLACES'],
      [stats.nature, `自然 · NATURE / 人文 ${stats.culture}`]
    ];
    $('#heroMetrics').innerHTML = items.map(([value, label]) => `
      <div class="metric"><strong>${value}</strong><span>${label}</span></div>
    `).join('');
    $('#footerStats').textContent = `${stats.provinces} 省级地区 · ${stats.cities} 城市 · ${stats.spots} 景点`;
    renderCountrySide();
  }

  function citySpotCount(city) { return city.natureSpots.length + city.cultureSpots.length; }
  function provinceSpotCount(province) { return province.cities.reduce((n, c) => n + citySpotCount(c), 0); }

  function renderFilters() {
    const container = $('#provinceFilters');
    const chips = [{ key: 'all', label: `全部 ${allCities.length}` }, ...provinces.map(p => ({ key: p.adcode, label: p.name }))];
    container.innerHTML = chips.map(chip => `<button class="filter-chip ${chip.key === 'all' ? 'active' : ''}" data-province="${chip.key}">${chip.label}</button>`).join('');
  }

  function renderCities() {
    const q = searchQuery.trim().toLowerCase();
    const filtered = allCities.filter(city => {
      const byProvince = activeProvinceFilter === 'all' || city.provinceAdcode === activeProvinceFilter;
      if (!byProvince) return false;
      if (!q) return true;
      const haystack = [
        city.name, city.mapName, city.provinceName,
        ...city.natureSpots.flatMap(s => [s.name, ...getSpotDistricts(s)]),
        ...city.cultureSpots.flatMap(s => [s.name, ...getSpotDistricts(s)])
      ].join('|').toLowerCase();
      return haystack.includes(q);
    });

    $('#cityGrid').innerHTML = filtered.map(city => {
      const total = citySpotCount(city);
      return `
        <article class="city-card" data-city-adcode="${city.adcode}" tabindex="0" role="button" aria-label="查看${escapeHtml(city.name)}旅行记录">
          <img src="${escapeAttr(city.cover)}" alt="${escapeAttr(city.name)}" loading="lazy" onerror="this.remove()">
          <div class="card-top">
            <span class="card-badge">${escapeHtml(city.provinceName)}</span>
            <span class="card-date">${escapeHtml(city.date || '')}</span>
          </div>
          <div class="card-body">
            <h3>${escapeHtml(city.name)}</h3>
            <p>${escapeHtml(city.mapName || city.name)} · ${total} 个景点记录</p>
            <div class="card-counts"><span>自然 ${city.natureSpots.length}</span><span>人文 ${city.cultureSpots.length}</span></div>
          </div>
        </article>`;
    }).join('');
    $('#searchEmpty').hidden = filtered.length > 0;
  }

  function bindUI() {
    $('#provinceFilters').addEventListener('click', e => {
      const btn = e.target.closest('[data-province]');
      if (!btn) return;
      activeProvinceFilter = btn.dataset.province;
      $$('.filter-chip').forEach(x => x.classList.toggle('active', x === btn));
      renderCities();
    });

    $('#travelSearch').addEventListener('input', e => {
      searchQuery = e.target.value;
      renderCities();
    });

    $('#cityGrid').addEventListener('click', e => {
      const card = e.target.closest('[data-city-adcode]');
      if (card) openCity(cityByAdcode.get(card.dataset.cityAdcode));
    });
    $('#cityGrid').addEventListener('keydown', e => {
      if (!['Enter', ' '].includes(e.key)) return;
      const card = e.target.closest('[data-city-adcode]');
      if (card) { e.preventDefault(); openCity(cityByAdcode.get(card.dataset.cityAdcode)); }
    });

    $('#mapBack').addEventListener('click', () => renderCountryMap());
    $('#mapReload').addEventListener('click', () => mapState.level === 'country' ? renderCountryMap(true) : renderProvinceMap(mapState.province, true));
    $('#mapBreadcrumb').addEventListener('click', e => {
      if (e.target.dataset.level === 'country') renderCountryMap();
    });

    $('#mapSideList').addEventListener('click', e => {
      const provinceBtn = e.target.closest('[data-side-province]');
      if (provinceBtn) return renderProvinceMap(provinceByAdcode.get(provinceBtn.dataset.sideProvince));
      const provinceDetail = e.target.closest('[data-open-province]');
      if (provinceDetail) return openProvince(provinceByAdcode.get(provinceDetail.dataset.openProvince));
      const cityBtn = e.target.closest('[data-side-city]');
      if (cityBtn) return openCity(cityByAdcode.get(cityBtn.dataset.sideCity));
      const districtBtn = e.target.closest('[data-side-district]');
      if (districtBtn) {
        const municipalCity = mapState.province?.cities?.[0];
        if (municipalCity) return openCity(municipalCity, districtBtn.dataset.sideDistrict);
      }
    });

    $('#drawerClose').addEventListener('click', closeDrawer);
    $('#drawerBackdrop').addEventListener('click', closeDrawer);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });
    window.addEventListener('resize', debounce(() => chart?.resize(), 100));
  }

  function waitForECharts(attempt = 0) {
    if (window.echarts) {
      chart = echarts.init($('#mapChart'), null, { renderer: 'canvas' });
      chart.on('click', handleMapClick);
      renderCountryMap();
      return;
    }
    if (attempt > 60) {
      showMapError(true);
      return;
    }
    setTimeout(() => waitForECharts(attempt + 1), 100);
  }

  async function renderCountryMap(force = false) {
    mapState = { level: 'country', province: null, geo: null };
    $('#mapBack').disabled = true;
    $('#mapBreadcrumb').innerHTML = '<button class="crumb active" data-level="country">中国</button>';
    $('#mapHint').textContent = '点击省份进入市一级地图';
    renderCountrySide();
    showMapLoading(true);
    showMapError(false);
    try {
      const geo = await loadGeo('100000', 'country', force);
      mapState.geo = geo;
      echarts.registerMap('travel-country', geo);
      const data = geo.features.map(feature => {
        const sourceAdcode = getFeatureAdcode(feature);
        const featureName = getFeatureName(feature);
        const p = resolveProvinceFeature(feature);
        const resolvedAdcode = p?.adcode || sourceAdcode || standardProvinceAdcodes.get(normalizeRegionName(featureName)) || '';
        return {
          name: featureName,
          value: p ? Math.max(1, provinceSpotCount(p)) : 0,
          adcode: sourceAdcode,
          resolvedAdcode: String(resolvedAdcode),
          visited: !!p,
          itemStyle: p ? { areaColor: '#c87955' } : { areaColor: '#dfe3dc' }
        };
      });
      chart.setOption(makeMapOption('travel-country', data, '全国旅行足迹', false), true);
    } catch (err) {
      console.error(err);
      showMapError(true);
    } finally { showMapLoading(false); }
  }

  async function renderProvinceMap(province, force = false) {
    if (!province) return;
    mapState = { level: 'province', province, geo: null };
    $('#mapBack').disabled = false;
    $('#mapBreadcrumb').innerHTML = `<button class="crumb" data-level="country">中国</button><button class="crumb active">${escapeHtml(province.name)}</button>`;
    $('#mapHint').textContent = isMunicipality(province) ? '重点色表示已到访的区' : '重点色表示已有旅行记录的城市';
    renderProvinceSide(province);
    showMapLoading(true);
    showMapError(false);
    try {
      const geo = await loadGeo(province.adcode, 'province', force);
      mapState.geo = geo;
      const mapId = `travel-${province.adcode}`;
      echarts.registerMap(mapId, geo);
      const municipalCity = isMunicipality(province) ? province.cities?.[0] : null;
      const municipalDistrictCounts = districtSpotCounts(municipalCity);
      const data = geo.features.map(feature => {
        const sourceAdcode = getFeatureAdcode(feature);
        const name = getFeatureName(feature);
        const city = resolveCityFeature(province, feature);
        const municipalCount = municipalDistrictCounts.get(name) || 0;
        const municipalHit = municipalCount > 0;
        const value = city ? Math.max(1, citySpotCount(city)) : municipalCount;
        return {
          name,
          value,
          adcode: sourceAdcode,
          resolvedCityAdcode: city ? String(city.adcode) : '',
          visited: !!city || municipalHit,
          districtHit: municipalHit,
          itemStyle: (city || municipalHit) ? { areaColor: '#c87955' } : { areaColor: '#dfe3dc' }
        };
      });
      chart.setOption(makeMapOption(mapId, data, province.name, true), true);
    } catch (err) {
      console.error(err);
      showMapError(true);
    } finally { showMapLoading(false); }
  }

  function makeMapOption(mapName, data, title, provinceLevel) {
    const maxValue = Math.max(1, ...data.map(d => Number(d.value) || 0));
    return {
      animationDurationUpdate: 420,
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(23,39,45,.94)',
        borderWidth: 0,
        textStyle: { color: '#fff', fontSize: 11 },
        formatter: params => {
          const d = params.data || {};
          if (d.visited) return `<b>${escapeHtml(params.name)}</b><br>${provinceLevel ? '已有旅行记录' : `记录 ${d.value} 个景点`}`;
          return `<b>${escapeHtml(params.name)}</b><br><span style="opacity:.65">尚未记录旅行足迹</span>`;
        }
      },
      visualMap: {
        show: false,
        min: 0,
        max: maxValue,
        inRange: { color: ['#dfe3dc', '#c87955'] }
      },
      series: [{
        type: 'map',
        map: mapName,
        data,
        roam: true,
        scaleLimit: { min: .8, max: 5 },
        selectedMode: false,
        label: {
          show: true,
          color: '#526168',
          fontSize: provinceLevel ? 10 : 9,
          lineHeight: provinceLevel ? 14 : 13,
          formatter: params => params.data?.visited ? `${params.name}` : params.name
        },
        emphasis: { label: { color: '#17272d', fontWeight: 'bold' }, itemStyle: { areaColor: '#e0ad82', borderColor: '#fff', borderWidth: 1.3 } },
        itemStyle: { areaColor: '#dfe3dc', borderColor: '#fffdf8', borderWidth: 1 },
        layoutCenter: provinceLevel ? ['50%', '51%'] : ['50%', '52%'],
        layoutSize: provinceLevel ? '88%' : '96%'
      }]
    };
  }

  function isCountryProvinceGeo(geo) {
    const features = Array.isArray(geo?.features) ? geo.features : [];
    if (features.length < 20) return false;

    // 全国视图必须真正包含“省级 feature”，而不能只是一个“中华人民共和国”外轮廓。
    // 同时兼容 GeoJSON 有 adcode、只有 name，或两者都有的情况。
    let recognized = 0;
    for (const feature of features) {
      const code = getFeatureAdcode(feature);
      const name = normalizeRegionName(getFeatureName(feature));
      const codeLooksProvince = /^\d{2}0000$/.test(code) && code !== '100000';
      const nameLooksProvince = standardProvinceAdcodes.has(name);
      if (codeLooksProvince || nameLooksProvince) recognized += 1;
    }
    return recognized >= 20;
  }

  function isProvinceSubdivisionGeo(geo, parentAdcode) {
    const features = Array.isArray(geo?.features) ? geo.features : [];
    if (features.length < 2) return false;

    // 防止再次把“本省整体轮廓”误当成市/区级地图。
    const onlyParent = features.every(feature => {
      const code = getFeatureAdcode(feature);
      return code && code === String(parentAdcode);
    });
    return !onlyParent;
  }

  function validateGeoForLevel(geo, adcode, level) {
    if (level === 'country') return isCountryProvinceGeo(geo);
    if (level === 'province') return isProvinceSubdivisionGeo(geo, adcode);
    return Array.isArray(geo?.features) && geo.features.length > 0;
  }

  async function loadGeo(adcode, level, force = false) {
    const cacheKey = `travel-geo-v2-${adcode}-${level}`;
    if (!force) {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        try {
          const geo = JSON.parse(cached);
          if (validateGeoForLevel(geo, adcode, level)) return geo;
          sessionStorage.removeItem(cacheKey);
        } catch (_) {
          sessionStorage.removeItem(cacheKey);
        }
      }
    }

    const base = DATA.site?.mapSources || [];
    const githubBase = base[0] || 'https://cdn.jsdelivr.net/gh/zhChuXiao/ChinaGeoJson@master';
    const datavBase = base[1] || 'https://geo.datav.aliyun.com/areas_v3/bound';

    // 关键修复：全国视图优先加载 100000_full.json。
    // ChinaGeoJson 的 china.json 在部分版本/缓存中可能只是“中华人民共和国”单个整体轮廓，
    // 这种数据可以画出中国外形，却无法用于省级高亮和省份点击下钻。
    const urls = level === 'country'
      ? [
          `${datavBase}/100000_full.json`,
          'https://cdn.jsdelivr.net/gh/lqb-zh/geojson-chinadata@master/100000_full.json',
          `${githubBase}/china.json`
        ]
      : [
          `${githubBase}/province/${adcode}.json`,
          `${datavBase}/${adcode}_full.json`
        ];

    let lastError;
    for (const url of [...new Set(urls)]) {
      try {
        const res = await fetch(url, { cache: force ? 'reload' : 'default' });
        if (!res.ok) throw new Error(`${res.status} ${url}`);
        const geo = await res.json();
        if (!validateGeoForLevel(geo, adcode, level)) {
          throw new Error(`GeoJSON hierarchy mismatch: ${url}`);
        }
        try { sessionStorage.setItem(cacheKey, JSON.stringify(geo)); } catch (_) {}
        return geo;
      } catch (err) {
        console.warn('[Travel Atlas] map source skipped:', url, err);
        lastError = err;
      }
    }
    throw lastError || new Error('GeoJSON load failed');
  }

  function handleMapClick(params) {
    const sourceAdcode = String(params.data?.adcode || '');
    if (mapState.level === 'country') {
      const featureName = String(params.name || '');
      const normalizedName = normalizeRegionName(featureName);
      const resolvedAdcode = String(params.data?.resolvedAdcode || sourceAdcode || '');

      // 100000 是国家层级，不允许被创建成“临时省份”。如果旧缓存/异常数据仍触发到这里，
      // 直接强制重载真正的省级边界数据，而不是进入“中华人民共和国 · 100000”。
      if (resolvedAdcode === '100000' || normalizedName === '中华人民共和国' || normalizedName === '中国') {
        renderCountryMap(true);
        return;
      }

      // 优先使用渲染地图时已经解析出的真实旅行省份；其次再按 adcode / 名称兜底。
      const p = provinceByAdcode.get(resolvedAdcode)
        || provinceByNormalizedName.get(normalizedName);
      if (p) {
        renderProvinceMap(p);
        return;
      }

      // 未到访省份也允许下钻，但只接受合法的省级 adcode。
      const fallbackAdcode = resolvedAdcode || standardProvinceAdcodes.get(normalizedName) || '';
      if (!/^\d{2}0000$/.test(fallbackAdcode) || fallbackAdcode === '100000') return;
      const temp = { name: featureName, adcode: fallbackAdcode, cities: [], cover: '' };
      renderProvinceMap(temp);
      return;
    }
    const resolvedCityAdcode = String(params.data?.resolvedCityAdcode || sourceAdcode || '');
    const city = cityByAdcode.get(resolvedCityAdcode) || resolveCityByName(mapState.province, params.name);
    if (city) return openCity(city);

    // 直辖市：若景点已配置 district，则点击相应区打开过滤后的整体城市记录。
    if (mapState.province && isMunicipality(mapState.province)) {
      const municipalCity = mapState.province.cities[0];
      const hasDistrict = municipalCity && [...municipalCity.natureSpots, ...municipalCity.cultureSpots].some(s => spotInDistrict(s, params.name));
      if (hasDistrict) return openCity(municipalCity, params.name);
    }
  }

  function renderCountrySide() {
    const side = $('#mapSide');
    if (!side) return;
    side.querySelector('h3').textContent = '中国 · CHINA';
    const lead = side.querySelector('.side-lead');
    lead.textContent = '';
    lead.hidden = true;
    $('#mapSideStats').innerHTML = miniStats([[stats.provinces, '已到访省份'], [stats.cities, '已到访城市 / 地区'], [stats.spots, '景点'], [stats.nature + '/' + stats.culture, '自然 / 人文']]);
    $('#mapSideList').innerHTML = provinces
      .slice().sort((a,b) => provinceSpotCount(b) - provinceSpotCount(a))
      .map(p => `<button class="side-link visited" data-side-province="${p.adcode}"><span>${escapeHtml(p.name)}</span><b>${provinceSpotCount(p)} 处</b></button>`).join('');
  }

  function renderProvinceSide(province) {
    const side = $('#mapSide');
    side.querySelector('h3').textContent = `${province.name} · ${province.adcode}`;
    const lead = side.querySelector('.side-lead');
    lead.hidden = false;
    const spots = province.cities ? provinceSpotCount(province) : 0;
    const nature = province.cities?.reduce((n,c)=>n+c.natureSpots.length,0) || 0;
    const culture = province.cities?.reduce((n,c)=>n+c.cultureSpots.length,0) || 0;

    if (isMunicipality(province) && province.cities?.length) {
      const municipalCity = province.cities[0];
      const counts = districtSpotCounts(municipalCity);
      const districts = [...counts.entries()].sort((a,b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-CN'));
      lead.textContent = districts.length ? '旅行记录已细分到区。点击下方区名可查看对应景点。' : '这里尚未记录到区级旅行足迹。';
      $('#mapSideStats').innerHTML = miniStats([[districts.length, '已到访区'], [spots, '景点'], [nature, '自然'], [culture, '人文']]);
      $('#mapSideList').innerHTML = districts.length
        ? `<button class="side-link visited" data-open-province="${province.adcode}"><span>查看全部景点</span><b>→</b></button>` +
          districts.map(([district,count]) => `<button class="side-link visited" data-side-district="${escapeAttr(district)}"><span>${escapeHtml(district)}</span><b>${count} 处</b></button>`).join('')
        : '<div style="color:var(--muted);font-size:12px;padding:10px">暂无区级记录</div>';
      return;
    }

    const visited = province.cities?.length || 0;
    lead.textContent = visited ? '以下城市已有旅行记录。点击城市可查看具体景点、日期与照片。' : '这里尚未记录旅行足迹，但仍可浏览该省的市级地图。';
    $('#mapSideStats').innerHTML = miniStats([[visited, '已到访城市'], [spots, '景点'], [nature, '自然'], [culture, '人文']]);
    $('#mapSideList').innerHTML = visited
      ? `<button class="side-link visited" data-open-province="${province.adcode}"><span>查看本省全部景点</span><b>→</b></button>` +
        province.cities.map(c => `<button class="side-link visited" data-side-city="${c.adcode}"><span>${escapeHtml(c.name)}</span><b>${citySpotCount(c)} 处</b></button>`).join('')
      : '<div style="color:var(--muted);font-size:12px;padding:10px">暂无城市记录</div>';
  }

  function miniStats(items) {
    return items.map(([value, label]) => `<div class="mini-stat"><strong>${value}</strong><span>${label}</span></div>`).join('');
  }

  function openProvince(province) {
    if (!province) return;
    const cityCount = province.cities.length;
    const spots = provinceSpotCount(province);
    const nature = province.cities.reduce((n,c)=>n+c.natureSpots.length,0);
    const culture = province.cities.reduce((n,c)=>n+c.cultureSpots.length,0);
    const provinceImages = [province.cover, ...(province.photos || [])].filter(Boolean);
    $('#drawerContent').innerHTML = `
      ${drawerHero(province.cover, 'PROVINCE · 省级足迹', province.name, `${cityCount} 个城市 / 地区 · ${spots} 个景点`)}
      <div class="drawer-body">
        <div class="drawer-stats">${drawerStats([[cityCount,'城市 / 地区'],[nature,'自然'],[culture,'人文']])}</div>
        ${provinceImages.length ? renderGallery(provinceImages.slice(0,4), province.name) : ''}
        <h3 class="spot-section-title">已到访城市</h3>
        <div class="city-chip-list">${province.cities.map(c=>`<button class="city-chip" data-drawer-city="${c.adcode}">${escapeHtml(c.name)} · ${citySpotCount(c)}</button>`).join('')}</div>
        ${province.cities.map(c => `
          <section class="spot-section">
            <h3 class="spot-section-title">${escapeHtml(c.name)} · ${citySpotCount(c)} 处</h3>
            <div class="spot-grid">${[...c.natureSpots, ...c.cultureSpots].map(spot => `<article class="spot-card"><strong>${escapeHtml(spot.name)}</strong><small>${escapeHtml(spotDistrictLabel(spot) || (spot.type === 'nature' ? 'NATURE' : 'CULTURE'))}</small></article>`).join('')}</div>
          </section>`).join('')}
      </div>`;
    showDrawer();
    $$('[data-drawer-city]', $('#drawerContent')).forEach(btn => btn.addEventListener('click', () => openCity(cityByAdcode.get(btn.dataset.drawerCity))));
  }

  function openCity(city, district = '') {
    if (!city) return;
    let nature = city.natureSpots;
    let culture = city.cultureSpots;
    if (district) {
      nature = nature.filter(s => spotInDistrict(s, district));
      culture = culture.filter(s => spotInDistrict(s, district));
    }
    const total = nature.length + culture.length;
    const gallery = [city.cover, ...(city.photos || []), ...nature.flatMap(s=>s.photos), ...culture.flatMap(s=>s.photos)].filter(Boolean);
    $('#drawerContent').innerHTML = `
      ${drawerHero(city.cover, `${escapeHtml(city.provinceName)} · CITY RECORD`, district ? `${city.name} · ${district}` : city.name, `${escapeHtml(city.date || '日期待补充')} · ${total} 个景点`)}
      <div class="drawer-body">
        <div class="drawer-stats">${drawerStats([[total,'全部景点'],[nature.length,'自然'],[culture.length,'人文']])}</div>
        ${city.note ? `<p class="drawer-note">${escapeHtml(city.note)}</p>` : ''}
        ${gallery.length ? renderGallery(gallery.slice(0,4), city.name) : ''}
        ${renderSpotSection('自然风光 · NATURE', nature, 'nature')}
        ${renderSpotSection('人文景观 · CULTURE', culture, 'culture')}
      </div>`;
    showDrawer();
  }

  function drawerHero(src, kicker, title, subtitle) {
    return `<div class="drawer-hero">
      ${src ? `<img src="${escapeAttr(src)}" alt="${escapeAttr(title)}" onerror="this.remove()">` : ''}
      <span class="drawer-kicker">${kicker}</span>
      <h2>${escapeHtml(title)}</h2>
      <p>${subtitle}</p>
    </div>`;
  }

  function drawerStats(items) { return items.map(([v,l]) => `<div class="drawer-stat"><strong>${v}</strong><span>${l}</span></div>`).join(''); }

  function renderGallery(images, title) {
    return `<div class="photo-gallery">${images.map((src,i)=>`
      <figure class="photo-frame"><img src="${escapeAttr(src)}" alt="${escapeAttr(title)}旅行照片 ${i+1}" loading="lazy" onerror="this.style.display='none'"><div class="photo-fallback"><span>PHOTO</span><small>添加 ${escapeHtml(title)} 的照片</small></div></figure>`).join('')}</div>`;
  }

  function renderSpotSection(title, spots, type) {
    if (!spots.length) return '';
    return `<section class="spot-section">
      <h3 class="spot-section-title">${title}</h3>
      <div class="spot-grid">${spots.map(spot => {
        const img = spot.photos?.[0];
        return `<article class="spot-card ${img ? 'has-photo' : ''}">
          ${img ? `<img src="${escapeAttr(img)}" alt="${escapeAttr(spot.name)}" loading="lazy" onerror="this.remove();this.parentElement.classList.remove('has-photo')">` : ''}
          <strong>${escapeHtml(spot.name)}</strong>
          <small>${escapeHtml(spotDistrictLabel(spot) || (type === 'nature' ? 'NATURE' : 'CULTURE'))}</small>
        </article>`;
      }).join('')}</div>
    </section>`;
  }

  function normalizeRegionName(name = '') {
    return String(name)
      .trim()
      .replace(/\s+/g, '')
      .replace(/特别行政区$/, '')
      .replace(/维吾尔自治区$/, '')
      .replace(/壮族自治区$/, '')
      .replace(/回族自治区$/, '')
      .replace(/自治区$/, '')
      .replace(/省$/, '')
      .replace(/市$/, '');
  }

  function getFeatureName(feature) {
    const props = feature?.properties || {};
    return String(props.name ?? props.NAME ?? props.fullname ?? props.fullName ?? feature?.name ?? '').trim();
  }

  function normalizeAdcode(value) {
    if (value === null || value === undefined) return '';
    const match = String(value).match(/\d{6}/);
    return match ? match[0] : '';
  }

  function getFeatureAdcode(feature) {
    const props = feature?.properties || {};
    const candidates = [props.adcode, props.adCode, props.ADCODE, props.code, props.CODE, feature?.id];
    for (const candidate of candidates) {
      const code = normalizeAdcode(candidate);
      if (code) return code;
    }
    return '';
  }

  function resolveProvinceFeature(feature) {
    const code = getFeatureAdcode(feature);
    if (code && provinceByAdcode.has(code)) return provinceByAdcode.get(code);
    const name = normalizeRegionName(getFeatureName(feature));
    return provinceByNormalizedName.get(name) || null;
  }

  function resolveCityByName(province, featureName) {
    if (!province?.cities?.length) return null;
    const target = normalizeRegionName(featureName);
    return province.cities.find(city =>
      normalizeRegionName(city.mapName || city.name) === target
      || normalizeRegionName(city.name) === target
    ) || null;
  }

  function resolveCityFeature(province, feature) {
    if (!province?.cities?.length) return null;
    const code = getFeatureAdcode(feature);
    if (code) {
      const hit = province.cities.find(city => String(city.adcode) === code);
      if (hit) return hit;
    }
    return resolveCityByName(province, getFeatureName(feature));
  }

  function showDrawer() {
    const drawer = $('#detailDrawer');
    const backdrop = $('#drawerBackdrop');
    backdrop.hidden = false;
    requestAnimationFrame(() => backdrop.classList.add('show'));
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    const drawer = $('#detailDrawer');
    const backdrop = $('#drawerBackdrop');
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    backdrop.classList.remove('show');
    setTimeout(() => { backdrop.hidden = true; }, 260);
    document.body.style.overflow = '';
  }

  function showMapLoading(show) { $('#mapLoading').hidden = !show; }
  function showMapError(show) { $('#mapError').hidden = !show; }
  function isMunicipality(p) { return ['110000','120000','310000','500000'].includes(String(p.adcode)); }
  function debounce(fn, wait) { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); }; }
  function escapeHtml(value='') { return String(value).replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch])); }
  function escapeAttr(value='') { return escapeHtml(value); }
})();
