// 'use strict';
// const chai = require('chai');
// const fs = require('fs');
// let Server;
//
// beforeEach( (done) => {
//   Server = require('../lib/nwserver.js');
//   done();
// });
//
// after( (done) => {
//   fs.unlinkSync('./saves.json');
//   done();
// });
//
// describe('NW Server', function()  {
//   this.timeout(5000);
//   it('should be able to start a new game with the correct junction', (done) => {
//     Server.startNewGame('tempUser', (runningGameState) => {
//       chai.expect(runningGameState).to.be.a('object');
//       chai.expect(runningGameState.score).to.equal(0);
//       chai.expect(runningGameState.inventory.length).to.equal(0);
//       // need to update to have 'startTime' variable
//       chai.expect(runningGameState.gameVariables.length).to.equal(0);
//       chai.expect(runningGameState.junctionName).to.equal('Prologue');
//       chai.expect(typeof runningGameState.junction.roots[0].title).to.be.a('string');
//       done();
//     });
//   });
//   it('should be able to branch to the second junction', function(done) {
//     this.timeout(5000);
//     Server.startNewGame('user2', (runningGameState) => {
//       Server.query({
//         userId: 'user2',
//         query: 'playthrough'
//       }, (queryResult) => {
//         chai.expect(queryResult).to.be.a('object');
//         chai.expect(queryResult.msg).to.equal('BranchToJunction');
//         chai.expect(queryResult.result.junctionName).to.equal('Ceiling');
//         chai.expect(queryResult.result.branch).to.be.a('object');
//         done();
//       });
//     });
//   });
//   it('should be able to branch to the third junction', function(done) {
//     this.timeout(5000);
//     Server.startNewGame('user3', (runningGameState) => {
//       Server.query({
//         userId: 'user3',
//         query: 'playthrough'
//       }, (queryResult1) => {
//         Server.query({
//           userId: 'user3',
//           query: 'playthrough'
//         }, (queryResult2) => {
//           chai.expect(queryResult2).to.be.a('object');
//           chai.expect(queryResult2.msg).to.equal('BranchToJunction');
//           chai.expect(queryResult2.result.userId).to.equal('user3');
//           chai.expect(queryResult2.result.junctionName).to.equal('LeftAndRight');
//           chai.expect(queryResult2.result.branch).to.be.a('object');
//           chai.expect(queryResult2.result.branch.title).to.be.a('string');
//           chai.expect(queryResult2.result.junction).to.be.a('object');
//           chai.expect(queryResult2.result.junction.roots[0].title).to.be.a('string');
//           chai.expect(queryResult2.result.junction.loops[0].title).to.be.a('string');
//           done();
//         });
//       });
//     });
//   });
// });
