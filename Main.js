

//s1 = new Sphere(2,[[1],[1],[1]],null)
//cam = new Camera([[1],[-1],[-2]],0.02,256)

const gpu = new GPU();
var pageX = 0;
var pageY = 0;

const render = gpu.createKernel(function(x,y,theta) {
  function checkerTex(x,y){
    return (Math.sin(10*Math.PI*x/512)*Math.sin(10*Math.PI*y/512))/0.01 +0.5;
  }
  function rayPos(rlen,dir,pos){
    return [rlen*dir[0]+pos[0],rlen*dir[1]+pos[1],rlen*dir[2]+pos[2]];
  }
  function rayDir(fov,resX,resY){
      //return [fov *(Math.cos(this.thread.x)/0.001+Math.cos(this.thread.x/200)/0.0001+this.thread.x-((resX -1)/2)),fov *(Math.sin(this.thread.y/200)/0.0001+this.thread.y-((resX -1)/2)),1]
      return [fov *(this.thread.x -((resX -1)/2)),fov *(this.thread.y-((resY-1)/2)),1];
    }
  function mdotproduct(vectorA, vectorB) {
      let result = 0;
      for (let i = 0; i < 3; i++) {
        result += vectorA[i] * vectorB[i];
      }
      return result;
    };
  function normalizeVec(vec){
    var magnitude = Math.sqrt(vec[0]*vec[0]+vec[1]*vec[1]+vec[2]*vec[2]);
    return [vec[0]/magnitude,vec[1]/magnitude,vec[2]/magnitude];
  }
  function vAdd(vecA, vecB){
    return [vecA[0] + vecB[0], vecA[1] + vecB[1], vecA[2] + vecB[2]];
  }
  function vSub(vecA, vecB){
    return [vecA[0] - vecB[0], vecA[1] - vecB[1], vecA[2] - vecB[2]];
  }
  const g = 0.001;
  const rayMass =40;
  const bholeMass = 10000;

  let stepcount = 80;
  let dx = 0.01
  let fov =0.1;
  let resX = 1024
  let resY = 1024
  let cpos = [theta-2,0,1]; //camera position
  let pos = [0,0,-4]; // sphere center position
  let lpos = [0,0,10];
  let lintensity = 5;
  let rad = 2
  var potentialCoef = 100
  var stepSize = 0.0001;
  let debug_lighting_offset  = 0.02
  var h2 = 1;
  let a = 0;
  let b = 0;
  let c =0;
  let rlen =0;
  let rpos = [0,0,0];
  let lastPoint= cpos;

  let dir = rayDir(fov,resX,resY);
  for (var i =0; i < stepcount;i++){
    let point = lastPoint;
    let oc = [point[0]-pos[0],point[1]-pos[1],point[2]-pos[2]];
    let ls = Math.pow(point[0]*point[0]+point[1]*point[1]+point[2]*point[2],2.5);
    let accel = [potentialCoef*h2*point[0]/ls,potentialCoef*h2*point[1]/ls,potentialCoef*h2*point[2]/ls]
    let newtonF = g*rayMass*bholeMass/Math.sqrt(((point[0]-0)*(point[0]-0)+(point[1]-0)*(point[1]-0)+(point[2]-0)*(point[2]-0)))
    accel = [-point[0]*newtonF,-point[1]*newtonF,-point[2]*newtonF]
    dir = vAdd(dir,accel);
    a = mdotproduct(dir,dir);
    b = 2* mdotproduct(dir, oc);
    c = mdotproduct(oc,oc) - rad*rad;
    let bs = 0;
    bs = b*b;
    lastPoint = rayPos(stepSize,dir,point);
    let discr = bs -4*mdotproduct(dir,dir)*c;
      if(discr > 0){
        rlen = -(-b - Math.sqrt(discr)) / (2.0*a);
        //rlen = stepSize
        rpos =rayPos(rlen,dir,point) //[rlen*dir[0]+pos[0],rlen*dir[1]+pos[1],rlen*dir[2]+pos[2]];
        if(rlen>0 && rlen < dx){// || i == stepcount-1
          let snormal = normalizeVec([rpos[0]-pos[0],rpos[1]-pos[1],rpos[2]-pos[2]]);
          let lnormal = normalizeVec([lpos[0]-rpos[0],lpos[1]-rpos[1],lpos[2]-rpos[2]]);
          let lambert = (Math.max(0,mdotproduct(lnormal,snormal))*lintensity)/((rpos[0]-lpos[0])*(rpos[0]-lpos[0])+(rpos[1]-lpos[1])*(rpos[1]-lpos[1])+(rpos[2]-lpos[2])*(rpos[2]-lpos[2])) ; //calculating lambertian lighting (the dot product of the surface normal and the surface to light vector times the light intensity divided by light distance)
          //this.color(Math.tanh(discr)*1.2,0,Math.sinh(discr),1);
          //this.color(Math.sin(lambert)*10,Math.sinh(lambert),Math.tan(lambert)*5,1);
          var checker = (checkerTex(rpos[0]*700,rpos[2]*700)/20)
          lambert = 1;
          this.color(checker*lambert+debug_lighting_offset,checker*lambert+debug_lighting_offset,checker*lambert+debug_lighting_offset,1);
          //this.color(0.5,0.5,rpos[2]/15);
          //break
        }  
      }
      else{
        this.color(0,0,0,1);
      }
  }
  
})
  .setOutput([1024, 1024])
  .setGraphical(true);



const canvas2 = render.canvas;
document.getElementsByTagName('body')[0].appendChild(canvas2);

var theta =0;

function draw(){
  var t0 = performance.now();
  theta += 0.001;
  render(-(pageX-512)/100,(pageY-512)/100,theta);
  var t1 = performance.now();
  console.log(t1-t0 + " ms time");

}

setInterval(draw,16);

// event handler function
function handler(e) {
    e = e || window.event;

    pageX = e.pageX;
    pageY = e.pageY;

    // IE 8
    if (pageX === undefined) {
        pageX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        pageY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
}

// attach handler to the click event of the document
if (document.attachEvent) document.attachEvent('onmousemove', handler);
else document.addEventListener('mousemove', handler);

