var mirror = angular.module('mirror', ["luegg.directives","googlechart","ngCookies"]);
mirror.controller('mirrorCntrl', function($scope,$http,$cookies,$filter,$timeout,$interval,$httpParamSerializer) {
	$scope.CurrentDate = $filter('date')(new Date(), 'MMMM dd, yyyy');
	function updateTime(){
		$scope.CurrentTime = $filter('date')(new Date(), 'hh:mm a');
	}
	$interval(updateTime,1000);
	getWeatherAndNews($http,$scope,$timeout);
	function updateWeatherAndNews(){
		getWeatherAndNews($http,$scope,$timeout);
	}
	$interval(updateWeatherAndNews,300000);
  stepsHistory($http,$scope,$cookies);
  caloriesHistory($http,$scope,$cookies);
  function updateSteps(){
    stepsHistory($http,$scope);
  }
  //$interval(updateSteps,1000000);
 
  // $interval(refreshToken,10000);
  //  function refreshToken(){
  //   getRefreshToken($http,$scope,$cookies,$httpParamSerializer);
  // }
});


function getWeatherAndNews($http,$scope,$timeout){
 $http.get('http://api.openweathermap.org/data/2.5/weather?id=4692559&appid=3875c7dc417bbcd77b03e13a8279c453')
        .then(function(response) {
        $scope.name=response.data.name;
        $scope.temp = convertToFahrenheit(response.data.main.temp);
        $scope.imageFile="http://openweathermap.org/img/w/"+response.data.weather[0].icon+".png";
        $scope.description=response.data.weather[0].description;
        $scope.temp_max=convertToFahrenheit(response.data.main.temp_max);
        $scope.temp_min=convertToFahrenheit(response.data.main.temp_min);
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
          //  console.log(counter);
            if(counter == length){
                counter=0;
            }
          }
          
          $timeout(addItem, 10000);
  }, function errorCallback(response) {
   
  });
}

function getRefreshToken($http,$scope,$cookies,$httpParamSerializer){
  $http({
  method: 'POST',
  url: 'https://api.fitbit.com/oauth2/token',
  headers: {
   'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8;',
   'Authorization': 'Basic MjI4N0tIOjUwMzVlNTU2ZDdlYjcwMjdmYjQ1MGE3MzkzMGFjZjYy'
 },
 params:{
  'grant_type': 'refresh_token',
  'refresh_token': refresh_token,
  'code': 'e659fa1e80be5e5cc8db37ddba4af7ad3d918ec6'
 },
 transformRequest: $httpParamSerializer 
}).then(function successCallback(response) {
    console.log(response.data);
    accessToken=response.data.access_token;
    refresh_token=response.data.refresh_token;
    console.log(refresh_token);
  }, function errorCallback(response) {
   
  });

}


function stepsHistory($http,$scope,$cookies){
  
  $cookies.put('accessToken','eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1M043NTgiLCJhdWQiOiIyMjg3S0giLCJpc3MiOiJGaXRiaXQiLCJ0eXAiOiJhY2Nlc3NfdG9rZW4iLCJzY29wZXMiOiJ3aHIgd251dCB3cHJvIHdzbGUgd3dlaSB3c29jIHdzZXQgd2FjdCB3bG9jIiwiZXhwIjoxNDgzNzQzOTU4LCJpYXQiOjE0ODMyNTk1Mjh9.kaRT8lLSBdmhdNDVzquu08d1olaBt868vHyd30mRTRs');
  var accessToken = $cookies.get('accessToken');

  $http({
    method: 'GET',
    url: 'https://api.fitbit.com/1/user/53N758/activities/steps/date/today/1w.json',
    headers: {
      'Authorization': 'Bearer '+accessToken
    } 
  }).then(function successCallback(response) {
    var activities = response.data['activities-steps'];
    buildStepsChart($scope,activities);
   }, function errorCallback(response) {

  });
}

function caloriesHistory($http,$scope,$cookies){
  
  $cookies.put('accessToken','eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1M043NTgiLCJhdWQiOiIyMjg3S0giLCJpc3MiOiJGaXRiaXQiLCJ0eXAiOiJhY2Nlc3NfdG9rZW4iLCJzY29wZXMiOiJ3aHIgd251dCB3cHJvIHdzbGUgd3dlaSB3c29jIHdzZXQgd2FjdCB3bG9jIiwiZXhwIjoxNDgzNzQzOTU4LCJpYXQiOjE0ODMyNTk1Mjh9.kaRT8lLSBdmhdNDVzquu08d1olaBt868vHyd30mRTRs');
  var accessToken = $cookies.get('accessToken');

  $http({
    method: 'GET',
    url: 'https://api.fitbit.com/1/user/53N758/activities/calories/date/today/1w.json',
    headers: {
      'Authorization': 'Bearer '+accessToken
    } 
  }).then(function successCallback(response) {
    var activities = response.data['activities-calories'];
    buildCaloriesChart($scope,activities);
   }, function errorCallback(response) {

  });
}

function buildStepsChart($scope, activities){
 // var chartType=chartType;
  $scope.stepsChart = {};
    
    $scope.stepsChart.type = "ColumnChart";
    
    $scope.stepsChart.data = {"cols": [
        {id: "t", label: "Date", type: "string"},
        {id: "s", label: "Steps", type: "number"}
    ], "rows": [
        {c: [
            {v: convertDate(activities[0].dateTime)},
            {v: activities[0].value}
        ]},
        {c: [ 
            {v: convertDate(activities[1].dateTime)},
           {v: activities[1].value}
        ]},
        {c: [
            {v: convertDate(activities[2].dateTime)},
            {v: activities[2].value}
        ]},
        {c: [
            {v: convertDate(activities[3].dateTime)},
            {v: activities[3].value},
        ]},
        {c: [
            {v: convertDate(activities[4].dateTime)},
            {v: activities[4].value}
        ]},
        {c:[
          {v: convertDate(activities[5].dateTime)},
          {v: activities[5].value}
          ]},
        {c:[
          {v: convertDate(activities[6].dateTime)},
          {v: activities[6].value}
          ]}
    ]};

    $scope.stepsChart.options = {
        width: 600,
        height: 400,
        fontSize:14,
        backgroundColor: '#1b1b1b',
        colors: ['#ffffff'],
         hAxis: {
          textStyle: {
            color: '#ffffff'
        }
      },
      vAxis:{
        title:"Steps",
         gridlines: {
          color: 'transparent'
         },
         textStyle: {
            color: '#ffffff'
        },
        titleTextStyle: {
            color: '#ffffff'
        }
      },
      legend : 'none'
    };
}

function buildCaloriesChart($scope, activities){
 // var chartType=chartType;
  $scope.caloriesChart = {};
    
    $scope.caloriesChart.type = "ColumnChart";
    
    $scope.caloriesChart.data = {"cols": [
        {id: "t", label: "Date", type: "string"},
        {id: "s", label: "Steps", type: "number"}
    ], "rows": [
        {c: [
            {v: convertDate(activities[0].dateTime)},
            {v: activities[0].value}
        ]},
        {c: [ 
            {v: convertDate(activities[1].dateTime)},
           {v: activities[1].value}
        ]},
        {c: [
            {v: convertDate(activities[2].dateTime)},
            {v: activities[2].value}
        ]},
        {c: [
            {v: convertDate(activities[3].dateTime)},
            {v: activities[3].value},
        ]},
        {c: [
            {v: convertDate(activities[4].dateTime)},
            {v: activities[4].value}
        ]},
        {c:[
          {v: convertDate(activities[5].dateTime)},
          {v: activities[5].value}
          ]},
        {c:[
          {v: convertDate(activities[6].dateTime)},
          {v: activities[6].value}
          ]}
    ]};

    $scope.caloriesChart.options = {
        width: 600,
        height: 400,
        fontSize:14,
        backgroundColor: '#1b1b1b',
        colors: ['#ffffff'],
         hAxis: {
          textStyle: {
            color: '#ffffff'
        }
      },
      vAxis:{
        title:"Steps",
         gridlines: {
          color: 'transparent'
         },
         textStyle: {
            color: '#ffffff'
        },
        titleTextStyle: {
            color: '#ffffff'
        }
      },
      legend : 'none'
    };
}

function convertToFahrenheit(value){
  var fahr = (value - 273.15)* 1.8000 + 32.00;
  return fahr.toFixed(0);
}

function convertUtctoTime(utcSeconds){
var d = new Date(0);
d.setUTCSeconds(utcSeconds);
return d.toLocaleTimeString();
}

function convertDate(date){
  var d = new Date(date);
  return d.toISOString().slice(5,10);
}