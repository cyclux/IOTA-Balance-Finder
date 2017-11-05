var IOTA = require('iota.lib.js');
//var fs = require("fs");
var iota = new IOTA({
  'provider': 'http://node01.iotameetup.nl:14265'
});
var seed = "HJKDGHSJKGSHJGHJGJHKHJKHJKHJKHKJHKFGHSDFGSDHJSDGFHJSDGFJSDGFJDGJFGSDJFGSDJGJSDHFG" // in case the seed is all 9's (GOSH I HOPE NOT)
//var seed = process.argv[2] + ""
var status = 'checking'
var snapshotSep = require('fs').readFileSync('snapshot_september.txt', 'utf-8').toString().split("\n");
var snapshotOct = require('fs').readFileSync('snapshot_october.txt', 'utf-8').toString().split("\n");

if (seed.length !== 81) {
  console.error("Seed is not 81 characters!");
}

// const readline = require('readline');
// readline.emitKeypressEvents(process.stdin);
// process.stdin.setRawMode(true);
// process.stdin.on('keypress', (str, key) => {
//   if (key.ctrl && key.name === 'c') {
//     process.exit();
//   } else {
//     if (key.name === 'i') {
//       process.exit();
//     }
//   }
// })


console.log('Checking your balance...Press i at any time to stop...');
var addressesWithBalances = []

var totalBalance = 0
var check = (index) => {
  console.log('Checking for new addresses');
  const amountToScan = 2
  var f = iota.api.getNewAddress(seed, {
    index,
    total: amountToScan,
    checksum: false
  }, function(e, d) {
    var hits = 0
    for (var i = 0; i < d.length; i++) {
      var addr = d[i]
      var hitSep = snapshotSep.filter((s) => {
        return s.indexOf(addr) > -1
      })
      var hitOct = snapshotOct.filter((s) => {
        return s.indexOf(addr) > -1
      })

      if (hitSep.length > 0 || hitOct.length > 0) {
        var snapshotDate = ""
        var balance = 0
        var reason = ""
        if(hitSep.length > 0){
          snapshotDate = "September 22"
          balance = parseInt(snapshotSep[snapshotSep.indexOf(hitSep[0])].split(',"balance":')[1])
          reason = snapshotSep[snapshotSep.indexOf(hitSep[0])].split(',"category":')[1]
        }
        if(hitOct.length > 0){
          snapshotDate = "October 23"
          balance = parseInt(snapshotOct[snapshotOct.indexOf(hitOct[0])].split("; ")[1])
          reason = snapshotOct[snapshotOct.indexOf(hitOct[0])].split(`${balance}; `)[1]
        }

        var convertedBalance = balance / 1000000
        if (reason.match(/AVAILABLE/g) || reason.match(/NONE/g)) {
          console.log(`Got a hit! ${addr} has a balance of ${convertedBalance} Mi. The balance is currently in the address.`)
        }
        else {
          console.log(`Got a hit! ${addr} has a balance of ${convertedBalance} Mi which was found in the snapshot taken on ${snapshotDate}. The reason was ${reason}`)
        }
          totalBalance += balance
          addressesWithBalances.push({
            address: addr,
            balance,
            keyIndex: index + i,
            security: 2
          })
          hits++
        }
      }
      if (status === 'checking') {
      setTimeout(function() {
        check(index + amountToScan)
      }, 100)
    }
    })
  }

check(0)
