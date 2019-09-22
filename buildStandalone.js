const NwBuilder = require('nw-builder');
const nw = new NwBuilder({
  files: './path/to/nwfiles/**/**', // use the glob format
  platforms: ['osx64', 'win32', 'win64'],
  version: '0.14.6'
});

// Log stuff you want
nw.on('log',  console.log);

nw.build().then(function () {
   console.log('all done!');
}).catch(function (error) {
    console.error(error);
});
