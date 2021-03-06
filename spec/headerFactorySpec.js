describe('Unit: headerFactory', function () {
  beforeEach(module('bitclip'));

  var $scope, $rootScope, $location, $window, $httpBackend, createController, Header, Utilities, tempStore;

  beforeEach(inject(function($injector) {
    $rootScope = $injector.get('$rootScope');
    $location = $injector.get('$location');
    $scope = $rootScope.$new();
    $httpBackend = $injector.get('$httpBackend');
    $window = $injector.get('$window');
    $http = $injector.get('$http');
    Header = $injector.get('Header');
    Utilities = $injector.get('Utilities');

  /***********************************************************
    Mocks up HelloBlock server when a GET request is made to 
    query balance of testNet currentAddress.
    Endpoint: https://helloblock.io/docs/ref#addresses-batch
  ***********************************************************/

  $httpBackend.when('GET','http://testnet.helloblock.io/v1/addresses?addresses=mieyV4Y8ba87pZYJKsJRz8qcZP4b2HvWLf')
  .respond({
    "status":"success",
    "data":{
      "addresses":[
        { "balance":224880000,
          "confirmedBalance":224880000 
        }
      ]
    }
  });

  /****************************************************
    Mocks up the chrome.storage.local setters 
    and getters.
  *****************************************************/

    $window.chrome = {
      storage: {
        local:{}
      }
    };

    $window.chrome.storage.local.set = function(obj , callback){
      tempStore = obj;
      callback();
    };

    $window.chrome.storage.local.get = function(propStrOrArray, callback){
      var result = {};                        
      if (typeof propStrOrArray === 'string'){
        result[propStrOrArray] = tempStore[propStrOrArray];
      } else if (Array.isArray(propStrOrArray)){
        propStrOrArray.forEach(function(propName){
          result[propName] = tempStore[propName];
        });
      } else if (propStrOrArray === null) {
        result = tempStore;
      }
      callback(result);
    };

  /*********************************************
    Mocks up state of chrome.storage.local
  **********************************************/

    tempStore = {
      "isMainNet":false,
      "mainNet":{
        "allAddressesAndKeys":[
          ["1GuxzXBZaFfjpGgGEFVt9NBGF9mParcPX2","KwHTcpKsBWSKbpd2JcaPN7yJLFUXXHoUudfrVXoc46QU4sQo87zU"],
          ["1138fgj4sa1kEMBGBiTBSsQWNnfHWB5aoe","L2Wc7UBsAdyKYFx2S6W29mW73Zn6FMD4JGQYFWrESoUhC1KXc2iC"],
          ["1bgGRDEyufhMBkVX1XA6rtC9cXAEBqbww","KzPpppRYpLfQAJQtb9tvmynpkfMSaDjXEyd5deNT6ALJ4D4j4Ksy"]],
        "currentAddress":"1GuxzXBZaFfjpGgGEFVt9NBGF9mParcPX2",
        "currentPrivateKey":"KwHTcpKsBWSKbpd2JcaPN7yJLFUXXHoUudfrVXoc46QU4sQo87zU"
      },
      "testNet":{
        "allAddressesAndKeys":[
          ["mieyV4Y8ba87pZYJKsJRz8qcZP4b2HvWLf","cRqGMD3MDfkEJit4HTtA3tUDcAtQkmogqrLAnuu4aBaefXCp1J79"],
          ["moJvQo6j1uDPXxntNpfFHXcAjwLvJ72sDV","cRnTroGPQrEDR8sjEiC5fDBwqyPL779R2uH3UpfHP5i7rHskXUJg"],
          ["mivutayae2naDT1NxjYN4LjEHXcUsCM6gr","cP2usaS1DnCR1nQboo7d1bMdJs4idzmPSWgvKKX7hPGPU9Yft1my"]],
        "currentAddress":"mieyV4Y8ba87pZYJKsJRz8qcZP4b2HvWLf",
        "currentPrivateKey":"cRqGMD3MDfkEJit4HTtA3tUDcAtQkmogqrLAnuu4aBaefXCp1J79"
      }
    };
  }));
  
  /*********************************************
                      Tests
  **********************************************/

  it('setNetwork should be a function', function () {
    expect(Header.setNetwork).to.be.a('function');
  });

  it('setNetwork should change isMainNet in chrome.storage.local', function (done) {
    Header.setNetwork(true, function(){
      expect(tempStore.isMainNet).to.equal(true);
      done();
    });
  });

  it('getBalanceForCurrentAddress should make GET request to HelloBlock and return correct balance', function (done) {
    Header.getBalanceForCurrentAddress()
    .then(function(balance){
      expect(balance).to.equal(224880000);
      done();
    })
    $httpBackend.flush();
    $rootScope.$apply();
  });
});