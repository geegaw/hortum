"use strict";

var ES = require("./es");

var index = "hortum";
var type = "plant";
var es = new ES({index: index});

var testPlant = getTestPlant();

//es.index(type, testPlant._id, testPlant).then(console.log).catch(console.error);

var aggs = getAggs(testPlant);

es.client.search({
    type: type,
    body: {
        aggs: aggs,
    },
}).then(function(body){
    for (var key in body.aggregations){
        console.log("");
        console.log(key);
        console.log(body.aggregations[key]);
    }
}).catch(console.warn);

function getAggs(){
    var aggs = {};
    var fields = [
        "color.colors",
        "family",
        "sunlight.sun",
        "sunlight.exposure",
        "characteristics.foliage",
        "characteristics.habit",
        "characteristics.hardiness",
        "soil.types",
        "soil.moisture",
        "soil.ph",
        "size.height",
        "size.spread",
        "size.peakTime",
    ];

    for (var i =0; i < fields.length; i++){
        var key = fields[i];
        aggs[key] = { 
            terms: {
                field: key,
                order : { 
                    "_count" : "asc",
                },
            },
        };
    }
    aggs.images = {
        cardinality: {
            field: "images.rhs",
        },
    };
    return aggs;
}

function getTestPlant(){
    return {
    "ids": {
        "rhs": {
            "id": 1473,
        },
    },
    "urls": {
        "rhs": "http://www.rhs.org.uk/Plants/1473/please-give-me-an-api/Details",
    },
    "title": "Arbutus unedo",
    "names": [
        "strawberry tree",
        "cane apple",
        "Dalmatian strawberry",
        "Killarney strawberry tree",
    ],
    "family": "Ericaceae",
    "genus": "Arbutus are evergreen trees and shrubs with small, bell-shaped creamy-white or pink flowers, and red, strawberry-like fruits in autumn",
    "description": "A. unedo is a large evergreen shrub of bushy habit, with rough brown bark and dark green leathery leaves. Flowers urn-shaped, white, appearing as the strawberry-like red fruits, from the previous years flowers, ripen",
    "characteristics": {
        "foliage": "Evergreen",
        "habit": "Bushy",
        "hardiness": "H5",
    },
    "color": {
        "colors": [
            "green",
            "red",
            "white",
        ],
        "seasons": {
            "autumn": [
                "green",
                "red",
                "white",
            ],
            "spring": [
                "green",
            ],
            "summer": [
                "green",
            ],
            "winter": [
                "green",
            ],
        },
        "types": {
            "foliage": [
                "green",
                "green",
                "green",
                "green",
            ],
            "fruit": [
                "red",
            ],
            "flower": [
                "white",
            ],
        },
    },
    "sunlight": {
        "sun": [
            "full sun",
        ],
        "aspect": [
            "north-facing",
            "east-facing",
            "south-facing",
            "west-facing",
        ],
        "exposure": [
            "sheltered",
        ],
    },
    "soil": {
        "types": [
            "Loam",
            "Clay",
            "Sand",
        ],
        "moisture": [
            "well-drained",
            "moist but well-drained",
        ],
        "soil": [
            "loam",
            "clay",
            "sand",
        ],
        "ph": [
            "acid",
            "neutral",
        ],
    },
    "size": {
        "height": "4-8 metres",
        "spread": "4-8 metres",
        "peakTime": "20-50 years",
    },
    "howTo": {
        "grow": {
            "cultivation": "Grow in well-drained soil. Young plants are more frost-tender than mature plants",
            "propagation": "<a href=\"http://www.rhs.org.uk/advicesearch/Profile.aspx?pid=433\">Propagate by seed</a> and <a href=\"http://www.rhs.org.uk/advicesearch/Profile.aspx?pid=404\">semi-hardwood</a> cuttings",
            "suggested planting locations and garden types": "Low Maintenance\r\n                        Coastal  Patio & Container Plants",
        },
        "care": {
            "pruning": "<a href=\"http://www.rhs.org.uk/advicesearch/Profile.aspx?pid=549\">Pruning group 1</a>",
            "pests": "Can get <a href=\"http://www.rhs.org.uk/advicesearch/Profile.aspx?pid=181\">aphids</a>",
            "diseases": "<a href=\"http://www.rhs.org.uk/advicesearch/Profile.aspx?pid=754\">Arbutus leaf spot</a> may be a problem",
        },
    },
    "images": {
        "rhs": "https://apps.rhs.org.uk/plantselectorimages/detail/RHS_PUB0007929_158.JPG",
    },
    "_id": "56858ab0b52d6c524dd176e3",
    "rhs": {
        "md5": "b326b5062b2f0e69046810717534cb09",
    },
};
}
