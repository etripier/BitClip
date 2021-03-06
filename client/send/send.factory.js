angular.module('bitclip.sendFactory', [])

.factory('TxBuilder', ['$q', '$rootScope', function($q, $rootScope) {
  //Sends transaction data through helloblock
  var sendTransaction = function(privateKeyWIF, transactionObj, isMainNet) {
    var deferred = $q.defer();
    var networkVar = {
      network: isMainNet ? 'mainnet' : 'testnet'
    };
    var helloblocktx = new helloblock(networkVar);
    var ecKey = bitcoin.ECKey.fromWIF(privateKeyWIF);
    var network = isMainNet ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;
    var ecKeyAddress = ecKey.pub.getAddress(network).toString();
    var toAddress = transactionObj.destination;
    var txFee = isMainNet ? 10000 : 0;
    var txTargetValue = transactionObj.amount * 100000000;

    //Sets transaction bitcoin value (send value + transaction fee)
    helloblocktx.addresses.getUnspents(ecKeyAddress, {
      value: txTargetValue + txFee
    }, function(err, res, unspents) {
      if (err) {
        deferred.reject(err);
        $rootScope.$apply();
        return deferred.promise;
      };

      //sets change amount for transaction
      var tx = new bitcoin.Transaction();
      var totalUnspentsValue = 0;
      unspents.forEach(function(unspent) {
        tx.addInput(unspent.txHash, unspent.index);
        totalUnspentsValue += unspent.value;
      });
      tx.addOutput(toAddress, txTargetValue);

      var txChangeValue = totalUnspentsValue - txTargetValue - txFee;
      tx.addOutput(ecKeyAddress, txChangeValue);
      tx.ins.forEach(function(input, index) {
        tx.sign(index, ecKey);
      });

      //Sends off transaction
      var rawTxHex = tx.toHex();
      helloblocktx.transactions.propagate(rawTxHex, function(err, res, tx) { 
        if (err) {
          deferred.reject(err);
          $rootScope.$apply();
        } else if (tx) {
          deferred.resolve('Transaction successfully propagated.');
          $rootScope.$apply();
        }
      });
    });
    return deferred.promise;
  };

  //Varifies if address is valid
  var isValidAddress = function(address) {
    function check(address) {
      var decoded = base58_decode(address);     
      if (decoded.length !== 25) return false;

      var cksum = decoded.substr(decoded.length - 4); 
      var rest = decoded.substr(0, decoded.length - 4);  
      var good_cksum = hex2a(sha256_digest(hex2a(sha256_digest(rest)))).substr(0, 4);
      if (cksum !== good_cksum) return false;
      return true;
    };

    //Transaction data encryption
    function base58_decode(string) {
      var table = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
      var table_rev = new Array();

      for (var i = 0; i < 58; i++) {
        table_rev[table[i]] = int2bigInt(i, 8, 0);
      }

      var l = string.length;
      var long_value = int2bigInt(0, 1, 0);  
      var num_58 = int2bigInt(58, 8, 0);
      var c;

      for (var i = 0; i < l; i++) {
        c = string[l - i - 1];
        long_value = add(long_value, mult(table_rev[c], pow(num_58, i)));
      }

      var hex = bigInt2str(long_value, 16);  
      var str = hex2a(hex);  
      var nPad;

      for (nPad = 0; string[nPad] === table[0]; nPad++);  
      var output = str;
      if (nPad > 0) output = repeat('\0', nPad) + str;
      return output;
    };

    function hex2a(hex) {
      var str = '';
      for (var i = 0; i < hex.length; i += 2) {
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
      }
      return str;
    };

    function a2hex(str) {
      var aHex = '0123456789abcdef';
      var l = str.length;
      var nBuf;
      var strBuf;
      var strOut = '';
      for (var i = 0; i < l; i++) {
        nBuf = str.charCodeAt(i);
        strBuf = aHex[Math.floor(nBuf / 16)];
        strBuf += aHex[nBuf % 16];
        strOut += strBuf;
      }
      return strOut;
    };

    function pow(big, exp) {
      if (exp === 0) return int2bigInt(1, 1, 0);
      var newbig = big;
      for (var i = 1; i < exp; i++) {
        newbig = mult(newbig, big);
      }
      return newbig;
    };

    function repeat(s, n) {
      var a = [];
      while (a.length < n) {
        a.push(s);
      }
      return a.join('');
    };
    
    var regex = /[^a-zA-Z0-9]/;
    if (regex.test(address) || address === undefined) {
      return false;
    }
    return check(address);
  };

  return {
    sendTransaction: sendTransaction,
    isValidAddress: isValidAddress
  };
}]);
