var bitcoin = require('bitcoinjs-lib-zcash');
var util = require('./util.js');

// public members
var txHash;

exports.txHash = function(){
  return txHash;
};

function scriptCompile(addrHash){
    script = bitcoin.script.compile(
        [
            bitcoin.opcodes.OP_DUP,
            bitcoin.opcodes.OP_HASH160,
            addrHash,
            bitcoin.opcodes.OP_EQUALVERIFY,
            bitcoin.opcodes.OP_CHECKSIG
        ]);
    return script;
}

function scriptFoundersCompile(address){
    script = bitcoin.script.compile(
        [
            bitcoin.opcodes.OP_HASH160,
            address,
            bitcoin.opcodes.OP_EQUAL
        ]);
    return script;
}


exports.createGeneration = function(rpcData, blockReward, feeReward, recipients, poolAddress, payFoundersReward, percentFoundersReward, maxFoundersRewardBlockHeight, foundersRewardAddressChangeInterval, vFoundersRewardAddress, percentTreasuryReward, treasuryRewardStartBlockHeight, treasuryRewardAddressChangeInterval, vTreasuryRewardAddress){
    var blockHeight = rpcData.height;
    var poolAddrHash = bitcoin.address.fromBase58Check(poolAddress).hash;
    var tx = new bitcoin.Transaction();

    // input for coinbase tx
    if (blockHeight.toString(16).length % 2 === 0) {
        var blockHeightSerial = blockHeight.toString(16);
    } else {
        var blockHeightSerial = '0' + blockHeight.toString(16);
    }
    var height = Math.ceil((blockHeight << 1).toString(2).length / 8);
    var lengthDiff = blockHeightSerial.length/2 - height;
    for (var i = 0; i < lengthDiff; i++) {
        blockHeightSerial = blockHeightSerial + '00';
    }
    length = '0' + height;
    var serializedBlockHeight = new Buffer.concat([
        new Buffer(length, 'hex'),
        util.reverseBuffer(new Buffer(blockHeightSerial, 'hex')),
        new Buffer('00', 'hex') // OP_0
    ]);

    tx.addInput(new Buffer('0000000000000000000000000000000000000000000000000000000000000000', 'hex'),
        4294967295,
        4294967295,
        new Buffer.concat([serializedBlockHeight,
            Buffer('5a2d4e4f4d50212068747470733a2f2f6769746875622e636f6d2f6a6f7368756179616275742f7a2d6e6f6d70', 'hex')]) //Z-NOMP! https://github.com/joshuayabut/z-nomp
    );

    // calculate total fees
    var feePercent = 0;
    for (var i = 0; i < recipients.length; i++) {
        feePercent = feePercent + recipients[i].percent;
    }

    var rewardToPool = 0;

    // txs with founders reward
    if (payFoundersReward === true && (maxFoundersRewardBlockHeight >= blockHeight || treasuryRewardStartBlockHeight)) {

        // founders or treasury reward?
        if (treasuryRewardStartBlockHeight && blockHeight >= treasuryRewardStartBlockHeight) {

            // treasury reward
            var index = parseInt(Math.floor(((blockHeight - treasuryRewardStartBlockHeight) / treasuryRewardAddressChangeInterval) % vTreasuryRewardAddress.length));
            var foundersAddrHash = bitcoin.address.fromBase58Check(vTreasuryRewardAddress[index]).hash;

            //console.log("treasuryIndex: "+index);
            //console.log("treasuryAddr:  "+vTreasuryRewardAddress[index]);

            // pool t-addr
            rewardToPool = Math.round(blockReward * (1 - (percentTreasuryReward + feePercent) / 100)) + feeReward;

            tx.addOutput(
                scriptCompile(poolAddrHash),
                rewardToPool
            );
            // treasury t-addr
            tx.addOutput(
                scriptFoundersCompile(foundersAddrHash),
                Math.round(blockReward * (percentTreasuryReward / 100))
            );

        } else {

            // founders reward
            var index = parseInt(Math.floor(blockHeight / foundersRewardAddressChangeInterval));
            var foundersAddrHash = bitcoin.address.fromBase58Check(vFoundersRewardAddress[index]).hash;

            //console.log("foundersIndex: "+index);
            //console.log("foundersAddr:  "+vFoundersRewardAddress[index]);

            // pool t-addr
            rewardToPool = Math.round(blockReward * (1 - (percentFoundersReward + feePercent) / 100)) + feeReward;

            tx.addOutput(
                scriptCompile(poolAddrHash),
                rewardToPool
            );
            // founders t-addr
            tx.addOutput(
                scriptFoundersCompile(foundersAddrHash),
                Math.round(blockReward * (percentFoundersReward / 100))
            );
        }
    }
    // no founders rewards :)
    else
    {
        // pool t-addr
        rewardToPool = Math.round(blockReward * (1 - (feePercent / 100))) + feeReward;

        tx.addOutput(
            scriptCompile(poolAddrHash),
            rewardToPool
        );
    }

    // pool fee recipients t-addr
    for (var i = 0; i < recipients.length; i++) {
       tx.addOutput(
           scriptCompile(bitcoin.address.fromBase58Check(recipients[i].address).hash),
           Math.round(blockReward * (recipients[i].percent / 100))
       );
    }

    txHex = tx.toHex();

    // assign
    txHash = tx.getHash().toString('hex');
    rpcData.rewardToPool = rewardToPool;

    /*
    console.log('txHex: ' + txHex.toString('hex'));
    console.log('txHash: ' + txHash);
    */

    return txHex;
};

module.exports.getFees = function(feeArray){
    var fee = Number();
    feeArray.forEach(function(value) {
        fee = fee + Number(value.fee);
    });
    return fee;
};
