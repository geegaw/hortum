'use strict';
define(['backbone', 'controllers/home', 'controllers/plant', 'controllers/family'],
function(Backbone, HomeCtrl, PlantCtrl, FamilyCtrl){
    var HortumRouter = Backbone.Router.extend({
        routes: {
            "plant/family/:family": "family",
            "plant/:id/:name": "plant",
            "*path": "default",
        },

        "family": function(family){
            console.log(family);
            new FamilyCtrl(family);
        },
        "plant": function(id, name){
            console.log(id, name);
            new PlantCtrl(id);
        },
        "default": function(path){
            (path) ? this.notfound(path) : this.home();
        },
        "home": function(){
            new HomeCtrl();
        },
        "notfound": function(path){
            console.log("notfound", path);
        } 
    });
    return HortumRouter;
});