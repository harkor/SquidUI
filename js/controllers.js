// controller.js
angular
.module('app')
.controller('mainCtrl', mainCtrl);

mainCtrl.$inject = ['$scope', '$interval', 'octoPrint'];
function mainCtrl($scope, $interval, octoPrint) {

    octoPrint.init();
    // octoPrint.sendGCode('G28');

    $scope.terminal = {};




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


    $scope.$watchCollection(watchOctoprint, function(value){
        $scope.octoprint = value;
    });

    function watchOctoprint(){

        if(jQuery('.terminal-body').length > 0){
            jQuery('.terminal-body')[0].scrollTop = jQuery('.terminal-body')[0].scrollHeight;
        }

        if($scope.tempChart.data[0].y.length == 0 && $scope.tempChart.data[0].x.length == 0){

            if(octoPrint.data.printer != null){
                angular.forEach(octoPrint.data.printer.temperature.history, function(log, key){
                    $scope.tempChart.data[0].x.push(new Date(log.time*1000));
                    $scope.tempChart.data[0].y.push(log.tool0.actual);

                    $scope.tempChart.data[1].x.push(new Date(log.time*1000));
                    $scope.tempChart.data[1].y.push(log.tool0.target);

                });
            }

        } else {

            var d = new Date();
            now = d.getTime();

            lastDate = $scope.tempChart.data[0].x[$scope.tempChart.data[0].x.length - 1].getTime();

            if(now - lastDate > 5000){

                var tmp0X = [];
                var tmp0Y = [];

                var tmp1X = [];
                var tmp1Y = [];

                angular.forEach($scope.tempChart.data[0].x, function(val, key){
                    if(key != 0){

                        tmp0X.push($scope.tempChart.data[0].x[key]);
                        tmp0Y.push($scope.tempChart.data[0].y[key]);

                        tmp1X.push($scope.tempChart.data[1].x[key]);
                        tmp1Y.push($scope.tempChart.data[1].y[key]);

                    }
                });

                $scope.tempChart.data[0].x = tmp0X;
                $scope.tempChart.data[0].y = tmp0Y;

                $scope.tempChart.data[1].x = tmp1X;
                $scope.tempChart.data[1].y = tmp1Y;

                $scope.tempChart.data[0].x.push(new Date());
                $scope.tempChart.data[0].y.push(octoPrint.data.printer.temperature.tool0.actual);

                $scope.tempChart.data[1].x.push(new Date());
                $scope.tempChart.data[1].y.push(octoPrint.data.printer.temperature.tool0.target);

            }

        }

        return octoPrint;
    }

    $interval(octoPrint.getPrinterState, 5000);

    $scope.sendGcode = function(){

        $scope.octoprint.sendGCode([$scope.terminal.gcode]);
        $scope.terminal.gcode = "";

    }


}
