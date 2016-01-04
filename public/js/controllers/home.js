define(["../views/home"], function(HomeView) {
    var HomeCtrl = function(){
        this.view = new HomeView();

        this.init = function(){
            this.view.render();
        }

        this.init();
    }
    return HomeCtrl;
});