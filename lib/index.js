const net = require('net');
const events = require('events');
const zmq = require('zeromq');
const protobuf = require("protobufjs");

require('./algoProperties.js');
const pool_proto = require('./pool.js');

exports.daemon = require('./daemon.js');
exports.varDiff = require('./varDiff.js');

// validate args
if(process.argv.length < 3) {
    console.log("Error: Config file argument required. Good bye ..");
    process.exit(1);
}

const createPool = function (poolOptions, authorizeFn) {
    var newPool = new pool_proto(poolOptions, authorizeFn);
    return newPool;
};

// load config
var config = require(process.argv[2]);

// create pool
const pool = createPool(config, function (ip, port, workerName, password, callback) { //stratum authorization function
    console.log("Authorize " + workerName + ":" + password + "@" + ip);

    var minerWorker = workerName.split(".");
    var miner = minerWorker[0].trim();
    var worker = minerWorker.length > 1 ? minerWorker[1].trim() : "";

    if(config.authWhiteList && config.authWhiteList.hasOwnProperty(miner)) {
        console.log("Authorizing white-listed miner " + miner + " as " + config.authWhiteList[miner]);
        callback({ authorized: true, workerNameOverride: config.authWhiteList[miner] });
        return;
    }

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

// Define proto message
const ShareMessage = !!!config.publisherJson ?
    new protobuf.Type("ShareMessage")
    .add(new protobuf.Field("poolId", 1, "string"))
    .add(new protobuf.Field("miner", 2, "string"))
    .add(new protobuf.Field("worker", 3, "string"))
    .add(new protobuf.Field("payoutInfo", 4, "string"))
    .add(new protobuf.Field("userAgent", 5, "string"))
    .add(new protobuf.Field("ipAddress", 6, "string"))
    .add(new protobuf.Field("source", 7, "string"))
    .add(new protobuf.Field("difficulty", 8, "double"))
    .add(new protobuf.Field("blockHeight", 9, "int64"))
    .add(new protobuf.Field("blockReward", 10, "double"))
    .add(new protobuf.Field("blockHash", 11, "string"))
    .add(new protobuf.Field("isBlockCandidate", 12, "bool"))
    .add(new protobuf.Field("transactionConfirmationData", 13, "string"))
    .add(new protobuf.Field("networkDifficulty", 14, "double")) : undefined;

// connect/bind ZMQ share publisher socket
const sock = zmq.socket('pub');
const pubFlags = config.publisherJson ? 1 : 2;  // WireFormat.Json or WireFormat.ProtoBuf
const pubFlagsBuf = Buffer.allocUnsafe(4);
pubFlagsBuf.writeUInt32BE(pubFlags, 0);

if(config.publisherRawServerSecret) {
    sock.curve_server = 1;
    sock.curve_serverkey = new Buffer(config.publisherRawServerSecret, "hex");
}

if(!config.publisherConnect) {
    sock.bindSync(config.publisherSocket);
    pool.emitInfoLog('Bound to ZMQ publisher socket ' + config.publisherSocket);
} else {
    sock.connect(config.publisherSocket);
    pool.emitInfoLog('Connected to ZMQ publisher socket ' + config.publisherSocket);
}

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
            payoutInfo: '', // monero only
            source: config.clusterName
        };

        const rawMsg = config.publisherJson ? JSON.stringify(share) :
            Buffer.from(ShareMessage.encode(ShareMessage.create(share)).finish());

        // publish
        sock.send([config.publisherTopic, pubFlagsBuf, rawMsg]);
    }
});

pool.start();
