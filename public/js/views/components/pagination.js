'use strict';
define(["jquery", "underscore", 'backbone', 'text!templates/components/pagination.html'],
function($, _, Backbone, paginationTemplate){
    var PaginationView = Backbone.View.extend({
        template: _.template(paginationTemplate),
        initialize: function(options){
            this.setElement( options.$el );
            this.curPage = options.curPage || 0;
            this.numButtons = options.numButtons || 5; //must be odd
            this.collection = options.collection || new Backbone.Collection();
            this.pages = this.calcPages(options.perPage, this.collection.total) || 0;
            this.callBack = options.callBack || function(){};
        },
        render: function(){
            var half = parseInt(this.numButtons / 2)
            var start = Math.max((this.curPage - half), 1);
            var stop = Math.min( Math.max((this.curPage + half), (this.numButtons - 1)), (this.pages - 2));

            this.$el.html(this.template({
                curPage: this.curPage,
                start: start,
                stop: stop,
                pages: this.pages,
                numButtons: this.numButtons,
            }));
        },
        calcPages: function(perPage, total){
            return parseInt((total + perPage - 1) / perPage);
        },
        events: {
            "click button": "changePage",
        },
        changePage: function(e){
            var self = this;
            var $this = $(e.currentTarget);
            self.curPage = $this.data('page');
            self.collection.page = self.curPage;
            self.collection.fetch().done(function(){
                self.callBack();
                self.render();
            });
        },
    });
    return PaginationView;
});