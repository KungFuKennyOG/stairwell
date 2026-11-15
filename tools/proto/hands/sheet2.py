import sys,os
from PIL import Image,ImageDraw,ImageFont
d=sys.argv[1]; out=sys.argv[2]; title=sys.argv[3]; rows=[a.split('=') for a in sys.argv[4:]]
F=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',20); Fs=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',15)
H=250; cells=[]
for key,label in rows:
    two=key.endswith('-two'); views=['back','palm','thumb'] if two else ['fp','back','palm']
    ims=[]
    for v in views:
        im=Image.open(os.path.join(d,'%s_%s.jpg'%(key,v)))
        if two: im=im.crop((150,120,850,480)); im=im.resize((int(im.width*H/im.height),H))
        elif v=='fp': im=im.crop((120,60,720,560)); im=im.resize((300,H))
        else: im=im.crop((90,90,510,510)).resize((H,H))
        ims.append(im)
    W=sum(i.width for i in ims)+8*(len(ims)-1); row=Image.new('RGB',(W,H+30),(16,16,18)); x=0
    for im in ims: row.paste(im,(x,30)); x+=im.width+8
    ImageDraw.Draw(row).text((4,4),label,font=F,fill=(240,225,170)); cells.append(row)
# two columns
cw=max(c.width for c in cells); n=(len(cells)+1)//2; Wt=cw*2+30; Ht=60+n*(H+40)
sh=Image.new('RGB',(Wt,Ht),(16,16,18)); g=ImageDraw.Draw(sh); g.text((10,10),title,font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',28),fill=(255,255,255))
g.text((10,44),'each: your own view, the back of the hand, the palm side   (two-handed: both sides, then down the barrel)',font=Fs,fill=(170,170,170))
for i,c in enumerate(cells): sh.paste(c,(10+(i//n)*(cw+10),70+(i%n)*(H+40)))
sh.save(out,quality=90); print(out,sh.size)
