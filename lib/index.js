var net = require('net');
var events = require('events');
var zmq = require('zeromq');

require('./algoProperties.js');
var pool = require('./pool.js');

exports.daemon = require('./daemon.js');
exports.varDiff = require('./varDiff.js');

// validate args
if(process.argv.length < 3) {
    console.log("Error: Config file argument required. Good bye ..");
    process.exit(1);
}

var createPool = function (poolOptions, authorizeFn) {
    var newPool = new pool(poolOptions, authorizeFn);
    return newPool;
};

// load config
var config = require(process.argv[2]);

// create pool
var pool = createPool(config, function (ip, port, workerName, password, callback) { //stratum authorization function
    console.log("Authorize " + workerName + ":" + password + "@" + ip);

    var minerWorker = workerName.split(".");
    var miner = minerWorker[0].trim();
    var worker = minerWorker.length > 1 ? minerWorker[1].trim() : "";

    pool.daemon.cmd('validateaddress', [miner], function (results) {
        var authResult = {};

        authResult.authorized = results.filter(function (r) {
            return r.response.isvalid
        }).length > 0;

        authResult.disconnect = !authResult.authorized;

        callback(authResult);
    });
});

pool.on('log', function (severity, logText) {
    console.log(severity + ': ' + logText);
});

// connect to publisher socket
var sock = zmq.socket('pub');
sock.connect(config.publisherSocket);
pool.emitInfoLog('Connected to ZMQ socket ' + config.publisherSocket);

// monitor shares
pool.on('share', function (isValidShare, isValidBlock, data) {
    if (isValidBlock)
        pool.emitInfoLog('Pool ' + config.publisherTopic + ' found block ' + data.height);
    // else if (isValidShare)
    //     pool.emitInfoLog('Valid share submitted');
    else if (data.blockHash)
        pool.emitInfoLog('We thought a block was found but it was rejected by the daemon');
    else if(!isValidShare)
        pool.emitInfoLog('Invalid share submitted')

    if(isValidShare) {
        var minerWorker = data.worker.split(".");

        // sanitize inputs
        var miner = minerWorker[0].trim();
        var worker = minerWorker.length > 1 ? minerWorker[1].trim() : "";

        // transform it
        var share = {
            difficulty: data.difficulty,
            networkDifficulty: data.blockDiff,
            blockHeight: data.height,
            blockReward: data.blockReward / 100000000,
            miner: miner,
            worker: worker,
            ipAddress: data.ip,
            isBlockCandidate: isValidBlock,
            blockHex: data.blockHex,
            blockHash: data.blockHash,
            transactionConfirmationData: data.txHash,
            userAgent: '',
            payoutInfo: '' // monero only
        };

        // publish
        sock.send([config.publisherTopic, JSON.stringify(share)]);
    }
});

pool.start();
