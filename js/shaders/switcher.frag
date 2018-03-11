// this shader just switches between the three input videos

precision mediump float;
uniform vec2 u_resolution;
uniform sampler2D u_video0;
uniform sampler2D u_video1;
uniform sampler2D u_branchVideo;
uniform float u_activeChannel;

void main() {
  vec2 normalizedCoords = (gl_FragCoord.xy / u_resolution.xy);
  normalizedCoords.y = 1.0 - normalizedCoords.y;
  if (u_activeChannel == 0.0) {
    gl_FragColor = texture2D(u_video0, normalizedCoords);
  } else if (u_activeChannel == 1.0) {
    gl_FragColor = texture2D(u_video1, normalizedCoords);
  } else if (u_activeChannel == 2.0) {
    gl_FragColor = texture2D(u_branchVideo, normalizedCoords);
  }
}
