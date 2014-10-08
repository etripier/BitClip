angular.module('bitclip.validateAddressDirective', [])

.directive('validAddress', ['TxBuilder', function (TxBuilder) {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, formElement, attr, ngModelCtrl) {
      // add a parser that will parse $scope.transactionDetails.destination everytime it is changed
      // must return the destination so that state of ng-model = destination
      ngModelCtrl.$parsers.unshift(function(destination) {
          var isValidAddress = TxBuilder.isValidAddress(destination);
          ngModelCtrl.$setValidity('validAddress', isValidAddress);
          return isValidAddress ? destination : undefined;
      });
            
      // add a formatter that will process each time the destination 
      // is updated on the DOM element. Must return destination to 
      // so that it updates the DOM.
      ngModelCtrl.$formatters.unshift(function(destination) {
          ngModelCtrl.$setValidity('validAddress', TxBuilder.isValidAddress(destination));
          return destination;
      });
    }
  };
}]);
