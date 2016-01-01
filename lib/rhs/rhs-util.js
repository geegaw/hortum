"use strict";

var _ = require("underscore");
var request = require("request");
var cheerio = require("cheerio");

class RHSUtil{

    constructor(){
        this.TIMEOUT = 4500;

        this.endpoints = {
            detail: "http://www.rhs.org.uk/Plants/{id}/please-give-me-an-api/Details",
            facets: "http://www.rhs.org.uk/PlantSearchHandler.axd?isPlantDetails=true&c={cid}&callback=rhscallback",
        };
    }

    getCid( id ){
        var self = this;
        var url = self.endpoints.detail.replace("{id}", id);

        return new Promise(function(resolve, reject){
            request({uri: url, timeout: self.TIMEOUT}, function(err, response, html){
                if(err && response.statusCode !== 200){
                    reject( err );
                }

                var $ = cheerio.load( html );
                var cid = $("#searchContext").last().val();

                resolve( cid );
            });
        });
    }

    getPlantDetails(id){
        var self = this;
        var url = self.endpoints.detail.replace("{id}", id);

        return new Promise(function(resolve, reject){
            request({uri: url, timeout:self.TIMEOUT}, function(err, response, html){
                if(err){
                    console.log(err);
                    reject( err );
                    return;
                }

                html = self.cleanHtml( html );
                var $ = cheerio.load( html );
                var title = $("h1").text().trim();
                var cid = $(".searchContext").last().val();

                $("li.rhs_genus_description p strong").remove();
                $("li.rhs_description p strong").remove();

                if (!title.length){
                    resolve(null);
                    return;
                }

                self.getPlantFacets(cid).then(function(plantFacets){
                    var plant = {
                        ids: {
                            rhs: {
                                id: id,
                                cid: cid,
                            },
                        },
                        urls: {
                            rhs: url,
                        },
                        title: title,
                        names: self.getCommonNames($),
                        family: $("li.rhs_genus_description").first().find("p").text().trim(),
                        genus: $("li.rhs_genus_description").last().find("p").text().trim(),
                        description: $("li.rhs_description p").text().trim(),
                        characteristics: self.getCharacteristics($),
                        color: self.getColor(plantFacets),
                        sunlight: self.getSunlight($),
                        soil: self.getSoil($),
                        size: {
                            height: $(".grid.size .results-size .ultimate-height p").text().trim(),
                            spread: $(".grid.size .results-size .ultimate-spread p").text().trim(),
                            peakTime: $(".grid.size .results-size .time-to-ultimate-height p").text().trim(),
                        },
                        howTo: self.getHowTo($),
                        images: {
                            rhs: self.getImage($),
                        },
                    };
                    resolve(plant);
               });
            });
        });
    }

    cleanHtml( html ){
        var clean = html
            .replace(/id="searchContext"/g, "class=\"searchContext\"" )
            .replace(/data-facettype="common_name"/g, "class=\"rhs_common_name\"")
            .replace(/data-facettype="genus_description"/g, "class=\"rhs_genus_description\"")
            .replace(/data-facettype="description"/g, "class=\"rhs_description\"");
        return clean;
    }

    getCommonNames( $ ){
        var names = [];
        $(".rhs_common_name").each(function(){
            $(this).find("strong").remove();
            names.push( $(this).find("p").text().trim() );
        });
        return names;
    }

    getCharacteristics($){
        var characteristics = {};
        $(".plant-description .grid").first().find(".plant-detailed-description > ul > li").each(function(){
            var cat = $(this).find("p strong").text().toLowerCase();
            $(this).find("p strong").remove();
            $(this).find("div").remove();
            characteristics[ cat ] = $(this).find("p").text().trim();
        });
        return characteristics;
    }

    getPlantFacets( cid ){
        var self = this;
        var url = self.endpoints.facets.replace( "{cid}", cid );
        return new Promise(function(resolve, reject){
            request({ uri: url, timeout:4500}, function(err, response, json){
                if (err){
                    console.log( err );
                    reject( err );
                    return;
                }
                else if(response.statusCode !== 200){
                    reject( "unkown" );
                    return;
                }
                json = json.replace(");", "");
                json = json.replace("rhscallback( ", "");

                var obj = JSON.parse( json );
                if ( obj && obj.msg && obj.msg.status === "200" && obj.msg.content && obj.msg.content.hits ){
                    var plant = obj.msg.content.hits;
                    resolve(plant);
                }
                else{
                    reject( "could not find plant id: "+ cid );
                }
            });
        });
    }

    getColor(data){
        var plantColor = {
            colors: [],
            seasons: {},
            types: {},
           };

        for ( var i=0; i < data.length; i++ ){
            var piece = data[i];
            if ( piece.id === "plant_colour_by_season" ){
                var colorInfo = piece.categories;
                for( var j = 0; j < colorInfo.length; j++ ){
                    var colorSeason = colorInfo[j];
                    var season = colorSeason.title.toLowerCase();
                    plantColor.seasons[ season ] = [];
                    for( var k = 0; k < colorSeason.categories.length; k++ ){
                        var colorData = colorSeason.categories[k];
                        var color = colorData.title.toLowerCase();
                        if ( color !== "any" ){
                            plantColor.seasons[ season ].push(color);
                            plantColor.colors.push(color);
                            for ( var m = 0; m < colorData.categories.length; m++ ){
                                var typeInfo = colorData.categories[m];
                                var type = typeInfo.title;
                                plantColor.types[ type ] = plantColor.types[ type ] || [];
                                plantColor.types[ type ].push(color);
                            }
                        }
                    }
                }
            }
        }

        plantColor.colors = _.uniq(plantColor.colors);
        return plantColor;
    }

    getSunlight($){
        var sunlight = {
            sun: [],
       };
       $(".grid.sun .sunlight li").each(function(){
            sunlight.sun.push( $(this).find("p").text().toLowerCase().trim() );
        });
        $(".grid.sun .plant-detailed-description > ul > li").each(function(){
            var $this = $(this);
            var cat = $this.find("p strong").text().trim().toLowerCase();
            $this.find("p strong").remove();
            sunlight[cat] = $this.find("p").text().toLowerCase().trim().split(" or ");
        });
       return sunlight;
    }

    getSoil($){
        var soil = {
            types: [],
           };

        $(".grid.soil .soil-types li").each(function(){
            soil.types.push( $(this).find("p").text().trim() );
        });
        $(".grid.soil .plant-detailed-description > ul > li").each(function(){
            var $this = $(this);
            var cat = $this.find("p strong").text().trim().toLowerCase();
            $this.find("p strong").remove();
            soil[cat] = $this.find("p").text().trim().toLowerCase().split(", ");
        });
        return soil;
    }

    getHowTo($){
        var howTo = {};

        $(".how-to").each(function(){
            var cat = $(this).find("h4").text().toLowerCase().replace("how to ", "").trim();
            howTo[ cat ] = {};
            $(this).find("p").each(function(){
                var $this = $(this);
                var type = $this.find("strong").text().toLowerCase().trim();
                $this.find("strong").remove();
                howTo[ cat ][ type ] = $this.html().trim();
            });
        });

        return howTo;
    }

    getImage($){
        if ( $(".plant-image").length && $(".plant-image img").length && $(".plant-image img").attr("src").trim().length  ){
            return $(".plant-image img").attr("src").trim();
        }
        return null;
    }
}

module.exports = RHSUtil;
