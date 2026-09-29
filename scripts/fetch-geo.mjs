import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const GEO_ROOT = path.join(ROOT, 'assets', 'geo');
const PROVINCE_ROOT = path.join(GEO_ROOT, 'province');

const PROVINCES = [
  '110000','120000','130000','140000','150000','210000','220000','230000',
  '310000','320000','330000','340000','350000','360000','370000','410000',
  '420000','430000','440000','450000','460000','500000','510000','520000',
  '530000','540000','610000','620000','630000','640000','650000','710000',
  '810000','820000'
];

async function fetchJsonWithFallback(urls, label) {
  let lastError;
  for (const url of urls) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 30000);
      const res = await fetch(url, {
        headers: { 'user-agent': 'travel-atlas-pages-build' },
        signal: controller.signal
      });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const json = await res.json();
      if (!json || !Array.isArray(json.features) || json.features.length === 0) {
        throw new Error('invalid GeoJSON');
      }
      console.log(`✓ ${label}: ${url}`);
      return json;
    } catch (err) {
      lastError = err;
      console.warn(`  source failed for ${label}: ${url} -> ${err.message}`);
    }
  }
  throw new Error(`Unable to fetch ${label}: ${lastError?.message || 'unknown error'}`);
}

async function main() {
  await mkdir(PROVINCE_ROOT, { recursive: true });

  const country = await fetchJsonWithFallback([
    'https://raw.githubusercontent.com/lqb-zh/geojson-chinadata/main/100000_full.json',
    'https://cdn.jsdelivr.net/gh/lqb-zh/geojson-chinadata@main/100000_full.json',
    'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json'
  ], 'country 100000');

  if (country.features.length < 20) {
    throw new Error(`Country GeoJSON has only ${country.features.length} features; expected province-level boundaries.`);
  }
  await writeFile(path.join(GEO_ROOT, '100000.json'), JSON.stringify(country));

  const failures = [];
  for (const adcode of PROVINCES) {
    try {
      const geo = await fetchJsonWithFallback([
        `https://raw.githubusercontent.com/zhChuXiao/ChinaGeoJson/master/province/${adcode}.json`,
        `https://cdn.jsdelivr.net/gh/zhChuXiao/ChinaGeoJson@master/province/${adcode}.json`,
        `https://geo.datav.aliyun.com/areas_v3/bound/${adcode}_full.json`
      ], `province ${adcode}`);
      await writeFile(path.join(PROVINCE_ROOT, `${adcode}.json`), JSON.stringify(geo));
    } catch (err) {
      failures.push(`${adcode}: ${err.message}`);
      console.warn(`⚠ ${adcode} could not be prepared.`);
    }
  }

  // Mainland/municipality/province files used by the current travel data must exist.
  // We keep non-critical remote fallbacks in app.js for any file that could not be generated.
  const REQUIRED = [
    '110000','130000','150000','210000','220000','230000','310000','320000',
    '330000','340000','350000','370000','510000','520000','610000','640000','650000'
  ];
  const requiredFailures = failures.filter(line => REQUIRED.some(code => line.startsWith(code + ':')));
  if (requiredFailures.length) {
    throw new Error(`Required province GeoJSON files failed:\n${requiredFailures.join('\n')}`);
  }

  if (failures.length) {
    console.warn(`Completed with ${failures.length} optional province file(s) missing; browser fallbacks remain enabled.`);
  } else {
    console.log(`✓ Prepared country + ${PROVINCES.length} province-level GeoJSON files.`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
