/* eslint-env mocha*/
'use strict';
var Client = require('../src/Client');
var Emitter = require('events');
var Promise = require('bluebird');
var expect = require('expect');

describe('A client', function () {
  var client, socket, platform;

  beforeEach(function () {
   socket = new Emitter();

   platform = {
     name: 'Node.js',
     version: '6.6.0',
   };

   client = new Client({
     socket: socket,
     platform: platform,
   });
  });

  it('should expose the socket', function () {
   expect(client.socket).toBe(socket);
  });

  it('should expose the platform', function () {
   expect(client.platform).toBe(platform);
  });

  it('should validate the socket', function () {
   function fail () {
     return new Client({
      // Missing "socket".
      platform: platform,
     });
   }
   expect(fail).toThrow();
  });

  it('should validate the platform', function () {
   function fail () {
     return new Client({
      socket: new Emitter(),
      // Missing "platform".
     });
   }
   expect(fail).toThrow();
  });

  describe('"run" call', function () {
   var spy;

   beforeEach(function () {
     spy = expect.createSpy();
   });

   it('should send jobs to the client', function () {
     client.socket.on('run', spy);
     client.run(function () {});
     expect(spy).toHaveBeenCalled();
   });

   it('should make sure the job is a function', function () {
     function fail () {
      client.run(9000);
     }
     expect(fail).toThrow(TypeError);
   });

   it('should send the stringified job', function () {
     client.socket.on('run', spy);
     client.run(function () {
      // I haz a comment.
     });
     var str = spy.calls[0].arguments[0];
     expect(str).toContain('I haz a comment');
   });

   it('should pass a job ID', function () {
     client.socket.on('run', spy);
     client.run(function () {});
     client.run(function () {});
     var id1 = spy.calls[0].arguments[1];
     var id2 = spy.calls[1].arguments[1];
     expect(id1).toBeA('string');
     expect(id2).toBeA('string');
     expect(id1).toNotBe(id2);
   });

   it('should send the props to the client', function () {
     client.socket.on('run', spy);
     var props = {};
     client.run(function () {}, props);
     var args = spy.calls[0].arguments;
     expect(args[2]).toBe(props);
   });

   it('should return a bluebird promise', function () {
     var job = client.run(function () {});
     expect(job).toBeA(Promise);
   });

   it('should resolve when the job does', function (done) {
     client.socket.on('run', spy);
     var job = client.run(function () {});
     var jobID = spy.calls[0].arguments[1];

     job.then(done);
     client.socket.emit(jobID, {});
   });

   it('should resolve to the job value', function () {
     client.socket.on('run', spy);
     var job = client.run(function () {});

     var jobID = spy.calls[0].arguments[1];

     client.socket.emit(jobID, {
      value: 'Hello world!',
     });

     return job.then(function (value) {
      expect(value).toBe('Hello world!');
     });
   });

   it('should reject if the job fails', function (done) {
     client.socket.on('run', spy);
     var job = client.run(function () {});
     var jobID = spy.calls[0].arguments[1];
     var error = new Error('".run" rejection test.');

     job.catch(function (err) {
      expect(err).toBe(error);
      done();
     });

     client.socket.emit(jobID, {
      error: error,
     });
   });

   it('should unsubscribe once finished', function () {
     var socket = client.socket;
     socket.on('run', spy);
     client.run(function () {});
     var jobID = spy.calls[0].arguments[1];
     expect(socket.listenerCount(jobID)).toBe(1);
     socket.emit(jobID, {});
     expect(socket.listenerCount(jobID)).toBe(0);
   });

   it('should resolve if disconnected', function (done) {
     var job = client.run(function () {});
     job.then(done);
     client.socket.emit('disconnect');
   });

  });

});
