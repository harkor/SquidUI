// controller.js
angular
.module('app')
.controller('mainCtrl', mainCtrl);

mainCtrl.$inject = ['$scope', '$interval', 'octoPrint'];
function mainCtrl($scope, $interval, octoPrint) {

    octoPrint.init();

    $scope.terminal = {};
    $scope.temperature = {};

    $scope.settings = {
        autoscroll : true,
    };

    $scope.xyzcontrol = {
        distance : 1
    };

    /* TEMPERATURES CHART */
    $scope.tempChart = {};
    $scope.tempChart.data = [
        {
            x: [],
            y: [],
            name: "actual",
            showlegend: false
        },
        {
            x: [],
            y: [],
            name: "target",
            opacity : .5,
            showlegend: false
        }
    ];

    $scope.tempChart.layout = {
        xaxis : {
            tickformat : "%H:%M"
        },
        yaxis : {
            range : [0, 300]
        },
        height: 290,
        margin: { l : 40, r : 40, t : 40, b : 40 }
    };

    $scope.tempChart.options = {
        // showLink: false,
        // displayLogo: true
    };

    $interval(function(){
        setTimeout(function(){
            $scope.$apply();
        }, 0);
    }, 500);

    $scope.$watchCollection(watchOctoprint, function(value){
        $scope.octoprint = value;
    });

    function watchOctoprint(){

        if(jQuery('.terminal-body').length > 0 && $scope.settings.autoscroll == true){
            jQuery('.terminal-body')[0].scrollTop = jQuery('.terminal-body')[0].scrollHeight;
        }

        return octoPrint;
    }

    // $interval(octoPrint.getPrinterState, 5000);
    setTimeout(function(){
        // $scope.$apply();
    }, 2000);

    $scope.sendGcode = function(){

        $scope.octoprint.sendGCode([$scope.terminal.gcode], true);
        $scope.terminal.gcode = "";

    }

    $scope.loadTerminalCmd = function(event){

        // Soon

    }

    $scope.setTemp = function(){

        $scope.octoprint.sendGCode(['M104 S'+$scope.temperature.degrees]);
        $scope.temperature.degreesPlaceholder = $scope.temperature.degrees;
        if($scope.temperature.degreesPlaceholder == 0) $scope.temperature.degreesPlaceholder = "";
        $scope.temperature.degrees = "";

    }


}
