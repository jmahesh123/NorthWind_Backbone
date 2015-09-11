define(
    [
        'backbone',
        'handlebars',
        './GridApp'
    ],
    function(Backbone, Handlebars, GridApp, OrderTemplate){

        var OrderInfoView = Backbone.View.extend({
            events:{
                'click .close': 'closeView'
            },
            initialize: function(){
                this.template = Handlebars.compile(OrderTemplate);
            },

            render: function(){
                this.$el.show('clip');
                this.model.set({isOrderDetail: true, isGridRow: false, isGridHeaderRow: false},{silent: true});
                this.$el.html(this.template(this.model.toJSON()));
            },

            closeView: function(){
                this.undelegateEvents();
                this.$el.empty();
            }
        });

        var OrderApp = {
            init : function(options){
                var businessObject = {
                    OrderID: "OrderID", OrderDate: "OrderDate",
                    CustomerID: "CustomerID", ShippedDate: "ShippedDate",
                    Freight: "Freight", ShipCity: "ShipCity",
                    ShipCountry: "ShipCountry"
                };
                this.ordersGrid = new GridApp({
                    el: App.Hook.find('.view-frame'),
                    className: "orders",
                    enableSearch: options.enableSearch,
                    enableSort: options.enableSort,
                    defaultSelect: options.defaultSelect,
                    businessObject: businessObject,
                    gridEvents: {onRowClick : "onOrderRowClick"}
                });
                App.Event.on("onOrderRowClick", this.showOrderInfo, this);
            },

            addOrders: function(customers){
                this.ordersGrid.addGridRows(customers);
            },

            isInitialized: function(){
                return (App.Hook.find('.view-frame .grid_orders').length > 0);
            },

            showOrderInfo: function(model){
                var orderInfoView = new OrderInfoView({
                    el: App.Hook.find('.dialog_orderInfo'),
                    model: model
                });
                orderInfoView.render();
            }
        }

        return OrderApp;
    }
);