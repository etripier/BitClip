angular.module('bitclip.sendController', [
  'ngMorph'
])

.controller('sendController', ['$scope', '$timeout', 'persistentTransaction', 'TxBuilder','Utilities',
  function($scope, $timeout, persistentTransaction, TxBuilder, Utilities) {

    //  ng morph modal
    $scope.confirmed = false;
    
    $scope.confirmTransaction = function(message, success){
        $scope.txSuccessMessage = message;
        $scope.txSuccess = true;
        $timeout(function(){ $scope.txSuccess = false }, 3000);
    };

    $scope.morph = function(){
      console.log('changin: ', $scope.confirmed );
      $scope.confirmed = !$scope.confirmed;
      console.log('to? ', $scope.confirmed );
    };

    //initialize transaction details (amount, destination)
    $scope.transactionDetails = persistentTransaction.transactionDetails;

    //update the transaction details with input field values
    $scope.updateTransactionDetails = function() {
      persistentTransaction.updateTransaction($scope.transactionDetails)
    };

    //TODO: sendPayment Functionality
    $scope.sendPayment = function() {
      Utilities.isMainNet().then(function(isMainNet){
        Utilities.getCurrentPrivateKey().then(function(currentPrivateKey){
          TxBuilder.sendTransaction(currentPrivateKey, $scope.transactionDetails, isMainNet).then(function(message){
            $scope.confirmTransaction(message, true);
          }).catch(function(err){
            console.error(err);
            $scope.confirmTransaction('Transaction failed.', false);
          });
        });
      });
    };
  }
]);
