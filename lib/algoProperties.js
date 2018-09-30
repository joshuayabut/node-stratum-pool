var ev = require('equihashverify');
var util = require('./util.js');

var diff1 = global.diff1 = 0x0007ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;

var algos = module.exports = global.algos = {
    sha256: {
        //Uncomment diff if you want to use hardcoded truncated diff
        //diff: '00000000ffff0000000000000000000000000000000000000000000000000000',
        hash: function(){
            return function(){
                return util.sha256d.apply(this, arguments);
            }
        }
    },
    'equihash48_5': {
        multiplier: 1,
        diff: parseInt('0x0007ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'),
        n: 48,
        k: 5,
        hash: function(){
            return function(){
                return ev.verify.apply(this, arguments);
            }
        }
    },
    'equihash96_3': {
        multiplier: 1,
        diff: parseInt('0x0007ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'),
        n: 96,
        k: 3,
        hash: function(){
            return function(){
                return ev.verify.apply(this, arguments);
            }
        }
    },
    'equihash96_5': {
        multiplier: 1,
        diff: parseInt('0x0007ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'),
        n: 96,
        k: 5,
        hash: function(){
            return function(){
                return ev.verify.apply(this, arguments);
            }
        }
    },
    'equihash144_5': {
        multiplier: 1,
        diff: parseInt('0x0007ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'),
        n: 144,
        k: 5,
        hash: function(){
            return function(){
                return ev.verify.apply(this, arguments);
            }
        }
    },
    'equihash192_7': {
        multiplier: 1,
        diff: parseInt('0x0007ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'),
        n: 192,
        k: 7,
        hash: function(){
            return function(){
                return ev.verify.apply(this, arguments);
            }
        }
    },
    'equihash200_9': {
        multiplier: 1,
        diff: parseInt('0x0007ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'),
        n: 200,
        k: 9,
        hash: function(){
            return function(){
                return ev.verify.apply(this, arguments);
            }
        }
    }
};

for (var algo in algos){
    if (!algos[algo].multiplier)
        algos[algo].multiplier = 1;
}
