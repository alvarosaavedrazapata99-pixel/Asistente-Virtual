import re,glob,os,shutil
HERE=os.path.dirname(os.path.abspath(__file__))
ROOT=os.path.abspath(os.path.join(HERE,'..','..'))
W=ROOT+'/out'
O=ROOT+'/.enlace'
shutil.rmtree(O,ignore_errors=True); os.makedirs(O)
shutil.copytree(W+'/assets',O+'/assets'); shutil.copytree(W+'/videos',O+'/videos')
css=''.join(open(f,encoding='utf8').read() for f in sorted(glob.glob(W+'/_next/static/chunks/*.css')))
css=re.sub(r'@font-face\{[^}]*\}','',css)          # fuentes: se cargan desde Google Fonts
css=":root{--font-anton:'Anton';--font-bricolage:'Bricolage Grotesque';--font-jetbrains:'JetBrains Mono'}"+css
def body(path):
    h=open(path,encoding='utf8').read()
    b=re.search(r'<body[^>]*>(.*)</body>',h,re.S).group(1)
    b=re.sub(r'<script.*?</script>','',b,flags=re.S)
    b=re.sub(r'<link[^>]*activar[^>]*>','',b)
    b=re.sub(r'<next-route-announcer.*?</next-route-announcer>','',b,flags=re.S)
    return b
def fix(b):
    b=re.sub(r'(src|href|poster)="/(assets|videos)/',r'\1="\2/',b)
    b=b.replace('href="/legal#','href="legal.html#').replace('href="/legal"','href="legal.html"').replace('href="/"','href="index.html"')
    return b
JS=open(os.path.join(HERE,'site.js'),encoding='utf8').read()+'\n'+open(ROOT+'/public/activar.js',encoding='utf8').read()+'\n'+open(ROOT+'/public/ui.js',encoding='utf8').read()
GF='<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600&family=JetBrains+Mono:wght@400;500&display=swap">'
index='<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n<title>THREE3</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n'+GF+'\n<style>'+css+'</style>\n'+fix(body(W+'/index.html'))+'\n<script>'+JS+'</script>\n'
open(O+'/index.html','w',encoding='utf8').write(index)
# /legal: documento completo, solo texto estático
lh=open(W+'/legal.html',encoding='utf8').read()
lcss=re.search(r'<style[^>]*>(.*?)</style>',lh,re.S)
doc='<!doctype html><html lang="es-PE"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>THREE3 Información legal</title><style>body{margin:0;background:#fff}'+css+'</style></head><body>'+fix(body(W+'/legal.html'))+'</body></html>'
open(O+'/legal.html','w',encoding='utf8').write(doc)
print(len(index),len(doc))
