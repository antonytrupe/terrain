class Terrain {
  constructor() {
    const POINT_COUNT = 1024;
    const POINT_MIN = 16;
    const GLOBAL_EXTENT = [
      [-180, -90],
      [180, 90]
    ];
    const SEED = 0;
    var srand = new Math.seedrandom(SEED);
    var $this = this;
    /**[[lat,lon,height,fidelity]] */
    var heightMap = [];
    //second level of points
    var level2Points = [];
    //cache stuff
    var polygons;
    var contours = [];
    this.random = function(min, max) {
      min = min || 1;
      max = max || 100;
      return Math.round(srand() * (max - min) + 1 + min);
    };
    this.getPolygons = function(extent) {
      var extent = extent || GLOBAL_EXTENT;
      var extent_index = JSON.stringify(extent.flat().map(i => Math.round(i)));
      //console.log(extent_index);
      if (!polygons) {
        polygons = [];
      }
      if (!polygons[extent_index]) {
        //console.log('missed cache');
        var local_points = $this.getPoints(extent);
        //console.log(local_points);
        polygons[extent_index] = d3.geoVoronoi().polygons(local_points);
      }
      return polygons[extent_index];
    };
    this.getPolygons2 = function() {
      console.log(level2Points);
      console.log(level2Points.flat(1).map(p => [p[0], p[1]]));
      //if (!polygons2) {
      console.log('missed cache');
      var polygons2 = d3.geoVoronoi().polygons(level2Points.flat(1).map(p => [p[0], p[1]]));
      //}
      console.log(polygons2);
      return polygons2;
    };
    this.flatten = function() {
      this.getHeightMap().map(p => {
        p[2] = 0;
      });
      reset();
    };
    this.getContour = function(height) {
      if (!contours || !contours[height]) {
        //console.log('missed cache');
        contours[height] = d3.geoContour().contour($this.getHeightMap(), height);
      }
      return contours[height];
    };
    this.getPoints = function(fidelity) {
      //TODO only return points that are inside the extent, or are adjacent to points that are inside the extent
      //TODO get higher fidelity points
      return heightMap.map(x => [x[0], x[1]]);
    };
    /**
      call this if the order or location of the original points changes
    */
    function reset() {
      //console.log('reset');
      //reset cached things
      polygons = d3.geoVoronoi().polygons($this.getPoints())
      contours = [];
      level2Points = [];
    }
    this.normalize = function() {
      var h = this.getHeightMap().map(p => p[2])
      var lo = d3.min(h);
      var hi = d3.max(h);
      //short circuit if its a flat world
      if (hi == lo) {
        return;
      }
      this.getHeightMap().forEach((x) => {
        x[2] = (x[2] - lo) / (hi - lo)
      });
    };
    //modifies data directly
    this.setSeaLevel = function(q) {
      var s = heightMap.map(x => x[2]).sort(d3.ascending);
      var delta = d3.quantile(s, q);
      for (var i = 0; i < heightMap.length; i++) {
        heightMap[i][2] -= delta;
      }
    };

    function add(a) {
      for (var i = 0; i < a.length; i++) {
        heightMap[i][2] += a[i];
      }
      reset();
    };

    function mountain({
      center,
      height,
      width
    }) {
      center = center || randomPoint();
      height = height || .6;
      width = width || (1 * Math.PI) * (1 / 8);
      var newvals = []
      newvals.length = heightMap.length;
      newvals.fill(0);
      for (var i = 0; i < heightMap.length; i++) {
        var p = heightMap[i];
        //distance in radians
        var dr = d3.geoDistance(p, center);
        if (dr < width) {
          newvals[i] += (Math.cos(Math.PI * dr / width) + 1) * (height / 2);
        }
      }
      add(newvals);
    }
    /** n number of mountains
    r radians, 2 pi radians is 360 degrees
     */
    this.mountains = function(n, r) {
      r = r || 0.5;
      var mounts = [];
      for (var i = 0; i < n; i++) {
        //generate center points of mountains
        mounts.push(randomPoint());
      }
      //make a zerod copy of the heightmap
      var newvals = []
      newvals.length = heightMap.length;
      newvals.fill(0);
      for (var j = 0; j < n; j++) {
        var m = mounts[j];
        mountain({
          'center': m,
          'height': .6,
          'width': r
        });
      }
    };
    this.getHeightMap = function() {
      return heightMap;
    };
    this.setHeightMap = function(p) {
      heightMap = p;
      reset();
    };
    this.copy = function(src) {
      //make a deep copy
      heightMap = JSON.parse(JSON.stringify(src.getHeightMap()));
      reset();
      //this.zeroHeightMap();
    };
    this.generateGoodPoints = function(bounds, fidelity) {
      this.generatePoints(bounds, fidelity);
      heightMap = heightMap.sort(function(a, b) {
        return a[0] - b[0];
      });
      this.improvePoints(5);
    };

    function randomPoint(bounds, fidelity) {
      var bounds = bounds || {
        'type': 'Sphere'
      };
      var boundingBox = d3.geoBounds(bounds);
      boundingBox = boundingBox || GLOBAL_EXTENT;
      var left = boundingBox[0][0] || -180;
      var right = boundingBox[1][0] || 180;
      var bottom = boundingBox[0][1] || -90;
      var top = boundingBox[1][1] || 90;
      do {
        //lat, north/south, -90 to 90
        var lat = (Math.acos(srand() * 2 - 1) / Math.PI) * (top - bottom) + bottom;
        //lon, east/west, -180 to 180
        var lon = srand() * (right - left) + left;
      }
      //check to make sure its inside the polygon
      while (bounds && !d3.geoContains(bounds, [lon, lat]));
      return [lon, lat, 1e-9, fidelity];
    }
    this.generatePoints = function(count, bounds, fidelity) {
      //TODO this doesn't allow new worlds
      srand = new Math.seedrandom(SEED);
      var count = count || POINT_COUNT;
      var bounds = bounds || {
        'type': 'Sphere'
      };
      var fidelity = fidelity || 1;
      if (fidelity == 1) {
        heightMap = [];
      }
      heightMap = heightMap || [];
      for (var i = 0; i < count; i++) {
        heightMap.push(randomPoint(bounds, fidelity));
      }
      reset();
    };
    this.improvePoints = function(n) {
      var n = n || 2;
      for (var i = 0; i < n; i++) {
        var a = d3.geoVoronoi(heightMap).polygons().features.map(a => d3.geoCentroid(a));
        heightMap = a.map(_ => [_[0], _[1], 0, 1]);
      }
      reset();
    };
  }
}