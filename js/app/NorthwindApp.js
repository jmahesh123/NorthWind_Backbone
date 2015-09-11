define(
    ['./customerApp', './orderApp'],
    function(CustomerApp, OrderApp) {
        var NorthwindApp = {

            initialize: function(){
                //App.Hook.html(northwindTemplate);
            },

            showCustomers: function(fragment){
                var options = {enableSort: true, enableMap: true, enableSearch: true, defaultSelect: true};
                var self = this;
                this.cleanUp();
                this.fetchData('customers', function(customers){
                    CustomerApp.init(options);
                    CustomerApp.addCustomers(customers);
                });
                console.log("showing customers...");
            },

            showOrders: function(){
                var options = {enableSort: true, enableMap: false, enableSearch: true};
                this.cleanUp();
                this.cleanUp();
                this.fetchData('orders', function(orders){
                    OrderApp.init(options);
                    OrderApp.addOrders(orders);
                });
                console.log("showing orders...");
            },

            fetchData: function(tableId, callBack){
                var fetchDataModel = new App.Models.CommonModel();
                fetchDataModel.url = 'northwind/'+tableId + '.json';
                fetchDataModel.fetch({
                    success: function(context, response){
                        callBack(response);
                    }
                });
            },

            cleanUp: function(){
                App.Hook.find('.view-frame > div').remove();
            }
        };

        return NorthwindApp;
    });