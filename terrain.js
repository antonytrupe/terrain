class Terrain {
  constructor() {
    const POINT_COUNT = 8;
    const SEED = 996;
    var srand = new Math.seedrandom(SEED);
    var $this = this;
    /**[[lat,lon,height]] */
    var points = [];

    this.random=function(min, max) {
      min = min || 1;
      max = max || 100;
      return Math.round(srand() * (max - min) + 1 + min);
    };

    this.percentile=function() {
      return this.random(1, 100);
    };
    this.getPoints = function() {
      return points.map(x => [x[0], x[1]]);
    };
    /**
      call this if the order or location of the original points changes
    */
    function update() {}
    this.normalize = function() {
      var h = points.map(p => p[2])
      var lo = d3.min(h);
      var hi = d3.max(h);
      //short circuit if its a flat world
      if (hi == lo) {
        return;
      }
      points.forEach((x) => {
        x[2] = (x[2] - lo) / (hi - lo)
      });
    };
    this.setSeaLevel = function(q) {
      var s = points.map(x => x[2]).sort(d3.ascending);
      var delta = d3.quantile(s, q);
      for (var i = 0; i < points.length; i++) {
        points[i][2] -= delta;
      }
    };
    this.generateGoodPoints = function() {
      this.generatePoints();
      points = points.sort(function(a, b) {
        return a[0] - b[0];
      });
      this.improvePoints(5);
    };
    this.generateGoodPointsFlat = function() {
      this.generatePoints();
      points = points.sort(function(a, b) {
        return a[0] - b[0];
      });
      this.improvePointsFlat();
    };

    function add(a) {
      for (var i = 0; i < a.length; i++) {
        points[i][2] += a[i];
      }
    };
    this.mountain = function({
      center,
      height,
      width
    }) {
      center = center || randomPoint();
      height = height || 1;
      width = width || (1 * Math.PI) * (1 / 8);
      var newvals = []
      newvals.length = points.length;
      newvals.fill(0);
      for (var i = 0; i < points.length; i++) {
        var p = points[i];
        //distance in radians
        var dr = d3.geoDistance(p, center);
        if (dr < width) {
          newvals[i] += (Math.cos(Math.PI * dr / width) + 1) * (height / 2);
        }
      }
      add(newvals);
    };
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
      newvals.length = points.length;
      newvals.fill(0);
      for (var j = 0; j < n; j++) {
        var m = mounts[j];
        for (var i = 0; i < points.length; i++) {
          var p = points[i];
          //var pp = [(p[0] + 90) / 180, (p[1] + 180) / 360];
          //var mm = [(m[0] + 90) / 180, (m[1] + 180) / 360];
          //need to normalize points from [-90|90,-180|180] to [0|1,0|1]
          //y=(cos(pi*x)+1)/2
          //distance in radians
          var dr = d3.geoDistance(p, m);
          if (dr < r) {
            newvals[i] += (Math.cos(Math.PI * dr) + 1) / 2;
          }
        }
      }
      add(newvals);
    };
    this.getCellMesh = function() {
      return voronoi.cellMesh;
    };
    /**
    return the raw data of polygon vertice locations
    */
    this.getCenters = function() {
      return delaunay.centers;
    };
    this.getHeightMap = function() {
      return points;
    };
    this.setHeightMap = function(p) {
      points = p;
    };
    this.copy = function(src) {
      //make a deep copy
      points = JSON.parse(JSON.stringify(src.getHeightMap()));
      update();
      //this.zeroHeightMap();
    };
    this.generatePointsFlat = function(n) {
      var n = n || 256;
      points = [];
      for (var i = 0; i < n; i++) {
        points.push([(srand() - .5) * this.extent.width,
          (srand() - .5) * this.extent.height
        ]);
      }
    };

    function randomPoint() {
      var lat = Math.acos(srand() * 2 - 1) / Math.PI * 180 - 90;
      var lon = srand() * 360 - 180;
      return [lon, lat, 1e-9];
    }
    this.generatePoints = function(n) {
      //var SEED = Math.round(Math.random()*1000);
      srand = new Math.seedrandom(SEED);
      var n = n || POINT_COUNT;
      points = [];
      for (var i = 0; i < n; i++) {
        points.push(randomPoint());
      }
      update();
    };
    this.improvePointsFlat = function(n) {
      var n = n || 1;
      for (var i = 0; i < n; i++) {
        points = voronoi().polygons(points).map(centroid);
      }
    };
    this.improvePoints = function(n) {
      var n = n || 2;
      for (var i = 0; i < n; i++) {
        var a = d3.geoVoronoi(points).polygons().features.map(centroidSphere);
        points = a.map(_ => [_[0], _[1], 0]);
      }
      update();
    };

    function centroidSphere(a) {
      var c = d3.geoCentroid(a);
      return c;
    }

    function voronoi() {
      var w = $this.extent.width / 2;
      var h = $this.extent.height / 2;
      var a = d3.voronoi().extent([
        [-w, -h],
        [w, h]
      ])(points);
      return a;
    }

    function centroid(pts) {
      var x = 0;
      var y = 0;
      for (var i = 0; i < pts.length; i++) {
        x += pts[i][0];
        y += pts[i][1];
      }
      return [x / pts.length, y / pts.length];
    }
  }
}

function runif(lo, hi) {
  return lo + Math.random() * (hi - lo);
}
var rnorm = (function() {
  var z2 = null;

  function rnorm() {
    if (z2 != null) {
      var tmp = z2;
      z2 = null;
      return tmp;
    }
    var x1 = 0;
    var x2 = 0;
    var w = 2.0;
    while (w >= 1) {
      x1 = runif(-1, 1);
      x2 = runif(-1, 1);
      w = x1 * x1 + x2 * x2;
    }
    w = Math.sqrt(-2 * Math.log(w) / w);
    z2 = x2 * w;
    return x1 * w;
  }
  return rnorm;
})();

function randomVector(scale) {
  return [scale * rnorm(), scale * rnorm()];
}

function isedge(mesh, i) {
  return (mesh.adj[i].length < 3);
}

function isnearedge(mesh, i) {
  var x = mesh.vxs[i][0];
  var y = mesh.vxs[i][1];
  var w = mesh.extent.width;
  var h = mesh.extent.height;
  return x < -0.45 * w || x > 0.45 * w || y < -0.45 * h || y > 0.45 * h;
}

function distance(mesh, i, j) {
  var p = mesh.vxs[i];
  var q = mesh.vxs[j];
  return Math.sqrt((p[0] - q[0]) * (p[0] - q[0]) + (p[1] - q[1]) * (p[1] - q[1]));
}

function slope(mesh, direction) {
  return mesh.map(function(x) {
    return x[0] * direction[0] + x[1] * direction[1];
  });
}

function cone(mesh, slope) {
  return mesh.map(function(x) {
    return Math.pow(x[0] * x[0] + x[1] * x[1], 0.5) * slope;
  });
}

function map(h, f) {
  var newh = h.map(f);
  newh.mesh = h.mesh;
  return newh;
}

function peaky(h) {
  return map(normalize(h), Math.sqrt);
}

function relax(h) {
  var newh = zero(h.mesh);
  for (var i = 0; i < h.length; i++) {
    var nbs = neighbours(h.mesh, i);
    if (nbs.length < 3) {
      newh[i] = 0;
      continue;
    }
    newh[i] = d3.mean(nbs.map(function(j) {
      return h[j]
    }));
  }
  return newh;
}

function downhill(h) {
  if (h.downhill) return h.downhill;

  function downfrom(i) {
    if (isedge(h.mesh, i)) return -2;
    var best = -1;
    var besth = h[i];
    var nbs = neighbours(h.mesh, i);
    for (var j = 0; j < nbs.length; j++) {
      if (h[nbs[j]] < besth) {
        besth = h[nbs[j]];
        best = nbs[j];
      }
    }
    return best;
  }
  var downs = [];
  for (var i = 0; i < h.length; i++) {
    downs[i] = downfrom(i);
  }
  h.downhill = downs;
  return downs;
}

function findSinks(h) {
  var dh = downhill(h);
  var sinks = [];
  for (var i = 0; i < dh.length; i++) {
    var node = i;
    while (true) {
      if (isedge(h.mesh, node)) {
        sinks[i] = -2;
        break;
      }
      if (dh[node] == -1) {
        sinks[i] = node;
        break;
      }
      node = dh[node];
    }
  }
}

function fillSinks(h, epsilon) {
  epsilon = epsilon || 1e-5;
  var infinity = 999999;
  var newh = zero(h.mesh);
  for (var i = 0; i < h.length; i++) {
    if (isnearedge(h.mesh, i)) {
      newh[i] = h[i];
    } else {
      newh[i] = infinity;
    }
  }
  while (true) {
    var changed = false;
    for (var i = 0; i < h.length; i++) {
      if (newh[i] == h[i]) continue;
      var nbs = neighbours(h.mesh, i);
      for (var j = 0; j < nbs.length; j++) {
        if (h[i] >= newh[nbs[j]] + epsilon) {
          newh[i] = h[i];
          changed = true;
          break;
        }
        var oh = newh[nbs[j]] + epsilon;
        if ((newh[i] > oh) && (oh > h[i])) {
          newh[i] = oh;
          changed = true;
        }
      }
    }
    if (!changed) return newh;
  }
}

function getFlux(h) {
  var dh = downhill(h);
  var idxs = [];
  var flux = zero(h.mesh);
  for (var i = 0; i < h.length; i++) {
    idxs[i] = i;
    flux[i] = 1 / h.length;
  }
  idxs.sort(function(a, b) {
    return h[b] - h[a];
  });
  for (var i = 0; i < h.length; i++) {
    var j = idxs[i];
    if (dh[j] >= 0) {
      flux[dh[j]] += flux[j];
    }
  }
  return flux;
}

function getSlope(h) {
  var dh = downhill(h);
  var slope = zero(h.mesh);
  for (var i = 0; i < h.length; i++) {
    var s = trislope(h, i);
    slope[i] = Math.sqrt(s[0] * s[0] + s[1] * s[1]);
  }
  return slope;
}

function erosionRate(h) {
  var flux = getFlux(h);
  var slope = getSlope(h);
  var newh = zero(h.mesh);
  for (var i = 0; i < h.length; i++) {
    var river = Math.sqrt(flux[i]) * slope[i];
    var creep = slope[i] * slope[i];
    var total = 1000 * river + creep;
    total = total > 200 ? 200 : total;
    newh[i] = total;
  }
  return newh;
}

function erode(h, amount) {
  var er = erosionRate(h);
  var newh = zero(h.mesh);
  var maxr = d3.max(er);
  for (var i = 0; i < h.length; i++) {
    newh[i] = h[i] - amount * (er[i] / maxr);
  }
  return newh;
}

function doErosion(h, amount, n) {
  n = n || 1;
  h = fillSinks(h);
  for (var i = 0; i < n; i++) {
    h = erode(h, amount);
    h = fillSinks(h);
  }
  return h;
}

function trislope(h, i) {
  var nbs = neighbours(h.mesh, i);
  if (nbs.length != 3) return [0, 0];
  var p0 = h.mesh.vxs[nbs[0]];
  var p1 = h.mesh.vxs[nbs[1]];
  var p2 = h.mesh.vxs[nbs[2]];
  var x1 = p1[0] - p0[0];
  var x2 = p2[0] - p0[0];
  var y1 = p1[1] - p0[1];
  var y2 = p2[1] - p0[1];
  var det = x1 * y2 - x2 * y1;
  var h1 = h[nbs[1]] - h[nbs[0]];
  var h2 = h[nbs[2]] - h[nbs[0]];
  return [(y2 * h1 - y1 * h2) / det,
    (-x2 * h1 + x1 * h2) / det
  ];
}

function cityScore(h, cities) {
  var score = map(getFlux(h), Math.sqrt);
  for (var i = 0; i < h.length; i++) {
    if (h[i] <= 0 || isnearedge(h.mesh, i)) {
      score[i] = -999999;
      continue;
    }
    score[i] += 0.01 / (1e-9 + Math.abs(h.mesh.vxs[i][0]) - h.mesh.extent.width / 2)
    score[i] += 0.01 / (1e-9 + Math.abs(h.mesh.vxs[i][1]) - h.mesh.extent.height / 2)
    for (var j = 0; j < cities.length; j++) {
      score[i] -= 0.02 / (distance(h.mesh, cities[j], i) + 1e-9);
    }
  }
  return score;
}

function placeCity(render) {
  render.cities = render.cities || [];
  var score = cityScore(render.h, render.cities);
  var newcity = d3.scan(score, d3.descending);
  render.cities.push(newcity);
}

function placeCities(render) {
  var params = render.params;
  var n = params.ncities;
  for (var i = 0; i < n; i++) {
    placeCity(render);
  }
}

function getRivers(h, limit) {
  var dh = downhill(h);
  var flux = getFlux(h);
  var links = [];
  var above = 0;
  for (var i = 0; i < h.length; i++) {
    if (h[i] > 0) above++;
  }
  limit *= above / h.length;
  for (var i = 0; i < dh.length; i++) {
    if (isnearedge(h.mesh, i)) continue;
    if (flux[i] > limit && h[i] > 0 && dh[i] >= 0) {
      var up = h.mesh.vxs[i];
      var down = h.mesh.vxs[dh[i]];
      if (h[dh[i]] > 0) {
        links.push([up, down]);
      } else {
        links.push([up, [(up[0] + down[0]) / 2, (up[1] + down[1]) / 2]]);
      }
    }
  }
  return mergeSegments(links).map(relaxPath);
}

function getTerritories(render) {
  var h = render.h;
  var cities = render.cities;
  var n = render.params.nterrs;
  if (n > render.cities.length) n = render.cities.length;
  var flux = getFlux(h);
  var terr = [];
  var queue = new PriorityQueue({
    comparator: function(a, b) {
      return a.score - b.score
    }
  });

  function weight(u, v) {
    var horiz = distance(h.mesh, u, v);
    var vert = h[v] - h[u];
    if (vert > 0) vert /= 10;
    var diff = 1 + 0.25 * Math.pow(vert / horiz, 2);
    diff += 100 * Math.sqrt(flux[u]);
    if (h[u] <= 0) diff = 100;
    if ((h[u] > 0) != (h[v] > 0)) return 1000;
    return horiz * diff;
  }
  for (var i = 0; i < n; i++) {
    terr[cities[i]] = cities[i];
    var nbs = neighbours(h.mesh, cities[i]);
    for (var j = 0; j < nbs.length; j++) {
      queue.queue({
        score: weight(cities[i], nbs[j]),
        city: cities[i],
        vx: nbs[j]
      });
    }
  }
  while (queue.length) {
    var u = queue.dequeue();
    if (terr[u.vx] != undefined) continue;
    terr[u.vx] = u.city;
    var nbs = neighbours(h.mesh, u.vx);
    for (var i = 0; i < nbs.length; i++) {
      var v = nbs[i];
      if (terr[v] != undefined) continue;
      var newdist = weight(u.vx, v);
      queue.queue({
        score: u.score + newdist,
        city: u.city,
        vx: v
      });
    }
  }
  terr.mesh = h.mesh;
  return terr;
}

function getBorders(render) {
  var terr = render.terr;
  var h = render.h;
  var edges = [];
  for (var i = 0; i < terr.mesh.edges.length; i++) {
    var e = terr.mesh.edges[i];
    if (e[3] == undefined) continue;
    if (isnearedge(terr.mesh, e[0]) || isnearedge(terr.mesh, e[1])) continue;
    if (h[e[0]] < 0 || h[e[1]] < 0) continue;
    if (terr[e[0]] != terr[e[1]]) {
      edges.push([e[2], e[3]]);
    }
  }
  return mergeSegments(edges).map(relaxPath);
}

function relaxPath(path) {
  var newpath = [path[0]];
  for (var i = 1; i < path.length - 1; i++) {
    var newpt = [0.25 * path[i - 1][0] + 0.5 * path[i][0] + 0.25 * path[i + 1][0],
      0.25 * path[i - 1][1] + 0.5 * path[i][1] + 0.25 * path[i + 1][1]
    ];
    newpath.push(newpt);
  }
  newpath.push(path[path.length - 1]);
  return newpath;
}

function visualizeDownhill(h) {
  var links = getRivers(h, 0.01);
  drawPaths('river', links);
}

function visualizeBorders(h, cities, n) {
  var links = getBorders(h, getTerritories(h, cities, n));
  drawPaths('border', links);
}

function visualizeCities(svg, render) {
  var cities = render.cities;
  var h = render.h;
  var n = render.params.nterrs;
  var circs = svg.selectAll('circle.city').data(cities);
  circs.enter()
    .append('circle')
    .classed('city', true);
  circs.exit()
    .remove();
  svg.selectAll('circle.city')
    .attr('cx', function(d) {
      return 1000 * h.mesh.vxs[d][0]
    })
    .attr('cy', function(d) {
      return 1000 * h.mesh.vxs[d][1]
    })
    .attr('r', function(d, i) {
      return i >= n ? 4 : 10
    })
    .style('fill', 'white')
    .style('stroke-width', 5)
    .style('stroke-linecap', 'round')
    .style('stroke', 'black')
    .raise();
}

function dropEdge(h, p) {
  p = p || 4
  var newh = zero(h.mesh);
  for (var i = 0; i < h.length; i++) {
    var v = h.mesh.vxs[i];
    var x = 2.4 * v[0] / h.mesh.extent.width;
    var y = 2.4 * v[1] / h.mesh.extent.height;
    newh[i] = h[i] - Math.exp(10 * (Math.pow(Math.pow(x, p) + Math.pow(y, p), 1 / p) - 1));
  }
  return newh;
}

function generateCoast(params) {
  var mesh = generateGoodMesh(params.npts, params.extent);
  var h = add(
    slope(mesh, randomVector(4)),
    cone(mesh, runif(-1, -1)),
    mountains(mesh, 50)
  );
  for (var i = 0; i < 10; i++) {
    h = relax(h);
  }
  h = peaky(h);
  h = doErosion(h, runif(0, 0.1), 5);
  h = setSeaLevel(h, runif(0.2, 0.6));
  h = fillSinks(h);
  h = cleanCoast(h, 3);
  return h;
}

function terrCenter(h, terr, city, landOnly) {
  var x = 0;
  var y = 0;
  var n = 0;
  for (var i = 0; i < terr.length; i++) {
    if (terr[i] != city) continue;
    if (landOnly && h[i] <= 0) continue;
    x += terr.mesh.vxs[i][0];
    y += terr.mesh.vxs[i][1];
    n++;
  }
  return [x / n, y / n];
}

function drawLabels(svg, render) {
  var params = render.params;
  var h = render.h;
  var terr = render.terr;
  var cities = render.cities;
  var nterrs = render.params.nterrs;
  var avoids = [render.rivers, render.coasts, render.borders];
  var lang = makeRandomLanguage();
  var citylabels = [];

  function penalty(label) {
    var pen = 0;
    if (label.x0 < -0.45 * h.mesh.extent.width) pen += 100;
    if (label.x1 > 0.45 * h.mesh.extent.width) pen += 100;
    if (label.y0 < -0.45 * h.mesh.extent.height) pen += 100;
    if (label.y1 > 0.45 * h.mesh.extent.height) pen += 100;
    for (var i = 0; i < citylabels.length; i++) {
      var olabel = citylabels[i];
      if (label.x0 < olabel.x1 && label.x1 > olabel.x0 &&
        label.y0 < olabel.y1 && label.y1 > olabel.y0) {
        pen += 100;
      }
    }
    for (var i = 0; i < cities.length; i++) {
      var c = h.mesh.vxs[cities[i]];
      if (label.x0 < c[0] && label.x1 > c[0] && label.y0 < c[1] && label.y1 > c[1]) {
        pen += 100;
      }
    }
    for (var i = 0; i < avoids.length; i++) {
      var avoid = avoids[i];
      for (var j = 0; j < avoid.length; j++) {
        var avpath = avoid[j];
        for (var k = 0; k < avpath.length; k++) {
          var pt = avpath[k];
          if (pt[0] > label.x0 && pt[0] < label.x1 && pt[1] > label.y0 && pt[1] < label.y1) {
            pen++;
          }
        }
      }
    }
    return pen;
  }
  for (var i = 0; i < cities.length; i++) {
    var x = h.mesh.vxs[cities[i]][0];
    var y = h.mesh.vxs[cities[i]][1];
    var text = makeName(lang, 'city');
    var size = i < nterrs ? params.fontsizes.city : params.fontsizes.town;
    var sx = 0.65 * size / 1000 * text.length;
    var sy = size / 1000;
    var posslabels = [{
        x: x + 0.8 * sy,
        y: y + 0.3 * sy,
        align: 'start',
        x0: x + 0.7 * sy,
        y0: y - 0.6 * sy,
        x1: x + 0.7 * sy + sx,
        y1: y + 0.6 * sy
      },
      {
        x: x - 0.8 * sy,
        y: y + 0.3 * sy,
        align: 'end',
        x0: x - 0.9 * sy - sx,
        y0: y - 0.7 * sy,
        x1: x - 0.9 * sy,
        y1: y + 0.7 * sy
      },
      {
        x: x,
        y: y - 0.8 * sy,
        align: 'middle',
        x0: x - sx / 2,
        y0: y - 1.9 * sy,
        x1: x + sx / 2,
        y1: y - 0.7 * sy
      },
      {
        x: x,
        y: y + 1.2 * sy,
        align: 'middle',
        x0: x - sx / 2,
        y0: y + 0.1 * sy,
        x1: x + sx / 2,
        y1: y + 1.3 * sy
      }
    ];
    var label = posslabels[d3.scan(posslabels, function(a, b) {
      return penalty(a) - penalty(b)
    })];
    label.text = text;
    label.size = size;
    citylabels.push(label);
  }
  var texts = svg.selectAll('text.city').data(citylabels);
  texts.enter()
    .append('text')
    .classed('city', true);
  texts.exit()
    .remove();
  svg.selectAll('text.city')
    .attr('x', function(d) {
      return 1000 * d.x
    })
    .attr('y', function(d) {
      return 1000 * d.y
    })
    .style('font-size', function(d) {
      return d.size
    })
    .style('text-anchor', function(d) {
      return d.align
    })
    .text(function(d) {
      return d.text
    })
    .raise();
  var reglabels = [];
  for (var i = 0; i < nterrs; i++) {
    var city = cities[i];
    var text = makeName(lang, 'region');
    var sy = params.fontsizes.region / 1000;
    var sx = 0.6 * text.length * sy;
    var lc = terrCenter(h, terr, city, true);
    var oc = terrCenter(h, terr, city, false);
    var best = 0;
    var bestscore = -999999;
    for (var j = 0; j < h.length; j++) {
      var score = 0;
      var v = h.mesh.vxs[j];
      score -= 3000 * Math.sqrt((v[0] - lc[0]) * (v[0] - lc[0]) + (v[1] - lc[1]) * (v[1] - lc[1]));
      score -= 1000 * Math.sqrt((v[0] - oc[0]) * (v[0] - oc[0]) + (v[1] - oc[1]) * (v[1] - oc[1]));
      if (terr[j] != city) score -= 3000;
      for (var k = 0; k < cities.length; k++) {
        var u = h.mesh.vxs[cities[k]];
        if (Math.abs(v[0] - u[0]) < sx &&
          Math.abs(v[1] - sy / 2 - u[1]) < sy) {
          score -= k < nterrs ? 4000 : 500;
        }
        if (v[0] - sx / 2 < citylabels[k].x1 &&
          v[0] + sx / 2 > citylabels[k].x0 &&
          v[1] - sy < citylabels[k].y1 &&
          v[1] > citylabels[k].y0) {
          score -= 5000;
        }
      }
      for (var k = 0; k < reglabels.length; k++) {
        var label = reglabels[k];
        if (v[0] - sx / 2 < label.x + label.width / 2 &&
          v[0] + sx / 2 > label.x - label.width / 2 &&
          v[1] - sy < label.y &&
          v[1] > label.y - label.size) {
          score -= 20000;
        }
      }
      if (h[j] <= 0) score -= 500;
      if (v[0] + sx / 2 > 0.5 * h.mesh.extent.width) score -= 50000;
      if (v[0] - sx / 2 < -0.5 * h.mesh.extent.width) score -= 50000;
      if (v[1] > 0.5 * h.mesh.extent.height) score -= 50000;
      if (v[1] - sy < -0.5 * h.mesh.extent.height) score -= 50000;
      if (score > bestscore) {
        bestscore = score;
        best = j;
      }
    }
    reglabels.push({
      text: text,
      x: h.mesh.vxs[best][0],
      y: h.mesh.vxs[best][1],
      size: sy,
      width: sx
    });
  }
  texts = svg.selectAll('text.region').data(reglabels);
  texts.enter()
    .append('text')
    .classed('region', true);
  texts.exit()
    .remove();
  svg.selectAll('text.region')
    .attr('x', function(d) {
      return 1000 * d.x
    })
    .attr('y', function(d) {
      return 1000 * d.y
    })
    .style('font-size', function(d) {
      return 1000 * d.size
    })
    .style('text-anchor', 'middle')
    .text(function(d) {
      return d.text
    })
    .raise();
}

function drawMap(svg, render) {
  render.rivers = getRivers(render.h, 0.01);
  render.coasts = contour(render.h, 0);
  render.terr = getTerritories(render);
  render.borders = getBorders(render);
  drawPaths(svg, 'river', render.rivers);
  drawPaths(svg, 'coast', render.coasts);
  drawPaths(svg, 'border', render.borders);
  visualizeSlopes(svg, render);
  visualizeCities(svg, render);
  drawLabels(svg, render);
}

function doMap(svg, params) {
  var render = {
    params: params
  };
  var width = svg.attr('width');
  svg.attr('height', width * params.extent.height / params.extent.width);
  svg.attr('viewBox', -1000 * params.extent.width / 2 + ' ' +
    -1000 * params.extent.height / 2 + ' ' +
    1000 * params.extent.width + ' ' +
    1000 * params.extent.height);
  svg.selectAll().remove();
  render.h = params.generator(params);
  placeCities(render);
  drawMap(svg, render);
}