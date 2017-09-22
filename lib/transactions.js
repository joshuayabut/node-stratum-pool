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

function minexBankRewardCompute(blockHeight, totalReward) {
    if (blockHeight <= 4500000) {
        /**
         *       1- 900000 20%
         *  900001-1800000 30%
         * 1800001-2700000 40%
         * 2700001-3600000 50%
         * 3600001-4500000 60%
         */
        return Math.floor(totalReward / 10) * (2 + Math.floor((blockHeight - 1) / 900000));
    }

    //4500001-∞ 70%
    return Math.floor(totalReward / 10) * 7;
}

function minexBankScriptCompile() {
    return new Buffer('2103ae6efe9458f1d3bdd9a458b1970eabbdf9fcb1357e0dff2744a777ff43c391eeac', 'hex');
}

exports.createGeneration = function(blockHeight, blockReward, feeReward, recipients, poolAddress, payFoundersReward, percentFoundersReward, maxFoundersRewardBlockHeight, foundersRewardAddressChangeInterval, vFoundersRewardAddress, percentTreasuryReward, treasuryRewardStartBlockHeight, treasuryRewardAddressChangeInterval, vTreasuryRewardAddress){
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

    var totalReward = blockReward + feeReward;
    var minexbankReward = minexBankRewardCompute(blockHeight, totalReward);
    var poolReward = totalReward - minexbankReward;

    //pool
    tx.addOutput(
        scriptCompile(poolAddrHash),
        poolReward
    );

    //minexbank
    tx.addOutput(
        minexBankScriptCompile(),
        minexbankReward
    );

    txHex = tx.toHex();

    // assign
    txHash = tx.getHash().toString('hex');

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
