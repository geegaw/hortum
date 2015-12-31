"use strict";

class Plant{

    constructor(){
        this.ids = {
            rhs: {
                id: "",
                cid: "",
            },
           };
        this.urls = {
            rhs: "",
        };
        this.title = "";
        this.names = [];
        this.family = "";
        this.genusInfo = "";
        this.description = "";
        this.characteristics = {};
        this.colorInfo = {};
        this.sunlightInfo = {};
        this.soilInfo = {};
        this.size = {
            height: "",
            spread: "",
            peakTime: "",
        };
        this.howTo = {};
        this.images = {
            rhs: null,
        };
    }
}
module.exports = Plant;
