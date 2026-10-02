import zipfile,xml.etree.ElementTree as E,json,re,hashlib,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
manifest=json.loads((ROOT/'tools/source-manifest.json').read_text(encoding='utf8'))
ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
for key in ['en','roman','ur']:
 p=Path(manifest['sources'][key]['path']);
 with zipfile.ZipFile(p) as z:r=E.fromstring(z.read('word/document.xml'))
 blocks=[''.join(t.text or '' for t in x.findall('.//w:t',ns)) for x in r.findall('.//w:p',ns)];blocks=[x for x in blocks if x.strip()]
 snap=json.loads((ROOT/'tools'/('rendered-'+key+'.json')).read_text(encoding='utf8'))
 missing=[i for i,x in enumerate(blocks) if i>=len(snap) or snap[i]['index']!=i or re.sub(r'\s+',' ',snap[i]['text']).strip()!=re.sub(r'\s+',' ',x).strip()]
 print(key+' source blocks: '+str(len(blocks)));print(key+' website blocks: '+str(len(snap)));print('Missing '+key+' blocks: '+str(len(missing)))
 assert not missing
 assert hashlib.sha256(p.read_bytes()).hexdigest()==manifest['sources'][key]['sha']
print('All three source documents match the rendered snapshots in order.')
