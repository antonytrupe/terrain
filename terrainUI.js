"use strict";
class TerrainUI {
  constructor(canvas) {
    "use strict";
    var $this = this;
    //this.params = params || DEFAULT_PARAMS;
    //this.extent = this.params.extent;
    this.canvas = canvas;
    this.terrain = new Terrain(this.extent);
    var projection;

    this.addZoomPan=function(){
       d3.geoZoom()
          .northUp(true)
          .projection(getProjection())
          .onMove(visualizeHeightmap)
          
        (canvas);
    };

    this.generateAndVisualizePointsFlat = function() {
      this.terrain.generatePointsFlat();
      clear();
      this.visualizePointsFlat();
    };

    this.resetViewAndVisualizeHeightmap=function(){
	//TODO
      var width = $this.canvas.width,
        height = $this.canvas.height;
       projection
        .scale(width / 5.2)
        .translate([width / 2, height / 2])
        .rotate([0,0,0])
        //.precision(1)
;
      visualizeHeightmap();
     };

    this.setSeaLevelToMedianAndVisualizeHeightmap=function(){
	  clear();
      this.terrain.setSeaLevel(.5);
      visualizeHeightmap();
      //this.visualizeCoast();
    };

    this.normalizeAndVisualizeHeightmap=function(){
      clear();
      this.terrain.normalize();
      visualizeHeightmap();
      //this.visualizeCoast();
    };

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
      //this.terrain.makeMesh();
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
      //this.terrain.makeMesh();
      //var primH = this.terrain.zero(mesh);
      clear();
      this.visualizeVoronoiFlat();
    };
    this.copyAndVisualizeVoronoi = function(src) {
      this.terrain.copy(src.terrain);
      clear();
      this.visualizeMesh();
    };
    this.copyAndVisualizeHeightmap = function(src) {
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
      this.terrain.getPoints().forEach(function(p) {
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

    function visualizeGeoJsonFill(geojson){
	  var projection = getProjection();
      var ctx = $this.canvas.getContext("2d");
      var path = d3.geoPath().projection(projection).context(ctx);
      ctx.beginPath();
      path(geojson);
      //ctx.fillStyle = "#FF0000";
      ctx.fill();
//      ctx.stroke();
    }

    this.visualizeVoronoiEdges=function(){
    //todo 3
      //clear();
      //visualizeBorder();
      visualizeEdges(this.terrain.getEdges(),this.terrain.getCenters());
    };

/**
clear, border, height intervals
 */
    function visualizeHeightmap(){
	  //console.log($this.terrain);
      clear();
      visualizeBorder();

      //water base
      var projection = getProjection();
	  var ctx = $this.canvas.getContext("2d");
      var path = d3.geoPath().projection(projection).context(ctx);
      var border = {
        'type': 'Sphere'
      };
      ctx.beginPath();
      path(border);
      ctx.fillStyle = d3.interpolateViridis(-1);
      ctx.fill();

      //contours
      for(var i=-1;i<1;i+=.1)
      {
	    ctx.fillStyle = d3.interpolateViridis(i);
	    visualizeGeoJsonFill(d3.geoContour().contour($this.terrain.getHeightMap(),i));
      }

      //coast
      var contour=d3.geoContour().contour($this.terrain.getHeightMap(),.5);
      ctx.lineWidth=2;
      visualizeGeoJson(contour);

      //equator
      visualizeEquator();
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
        'coordinates': this.terrain.getPoints()
      });
    };

    this.visualizePoints2 = function() {
      var projection =getProjection();
      //get the function that generates the d attribute from svg's line function, not directly usable for canvas
      var ctx = this.canvas.getContext("2d");
      var path = d3.geoPath().projection(projection).context(ctx);
      var randomPoint = {
        'type': 'MultiPoint',
        'coordinates': this.terrain.getPoints()
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
      path(d3.geoVoronoi().triangles(this.terrain.getPoints()));
      ctx.stroke();
    };

/**
clear, borders coast */
    this.visualizeCoast=function(){
	  console.log('visualizeCoast');
      clear();
      visualizeBorder();
      //visualizeGraticuls();
      var contour=d3.geoContour().contour($this.terrain.getHeightMap(),.5);
      visualizeGeoJson(contour);
    };

/**
clear, border, coast, height intervals
 */
    this.addContinentAndVisualizeHeightmap = function(count) {
      this.terrain.mountains(count,(1*Math.PI)*(3/8));
      clear();
      visualizeHeightmap();
      //visualizeSeaLevel();
    };

    this.addIslandAndVisualizeHeightmap = function(count) {
      this.terrain.mountains(count,.2);
      clear();
      visualizeHeightmap();
      //visualizeSeaLevel();
    };

    function getProjection(){
      var width = $this.canvas.width,
        height = $this.canvas.height;
      if(typeof projection=="undefined")
      {	
	//geoEqualEarth
	//geoWinkel3
        projection=  d3.geoWinkel3()
          .scale(width / 5.2)
          .translate([width / 2, height / 2])
          .rotate([0,0,0])
          .precision(1);
      }
      return projection;
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
      var ctx = $this.canvas.getContext("2d");
      var path = d3.geoPath().projection(projection).context(ctx);
       var graticule = d3.geoGraticule()
           .step([30, 30]);
      ctx.beginPath();
      path(graticule());
      ctx.strokeStyle = "#000";
      ctx.stroke();
    }

    /**
    add equator
    */
    function visualizeEquator(){
      var projection = getProjection();
      var ctx = $this.canvas.getContext("2d");
      var path = d3.geoPath().projection(projection).context(ctx);
      var graticule = d3.geoGraticule()
           .step([0, 90]);
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