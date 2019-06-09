precision mediump float;
// the texCoords passed in from the vertex shader.
varying vec2 v_texCoord;
uniform vec2 u_resolution; // incoming resolution
uniform sampler2D u_mainVideo; // incoming video
uniform sampler2D u_hitboxVideo; // hitbox/mask video
uniform sampler2D u_textTexture; // text (font) texture
// partial textures:
uniform sampler2D u_partialTexture0; // partial texture
uniform sampler2D u_partialTexture1; // partial texture
uniform sampler2D u_partialTexture2; // partial texture
uniform sampler2D u_partialTexture3; // partial texture
uniform sampler2D u_partialTexture4; // partial texture

uniform int u_showPartial0;
uniform int u_showPartial1;
uniform int u_showPartial2;
uniform int u_showPartial3;
uniform int u_showPartial4;
uniform int u_showPartial5;

uniform sampler2D u_inputTexture0; // input texture
uniform sampler2D u_inputTexture1; // input texture
uniform sampler2D u_inputTexture2; // input texture

uniform int u_showMain; // 1.0 when rendering the main video frame
uniform int u_showText; // 1.0 to show current text and 0.0 to hide it
uniform vec4 u_alpha; // what channel to use as alpha
uniform float u_isPartial;
uniform float u_showInput0;
uniform float u_showInput1;
uniform float u_showInput2;

uniform float u_debugMode; // 1.0 if using debug mode
uniform float u_activeEffect; // index of the current effect
uniform float u_videoDuration; // time current video will end (used by effects)
uniform float u_currentTime; // current time
uniform vec2 u_mouse; // mouse
uniform float u_percentDone; // screw it

//////////////////////////
// flare effect stuff:
//////////////////////////
vec3 lensflare(vec2 uv, vec2 pos) {
	vec2 main = uv-pos;
	vec2 uvd = uv*(length(uv));

	float ang = atan(main.y, main.x);
	float dist = length(main);
  dist = pow(dist,.1);

	float f0 = 1.0/(length(uv-pos)*16.0+1.0);

	float f2 = max(1.0/(1.0+32.0*pow(length(uvd+0.8*pos),2.0)),.0)*00.25;
	float f22 = max(1.0/(1.0+32.0*pow(length(uvd+0.85*pos),2.0)),.0)*00.23;
	float f23 = max(1.0/(1.0+32.0*pow(length(uvd+0.9*pos),2.0)),.0)*00.21;

	vec2 uvx = mix(uv,uvd,-0.5);

	float f4 = max(0.01-pow(length(uvx+0.4*pos),2.4),.0)*6.0;
	float f42 = max(0.01-pow(length(uvx+0.45*pos),2.4),.0)*5.0;
	float f43 = max(0.01-pow(length(uvx+0.5*pos),2.4),.0)*3.0;

	uvx = mix(uv,uvd,-.4);

	float f5 = max(0.01-pow(length(uvx+0.2*pos),5.5),.0)*2.0;
	float f52 = max(0.01-pow(length(uvx+0.4*pos),5.5),.0)*2.0;
	float f53 = max(0.01-pow(length(uvx+0.6*pos),5.5),.0)*2.0;
	uvx = mix(uv,uvd,-0.5);
	float f6 = max(0.01-pow(length(uvx-0.3*pos),1.6),.0)*6.0;
	float f62 = max(0.01-pow(length(uvx-0.325*pos),1.6),.0)*3.0;
	float f63 = max(0.01-pow(length(uvx-0.35*pos),1.6),.0)*5.0;
	vec3 c = vec3(.0);
	c.r+=f2+f4+f5+f6; c.g+=f22+f42+f52+f62; c.b+=f23+f43+f53+f63;
	c+=vec3(f0);
	return c;
}

vec3 cc(vec3 color, float factor,float factor2) {
	float w = color.x+color.y+color.z;
	return mix(color,vec3(w)*factor,w*factor2);
}

vec4 flareEffect(vec2 fragCoord ) {
	vec2 uv = fragCoord.xy / u_resolution.xy;
	// uv.x *= u_resolution.x / u_resolution.y;
	vec3 mouse = vec3(u_mouse.xy / u_resolution.xy, .5);
  mouse.y = 1.0 - mouse.y;
  // mouse.x -= .2;
	// mouse.x *= u_resolution.x / u_resolution.y;
	// mouse.x=sin(u_currentTime)*.5;
	// mouse.y=sin(u_currentTime*.913)*.5;
	vec3 color = vec3(1.4, 1.2, 1.0) * lensflare(uv, mouse.xy);
	color = cc(color, .5, .1);
	return vec4(color, 1.0);
}

////////////////////////////
// B&W effect
////////////////////////////
void bwSubtraction(vec2 mouse, vec2 fragCoord) {
  float dist = distance(mouse, fragCoord);
	if (dist > .25) {
		return;
	}
  float factor = .02;// * u_percentDone;
  // if (u_percentDone > .5) {
  //   factor = factor - (u_percentDone - .5);
  // }
  float val = smoothstep(factor, .1, dist);
	gl_FragColor -= vec4(val, val, val, 0.0);
}

vec4 blurRadius(vec2 mouse, vec2 fragCoord, vec2 dir) {
	float dist = distance(mouse, fragCoord);
	float radius = u_percentDone * .25;
	if (u_percentDone > .5) {
		radius = .25 - radius;
	}
	if (dist > radius) {
		return vec4(0.0, 0.0, 0.0, 0.0);
	}
	vec4 sum = vec4(0.0, 0.0, 0.0, 0.0);
	float blur = dist * u_percentDone;

	//the direction of our blur
	//(1.0, 0.0) -> x-axis blur
	//(0.0, 1.0) -> y-axis blur
	float hstep = dir.x;
	float vstep = dir.y;

	//apply blurring, using a 9-tap filter with predefined gaussian weights

	sum += texture2D(u_mainVideo, vec2(fragCoord.x - 4.0*blur*hstep, fragCoord.y - 4.0*blur*vstep)) * 0.0162162162;
	sum += texture2D(u_mainVideo, vec2(fragCoord.x - 3.0*blur*hstep, fragCoord.y - 3.0*blur*vstep)) * 0.0540540541;
	sum += texture2D(u_mainVideo, vec2(fragCoord.x - 2.0*blur*hstep, fragCoord.y - 2.0*blur*vstep)) * 0.1216216216;
	sum += texture2D(u_mainVideo, vec2(fragCoord.x - 1.0*blur*hstep, fragCoord.y - 1.0*blur*vstep)) * 0.1945945946;

	sum += texture2D(u_mainVideo, vec2(fragCoord.x, fragCoord.y)) * 0.2270270270;

	sum += texture2D(u_mainVideo, vec2(fragCoord.x + 1.0*blur*hstep, fragCoord.y + 1.0*blur*vstep)) * 0.1945945946;
	sum += texture2D(u_mainVideo, vec2(fragCoord.x + 2.0*blur*hstep, fragCoord.y + 2.0*blur*vstep)) * 0.1216216216;
	sum += texture2D(u_mainVideo, vec2(fragCoord.x + 3.0*blur*hstep, fragCoord.y + 3.0*blur*vstep)) * 0.0540540541;
	sum += texture2D(u_mainVideo, vec2(fragCoord.x + 4.0*blur*hstep, fragCoord.y + 4.0*blur*vstep)) * 0.0162162162;

	return gl_FragColor * vec4(sum.rgb, 1.0);
}

float hash( float n ){
    return fract(sin(n)*43758.5453);
}

float noise( vec2 uv ) {
  vec3 x = vec3(uv, 0);

  vec3 p = floor(x);
  vec3 f = fract(x);

  f       = f*f*(3.0-2.0*f);
  float n = p.x + p.y*57.0 + 113.0*p.z;

  return mix(mix(mix( hash(n+0.0), hash(n+1.0),f.x),
                 mix( hash(n+57.0), hash(n+58.0),f.x),f.y),
             mix(mix( hash(n+113.0), hash(n+114.0),f.x),
                 mix( hash(n+170.0), hash(n+171.0),f.x),f.y),f.z);
}

mat2 m = mat2(0.8,0.6,-0.6,0.8);

float fbm(vec2 p) {
  float f = 0.0;
  f += 0.9000*noise( p ); p*=m*2.02;
  f += 0.2500*noise( p ); p*=m*2.03;
  f += 0.1250*noise( p ); p*=m*2.01;
  f += 0.0625*noise( p );
  f /= 0.9375;
  return f * 2.0;
}

void ripple(vec2 mouse, vec2 fragCoord) {
	float dist = distance(mouse, fragCoord);
	// todo: make it irregular:
	float radius = u_percentDone * .25;
	if (u_percentDone > .5) {
		radius = .25 - radius;
	}
	if (dist < radius + (fbm(fragCoord) * .005)) {
		vec2 tc = mouse.xy;
		vec2 cPos = -1.0 + 2.0 * mouse.xy;
		vec2 uv = mouse.xy + (cPos/dist) * cos(dist*16.0-u_percentDone * 6.0)*.003;
	  vec3 col = texture2D(u_mainVideo, uv).xyz;
		vec3 hitboxPixel = texture2D(u_hitboxVideo, fragCoord).xyz;
		float threshold = .5;
		if (step(threshold, hitboxPixel.r) == 0.0) {
			// todo: apply fire stuff
			// return;
		}
		gl_FragColor = vec4(col,.50);
	}
}

// used in development:
void renderHitbox(out vec4 fragColor, vec2 normalizedCoords) {
	vec4 hitboxPixel = texture2D(u_hitboxVideo, normalizedCoords);
	float threshold = .5;
	// show hitboxes:
	if (step(threshold, hitboxPixel.r) == 0.0) {
		fragColor = mix(fragColor, hitboxPixel, .5);
	}
}

#define PI 3.14159265

	vec4 ripple2(vec2 mouse, out vec4 fragColor, in vec2 fragCoord ) {
		float basicDist = distance(mouse, fragCoord);
		float radius = u_percentDone * .25;
		if (u_percentDone > .5) {
			radius = .25 - radius;
		}
		if (basicDist < radius + (fbm(fragCoord) * .15)) {
			vec2 center = mouse;
		  vec2 coord = fragCoord;
		  vec2 centered_coord = 2.0 * fragCoord - 1.0;
		  float shutter = 0.9;
		  float texelDistance = distance(center, coord);
		  float dist = 1.41*1.41*shutter - texelDistance;
		  float ripples = 1.0- sin(texelDistance * 32.0 - 2.0 * (u_percentDone * 2.0));
		  coord -= normalize(centered_coord-center)*clamp(ripples,0.0,1.0)*0.050;
			vec4 color = texture2D(u_mainVideo, coord);
			// don't do this on the hitbox
			if (u_percentDone > .25) {
				vec2 center2 = mouse + vec2(.35, .12);
			  vec2 coord2 = fragCoord;
			  vec2 centered_coord2 = 2.0 * fragCoord - 1.0;
			  float shutter2 = 0.9;
			  float texelDistance2 = distance(center2, coord2);
			  // float dist = 1.41*1.41*shutter2 - texelDistance2;
			  float ripples2 = 1.0- sin(texelDistance2 * 32.0 - 2.0 * (u_percentDone * 3.0));
			  coord2 -= normalize(centered_coord2-center2)*clamp(ripples2,0.0,1.0)*0.010;
				vec4 color2 = texture2D(u_mainVideo, coord2);
				return mix(color, color2, .5);
			}
			return color;
		}
		return fragColor;
	}

///////////////////////
// main
///////////////////////
void main() {
  vec2 normalizedCoords = (gl_FragCoord.xy / u_resolution.xy);
  normalizedCoords.y = 1.0 - normalizedCoords.y;
  vec2 normalizedMouse = u_mouse.xy / u_resolution.xy;
	// u_mainVideo is either the main video or a partial
	// who's coordinates/dimensions have been set by the vertex shader already:
	vec4 color = texture2D(u_mainVideo, normalizedCoords);

	if (color.a > 0.5) {
		gl_FragColor = color;
	}

	// all partials should be auto-set when first entering the game object
	// game object can override if needed
	if (u_showPartial0 == 1) {
		vec4 partialColor0 = texture2D(u_partialTexture0, normalizedCoords);
		gl_FragColor.rgb = gl_FragColor.rgb + (partialColor0.a * (partialColor0.rgb - gl_FragColor.rgb));
	}
	if (u_showPartial1 == 1) {
		vec4 partialColor1 = texture2D(u_partialTexture1, normalizedCoords);
		gl_FragColor.rgb = gl_FragColor.rgb + (partialColor1.a * (partialColor1.rgb - gl_FragColor.rgb));
	}
	if (u_showPartial2 == 1) {
		vec4 partialColor2 = texture2D(u_partialTexture2, normalizedCoords);
		gl_FragColor.rgb = gl_FragColor.rgb + (partialColor2.a * (partialColor2.rgb - gl_FragColor.rgb));
	}
	if (u_showPartial3 == 1) {
		vec4 partialColor3 = texture2D(u_partialTexture3, normalizedCoords);
		gl_FragColor.rgb = gl_FragColor.rgb + (partialColor3.a * (partialColor3.rgb - gl_FragColor.rgb));
	}
	if (u_showPartial4 == 1) {
		vec4 partialColor4 = texture2D(u_partialTexture4, normalizedCoords);
		gl_FragColor.rgb = gl_FragColor.rgb + (partialColor4.a * (partialColor4.rgb - gl_FragColor.rgb));
	}

	// render hitbox:
	if (u_debugMode == 1.0) {
		renderHitbox(gl_FragColor, normalizedCoords);
	}

  // mouse hit:
  if (u_activeEffect == 1.0) {
    vec4 flare = flareEffect(gl_FragCoord.xy);
    gl_FragColor = mix(flare, gl_FragColor, u_percentDone);
  }
	// mouse miss:
  if (u_activeEffect == 2.0) {
		gl_FragColor = ripple2(normalizedMouse, gl_FragColor, normalizedCoords);
  }
	if (u_showText == 1) {
		// render over everything:
		vec4 textColor = texture2D(u_textTexture, normalizedCoords);
		if (textColor.r != 0.0) {
			gl_FragColor = vec4(gl_FragColor.r, gl_FragColor.g, fbm(normalizedCoords), 1.0);
		}
	}
}
