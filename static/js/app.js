"use strict";
/* =========================================================================
   STATE
========================================================================= */
const State = {
  data: [],
  filtered: [],
  filters: { factory:'all', region:'all', mode:'all', division:'all', dateFrom:'', dateTo:'', search:'' },
  theme: 'light',
  currency: 'USD',
  sidebarCollapsed: false,
  charts: {},
  map: null, mapLayer: null,
  routeSort: { key:'shipments', dir:'desc' },
  custSort: { key:'shipments', dir:'desc' },
  routePage: 1, custPage: 1, pageSize: 10,
  routeSearch: '', custSearch: '',
  source: { label:'Sample Data', rows:0, unmapped:0 }
};
const CURRENCY_SYMBOL = { USD:'$', EUR:'€', GBP:'£', CAD:'$' };

/* =========================================================================
   REFERENCE DATA — Nassau Candy factories / products / customer geography
========================================================================= */
const FACTORIES = [
  { id:'PLT-01', name:"Lot's O' Nuts",      lat:33.2148, lng:-97.1331, city:'Denton, TX',    emoji:'🥜', color:'#2563EB' },
  { id:'PLT-02', name:"Wicked Chocolate's", lat:32.7767, lng:-96.7970, city:'Dallas, TX',    emoji:'🍫', color:'#7C3AED' },
  { id:'PLT-03', name:'Sugar Shack',        lat:40.3356, lng:-75.9269, city:'Reading, PA',   emoji:'🍬', color:'#06B6D4' },
  { id:'PLT-04', name:'Secret Factory',     lat:40.6023, lng:-75.4714, city:'Allentown, PA', emoji:'🎩', color:'#F59E0B' },
  { id:'PLT-05', name:'The Other Factory',  lat:40.7357, lng:-74.1724, city:'Newark, NJ',    emoji:'🏭', color:'#22C55E' }
];
const PRODUCTS = [
  { name:"Wonka Bar - Nutty Crunch Surprise", division:'Chocolate', plant:'PLT-01' },
  { name:"Wonka Bar - Fudge Mallows",         division:'Chocolate', plant:'PLT-01' },
  { name:"Wonka Bar - Scrumdiddlyumptious",   division:'Chocolate', plant:'PLT-01' },
  { name:"Wonka Bar - Milk Chocolate",        division:'Chocolate', plant:'PLT-02' },
  { name:"Wonka Bar - Triple Dazzle Caramel", division:'Chocolate', plant:'PLT-02' },
  { name:'Lickety Tips',                      division:'Sugar', plant:'PLT-03' },
  { name:'Sweet Tarts',                       division:'Sugar', plant:'PLT-03' },
  { name:"Bertie's Every Flavour Beans",      division:'Sugar', plant:'PLT-03' },
  { name:'Fizzy Lifting Drinks',              division:'Sugar', plant:'PLT-03' },
  { name:'Everlasting Gobstopper',            division:'Sugar', plant:'PLT-04' },
  { name:'Hair Toffee',                       division:'Sugar', plant:'PLT-05' },
  { name:'Invisible Wallpaper',               division:'Other', plant:'PLT-05' },
  { name:'Wonka Gum',                         division:'Other', plant:'PLT-04' },
  { name:'Kazookles',                         division:'Other', plant:'PLT-05' }
];
const DIVISION_FACTORY_MAP = {
  'chocolate':'PLT-01', 'candy':'PLT-01', 'confections':'PLT-01',
  'sugar':'PLT-03', 'sweets':'PLT-03',
  'other':'PLT-05', 'furniture':'PLT-05', 'office supplies':'PLT-04', 'technology':'PLT-04'
};
const CUSTOMER_CITIES = [
  {city:'New York',lat:40.7128,lng:-74.0060,state:'NY',region:'Northeast',country:'United States'},
  {city:'Boston',lat:42.3601,lng:-71.0589,state:'MA',region:'Northeast',country:'United States'},
  {city:'Philadelphia',lat:39.9526,lng:-75.1652,state:'PA',region:'Northeast',country:'United States'},
  {city:'Pittsburgh',lat:40.4406,lng:-79.9959,state:'PA',region:'Northeast',country:'United States'},
  {city:'Baltimore',lat:39.2904,lng:-76.6129,state:'MD',region:'Northeast',country:'United States'},
  {city:'Washington',lat:38.9072,lng:-77.0369,state:'DC',region:'Northeast',country:'United States'},
  {city:'Buffalo',lat:42.8864,lng:-78.8784,state:'NY',region:'Northeast',country:'United States'},
  {city:'Newark',lat:40.7357,lng:-74.1724,state:'NJ',region:'Northeast',country:'United States'},
  {city:'Jersey City',lat:40.7178,lng:-74.0431,state:'NJ',region:'Northeast',country:'United States'},
  {city:'Rochester',lat:43.1566,lng:-77.6088,state:'NY',region:'Northeast',country:'United States'},
  {city:'Atlanta',lat:33.7490,lng:-84.3880,state:'GA',region:'Southeast',country:'United States'},
  {city:'Miami',lat:25.7617,lng:-80.1918,state:'FL',region:'Southeast',country:'United States'},
  {city:'Orlando',lat:28.5383,lng:-81.3792,state:'FL',region:'Southeast',country:'United States'},
  {city:'Tampa',lat:27.9506,lng:-82.4572,state:'FL',region:'Southeast',country:'United States'},
  {city:'Jacksonville',lat:30.3322,lng:-81.6559,state:'FL',region:'Southeast',country:'United States'},
  {city:'Charlotte',lat:35.2271,lng:-80.8431,state:'NC',region:'Southeast',country:'United States'},
  {city:'Raleigh',lat:35.7796,lng:-78.6389,state:'NC',region:'Southeast',country:'United States'},
  {city:'Nashville',lat:36.1627,lng:-86.7816,state:'TN',region:'Southeast',country:'United States'},
  {city:'Memphis',lat:35.1495,lng:-90.0490,state:'TN',region:'Southeast',country:'United States'},
  {city:'New Orleans',lat:29.9511,lng:-90.0715,state:'LA',region:'Southeast',country:'United States'},
  {city:'Richmond',lat:37.5407,lng:-77.4360,state:'VA',region:'Southeast',country:'United States'},
  {city:'Chicago',lat:41.8781,lng:-87.6298,state:'IL',region:'Midwest',country:'United States'},
  {city:'Detroit',lat:42.3314,lng:-83.0458,state:'MI',region:'Midwest',country:'United States'},
  {city:'Columbus',lat:39.9612,lng:-82.9984,state:'OH',region:'Midwest',country:'United States'},
  {city:'Cleveland',lat:41.4993,lng:-81.6944,state:'OH',region:'Midwest',country:'United States'},
  {city:'Cincinnati',lat:39.1031,lng:-84.5120,state:'OH',region:'Midwest',country:'United States'},
  {city:'Minneapolis',lat:44.9778,lng:-93.2650,state:'MN',region:'Midwest',country:'United States'},
  {city:'St. Louis',lat:38.6270,lng:-90.1994,state:'MO',region:'Midwest',country:'United States'},
  {city:'Kansas City',lat:39.0997,lng:-94.5787,state:'MO',region:'Midwest',country:'United States'},
  {city:'Indianapolis',lat:39.7684,lng:-86.1581,state:'IN',region:'Midwest',country:'United States'},
  {city:'Milwaukee',lat:43.0389,lng:-87.9065,state:'WI',region:'Midwest',country:'United States'},
  {city:'Houston',lat:29.7604,lng:-95.3698,state:'TX',region:'Southwest',country:'United States'},
  {city:'San Antonio',lat:29.4241,lng:-98.4931,state:'TX',region:'Southwest',country:'United States'},
  {city:'Austin',lat:30.2672,lng:-97.7431,state:'TX',region:'Southwest',country:'United States'},
  {city:'Dallas',lat:32.7767,lng:-96.7970,state:'TX',region:'Southwest',country:'United States'},
  {city:'Fort Worth',lat:32.7555,lng:-97.3308,state:'TX',region:'Southwest',country:'United States'},
  {city:'Phoenix',lat:33.4484,lng:-112.0740,state:'AZ',region:'Southwest',country:'United States'},
  {city:'Tucson',lat:32.2226,lng:-110.9740,state:'AZ',region:'Southwest',country:'United States'},
  {city:'Albuquerque',lat:35.0844,lng:-106.6504,state:'NM',region:'Southwest',country:'United States'},
  {city:'Oklahoma City',lat:35.4676,lng:-97.5164,state:'OK',region:'Southwest',country:'United States'},
  {city:'Los Angeles',lat:34.0522,lng:-118.2437,state:'CA',region:'West',country:'United States'},
  {city:'San Francisco',lat:37.7749,lng:-122.4194,state:'CA',region:'West',country:'United States'},
  {city:'San Diego',lat:32.7157,lng:-117.1611,state:'CA',region:'West',country:'United States'},
  {city:'San Jose',lat:37.3382,lng:-121.8863,state:'CA',region:'West',country:'United States'},
  {city:'Sacramento',lat:38.5816,lng:-121.4944,state:'CA',region:'West',country:'United States'},
  {city:'Seattle',lat:47.6062,lng:-122.3321,state:'WA',region:'West',country:'United States'},
  {city:'Denver',lat:39.7392,lng:-104.9903,state:'CO',region:'West',country:'United States'},
  {city:'Portland',lat:45.5152,lng:-122.6782,state:'OR',region:'West',country:'United States'},
  {city:'Las Vegas',lat:36.1699,lng:-115.1398,state:'NV',region:'West',country:'United States'},
  {city:'Salt Lake City',lat:40.7608,lng:-111.8910,state:'UT',region:'West',country:'United States'},
  {city:'Toronto',lat:43.6532,lng:-79.3832,state:'ON',region:'Northeast',country:'Canada'},
  {city:'Montreal',lat:45.5019,lng:-73.5674,state:'QC',region:'Northeast',country:'Canada'}
];
const STATE_CENTROIDS = {
  AL:[32.8,-86.8],AK:[61.4,-152.4],AZ:[34.2,-111.7],AR:[34.9,-92.4],CA:[36.8,-119.6],CO:[39.1,-105.4],
  CT:[41.6,-72.7],DE:[39.0,-75.5],FL:[27.8,-81.7],GA:[32.9,-83.4],HI:[20.8,-156.4],ID:[44.2,-114.5],
  IL:[40.0,-89.2],IN:[39.9,-86.1],IA:[42.0,-93.5],KS:[38.5,-98.0],KY:[37.7,-84.9],LA:[31.0,-92.0],
  ME:[45.4,-69.0],MD:[39.0,-76.7],MA:[42.3,-71.5],MI:[44.3,-85.6],MN:[46.4,-94.6],MS:[32.7,-89.7],
  MO:[38.5,-92.5],MT:[47.0,-109.6],NE:[41.5,-99.7],NV:[39.3,-116.5],NH:[43.7,-71.5],NJ:[40.1,-74.7],
  NM:[34.5,-106.0],NY:[42.9,-75.5],NC:[35.6,-79.4],ND:[47.5,-99.8],OH:[40.4,-82.4],OK:[35.6,-97.5],
  OR:[43.9,-120.6],PA:[40.9,-77.7],RI:[41.7,-71.5],SC:[33.9,-80.9],SD:[44.4,-100.2],TN:[35.9,-86.4],
  TX:[31.5,-99.3],UT:[39.3,-111.7],VT:[44.0,-72.7],VA:[37.4,-78.6],WA:[47.4,-121.5],WV:[38.6,-80.6],
  WI:[44.6,-89.7],WY:[43.0,-107.5],DC:[38.9,-77.0]
};
const SHIP_MODES = ['Standard Shipping','Expedited Shipping','Priority Shipping','Second Class','First Class','Same Day'];
const MODE_SPEED = { 'Standard Shipping':1, 'Expedited Shipping':0.65, 'Priority Shipping':0.42, 'Second Class':0.75, 'First Class':0.5, 'Same Day':0.18 };
const MODE_RATE  = { 'Standard Shipping':1, 'Expedited Shipping':1.35, 'Priority Shipping':1.75, 'Second Class':1.15, 'First Class':1.5, 'Same Day':2.4 };

const FIELD_ALIASES = {
  rowId:        ['row id','rowid','id','row','#'],
  orderId:      ['order id','orderid'],
  orderDate:    ['order date','orderdate'],
  shipDate:     ['ship date','shipdate','dispatch date','dispatchdate'],
  arrivalDate:  ['arrival date','arrivaldate','delivery date','deliverydate'],
  shipMode:     ['ship mode','shipmode','shipping mode'],
  shipCode:     ['ship code','shipcode'],
  customerId:   ['customer id','customerid'],
  customerName: ['customer name','customername'],
  segment:      ['segment'],
  country:      ['country/region','country','countryregion'],
  city:         ['city'],
  state:        ['state/province','state','province'],
  postalCode:   ['postal code','postalcode','zip code','zip','zipcode'],
  region:       ['region'],
  division:     ['division','category'],
  subCategory:  ['sub-category','subcategory','sub category'],
  productId:    ['product id','productid'],
  productName:  ['product name','productname','product'],
  sales:        ['sales','revenue'],
  units:        ['units','quantity','qty'],
  discount:     ['discount'],
  grossProfit:  ['gross profit','grossprofit','profit'],
  cost:         ['cost','unit cost','shipping cost'],
  plantId:      ['plant id','plantid'],
  plantName:    ['plant name','plantname','factory','factory name'],
  latitude:     ['latitude','lat'],
  longitude:    ['longitude','lng','long'],
  distance:     ['distance','distance (km)','distance_km','distance km'],
  weight:       ['weight'],
  deliveryDays: ['delivery days','deliverydays','lead time','lead time (days)','leadtime']
};
function normalizeHeader(h){ return String(h||'').toLowerCase().replace(/[^a-z0-9]/g,''); }
function resolveSchema(headers){
  const normMap = headers.map(h=>({ raw:h, norm: String(h||'').toLowerCase().trim() }));
  const mapping = {};
  Object.entries(FIELD_ALIASES).forEach(([canon, aliases])=>{
    const hit = normMap.find(h => aliases.includes(h.norm) || aliases.some(a=>normalizeHeader(a)===normalizeHeader(h.raw)));
    if(hit) mapping[canon] = hit.raw;
  });
  return mapping;
}

function mean(arr){ return arr.length? arr.reduce((a,b)=>a+b,0)/arr.length : null; }
function stdev(arr){ if(arr.length<2) return 0; const m=mean(arr); return Math.sqrt(arr.reduce((s,v)=>s+(v-m)**2,0)/arr.length); }
function percentile(arr,p){
  if(!arr.length) return null;
  const s=[...arr].sort((a,b)=>a-b); const idx=(p/100)*(s.length-1);
  const lo=Math.floor(idx), hi=Math.ceil(idx);
  return lo===hi ? s[lo] : s[lo] + (s[hi]-s[lo])*(idx-lo);
}
function clamp(v,lo,hi){ return Math.min(hi,Math.max(lo,v)); }
function parseDateSafe(v){ if(v===undefined||v===null||v==='') return null; const d=new Date(v); return isNaN(d.getTime())? null : d; }
function haversine(lat1,lon1,lat2,lon2){
  const R=6371, toRad=d=>d*Math.PI/180;
  const dLat=toRad(lat2-lat1), dLon=toRad(lon2-lon1);
  const a=Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}
function rand(min,max){ return Math.random()*(max-min)+min; }
function randInt(min,max){ return Math.floor(rand(min,max+1)); }
function pick(arr){ return arr[randInt(0,arr.length-1)]; }
function fmtMoney(v){
  if(v===null||v===undefined||isNaN(v)) return 'N/A';
  const sym = CURRENCY_SYMBOL[State.currency];
  return sym + Number(v).toLocaleString(undefined,{maximumFractionDigits:0});
}
function fmtNum(v,d=0){ return (v===null||v===undefined||isNaN(v)) ? 'N/A' : Number(v).toLocaleString(undefined,{maximumFractionDigits:d}); }
function fmtDate(d){ return d.toISOString().slice(0,10); }
function uid(prefix){ return prefix+'-'+Math.random().toString(36).slice(2,8).toUpperCase(); }
function cssVar(name){ return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
function hashToIndex(str,mod){ let h=0; for(let i=0;i<str.length;i++) h=(h*31+str.charCodeAt(i))>>>0; return h%mod; }

function assignFactory(explicitId, explicitName, productName, division){
  if(explicitId){ const f=FACTORIES.find(f=>f.id===explicitId); if(f) return f; }
  if(explicitName){ const f=FACTORIES.find(f=>f.name.toLowerCase()===String(explicitName).toLowerCase()); if(f) return f; }
  if(productName){
    const p = PRODUCTS.find(p=>p.name.toLowerCase()===String(productName).toLowerCase());
    if(p) return FACTORIES.find(f=>f.id===p.plant);
  }
  if(division){
    const key = String(division).toLowerCase().trim();
    if(DIVISION_FACTORY_MAP[key]) return FACTORIES.find(f=>f.id===DIVISION_FACTORY_MAP[key]);
    return FACTORIES[hashToIndex(key, FACTORIES.length)];
  }
  return FACTORIES[0];
}

function geocodeCustomer(explicitLat, explicitLng, city, state, country){
  if(explicitLat!=null && explicitLng!=null && !isNaN(explicitLat) && !isNaN(explicitLng)){
    return { lat:explicitLat, lng:explicitLng, precise:true };
  }
  if(city){
    const norm = String(city).toLowerCase().trim();
    const hit = CUSTOMER_CITIES.find(c=>c.city.toLowerCase()===norm && (!state || c.state.toLowerCase()===String(state).toLowerCase()))
             || CUSTOMER_CITIES.find(c=>c.city.toLowerCase()===norm);
    if(hit) return { lat:hit.lat, lng:hit.lng, precise:true };
  }
  if(state){
    const key = String(state).toUpperCase().trim();
    if(STATE_CENTROIDS[key]) return { lat:STATE_CENTROIDS[key][0], lng:STATE_CENTROIDS[key][1], precise:false };
  }
  return null;
}
function resolveRegion(explicitRegion, city, state){
  if(explicitRegion) return explicitRegion;
  if(city){
    const hit = CUSTOMER_CITIES.find(c=>c.city.toLowerCase()===String(city).toLowerCase());
    if(hit) return hit.region;
  }
  return 'Unspecified';
}

function ingest(rawRows, headers, sourceLabel){
  const mapping = resolveSchema(headers);
  const get = (row,key) => mapping[key] ? row[mapping[key]] : undefined;
  const matchedFields = Object.keys(mapping).length;

  const seen = new Set();
  let duplicates = 0, missingValueCells = 0, invalidCoords = 0, invalidDates = 0, negativeNumbers = 0, invalidCost = 0;
  let unresolvedGeocode = 0;

  const records = rawRows.map((row,i)=>{
    const dupKey = JSON.stringify(row);
    if(seen.has(dupKey)) duplicates++; else seen.add(dupKey);

    const orderDate = parseDateSafe(get(row,'orderDate'));
    const shipDate = parseDateSafe(get(row,'shipDate'));
    const arrivalDate = parseDateSafe(get(row,'arrivalDate'));
    if(get(row,'orderDate')!==undefined && !orderDate) invalidDates++;
    if(get(row,'shipDate')!==undefined && !shipDate) invalidDates++;

    let leadTimeDays = null;
    const explicitDD = parseFloat(get(row,'deliveryDays'));
    if(!isNaN(explicitDD)) leadTimeDays = explicitDD;
    else if(orderDate && shipDate) leadTimeDays = Math.round((shipDate-orderDate)/86400000);
    else if(shipDate && arrivalDate) leadTimeDays = Math.round((arrivalDate-shipDate)/86400000);
    if(leadTimeDays!=null && leadTimeDays<0){ negativeNumbers++; leadTimeDays = null; }

    const sales = parseFloat(get(row,'sales')); const salesVal = isNaN(sales)? null : sales;
    const units = parseFloat(get(row,'units')); const unitsVal = isNaN(units)? null : units;
    const grossProfit = parseFloat(get(row,'grossProfit')); const gpVal = isNaN(grossProfit)? null : grossProfit;
    let cost = parseFloat(get(row,'cost'));
    if(isNaN(cost)){
      cost = (salesVal!=null && gpVal!=null) ? (salesVal-gpVal) : null;
    }
    if(cost!=null && cost<0){ negativeNumbers++; }
    if(cost!=null && cost<=0){ invalidCost++; }
    if(get(row,'cost')!==undefined && (cost==null)) invalidCost++;

    const weight = parseFloat(get(row,'weight')); const weightVal = isNaN(weight)? null : weight;
    if(weightVal!=null && weightVal<0) negativeNumbers++;

    const explicitDistance = parseFloat(get(row,'distance'));
    const distanceVal = isNaN(explicitDistance) ? null : explicitDistance;
    if(distanceVal!=null && distanceVal<0) negativeNumbers++;

    const productName = get(row,'productName') || null;
    const division = get(row,'division') || null;
    const factory = assignFactory(get(row,'plantId'), get(row,'plantName'), productName, division);

    const rawLat = parseFloat(get(row,'latitude')), rawLng = parseFloat(get(row,'longitude'));
    if(get(row,'latitude')!==undefined && (isNaN(rawLat) || rawLat<-90 || rawLat>90)) invalidCoords++;
    if(get(row,'longitude')!==undefined && (isNaN(rawLng) || rawLng<-180 || rawLng>180)) invalidCoords++;

    const city = get(row,'city') || null;
    const state = get(row,'state') || null;
    const country = get(row,'country') || null;
    const geo = geocodeCustomer(isNaN(rawLat)?null:rawLat, isNaN(rawLng)?null:rawLng, city, state, country);
    if(!geo) unresolvedGeocode++;

    let distance = distanceVal;
    if(distance==null && geo) distance = Math.round(haversine(factory.lat,factory.lng, geo.lat, geo.lng) * 1.2);

    REQUIRED_LIKE_FIELDS.forEach(f=>{ if(get(row,f)===undefined) missingValueCells++; else if(String(get(row,f)).trim()==='') missingValueCells++; });

    return {
      rowId: get(row,'rowId') || (i+1),
      orderId: get(row,'orderId') || null,
      customerId: get(row,'customerId') || uid('CUST'),
      customerName: get(row,'customerName') || 'Unknown Customer',
      shipCode: get(row,'shipCode') || null,
      shipMode: get(row,'shipMode') || 'Unspecified',
      city: city || 'N/A', state: state || null, country: country || 'N/A',
      region: resolveRegion(get(row,'region'), city, state),
      division: division || 'Unspecified', product: productName || 'Unspecified',
      sales: salesVal, units: unitsVal, grossProfit: gpVal, cost, weight: weightVal,
      dispatchDate: get(row,'shipDate') || get(row,'orderDate') || null,
      arrivalDate: get(row,'arrivalDate') || null,
      deliveryDays: leadTimeDays, distance,
      plantId: factory.id, plantName: factory.name, plantLat: factory.lat, plantLng: factory.lng,
      customerLat: geo? geo.lat : null, customerLng: geo? geo.lng : null, geocoded: !!geo,
      costPerUnit: (cost!=null && unitsVal) ? cost/unitsVal : null,
      costPerKm: (cost!=null && distance) ? cost/distance : null,
      efficiency:null, risk:null, performance:null, onTime:null, delay:null
    };
  });

  computeDerivedMetrics(records);

  const report = {
    totalRows: rawRows.length, matchedFields, totalCanonicalFields: Object.keys(FIELD_ALIASES).length,
    mapping, duplicates, missingValueCells, invalidCoords, invalidDates, negativeNumbers, invalidCost,
    unresolvedGeocode
  };
  State.source = { label: sourceLabel, rows: records.length, unmapped: unresolvedGeocode };
  return { records, report };
}
const REQUIRED_LIKE_FIELDS = ['orderDate','shipDate','shipMode','customerId','region','productName','sales','cost'];

function computeDerivedMetrics(records){
  const leadVals = records.map(r=>r.deliveryDays).filter(v=>v!=null);
  const costMetricVals = records.map(r=> r.costPerKm!=null? r.costPerKm : r.costPerUnit).filter(v=>v!=null);
  const leadMean = mean(leadVals), leadStd = stdev(leadVals), leadP75 = percentile(leadVals,75);
  const cmMean = mean(costMetricVals), cmStd = stdev(costMetricVals);

  records.forEach(r=>{
    const parts = [];
    if(r.deliveryDays!=null && leadStd>0){ const z=(r.deliveryDays-leadMean)/leadStd; parts.push(clamp(70-14*z,0,100)); }
    const cm = r.costPerKm!=null? r.costPerKm : r.costPerUnit;
    if(cm!=null && cmStd>0){ const z=(cm-cmMean)/cmStd; parts.push(clamp(70-14*z,0,100)); }
    if(r.grossProfit!=null && r.sales){ const margin=(r.grossProfit/r.sales)*100; parts.push(clamp(50+margin,0,100)); }

    r.efficiency = parts.length? Math.round(clamp(parts.reduce((a,b)=>a+b,0)/parts.length,0,100)) : null;
    r.risk = r.efficiency!=null ? Math.round(100-r.efficiency) : null;
    r.performance = r.efficiency;

    if(r.deliveryDays!=null && leadP75!=null){
      r.onTime = r.deliveryDays <= leadP75;
      r.delay = Math.max(0, Math.round(r.deliveryDays - leadP75));
    } else { r.onTime = null; r.delay = null; }
  });
}

function generateSampleRows(n=500){
  const rows = [];
  const start = new Date(); start.setFullYear(start.getFullYear()-1);
  for(let i=0;i<n;i++){
    const product = pick(PRODUCTS);
    const custCity = pick(CUSTOMER_CITIES);
    const mode = pick(['Standard Shipping','Expedited Shipping','Priority Shipping','Same Day']);
    const orderDate = new Date(start.getTime() + Math.random()*(Date.now()-start.getTime()));
    const factory = FACTORIES.find(f=>f.id===product.plant);
    const straight = haversine(factory.lat,factory.lng,custCity.lat,custCity.lng);
    const distance = Math.round(straight*rand(1.15,1.4));
    const leadDays = Math.max(1, Math.round((distance/550)*MODE_SPEED[mode] + rand(0,2)));
    const shipDate = new Date(orderDate.getTime() + leadDays*86400000);
    const units = randInt(1,40);
    const sales = Math.round(rand(40,900)*100)/100;
    const margin = rand(0.05,0.35);
    const grossProfit = Math.round(sales*margin*100)/100;
    const cost = Math.round((sales-grossProfit)*100)/100;
    rows.push({
      'Row ID': i+1, 'Order ID': uid('ORD'), 'Order Date': fmtDate(orderDate), 'Ship Date': fmtDate(shipDate),
      'Ship Mode': mode, 'Customer ID': uid('CUST'), 'Customer Name': `${custCity.city} Retail Partner #${randInt(100,999)}`,
      'Country/Region': custCity.country, 'City': custCity.city, 'State/Province': custCity.state, 'Postal Code': randInt(10000,99999),
      'Division': product.division, 'Region': custCity.region, 'Product ID': uid('PRD'), 'Product Name': product.name,
      'Sales': sales, 'Units': units, 'Gross Profit': grossProfit, 'Cost': cost
    });
  }
  return rows;
}

function applyFilters(){
  const f = State.filters;
  State.filtered = State.data.filter(r=>{
    if(f.factory!=='all' && r.plantId!==f.factory) return false;
    if(f.region!=='all' && r.region!==f.region) return false;
    if(f.mode!=='all' && r.shipMode!==f.mode) return false;
    if(f.division!=='all' && r.division!==f.division) return false;
    if(f.dateFrom && r.dispatchDate && r.dispatchDate < f.dateFrom) return false;
    if(f.dateTo && r.dispatchDate && r.dispatchDate > f.dateTo) return false;
    if(f.search){
      const q=f.search.toLowerCase();
      const hay=(r.plantName+' '+r.customerName+' '+r.city+' '+r.product+' '+(r.shipCode||'')).toLowerCase();
      if(!hay.includes(q)) return false;
    }
    return true;
  });
  renderActivePage();
}

function buildFilterBarHTML(idPrefix){
  const regions=[...new Set(State.data.map(r=>r.region))].sort();
  const divisions=[...new Set(State.data.map(r=>r.division))].sort();
  const modes=[...new Set(State.data.map(r=>r.shipMode))].sort();
  return `
  <div class="filterbar">
    <div class="fgroup"><label>Factory</label>
      <select id="${idPrefix}Factory"><option value="all">All Factories</option>${FACTORIES.map(f=>`<option value="${f.id}">${f.name}</option>`).join('')}</select>
    </div>
    <div class="fgroup"><label>Region</label>
      <select id="${idPrefix}Region"><option value="all">All Regions</option>${regions.map(r=>`<option value="${r}">${r}</option>`).join('')}</select>
    </div>
    <div class="fgroup"><label>Ship Mode</label>
      <select id="${idPrefix}Mode"><option value="all">All Modes</option>${modes.map(m=>`<option value="${m}">${m}</option>`).join('')}</select>
    </div>
    <div class="fgroup"><label>Division</label>
      <select id="${idPrefix}Division"><option value="all">All Divisions</option>${divisions.map(d=>`<option value="${d}">${d}</option>`).join('')}</select>
    </div>
    <div class="fgroup"><label>From</label><input type="date" id="${idPrefix}From"></div>
    <div class="fgroup"><label>To</label><input type="date" id="${idPrefix}To"></div>
    <div class="fgroup"><label>&nbsp;</label><button class="btn btn-ghost btn-sm" id="${idPrefix}Reset">↺ Reset Filters</button></div>
  </div>`;
}
function wireFilterBar(idPrefix){
  const map = { Factory:'factory', Region:'region', Mode:'mode', Division:'division', From:'dateFrom', To:'dateTo' };
  Object.entries(map).forEach(([suf,key])=>{
    const el = document.getElementById(idPrefix+suf);
    if(!el) return;
    el.value = State.filters[key] || (key.startsWith('date')?'':'all');
    el.addEventListener(el.tagName==='SELECT'?'change':'input', ()=>{ State.filters[key]=el.value; applyFilters(); syncAllFilterBars(); });
  });
  const resetBtn = document.getElementById(idPrefix+'Reset');
  if(resetBtn) resetBtn.addEventListener('click', ()=>{
    State.filters = { factory:'all', region:'all', mode:'all', division:'all', dateFrom:'', dateTo:'', search:'' };
    applyFilters(); syncAllFilterBars();
    toast('info','Filters reset','Showing the full dataset again.');
  });
}
function syncAllFilterBars(){
  ['globalFilterMount','routesFilterMount'].forEach(mountId=>{
    const mount = document.getElementById(mountId);
    if(!mount || !mount.dataset.prefix) return;
    const prefix = mount.dataset.prefix;
    const map = { Factory:'factory', Region:'region', Mode:'mode', Division:'division', From:'dateFrom', To:'dateTo' };
    Object.entries(map).forEach(([suf,key])=>{
      const el = document.getElementById(prefix+suf);
      if(el) el.value = State.filters[key] || (key.startsWith('date')?'':'all');
    });
  });
}
function mountFilterBar(mountId, prefix){
  const mount = document.getElementById(mountId);
  mount.dataset.prefix = prefix;
  mount.innerHTML = buildFilterBarHTML(prefix);
  wireFilterBar(prefix);
}

function toast(type,title,msg){
  const stack = document.getElementById('toastStack');
  const icons = { success:'✅', warn:'⚠️', info:'ℹ️' };
  const el = document.createElement('div');
  el.className = 'toast '+type;
  el.innerHTML = `<span class="ic">${icons[type]||'ℹ️'}</span><div class="body"><b>${title}</b><span>${msg||''}</span></div>`;
  stack.appendChild(el);
  setTimeout(()=>{ el.style.transition='all .4s ease'; el.style.opacity='0'; el.style.transform='translateX(30px)'; setTimeout(()=>el.remove(),400); }, 3800);
}

function destroyChart(key){ if(State.charts[key]){ State.charts[key].destroy(); delete State.charts[key]; } }
function makeChart(key, ctxId, config){
  destroyChart(key);
  const ctx = document.getElementById(ctxId);
  if(!ctx) return;
  State.charts[key] = new Chart(ctx, config);
}
function baseChartOptions({dualAxis=false}={}){
  const opt = { responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{ position:'bottom', labels:{ color:cssVar('--text-dim'), boxWidth:10, font:{size:11} } } },
    scales:{ x:{ grid:{display:false}, ticks:{color:cssVar('--text-dim'), font:{size:10.5}} },
             y:{ grid:{color:cssVar('--border')}, ticks:{color:cssVar('--text-dim')}, beginAtZero:true } } };
  if(dualAxis){ opt.scales.y1 = { position:'right', grid:{display:false}, ticks:{color:cssVar('--text-dim')}, min:0, max:100 }; }
  return opt;
}

const PAGE_TITLES = {
  dashboard:'Dashboard', upload:'Upload Dataset', routes:'Route Analysis', distance:'Distance Analysis',
  efficiency:'Efficiency Analysis', map:'Interactive Map', factories:'Factory Information',
  customers:'Customer Information', analytics:'Analytics', reports:'Reports', settings:'Settings'
};
let currentPage = 'dashboard';
function goToPage(page){
  currentPage = page;
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-'+page).classList.add('active');
  document.querySelectorAll('.navitem').forEach(n=>n.classList.toggle('active', n.dataset.page===page));
  document.getElementById('crumbPage').textContent = PAGE_TITLES[page];
  if(window.innerWidth<=900) document.getElementById('sidebar').classList.remove('mobile-open');
  renderActivePage();
}
function renderActivePage(){
  switch(currentPage){
    case 'dashboard': renderDashboard(); break;
    case 'upload': renderUploadPreview(); break;
    case 'routes': renderRoutesPage(); break;
    case 'distance': renderDistancePage(); break;
    case 'efficiency': renderEfficiencyPage(); break;
    case 'map': renderMapPage(); break;
    case 'factories': renderFactoriesPage(); break;
    case 'customers': renderCustomersPage(); break;
    case 'analytics': renderAnalyticsPage(); break;
  }
}

function avgOf(rows, key){ const vals = rows.map(r=>r[key]).filter(v=>v!=null && !isNaN(v)); return vals.length? mean(vals) : null; }
function aggregate(rows){
  const onTimeRows = rows.filter(r=>r.onTime!=null);
  return {
    count: rows.length,
    avgCost: avgOf(rows,'cost'), avgDistance: avgOf(rows,'distance'), avgDays: avgOf(rows,'deliveryDays'),
    avgEfficiency: avgOf(rows,'efficiency'),
    onTimePct: onTimeRows.length? (onTimeRows.filter(r=>r.onTime).length/onTimeRows.length)*100 : null,
    lateCount: rows.filter(r=>r.onTime===false).length,
    factories: new Set(rows.map(r=>r.plantId)).size,
    customers: new Set(rows.map(r=>r.customerId)).size,
    geocodedPct: rows.length? (rows.filter(r=>r.geocoded).length/rows.length)*100 : null
  };
}
function routeAggregates(rows){
  const map = new Map();
  rows.forEach(r=>{
    const key = r.plantId+'|'+r.region;
    if(!map.has(key)) map.set(key,{ plantId:r.plantId, plantName:r.plantName, region:r.region, rows:[] });
    map.get(key).rows.push(r);
  });
  return [...map.values()].map(g=>{
    const a = aggregate(g.rows);
    return { route: `${g.plantName} → ${g.region}`, plantId:g.plantId, plantName:g.plantName, region:g.region,
      shipments:a.count, avgCost:a.avgCost, avgDistance:a.avgDistance, avgDays:a.avgDays,
      efficiency:a.avgEfficiency, onTimePct:a.onTimePct };
  });
}

function renderDashboard(){
  mountFilterBar('globalFilterMount','gf');
  const rows = State.filtered;
  const a = aggregate(rows);

  const kpis = [
    { label:'Total Shipments', value:fmtNum(a.count), icon:'📦', delta:`from ${State.source.label}`, up:true },
    { label:'Factories Active', value:fmtNum(a.factories), icon:'🏭', delta:`of ${FACTORIES.length} total`, up:true },
    { label:'Customers Served', value:fmtNum(a.customers), icon:'👥', delta:'unique destinations', up:true },
    { label:'Avg Distance', value:a.avgDistance!=null? fmtNum(a.avgDistance)+' km':'N/A', icon:'📏', delta: a.geocodedPct!=null? fmtNum(a.geocodedPct)+'% geocoded':'—', up:null },
    { label:'Avg Cost', value:fmtMoney(a.avgCost), icon:'💰', delta:'per shipment', up:null },
    { label:'Avg Lead Time', value: a.avgDays!=null? fmtNum(a.avgDays,1)+' days':'N/A', icon:'⏱', delta:'order → ship', up:null },
    { label:'Fleet Efficiency', value: a.avgEfficiency!=null? fmtNum(a.avgEfficiency)+'%':'N/A', icon:'⚡', delta:'computed score', up:true },
    { label:'On-Time Rate', value: a.onTimePct!=null? fmtNum(a.onTimePct)+'%':'N/A', icon:'✅', delta: a.onTimePct!=null? `${a.lateCount} late (vs. dataset benchmark)`:'no lead-time data', up: a.onTimePct!=null? a.onTimePct>=75 : null }
  ];
  document.getElementById('kpiGrid').innerHTML = kpis.map(k=>`
    <div class="card kpi">
      <div class="kpi-icon">${k.icon}</div>
      <div class="kpi-label">${k.label}</div>
      <div class="kpi-value" data-count="${k.value}">0</div>
      <div class="kpi-delta ${k.up===true?'up':k.up===false?'down':''}">${k.up===true?'↑':k.up===false?'↓':'—'} ${k.delta}</div>
    </div>`).join('');
  animateCounters();

  const withDates = rows.filter(r=>parseDateSafe(r.dispatchDate));
  const weeks = []; const now = new Date();
  for(let i=11;i>=0;i--) weeks.push(new Date(now.getTime()-i*7*86400000));
  const weekly = weeks.map((wStart,idx)=>{
    const wEnd = idx<weeks.length-1? weeks[idx+1] : new Date(now.getTime()+86400000);
    const inWeek = withDates.filter(r=>{ const d=parseDateSafe(r.dispatchDate); return d>=wStart && d<wEnd; });
    return { label:`W${idx+1}`, count:inWeek.length, eff: avgOf(inWeek,'efficiency') };
  });
  if(withDates.length){
    makeChart('trend','chartTrend',{
      type:'line',
      data:{ labels:weekly.map(w=>w.label), datasets:[
        { label:'Shipments', data:weekly.map(w=>w.count), borderColor:'#2563EB', backgroundColor:'rgba(37,99,235,.12)', fill:true, tension:.4, yAxisID:'y', pointRadius:3 },
        { label:'Avg Efficiency %', data:weekly.map(w=>w.eff!=null?Math.round(w.eff):null), borderColor:'#F59E0B', backgroundColor:'rgba(245,158,11,.08)', fill:false, tension:.4, yAxisID:'y1', pointRadius:3, borderDash:[4,3], spanGaps:true }
      ]},
      options: baseChartOptions({ dualAxis:true })
    });
  } else { destroyChart('trend'); }

  const modes = [...new Set(rows.map(r=>r.shipMode))];
  const modeCount = modes.map(m=>rows.filter(r=>r.shipMode===m).length);
  makeChart('shipmode','chartShipMode',{ type:'doughnut', data:{ labels:modes, datasets:[{ data:modeCount, backgroundColor:['#2563EB','#7C3AED','#06B6D4','#F59E0B','#22C55E','#EF4444'], borderWidth:0, hoverOffset:8 }] }, options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'bottom', labels:{ color:cssVar('--text-dim'), boxWidth:10, font:{size:11} } } } } });

  const ra = routeAggregates(rows).filter(r=>r.efficiency!=null).sort((x,y)=>y.efficiency-x.efficiency);
  const top = ra.slice(0,4), bottom = ra.slice(-4).reverse();
  const combo = [...top, ...bottom];
  if(combo.length){
    makeChart('routerank','chartRouteRank',{
      type:'bar',
      data:{ labels:combo.map(r=>r.route), datasets:[{ label:'Efficiency %', data:combo.map(r=>Math.round(r.efficiency)),
        backgroundColor: combo.map((r,i)=> i<top.length ? '#22C55E' : '#EF4444'), borderRadius:6 }] },
      options:{ indexAxis:'y', responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{display:false} },
        scales:{ x:{ beginAtZero:true, max:100, grid:{color:cssVar('--border')}, ticks:{color:cssVar('--text-dim')} },
                 y:{ grid:{display:false}, ticks:{color:cssVar('--text-dim'), font:{size:10.5}} } } }
    });
  } else { destroyChart('routerank'); }

  const risky = [...rows].filter(r=>r.risk!=null).sort((x,y)=>y.risk-x.risk).slice(0,6);
  document.getElementById('attentionList').innerHTML = risky.map(r=>`
    <div class="stat-row"><span>${r.orderId||r.shipCode||('Row '+r.rowId)} · ${r.plantName} → ${r.city}</span>
      <b style="color:${r.risk>60?'var(--danger)':r.risk>35?'var(--warning)':'var(--success)'}">${r.risk}% risk</b></div>
  `).join('') || '<div class="empty">No risk-scored shipments match current filters.</div>';
}
function animateCounters(){
  document.querySelectorAll('.kpi-value[data-count]').forEach(el=>{
    const target = el.dataset.count;
    if(target==='N/A'){ el.textContent='N/A'; return; }
    const numMatch = target.match(/[\d,.]+/);
    if(!numMatch){ el.textContent = target; return; }
    const num = parseFloat(numMatch[0].replace(/,/g,''));
    const prefix = target.slice(0, numMatch.index);
    const suffix = target.slice(numMatch.index + numMatch[0].length);
    const decimals = numMatch[0].includes('.') ? numMatch[0].split('.')[1].length : 0;
    let startTs = null; const dur = 900;
    function step(ts){
      if(!startTs) startTs = ts;
      const p = Math.min(1, (ts-startTs)/dur);
      const eased = 1-Math.pow(1-p,3);
      const val = num*eased;
      el.textContent = prefix + val.toLocaleString(undefined,{minimumFractionDigits:decimals,maximumFractionDigits:decimals}) + suffix;
      if(p<1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}

function renderUploadPreview(){
  const rows = State.data.slice(0,25);
  const candidateCols = ['rowId','orderId','plantName','customerName','city','region','shipMode','division','product','sales','units','cost','grossProfit','distance','deliveryDays','dispatchDate'];
  const labels = { rowId:'Row', orderId:'Order ID', plantName:'Factory', customerName:'Customer', city:'City', region:'Region', shipMode:'Ship Mode', division:'Division', product:'Product', sales:'Sales', units:'Units', cost:'Cost', grossProfit:'Gross Profit', distance:'Distance', deliveryDays:'Lead Days', dispatchDate:'Ship Date' };
  const cols = candidateCols.filter(c => State.data.some(r=>r[c]!=null && r[c]!=='' ));
  const table = document.getElementById('previewTable');
  table.querySelector('thead').innerHTML = '<tr>'+cols.map(c=>`<th>${labels[c]}</th>`).join('')+'</tr>';
  table.querySelector('tbody').innerHTML = rows.map(r=>'<tr>'+cols.map(c=>{
    let v = r[c];
    if(c==='cost'||c==='sales'||c==='grossProfit') v = fmtMoney(v);
    else if(v==null || v==='') v='N/A';
    return `<td>${v}</td>`;
  }).join('')+'</tr>').join('');
  document.getElementById('previewCount').textContent = `Showing 25 of ${State.data.length.toLocaleString()} records · Source: ${State.source.label}`;
}

function renderValidationReport(report){
  const coverage = Math.round((report.matchedFields/report.totalCanonicalFields)*100);
  const items = [
    { n:report.totalRows, l:'Rows Parsed', cls:'ok' },
    { n:coverage+'%', l:'Fields Recognized', cls: coverage>=40? 'ok': coverage>=20 ? 'warn':'bad' },
    { n:report.missingValueCells, l:'Missing Values', cls: report.missingValueCells? 'warn':'ok' },
    { n:report.duplicates, l:'Duplicate Rows', cls: report.duplicates? 'warn':'ok' },
    { n:report.unresolvedGeocode, l:'Rows Not Mappable', cls: report.unresolvedGeocode? 'warn':'ok' },
    { n:report.invalidDates, l:'Invalid Dates', cls: report.invalidDates? 'bad':'ok' },
    { n:report.negativeNumbers, l:'Negative Numbers', cls: report.negativeNumbers? 'warn':'ok' },
    { n:report.invalidCost, l:'Invalid Cost', cls: report.invalidCost? 'warn':'ok' }
  ];
  const mappedList = Object.entries(report.mapping).map(([canon,raw])=>`<span class="badge badge-blue" style="margin:3px 4px 0 0;">${canon} ← "${raw}"</span>`).join('');
  document.getElementById('validationReport').innerHTML = `
    <div class="card-title" style="margin-top:6px;"><span class="t">🧪 Validation Report</span></div>
    <div class="validation-grid">${items.map(i=>`<div class="vcheck ${i.cls}"><div class="n">${i.n}</div><div class="l">${i.l}</div></div>`).join('')}</div>
    <div style="margin-top:14px;font-size:11.5px;color:var(--text-faint);font-weight:700;text-transform:uppercase;letter-spacing:.05em;">Detected column mapping</div>
    <div style="margin-top:8px;">${mappedList || '<span style="color:var(--text-faint);font-size:12.5px;">No recognizable columns found.</span>'}</div>`;
}

function wireUpload(){
  const dz = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  dz.addEventListener('click', ()=>fileInput.click());
  ['dragenter','dragover'].forEach(ev=>dz.addEventListener(ev,e=>{ e.preventDefault(); dz.classList.add('drag'); }));
  ['dragleave','drop'].forEach(ev=>dz.addEventListener(ev,e=>{ e.preventDefault(); dz.classList.remove('drag'); }));
  dz.addEventListener('drop', e=>{ const file=e.dataTransfer.files[0]; if(file) handleCsvFile(file); });
  fileInput.addEventListener('change', e=>{ const file=e.target.files[0]; if(file) handleCsvFile(file); });

  document.getElementById('resetToSample').addEventListener('click', ()=>{
    loadSampleData();
    toast('success','Sample data restored','500 generated Nassau Candy shipment records loaded.');
  });

  document.getElementById('downloadTemplate').addEventListener('click', ()=>{
    const csv = ['Order ID','Order Date','Ship Date','Ship Mode','Customer ID','Customer Name','Country/Region','City','State/Province','Postal Code','Division','Region','Product ID','Product Name','Sales','Units','Gross Profit','Cost'].join(',')+'\n';
    downloadBlob(csv,'nassau_candy_template.csv','text/csv');
    toast('info','Template downloaded','Generic CSV template saved — extra or missing columns are both fine.');
  });
}
function handleCsvFile(file){
  if(!file.name.toLowerCase().endsWith('.csv')){ toast('warn','Unsupported file','Please upload a .csv file.'); return; }
  Papa.parse(file, {
    header:true, skipEmptyLines:true,
    complete: res=>{
      try{
        const headers = res.meta.fields || [];
        if(!res.data.length){ toast('warn','Empty file','That CSV has no data rows.'); return; }
        const { records, report } = ingest(res.data, headers, `Uploaded: ${file.name} (${res.data.length.toLocaleString()} rows)`);
        renderValidationReport(report);
        if(report.matchedFields===0){
          toast('warn','No recognizable columns','The file was loaded, but no known fields were detected — check the column mapping below.');
        }
        State.data = records;
        applyFilters(); syncAllFilterBars();
        renderUploadPreview();
        updateSourceBadge();
        toast('success','Dataset loaded', `${records.length.toLocaleString()} rows parsed from ${file.name}. ${report.matchedFields}/${report.totalCanonicalFields} fields recognized.`);
      }catch(err){
        console.error(err);
        toast('warn','Could not process file', String(err.message||err));
      }
    },
    error: err=>toast('warn','Parse error', err.message)
  });
}
function downloadBlob(content,filename,type){
  const blob = new Blob([content], {type});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download=filename; a.click();
  URL.revokeObjectURL(url);
}
function updateSourceBadge(){
  const el = document.getElementById('crumbSource');
  if(el) el.textContent = State.source.label;
}

function renderRoutesPage(){
  mountFilterBar('routesFilterMount','rf');
  const routes = routeAggregates(State.filtered).filter(r=>{
    if(!State.routeSearch) return true;
    return r.route.toLowerCase().includes(State.routeSearch.toLowerCase());
  });
  const key = State.routeSort.key, dir = State.routeSort.dir==='asc'?1:-1;
  routes.sort((a,b)=>{
    const av=a[key], bv=b[key];
    if(av==null && bv==null) return 0; if(av==null) return 1; if(bv==null) return -1;
    return (av>bv?1:av<bv?-1:0)*dir;
  });

  document.getElementById('routeCountBadge').textContent = `${routes.length} routes`;
  const cols = [
    {k:'route', l:'Route'}, {k:'shipments', l:'Shipments'}, {k:'avgDistance', l:'Avg Distance'},
    {k:'avgCost', l:'Avg Cost'}, {k:'avgDays', l:'Avg Lead Days'}, {k:'onTimePct', l:'On-Time %'}, {k:'efficiency', l:'Efficiency'}
  ];
  const table = document.getElementById('routeTable');
  table.querySelector('thead').innerHTML = '<tr>'+cols.map(c=>`<th data-key="${c.k}">${c.l}<span class="arrow">${State.routeSort.key===c.k?(State.routeSort.dir==='asc'?'▲':'▼'):''}</span></th>`).join('')+'</tr>';
  table.querySelectorAll('thead th').forEach(th=>th.addEventListener('click',()=>{
    const k = th.dataset.key;
    if(State.routeSort.key===k) State.routeSort.dir = State.routeSort.dir==='asc'?'desc':'asc';
    else State.routeSort = { key:k, dir:'desc' };
    renderRoutesPage();
  }));
  table.querySelector('tbody').innerHTML = routes.map(r=>{
    const effColor = r.efficiency==null?'blue':r.efficiency>=85?'success':r.efficiency>=65?'warning':'danger';
    return `<tr>
      <td><b style="color:var(--text)">${r.route}</b></td>
      <td>${fmtNum(r.shipments)}</td>
      <td>${r.avgDistance!=null? fmtNum(r.avgDistance)+' km':'N/A'}</td>
      <td>${fmtMoney(r.avgCost)}</td>
      <td>${r.avgDays!=null? fmtNum(r.avgDays,1):'N/A'}</td>
      <td>${r.onTimePct!=null? fmtNum(r.onTimePct)+'%':'N/A'}</td>
      <td><span class="badge badge-${effColor}">${r.efficiency!=null?Math.round(r.efficiency)+'%':'N/A'}</span>${r.efficiency!=null?`<span class="bar-mini"><i style="width:${r.efficiency}%"></i></span>`:''}</td>
    </tr>`;
  }).join('') || `<tr><td colspan="7"><div class="empty">No routes match your filters.</div></td></tr>`;

  document.getElementById('routeSearch').value = State.routeSearch;
}

function renderDistancePage(){
  const rows = State.filtered;
  const withDist = rows.filter(r=>r.distance!=null);
  document.getElementById('distAvg').textContent = withDist.length? fmtNum(avgOf(withDist,'distance'))+' km':'N/A';
  document.getElementById('distMax').textContent = withDist.length? fmtNum(Math.max(...withDist.map(r=>r.distance)))+' km':'N/A';
  document.getElementById('distMin').textContent = withDist.length? fmtNum(Math.min(...withDist.map(r=>r.distance)))+' km':'N/A';

  if(!withDist.length){
    destroyChart('distcost'); destroyChart('distbuckets');
    ['chartDistCost','chartDistBuckets'].forEach(id=>{
      const c = document.getElementById(id);
      if(c && c.parentElement) c.parentElement.innerHTML = '<div class="empty"><div class="e-ico">📍</div>No distance data available — dataset has no coordinates or resolvable customer locations for these filters.</div>';
    });
    return;
  }
  const withCost = withDist.filter(r=>r.cost!=null).slice(0,400);
  makeChart('distcost','chartDistCost',{
    type:'scatter',
    data:{ datasets:[{ label:'Shipments', data: withCost.map(r=>({x:r.distance,y:r.cost})), backgroundColor:'rgba(37,99,235,.55)' }] },
    options:{ responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{display:false} },
      scales:{ x:{ title:{display:true,text:'Distance (km)',color:cssVar('--text-dim')}, grid:{color:cssVar('--border')}, ticks:{color:cssVar('--text-dim')} },
               y:{ title:{display:true,text:'Cost',color:cssVar('--text-dim')}, grid:{color:cssVar('--border')}, ticks:{color:cssVar('--text-dim')} } } }
  });

  const buckets = [[0,150],[150,300],[300,500],[500,800],[800,Infinity]];
  const bLabels = ['0-150km','150-300km','300-500km','500-800km','800km+'];
  const bCounts = buckets.map(([lo,hi])=>withDist.filter(r=>r.distance>=lo && r.distance<hi).length);
  makeChart('distbuckets','chartDistBuckets',{
    type:'bar',
    data:{ labels:bLabels, datasets:[{ label:'Shipments', data:bCounts, backgroundColor:'#7C3AED', borderRadius:6 }] },
    options: baseChartOptions()
  });
}

function renderEfficiencyPage(){
  const rows = State.filtered;
  const a = aggregate(rows);
  document.getElementById('effAvg').textContent = a.avgEfficiency!=null? Math.round(a.avgEfficiency)+'%':'N/A';
  document.getElementById('effOnTime').textContent = a.onTimePct!=null? Math.round(a.onTimePct)+'%':'N/A';
  document.getElementById('effLate').textContent = a.onTimePct!=null? a.lateCount : 'N/A';

  const ra = routeAggregates(rows).filter(r=>r.efficiency!=null).sort((x,y)=>y.efficiency-x.efficiency);
  if(ra.length){
    makeChart('effrank','chartEffRank',{
      type:'bar',
      data:{ labels:ra.map(r=>r.route), datasets:[{ label:'Efficiency %', data:ra.map(r=>Math.round(r.efficiency)),
        backgroundColor: ra.map(r=> r.efficiency>=85?'#22C55E':r.efficiency>=65?'#F59E0B':'#EF4444'), borderRadius:6 }] },
      options:{ indexAxis:'y', responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{display:false} },
        scales:{ x:{ beginAtZero:true, max:100, grid:{color:cssVar('--border')}, ticks:{color:cssVar('--text-dim')} },
                 y:{ grid:{display:false}, ticks:{color:cssVar('--text-dim'), font:{size:10}} } } }
    });
  } else { destroyChart('effrank'); }

  const metrics = ['On-Time %','Cost Efficiency','Lead Time Score','Low Risk','Volume Share'];
  const modes = [...new Set(rows.map(r=>r.shipMode))].slice(0,6);
  const modeRadar = modes.map(mode=>{
    const mrows = rows.filter(r=>r.shipMode===mode);
    if(!mrows.length) return [0,0,0,0,0];
    const onTimeSet = mrows.filter(r=>r.onTime!=null);
    const onTimePct = onTimeSet.length? onTimeSet.filter(r=>r.onTime).length/onTimeSet.length*100 : 0;
    const cmVals = mrows.map(r=>r.costPerKm!=null?r.costPerKm:r.costPerUnit).filter(v=>v!=null);
    const costEff = cmVals.length? Math.max(0,100-(mean(cmVals))*10) : 0;
    const leadVals = mrows.map(r=>r.deliveryDays).filter(v=>v!=null);
    const speed = leadVals.length? Math.max(0,100-mean(leadVals)*8) : 0;
    const riskVals = mrows.map(r=>r.risk).filter(v=>v!=null);
    const lowRisk = riskVals.length? 100-mean(riskVals) : 0;
    const volShare = (mrows.length/rows.length)*100;
    return [onTimePct,costEff,speed,lowRisk,volShare].map(v=>Math.round(clamp(v,0,100)));
  });
  if(modes.length){
    makeChart('radar','chartRadar',{
      type:'radar',
      data:{ labels:metrics, datasets: modes.map((m,i)=>({
        label:m, data:modeRadar[i], borderColor:['#2563EB','#7C3AED','#06B6D4','#F59E0B','#22C55E','#EF4444'][i%6],
        backgroundColor:['rgba(37,99,235,.12)','rgba(124,58,237,.10)','rgba(6,182,212,.10)','rgba(245,158,11,.10)','rgba(34,197,94,.10)','rgba(239,68,68,.10)'][i%6], pointRadius:2
      })) },
      options:{ responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ position:'bottom', labels:{color:cssVar('--text-dim'),boxWidth:10,font:{size:10.5}} } },
        scales:{ r:{ min:0,max:100, grid:{color:cssVar('--border')}, angleLines:{color:cssVar('--border')}, ticks:{display:false}, pointLabels:{color:cssVar('--text-dim'),font:{size:10.5}} } } }
    });
  } else { destroyChart('radar'); }
}

function initMapFilters(){
  const fSel = document.getElementById('mapFactoryFilter');
  const mSel = document.getElementById('mapModeFilter');
  if(fSel.options.length<=1){ FACTORIES.forEach(f=>{ const o=document.createElement('option'); o.value=f.id; o.textContent=f.name; fSel.appendChild(o); }); }
  fSel.onchange = ()=>renderMapPage();
  mSel.onchange = ()=>renderMapPage();
  document.getElementById('mapReset').onclick = ()=>{ fSel.value='all'; mSel.value='all'; renderMapPage(); };
}
function refreshMapModeOptions(){
  const mSel = document.getElementById('mapModeFilter');
  const modes = [...new Set(State.data.map(r=>r.shipMode))].sort();
  const current = mSel.value;
  mSel.innerHTML = '<option value="all">All Modes</option>' + modes.map(m=>`<option value="${m}">${m}</option>`).join('');
  mSel.value = modes.includes(current) ? current : 'all';
}
function renderMapPage(){
  if(!State.map){
    State.map = L.map('map',{ scrollWheelZoom:true }).setView([39.5,-98.35],4);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{ attribution:'© OpenStreetMap, © CARTO', maxZoom:19 }).addTo(State.map);
    State.mapLayer = L.layerGroup().addTo(State.map);
    initMapFilters();
  }
  refreshMapModeOptions();
  State.mapLayer.clearLayers();
  const factoryFilter = document.getElementById('mapFactoryFilter').value;
  const modeFilter = document.getElementById('mapModeFilter').value;

  let rows = State.filtered;
  if(factoryFilter!=='all') rows = rows.filter(r=>r.plantId===factoryFilter);
  if(modeFilter!=='all') rows = rows.filter(r=>r.shipMode===modeFilter);
  const geoRows = rows.filter(r=>r.geocoded);
  const sample = geoRows.slice(0, 300);

  FACTORIES.forEach(f=>{
    if(factoryFilter!=='all' && f.id!==factoryFilter) return;
    const marker = L.circleMarker([f.lat,f.lng],{ radius:9, color:'#fff', weight:2, fillColor:'#2563EB', fillOpacity:1 }).addTo(State.mapLayer);
    marker.bindPopup(`<b>${f.emoji} ${f.name}</b><br>${f.city}<br><span style="color:#5B6478">Factory hub</span>`);
  });

  sample.forEach(r=>{
    const line = L.polyline([[r.plantLat,r.plantLng],[r.customerLat,r.customerLng]], {
      color: r.onTime===false? '#EF4444' : '#22C55E', weight:1.4, opacity:0.55
    }).addTo(State.mapLayer);
    line.bindPopup(`<b>${r.orderId||r.shipCode||('Row '+r.rowId)}</b><br>${r.plantName} → ${r.city}<br>${fmtMoney(r.cost)} · ${r.deliveryDays!=null?r.deliveryDays+'d':'N/A'} · ${r.shipMode}`);
    L.circleMarker([r.customerLat,r.customerLng],{ radius:3.5, color: r.onTime===false?'#EF4444':'#22C55E', weight:1, fillOpacity:.8 }).addTo(State.mapLayer);
  });

  const unmapped = rows.length - geoRows.length;
  let note = document.getElementById('mapUnmappedNote');
  if(!note){ note = document.createElement('div'); note.id='mapUnmappedNote'; note.style.cssText='margin-top:10px;font-size:12.5px;color:var(--text-faint);'; document.getElementById('map').parentElement.appendChild(note); }
  note.textContent = unmapped>0 ? `${unmapped.toLocaleString()} of ${rows.length.toLocaleString()} shipments in view have no resolvable city/coordinates and are not plotted.` : '';

  setTimeout(()=>State.map.invalidateSize(), 200);
}

function renderFactoriesPage(){
  const rows = State.filtered;
  document.getElementById('factoryGrid').innerHTML = FACTORIES.map(f=>{
    const frows = rows.filter(r=>r.plantId===f.id);
    const a = aggregate(frows);
    return `<div class="card factory-card">
      <div class="factory-head">
        <div class="factory-swatch" style="background:${f.color}22;color:${f.color}">${f.emoji}</div>
        <div><div style="font-weight:700;font-size:15px">${f.name}</div><div style="font-size:12px;color:var(--text-faint)">${f.city} · ${f.id}</div></div>
      </div>
      <div class="stat-row"><span>Shipments</span><b>${fmtNum(a.count)}</b></div>
      <div class="stat-row"><span>Avg Cost</span><b>${fmtMoney(a.avgCost)}</b></div>
      <div class="stat-row"><span>Avg Distance</span><b>${a.avgDistance!=null?fmtNum(a.avgDistance)+' km':'N/A'}</b></div>
      <div class="stat-row"><span>Avg Lead Time</span><b>${a.avgDays!=null?fmtNum(a.avgDays,1)+' d':'N/A'}</b></div>
      <div class="stat-row"><span>On-Time</span><b>${a.onTimePct!=null?fmtNum(a.onTimePct)+'%':'N/A'}</b></div>
      <div class="stat-row"><span>Coordinates</span><b class="mono" style="font-size:11px">${f.lat.toFixed(3)}, ${f.lng.toFixed(3)}</b></div>
    </div>`;
  }).join('');
}

function customerAggregates(rows){
  const map = new Map();
  rows.forEach(r=>{
    if(!map.has(r.customerId)) map.set(r.customerId,{ customerId:r.customerId, customerName:r.customerName, city:r.city, region:r.region, country:r.country, rows:[] });
    map.get(r.customerId).rows.push(r);
  });
  return [...map.values()].map(g=>{
    const a = aggregate(g.rows);
    return { ...g, shipments:a.count, avgCost:a.avgCost, avgDays:a.avgDays, onTimePct:a.onTimePct };
  });
}
function renderCustomersPage(){
  let custs = customerAggregates(State.filtered);
  if(State.custSearch){ const q=State.custSearch.toLowerCase(); custs = custs.filter(c=>(c.customerName+' '+c.city).toLowerCase().includes(q)); }
  const key=State.custSort.key, dir=State.custSort.dir==='asc'?1:-1;
  custs.sort((a,b)=>{ const av=a[key],bv=b[key]; if(av==null&&bv==null) return 0; if(av==null) return 1; if(bv==null) return -1; return (av>bv?1:av<bv?-1:0)*dir; });

  const cols=[{k:'customerName',l:'Customer'},{k:'city',l:'City'},{k:'region',l:'Region'},{k:'country',l:'Country'},{k:'shipments',l:'Shipments'},{k:'avgCost',l:'Avg Cost'},{k:'avgDays',l:'Avg Lead Days'},{k:'onTimePct',l:'On-Time %'}];
  const table=document.getElementById('custTable');
  table.querySelector('thead').innerHTML='<tr>'+cols.map(c=>`<th data-key="${c.k}">${c.l}<span class="arrow">${State.custSort.key===c.k?(State.custSort.dir==='asc'?'▲':'▼'):''}</span></th>`).join('')+'</tr>';
  table.querySelectorAll('thead th').forEach(th=>th.addEventListener('click',()=>{
    const k=th.dataset.key;
    if(State.custSort.key===k) State.custSort.dir = State.custSort.dir==='asc'?'desc':'asc'; else State.custSort={key:k,dir:'desc'};
    renderCustomersPage();
  }));
  const pageRows = paginate(custs, State.custPage, State.pageSize);
  table.querySelector('tbody').innerHTML = pageRows.map(c=>`<tr>
    <td><b style="color:var(--text)">${c.customerName}</b></td><td>${c.city||'N/A'}</td><td>${c.region||'N/A'}</td><td>${c.country||'N/A'}</td>
    <td>${fmtNum(c.shipments)}</td><td>${fmtMoney(c.avgCost)}</td><td>${c.avgDays!=null?fmtNum(c.avgDays,1):'N/A'}</td><td>${c.onTimePct!=null?fmtNum(c.onTimePct)+'%':'N/A'}</td>
  </tr>`).join('') || `<tr><td colspan="8"><div class="empty">No customers match your search.</div></td></tr>`;

  renderPagination('custTable', custs.length, State.custPage, p=>{ State.custPage=p; renderCustomersPage(); });
  document.getElementById('custSearch').value = State.custSearch;
}

function renderAnalyticsPage(){
  const rows = State.filtered;
  const regions=[...new Set(rows.map(r=>r.region))];
  const regionCost = regions.map(reg=>{ const rr=rows.filter(r=>r.region===reg); return avgOf(rr,'cost'); });
  makeChart('regioncost','chartRegionCost',{
    type:'bar', data:{ labels:regions, datasets:[{ label:'Avg Cost', data:regionCost.map(v=>v!=null?Math.round(v):null), backgroundColor:'#06B6D4', borderRadius:6 }] },
    options: baseChartOptions()
  });

  const divisions=[...new Set(rows.map(r=>r.division))];
  const divCounts = divisions.map(d=>rows.filter(r=>r.division===d).length);
  makeChart('division','chartDivision',{
    type:'pie', data:{ labels:divisions, datasets:[{ data:divCounts, backgroundColor:['#2563EB','#7C3AED','#F59E0B','#22C55E','#EF4444','#06B6D4'] }] },
    options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'bottom', labels:{color:cssVar('--text-dim'),boxWidth:10,font:{size:11}} } } }
  });

  const withLead = rows.filter(r=>r.deliveryDays!=null);
  if(withLead.length){
    const buckets=[[0,2],[2,4],[4,6],[6,9],[9,Infinity]]; const bl=['0-2d','2-4d','4-6d','6-9d','9d+'];
    const bc = buckets.map(([lo,hi])=>withLead.filter(r=>r.deliveryDays>=lo && r.deliveryDays<hi).length);
    makeChart('leadhist','chartLeadHist',{
      type:'bar', data:{ labels:bl, datasets:[{ label:'Shipments', data:bc, backgroundColor:'#F59E0B', borderRadius:6 }] },
      options: baseChartOptions()
    });
  } else {
    destroyChart('leadhist');
    const c=document.getElementById('chartLeadHist'); if(c&&c.parentElement) c.parentElement.innerHTML='<div class="empty">No lead-time data available for these filters.</div>';
  }

  const modes = [...new Set(rows.map(r=>r.shipMode))];
  let html = '<div class="table-scroll"><table><thead><tr><th>Region</th>'+modes.map(m=>`<th>${m}</th>`).join('')+'</tr></thead><tbody>';
  regions.forEach(reg=>{
    html += `<tr><td><b style="color:var(--text)">${reg}</b></td>`;
    modes.forEach(m=>{
      const mrows = rows.filter(r=>r.region===reg && r.shipMode===m);
      const vals = mrows.map(r=>r.costPerKm!=null?r.costPerKm:r.costPerUnit).filter(v=>v!=null);
      const avg = vals.length? mean(vals) : null;
      const intensity = avg? Math.min(1, avg/3) : 0;
      const bg = avg? `rgba(37,99,235,${0.12+intensity*0.55})` : 'transparent';
      html += `<td style="background:${bg};color:${avg?'var(--text)':'var(--text-faint)'};text-align:center;">${avg?avg.toFixed(2):'N/A'}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody></table></div>';
  document.getElementById('heatmapMount').innerHTML = html;
}

function paginate(arr,page,size){ const start=(page-1)*size; return arr.slice(start,start+size); }
function renderPagination(anchorTableId, total, page, onChange){
  const table = document.getElementById(anchorTableId);
  let pag = table.parentElement.querySelector('.pagination');
  if(!pag){ pag = document.createElement('div'); pag.className='pagination'; table.parentElement.after(pag); }
  const pages = Math.max(1, Math.ceil(total/State.pageSize));
  pag.innerHTML = `<span>Page ${page} of ${pages} · ${total} results</span>
    <button ${page<=1?'disabled':''} id="pgPrev">‹</button>
    <button ${page>=pages?'disabled':''} id="pgNext">›</button>`;
  pag.querySelector('#pgPrev')?.addEventListener('click',()=>onChange(Math.max(1,page-1)));
  pag.querySelector('#pgNext')?.addEventListener('click',()=>onChange(Math.min(pages,page+1)));
}

const COMMANDS = [
  ...Object.keys(PAGE_TITLES).map(p=>({ icon:'→', label:`Go to ${PAGE_TITLES[p]}`, tag:'Navigate', action:()=>goToPage(p) })),
  { icon:'🌓', label:'Toggle dark / light theme', tag:'Action', action:()=>toggleTheme() },
  { icon:'⬇', label:'Export current dataset as CSV', tag:'Export', action:()=>exportCSV(State.filtered,'nassau_candy_shipments.csv') },
  { icon:'↺', label:'Reset all filters', tag:'Action', action:()=>{ State.filters={factory:'all',region:'all',mode:'all',division:'all',dateFrom:'',dateTo:'',search:''}; applyFilters(); syncAllFilterBars(); toast('info','Filters reset',''); } },
  { icon:'↺', label:'Reset to sample data (500 records)', tag:'Data', action:()=>{ loadSampleData(); toast('success','Sample data restored',''); } }
];
function openPalette(){
  document.getElementById('paletteOverlay').classList.add('show');
  const input = document.getElementById('paletteInput');
  input.value=''; renderPaletteList(''); input.focus();
}
function closePalette(){ document.getElementById('paletteOverlay').classList.remove('show'); }
function renderPaletteList(q){
  const list = document.getElementById('paletteList');
  const filtered = COMMANDS.filter(c=>c.label.toLowerCase().includes(q.toLowerCase()));
  list.innerHTML = filtered.map((c,i)=>`<div class="cmdk-item ${i===0?'sel':''}" data-idx="${i}"><span>${c.icon}</span><span>${c.label}</span><span class="tag">${c.tag}</span></div>`).join('') || `<div class="empty">No matching commands</div>`;
  list.querySelectorAll('.cmdk-item').forEach(el=>{
    el.addEventListener('click', ()=>{ filtered[+el.dataset.idx].action(); closePalette(); });
  });
}

function toCSV(rows){
  if(!rows.length) return '';
  const cols = Object.keys(rows[0]);
  const lines = [cols.join(',')];
  rows.forEach(r=>lines.push(cols.map(c=>`"${String(r[c]==null?'N/A':r[c]).replace(/"/g,'""')}"`).join(',')));
  return lines.join('\n');
}
function exportCSV(rows, filename){
  downloadBlob(toCSV(rows), filename, 'text/csv');
  toast('success','Export ready', `${rows.length} rows exported to ${filename}`);
}
function exportXLSX(rows, routeRows){
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Shipments');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(routeRows), 'Route Summary');
  XLSX.writeFile(wb, 'nassau_candy_analysis.xlsx');
  toast('success','Excel exported', 'Workbook with Shipments + Route Summary sheets downloaded.');
}

function toggleTheme(){
  State.theme = State.theme==='light' ? 'dark':'light';
  document.documentElement.classList.toggle('dark', State.theme==='dark');
  document.getElementById('themeToggle').textContent = State.theme==='dark' ? '☀️':'🌙';
  document.getElementById('settingsThemeSwitch').classList.toggle('on', State.theme==='dark');
  renderActivePage();
}
function toggleSidebar(){
  State.sidebarCollapsed = !State.sidebarCollapsed;
  document.getElementById('sidebar').classList.toggle('collapsed', State.sidebarCollapsed);
  document.getElementById('settingsSidebarSwitch').classList.toggle('on', State.sidebarCollapsed);
  document.getElementById('collapseBtn').textContent = State.sidebarCollapsed ? '⇥' : '⇤ Collapse';
}

function loadSampleData(){
  const raw = generateSampleRows(500);
  const headers = Object.keys(raw[0]);
  const { records } = ingest(raw, headers, 'Sample Data (500 generated records)');
  State.data = records;
  State.routePage=1; State.custPage=1;
  applyFilters(); syncAllFilterBars();
  updateSourceBadge();
  renderUploadPreview();
  document.getElementById('validationReport').innerHTML='';
}
function init(){
  loadSampleData();

  document.querySelectorAll('.navitem').forEach(item=>{
    item.addEventListener('click', ()=>goToPage(item.dataset.page));
  });
  document.getElementById('collapseBtn').addEventListener('click', toggleSidebar);
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  document.getElementById('openPalette').addEventListener('click', openPalette);
  document.getElementById('notifBtn').addEventListener('click', ()=>toast('info','No new notifications','You are all caught up.'));
  document.getElementById('mobileToggle').addEventListener('click', ()=>document.getElementById('sidebar').classList.toggle('mobile-open'));

  document.getElementById('paletteOverlay').addEventListener('click', e=>{ if(e.target.id==='paletteOverlay') closePalette(); });
  document.getElementById('paletteInput').addEventListener('input', e=>renderPaletteList(e.target.value));
  document.addEventListener('keydown', e=>{
    if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='k'){ e.preventDefault(); openPalette(); }
    else if(e.key==='Escape') closePalette();
    else if(!document.getElementById('paletteOverlay').classList.contains('show') && document.activeElement.tagName!=='INPUT'){
      const map = {'1':'dashboard','2':'upload','3':'routes','4':'distance','5':'efficiency','6':'map','7':'factories','8':'customers','9':'analytics','0':'reports'};
      if(map[e.key]) goToPage(map[e.key]);
    }
  });

  document.getElementById('dashRefresh').addEventListener('click', ()=>{ applyFilters(); toast('success','Dashboard refreshed',''); });
  document.getElementById('dashExport').addEventListener('click', ()=>exportCSV(State.filtered,'dashboard_snapshot.csv'));

  wireUpload();

  document.getElementById('routesExport').addEventListener('click', ()=>exportCSV(routeAggregates(State.filtered),'route_analysis.csv'));
  document.getElementById('routeSearch').addEventListener('input', e=>{ State.routeSearch = e.target.value; renderRoutesPage(); });

  document.getElementById('custExport').addEventListener('click', ()=>exportCSV(customerAggregates(State.filtered),'customers.csv'));
  document.getElementById('custSearch').addEventListener('input', e=>{ State.custSearch = e.target.value; State.custPage=1; renderCustomersPage(); });

  document.getElementById('genCSV').addEventListener('click', ()=>exportCSV(State.filtered,'nassau_candy_full_dataset.csv'));
  document.getElementById('genXLSX').addEventListener('click', ()=>exportXLSX(State.filtered, routeAggregates(State.filtered)));
  document.getElementById('genSummary').addEventListener('click', generateExecSummary);

  document.getElementById('settingsThemeSwitch').addEventListener('click', toggleTheme);
  document.getElementById('settingsSidebarSwitch').addEventListener('click', toggleSidebar);
  document.getElementById('currencySelect').addEventListener('change', e=>{ State.currency=e.target.value; renderActivePage(); toast('info','Currency updated', State.currency); });
  document.getElementById('animSpeed').addEventListener('input', e=>{ document.documentElement.style.setProperty('--speed', e.target.value); });
  document.getElementById('resetPrefs').addEventListener('click', ()=>{
    State.currency='USD'; document.getElementById('currencySelect').value='USD';
    document.getElementById('animSpeed').value=1; document.documentElement.style.setProperty('--speed',1);
    if(State.theme==='dark') toggleTheme();
    if(State.sidebarCollapsed) toggleSidebar();
    State.filters={factory:'all',region:'all',mode:'all',division:'all',dateFrom:'',dateTo:'',search:''};
    applyFilters(); syncAllFilterBars();
    toast('success','Preferences reset','Workspace restored to defaults.');
  });

  goToPage('dashboard');
  setTimeout(()=>toast('success','Welcome back',`${State.data.length.toLocaleString()} records loaded from ${State.source.label}.`), 500);
}
function generateExecSummary(){
  const rows = State.filtered, a = aggregate(rows);
  const ra = routeAggregates(rows).filter(r=>r.efficiency!=null).sort((x,y)=>y.efficiency-x.efficiency);
  const top3 = ra.slice(0,3), bottom3 = ra.slice(-3).reverse();
  document.getElementById('reportPreview').innerHTML = `
    <div class="card-title"><span class="t">📄 Executive Summary — ${new Date().toLocaleDateString()}</span>
      <button class="btn btn-ghost btn-sm" onclick="window.print()">🖨 Print / Save PDF</button></div>
    <div class="grid g-4" style="margin-bottom:16px;">
      <div class="vcheck ok"><div class="n">${fmtNum(a.count)}</div><div class="l">Shipments Analyzed</div></div>
      <div class="vcheck ok"><div class="n">${a.avgEfficiency!=null?Math.round(a.avgEfficiency)+'%':'N/A'}</div><div class="l">Fleet Efficiency</div></div>
      <div class="vcheck ${a.onTimePct==null?'warn':a.onTimePct>=85?'ok':'warn'}"><div class="n">${a.onTimePct!=null?Math.round(a.onTimePct)+'%':'N/A'}</div><div class="l">On-Time Rate</div></div>
      <div class="vcheck ${a.lateCount>50?'bad':'warn'}"><div class="n">${a.onTimePct!=null?a.lateCount:'N/A'}</div><div class="l">Late Deliveries</div></div>
    </div>
    <p style="font-size:13px;color:var(--text-dim);line-height:1.8;margin-bottom:16px;">
      Across the current filter scope (source: ${State.source.label}), the fleet shipped <b>${fmtNum(a.count)}</b> orders from <b>${a.factories}</b> factories
      to <b>${a.customers}</b> customers${a.avgDistance!=null?`, averaging <b>${fmtNum(a.avgDistance)} km</b>`:''} and <b>${fmtMoney(a.avgCost)}</b> per shipment.
      Fleet-wide efficiency stands at <b>${a.avgEfficiency!=null?Math.round(a.avgEfficiency)+'%':'N/A'}</b>${a.onTimePct!=null?` with an on-time rate of <b>${Math.round(a.onTimePct)}%</b> relative to the dataset's own lead-time benchmark.`:'.'}
    </p>
    <div class="grid g-2e">
      <div><b style="font-size:13px;">🏆 Top performing routes</b>
        ${top3.map(r=>`<div class="stat-row"><span>${r.route}</span><b style="color:var(--success)">${Math.round(r.efficiency)}%</b></div>`).join('') || '<div class="empty">Not enough data.</div>'}
      </div>
      <div><b style="font-size:13px;">⚠️ Routes needing attention</b>
        ${bottom3.map(r=>`<div class="stat-row"><span>${r.route}</span><b style="color:var(--danger)">${Math.round(r.efficiency)}%</b></div>`).join('') || '<div class="empty">Not enough data.</div>'}
      </div>
    </div>`;
  toast('success','Report generated','Scroll down to review, then print or save as PDF.');
}

window.addEventListener('load', init);
