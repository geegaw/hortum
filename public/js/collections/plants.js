'use strict';
define(['backbone', '../models/plant'],
function(Backbone, Plant){
    var Plants = Backbone.Collection.extend({
        model: Plant,
        family: null,
        query: null,
        total: 0,
        page: 0,
        url: function(){
            var base = "/api/plants";
            if (this.family){
                base+= '/family/'+this.family;
            }
            if (this.page){
                base+= '/page/'+this.page;
            }
            
            return base;
        },
        parse: function(response){
            if (response && response.count){
                this.total = response.count;
                return response.items;
            }
            else{
                return Plants.__super__.parse.apply(this, response);
            }
        }
    });
    return Plants;
});