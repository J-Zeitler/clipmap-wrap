import THREE from 'three'

export default class ClipmapGeometry extends THREE.BufferGeometry {
  constructor(scale = 1, res = 8, levels = 4) {
    super();

    this.scale = scale;
    this.res = res;
    this.res1 = res + 1;
    this.levels = levels;

    this.type = 'ClipmapGeometry';

    this.tessellate();
  }

  getTile(x0, y0, scale, indexOffset, morph) {
    // positions
    var posData = [];
    var scaleData = [];
    var step = scale/this.res;
    for (var y = 0; y <= scale; y += step) {
      for (var x = 0; x <= scale; x += step) {
        var py = y0 + y;
        var ty = 2*(y/scale - 0.5);
        var px = x0 + x;
        var tx = 2*(x/scale - 0.5);

        var pMorphed = new THREE.Vector2(tx, ty).multiply(morph);
        var xMorph = pMorphed.x > 0 ? pMorphed.x : 0;
        var yMorph = pMorphed.y > 0 ? pMorphed.y : 0;

        var pxNext = x%(step*2) > 1e-10 ? px - step : px;
        var pyNext = y%(step*2) > 1e-10 ? py - step : py;

        var m = Math.max(xMorph, yMorph);
        px = (1.0 - m)*px + m*pxNext;
        py = (1.0 - m)*py + m*pyNext;
        posData.push(px); posData.push(py); posData.push(0.0);
        scaleData.push(scale);
      }
    }

    // indices
    var indexData = [];
    for (var y = 0; y < this.res; y++) {
      for (var x = 0; x < this.res; x++) {
        var self = indexOffset + (y*this.res1) + x;
        var right = self + 1;
        var down = self + this.res1;
        var rightDown = down + 1;

        // top right
        indexData.push(self); indexData.push(right); indexData.push(rightDown);
        // bottom left
        indexData.push(self); indexData.push(rightDown); indexData.push(down);
      }
    }

    return {
      posData: posData,
      indexData: indexData,
      scaleData: scaleData
    };
  }

  tessellate() {
    var lScale = this.scale/Math.pow(2, this.levels);
    var vertsPerTile = this.res1*this.res1;

    var tiles = [];

    // center
    tiles.push(this.getTile(0, 0, lScale, 0, ClipmapGeometry.MORPH.NONE));
    tiles.push(this.getTile(-lScale, 0, lScale, vertsPerTile*tiles.length, ClipmapGeometry.MORPH.NONE));
    tiles.push(this.getTile(-lScale, -lScale, lScale, vertsPerTile*tiles.length, ClipmapGeometry.MORPH.NONE));
    tiles.push(this.getTile(0, -lScale, lScale, vertsPerTile*tiles.length, ClipmapGeometry.MORPH.NONE));

    /**
     * Add clipmap "shells"
     *          -->
     *    +---+---+---+---+
     *    | L | T | T | T |
     *    +---+---+---+---+
     *    | L |   |   | R | |
     *  ^ +---+---+---+---+ v
     *  | | L |   |   | R |
     *    +---+---+---+---+
     *    | B | B | B | R |
     *    +---+---+---+---+
     *            <--
     */
    for (var scale = lScale; scale < this.scale; scale *= 2) {
      // T
      tiles.push(this.getTile(
        -scale, scale, scale, vertsPerTile*tiles.length,
        ClipmapGeometry.MORPH.TOP
      ));
      tiles.push(this.getTile(
        0, scale, scale, vertsPerTile*tiles.length,
        ClipmapGeometry.MORPH.TOP
      ));
      tiles.push(this.getTile(
        scale, scale, scale, vertsPerTile*tiles.length,
        ClipmapGeometry.MORPH.TOP.clone().add(ClipmapGeometry.MORPH.RIGHT)
      ));

      // R
      tiles.push(this.getTile(
        scale, 0, scale, vertsPerTile*tiles.length,
        ClipmapGeometry.MORPH.RIGHT
      ));
      tiles.push(this.getTile(
        scale, -scale, scale, vertsPerTile*tiles.length,
        ClipmapGeometry.MORPH.RIGHT
      ));
      tiles.push(this.getTile(
        scale, -2*scale, scale, vertsPerTile*tiles.length,
        ClipmapGeometry.MORPH.RIGHT.clone().add(ClipmapGeometry.MORPH.BOTTOM)
      ));

      // B
      tiles.push(this.getTile(
        0, -2*scale, scale, vertsPerTile*tiles.length,
        ClipmapGeometry.MORPH.BOTTOM
      ));
      tiles.push(this.getTile(
        -scale, -2*scale, scale, vertsPerTile*tiles.length,
        ClipmapGeometry.MORPH.BOTTOM
      ));
      tiles.push(this.getTile(
        -2*scale, -2*scale, scale, vertsPerTile*tiles.length,
        ClipmapGeometry.MORPH.BOTTOM.clone().add(ClipmapGeometry.MORPH.LEFT)
      ));

      // L
      tiles.push(this.getTile(
        -2*scale, -scale, scale, vertsPerTile*tiles.length,
        ClipmapGeometry.MORPH.LEFT
      ));
      tiles.push(this.getTile(
        -2*scale, 0, scale, vertsPerTile*tiles.length,
        ClipmapGeometry.MORPH.LEFT
      ));
      tiles.push(this.getTile(
        -2*scale, scale, scale, vertsPerTile*tiles.length,
        ClipmapGeometry.MORPH.LEFT.clone().add(ClipmapGeometry.MORPH.TOP)
      ));
    }

    var mergedPosData = [];
    var mergedIndexData = [];
    var mergedScaleData = [];
    tiles.forEach(t => {
      mergedPosData = mergedPosData.concat(t.posData);
      mergedIndexData = mergedIndexData.concat(t.indexData);
      mergedScaleData = mergedScaleData.concat(t.scaleData);
    });

    var positions = new Float32Array(3*vertsPerTile*tiles.length);
    positions.set(mergedPosData);

    var indices = new Uint16Array(6*vertsPerTile*tiles.length);
    indices.set(mergedIndexData);

    var scales = new Float32Array(vertsPerTile*tiles.length);
    scales.set(mergedScaleData);

    this.addAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.addAttribute('index', new THREE.BufferAttribute(indices, 1));
    this.addAttribute('scale', new THREE.BufferAttribute(scales, 1));
  }
}

ClipmapGeometry.MORPH = {
  NONE: new THREE.Vector2(0, 0),

  TOP: new THREE.Vector2(0, 1),
  RIGHT: new THREE.Vector2(1, 0),
  BOTTOM: new THREE.Vector2(0, -1),
  LEFT: new THREE.Vector2(-1, 0)
};
