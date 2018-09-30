High performance Stratum poolserver for equihash in Node.js. One instance of this software can startup and manage multiple coin
pools, each with their own daemon and stratum port :)

#### Notice
This is a module for Node.js that will do nothing on its own. Unless you're a Node.js developer who would like to
handle stratum authentication and raw share data then this module will not be of use to you. For a full featured portal
that uses this module, see [Z-NOMP (Z Node Open Mining Portal)](https://github.com/z-classic/z-nomp). It
handles payments, website front-end, database layer, mutli-coin/pool support, auto-switching miners between coins/pools,
etc.. The portal also has an [MPOS](https://github.com/MPOS/php-mpos) compatibility mode so that the it can function as
a drop-in-replacement for [python-stratum-mining](https://github.com/Crypto-Expert/stratum-mining).


[![Build Status](https://travis-ci.org/zone117x/node-stratum-pool.png?branch=master)](https://travis-ci.org/zone117x/node-stratum-pool)

[![NPM](https://nodei.co/npm/stratum-pool.png?downloads=true&stars=true)](https://nodei.co/npm/stratum-pool/)

#### Why
This server was built to be more efficient and easier to setup, maintain and scale than existing stratum poolservers
which are written in python. Compared to the spaghetti state of the latest
[stratum-mining python server](https://github.com/Crypto-Expert/stratum-mining/), this software should also have a
lower barrier to entry for other developers to fork and add features or fix bugs.


Features
----------------------------------
* Daemon RPC interface
* Stratum TCP socket server
* Block template / job manager
* P2P to get block notifications as peer node
* Optimized generation transaction building
* Connecting to multiple daemons for redundancy
* Process share submissions
* Session managing for purging DDoS/flood initiated zombie workers
* Auto ban IPs that are flooding with invalid shares
* __POW__ (proof-of-work) & __POS__ (proof-of-stake) support
* Transaction messages support
* Vardiff (variable difficulty / share limiter)
* When started with a coin deamon that hasn't finished syncing to the network it shows the blockchain download progress and initializes once synced

#### Hashing algorithms supported:
* ✓ __Equihash48_5__
* ✓ __Equihash96_3__
* ✓ __Equihash96_5__
* ✓ __Equihash144_5__
* ✓ __Equihash192_7__
* ✓ __Equihash200_9__


Requirements
------------
* node v7+
* coin daemon (preferably one with a relatively updated API and not some crapcoin :p)


Example Usage
-------------

#### Install as a node module by cloning repository

```bash
git clone https://github.com/z-classic/node-stratum-pool node_modules/stratum-pool
npm update
```

#### Module usage

Create the configuration for your coin:

Possible options for `algorithm`: *equihash48_5, equihash96_3, equihash96_5, Equihash144_5, equihash192_7, equihash200_9*.

```javascript
var myCoin = {
    "name": "Dogecoin",
    "symbol": "DOGE",
    "algorithm": "scrypt",
    "nValue": 1024, //optional - defaults to 1024
    "rValue": 1, //optional - defaults to 1
    "txMessages": false, //optional - defaults to false,

    /* Magic value only required for setting up p2p block notifications. It is found in the daemon
       source code as the pchMessageStart variable.
       For example, litecoin mainnet magic: http://git.io/Bi8YFw
       And for litecoin testnet magic: http://git.io/NXBYJA */
     "peerMagic": "fbc0b6db" //optional
     "peerMagicTestnet": "fcc1b7dc" //optional
};
```

If you are an equihash (n=200, k=9) coin that doesn't have any founder's rewards,

```javascript
var myCoin = {
    "name": "Zclassic",
    "symbol": "ZCL",
    "algorithm": "equihash200_9",
};
```

If you are using an equihash (n=200, k=9) coin that has founder's rewards, you need to include details about the FR system,
```javascript
var myCoin = {
    "name": "zcash_testnet",
    "symbol": "taz",
    "algorithm": "equihash200_9",

    "payFoundersReward": true,
    "percentFoundersReward": 20,
    "maxFoundersRewardBlockHeight": 849999,
    "foundersRewardAddressChangeInterval": 17709.3125,
	"vFoundersRewardAddress": [
		"t2UNzUUx8mWBCRYPRezvA363EYXyEpHokyi",
		"t2N9PH9Wk9xjqYg9iin1Ua3aekJqfAtE543",
		"t2NGQjYMQhFndDHguvUw4wZdNdsssA6K7x2",
		"t27ktmq1kbeCWiQ5TZ7w5npSzcdbBmTB7v6",
		"t2GcBttAKD2WTHka8HyGc2dfvVTKYZUfHmJ",
		"t2Q3vxWaD9LrdqUE8Xd9Ddjpr9pUQ2aGotK",
		"t2TTfWDsYu998fHWzVP9Gns4fgxXXRi1Wzu",
		"t2KS6R4MMWdSBMjLCiw2iMyhWGRQPmyRqDn",
		"t2Q2ELrgotWv3Eec6LEtMMiiQ8dtW38u8Tj",
		"t2AEgJA88vTWAKqxJDFUEJWyHUtQAZi5G1D",
		"t2HCSdmpq1TQKksuwPQevwAzPTgfJ2rkMbG",
		"t2HQCPFAUQaUdJWHPhg5pPBxit7inaJzubE",
		"t2Fzqvq8Y9e6Mn3JNPb982aYsLmq4b5HmhH",
		"t2HEz7YZQqDUgC5h4y2WSD3mWneqJNVRjjJ",
		"t2GCR1SCk687Eeo5NEZ23MLsms7JjVWBgfG",
		"t2KyiPR9Lztq2w1w747X6W4nkUMAGL8M9KN",
		"t2UxymadyxSyVihmbq7S1yxw5dCBqJ1S4jT",
		"t2AVeMy7fdmTcJhckqiKRG8B7F1vccEhSqU",
		"t26m7LwihQzD2sH7ZVhYpPJM5j7kzwbfKW9",
		"t2DgwUNTe7NxuyPU6fxsB5xJXap3E4yWXrN",
		"t2U6funcXA11fC9SZehyvUL3rk3Vhuh7fzS",
		"t284JhyS8LGM72Tx1porSqwrcq3CejthP1p",
		"t29egu8QcpzKeLoPLqWS6QVMnUUPQdF6eNm",
		"t29LqD9p9D3B26euBwFi6mfcWu8HPA38VNs",
		"t28GsAMCxAyLy85XaasddDzaYFTtfewr86y",
		"t2GV44QyaikQPLUfm6oTfZnw71LLjnR7gDG",
		"t2U2QzNLQ1jtAu4L6xxVnRXLBsQpQvGRR2g",
		"t2QKGr5PNan7nrwDgseyHMN9NFeeuUjCh8b",
		"t2AfS8u6HwBeJpKpbuxztvRjupKQDXqnrwa",
		"t2CTRQUViQd3CWMhnKhFnUHqDLUyTxmWhJs",
		"t2CbM9EqszNURqh1UXZBXYhwp1R4GwEhWRE",
		"t2LM7uYiAsKDU42GNSnMwDxbZ8s1DowQzYH",
		"t2AgvT35LHR378AE3ouz6xKMhkTLHLJC6nD",
		"t285EAQXUVyi4NMddJv2QqTrnv45GRMbP8e",
		"t2EpMRCD5b8f2DCQ37npNULcpZhkjC8muqA",
		"t2BCmWXrRPiCeQTpizSWKKRPM5X6PS7umDY",
		"t2DN7X6wDFn5hYKBiBmn3Z98st419yaTVTH",
		"t2QJj8HeCwQ6mHwqekxxDLZntYpZTHNU62t",
		"t2QdHBR1Yciqn4j8gpS8DcQZZtYetKvfNj3",
		"t2E5cpLA1ey5VNxFNcuopeQMq2rH2NHiPdu",
		"t2EVRGtzjFAyz8CF8ndvLuiJu7qZUfDa93H",
		"t2KoQDk3BSFadBkuaWdLwchFuQamzw9RE4L",
		"t2FnR3yhTmuiejEJeu6qpidWTghRd1HpjLt",
		"t2BAuBAAospDc9d1u5nNGEi6x4NRJBD2PQ2",
		"t2RtKrLCGcyPkm4a4APg1YY9Wu2m4R2PgrB",
		"t28aUbSteZzBq2pFgj1K1XNZRZP5mMMyakV",
		"t2Urdy1ERfkvsFuy6Z4BkhvYGzWdmivfAFR",
		"t2ADinR4JrvCMd4Q1XGALPajzFrirqvhED6"
	]
};
```

Create and start new pool with configuration options and authentication function

```javascript
var Stratum = require('stratum-pool');

var pool = Stratum.createPool({

    "coin": myCoin,

    "address": "mi4iBXbBsydtcc5yFmsff2zCFVX4XG7qJc", //Address to where block rewards are given

    /* Block rewards go to the configured pool wallet address to later be paid out to miners,
       except for a percentage that can go to, for examples, pool operator(s) as pool fees or
       or to donations address. Addresses or hashed public keys can be used. Here is an example
       of rewards going to the main pool op, a pool co-owner, and NOMP donation. */
    "rewardRecipients": {
        "n37vuNFkXfk15uFnGoVyHZ6PYQxppD3QqK": 1.5, //1.5% goes to pool op
        "mirj3LtZxbSTharhtXvotqtJXUY7ki5qfx": 0.5, //0.5% goes to a pool co-owner
    },

    "blockRefreshInterval": 1000, //How often to poll RPC daemons for new blocks, in milliseconds


    /* Some miner apps will consider the pool dead/offline if it doesn't receive anything new jobs
       for around a minute, so every time we broadcast jobs, set a timeout to rebroadcast
       in this many seconds unless we find a new job. Set to zero or remove to disable this. */
    "jobRebroadcastTimeout": 55,

    //instanceId: 37, //Recommend not using this because a crypto-random one will be generated

    /* Some attackers will create thousands of workers that use up all available socket connections,
       usually the workers are zombies and don't submit shares after connecting. This features
       detects those and disconnects them. */
    "connectionTimeout": 600, //Remove workers that haven't been in contact for this many seconds

    /* Sometimes you want the block hashes even for shares that aren't block candidates. */
    "emitInvalidBlockHashes": false,

    /* Enable for client IP addresses to be detected when using a load balancer with TCP proxy
       protocol enabled, such as HAProxy with 'send-proxy' param:
       http://haproxy.1wt.eu/download/1.5/doc/configuration.txt */
    "tcpProxyProtocol": false,

    /* If a worker is submitting a high threshold of invalid shares we can temporarily ban their IP
       to reduce system/network load. Also useful to fight against flooding attacks. If running
       behind something like HAProxy be sure to enable 'tcpProxyProtocol', otherwise you'll end up
       banning your own IP address (and therefore all workers). */
    "banning": {
        "enabled": true,
        "time": 600, //How many seconds to ban worker for
        "invalidPercent": 50, //What percent of invalid shares triggers ban
        "checkThreshold": 500, //Check invalid percent when this many shares have been submitted
        "purgeInterval": 300 //Every this many seconds clear out the list of old bans
    },

    /* Each pool can have as many ports for your miners to connect to as you wish. Each port can
       be configured to use its own pool difficulty and variable difficulty settings. varDiff is
       optional and will only be used for the ports you configure it for. */
       
       //1 Diff is 8192 network. IE: .5 diff is actually 4096. 2 diff is 16384
       
    "ports": {
        "3032": { //A port for your miners to connect to
            "diff": 0.125, //the pool difficulty for this port

            /* Variable difficulty is a feature that will automatically adjust difficulty for
               individual miners based on their hashrate in order to lower networking overhead */
            "varDiff": {
                "minDiff": 0.125, //Minimum difficulty
                "maxDiff": 512, //Network difficulty will be used if it is lower than this
                "targetTime": 15, //Try to get 1 share per this many seconds
                "retargetTime": 90, //Check to see if we should retarget every this many seconds
                "variancePercent": 30 //Allow time to very this % from target without retargeting
            }
        },
        "3256": { //Another port for your miners to connect to, this port does not use varDiff
            "diff": 256 //The pool difficulty
        }
    },

    /* Recommended to have at least two daemon instances running in case one drops out-of-sync
       or offline. For redundancy, all instances will be polled for block/transaction updates
       and be used for submitting blocks. Creating a backup daemon involves spawning a daemon
       using the "-datadir=/backup" argument which creates a new daemon instance with it's own
       RPC config. For more info on this see:
          - https://en.bitcoin.it/wiki/Data_directory
          - https://en.bitcoin.it/wiki/Running_bitcoind */
    "daemons": [
        {   //Main daemon instance
            "host": "127.0.0.1",
            "port": 19332,
            "user": "litecoinrpc",
            "password": "testnet"
        },
        {   //Backup daemon instance
            "host": "127.0.0.1",
            "port": 19344,
            "user": "litecoinrpc",
            "password": "testnet"
        }
    ],


    /* This allows the pool to connect to the daemon as a node peer to receive block updates.
       It may be the most efficient way to get block updates (faster than polling, less
       intensive than blocknotify script). It requires the additional field "peerMagic" in
       the coin config. */
    "p2p": {
        "enabled": false,

        /* Host for daemon */
        "host": "127.0.0.1",

        /* Port configured for daemon (this is the actual peer port not RPC port) */
        "port": 19333,

        /* If your coin daemon is new enough (i.e. not a shitcoin) then it will support a p2p
           feature that prevents the daemon from spamming our peer node with unnecessary
           transaction data. Assume its supported but if you have problems try disabling it. */
        "disableTransactions": true

    }

}, function(ip, port , workerName, password, callback){ //stratum authorization function
    console.log("Authorize " + workerName + ":" + password + "@" + ip);
    callback({
        error: null,
        authorized: true,
        disconnect: false
    });
});
```


Listen to pool events
```javascript
/*

'data' object contains:
    job: 4, //stratum work job ID
    ip: '71.33.19.37', //ip address of client
    port: 3333, //port of the client
    worker: 'matt.worker1', //stratum worker name
    height: 443795, //block height
    blockReward: 5000000000, //the number of satoshis received as payment for solving this block
    difficulty: 64, //stratum worker difficulty
    shareDiff: 78, //actual difficulty of the share
    blockDiff: 3349, //block difficulty adjusted for share padding
    blockDiffActual: 3349 //actual difficulty for this block


    //AKA the block solution - set if block was found
    blockHash: '110c0447171ad819dd181216d5d80f41e9218e25d833a2789cb8ba289a52eee4',

    //Exists if "emitInvalidBlockHashes" is set to true
    blockHashInvalid: '110c0447171ad819dd181216d5d80f41e9218e25d833a2789cb8ba289a52eee4'

    //txHash is the coinbase transaction hash from the block
    txHash: '41bb22d6cc409f9c0bae2c39cecd2b3e3e1be213754f23d12c5d6d2003d59b1d,

    error: 'low share difficulty' //set if share is rejected for some reason
*/
pool.on('share', function(isValidShare, isValidBlock, data){

    if (isValidBlock)
        console.log('Block found');
    else if (isValidShare)
        console.log('Valid share submitted');
    else if (data.blockHash)
        console.log('We thought a block was found but it was rejected by the daemon');
    else
        console.log('Invalid share submitted')

    console.log('share data: ' + JSON.stringify(data));
});



/*
'severity': can be 'debug', 'warning', 'error'
'logKey':   can be 'system' or 'client' indicating if the error
            was caused by our system or a stratum client
*/
pool.on('log', function(severity, logKey, logText){
    console.log(severity + ': ' + '[' + logKey + '] ' + logText);
});
```

Start pool
```javascript
pool.start();
```


Credits
-------
* [vekexasia](//github.com/vekexasia) - co-developer & great tester
* [LucasJones](//github.com/LucasJones) - got p2p block notify working and implemented additional hashing algos
* [TheSeven](//github.com/TheSeven) - answering an absurd amount of my questions, found the block 1-16 problem, provided example code for peer node functionality
* [pronooob](https://dogehouse.org) - knowledgeable & helpful
* [Slush0](//github.com/slush0/stratum-mining) - stratum protocol, documentation and original python code
* [viperaus](//github.com/viperaus/stratum-mining) - scrypt adaptions to python code
* [ahmedbodi](//github.com/ahmedbodi/stratum-mining) - more algo adaptions to python code
* [steveshit](//github.com/steveshit) - ported X11 hashing algo from python to node module
* [litecoinz](//github.com/litecoinz-project) - add equihash48_5, equihash96_3, equihash96_5 and equihash192_7 support


Donations
---------
To support development of this project feel free to donate :)

* BTC: `1KRotMnQpxu3sePQnsVLRy3EraRFYfJQFR`
* LTC: `LKfavSDJmwiFdcgaP1bbu46hhyiWw5oFhE`
* VTC: `VgW4uFTZcimMSvcnE4cwS3bjJ6P8bcTykN`
* MAX: `mWexUXRCX5PWBmfh34p11wzS5WX2VWvTRT`
* QRK: `QehPDAhzVQWPwDPQvmn7iT3PoFUGT7o8bC`
* DRK: `XcQmhp8ANR7okWAuArcNFZ2bHSB81jpapQ`
* DOGE: `DBGGVtwAAit1NPZpRm5Nz9VUFErcvVvHYW`
* Cryptsy Trade Key: `254ca13444be14937b36c44ba29160bd8f02ff76`

License
-------
Released under the GNU General Public License v2

http://www.gnu.org/licenses/gpl-2.0.html
