define(
	['backbone', './NorthwindApp'],
    function(Backbone, NorthwindApp) {
  	var Router = Backbone.Router.extend({
		routes: {
		  'customers': 'showCustomers',
          'customers/orders': 'showOrdersForCustomer',
		  'orders': 'showOrders',
		  '*actions': 'defaultRoute'
		},

		initialize: function(){
            NorthwindApp.initialize();
        },

		showCustomers: function(fragment){
            NorthwindApp.showCustomers(fragment);
            console.log("showing customers...");
		},

		showOrders: function(){
            NorthwindApp.initialize();
            NorthwindApp.showOrders();
			console.log("showing orders...");	
		},

		findCustomer: function(){
			console.log("Find Customer");
			this.showCustomers({enableMap: true, enableSearch: true});
		},

		defaultRoute: function(fragment){
            this.navigate('customers', {trigger: true});
		},

		showOrdersForCustomer: function(CustomerID){
            var custOrders = _.filter(App.dataSource.Orders, function(order){
                return (order.CustomerID == CustomerID);
            });
            if(!OrderApp.isInitialized()){
				OrderApp.init();
			}
            OrderApp.addOrders(custOrders);
        },

        cleanUp: function(){
            App.Hook.empty();
        }
  });

  return Router;
});