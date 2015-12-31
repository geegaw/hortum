"use strict";

var jsdom = require('jsdom');
var request = require("request");
var url = require("url");
var Q = require("q");

var endpoints = {
    detail: "http://www.rhs.org.uk/Plants/{id}/please-give-me-an-api/Details",
    facets: "http://www.rhs.org.uk/PlantSearchHandler.axd?isPlantDetails=true&c={cid}&callback=rhscallback"
};

function getCid ( id ){
    var deferred = Q.defer();
    var url = endpoints.detail.replace('{id}', id);

    request({uri: url}, function(err, response, html){

        if(err && response.statusCode !== 200){
            deferred.reject( err );
        }

        var $ = cheerio.load( html );
        var cid = $("#searchContext").last().val();

        deferred.resolve( cid );
    });
    return deferred.promise;
};

function getPlantDetails(id){
    var deferred = Q.defer();
    var url = endpoints.detail.replace('{id}', id);

    request({uri: url}, function(err, response, html){
        if(err && response.statusCode !== 200){
            console.log(err);
            deferred.reject( err );
            return;
        }
        
        jsdom.env(html, function(errors, window) {
            var $ = require("jquery")(window);
            $('li[data-facettype=common_name] p strong').remove();
            $('li[data-facettype=genus_description] p strong').remove();
            $('li[data-facettype=description] p strong').remove();

            var plant = {
                url: url,
                ids: {
                    rhs: {
                        id: id,
                        cid: $("[id=searchContext]:eq(1)").val(),
                    }                    
                },
                title: $('h1').text().trim(),
                names: $('li[data-facettype=common_name] p').text().trim().split("\n"),
                family: $('li[data-facettype=genus_description]:first p').text().trim(),
                genus: $('li[data-facettype=genus_description]:eq(1) p').text().trim(),
                description: $('li[data-facettype=description] p').text().trim(),
                characteristics: {},
                color: {},
                sunlight: {
                    sun: [],
                },
                soil: {
                    types: [],
                },
                size: {
                    height: $('.grid.size .results-size .ultimate-height p').text().trim(),
                    spread: $('.grid.size .results-size .ultimate-spread p').text().trim(),
                    peak_time: $('.grid.size .results-size .time-to-ultimate-height p').text().trim(),
                },
                how_to_grow: {
                    
                },
                how_to_care: {
                    
                }
            };

            $('.plant-description .grid:first .plant-detailed-description > ul > li').each(function(){
                var cat = $(this).find('p strong').text().toLowerCase();
                $(this).find('p strong').remove();
                plant.characteristics[ cat ] = $(this).find('p').text().trim();
            });

            $('.colorContainer .plant-colours').each(function(){
                
            });

            $('.grid.sun .sunlight li').each(function(){
                plant.sunlight.sun.push( $(this).find('p').text().trim() );
            });
            $('.grid.sun .plant-detailed-description > ul > li').each(function(){
                var $this = $(this);
                var cat = $this.find('p strong').text().trim().toLowerCase();
                $this.find('p strong').remove();
                plant.sunlight[cat] = $this.find('p').text().trim().split(' or ');
            });

            $('.grid.soil .soil-types li').each(function(){
                plant.soil.types.push( $(this).find('p').text().trim() );
            });
            $('.grid.soil .plant-detailed-description > ul > li').each(function(){
                var $this = $(this);
                var cat = $this.find('p strong').text().trim().toLowerCase();
                $this.find('p strong').remove();
                plant.soil[cat] = $this.find('p').text().trim().split(', ');
            });

            deferred.resolve(plant);
        });
        
    });
    return deferred.promise;
}

function getPlantData ( cid ){
    var deferred = Q.defer();
    request({ uri: url}, function(err, response, json){
        if(err && response.statusCode !== 200){
            deferred.reject( err );
        }
        json = json.replace(');', '');
        json = json.replace('rhscallback( ', '');

        var obj = JSON.parse( json );
        if ( obj && obj.msg && obj.msg.status == '200' && obj.msg.content && obj.msg.content.hits ){
            var plant = obj.msg.content.hits;
            deferred.resolve(plant);
        }
        else{
            deferred.reject( 'could not find plant id: '+ cid );
        }
    });
    return deferred.promise;
};

getPlantDetails( 42527 ).then(function( plant ){
    console.log( plant );
});

