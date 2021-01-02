var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

//drawPix(100,100)

s1 = new Sphere(2,[[1],[1],[1]],null)
cam = new Camera([[1],[-1],[-2]],0.02,256)

for(var x = 0; x < cam.resolution; x++){
  for(var y = 0; y < cam.resolution;y++){
    s1.render(cam,null,x,y)
  }
}
console.log("done");
// console.log(mdotproduct([1,1,1],[1,-1,-2]))