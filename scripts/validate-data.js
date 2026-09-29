const fs = require('fs');
const vm = require('vm');
const path = require('path');

const dataFile = path.join(__dirname, '..', 'data', 'travel-data.js');
const code = fs.readFileSync(dataFile, 'utf8');
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(code, sandbox, { filename: dataFile });
const data = sandbox.window.TRAVEL_DATA;

const errors = [];
const warnings = [];
const seenProvince = new Set();
const seenCity = new Set();
let cities = 0, nature = 0, culture = 0;

for (const province of data.provinces || []) {
  if (!province.name || !province.adcode) errors.push(`省份缺少 name/adcode: ${JSON.stringify(province)}`);
  if (seenProvince.has(province.adcode)) errors.push(`重复省级 adcode: ${province.adcode}`);
  seenProvince.add(province.adcode);
  for (const city of province.cities || []) {
    cities++;
    nature += (city.nature || []).length;
    culture += (city.culture || []).length;
    if (!city.name || !city.adcode) errors.push(`${province.name} 中有城市缺少 name/adcode`);
    const key = `${province.adcode}/${city.adcode}/${city.name}`;
    if (seenCity.has(key)) errors.push(`重复城市记录: ${key}`);
    seenCity.add(key);
    if (!/^\d{6}$/.test(String(city.adcode))) warnings.push(`${city.name} 的 adcode 看起来不是 6 位数字: ${city.adcode}`);
    for (const group of ['nature','culture']) {
      for (const spot of city[group] || []) {
        const name = typeof spot === 'string' ? spot : spot?.name;
        if (!name) errors.push(`${province.name}/${city.name}/${group} 中存在无名称景点`);
      }
    }
  }
}

console.log(`省级地区: ${seenProvince.size}`);
console.log(`城市/地区: ${cities}`);
console.log(`自然景点: ${nature}`);
console.log(`人文景点: ${culture}`);
console.log(`景点总计: ${nature + culture}`);
if (warnings.length) console.warn('\nWarnings:\n- ' + warnings.join('\n- '));
if (errors.length) {
  console.error('\nErrors:\n- ' + errors.join('\n- '));
  process.exit(1);
}
console.log('\n数据校验通过。');
