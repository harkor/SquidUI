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

    svc.data = {
        settings : null,
        version : null,
        files : null,
        jobs : null,
        timelapses : null,
        printer : null,
        system : {
            commands : null
        },
        messages : []
    };

    svc.init = function(){
        svc.getSettings();
        svc.getVersion();
        svc.getFiles();
        svc.getJob();
        svc.getTimelapses();
        svc.getPrinterState();
        svc.getSystemCommands();

        OctoPrint.options.baseurl = svc.host
        OctoPrint.options.apikey = svc.apiKey;

        OctoPrint.socket.connect();

        OctoPrint.socket.onMessage("*", function(message) {
            if(message.event == 'current'){
                $.each(message.data.logs, function(key, log){
                    svc.data.messages.push(log);
                });

            }
        });

    }

    svc.getSettings = function(){

        $http({
            method: 'GET',
            url: svc.apiUrl+'/settings',
            headers: { 'X-Api-Key': svc.apiKey }
        }).then(function(response){
            svc.data.settings = response.data
        });

    }

    svc.getVersion = function(){

        $http({
          method: 'GET',
          url: svc.apiUrl+'/version',
          headers: { 'X-Api-Key': svc.apiKey }
        }).then(function(response){
            svc.data.version = response.data
        });

    }

    svc.getFiles = function(){

        $http({
          method: 'GET',
          url: svc.apiUrl+'/files',
          headers: { 'X-Api-Key': svc.apiKey }
        }).then(function(response){
            svc.data.files = response.data
        });

    }

    svc.getJob = function(){

        $http({
          method: 'GET',
          url: svc.apiUrl+'/job',
          headers: { 'X-Api-Key': svc.apiKey }
        }).then(function(response){
            svc.data.jobs = response.data;
            console.log(response.data);
        });

    }

    svc.sendJob = function(job){

        var data = { command : job };
        if(job == "pause") data.action = 'toggle';

        // $http({
        //   method: 'POST',
        //   url: svc.apiUrl+'/job',
        //   data : data,
        //   headers: { 'X-Api-Key': svc.apiKey }
        // }).then(function(response){
        //     console.log(response.data);
        // });

    }

    svc.getTimelapses = function(){

        $http({
          method: 'GET',
          url: svc.apiUrl+'/timelapse',
          headers: { 'X-Api-Key': svc.apiKey }
        }).then(function(response){
            svc.data.timelapses = response.data;
            console.log(response.data);
        });

    }

    svc.getPrinterState = function(){

        $http({
          method: 'GET',
          url: svc.apiUrl+'/printer?history=true&limit=100',
          headers: { 'X-Api-Key': svc.apiKey }
        }).then(function(response){
            svc.data.printer = response.data;
            console.log(response.data);
        });

    }

    svc.getSystemCommands = function(){

        $http({
          method: 'GET',
          url: svc.apiUrl+'/system/commands',
          headers: { 'X-Api-Key': svc.apiKey }
        }).then(function(response){
            svc.data.system.commands = response.data
        });

    }

    svc.sendSystemCommand = function(cmd){

        $http({
          method: 'POST',
          url: svc.apiUrl+'/system/commands/'+cmd.source+'/'+cmd.action,
          headers: { 'X-Api-Key': svc.apiKey }
        }).then(function(response){
            console.log(response);
        });

    }

    svc.sendGCode = function(gcode){

        $http({
          method: 'POST',
          data : { "commands" : gcode },
          url: svc.apiUrl+'/printer/command',
          headers: { 'X-Api-Key': svc.apiKey }
        }).then(function(response){
            console.log(response);
        });

    }

    return svc;

}
