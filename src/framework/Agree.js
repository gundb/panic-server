/*jslint node: true*/
'use strict';

function Agreement() {
  this.votes = {};
}

Agreement.prototype = {
  join: function (name, cb) {
    if (cb instanceof Function) {
      this.votes[name] = this.votes[name] || [];
      this.votes[name].push(cb);
    }
    return this;
  },

  all: function (name) {
    var args, unanimous, votes = this.votes[name];
    args = ([]).slice.call(arguments).slice(1);
		unanimous = true;
    (votes || []).forEach(function (vote) {
      unanimous = unanimous && !!vote.apply(null, args);
    });
    return unanimous;
  }
};

module.exports = Agreement;
