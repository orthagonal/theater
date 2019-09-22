module.exports = {
  title: 'switcher',
  description: 'manages switching between videos',
  vertexShader: '',
  fragmentShader: '',
  properties: {
    u_resolution: {
      type: 'uniform',
      value: [0.0, 0.0]
    },
    u_activeChannel: {
      type: 'uniform',
      value: 0.0 // videos 0.0 and 1.0, branch video is 2.0
    }
  },
  inputs: ['u_video0', 'u_video1', 'u_branchVideo']
};
