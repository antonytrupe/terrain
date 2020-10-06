class TerrainUI {
  constructor(container, options) {
    options = options || getOptions();
    var $this = this;
    var container = container;
    var canvas = container.getElementsByTagName('canvas')[0];
    this.terrain = new Terrain();
    this.geopolitical = new GeoPolitical();
    var projection;
    var path;

    function getOptions() {
      options = options || {
        "points": false,
        "polygons": false,
        "heightmap": true,
        "scale": false,
        "coast": true
      };
      //console.log(container.getElementsByClassName('modes'));
      Array.from(container.querySelectorAll('fieldset.options input[type=checkbox]')).forEach(el => {
        //console.log(el.name);console.log(el.checked);
        options[el.name] = el.checked;
      });
      return options;
    }

    function visualizeScale(visible) {
      //TODO scale
      var scale = container.querySelector('g.scale');
      if (scale) {
        scale.style.display = visible ? 'block' : 'none';
        const scaleBar = d3.geoScaleBar()
          .projection(projection)
          .units(d3.geoScaleMiles)
          .orient(d3.geoScaleBottom)
          .size([canvas.width, canvas.height])
          .left(.05)
          //.top(.15)
          .tickFormat((d, i, e) => i === e.length - 1 ? `${d} Miles` : d)
        //.tickFormat(d3.format(","));
        d3.select(scale).call(scaleBar);
      }
    }
    this.generatePopulationCenter = function() {
      this.geopolitical.generatePopulationCenter()
      //console.log(populationClasses);
    };

    function random(min, max) {
      return $this.terrain.random(min, max);
    }
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
    var zoom;

    function addZoomPan() {
      zoom = d3.geoZoom()
        //.northUp(true)
        .projection(getProjection())
        .onMove(visualize)
        //TODO max zoom
        .scaleExtent([1, 10000000])
        (canvas);
    };
    addZoomPan();
    this.addHandlers = function() {
      d3.select(canvas).on("click", function(e) {
        var ll = projection.invert([e.offsetX, e.offsetY])
        //TODO make this container specific
        //look up the sliders to get the size of the thing
        var w = document.getElementById('width').value;
        var height = document.getElementById('height').value;
        $this.terrain.mountain({
          'center': ll,
          'width': w,
          'height': height
        })
        visualize();
      });
    };
    this.resetViewAndVisualize = function() {
      resetView();
      visualize();
    };
    this.setSeaLevelToMedianAndVisualize = function() {
      this.terrain.setSeaLevel(.5);
      visualize();
    };
    this.normalizeAndVisualize = function() {
      this.terrain.normalize();
      visualize();
    };
    this.generateAndVisualize = function() {
      this.terrain.generatePoints();
      this.visualize();
    };
    this.improveAndVisualize = function() {
      this.terrain.improvePoints();
      visualize();
    };
    this.loadAndVisualize = function() {
      load();
      visualize();
    };
    this.copyAndVisualize = function(src) {
      this.terrain.copy(src.terrain);
      visualize();
    };
    this.generateGoodPointsAndVisualize = function() {
      this.terrain.generateGoodPoints();
      this.visualize();
    };
    this.generateGoodTerrainAndVisualize = function() {
      this.terrain.generateGoodPoints();
      //continents
      this.terrain.mountains(10, (1 * Math.PI) * (3 / 8));
      //islands
      this.terrain.mountains(15, .2);
      this.terrain.setSeaLevel(.5);
      this.terrain.normalize();
      visualize();
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

    function visualizeGeoJson(geojson, styles) {
      styles = styles || {};
      var ctx = canvas.getContext("2d");
      var path = getPath();
      //ctx.beginPath();
      var originalStyles = {};
      for (const [key, value] of Object.entries(styles)) {
        originalStyles[key] = ctx[key];
        ctx[key] = value;
      }
      path(geojson);
      ctx.stroke();
      for (const [key, value] of Object.entries(originalStyles)) {
        ctx[key] = value;
      }
    }

    function visualizeGeoJsonFill(geojson) {
      var ctx = canvas.getContext("2d");
      var path = getPath();
      ctx.beginPath();
      path(geojson);
      ctx.fill();
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

    function getPath() {
      if (!path) {
        //console.log('new path method');
        var projection = getProjection();
        var ctx = canvas.getContext("2d");
        path = d3.geoPath().context(ctx).projection(projection);
      }
      return path;
    }
    /**
     */
    function visualizeHeightmap() {
      //water base
      var ctx = canvas.getContext("2d");
      var path = getPath();
      var border = {
        'type': 'Sphere'
      };
      ctx.beginPath();
      path(border);
      var originalFillStyle = ctx.fillStyle;
      ctx.fillStyle = d3.interpolateViridis(-1);
      ctx.fill();
      //get contour step intervals
      var h = $this.terrain.getHeightMap().map(p => p[2]);
      var lo = d3.min(h);
      var hi = d3.max(h);
      var steps = 6;
      //contours
      for (var i = lo; i < hi; i += (hi - lo) / steps) {
        ctx.fillStyle = d3.interpolateViridis(i);
        //do some caching
        var contour = $this.terrain.getContour(i);
        visualizeGeoJsonFill(contour);
      }
      ctx.fillStyle = originalFillStyle;
    }

    function visualizePoints(points) {
      visualizeGeoJson({
        'type': 'MultiPoint',
        'coordinates': points
      });
    }

    function visualizeOriginalPoints() {
      visualizeGeoJson({
        'type': 'MultiPoint',
        'coordinates': $this.terrain.getPoints()
      });
    }

    function visualizeCoast() {
      var coast = $this.terrain.getContour(.5);
      visualizeGeoJson(coast, {
        'lineWidth': 2
      });
    }
    /**
     */
    this.addContinentAndVisualize = function(count) {
      this.terrain.mountains(count, (1 * Math.PI) * (3 / 8));
      visualize();
    };
    this.addIslandAndVisualize = function(count) {
      this.terrain.mountains(count, .2);
      visualize();
    };

    function getProjection() {
      if (typeof projection == "undefined") {
        //console.log('new projection object');
        var width = canvas.width,
          height = canvas.height;
        //set projection type here, geoOrthographic, geoWinkel3
        projection = d3.geoWinkel3()
          //.scale((Math.min(width, height)) / 2)
          .translate([width / 2, height / 2])
          //.rotate([0,0,0])
          .fitExtent([
            [6, 6],
            [width - 6, height - 6]
          ], {
            'type': 'Sphere'
          });
      }
      return projection;
    }
    this.resetToFlat = function() {
      this.terrain.getHeightMap().map(p => {
        p[2] = 0;
      });
      visualize();
    };

    function resetView() {
      d3.select(canvas).call(d3.zoom().transform, d3.zoomIdentity);
      var width = canvas.width,
        height = canvas.height;
      //console.log(projection.scale());
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

    function visualize() {
      var modes = getOptions();
      clear();
      border();
      if (modes.heightmap) {
        visualizeHeightmap();
      }
      if (modes.coast) {
        visualizeCoast();
      }
      if (modes.points) {
        visualizeOriginalPoints();
      }
      if (modes.polygons) {
        visualizePolygons();
      }
      visualizeScale(modes.scale);
    }

    function visualizePolygons() {
      var polygons = $this.terrain.getPolygons();
      visualizeGeoJson(polygons);
    }
    this.visualize = function() {
      visualize();
    };

    function border() {
      visualizeBorder();
    }

    function visualizeBorder() {
      //var projection = getProjection();
      var ctx = canvas.getContext("2d");
      var path = getPath();
      var border = {
        'type': 'Sphere'
      };
      ctx.beginPath();
      path(border);
      var originalStrokeStyle = ctx.strokeStyle;
      ctx.strokeStyle = "#000";
      ctx.stroke();
      ctx.strokeStyle = originalStrokeStyle;
    }
    /**
    add lat/lon lines
    */
    function visualizeGraticuls(lat, lon) {
      lat = lat || 30;
      lon = lon || 30;
      //var projection = getProjection();
      var ctx = canvas.getContext("2d");
      var path = getPath();
      var graticule = d3.geoGraticule()
        .step([lat, lon]);
      ctx.beginPath();
      path(graticule());
      var originalStrokeStyle = ctx.strokeStyle;
      ctx.strokeStyle = "#000";
      ctx.stroke();
      ctx.strokeStyle = originalStrokeStyle;
    }
  }
}