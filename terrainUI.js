"use strict";
class TerrainUI {
  constructor(canvas) {
    "use strict";
    var $this = this;
    //this.params = params || DEFAULT_PARAMS;
    //this.extent = this.params.extent;
    this.canvas = canvas;
    this.terrain = new Terrain(this.extent);

    this.cleanCoast=function(){
      this.terrain.cleanCoast();
	  clear();
	  //this.visualizeTrianglesColor();
      visualizeSeaLevel();
    };

    this.generateAndVisualizePointsFlat = function() {
      this.terrain.generatePointsFlat();
      this.clear();
      this.visualizePointsFlat();
    };

    this.setSeaLevelToMedianAndVisualizeHeightmap=function(){
	  clear();
      this.terrain.setSeaLevel(.5);
      visualizeHeightmap();
      visualizeSeaLevel();
    };

    function visualizeSeaLevel(){
      var projection = getProjection();
      //get the function that generates the d attribute from svg's line function, not directly usable for canvas
      var ctx = $this.canvas.getContext("2d");
      var path = d3.geoPath().projection(projection).context(ctx);
      ctx.beginPath();
      var coast=$this.terrain.getCoastPath();
      //console.log(coast);
      //console.log(makeD3Path(coast));
      for (var i = 0; i < coast.length; i++) {
	    for (var j = 1; j < coast[i].length;j++) {
          ctx.beginPath();
          var a = {
            'type': 'LineString',
            'coordinates': [coast[i][j-1], coast[i][j]]
          };
          //console.log(a);
          ctx.strokeStyle = "#000";
          ctx.lineWidth = 2;

          path(a);
          ctx.stroke();
        }
      }
    }

    this.generateAndVisualizePoints = function() {
      this.terrain.generatePoints();
      clear();
      this.visualizeOriginalPoints();
    };

    this.generateAndVisualizePointsAndBorder = function() {
      this.terrain.generatePoints();
      clear();
      visualizeBorder()
      this.visualizeOriginalPoints();
    };

    this.improveAndVisualizeMesh = function() {
      this.terrain.improvePointsFlat();
      this.terrain.makeMesh();
      clear();
      this.visualizeVoronoi();
    };
    this.improveAndVisualizeVoronoi = function() {
      this.terrain.improvePoints();
      clear();
      this.visualizeMesh();
    };
    this.improveAndVisualizeHeightmap = function() {
      this.terrain.improvePoints();
      //this.terrain.makeMesh();
      clear();
      visualizeHeightmap();
    };

    this.generateAndVisualizeMesh = function() {
      this.terrain.generatePointsFlat();
      this.terrain.makeMesh();
      clear();
      this.visualizeVoronoi();
    };

    this.generateAndVisualizeVoronoi = function() {
      this.terrain.generatePoints();
      //this.terrain.makeMeshSphere();
      clear();
      this.visualizeMesh();
    };
    this.copyAndVisualizeTrianglesFlat = function(src) {
      this.terrain.copy(src.terrain);
      this.terrain.makeMesh();
      //var primH = this.terrain.zero(mesh);
      clear();
      this.visualizeVoronoiFlat();
    };
    this.copyAndVisualizeVoronoi = function(src) {
      this.terrain.copy(src.terrain);
      clear();
      this.visualizeMesh();
    };
    this.copyAndVisualizeHightmap = function(src) {
      this.terrain.copy(src.terrain);
      clear();
      visualizeHeightmap();
    };
   
    this.improveAndVisualizePointsFlat = function() {
      this.terrain.improvePointsFlat();
      clear();
      this.visualizePointsFlat();
    };
    this.improveAndVisualizePoints = function() {
      this.terrain.improvePoints();
      clear();
      this.visualizeOriginalPoints();
    };
    this.improveAndVisualizePointsAndBorder = function() {
      this.terrain.improvePoints();
      clear();
      visualizeBorder();
      this.visualizeOriginalPoints();
    };
    this.improveAndVisualizeTriangles = function() {
      this.terrain.improvePoints();
      clear();
      this.visualizeTriangles();
    };

    this.generateAndVisualizeTriangles = function() {
      this.terrain.generateGoodPoints();
      clear();
      this.visualizeTriangles();
    };

    this.generateAndVisualizeHeightmap = function() {
      this.terrain.generateGoodPoints();
      clear();
      visualizeHeightmap();
    };

    function clear() {
      var ctx = $this.canvas.getContext("2d");
      // Store the current transformation matrix
      ctx.save();
      // Use the identity matrix while clearing the canvas
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, $this.canvas.width, $this.canvas.height);
      // Restore the transform
      ctx.restore();
    };

    this.visualizePointsFlat = function() {
      var ctx = this.canvas.getContext("2d");
      this.terrain.points.forEach(function(p) {
        ctx.beginPath();
        ctx.arc((p[0] + .5) * $this.canvas.width, //center x
                (p[1] + .5) * $this.canvas.width, //center y
                2, //radius
                0,//start angle
                Math.PI * 2//end angle
                );
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
      });
    };

    function visualizeGeoJson(geojson){
	  var projection = getProjection();
      var ctx = $this.canvas.getContext("2d");
      var path = d3.geoPath().projection(projection).context(ctx);
      ctx.beginPath();
      path(geojson);
      ctx.stroke();
    }

    this.visualizeVoronoiEdges=function(){
      //clear();
      //visualizeBorder();
      visualizeEdges(this.terrain.edges,this.terrain.getCenters());
    };

    function visualizeHeightmap(){
	  //console.log(this.terrain.edges);
      clear();
      visualizeBorder();
      //visualizeEdges($this.terrain.edges,$this.terrain.centers);

      var projection = getProjection();
      //get the function that generates the d attribute from svg's line function, not directly usable for canvas
      var ctx = $this.canvas.getContext("2d");
      var path = d3.geoPath().projection(projection).context(ctx);
      var heightMap=$this.terrain.getHeightMap()
      var hi = d3.max(heightMap) + 1e-9;
      var lo = d3.min(heightMap) - 1e-9;
      //convert all the values to 0-1 so that we can interpolate them later
      var mappedvals = heightMap.map(function(x) {
        return x > hi ? 1 : x < lo ? 0 : (x - lo) / (hi - lo);
      });

      var edges=$this.terrain.edges;
      var centers=$this.terrain.getCenters();
      for (var f in edges) {
        var edge = edges[f];
        var start = centers[edge[0]];
        var stop = centers[edge[1]];

        var startPixel = projection(start);
        var stopPixel = projection(stop);

        var h0=heightMap[edge[0]];
        var h1=heightMap[edge[1]];


        var startHeight = mappedvals[edge[0]];
        var stopHeight = mappedvals[edge[1]];
        if(h0>0 || h1>0){
          var startColor = d3.interpolateViridis(startHeight);
          var stopColor = d3.interpolateViridis(stopHeight);
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
        ctx.fillStyle=grad;
        ctx.stroke();
}
      }

    }

    function visualizeEdges(edges,points){
	  var geojson={'type':'MultiLineString','coordinates':[]};
	  for (var f in edges) {
        var edge = edges[f];
	    var start = points[edge[0]];
        var stop = points[edge[1]];
        geojson.coordinates.push([start,stop]);
      }
      visualizeGeoJson(geojson);
    }
    /**
    the vertices of the voronoi polygons, terrain.centers
    */
    this.visualizeVoronoiPoints=function(){
      //clear();
      //visualizeBorder();
      visualizePoints(this.terrain.getCenters());
    };

    function visualizePoints(points){
      visualizeGeoJson({
        'type': 'MultiPoint',
        'coordinates': points
      });
    }

    this.visualizeOriginalPoints = function() {
	  //clear();
      //visualizeBorder();
      visualizeGeoJson({
        'type': 'MultiPoint',
        'coordinates': this.terrain.points
      });
    };

    this.visualizePoints2 = function() {
      var projection =getProjection();
      //get the function that generates the d attribute from svg's line function, not directly usable for canvas
      var ctx = this.canvas.getContext("2d");
      var path = d3.geoPath().projection(projection).context(ctx);
      var randomPoint = {
        'type': 'MultiPoint',
        'coordinates': this.terrain.points
      };
      ctx.beginPath();
      path(randomPoint);
      ctx.stroke();
    };

    this.visualizeTriangles = function() {
      var projection = getProjection();
      //get the function that generates the d attribute from svg's line function, not directly usable for canvas
      var ctx = this.canvas.getContext("2d");
      var path = d3.geoPath().projection(projection).context(ctx);
      clear();
      //visualizeBorder();
      ctx.beginPath();
      //console.log(this.terrain.triangles);
      path(d3.geoVoronoi().triangles(this.terrain.points));
      ctx.stroke();
    };

    

    this.visualizeLand=function(){
	  clear();
      visualizeSeaLevel();
    };

    this.addMountainAndVisualizeHeightmap = function() {
      //TODO add mountain
      this.terrain.mountains(1);
      clear();
      visualizeHeightmap();
      //visualizeSeaLevel();
    };

    function getProjection(){
      var width = $this.canvas.width,
        height = $this.canvas.height;
      return  d3.geoWinkel3()
        .scale(width / 5.2)
        .translate([width / 2, height / 2])
        .rotate([60,0,0])
        .precision(1);
    }

    function visualizeBorder(){
      var projection = getProjection();
	  var ctx = $this.canvas.getContext("2d");
      var path = d3.geoPath().projection(projection).context(ctx);
      var border = {
        'type': 'Sphere'
      };
      ctx.beginPath();
      path(border);
      ctx.strokeStyle = "#000";
      ctx.stroke();
    }

    /**
    add lat/lon lines
    */
    function visualizeGraticuls(){
      var projection = getProjection();
      var ctx = this.canvas.getContext("2d");
      var path = d3.geoPath().projection(projection).context(ctx);
       var graticule = d3.geoGraticule()
           .step([30, 30]);
      ctx.beginPath();
      path(graticule());
      ctx.strokeStyle = "#000";
      ctx.stroke();
    }

    this.visualizeMesh = function() {
      //var projection = getProjection();
      //get the function that generates the d attribute from svg's line function, not directly usable for canvas
      //var ctx = this.canvas.getContext("2d");
      //var path = d3.geoPath().projection(projection).context(ctx);
      clear();
      visualizeBorder();
      visualizeGeoJson(this.terrain.getCellMesh());
    };

    this.visualizeTrianglesAndMeshSphere = function() {
      var projection = getProjection()
      //get the function that generates the d attribute from svg's line function, not directly usable for canvas
      var ctx = this.canvas.getContext("2d");
      var path = d3.geoPath().projection(projection).context(ctx);
      clear();
      visualizeBorder();
      
      //console.log(this.terrain.cellMesh);

      ctx.beginPath();
      path(this.terrain.voronoi.cellMesh);  
      ctx.strokeStyle = "#00F";
      ctx.stroke();
    };

    this.visualizeVoronoi =this.visualizeMesh;
  }
}