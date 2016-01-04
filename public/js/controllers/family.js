'use strict';
define(["../views/family"], function(FamilyView) {
    var FamilyCtrl = function(family){
        this.family = family;
        this.view = new FamilyView();
        this.view.collection.family = family;

        this.init = function(){
            var self = this;
            self.view.render();
            self.view.collection.fetch().done(function(){
                self.view.renderPlants();
            });            
        }

        this.init();
    }
    return FamilyCtrl;
});