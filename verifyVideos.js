const fs = require('fs');
const rootDir = `./modules/IrisOne/js/scenegraphs/`;

// load and object in sceneDescription
const traverseAndVerify = (obj) => {
  if (typeof obj === 'object') {
    Object.keys(obj).forEach(key => {
      const path = obj[key].title;
      if (path) {
        if (!fs.existsSync(path)) {
          console.log(`COULD NOT FIND ${path}!!!!!!!`);
        }
      } else if (typeof obj[key] === 'object') {
        traverseAndVerify(obj[key]);
      }
    })
  }
};

// verify each entry exists for a scenegraph
const validateVideos = () => {
  const dirs = fs.readdirSync(rootDir);
  dirs.forEach(d => {
    if (d.endsWith('.js')) {
      console.log(d);
      const obj = require(`${rootDir}${d}`);
      traverseAndVerify(obj[d.replace('.js', '')]);
    }
  });
};

validateVideos();
