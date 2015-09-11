require.config({
    baseUrl: 'js',
    paths:{
        text:'lib/require/text',
        jquery: 'lib/jquery/jquery-1.9.1',
        handlebars: 'lib/handlebars/handlebars',
        backbone: 'lib/backbone/backbone'
    },
    shim: {
        underscore: {
          exports: '_'
        },
        backbone: {
          deps: ["lib/underscore/underscore"],
          exports: "Backbone"
        }
    }
});

require(
    [
        'jquery',
        'backbone',
        'handlebars',
        'app/router'
    ],
    function ($, Backbone, Handlebars, Router) {
        window.App = {
            Models: {},
            Collections: {},
            Views: {},
            Event: _.extend({}, Backbone.Events),
            Hook: $('.view-container'),
            Router: Router,

            init: function() {
                new App.Router();
                Backbone.history.start();

            }


        };
        $(document).ready(function() {
            App.Models.CommonModel = Backbone.Model.extend({});
            App.init();
        });
    }
);