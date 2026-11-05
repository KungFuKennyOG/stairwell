/* =====================================================================================================
   LONDON VR'S OWN LOOK, on top of the Stairwell renderer, without touching the shared engine.
   - No PS1 pass: no vertex snap, no affine warp, no 15-bit dither. Textures are mipmapped, linear and anisotropic.
   - A bleach-bypass grade in the material shader (no screen-space post, so it costs the same in the headset):
     mid-tones at ~58% saturation, an S-curve, a green-grey shadow floor, sodium-amber highlights, and only the
     signature colours (chicken-shop red, sodium amber, Met blue) keep full saturation.
   - Fine film grain per fragment, re-seeded every frame.
   - uFreeze 0..1: the freeze-frame. The world drains to ~15% saturation, red survives, contrast punches up.
   On desktop the scene renders supersampled and is box-filtered down (the engine's canvas has no MSAA); in the
   headset the XR layer's own antialiasing does that job.
   ===================================================================================================== */
const FS_LDN=`#version 300 es
precision highp float;
uniform sampler2D map; uniform float uHasMap, uCut;
uniform vec3 uColor, uEmissive, uFogCol; uniform vec2 uRepeat; uniform float uNoFog, uFogNear, uFogFar, uSkyFade;
uniform float uTime, uFreeze, uGrade, uGrain;
in vec3 vAff; in vec3 vLight; in vec3 vView; in vec4 vRect;
out vec4 outColor;
float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main(){
  vec2 uv = vAff.xy / vAff.z * uRepeat;
  if(vRect.z > 0.0) uv = vRect.xy + fract(uv) * vRect.zw;
  vec4 t = uHasMap > 0.5 ? texture(map, uv) : vec4(1.0);
  if(uCut > 0.5 && t.a < 0.5) discard;
  vec3 c = t.rgb * uColor * vLight + t.rgb * uEmissive;
  float f = clamp((length(vView) - uFogNear) / (uFogFar - uFogNear), 0.0, 1.0) * (1.0 - min(uNoFog, 1.0));
  c = mix(c, uFogCol, f);
  if(uGrade > 0.5 && uNoFog < 1.5){   /* uNoFog = 2: titles and cards, which sit outside the grade */
    c = clamp(c, 0.0, 1.0);
    float l = dot(c, vec3(0.299, 0.587, 0.114));
    float mx = max(c.r, max(c.g, c.b)), mn = min(c.r, min(c.g, c.b)), s = (mx - mn) / (mx + 1e-4);
    float red = step(c.g * 1.7, c.r) * step(c.b * 1.7, c.r);
    float amber = step(c.b * 2.2, c.r) * step(c.r * 0.45, c.g) * step(c.g, c.r);
    float blue = step(c.r * 1.5, c.b) * step(c.g * 1.05, c.b);
    float sig = smoothstep(0.42, 0.62, s) * clamp(red + amber + blue, 0.0, 1.0);
    float skin = step(c.b, c.g) * step(c.g, c.r) * smoothstep(0.12, 0.22, s) * (1.0 - smoothstep(0.55, 0.75, s)) * smoothstep(0.08, 0.2, l);
    float sat = mix(mix(0.58, 0.86, skin), 1.0, sig);                 /* skin keeps its warmth: bleach bypass, not a corpse */
    sat = mix(sat, mix(0.14, 0.92, sig * red), uFreeze);                 /* the freeze keeps only the reds */
    c = mix(vec3(l), c, sat);
    c = mix(c, c * c * (3.0 - 2.0 * c), 0.42 + 0.25 * uFreeze);          /* S-curve, harder on a freeze */
    float sh = 1.0 - smoothstep(0.0, 0.32, l);
    c = c * vec3(0.95, 1.0, 0.97) * (1.0 - sh * 0.04) + vec3(0.014, 0.024, 0.02) * sh;   /* green-grey floor: inky, not crushed */
    float hi = smoothstep(0.5, 1.0, l);
    c *= mix(vec3(1.0), vec3(1.06, 1.0, 0.86), hi);                       /* sodium in the highlights */
  }
  if(uGrain > 0.5 && uNoFog < 1.5){ float n = hash(floor(gl_FragCoord.xy) + fract(uTime * 7.31) * vec2(91.7, 47.3)); c += (n - 0.5) * (0.05 + 0.03 * uFreeze); }
  outColor = vec4(c, 1.0 - uSkyFade * smoothstep(0.8, 1.0, f));
}`;
const PFS_LDN=`#version 300 es
precision highp float;
uniform sampler2D tScene; uniform vec2 uRes; uniform float uSS;
in vec2 vUv; out vec4 outColor;
void main(){ vec2 px = gl_FragCoord.xy * uSS; vec3 c = vec3(0.0);
  for(int j=0;j<2;j++) for(int i=0;i<2;i++) c += texture(tScene, (px + (vec2(float(i), float(j)) - 0.5) * uSS * 0.5 + 0.5) / uRes).rgb;
  outColor = vec4(c * 0.25, 1.0); }`;
MAIN=program(VS,FS_LDN,['position','normal','uv','aRect']);
const POST_LDN=program(PVS,PFS_LDN);
const ANISO=gl.getExtension('EXT_texture_filter_anisotropic');
/* every texture mipmapped, trilinear, anisotropic: the opposite of the PS1 pass */
glTex=function(t){
  if(!t.glt){ t.glt=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,t.glt); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true); gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,t.c);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);
    gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    if(ANISO) gl.texParameterf(gl.TEXTURE_2D,ANISO.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(8,gl.getParameter(ANISO.MAX_TEXTURE_MAX_ANISOTROPY_EXT))); }
  return t.glt; };
const LOOK={grade:true,grain:true,freeze:0,time:0};
/* a material that skips the grade and the fog: name cards, title text */
function ungraded(m){ m.nofog=2; return m; }
function setLookUniforms(){ gl.useProgram(MAIN.p); gl.uniform1f(MAIN.loc.uTime,LOOK.time); gl.uniform1f(MAIN.loc.uFreeze,LOOK.freeze); gl.uniform1f(MAIN.loc.uGrade,LOOK.grade?1:0); gl.uniform1f(MAIN.loc.uGrain,LOOK.grain?1:0); }
/* draw the world supersampled into the engine's framebuffer, then box-filter it onto the canvas */
function drawLondon(eye,tgt){ const W=cv.width,H=cv.height,ss=Math.max(1,Math.min(2,Math.sqrt(9e6/(W*H)))),w=Math.round(W*ss),h=Math.round(H*ss);
  ensureFB(w,h); gl.bindTexture(gl.TEXTURE_2D,fbTex); for(const k of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER]) gl.texParameteri(gl.TEXTURE_2D,k,gl.LINEAR); gl.bindTexture(gl.TEXTURE_2D,null);
  gl.bindFramebuffer(gl.FRAMEBUFFER,fb); setLookUniforms(); renderScene(world,eye,tgt,w,h,[w,h]);
  gl.bindFramebuffer(gl.FRAMEBUFFER,null); gl.viewport(0,0,W,H); gl.disable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE); curCull=null; curTex=null;
  gl.useProgram(POST_LDN.p); gl.bindVertexArray(emptyVAO); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D,fbTex);
  gl.uniform1i(POST_LDN.loc.tScene,0); gl.uniform2f(POST_LDN.loc.uRes,w,h); gl.uniform1f(POST_LDN.loc.uSS,ss); gl.drawArrays(gl.TRIANGLES,0,3); gl.bindVertexArray(null); gl.bindTexture(gl.TEXTURE_2D,null); }
