chorus.pages.JobsIndexPage = chorus.pages.Base.extend({
    constructorName: 'JobsIndexPage',

    setup: function (workspaceId) {
        this.subNav = new chorus.views.SubNav({workspace: this.workspace, tab: "jobs"});
        this.buttonView = new chorus.views.JobsIndexPageButtons({model: this.workspace});

        this.collection = new chorus.collections.JobSet([], {workspaceId: workspaceId});
        this.collection.sortAsc("name");
        this.collection.fetch();
        this.onceLoaded(this.collection, this.pollForJobs);

        this.mainContent = new chorus.views.MainContentList(this.listConfig());

        this.multiSelectSidebarMenu = new chorus.views.MultipleSelectionSidebarMenu(this.multiSelectSidebarConfig());

        this.mainContent.contentHeader.bind("choice:sort", function(choice) {
            var field = choice === "alpha" ? "name" : "nextRun";
            this.collection.sortAsc(field);
            this.collection.fetch();
        }, this);

        this.subscribePageEvent("job:search", function() {
            chorus.PageEvents.trigger('selectNone');
        });

        this.subscribePageEvent("job:selected", this.jobSelected);

        this.requiredResources.add(this.workspace);
        this.breadcrumbs.requiredResources.add(this.workspace);
    },

    crumbs: function() {
        return [
            {label: t("breadcrumbs.home"), url: "#/"},
            {label: t("breadcrumbs.workspaces"), url: '#/workspaces'},
            {label: this.workspace.loaded ? this.workspace.displayName() : "...", url: this.workspace.showUrl()},
            {label: t("breadcrumbs.jobs")}
        ];
    },

    makeModel: function(workspaceId) {
        this.loadWorkspace(workspaceId);
    },

    jobSelected: function (job) {
        if(this.sidebar) this.sidebar.teardown(true);

        this.sidebar = new chorus.views.JobSidebar({model: job});
        this.renderSubview('sidebar');
    },

    listConfig: function () {
        return {
            modelClass: "Job",
            collection: this.collection,
            contentDetailsOptions: {
                multiSelect: true,
                buttonView: this.buttonView
            },
            linkMenus: {
                sort: {
                    title: t("job.header.menu.sort.title"),
                    options: [
                        {data: "alpha", text: t("job.header.menu.sort.alphabetically")},
                        {data: "date", text: t("job.header.menu.sort.by_date")}
                    ],
                    event: "sort"
                }
            },
            search: {
                placeholder: t("job.search_placeholder"),
                eventName: "job:search"
            }
        };
    },

    multiSelectSidebarConfig: function () {
        return {
            selectEvent: "job:checked",
            actions: [
                '<a class="disable_jobs">{{t "job.actions.disable"}}</a>',
                '<a class="enable_jobs">{{t "job.actions.enable"}}</a>',
                '<a class="delete_jobs">{{t "job.actions.delete"}}</a>'
            ],
            actionEvents: {
                'click .disable_jobs': _.bind(function() {
                    this.multiSelectSidebarMenu.selectedModels.invoke('disable');
                }, this),
                'click .enable_jobs': _.bind(function() {
                    this.multiSelectSidebarMenu.selectedModels.invoke('enable');
                }, this),
                'click .delete_jobs': _.bind(function() {
                    new chorus.alerts.MultipleJobDelete({collection: this.multiSelectSidebarMenu.selectedModels}).launchModal();
                }, this)
            }
        };
    },

    pollForJobs: function () {
        this.collectionFetchPollerID && clearInterval(this.collectionFetchPollerID);

        var fetchCollection = _.bind(function () { this.collection.fetch(); }, this);
        this.collectionFetchPollerID = setInterval(fetchCollection, 15000);
    },

    teardown: function () {
        clearInterval(this.collectionFetchPollerID);
        return this._super('teardown');
    }
});
