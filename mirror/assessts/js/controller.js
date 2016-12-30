angular.module('mirror', ['luegg.directives'])
.controller('Mirror', function($scope, $http,$filter,$timeout) {
	 $scope.CurrentDate = $filter('date')(new Date(), 'MMMM dd, yyyy');
     $scope.CurrentTime = $filter('date')(new Date(), 'hh:mm a');
    $http.get('http://api.openweathermap.org/data/2.5/weather?id=4692559&appid=3875c7dc417bbcd77b03e13a8279c453')
        .then(function(response) {
        $scope.name=response.data.name;
        $scope.temp = convertToFahrenheit(response.data.main.temp);
        $scope.imageFile="http://openweathermap.org/img/w/"+response.data.weather[0].icon+".png";
        $scope.description=response.data.weather[0].description;
        $scope.temp_max=convertToFahrenheit(response.data.main.temp_max);
        $scope.temp_min=convertToFahrenheit(response.data.main.temp_min);
        // $scope.sunrise=convertUtctoTime(response.data.sys.sunrise);
        // $scope.sunset=convertUtctoTime(response.data.sys.sunset);
    }, function(response) {
        //Second function handles error
        $scope.response = "Something went wrong";
    });
$http({
  method: 'GET',
  url: 'https://newsapi.org/v1/articles?source=the-washington-post&apiKey=6eef6faaf43c43ad805f101d1adc340f'
}).then(function successCallback(response) {
        $scope.articles=[response.data.articles[0]];
          var counter = 1;
          var length=response.data.articles.length;
          $scope.glued = true;
          
          function addItem(){
            $scope.articles.push(response.data.articles[counter++]);
            $timeout(addItem, 10000);
            console.log(counter);
            if(counter == length){
                counter=0;
            }
          }
          
          $timeout(addItem, 10000);
  }, function errorCallback(response) {
   
  });
});

function convertToFahrenheit(value){
	var fahr = (value - 273.15)* 1.8000 + 32.00;
	return fahr.toFixed(0);
}

function convertUtctoTime(utcSeconds){
var d = new Date(0);
d.setUTCSeconds(utcSeconds);
return d.toLocaleTimeString();
}