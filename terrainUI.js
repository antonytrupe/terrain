class TerrainUI {
  constructor(container) {
    var $this = this;
    var container = container;
    var canvas = container.getElementsByTagName('canvas')[0];
    this.terrain = new Terrain(this.extent);
    var projection;
    this.delete = function() {
      //delete the points value
      var name = container.getElementsByClassName('loadSelect')[0].value;
      window.localStorage.removeItem(name);
      //remove the name from the list
      var saves = getSaves();
      var saves = saves.filter(e => e !== name);
      window.localStorage.setItem('terrain_saves', JSON.stringify(saves));
      loadSavedList();
    };

    function getSaves() {
      var n = window.localStorage.getItem('terrain_saves');
      var saves = [];
      if (n && n.length > 0) {
        saves = saves.concat(JSON.parse(n));
      }
      return saves;
    }
    this.save = function() {
      var name = container.getElementsByClassName('saveInput')[0].value;
      if (!name) {
        return;
      }
      //get the list of already saved terrains
      var saves = getSaves();
      if (saves.indexOf(name) == -1) {
        saves.push(name);
      }
      window.localStorage.setItem('terrain_saves', JSON.stringify(saves));
      window.localStorage.setItem(name, JSON.stringify($this.terrain.getHeightMap()));
      //update load list
      loadSavedList();
    };

    function load() {
      var name = container.querySelector('.loadSelect').selectedOptions[0].value;
      var t = window.localStorage.getItem(name);
      $this.terrain.setHeightMap(JSON.parse(t));
    };

    function loadSavedList() {
      var n = window.localStorage.getItem('terrain_saves');
      var select = container.getElementsByClassName('loadSelect');
      if (select.length > 0) {
        //clear the list
        select[0].options.length = 0;
        if (n) {
          var saves = JSON.parse(n);
          saves.forEach(e => {
            var opt1 = document.createElement('option');
            opt1.value = e;
            opt1.text = e;
            select[0].add(opt1);
          });
        }
      }
    }
    loadSavedList();
    this.addZoomPan = function() {
      d3.geoZoom()
        .northUp(true)
        .projection(getProjection())
        .onMove(visualizeHeightmap)
        (canvas);
    };
    this.addHandlers = function() {
      d3.select(canvas).on("click", function(e) {
        //console.log(this);
        //console.log(e);
        //console.log(projection.invert([e.offsetX,e.offsetY]));
        var ll = projection.invert([e.offsetX, e.offsetY])
        var width = (1 * Math.PI) * (3 / 8);
        var w = document.getElementById('width').value;
        var height = document.getElementById('height').value;
        $this.terrain.mountain({
          'center': ll,
          'width': w,
          'height': height
        })
        visualizeHeightmap();
      });
    };
    this.generateAndVisualizePointsFlat = function() {
      this.terrain.generatePointsFlat();
      clear();
      this.visualizePointsFlat();
    };
    this.resetViewAndVisualizeHeightmap = function() {
      resetView();
      visualizeHeightmap();
    };
    this.resetViewAndVisualizeTerrain = function() {
      resetView();
      visualizeTerrain();
    };
    this.setSeaLevelToMedianAndVisualizeHeightmap = function() {
      clear();
      this.terrain.setSeaLevel(.5);
      visualizeHeightmap();
      //this.visualizeCoast();
    };
    this.normalizeAndVisualizeHeightmap = function() {
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
    this.copyAndVisualizeTerrain = function(src) {
      this.terrain.copy(src.terrain);
      clear();
      visualizeTerrain();
    };
    this.loadAndVisualizeTerrain = function() {
      load();
      clear();
      visualizeTerrain();
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
    this.generateAndVisualizeTerrain = function() {
      this.terrain.generateGoodPoints();
      this.terrain.mountains(10, (1 * Math.PI) * (3 / 8));
      this.terrain.mountains(15, .2);
      this.terrain.setSeaLevel(.5);
      this.terrain.normalize();
      clear();
      visualizeTerrain();
    };

    function clear() {
      var ctx = canvas.getContext("2d");
      // Store the current transformation matrix
      ctx.save();
      // Use the identity matrix while clearing the canvas
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Restore the transform
      ctx.restore();
    };
    this.visualizePointsFlat = function() {
      var ctx = this.canvas.getContext("2d");
      this.terrain.getPoints().forEach(function(p) {
        ctx.beginPath();
        ctx.arc((p[0] + .5) * canvas.width, //center x
          (p[1] + .5) * canvas.width, //center y
          2, //radius
          0, //start angle
          Math.PI * 2 //end angle
        );
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
      });
    };

    function visualizeGeoJson(geojson) {
      var projection = getProjection();
      var ctx = canvas.getContext("2d");
      var path = d3.geoPath().projection(projection).context(ctx);
      ctx.beginPath();
      path(geojson);
      ctx.stroke();
    }

    function visualizeGeoJsonFill(geojson) {
      var projection = getProjection();
      var ctx = canvas.getContext("2d");
      var path = d3.geoPath().projection(projection).context(ctx);
      ctx.beginPath();
      path(geojson);
      //ctx.fillStyle = "#FF0000";
      ctx.fill();
      //      ctx.stroke();
    }
    this.visualizeVoronoiEdges = function() {
      //todo 3
      //clear();
      //visualizeBorder();
      visualizeEdges(this.terrain.getEdges(), this.terrain.getCenters());
    };

    function visualizeTerrain() {
      visualizeHeightmap();
    }

    function getVisiblePoints() {
      var width = canvas.width,
        height = canvas.height;
      var visiblePoints = $this.terrain.getHeightMap().filter(l => {
        var px = projection(l);
        var visible = 0 < px[0] && px[0] < width && 0 < px[1] && px[1] < height;
        return visible;
      });
      return visiblePoints;
    }
    /**
    clear, border, height intervals
     */
    function visualizeHeightmap() {
      clear();
      //water base
      var projection = getProjection();
      var ctx = canvas.getContext("2d");
      var path = d3.geoPath().projection(projection).context(ctx);
      var border = {
        'type': 'Sphere'
      };
      ctx.beginPath();
      path(border);
      ctx.fillStyle = d3.interpolateViridis(-1);
      ctx.fill();
      // make steps relative to current extent
      var visiblePoints = getVisiblePoints();
      var h = visiblePoints.map(p => p[2])
      var lo = d3.min(h);
      var hi = d3.max(h);
      //contours
      for (var i = lo; i < hi; i += (hi - lo) / 10) {
        ctx.fillStyle = d3.interpolateViridis(i);
        visualizeGeoJsonFill(d3.geoContour().contour($this.terrain.getHeightMap(), i));
      }
      //coast
      var contour = d3.geoContour().contour($this.terrain.getHeightMap(), .5);
      ctx.lineWidth = 2;
      visualizeGeoJson(contour);
      visualizeBorder();
      //equator
      visualizeEquator();
      //TODO scale
      const scaleBar = d3.geoScaleBar()
        .projection(projection)
        .size([400, 320]);
      d3.select(canvas).call(scaleBar);
    }

    function visualizeEdges(edges, points) {
      var geojson = {
        'type': 'MultiLineString',
        'coordinates': []
      };
      for (var f in edges) {
        var edge = edges[f];
        var start = points[edge[0]];
        var stop = points[edge[1]];
        geojson.coordinates.push([start, stop]);
      }
      visualizeGeoJson(geojson);
    }
    /**
    the vertices of the voronoi polygons, terrain.centers
    */
    this.visualizeVoronoiPoints = function() {
      //clear();
      //visualizeBorder();
      visualizePoints(this.terrain.getCenters());
    };

    function visualizePoints(points) {
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
      var projection = getProjection();
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
    this.visualizeCoast = function() {
      //console.log('visualizeCoast');
      clear();
      visualizeBorder();
      //visualizeGraticuls();
      var contour = d3.geoContour().contour($this.terrain.getHeightMap(), .5);
      visualizeGeoJson(contour);
    };
    /**
    clear, border, coast, height intervals
     */
    this.addContinentAndVisualizeHeightmap = function(count) {
      this.terrain.mountains(count, (1 * Math.PI) * (3 / 8));
      clear();
      visualizeHeightmap();
      //visualizeSeaLevel();
    };
    this.addIslandAndVisualizeHeightmap = function(count) {
      this.terrain.mountains(count, .2);
      clear();
      visualizeHeightmap();
      //visualizeSeaLevel();
    };

    function getProjection() {
      var width = canvas.width,
        height = canvas.height;
      if (typeof projection == "undefined") {
        //console.log('new projection');
        //set projection type here
        //geoOrthographic
        //geoWinkel3
        projection = d3.geoWinkel3()
          //.scale(width / 5.2)
          //.translate([width / 2, height / 2])
          //.rotate([0,0,0])
          .fitExtent([
            [6, 6],
            [width - 6, height - 6]
          ], {
            'type': 'Sphere'
          });
      }
      //console.log(projection.scale());
      return projection;
    }
    this.resetToFlat = function() {
      this.terrain.getHeightMap().map(p => {
        p[2] = 0;
      });
      visualizeHeightmap();
    };

    function resetView() {
      var width = canvas.width,
        height = canvas.height;
      projection
        //.scale(width / 5.2)
        //.translate([width / 2, height / 2])
        .rotate([0, 0, 0])
        .fitExtent([
          [6, 6],
          [width - 6, height - 6]
        ], {
          'type': 'Sphere'
        });
      //console.log(projection.scale());
    }
    /**draw  short strokes to indicate slopes, make it look like a cartographers map*/
    //TODO
    function visualizeSlopes(svg, render) {
      var h = render.h;
      var strokes = [];
      var r = 0.25 / Math.sqrt(h.length);
      for (var i = 0; i < h.length; i++) {
        if (h[i] <= 0 || isnearedge(h.mesh, i)) continue;
        var nbs = neighbours(h.mesh, i);
        nbs.push(i);
        var s = 0;
        var s2 = 0;
        for (var j = 0; j < nbs.length; j++) {
          var slopes = trislope(h, nbs[j]);
          s += slopes[0] / 10;
          s2 += slopes[1];
        }
        s /= nbs.length;
        s2 /= nbs.length;
        if (Math.abs(s) < runif(0.1, 0.4)) continue;
        var l = r * runif(1, 2) * (1 - 0.2 * Math.pow(Math.atan(s), 2)) * Math.exp(s2 / 100);
        var x = h.mesh.vxs[i][0];
        var y = h.mesh.vxs[i][1];
        if (Math.abs(l * s) > 2 * r) {
          var n = Math.floor(Math.abs(l * s / r));
          l /= n;
          if (n > 4) n = 4;
          for (var j = 0; j < n; j++) {
            var u = rnorm() * r;
            var v = rnorm() * r;
            strokes.push([
              [x + u - l, y + v + l * s],
              [x + u + l, y + v - l * s]
            ]);
          }
        } else {
          strokes.push([
            [x - l, y + l * s],
            [x + l, y - l * s]
          ]);
        }
      }
      var lines = svg.selectAll('line.slope').data(strokes)
      lines.enter()
        .append('line')
        .classed('slope', true);
      lines.exit()
        .remove();
      svg.selectAll('line.slope')
        .attr('x1', function(d) {
          return 1000 * d[0][0]
        })
        .attr('y1', function(d) {
          return 1000 * d[0][1]
        })
        .attr('x2', function(d) {
          return 1000 * d[1][0]
        })
        .attr('y2', function(d) {
          return 1000 * d[1][1]
        })
    }

    function visualizeBorder() {
      var projection = getProjection();
      var ctx = canvas.getContext("2d");
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
    function visualizeGraticuls(lat,lon) {
      lat=lat||30;
      lon=lon||30;
      var projection = getProjection();
      var ctx = canvas.getContext("2d");
      var path = d3.geoPath().projection(projection).context(ctx);
      var graticule = d3.geoGraticule()
        .step([lat, lon]);
      ctx.beginPath();
      path(graticule());
      ctx.strokeStyle = "#000";
      ctx.stroke();
    }
    /**
    add equator
    */
    function visualizeEquator() {
      var projection = getProjection();
      var ctx = canvas.getContext("2d");
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
    this.visualizeVoronoi = this.visualizeMesh;
  }
}