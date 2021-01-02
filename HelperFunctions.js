function rayDir(camera,x,y){
  return [camera.fov *(x -((camera.resolution -1)/2)),camera.fov *(y -((camera.resolution -1)/2)),1]
}

function drawPix(x,y){
  ctx.fillRect(x,y,1,1);
}

