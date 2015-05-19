uniform float spread;

attribute float scale;

varying float v_scale;
varying vec4 pos;

#define PI 3.14159265359
void main() {
  // assume position (x, y) in [(-1, -1), (1, 1)]
  pos = vec4(normalize(position), 1.0);
  float aX = pos.y*PI*spread; //*abs(sin(time*0.01));
  float aY = -pos.x*PI*spread; //*abs(sin(time*0.01));

  mat4 rotX = mat4(
         1.0,      0.0,      0.0,   0.0,
         0.0,  cos(aX), -sin(aX),   0.0,
         0.0,  sin(aX),  cos(aX),   0.0,
         0.0,      0.0,      0.0,   1.0
  );
  mat4 rotY = mat4(
     cos(aY),      0.0,  sin(aY),   0.0,
         0.0,      1.0,      0.0,   0.0,
    -sin(aY),      0.0,  cos(aY),   0.0,
         0.0,      0.0,      0.0,   1.0
  );

  pos = modelMatrix*rotY*rotX*pos;
  v_scale = scale;

  gl_Position = projectionMatrix *
                viewMatrix *
                pos;
}
