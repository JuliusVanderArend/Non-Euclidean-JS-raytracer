

//s1 = new Sphere(2,[[1],[1],[1]],null)
//cam = new Camera([[1],[-1],[-2]],0.02,256)

const gpu = new GPU();
var pageX = 0;
var pageY = 0;

const render = gpu.createKernel(function(x,y) {
    function rayDir(fov,res){
    return [fov *(this.thread.x -((res -1)/2)),fov *(this.thread.y-((res-1)/2)),1]
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
  let i = 1;
  let j = 0.89;
  let fov = 0.005;
  let res = 1024;
  let cpos = [1,-1,-2]; //camera position
  let pos = [1,1,1.013]; // sphere center position
  let lpos = [x,y,-10];
  let lintensity = 50;
  let rad = 3.605
  let oc = [cpos[0]-pos[0],cpos[1]-pos[1],cpos[2]-pos[2]];
  let dir = rayDir(fov,res);
  let a = mdotproduct(dir,dir);
  let b = 2* mdotproduct(dir, oc);
  let c = mdotproduct(oc,oc) - rad*rad;
  let discr = 1 -4*mdotproduct(dir,dir)*c;

    if(discr > 0){
      let rlen = -(-b - Math.sqrt(discr)) / (2.0*a);
      let rpos = [rlen*dir[0]+cpos[0],rlen*dir[1]+cpos[1],rlen*dir[2]+cpos[2]];
      let snormal = normalizeVec([rpos[0]-cpos[0],rpos[1]-cpos[1],rpos[2]-cpos[2]]);
      let lnormal = normalizeVec([lpos[0]-rpos[0],lpos[1]-rpos[1],lpos[2]-rpos[2]]);
      let lambert = (Math.max(0,mdotproduct(lnormal,snormal))*lintensity)/((rpos[0]-lpos[0])*(rpos[0]-lpos[0])+(rpos[1]-lpos[1])*(rpos[1]-lpos[1])+(rpos[2]-lpos[2])*(rpos[2]-lpos[2])) ;
      //this.color(Math.tanh(discr)*1.2,0,Math.sinh(discr),1);
      this.color(lambert,lambert,lambert,1);
    }
    else{
      this.color(255,255,255,1);
    }
})
  .setOutput([1024, 1024])
  .setGraphical(true);



const canvas2 = render.canvas;
document.getElementsByTagName('body')[0].appendChild(canvas2);

var theta =0;

function draw(){
  var t0 = performance.now();
  render(-(pageX-512)/100,(pageY-512)/100);
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



// for(var x = 0; x < cam.resolution; x++){
//   for(var y = 0; y < cam.resolution;y++){
//     s1.render(cam,null,x,y)
//   }
// }