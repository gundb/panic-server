/* eslint-disable require-jsdoc */
/* eslint-env mocha */
'use strict';
var Client = require('../src/Client');
var Emitter = require('events');
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

    it('should return a promise', function () {
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

  describe('platform query', function () {

    beforeEach(function () {
      client.platform = {
        name: 'Node.js',
        version: '7.1.0',
        os: { family: 'Darwin' },
      };
    });

    it('should return a boolean', function () {
      var matches = client.matches({ name: 'Node.js' });
      expect(matches).toBeA('boolean');
    });

    it('should pass if the given fields match', function () {
      var matches = client.matches({
        name: 'Node.js',
      });
      expect(matches).toBe(true);
    });

    it('should only pass if all the fields match', function () {
      var matches = client.matches({
        name: 'Node.js',
        version: 'nah',
      });

      expect(matches).toBe(false);
    });

    it('should accept regular expressions', function () {
      var matches = client.matches({
        name: /node/i,
      });
      expect(matches).toBe(true);
    });

    it('should assume regex input matches the name', function () {
      expect(client.matches(/Node/)).toBe(true);
      expect(client.matches(/Firefox/)).toBe(false);
    });

    it('should assume string input matches the name', function () {
      expect(client.matches('Node.js')).toBe(true);
      expect(client.matches('Firefox')).toBe(false);
    });

    it('should match against nested fields', function () {
      var matches;

      matches = client.matches({
        os: { family: 'Darwin' },
      });
      expect(matches).toBe(true);

      matches = client.matches({
        os: { family: 'Honestly it\'s just a box of potatoes' },
      });
      expect(matches).toBe(false);
    });

    it('should fail if the nested query is not in the platform', function () {
      var matches = client.matches({
        'super-weird~field': {
          burger: true,
          fries: 'yes please',
        },
      });
      expect(matches).toBe(false);
    });

    it('should allow nested regex matching', function () {
      var matches;

      matches = client.matches({
        os: { family: /Darwin/ },
      });
      expect(matches).toBe(true);

      matches = client.matches({
        os: { family: /why do they call these regular?/ },
      });
      expect(matches).toBe(false);
    });

    it('should fail if the properties given do not match', function () {
      var matches = client.matches({
        name: 'Some Non-Existent Platform™',
      });
      expect(matches).toBe(false);
    });

  });

});
