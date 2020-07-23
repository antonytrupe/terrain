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
    this.visualizePoints();
  };

  this.improveAndVisualizePoints=function() {
    this.terrain.improvePoints();
    this.visualizePoints();
  };

  this.visualizePoints=function () {
    //console.log(this.terrain.pts);
    var ctx = this.canvas.getContext("2d");
    // Store the current transformation matrix
    ctx.save();
    // Use the identity matrix while clearing the canvas
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // Restore the transform
    ctx.restore();
    this.terrain.pts.forEach(function(p) {
        //console.log(p);
        ctx.beginPath();
        ctx.arc((p[0]+.5)*$this.params.canvasWidth, (p[1]+.5)*$this.params.canvasHeight, 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
    });
  };
}