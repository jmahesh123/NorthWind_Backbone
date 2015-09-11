define(
    [
        'backbone',
        './GridApp',
        './GoogleMapApp'
    ],
    function(Backbone, GridApp, GoogleMapApp){
        var CustomerApp = {
            init : function(options){
                var businessObject = {
                    ContactName: "ContactName",
                    CustomerID: "CustomerID",
                    CompanyName: "CompanyName",
                    Phone : "Phone",
                    Fax : "Fax",
                    Address: "Address",
                    City: "City",
                    Country: "Country"
                };
                this.customerGrid = new GridApp({
                    el: App.Hook.find('.app_placeHolder'),
                    enableSearch: options.enableSearch,
                    enableSort: options.enableSort,
                    defaultSelect: options.defaultSelect,
                    searchField: '',
                    className: "customers",
                    businessObject: businessObject,
                    gridEvents: {onRowClick : "onCustomerRowClick"}
                });
                this.enableMap = options.enableMap;
                this.showOrders = options.enableOrderView;
                App.Event.on("onCustomerRowClick", this.handleRowClick, this);
                if(options.enableMap){
                    $('#map-canvas').show();
                    this.googleMapApp = new GoogleMapApp({el: $('#map-canvas')});
                }
                else{
                    $('#map-canvas').empty();
                    $('#map-canvas').hide();
                }
            },

            addCustomers: function(customers){
                this.customerGrid.addGridRows(customers);
            },

            isInitialized: function(){
                return (App.Hook.find('.view-frame .grid_customers').length > 0);
            },

            handleRowClick: function(model){
                //OrderView integration
                if(this.showOrders){
                    App.Event.trigger("showOrdersForCustomer", model.get("CustomerID"));
                }
                //Map integration
                if(this.enableMap){
                    var address = model.get("Address") + "," + model.get("City") + "," + model.get("Country");
                    App.Event.trigger("locatePosition", address);
                }
            }
        }

        return CustomerApp;
    }
);