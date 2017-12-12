angular
.module('app')

.filter('searchFileManager', function(){

    var compare = function(input_, cond_){

        if (!cond_) return true;

        if (typeof input_ == "string" && typeof cond_ == "string"){

            return (new RegExp(cond_.toLowerCase())).test(input_.toLowerCase());

        } else if (typeof input_ == "object" && typeof cond_ == "object"){

            var pouet = false;
            if(input_.children != undefined){

                _.each(input_.children, function(input){

                    for(var s in cond_){
                        if(compare(input[s], cond_[s])) pouet = true;
                    }

                });

            }

            if(pouet == true) return true;

            for(var s in cond_){
                if(compare(input_[s], cond_[s])) return true;
            }

        }

        return false;
    }

    return function(inputs, cond) {

        if(inputs == undefined) return;

        return $.grep(inputs, function(input) {
            return compare(input, cond);
        });

    };

})

.filter('strReplace', function () {
  return function (input, from, to) {
    input = input || '';
    from = from || '';
    to = to || '';
    return input.replace(new RegExp(from, 'g'), to);
  };
})

;
