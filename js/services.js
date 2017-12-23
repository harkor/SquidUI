//services.js
angular
.module('app')
.factory('octoPrint', octoPrint);

octoPrint.$inject = ['$http', '$q', '__env'];
function octoPrint($http, $q, __env){

    var svc = {};

    svc.host = __env.apiHost;
    svc.apiKey = __env.apiKey;
    svc.apiUrl = svc.host+"/api";
    svc.appUrl = __env.appUrl;

    GCODE_WORKER = svc.appUrl+"/static/gcode-viewer/js/Worker.js"

    svc.data = {
        settings : null,
        version : null,
        files : null,
        jobs : { job : null },
        timelapses : null,
        printer : null,
        system : {
            commands : null
        },
        messages : [],
        temperaturesChart :  {
            data : []
        },
        terminal : {
            offset : 0,
            historic : ['a', 'b', 'c', 'd', 'e']
        },
        terminal : {
            offset : 0,
            historic : ['a', 'b', 'c', 'd', 'e']
        },
        connection : {
            settings : null
        },
        printerpofile : null,
        gcodeviewer : {
            loaded : false,
            progressStatus : {
                type : null,
                progress : null
            },
            currentLayer : null,
            settings: {
                sync : false,
                showmoves : true,
                showretract : true,
                shownext : false,
                shownprev : false
            }
        },
    };

    svc.socket = OctoPrint;

    svc.init = function(){

        svc.socket.options.baseurl = svc.host
        svc.socket.options.apikey = svc.apiKey;


        svc.run();

    }

    svc.run = function(){

        svc.socket.socket.connect();

        svc.getSettings();
        svc.getVersion();
        svc.getFiles();
        svc.getJob();
        svc.getTimelapses();
        svc.getPrinterState();
        svc.getSystemCommands();
        // svc.getPrinterProfiles();
        svc.getConnectionSettings();

        svc.socket.socket.onMessage("*", function(message) {

            if(message.event == 'current'){

                if(svc.data.jobs == undefined) svc.data.jobs = { job : null };
                if(svc.data.jobs.job == undefined) svc.data.jobs.job = {};
                svc.data.jobs.job = message.data.job;

                svc.data.jobs.progress = message.data.progress;

                if(svc.data.printer == undefined) svc.data.printer = { state : null };
                svc.data.printer.state = message.data.state;

                svc.data.currentZ = message.data.currentZ;

                $.each(message.data.logs, function(key, log){
                    svc.data.messages.push(log);
                });

                if(svc.data.messages.length > 300) svc.data.messages.splice(0, svc.data.messages.length - 300);

                if(message.data.temps.length > 0) svc.setTemp(message.data.temps[0]);
                if(svc.data.jobs.progress.completion == null) svc.data.jobs.progress.completion = 0;

                // if(octoPrint.data.jobs.job != null){
                //     // svc.gcodeviewer.loadFile(octoPrint.data.jobs.job.file.path);
                // }

                if(svc.data.printer.state.flags.printing === true && svc.data.gcodeviewer.settings.sync === true){

                    var cmdIndex = GCODE.gCodeReader.getCmdIndexForPercentage(svc.data.jobs.progress.completion);
                    if (cmdIndex !== false && cmdIndex != undefined){

                        GCODE.renderer.render(cmdIndex.layer, 0, cmdIndex.cmd);

                        jQuery("#slider-horizontal").slider( "value", cmdIndex.cmd);
                        jQuery("#slider-vertical").slider( "value", cmdIndex.layer);

                        svc.data.gcodeviewer.currentLayer = cmdIndex.layer;

                    }

                }

            }

            if(message.event == 'history'){

                $.each(message.data.logs, function(key, log){
                    svc.data.messages.push(log);
                });

                angular.forEach(message.data.temps, function(temp, key){
                    svc.setTemp(temp);
                });

            }

        });

    }

    svc.connect = function(data){

        svc.socket.connection.connect(data).done(function(){
            svc.run();
        });

    }

    svc.disconnect = function(){
        svc.socket.connection.disconnect().done(function(){
            svc.getConnectionSettings();
        });
    }

    svc.login = function(user, pass){

        return OctoPrint.browser.login(user, pass, true).done(function(response) {
            console.log(response);
        });

    }

    svc.getSettings = function(){

        svc.socket.settings.get().done(function(response){
            console.log(response);
            svc.data.settings = response;
        });

    }

    svc.getVersion = function(){

        $http({
          method: 'GET',
          url: svc.apiUrl+'/version',
          headers: { 'X-Api-Key': svc.apiKey }
        }).then(function(response){
            svc.data.version = response.data;
        });

    }

    svc.getFiles = function(){

        svc.socket.files.list(true)
        .done(function(response) {
            svc.data.files = response;
        });

    }

    svc.loadFile = function(file, print){

        svc.socket.files.select('local', file.path, print);

    }

    svc.deleteFile = function(file){

        svc.socket.files.delete('local', file.path).done(function(response){
            svc.getFiles();
        });

    }

    svc.getJob = function(){

        svc.socket.job.get().done(function(response){
            svc.data.jobs = response;
        });

    }

    svc.sendJob = function(job){

        var data = { command : job };
        if(job == "pause") data.action = 'toggle';

        $http({
          method: 'POST',
          url: svc.apiUrl+'/job',
          data : data,
          headers: { 'X-Api-Key': svc.apiKey }
        });

    }

    svc.getTimelapses = function(){

        svc.socket.timelapse.get().done(function(response){
            // console.log(response);
            svc.data.timelapses = response;
        });

    }

    svc.deleteTimelapse = function(file){

        svc.socket.timelapse.delete(file.name).done(function(){
            svc.getTimelapses();
        });

    }

    svc.getPrinterState = function(){

        svc.socket.printer.getFullState().done(function(response){
            svc.data.printer = response;
        });

    }

    svc.getSystemCommands = function(){

        svc.socket.system.getCommands().done(function(response){
            svc.data.system.commands = response;
        });

    }

    svc.sendSystemCommand = function(cmd){

        svc.socket.system.executeCommand(cmd.source, cmd.action);

    }

    svc.getPrinterProfiles = function(){

        svc.socket.printerprofiles.list().done(function(response){
            svc.data.printerprofiles = response;
        });

    }

    svc.getPrinterProfile = function(id){

        svc.socket.printerprofiles.get(id).done(function(response){
            svc.data.printerprofile = response;

            GCODE.renderer.setOption({
                bed : {
                    x : svc.data.printerprofile.volume.width,
                    y : svc.data.printerprofile.volume.depth
                },
                zoomInOnBed : true,
                centerViewport: true,
            });

        });

    }

    svc.getConnectionSettings = function(){

        return svc.socket.connection.getSettings().done(function(response){
            svc.getPrinterProfile(response.current.printerProfile);
            svc.data.connection.settings = response;
            // console.log(response);
            return response;
        });

    }

    svc.sendGCode = function(gcode, historic){

        if(historic == true){
            _.each(gcode, function(g){
                svc.data.terminal.historic.push(g);
            });
        }

        svc.socket.control.sendGcode(gcode);

    }

    svc.setTemp = function(temp){

        var i = 0;
        _.each(temp, function(values, device){

            if(device == 'time') return;

            // if(device == 'bed' && values.actual != null){
            //
            //     if(svc.data.temperaturesChart.data[i] == undefined){
            //
            //         svc.data.temperaturesChart.data[i] = {
            //             x: [],
            //             y: [],
            //             name: "Bed actual",
            //             showlegend: false
            //         };
            //
            //     }
            //
            //     svc.data.temperaturesChart.data[i].y.push(values.actual);
            //     svc.data.temperaturesChart.data[i].x.push(new Date(temp.time*1000));
            //
            //     i++;
            //
            //     if(svc.data.temperaturesChart.data[i] == undefined){
            //
            //         svc.data.temperaturesChart.data[i] = {
            //             x: [],
            //             y: [],
            //             name: "Bed target",
            //             showlegend: false
            //         };
            //
            //     }
            //
            //     svc.data.temperaturesChart.data[i].y.push(values.target);
            //     svc.data.temperaturesChart.data[i].x.push(new Date(temp.time*1000));
            //
            //     i++;
            //
            //     return;
            //
            // }

            if(svc.data.temperaturesChart.data[i] == undefined && values.actual != null){

                svc.data.temperaturesChart.data[i] = {
                    x: [],
                    y: [],
                    name: device+" actual",
                    showlegend: false
                };

            }

            if(svc.data.temperaturesChart.data[i] != undefined && values.actual != null){

                svc.data.temperaturesChart.data[i].y.push(values.actual);
                svc.data.temperaturesChart.data[i].x.push(new Date(temp.time*1000));

                i++;

                if(svc.data.temperaturesChart.data[i] == undefined){

                    svc.data.temperaturesChart.data[i] = {
                        x: [],
                        y: [],
                        name: device+" target",
                        showlegend: false
                    };

                }

                svc.data.temperaturesChart.data[i].y.push(values.target);
                svc.data.temperaturesChart.data[i].x.push(new Date(temp.time*1000));

                i++;

            }

        });


        if(svc.data.temperaturesChart.data[0].x.length > 100){ // Max 100 temp

            _.each(svc.data.temperaturesChart.data, function(val){
                val.y.splice(0,1);
                val.x.splice(0,1);
            });

        }

    }

    svc.gcodeviewer = {};

    svc.gcodeviewer.loadFile = function(file){

        jQuery.get(svc.socket.options.baseurl +'/downloads/files/local/'+file, function(response){

            var theFile = {
                target : {
                    result : response
                }
            };

            try {
                GCODE.gCodeReader.loadFile(theFile);
            } catch(e){
                // console.log(e);
            }

        });

    }

    svc.createFolder = function(folderName, subFolder){
        if(subFolder){
            svc.socket.files.createFolder('local', folderName, subFolder).done(function(response){
                svc.getFiles();
            });
        } else {
            svc.socket.files.createFolder('local', folderName).done(function(response){
                svc.getFiles();
            });
        }
    }

    svc.uploadFile = function(file, subFolder){

        var data = {};

        if(subFolder != null && subFolder != false) data.filename = subFolder+"/"+file.name;

        return svc.socket.files.upload("local", file, data).done(function(response){
            svc.getFiles();
        }).progress(function(response){
            // console.log(response);
        });

    }

    return svc;

}
