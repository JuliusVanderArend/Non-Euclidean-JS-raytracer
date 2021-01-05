

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
  let stepcount = 100;
  let dx = 10
  let fov =0.01;
  let resX = 1024
  let resY = 1024
  let cpos = [0,0,-1]; //camera position
  let pos = [-2.6+theta,0,-4]; // sphere center position
  let lpos = [-x,-y,3];
  let lintensity = 5;
  let rad = 2
  var potentialCoef = 10
  var h2 = 1;
  let a = 0;
  let b = 0;
  let c =0;
  let rlen =0;
  let rpos = [0,0,0];

  let dir = rayDir(fov,resX,resY);
  for (var i =0; i < stepcount;i++){
    let oc = [cpos[0]-pos[0],cpos[1]-pos[1],cpos[2]-pos[2]];
    let point = rayPos(rlen,dir,cpos);
    let ls = Math.pow(point[0]*point[0]+point[1]*point[1]+point[2]*point[2],2.5);
    let accel = [potentialCoef*h2*point[0]/ls,potentialCoef*h2*point[1]/ls,potentialCoef*h2*point[2]/ls]
    dir = vAdd(dir,accel);
    a = mdotproduct(dir,dir);
    b = 2* mdotproduct(dir, oc);
    c = mdotproduct(oc,oc) - rad*rad;
    let bs = 0;
    bs = b*b;
    let discr = bs -4*mdotproduct(dir,dir)*c;
      if(discr > 0){
        rlen = -(-b - Math.sqrt(discr)) / (2.0*a);
        rpos = [rlen*dir[0]+pos[0],rlen*dir[1]+pos[1],rlen*dir[2]+pos[2]];
        if(rlen>0){// || i == stepcount-1
          let snormal = normalizeVec([rpos[0]-pos[0],rpos[1]-pos[1],rpos[2]-pos[2]]);
          let lnormal = normalizeVec([lpos[0]-rpos[0],lpos[1]-rpos[1],lpos[2]-rpos[2]]);
          let lambert = (Math.max(0,mdotproduct(lnormal,snormal))*lintensity)/((rpos[0]-lpos[0])*(rpos[0]-lpos[0])+(rpos[1]-lpos[1])*(rpos[1]-lpos[1])+(rpos[2]-lpos[2])*(rpos[2]-lpos[2])) ; //calculating lambertian lighting (the dot product of the surface normal and the surface to light vector times the light intensity divided by light distance)
          //this.color(Math.tanh(discr)*1.2,0,Math.sinh(discr),1);
          //this.color(Math.sin(lambert)*10,Math.sinh(lambert),Math.tan(lambert)*5,1);
          var checker = (checkerTex(rpos[0]*700,rpos[1]*700)/20)
          this.color(checker*lambert,checker*lambert,checker*lambert,1);
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

