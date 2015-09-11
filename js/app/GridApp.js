define(
    [
        'backbone',
        'handlebars'
    ],
    function(Backbone, Handlebars){
        var gridTemplate = (
            "{{#if enableSearch}}"
                +"<div class='searchBox'>"
                    +"<input type='text' id='findInput'/>"
                    +"<div class='buttons medium'>"
                        +"<a href='javascript:void(0)' id='searchBtn'><span>Search</span></a>"
                    +"</div>"
                +"</div>"
            +"{{/if}}"
            +"<div class='grid_{{className}}'>"
                +"<div class='grid drop-shadow round'><div class='grid-header'></div><div class='grid-body'></div></div>"
            +"</div>"
        );
        var GridRowCollection = Backbone.Collection.extend({
            model: GridRowModel
        });
        var GridRowModel = Backbone.Model.extend({
            defaults: {
                isGridRow: true
            }
        });
        var GridRowView = Backbone.View.extend({
            tagName: 'div',
            events: {
                'click ': 'handleRowClick'
            },

            initialize: function(){
                this.template = this.options.template;
                this.gridEvents = this.options.gridEvents;
                this.model.bind("change", this.render, this);
                this.model.bind("change:selected", this.handleRowClick, this);
            },

            handleRowClick: function(){
                var self = this;
                this.$el.closest('.grid-body').find('.grid-tr.selected').removeClass("selected");
                this.$el.addClass("selected");
                var eventName = (!this.gridEvents["onRowClick"]) ? null : this.gridEvents["onRowClick"];
                if(eventName) App.Event.trigger(eventName, this.model);
            },

            render: function(){
                $(this.el).html(this.template(this.model.toJSON()));
                return this;
            }
        });
        var GridApp = Backbone.View.extend({
            initialize : function(){
                var self = this;
                var defaultOptions = {
                    enableSearch: false,
                    searchField: "",
                    enableSort: false,
                    defaultSelect: false,
                    businessObject: {},
                    className: ""
                }
                var options = _.extend(defaultOptions, this.options);
                this.rowCollection = [];
                this.businessObject = options.businessObject;
                this.sortedFields = {};

                this.initializeTemplate();
                //Render main grid
                var html = this.gridTemplate({ enableSearch: options.enableSearch, className: options.className });
                this.$el.append(html);

                var $grid = this.$el.find('.grid_'+ options.className+' .grid');
                this.$gridHeader = $grid.find('.grid-header');
                this.$gridBody = $grid.find('.grid-body');
                this.cleanUp();

                this.initializeHeader();
                if(options.enableSearch) this.addSearchEvents();
                //Registering events
                this.gridRowCollection = new GridRowCollection();
                this.gridRowCollection.on("reset", this.createAllRows, this);
                this.gridRowCollection.on("add", function(rowData){ self.createRow(rowData); });
            },

            initializeHeader: function(){
                //Initializing header row
                var self = this;
                this.$gridHeader.append(this.headerRowTemplate);
                if(this.options.enableSort)
                    this.$gridHeader.find('.grid-td').on("click", function(e){self.sortByColumn(e)});
            },

            initializeTemplate: function(){
                var dataRowTemplate = "";
                var headerRowTemplate = "<div class='grid-tr'>";
                var index = 0;
                var rowCaptions = _.each(this.businessObject, function(value, key){
                    var count = index++;
                    dataRowTemplate =  dataRowTemplate + "<div class='grid-td c'+" + count + ">{{" + value + "}}</div>";
                    headerRowTemplate = headerRowTemplate + "<div class='grid-td h'+" + count + ">" + key + "</div>";
                });
                headerRowTemplate = headerRowTemplate + "</div>";
                this.dataRowTemplate = Handlebars.compile(dataRowTemplate);
                this.headerRowTemplate = headerRowTemplate;
                this.gridTemplate = Handlebars.compile(gridTemplate);
            },

            addSearchEvents: function(){
                var self = this;
                this.$searchBox = this.$el.find('.searchBox');
                this.$searchBox.find('#findInput').on("keyup", function(){
                    var searchText = self.$searchBox.find('#findInput').val();
                    self.findGridRow(searchText);
                });
            },

            addGridRows: function(rows){
                var self = this;
                var rowModel;
                this.cleanUp();
                _.each(rows, function(row){
                    rowModel = new GridRowModel(row);
                    self.rowCollection.push(rowModel);
                    self.gridRowCollection.add(rowModel);
                });
                if(this.options.defaultSelect)  self.gridRowCollection.models[0].set("selected", true);
            },

            createAllRows: function(){
                var self = this;
                this.$gridBody.empty();
                var models = this.gridRowCollection.models;
                _.each(models, function(model){
                    self.createRow(model);
                });
            },

            createRow: function(rowModel){
                var gridRowView = new GridRowView({
                    model: rowModel,
                    className: 'grid-tr',
                    template: this.dataRowTemplate,
                    gridEvents: this.options.gridEvents
                });
                this.$gridBody.append(gridRowView.render().el);
            },

            findGridRow: function(searchVal){
                var self = this;
                self.searchField = this.options.searchField;
                var filterModels = this.rowCollection;
                if(searchVal != ""){
                    filterModels = _.filter(filterModels, function(model){
                        var len = searchVal.length;
                        if(!self.searchField || self.searchField == ''){
                            var jsonStr = JSON.stringify(model.attributes).toLowerCase();
                            return (jsonStr.indexOf(searchVal.toLowerCase()) != -1);
                        }
                        else{
                            var modelVal = model.get(self.searchField).toLowerCase();
                            return (searchVal.toLowerCase() == modelVal.substr(0, len));
                        }
                    });
                }
                this.gridRowCollection.reset(filterModels);
            },

            sortByColumn: function(e){
                var event = e || window.event;
                var target = event.currentTarget || event.srcElement;
                var sortFieldObj;
                var sortByField = $(target).text();
                if(this.sortedFields[sortByField]){
                    sortFieldObj = this.sortedFields[sortByField];
                    sortFieldObj['order'] = (sortFieldObj['order'] == "asc") ? "desc" : "asc";
                }
                else{
                    //For the first time sorting
                    sortFieldObj = this.sortedFields[sortByField] = {order : "asc"};
                }
                //Remove asc desc class from all header
                $(target).parent().find(".grid-td").removeClass("asc desc");
                $(target).addClass(sortFieldObj['order']);
                //Setting other field for unsorted mode
                _.each(this.sortedFields, function(sortField, sortKey){
                    if(sortKey != sortByField){
                        sortField.order = "desc";
                    }
                });
                this.doSortRow(sortByField, sortFieldObj['order']);
            },

            doSortRow: function(sortField, order){
                var sortedModels;
                var models = this.gridRowCollection.models;
                if(order == "desc"){
                    sortedModels = models.reverse();
                }
                else{
                    sortedModels = _.sortBy(models, function(model){
                        return (model.get(sortField));
                    });
                }
                this.gridRowCollection.reset(sortedModels);
            },

            cleanUp: function(){
                this.$gridBody.empty();
            }
        });
        return GridApp;
    }
);