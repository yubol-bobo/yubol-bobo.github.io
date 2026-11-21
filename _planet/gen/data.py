import re, json, base64, io, sys
from PIL import Image, ImageOps
import os
B=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..','')  # repo root
def b64(path, maxside, q=74, crop=None):
    im=ImageOps.exif_transpose(Image.open(path)).convert('RGB')
    if crop:
        w,h=im.size; r=crop
        if w/h>r: nw=int(h*r); im=im.crop(((w-nw)//2,0,(w-nw)//2+nw,h))
        else: nh=int(w/r); im=im.crop((0,int((h-nh)*0.35),w,int((h-nh)*0.35)+nh))
    im.thumbnail((maxside,maxside))
    bio=io.BytesIO(); im.save(bio,'JPEG',quality=q,optimize=True)
    return 'data:image/jpeg;base64,'+base64.b64encode(bio.getvalue()).decode()
# --- bib
s=open(B+'_bibliography/papers.bib').read()
def entries(s):
    i=0
    while True:
        i=s.find('@',i)
        if i<0: return
        j=s.find('{',i); d=1; k=j+1
        while d:
            d+= (s[k]=='{') - (s[k]=='}'); k+=1
        yield s[j+1:k-1]; i=k
def fields(e):
    key,rest=e.split(',',1); out={'key':key.strip()}; i=0
    for m in re.finditer(r'(\w+)\s*=\s*',rest):
        if m.start()<i: continue
        k=m.end(); c=rest[k]
        if c=='{':
            d=1;k2=k+1
            while d: d+=(rest[k2]=='{')-(rest[k2]=='}'); k2+=1
            v=rest[k+1:k2-1]
        elif c=='"':
            k2=rest.find('"',k+1)+1; v=rest[k+1:k2-1]
        else:
            k2=re.search(r'[,\n]',rest[k:]).start()+k; v=rest[k:k2]
        out[m.group(1).lower()]=re.sub(r'\s+',' ',v.replace('{','').replace('}','')).strip(); i=k2
    return out
MON={m:i for i,m in enumerate('jan feb mar apr may jun jul aug sep oct nov dec'.split())}
THEME={'clinical':['renal','clinical'],'agents':['skill','agent','co-alignment']}
P=[]
for e in entries(s):
    f=fields(e)
    if 'title' not in f: continue
    au=[]
    for a in f['author'].split(' and '):
        a=a.strip()
        if ',' in a: l,fi=a.split(',',1); a=fi.strip()+' '+l.strip()
        au.append(a)
    t=f['title'].lower(); th='robust'
    for k,ws in THEME.items():
        if any(w in t for w in ws): th=k
    link=f.get('arxiv') or f.get('html') or f.get('url')
    if not link and f.get('pdf'): link=f['pdf'] if f['pdf'].startswith('http') else 'https://yubol-bobo.github.io/assets/pdf/'+f['pdf']
    venue=f.get('journal') or f.get('booktitle') or ''
    prev=f.get('preview')
    P.append(dict(key=f['key'],title=f['title'],authors=au,venue=venue,abbr=f.get('abbr',''),year=int(f['year']),
      month=MON.get(f.get('month','jan')[:3].lower(),0),selected=f.get('selected')=='true',theme=th,link=link,page=f.get('page'),
      abstract=f.get('abstract',''),img=b64(B+'assets/img/publication_preview/'+prev,300,70) if prev else None))
    print(th, f['year'], f.get('month'), f.get('abbr'), '|', venue, '|', f['title'][:50], '|', link, file=sys.stderr)
caps=["Home is wherever I'm with them. Dali, Yunnan.","Found geometry in Kunming.","A small bubble, a big memory. California.","A joyful corner with my love, Weiyi.","The river whispering goodnight to Cincinnati.","Mount Rainier, twice!"]
life=[dict(src=b64(B+f'assets/img/life/{i+1}.jpg',760,72),tex=b64(B+f'assets/img/life/{i+1}.jpg',200,70,crop=0.85),cap=c) for i,c in enumerate(caps)]
cities=[dict(name=m[0],lat=float(m[1]),lng=float(m[2]),note=m[3]) for m in re.findall(r'^\s*\{name: "(.*?)", lat: ([\d.-]+), lng: ([\d.-]+), note: "(.*?)"\}',open(B+'_pages/life.md').read(),re.M)]
json.dump(dict(papers=P,life=life,cities=cities,portrait=b64(B+'assets/img/prof_pic.jpg',420,80)),open('src/generated.json','w'))
print(len(P),len(cities),file=sys.stderr)
