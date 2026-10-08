import re,sys
d=sys.argv[1]
html=open(d+'/play.html',encoding='utf-8').read()
esc=lambda t:re.sub(r'</script','<\\\\/script',t,flags=re.I)
for tag,f in (('<script src="config.js"></script>','config.js'),('<script src="mini3d.js"></script>','mini3d.js')):
    assert html.count(tag)==1
    html=html.replace(tag,'<script>'+esc(open(d+'/'+f,encoding='utf-8').read())+'</script>')
open(d+'/Blind-Path-Game.html','w',encoding='utf-8').write(html)
print(len(html))
