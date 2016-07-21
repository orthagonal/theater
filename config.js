// your config will be different:
// point your config to modules/<module name>/rootDirectory
module.exports = {
  production: {
    moviesDir: "modules/IrisOne/movies",
    mode: 'production'
  },
  dev: {
    moviesDir: "modules/IrisOne/placeholders",
    soundsDir: "modules/IrisOne",
    mode: 'dev'
  }
};
