var assert = require("assert");
var file = require('../index');
var path = require('path');

function getPath(filepath) {
  return path.join(__dirname, filepath);
}

describe('base64', function() {
  var baseStr = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAcCAMAAAA+9+1qAAAAP1BMVEUAAAAJn94Jn94Jn94Jn94Jn94Jn94Jn94Jn94Jn94Jn94Jn94Jn94Jn94Jn94Jn94Jn94Jn94Jn94Jn94Jn95q8vaOAAAAFHRSTlMAw8/cp5q2BxEDG4zwf3BbSzbmJoL/OqMAAACpSURBVDjLhdNZDoQgEEXRVpkRB6j9r7UtEgK27av60xwCyYWPNGVyogkrzVYwbiEiI5iZrjmgsRObHRpv2Gx4M8UmYhPZaGwSG+Wh2dgYC83OZsbmYLO4YdHTn2zyYBIp/8+s4XbAX1WIpwx/NDU1hL/mbJ9d6Vv4Z1SvqgLhe0cthLdVRRC+L48tfEK3KwnhbT1upUq4zWJ4t1APjxWHxypTDvJrnV7MF34yDmacQrD2AAAAAElFTkSuQmCC';
  
  it('base64', function(done) {
    file.base64('test/test.png', function(err, data) {
      assert.equal(data, baseStr);
      done();
    });
  });

  it('base64Sync', function() {
    var content = file.base64Sync('test/test.png');
    assert.equal(content, baseStr);
  });
});