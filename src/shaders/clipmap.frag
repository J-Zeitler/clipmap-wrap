uniform sampler2D map;

varying vec4 pos;
varying float v_scale;

#define PI 3.14159265359
#define TWO_PI 6.28318530718
vec2 cartesianToPhiTheta(vec3 p) {
  p = normalize(p);

  float phi = p.z < 0.0 ? TWO_PI - atan(-p.z, -p.x) : atan(p.z, -p.x);
  return vec2(
    phi,
    acos(-p.y)
  );
}

void main() {
  gl_FragColor = texture2D(map, cartesianToPhiTheta(pos.xyz)/vec2(TWO_PI, PI));
  // gl_FragColor = vec4(sin(v_scale)*9., cos(1.0 - v_scale*2.0), sin(v_scale*999999.0) + 0.5, 1.0);
}