var mirrorApp = angular.module('mirrorApp', ["luegg.directives", "googlechart", "ngCookies"]);

mirrorApp.factory('mirrorFactory', ['$http', '$cookies', function($http, $cookies) {
    var mirrorFactory = {};
    mirrorFactory.weatherService = function() {
        return $http.get('http://api.openweathermap.org/data/2.5/weather?id=4692559&appid=3875c7dc417bbcd77b03e13a8279c453');
    };

    mirrorFactory.newsService = function() {
        return $http.get('https://newsapi.org/v1/articles?source=the-washington-post&apiKey=6eef6faaf43c43ad805f101d1adc340f');
    }
    mirrorFactory.activitySteps = function() {
        var accessToken = $cookies.get('oauth_access_token');
        return $http({
            method: 'GET',
            url: 'https://api.fitbit.com/1/user/-/activities/steps/date/today/1w.json',
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        });
    }

    mirrorFactory.activityCalories = function() {
        var accessToken = $cookies.get('oauth_access_token');
        return $http({
            method: 'GET',
            url: 'https://api.fitbit.com/1/user/-/activities/calories/date/today/1w.json',
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        });
    }

    mirrorFactory.activities = function() {
        var accessToken = $cookies.get('oauth_access_token');
        return $http({
            method: 'GET',
            url: 'https://api.fitbit.com/1/user/-/activities/date/today.json',
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        });
    }
    return mirrorFactory;
}]);

mirrorApp.controller('mirrorCntrl', ['$scope', '$filter', '$interval', '$timeout', 'mirrorFactory', function($scope, $filter, $interval, $timeout, mirrorFactory) {
    $scope.CurrentDate = $filter('date')(new Date(), 'MMMM dd, yyyy');

    function updateTime() {
        $scope.CurrentTime = $filter('date')(new Date(), 'hh:mm a');
    }
    $interval(updateTime, 1000);


    function getWeather() {
        mirrorFactory.weatherService()
            .then(function(response) {
                $scope.name = response.data.name;
                $scope.temp = convertToFahrenheit(response.data.main.temp);
                $scope.imageFile = "http://openweathermap.org/img/w/" + response.data.weather[0].icon + ".png";
                $scope.description = response.data.weather[0].description;
                $scope.temp_max = convertToFahrenheit(response.data.main.temp_max);
                $scope.temp_min = convertToFahrenheit(response.data.main.temp_min);
            }, function(error) {
                //Second function handles error
                $scope.response = "Something went wrong";
            });
    }
    getWeather();

    function getNews() {
        mirrorFactory.newsService()
            .then(function(response) {
                $scope.articles = [response.data.articles[0]];
                var counter = 1;
                var length = response.data.articles.length;
                $scope.glued = true;

                function addItem() {
                    $scope.articles.push(response.data.articles[counter++]);
                    $timeout(addItem, 30000);
                    //  console.log(counter);
                    if (counter == length) {
                        counter = 0;
                    }
                }
                $timeout(addItem, 30000);
            }, function(error) {
                $scope.response = "Something went wrong";
            });
    }
    getNews();

    function getActivitySteps() {
        mirrorFactory.activitySteps()
            .then(function(response) {
                var activities = response.data['activities-steps'];
                buildStepsChart($scope, activities);
            }, function(error) {
                console.log(error.data.errors);
            });
        // body...
    }
    getActivitySteps();

    function getActivityCalories() {
        mirrorFactory.activityCalories()
            .then(function(response) {
                var activities = response.data['activities-calories'];
                buildCaloriesChart($scope, activities);
            }, function(error) {

            });
    }
    getActivityCalories();

    function getActivities() {
        mirrorFactory.activities()
            .then(function(response) {
                dailyGoalChart($scope, response);
            }, function(error) {

            });
    }
    getActivities();
    $interval(getWeather, 60000);
    $interval(getNews, 300000);
    $interval(getActivities, 180000);
    $interval(getActivitySteps, 180000);
    $interval(getActivityCalories, 180000);
}]);

function buildStepsChart($scope, activities) {
    // var chartType=chartType;
    $scope.stepsChart = {};

    $scope.stepsChart.type = "ColumnChart";

    $scope.stepsChart.data = {
        "cols": [{
            id: "t",
            label: "Date",
            type: "string"
        }, {
            id: "s",
            label: "Steps",
            type: "number"
        }],
        "rows": [{
            c: [{
                v: convertDate(activities[0].dateTime)
            }, {
                v: activities[0].value
            }]
        }, {
            c: [{
                v: convertDate(activities[1].dateTime)
            }, {
                v: activities[1].value
            }]
        }, {
            c: [{
                v: convertDate(activities[2].dateTime)
            }, {
                v: activities[2].value
            }]
        }, {
            c: [{
                v: convertDate(activities[3].dateTime)
            }, {
                v: activities[3].value
            }, ]
        }, {
            c: [{
                v: convertDate(activities[4].dateTime)
            }, {
                v: activities[4].value
            }]
        }, {
            c: [{
                v: convertDate(activities[5].dateTime)
            }, {
                v: activities[5].value
            }]
        }, {
            c: [{
                v: convertDate(activities[6].dateTime)
            }, {
                v: activities[6].value
            }]
        }]
    };

    $scope.stepsChart.options = {
        width: 600,
        height: 200,
        fontSize: 14,
        bar: {
            groupWidth: "60%"
        },
        backgroundColor: '#000000',
        colors: ['#ffffff'],
        hAxis: {
            textStyle: {
                color: '#ffffff'
            }
        },
        vAxis: {
            title: "Steps",
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
        legend: 'none'
    };
}

function buildCaloriesChart($scope, activities) {
    // var chartType=chartType;
    $scope.caloriesChart = {};

    $scope.caloriesChart.type = "ColumnChart";

    $scope.caloriesChart.data = {
        "cols": [{
            id: "t",
            label: "Date",
            type: "string"
        }, {
            id: "s",
            label: "Calories",
            type: "number"
        }],
        "rows": [{
            c: [{
                v: convertDate(activities[0].dateTime)
            }, {
                v: activities[0].value
            }]
        }, {
            c: [{
                v: convertDate(activities[1].dateTime)
            }, {
                v: activities[1].value
            }]
        }, {
            c: [{
                v: convertDate(activities[2].dateTime)
            }, {
                v: activities[2].value
            }]
        }, {
            c: [{
                v: convertDate(activities[3].dateTime)
            }, {
                v: activities[3].value
            }, ]
        }, {
            c: [{
                v: convertDate(activities[4].dateTime)
            }, {
                v: activities[4].value
            }]
        }, {
            c: [{
                v: convertDate(activities[5].dateTime)
            }, {
                v: activities[5].value
            }]
        }, {
            c: [{
                v: convertDate(activities[6].dateTime)
            }, {
                v: activities[6].value
            }]
        }]
    };

    $scope.caloriesChart.options = {
        width: 600,
        height: 200,
        fontSize: 14,
        bar: {
            groupWidth: "60%"
        },
        backgroundColor: '#000000',
        colors: ['#ffffff'],
        hAxis: {
            textStyle: {
                color: '#ffffff'
            }
        },
        vAxis: {
            title: "Calories",
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
        legend: 'none'
    };
}

function dailyGoalChart($scope, response) {
    var remainingGoal = response.data.goals.steps - response.data.summary.steps;
    if (remainingGoal < 0) {
        remainingGoal = 0;
    }
    console.log(remainingGoal);
    $scope.goalChart = {};

    $scope.goalChart.type = "PieChart";

    $scope.goalChart.data = {
        "cols": [{
            id: "t",
            label: "Goal",
            type: "string"
        }, {
            id: "s",
            label: "Steps",
            type: "number"
        }],
        "rows": [{
            c: [{
                v: "goal"
            }, {
                v: remainingGoal
            }, ]
        }, {
            c: [{
                v: "steps"
            }, {
                v: response.data.summary.steps
            }]
        }]
    };

    $scope.goalChart.options = {
        'title': 'Daily steps goal',
        titleTextStyle: {
            color: '#ffffff'
        },
        fontSize: 14,
        backgroundColor: '#000000',
        colors: ['#000000', '#ffffff'],
        pieHole: 0.7,
        legend: 'none'
            //pieSliceText: 'value',
            // position: 'labeled'
    };
}

function convertToFahrenheit(value) {
    var fahr = (value - 273.15) * 1.8000 + 32.00;
    return fahr.toFixed(0);
}

function convertUtctoTime(utcSeconds) {
    var d = new Date(0);
    d.setUTCSeconds(utcSeconds);
    return d.toLocaleTimeString();
}

function convertDate(date) {
    var d = new Date(date);
    return d.toISOString().slice(5, 10);
}