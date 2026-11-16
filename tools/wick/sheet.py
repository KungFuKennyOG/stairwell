# contact sheet of the art gate shots: python3 tools/wick/sheet.py <dir> [cols]
import sys,os
from PIL import Image
d=sys.argv[1]; cols=int(sys.argv[2]) if len(sys.argv)>2 else 3
names=[l.split("'")[1] for l in open(os.path.join(os.path.dirname(__file__),'views.js')) if l.strip().startswith("['")]
names=[n for n in names if os.path.exists(f'{d}/{n}.png')]; W,H=1280//cols,int(1280//cols*9/16)
s=Image.new('RGB',(W*cols,H*((len(names)+cols-1)//cols)))
for i,n in enumerate(names): s.paste(Image.open(f'{d}/{n}.png').resize((W,H),Image.LANCZOS),((i%cols)*W,(i//cols)*H))
s.save(f'{d}/sheet.png')
