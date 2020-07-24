"use strict";
const DEFAULT_EXTENT={'width':1,'height':1};
const DEFAULT_PARAMS={'extent':DEFAULT_EXTENT,'canvasWidth':400,'canvasHeight':200};

function TerrainUI(canvas,params)
{
  "use strict";
  var $this = this;
  this.params=params || DEFAULT_PARAMS;
  this.extent = this.params.extent;
  this.canvas=canvas;
  this.terrain=new Terrain(this.extent);
  this.generateAndVisualizePoints=function() {
    this.terrain.generatePoints();
    this.clear();
    this.visualizePoints();
  };

  this.improveAndVisualizeMesh=function(){
    this.terrain.improvePoints();
    this.terrain.makeMesh();
    this.clear();
    this.visualizeVoronoi();
  };

  this.generateAndVisualizeMesh=function(){
    this.terrain.generatePoints();
    this.terrain.makeMesh();
    this.clear();
    this.visualizeVoronoi();
  };

  this.copyAndVisualizeMesh=function(src)
  {
    this.terrain.copy(src.terrain);
    this.terrain.makeMesh();
    //var primH = this.terrain.zero(mesh);
    this.clear();
    this.visualizeVoronoi();
  };

  this.improveAndVisualizePoints=function() {
    this.terrain.improvePoints();
    this.clear();
    this.visualizePoints();
  };

  this.clear=function(){
    var ctx = this.canvas.getContext("2d");
    // Store the current transformation matrix
    ctx.save();
    // Use the identity matrix while clearing the canvas
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // Restore the transform
    ctx.restore();
  };

  this.visualizePoints=function () {
    var ctx = this.canvas.getContext("2d");
    
    //console.log(this.terrain.mesh);
    this.terrain.pts.forEach(function(p) {
        //console.log(p);
        ctx.beginPath();
        ctx.arc((p[0]+.5)*$this.params.canvasWidth, (p[1]+.5)*$this.params.canvasHeight, 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
    });
  };

  this.visualizeVoronoi=function () {
    var ctx = this.canvas.getContext("2d"); 
    var hi = d3.max(this.terrain.mesh) + 1e-9;
    var lo = d3.min(this.terrain.mesh) - 1e-9; 

    this.terrain.mesh.edges.forEach(function(e){
      var a=e[2];
      var b=e[3];
      if(typeof a!='undefined' && typeof b!='undefined'){
        //console.log(e);
        ctx.beginPath();
        ctx.moveTo((a[0]+.5)*400,(a[1]+.5)*200);
        ctx.lineTo((b[0]+.5)*400,(b[1]+.5)*200);
        ctx.stroke();
      }
    });
  };
}