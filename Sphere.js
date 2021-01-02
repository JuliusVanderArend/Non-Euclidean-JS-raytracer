class Sphere{
  constructor(radius, position, color){
    this.radius = radius
    this.position = position
    this.color = color
  }
  render(camera,lights,x,y){
    var oc = vSub(camera.position, this.position)
    var dir = rayDir(camera,x,y)
    var a = mdotproduct(dir,dir)
    var b = 2 * mdotproduct(dir, oc)
    var c= mdotproduct(oc,oc) - this.radius*this.radius
    var discriminant = b*b -4*a*c

    if(discriminant > 0 ){
      drawPix(x,y)
    }
  }
}