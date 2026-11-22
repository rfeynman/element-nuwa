#!/usr/bin/env python3
"""NIST Handbook neutral persistent lines. Requires beautifulsoup4; no live app queries.
Run: /Users/wange/anaconda3/bin/python3 scripts/data/import_spectra.py --download
Review manifest, then repeat with --promote (does not redownload).
"""
import argparse, datetime, hashlib, json, math, re, shutil, time, urllib.error, urllib.request
from decimal import Decimal
from pathlib import Path
from bs4 import BeautifulSoup
ROOT = Path(__file__).resolve().parents[2]
STAGE = ROOT / 'data/staging/spectra'
BASE = 'https://physics.nist.gov/PhysRefData/Handbook/'
INTRO = 'https://www.nist.gov/pml/handbook-basic-atomic-spectroscopic-data/basic-atomic-spectroscopic-data-handbook'
HEADERS = {'User-Agent': 'ElementNuwa-data-import/1.0 (educational spectral-line snapshot)', 'Accept': 'text/html'}

def fetch(url, name):
    path = STAGE / name
    with urllib.request.urlopen(urllib.request.Request(url, headers=HEADERS), timeout=30) as response:
        if response.status != 200 or 'html' not in response.headers.get('Content-Type', ''):
            raise ValueError('Unexpected response')
        body = response.read()
    path.write_bytes(body)
    return body

def clean(cell):
    # Preserve source superscripts as Unicode, rather than flattening 2p² to 2p2.
    cell = BeautifulSoup(str(cell), 'html.parser')
    for sup in cell.find_all('sup'):
        sup.replace_with(sup.get_text().translate(str.maketrans('0123456789+-', '⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻')))
    return re.sub(r'\s+', ' ', cell.get_text('', strip=False)).strip()

def number(text):
    normalized=text.replace(' ', '').replace(',', '')
    if not re.fullmatch(r'\d+(?:\.\d+)?\??', normalized):
        raise ValueError('Unsupported numeric qualifier: '+text)
    return float(normalized.rstrip('?'))

def parse(body, z):
    soup = BeautifulSoup(body, 'html.parser')
    if 'Persistent Lines of Neutral' not in soup.get_text(' ', strip=True):
        raise ValueError('Not a neutral-atom persistent-line table')
    lines, pending = [], None
    unassigned = False
    for row in soup.find_all('tr'):
        cells = row.find_all('td', recursive=False)
        if len(cells) != 9 or any(c.has_attr('rowspan') for c in cells):
            continue
        values = [clean(c) for c in cells]
        if values[1]:
            if pending: raise ValueError('Unpaired lower state')
            wavelength = values[1]
            # Keep qualifiers separately; do not silently coerce unsupported values.
            if not re.fullmatch(r'\d+(?:\.\d+)?', wavelength):
                raise ValueError('Qualified wavelength needs review: ' + wavelength)
            anchor = cells[0].find('a', attrs={'name': True})
            pending = {'id': f'{z}-{len(lines)}', 'wavelengthNm': float(Decimal(wavelength).scaleb(-1)),
                       'wavelengthText': str(Decimal(wavelength).scaleb(-1)),
                       'sourceAnchor': anchor['name'] if anchor else '',
                       'lineReference': values[7],
                       'lower': {'energyCm': number(values[3]), 'energyText': values[3],
                                 'configuration': values[4], 'term': values[5], 'j': values[6]} if values[3] else None}
            if pending['lower'] is None:
                pending.update(upper=None, medium='vacuum' if pending['wavelengthNm']<200 else 'air')
                lines.append(pending);pending=None
        elif values[3]:
            if unassigned:
                unassigned = False
                continue
            if not pending:
                # NIST also lists component state pairs without a wavelength.
                # Exclude those, rather than borrow the neighboring wavelength.
                unassigned = True
                continue
            pending['upper'] = {'energyCm': number(values[3]), 'energyText': values[3],
                                'configuration': values[4], 'term': values[5], 'j': values[6]}
            delta = pending['upper']['energyCm'] - pending['lower']['energyCm']
            assert delta > 0 and all(math.isfinite(x) for x in [delta, pending['wavelengthNm']])
            pending['medium'] = 'vacuum' if delta > 50000 else 'air'
            # Observed wavelengths / rounded or blended levels need not agree exactly.
            ratio = pending['wavelengthNm'] * delta / 1e7
            if abs(ratio-1) > .002: raise ValueError(f'Energy/wavelength inconsistency: {pending}')
            lines.append(pending); pending = None
    if pending or not lines: raise ValueError('Incomplete / empty reference table')
    return sorted(lines, key=lambda line: line['wavelengthNm'])

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--download',action='store_true');ap.add_argument('--promote',action='store_true');args=ap.parse_args()
    STAGE.mkdir(parents=True,exist_ok=True)
    stamp=datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds')
    if args.download:
        fetch(BASE+'element_name.htm','element_name.htm')
        fetch(INTRO,'documentation.html')
    index=BeautifulSoup((STAGE/'element_name.htm').read_bytes(),'html.parser')
    available={a.get_text(strip=True).lower():a['href'].replace('table1','table3') for a in index.select('a[href]') if re.fullmatch(r'Tables/[a-z]+table1.htm', a['href'])}
    elements=json.loads((ROOT/'public/data/explorer.json').read_text())['elements']
    records=[]; manifest=[]
    previous_path=STAGE/'manifest.json'
    previous=json.loads(previous_path.read_text()) if previous_path.exists() else {}
    previous_entries={x['z']:x for x in previous.get('sources',[])}
    for e in elements:
        name={'aluminium':'aluminum','caesium':'cesium'}.get(e['name'].lower(),e['name'].lower())
        path=available.get(name);lines=[];status='outside-reference';url=BASE+'element_name.htm';retrieved=stamp
        if path:
            url=BASE+path;filename=path.split('/')[-1];raw=STAGE/filename
            if args.download:
                try:

                    if not raw.exists():
                        time.sleep(.25);fetch(url,filename)
                except urllib.error.HTTPError as exc:
                    if exc.code != 404: raise
                    print(e['symbol'],'reference-table-unavailable',flush=True)
                    status='reference-table-unavailable'
                    records.append({'z':e['z'],'symbol':e['symbol'],'status':status,'url':url,'lines':[]});continue
            if raw.exists():
                body=raw.read_bytes();lines=parse(body,e['z']);status='available'
                retrieved=previous_entries.get(e['z'],{}).get('retrievedAt',datetime.datetime.fromtimestamp(raw.stat().st_mtime,datetime.timezone.utc).isoformat(timespec='seconds'))
                manifest.append({'z':e['z'],'url':url,'path':str(raw.relative_to(ROOT)), 'retrievedAt':retrieved,'sha256':hashlib.sha256(body).hexdigest(),'lines':len(lines)})
            else: status='reference-table-unavailable'
        records.append({'z':e['z'],'symbol':e['symbol'],'status':status,'url':url,'retrievedAt':retrieved,'lines':lines})
        print(e['symbol'],status,len(lines),flush=True)
    version=stamp[:10].replace('-','.')+'-nist-handbook.1'
    dataset={'schemaVersion':1,'version':version,'builtAt':stamp,'source':{'name':'NIST Handbook of Basic Atomic Spectroscopic Data','url':INTRO,'upstreamDate':None,'attribution':'J. E. Sansonetti and W. C. Martin, NIST. Selected persistent neutral-atom lines; source edition/date not supplied by individual tables. NIST-authored data; acknowledge NIST.','wavelengthConvention':'Vacuum for transitions above 50,000 cm⁻¹; air below, following the Handbook.'},'elements':records}
    assert len(records)==118 and len({e['z'] for e in records})==118
    assert sum(len(e['lines']) for e in records)>500
    payload=(json.dumps(dataset,ensure_ascii=False,indent=2)+'\n').encode()
    (STAGE/'spectra.json').write_bytes(payload)
    report={'version':version,'builtAt':stamp,'datasetSha256':hashlib.sha256(payload).hexdigest(),'elementsWithLines':sum(bool(e['lines']) for e in records),'lineCount':sum(len(e['lines']) for e in records),'unassignedTransitionCount':sum(l['lower'] is None for e in records for l in e['lines']),'visibleLineCount':sum(380<=l['wavelengthNm']<=780 for e in records for l in e['lines']),'sources':manifest,'checks':['118 unique elements','neutral-table identity','paired states','positive energy gaps','Å to nm conversion with precision','energy/wavelength within 0.2% including air correction','source checksums'],'limitations':['Selected persistent lines, not an exhaustive spectrum.','Paired absorption/emission guide; absorption requires lower-state population.','No calibrated intensities, linewidths, or line strengths.','State pairs without a source-assigned wavelength are omitted.','Source question marks on level energies are preserved; absent configuration/term assignments are not inferred.','Air/vacuum convention follows Handbook, not modern ASD infrared convention.']}
    (STAGE/'manifest.json').write_text(json.dumps(report,indent=2)+'\n')
    if args.promote:
        target=ROOT/'public/data/spectra.json'
        if target.exists():shutil.copy2(target,STAGE/'spectra.previous.json')
        target.write_bytes(payload)
        shutil.copy2(STAGE/'manifest.json', ROOT/'data/manifests/spectra-manifest.json')
    print(json.dumps({k:v for k,v in report.items() if k!='sources'},indent=2))
if __name__=='__main__':main()
