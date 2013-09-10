chorus.views.DashboardProjectList = chorus.views.Base.extend({
    constructorName: "DashboardProjectListView",
    templateName: "dashboard/project_list",

    setup: function () {
        this.projectCards = [];
        this.onceLoaded(this.collection, this.buildCards);
    },

    postRender: function () {
        _.each(this.projectCards, function(view) {
            this.$el.append(view.render().el);
        }, this);

        $('.icon-info-sign').qtip(); //Restyles title text
    },

    buildCards: function () {
        _.invoke(this.projectCards, 'teardown');
        this.projectCards = this.collection.map(function (workspace) {
            var card = new chorus.views.ProjectCard({model: workspace});
            this.registerSubView(card);
            return card;
        }, this);
    }
});