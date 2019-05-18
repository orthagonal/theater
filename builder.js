const browserify = require('browserify');
const watchify = require('watchify');
const browserify_shader = require('browserify-shader');
const fs = require('fs');
var b = browserify({
  entries: ['./js/onLoad.js'],
  cache: {},
  packageCache: {},
  transform: [browserify_shader],
  plugin: [watchify],
  standalone: 'iris'
});

b.on('update', bundle);
bundle();

function bundle() {
  b.bundle()
    .on('error', console.error)
    .pipe(fs.createWriteStream('windowBundle.js'))
  ;
}