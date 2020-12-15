const fs = require('fs');
const rootDir = `./modules/IrisOne/js/scenegraphs/`;

const generateVideoPlaceholders = (path) => {
  const dir = fs.readdirSync(path);
  // loop over all videos in the scenegraph
  const allObjs = [];
  dir.forEach(f => {
    if (f.endsWith('.webm')) {
      allObjs.push({
        title: `path.resolve(path.join(__dirname, '${process.argv[2]}', '${f}'`,
        description: '',
        hasMask: false
      });
    }
  });
  console.log(allObjs);
};

generateVideoPlaceholders(`${rootDir}/${process.argv[2]}`);
