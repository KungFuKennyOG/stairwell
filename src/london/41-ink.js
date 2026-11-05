/* =====================================================================================================
   INK TEST: a graphic-novel treatment on top of the London look, to see whether a hard stylisation suits the
   engine's per-vertex light better than half-realism. Three moves, all in the material shaders:
   - cel bands: the vertex light is quantised into three steps (shadow, mid, lit), keeping the light's colour;
   - halftone: the shadow band is broken up by a dot screen;
   - ink: every lit mesh is drawn a second time as an inverted hull pushed out along its normals, back faces only,
     in near-black, so outlines stay the same thickness on screen at any distance.
   ===================================================================================================== */
const VS_INK=VS.replace('uniform float uSnap, uAffine, uUnlit;','uniform float uSnap, uAffine, uUnlit, uOutline;')
  .replace('vec4 wp = modelMatrix * vec4(position,1.0);\n  vec3 n = normalize(mat3(modelMatrix) * normal);',
   'vec4 wp = modelMatrix * vec4(position,1.0);\n  vec3 n = normalize(mat3(modelMatrix) * normal);\n  if(uOutline > 0.5){ float dd = length((viewMatrix * wp).xyz); wp.xyz += n * clamp(dd, 0.4, 40.0) * 0.0042; }');
const FS_INK=FS_LDN.replace('uniform float uTime, uFreeze, uGrade, uGrain;','uniform float uTime, uFreeze, uGrade, uGrain, uOutline, uInk, uUnlitF;')
  .replace('void main(){\n  vec2 uv','void main(){\n  if(uOutline > 0.5){ if(gl_FrontFacing || uCut > 0.5 || uNoFog > 0.5 || uUnlitF > 0.5) discard; outColor = vec4(0.03, 0.028, 0.03, 1.0); return; }\n  vec2 uv')
  .replace('vec3 c = t.rgb * uColor * vLight + t.rgb * uEmissive;',
   `vec3 Lt = vLight;
  if(uInk > 0.5 && uUnlitF < 0.5){ float lv = dot(vLight, vec3(0.3333)); float band = lv < 0.16 ? 0.1 : lv < 0.42 ? 0.36 : lv < 0.9 ? 0.74 : 1.15;
    Lt = vLight / max(lv, 1e-3) * band;
    if(lv < 0.42){ vec2 q = fract(gl_FragCoord.xy / 5.0) - 0.5; float dotm = smoothstep(0.34, 0.26, length(q)); Lt *= mix(1.0, 0.45, dotm * (lv < 0.16 ? 0.5 : 0.85)); } }
  vec3 c = t.rgb * uColor * Lt + t.rgb * uEmissive;`);
MAIN=program(VS_INK,FS_INK,['position','normal','uv','aRect']);
LOOK.ink=true;
const renderScenePlain=renderScene;
/* the engine's drawTree only sends uUnlit to the vertex stage; the fragment stage needs it to keep signs out of the ink */
const drawTreePlain=drawTree;
drawTree=function(n){ if(!n.vis) return;
  if(n.mesh){ const g=n.mesh.geo; if(!culled(n,g)){ if(!g.vao) upload(g); gl.bindVertexArray(g.vao); gl.uniformMatrix4fv(MAIN.loc.modelMatrix,false,n.world);
    for(const run of runsOf(n.mesh)){ const m=run.m; const cull=!m.dbl; if(cull!==curCull){ cull?gl.enable(gl.CULL_FACE):gl.disable(gl.CULL_FACE); curCull=cull; }
      if(m!==curMat){ curMat=m; if(m.tex){ const t=glTex(m.tex); if(t!==curTex){ gl.bindTexture(gl.TEXTURE_2D,t); curTex=t; } }
        gl.uniform1f(MAIN.loc.uHasMap,m.tex?1:0); gl.uniform3fv(MAIN.loc.uColor,m.color); gl.uniform3fv(MAIN.loc.uEmissive,m.emis);
        gl.uniform1f(MAIN.loc.uUnlit,m.unlit); gl.uniform1f(MAIN.loc.uUnlitF,m.unlit); gl.uniform2fv(MAIN.loc.uRepeat,m.rep); gl.uniform1f(MAIN.loc.uCut,m.cut); gl.uniform1f(MAIN.loc.uNoFog,m.nofog||0); gl.uniform1f(MAIN.loc.uFar,m.far?1:0); }
      gl.drawElements(gl.TRIANGLES,run.count,gl.UNSIGNED_SHORT,run.start*2); } } }
  for(const k of n.kids) drawTree(k); };
renderScene=function(root,eye,target,w,h,snapRes){
  gl.useProgram(MAIN.p); gl.uniform1f(MAIN.loc.uOutline,0); gl.uniform1f(MAIN.loc.uInk,LOOK.ink?1:0);
  renderScenePlain(root,eye,target,w,h,snapRes);
  if(!LOOK.ink) return;
  gl.useProgram(MAIN.p); gl.uniform1f(MAIN.loc.uOutline,1); curMat=null; curCull=null; drawTree(root); gl.bindVertexArray(null); gl.uniform1f(MAIN.loc.uOutline,0); curMat=null; };
