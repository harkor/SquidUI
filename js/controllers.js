// controller.js
angular
.module('app')
.controller('mainCtrl', mainCtrl)
;

mainCtrl.$inject = ['$rootScope', '$scope', '$interval', 'octoPrint'];
function mainCtrl($rootScope, $scope, $interval, octoPrint) {

    $scope.$on('$viewContentLoaded', function(){
        octoPrint.init();

        jQuery("#slider-horizontal").slider({
            orientation: "horizontal",
            range: "min",
            animate: false,
            slide : function(event, ui){
                var nbrCmd = GCODE.renderer.getLayerNumSegments(0);
                GCODE.renderer.render($('#slider-vertical').slider('value'), 0, ui.value);
            }
        });

        jQuery("#slider-vertical").slider({
            orientation: "vertical",
            range: "min",
            animate: false,
            slide : function(event, ui){

                // var layer = ui.value + 2;
                var layer = ui.value;

                var nbrCmd = GCODE.renderer.getLayerNumSegments(layer);
                jQuery("#slider-horizontal").slider( "option", "max", nbrCmd);
                $('#slider-horizontal').slider('value', nbrCmd);

                GCODE.renderer.render(layer, 0, nbrCmd);

            }
        });



        jQuery(window).trigger('resize');

    });

    jQuery(window).resize(function(event) {

        jQuery('#webcam-fullscreen img').css({
            'min-width' : jQuery(window).width()+"px",
            'min-height' : jQuery(window).height()+"px"
        });

        jQuery("#slider-vertical").css({ height : jQuery('#slider-horizontal').width()+"px" });

    });

    $scope.loadGCodeViewer = function(){

        GCODE.ui.init({
            container: '#canvas',
            onProgress : function(type, progress){
                octoPrint.data.gcodeviewer.progressStatus.type = type;
                octoPrint.data.gcodeviewer.progressStatus.progress = progress;
            },
            onModelLoaded : function(data){

                jQuery("#slider-vertical").slider( "option", "max", data.layersPrinted-1);
                jQuery("#slider-horizontal").slider( "option", "max", GCODE.renderer.getLayerNumSegments(0));
                jQuery("#slider-horizontal").slider( "value", GCODE.renderer.getLayerNumSegments(0)-1);

                setTimeout(function(){
                    GCODE.renderer.render(0, 0, jQuery("#slider-horizontal").slider('value'));
                }, 100);


            }
        });

    }

    $scope.$watch(
        function(){
            if(octoPrint.data.jobs.job == null) return false;
            else return octoPrint.data.jobs.job.file.path;
        }, function(value){
            if(value !== false){
                octoPrint.gcodeviewer.loadFile(value);
            }
        }
    );

    $scope.login = {
        user : null,
        pass: null
    }

    $scope.terminal = {};
    $scope.temperature = {};
    $scope.bedTemperature = {};

    $scope.settings = {
        autoscroll : true,
        showFullScreen : false
    };

    $scope.xyzcontrol = {
        distance : 10
    };

    $scope.econtrol = {
        distance : 5
    };

    /* TEMPERATURES CHART */
    $scope.tempChart = {};

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

    $scope.setTemp = function(isBed){

        if(isBed != null && isBed == true){

            $scope.octoprint.sendGCode(['M140 S'+$scope.bedTemperature.degrees]);
            $scope.bedTemperature.degreesPlaceholder = $scope.bedTemperature.degrees;
            if($scope.bedTemperature.degreesPlaceholder == 0) $scope.bedTemperature.degreesPlaceholder = "";
            $scope.bedTemperature.degrees = "";

        } else {

            $scope.octoprint.sendGCode(['M104 S'+$scope.temperature.degrees]);
            $scope.temperature.degreesPlaceholder = $scope.temperature.degrees;
            if($scope.temperature.degreesPlaceholder == 0) $scope.temperature.degreesPlaceholder = "";
            $scope.temperature.degrees = "";

        }

    }

    $scope.confirmModal = {};
    $scope.ShowConfirmModal = function(element, callback){
        $scope.confirmModal = {
            element : element,
            callback : callback
        };
        jQuery('#confirmModal').modal('show');
    }

    $scope.ApplyConfirmModal = function(){
        $scope.confirmModal.callback($scope.confirmModal.element);
        jQuery('#confirmModal').modal('hide');
    }


    $scope.hideLine = function(string){

        result = false;
        if($scope.octoprint.data.settings != null){
            _.each($scope.octoprint.data.settings.terminalFilters, function(filter){
                if(filter.activ == true){
                    if(new RegExp(filter.regex).test(string) == true) result = true;
                }
            });
        }

        return result;

    }

    $scope.askLogin = function(){

        $scope.octoprint.login($scope.login.user, $scope.login.pass).done(function(response){
            $('#loginModal').modal('hide');
        }).fail(function(error){
            $scope.login.error = error.responseText;
        });

    }

    $scope.setFullScreen = function(){

        $rootScope.showFullScreen = !$rootScope.showFullScreen;

    }

    $scope.pouet = function(){

        console.log('click!!!');
    }


}
