define(
    [
        'backbone',
        'handlebars'
    ],
    function(Backbone, Handlebars){
        var GoogleMapModel = Backbone.Model.extend({
            defaults:{
                position: {},
                marker: {},
                title: ""
            }
        });

        var GoogleMapView = Backbone.View.extend({
            initialize: function(){
                this.createMap();
                this.model.on('change:position', this.render, this);
            },

            render: function(){
                var position = this.model.get('position');
                this.map.setCenter(position);
                this.marker.setPosition(position);
                this.marker.setTitle(this.model.get("title"));
                this.marker.setAnimation("BOUNCE");
            },

            createMap: function(){
                if(typeof(google) == "undefined"){
                    $(this.el).html("<p><h1>You are not connected to internet to access the Google Map</h1></p>");
                    return;
                }
                google.maps.visualRefresh = true;
                var mapOptions = {
                    zoom: 10,
                    center: new google.maps.LatLng(1, 1),
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                };
                this.map = new google.maps.Map($(this.el)[0], mapOptions);
                this.marker = new google.maps.Marker({ map: this.map});
            }

        });

        var GoogleMapApp = Backbone.View.extend({
            initialize: function(){
                this.model = new GoogleMapModel();
                this.view = new GoogleMapView({
                    el: this.el,
                    model: this.model
                });
                App.Event.on("locatePosition", this.locateByAddress, this);
            },

            locateByAddress: function(address){
                var self = this;
                var position = {};
                var geocoder = new google.maps.Geocoder();
                geocoder.geocode({ 'address': address }, function(results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        position =  results[0].geometry.location;
                        self.model.set({position: position});
                    }
                });

            }

        });
        return GoogleMapApp
    }
);