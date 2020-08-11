"use strict";
const DEFAULT_EXTENT = {
  'width': 1,
  'height': 1
};
const DEFAULT_PARAMS = {
  'extent': DEFAULT_EXTENT,
  'canvasWidth': 400,
  'canvasHeight': 200
};


class TerrainUI {
  constructor(canvas, params) {
    "use strict";
    var $this = this;
    this.params = params || DEFAULT_PARAMS;
    this.extent = this.params.extent;
    this.canvas = canvas;
    this.terrain = new Terrain(this.extent);
    this.generateAndVisualizePoints = function() {
      this.terrain.generatePoints();
      this.clear();
      this.visualizePoints();
    };
    this.generateAndVisualizePointsSphere = function() {
      this.terrain.generatePointsSphere();
      this.clear();
      this.visualizePointsSphere();
    };
    this.improveAndVisualizeMesh = function() {
      this.terrain.improvePoints();
      this.terrain.makeMesh();
      this.clear();
      this.visualizeVoronoi();
    };
    this.improveAndVisualizeMeshSphere = function() {
      this.terrain.improvePointsSphere();
      //this.terrain.makeMesh();
      this.clear();
      this.visualizeMeshSphere();
    };
    this.improveAndVisualizeTrianglesColor = function() {
      this.terrain.improvePointsSphere();
      //this.terrain.makeMesh();
      this.clear();
      this.visualizeTrianglesColor();
    };
    this.generateAndVisualizeMesh = function() {
      this.terrain.generatePoints();
      this.terrain.makeMesh();
      this.clear();
      this.visualizeVoronoi();
    };
    this.generateAndVisualizeMeshSphere = function() {
      this.terrain.generatePointsSphere();
      //this.terrain.makeMeshSphere();
      this.clear();
      this.visualizeMeshSphere();
    };
    this.copyAndVisualizeMesh = function(src) {
      this.terrain.copy(src.terrain);
      this.terrain.makeMesh();
      //var primH = this.terrain.zero(mesh);
      this.clear();
      this.visualizeVoronoi();
    };
    this.copyAndVisualizeMeshSphere = function(src) {
      this.terrain.copy(src.terrain);
      this.clear();
      this.visualizeMeshSphere();
    };
    this.copyAndVisualizeTrianglesSphere = function(src) {
      this.terrain.copy(src.terrain);
      this.clear();
      this.visualizeTrianglesSphere();
    };
    this.copyAndVisualizeTrianglesColor = function(src) {
      this.terrain.copy(src.terrain);
      this.clear();
      this.visualizeTrianglesColor();
    };
    this.improveAndVisualizePoints = function() {
      this.terrain.improvePoints();
      this.clear();
      this.visualizePoints();
    };
    this.improveAndVisualizePointsSphere = function() {
      this.terrain.improvePointsSphere();
      this.clear();
      this.visualizePointsSphere();
    };
    this.improveAndVisualizeTrianglesSphere = function() {
      this.terrain.improvePointsSphere();
      this.clear();
      this.visualizeTrianglesSphere();
    };
    this.generateAndVisualizeTrianglesSphere = function() {
      this.terrain.generateGoodPointsSphere();
      this.clear();
      this.visualizeTrianglesSphere();
    };
    this.generateAndVisualizeTrianglesColor = function() {
      this.terrain.generateGoodPointsSphere();
      this.clear();
      this.visualizeTrianglesColor();
    };
    this.clear = function() {
      var ctx = this.canvas.getContext("2d");
      // Store the current transformation matrix
      ctx.save();
      // Use the identity matrix while clearing the canvas
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      // Restore the transform
      ctx.restore();
    };
    this.visualizePoints = function() {
      var ctx = this.canvas.getContext("2d");
      //console.log(this.terrain.mesh);
      this.terrain.points.forEach(function(p) {
        //console.log(p);
        ctx.beginPath();
        ctx.arc((p[0] + .5) * $this.params.canvasWidth, (p[1] + .5) * $this.params.canvasHeight, 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
      });
    };
    this.visualizePointsSphere = function() {
      var width = this.canvas.width,
        height = this.canvas.height;
      var projection = d3.geoWinkel3()
        .scale(width / 6.4)
        .translate([width / 2, height / 2])
        .precision(1);
      //get the function that generates the d attribute from svg's line function, not directly usable for canvas
      var ctx = this.canvas.getContext("2d");
      var path = d3.geoPath().projection(projection).context(ctx);
      var border = {
        'type': 'Sphere'
      };
      ctx.beginPath();
      path(border);
      ctx.strokeStyle = "#000";
      ctx.stroke();
      var randomPoint = {
        'type': 'MultiPoint',
        'coordinates': this.terrain.points
      };
      ctx.beginPath();
      path(randomPoint);
      ctx.stroke();
    };
    this.visualizeTrianglesSphere = function() {
      var width = this.canvas.width,
        height = this.canvas.height;
      var projection = d3.geoWinkel3()
        .scale(width / 6.4)
        .translate([width / 2, height / 2])
        .precision(1);
      //get the function that generates the d attribute from svg's line function, not directly usable for canvas
      var ctx = this.canvas.getContext("2d");
      var path = d3.geoPath().projection(projection).context(ctx);
      var border = {
        'type': 'Sphere'
      };
      ctx.beginPath();
      path(border);
      ctx.strokeStyle = "#000";
      ctx.stroke();
      ctx.beginPath();
      path(this.terrain.triangles);
      ctx.stroke();
    };
    this.addMountainAndVisualizeTrianglesColor = function() {
      //TODO add mountain
      this.clear();
      this.visualizeTrianglesColor();
    };
    this.visualizeTrianglesColor = function() {
      var width = this.canvas.width,
        height = this.canvas.height;
      var projection = d3.geoWinkel3()
        .scale(width / 6.4)
        .translate([width / 2, height / 2])
        .precision(1);
      //get the function that generates the d attribute from svg's line function, not directly usable for canvas
      var ctx = this.canvas.getContext("2d");
      var path = d3.geoPath().projection(projection).context(ctx);
      var border = {
        'type': 'Sphere'
      };
      ctx.beginPath();
      path(border);
      ctx.strokeStyle = "#000";
      ctx.stroke();
      //console.log(this.terrain.triangles);
      //console.log(this.terrain.heightMap);
      var hi = d3.max(this.terrain.heightMap) + 1e-9;
      var lo = d3.min(this.terrain.heightMap) - 1e-9;
      //convert all the values to 0-1 so that we can interpolate them later
      var mappedvals = this.terrain.heightMap.map(function(x) {
        return x > hi ? 1 : x < lo ? 0 : (x - lo) / (hi - lo);
      });
      for (var f in this.terrain.edges) {
        var edge = this.terrain.edges[f];
        var start = this.terrain.points[edge[0]];
        var stop = this.terrain.points[edge[1]];
        var startPixel = projection(start);
        var stopPixel = projection(stop);
        var startHeight = mappedvals[edge[0]];
        //console.log(startHeight);
        var stopHeight = mappedvals[edge[1]];
        var startColor = d3.interpolateCool(startHeight);
        var stopColor = d3.interpolateCool(stopHeight);
        var grad = ctx.createLinearGradient(startPixel[0], startPixel[1], stopPixel[0], stopPixel[1]);
        grad.addColorStop(0, startColor);
        grad.addColorStop(1, stopColor);
        ctx.beginPath();
        var a = {
          'type': 'LineString',
          'coordinates': [start, stop]
        };
        path(a);
        ctx.strokeStyle = grad;
        //ctx.fillStyle=grad;
        ctx.stroke();
      }
    };
    this.visualizeMeshSphere = function() {
      var width = this.canvas.width,
        height = this.canvas.height;
      var projection = d3.geoWinkel3()
        .scale(width / 6.4)
        .translate([width / 2, height / 2])
        .precision(1);
      //get the function that generates the d attribute from svg's line function, not directly usable for canvas
      var ctx = this.canvas.getContext("2d");
      var path = d3.geoPath().projection(projection).context(ctx);
      var border = {
        'type': 'Sphere'
      };
      ctx.beginPath();
      path(border);
      ctx.strokeStyle = "#000";
      ctx.stroke();
      ctx.beginPath();
      //console.log(this.terrain.cellMesh);
      path(this.terrain.cellMesh);
      ctx.stroke();
    };
    this.visualizeVoronoi = function() {
      var ctx = this.canvas.getContext("2d");
      var hi = d3.max(this.terrain.mesh) + 1e-9;
      var lo = d3.min(this.terrain.mesh) - 1e-9;
      var mappedvals = this.terrain.heightMap.map(function(x) {
        return x > hi ? 1 : x < lo ? 0 : (x - lo) / (hi - lo);
      });
      this.terrain.edges.forEach(function(e) {
        var a = e[2];
        var b = e[3];
        if (typeof a != 'undefined' && typeof b != 'undefined') {
          //console.log(e);
          ctx.beginPath();
          ctx.moveTo((a[0] + .5) * 400, (a[1] + .5) * 200);
          ctx.lineTo((b[0] + .5) * 400, (b[1] + .5) * 200);
          ctx.stroke();
        }
      });
    };
  }
}