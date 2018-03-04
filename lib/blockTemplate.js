var bignum = require('bignum');

var merkle = require('./merkleTree.js');
var transactions = require('./transactions.js');
var util = require('./util.js');

/**
 * The BlockTemplate class holds a single job.
 * and provides several methods to validate and submit it to the daemon coin
**/
var BlockTemplate = module.exports = function BlockTemplate(jobId, diff1, rpcData, extraNoncePlaceholder, reward, recipients, poolAddress, payFoundersReward, percentFoundersReward, maxFoundersRewardBlockHeight, foundersRewardAddressChangeInterval, vFoundersRewardAddress, percentTreasuryReward, treasuryRewardStartBlockHeight, treasuryRewardAddressChangeInterval, vTreasuryRewardAddress){

    //private members
    var submits = [];

    //public members
    this.rpcData = rpcData;
    this.jobId = jobId;

    // get target info
    this.target = bignum(rpcData.target, 16);

    this.difficulty = parseFloat((diff1 / this.target.toNumber()).toFixed(9));

    // generate the fees and coinbase tx
    var blockReward = (this.rpcData.miner) * 100000000;
    if (payFoundersReward === true) {
        if (!this.rpcData.founders || this.rpcData.founders.length <= 0) {
            console.log('Error, founders reward missing for block template!');
        } else {
            blockReward = (this.rpcData.miner + this.rpcData.founders) * 100000000;
        }
    }

    var fees = [];
    rpcData.transactions.forEach(function(value) {
        fees.push(value);
    });
    this.rewardFees = transactions.getFees(fees);
    rpcData.rewardFees = this.rewardFees;

    if (typeof this.genTx === 'undefined') {
        this.genTx = transactions.createGeneration(rpcData, blockReward, this.rewardFees, recipients, poolAddress, payFoundersReward, percentFoundersReward, maxFoundersRewardBlockHeight, foundersRewardAddressChangeInterval, vFoundersRewardAddress, percentTreasuryReward, treasuryRewardStartBlockHeight, treasuryRewardAddressChangeInterval, vTreasuryRewardAddress).toString('hex');
        this.genTxHash = transactions.txHash();

        /*
        console.log('this.genTxHash: ' + transactions.txHash());
        console.log('this.merkleRoot: ' + merkle.getRoot(rpcData, this.genTxHash));
        */
    }

    // generate the merkle root
    this.prevHashReversed = util.reverseBuffer(new Buffer(rpcData.previousblockhash, 'hex')).toString('hex');
    this.merkleRoot = merkle.getRoot(rpcData, this.genTxHash);
    this.txCount = this.rpcData.transactions.length + 1; // add total txs and new coinbase
    this.merkleRootReversed = util.reverseBuffer(new Buffer(this.merkleRoot, 'hex')).toString('hex');
    // we can't do anything else until we have a submission

    //block header per https://github.com/zcash/zips/blob/master/protocol/protocol.pdf
    this.serializeHeader = function(nTime, nonce){
        var header =  new Buffer(140);
        var position = 0;

        /*
        console.log('nonce:' + nonce);
        console.log('this.rpcData.bits: ' + this.rpcData.bits);
        console.log('nTime: ' + nTime);
        console.log('this.merkleRootReversed: ' + this.merkleRoot);
        console.log('this.prevHashReversed: ' + this.prevHashReversed);
        console.log('this.rpcData.version: ' + this.rpcData.version);
        */

        header.writeUInt32LE(this.rpcData.version, position += 0, 4, 'hex');
        header.write(this.prevHashReversed, position += 4, 32, 'hex');
        header.write(this.merkleRootReversed, position += 32, 32, 'hex');
        header.write('0000000000000000000000000000000000000000000000000000000000000000', position += 32, 32, 'hex'); //hashReserved
        header.write(nTime, position += 32, 4, 'hex');
        header.write(util.reverseBuffer(new Buffer(rpcData.bits, 'hex')).toString('hex'), position += 4, 4, 'hex');
        header.write(nonce, position += 4, 32, 'hex');
        return header;
    };

    // join the header and txs together
    this.serializeBlock = function(header, soln){

        var txCount = this.txCount.toString(16);
        if (Math.abs(txCount.length % 2) == 1) {
          txCount = "0" + txCount;
        }

        if (this.txCount <= 0x7f){
            var varInt = new Buffer(txCount, 'hex');
        }
        else if (this.txCount <= 0x7fff){
            var varInt = new Buffer.concat([Buffer('FD', 'hex'), new Buffer(txCount, 'hex')]);
        }

        buf = new Buffer.concat([
            header,
            soln,
            varInt,
            new Buffer(this.genTx, 'hex')
        ]);

        if (this.rpcData.transactions.length > 0) {
            this.rpcData.transactions.forEach(function (value) {
                tmpBuf = new Buffer.concat([buf, new Buffer(value.data, 'hex')]);
                buf = tmpBuf;
            });
        }

        /*
        console.log('header: ' + header.toString('hex'));
        console.log('soln: ' + soln.toString('hex'));
        console.log('varInt: ' + varInt.toString('hex'));
        console.log('this.genTx: ' + this.genTx);
        console.log('data: ' + value.data);
        console.log('buf_block: ' + buf.toString('hex'));
        */
        return buf;
    };

    // submit the block header
    this.registerSubmit = function(header, soln){
        var submission = header + soln;
        if (submits.indexOf(submission) === -1){

            submits.push(submission);
            return true;
        }
        return false;
    };

    // used for mining.notify
    this.getJobParams = function(){
        if (!this.jobParams){
            this.jobParams = [
                this.jobId,
                util.packUInt32LE(this.rpcData.version).toString('hex'),
                this.prevHashReversed,
                this.merkleRootReversed,
                '0000000000000000000000000000000000000000000000000000000000000000', //hashReserved
                util.packUInt32LE(rpcData.curtime).toString('hex'),
                util.reverseBuffer(new Buffer(this.rpcData.bits, 'hex')).toString('hex'),
                true
            ];
        }
        return this.jobParams;
    };
};
