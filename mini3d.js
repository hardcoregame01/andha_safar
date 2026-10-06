/* mini3d.js - tiny self-contained WebGL renderer exposing the small subset of the THREE API used by Blind Path */
(function(){
class Vector3{constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z}set(x,y,z){this.x=x;this.y=y;this.z=z;return this}setScalar(s){this.x=this.y=this.z=s;return this}copy(v){this.x=v.x;this.y=v.y;this.z=v.z;return this}lerp(v,t){this.x+=(v.x-this.x)*t;this.y+=(v.y-this.y)*t;this.z+=(v.z-this.z)*t;return this}}
class Color{constructor(h=0){this.setHex(h)}setHex(h){this.r=(h>>16&255)/255;this.g=(h>>8&255)/255;this.b=(h&255)/255;return this}
setHSL(h,s,l){const q=l<.5?l*(1+s):l+s-l*s,p=2*l-q,f=t=>{t=(t%1+1)%1;return t<1/6?p+(q-p)*6*t:t<.5?q:t<2/3?p+(q-p)*(2/3-t)*6:p};this.r=f(h+1/3);this.g=f(h);this.b=f(h-1/3);return this}}
class Object3D{constructor(){this.position=new Vector3();this.rotation={x:0,y:0,z:0};this.scale=new Vector3(1,1,1);this.children=[];this.visible=true}add(...o){for(const c of o)this.children.push(c);return this}remove(o){const i=this.children.indexOf(o);if(i>=0)this.children.splice(i,1)}}
class Group extends Object3D{}
class Scene extends Object3D{constructor(){super();this.fog=null;this.background=null}}
class Mesh extends Object3D{constructor(g,m){super();this.geometry=g;this.material=m}}
class Light extends Object3D{constructor(c,i,d){super();this.color=new Color(c);this.intensity=i;this.distance=d||0;this.isLight=1}}
class HemisphereLight extends Light{constructor(s,g,i){super(s,i);this.ground=new Color(g);this.kind=0}}
class DirectionalLight extends Light{constructor(c,i){super(c,i);this.kind=1}}
class PointLight extends Light{constructor(c,i,d){super(c,i,d);this.kind=2}}
class FogExp2{constructor(c,d){this.color=new Color(c);this.density=d}}
class PerspectiveCamera extends Object3D{constructor(f,a,n,r){super();this.fov=f;this.aspect=a;this.near=n;this.far=r;this.t=new Vector3()}lookAt(x,y,z){this.t.set(x,y,z)}updateProjectionMatrix(){}}
const mat=o=>({color:new Color(o&&o.color!==undefined?o.color:0xffffff),emissive:new Color(o&&o.emissive||0)});
class MeshStandardMaterial{constructor(o){Object.assign(this,mat(o));this.unlit=0}}
class MeshBasicMaterial{constructor(o){Object.assign(this,mat(o));this.unlit=1}}
/* geometry */
function geo(p,n,i){return{p:new Float32Array(p),n:new Float32Array(n),i:new Uint16Array(i)}}
function BoxGeometry(w,h,d){const P=[],N=[],I=[],x=w/2,y=h/2,z=d/2;
[[[1,0,0],[[x,-y,z],[x,-y,-z],[x,y,-z],[x,y,z]]],[[-1,0,0],[[-x,-y,-z],[-x,-y,z],[-x,y,z],[-x,y,-z]]],[[0,1,0],[[-x,y,z],[x,y,z],[x,y,-z],[-x,y,-z]]],[[0,-1,0],[[-x,-y,-z],[x,-y,-z],[x,-y,z],[-x,-y,z]]],[[0,0,1],[[-x,-y,z],[x,-y,z],[x,y,z],[-x,y,z]]],[[0,0,-1],[[x,-y,-z],[-x,-y,-z],[-x,y,-z],[x,y,-z]]]].forEach(([nm,vs])=>{const b=P.length/3;vs.forEach(v=>{P.push(...v);N.push(...nm)});I.push(b,b+1,b+2,b,b+2,b+3)});return geo(P,N,I)}
function SphereGeometry(r,ws,hs){const P=[],N=[],I=[];for(let y=0;y<=hs;y++){const t=y/hs*Math.PI;for(let x=0;x<=ws;x++){const u=x/ws*Math.PI*2,nx=-Math.cos(u)*Math.sin(t),ny=Math.cos(t),nz=Math.sin(u)*Math.sin(t);P.push(nx*r,ny*r,nz*r);N.push(nx,ny,nz)}}
for(let y=0;y<hs;y++)for(let x=0;x<ws;x++){const a=y*(ws+1)+x,b=a+ws+1;I.push(a,b,a+1,b,b+1,a+1)}return geo(P,N,I)}
function CylinderGeometry(rt,rb,h,s){const P=[],N=[],I=[],hh=h/2;for(let i=0;i<=s;i++){const u=i/s*Math.PI*2,c=Math.cos(u),sn=Math.sin(u);P.push(c*rt,hh,sn*rt,c*rb,-hh,sn*rb);N.push(c,0,sn,c,0,sn)}
for(let i=0;i<s;i++){const a=i*2;I.push(a,a+1,a+2,a+1,a+3,a+2)}
[[hh,rt,1],[-hh,rb,-1]].forEach(([y,r,ny])=>{const c=P.length/3;P.push(0,y,0);N.push(0,ny,0);for(let i=0;i<=s;i++){const u=i/s*Math.PI*2;P.push(Math.cos(u)*r,y,Math.sin(u)*r);N.push(0,ny,0)}for(let i=0;i<s;i++)I.push(c,c+1+i,c+2+i)});return geo(P,N,I)}
function PlaneGeometry(w,h){const x=w/2,y=h/2;return geo([-x,-y,0,x,-y,0,x,y,0,-x,y,0],[0,0,1,0,0,1,0,0,1,0,0,1],[0,1,2,0,2,3])}
/* math */
const mul=(a,b)=>{const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++){let s=0;for(let k=0;k<4;k++)s+=a[k*4+r]*b[c*4+k];o[c*4+r]=s}return o};
const rot=(ax,t)=>{const c=Math.cos(t),s=Math.sin(t),m=new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
if(ax==0){m[5]=c;m[6]=s;m[9]=-s;m[10]=c}else if(ax==1){m[0]=c;m[2]=-s;m[8]=s;m[10]=c}else{m[0]=c;m[1]=s;m[4]=-s;m[5]=c}return m};
function local(o){let m=mul(mul(rot(0,o.rotation.x),rot(1,o.rotation.y)),rot(2,o.rotation.z));
for(let c=0;c<3;c++){const s=[o.scale.x,o.scale.y,o.scale.z][c];for(let r=0;r<3;r++)m[c*4+r]*=s}m[12]=o.position.x;m[13]=o.position.y;m[14]=o.position.z;return m}
function nmat(m){const a=m[0],b=m[4],c=m[8],d=m[1],e=m[5],f=m[9],g=m[2],h=m[6],i=m[10];
const A=e*i-f*h,B=f*g-d*i,Cc=d*h-e*g,det=a*A+b*B+c*Cc||1,k=1/det;
return new Float32Array([A*k,(c*h-b*i)*k,(b*f-c*e)*k,B*k,(a*i-c*g)*k,(c*d-a*f)*k,Cc*k,(b*g-a*h)*k,(a*e-b*d)*k]).map((v,j)=>v)}
const VS="attribute vec3 aP;attribute vec3 aN;uniform mat4 uM,uV,uP;uniform mat3 uNM;varying vec3 vN;varying vec3 vW;varying float vD;void main(){vec4 w=uM*vec4(aP,1.);vec4 v=uV*w;vW=w.xyz;vN=normalize(uNM*aN);vD=length(v.xyz);gl_Position=uP*v;}";
const FS="precision mediump float;varying vec3 vN;varying vec3 vW;varying float vD;uniform vec3 uC,uE,uHS,uHG,uDC,uDD,uPC,uPP,uFC;uniform float uPD,uFD,uUn;void main(){vec3 n=normalize(vN);vec3 l=mix(uHG,uHS,n.y*.5+.5)+uDC*max(dot(n,uDD),0.);vec3 pd=uPP-vW;float d=length(pd);l+=uPC*clamp(1.-d/uPD,0.,1.)*max(dot(n,pd/max(d,.001)),0.);vec3 col=mix(uC*l+uE,uC,uUn);float f=1.-exp(-uFD*uFD*vD*vD);gl_FragColor=vec4(mix(col,uFC,clamp(f,0.,1.)),1.);}";
class WebGLRenderer{constructor(o){const c=this.domElement=document.createElement('canvas');c.style.display='block';const gl=this.gl=c.getContext('webgl',{antialias:!o||o.antialias!==false})||c.getContext('experimental-webgl');this.ratio=1;this.w=300;this.h=150;
const sh=(t,s)=>{const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);return x},p=this.prog=gl.createProgram();gl.attachShader(p,sh(gl.VERTEX_SHADER,VS));gl.attachShader(p,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(p);gl.useProgram(p);
this.aP=gl.getAttribLocation(p,'aP');this.aN=gl.getAttribLocation(p,'aN');this.U={};['uM','uV','uP','uNM','uC','uE','uHS','uHG','uDC','uDD','uPC','uPP','uFC','uPD','uFD','uUn'].forEach(n=>this.U[n]=gl.getUniformLocation(p,n));gl.enable(gl.DEPTH_TEST)}
setPixelRatio(r){this.ratio=r;this._rs()}setSize(w,h){this.w=w;this.h=h;this._rs()}_rs(){const c=this.domElement;c.width=Math.floor(this.w*this.ratio);c.height=Math.floor(this.h*this.ratio);c.style.width=this.w+'px';c.style.height=this.h+'px'}
buf(g){if(g.b)return g.b;const gl=this.gl,mk=(t,d)=>{const b=gl.createBuffer();gl.bindBuffer(t,b);gl.bufferData(t,d,gl.STATIC_DRAW);return b};return g.b={p:mk(gl.ARRAY_BUFFER,g.p),n:mk(gl.ARRAY_BUFFER,g.n),i:mk(gl.ELEMENT_ARRAY_BUFFER,g.i),c:g.i.length}}
render(sc,cam){const gl=this.gl,U=this.U,c=this.domElement;gl.viewport(0,0,c.width,c.height);const bg=sc.background||new Color(0);gl.clearColor(bg.r,bg.g,bg.b,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
const e=cam.position,t=cam.t;let zx=e.x-t.x,zy=e.y-t.y,zz=e.z-t.z,l=Math.hypot(zx,zy,zz)||1;zx/=l;zy/=l;zz/=l;let xx=zz,xy=0,xz=-zx;l=Math.hypot(xx,xz)||1;xx/=l;xz/=l;const yx=zy*xz-zz*xy,yy=zz*xx-zx*xz,yz=zx*xy-zy*xx;
const V=new Float32Array([xx,yx,zx,0,xy,yy,zy,0,xz,yz,zz,0,-(xx*e.x+xy*e.y+xz*e.z),-(yx*e.x+yy*e.y+yz*e.z),-(zx*e.x+zy*e.y+zz*e.z),1]);
const f=1/Math.tan(cam.fov*Math.PI/360),a=this.w/this.h,n=cam.near,fr=cam.far,Pm=new Float32Array([f/a,0,0,0,0,f,0,0,0,0,(fr+n)/(n-fr),-1,0,0,2*fr*n/(n-fr),0]);
let hs=[0,0,0],hg=[0,0,0],dc=[0,0,0],dd=[0,1,0],pc=[0,0,0],pp=[0,0,0],pd=1;const draws=[];
const walk=(o,pm)=>{if(!o.visible)return;const m=o===sc?pm:mul(pm,local(o));
if(o.isLight){const k=o.intensity,col=[o.color.r*k,o.color.g*k,o.color.b*k];if(o.kind==0){hs=col;hg=[o.ground.r*k,o.ground.g*k,o.ground.b*k]}else if(o.kind==1){dc=col;const d=Math.hypot(o.position.x,o.position.y,o.position.z)||1;dd=[o.position.x/d,o.position.y/d,o.position.z/d]}else{pc=col;pp=[o.position.x,o.position.y,o.position.z];pd=o.distance||1}}
else if(o.geometry)draws.push([o,m]);for(const ch of o.children)walk(ch,m)};
walk(sc,new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]));
const fg=sc.fog||{color:bg,density:0};
gl.uniformMatrix4fv(U.uV,false,V);gl.uniformMatrix4fv(U.uP,false,Pm);gl.uniform3fv(U.uHS,hs);gl.uniform3fv(U.uHG,hg);gl.uniform3fv(U.uDC,dc);gl.uniform3fv(U.uDD,dd);gl.uniform3fv(U.uPC,pc);gl.uniform3fv(U.uPP,pp);gl.uniform1f(U.uPD,pd);gl.uniform3f(U.uFC,fg.color.r,fg.color.g,fg.color.b);gl.uniform1f(U.uFD,fg.density);
for(const[o,m]of draws){const b=this.buf(o.geometry),mt=o.material;gl.uniformMatrix4fv(U.uM,false,m);gl.uniformMatrix3fv(U.uNM,false,nmat(m));gl.uniform3f(U.uC,mt.color.r,mt.color.g,mt.color.b);gl.uniform3f(U.uE,mt.emissive.r,mt.emissive.g,mt.emissive.b);gl.uniform1f(U.uUn,mt.unlit);
gl.bindBuffer(gl.ARRAY_BUFFER,b.p);gl.enableVertexAttribArray(this.aP);gl.vertexAttribPointer(this.aP,3,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ARRAY_BUFFER,b.n);gl.enableVertexAttribArray(this.aN);gl.vertexAttribPointer(this.aN,3,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,b.i);gl.drawElements(gl.TRIANGLES,b.c,gl.UNSIGNED_SHORT,0)}}}
window.THREE={Vector3,Color,Group,Scene,Mesh,HemisphereLight,DirectionalLight,PointLight,FogExp2,PerspectiveCamera,MeshStandardMaterial,MeshBasicMaterial,BoxGeometry:function(w,h,d){return BoxGeometry(w,h,d)},SphereGeometry:function(r,a,b){return SphereGeometry(r,a,b)},CylinderGeometry:function(a,b,c,d){return CylinderGeometry(a,b,c,d)},PlaneGeometry:function(w,h){return PlaneGeometry(w,h)},WebGLRenderer};
})();
