angular.module('bitclip.headerFactory', [])

.factory('Header', ['$http', '$q', 'Utilities', function($http, $q, Utilities) {
  var setNetwork = function(isMainNet, callback) {
    chrome.storage.local.set({isMainNet: isMainNet}, callback);
  };

  var getBalanceForCurrentAddress = function() {
    var deferred = $q.defer();
    Utilities.getCurrentAddress().then(function(currentAddress) {
      Utilities.getBalances(currentAddress).then(function(arr) {
        deferred.resolve(arr[0].confirmedBalance);
      });
    });
    return deferred.promise;
  };

  return {
    setNetwork: setNetwork,
    getBalanceForCurrentAddress: getBalanceForCurrentAddress
  };
}]);
