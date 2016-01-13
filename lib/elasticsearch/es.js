"use strict";

var elasticsearch = require("elasticsearch");

class ES{

    constructor(options){

        this._index = options.index || "hortum";
        this._host = options.host || "localhost:9200",
        this.log = options.log || null;

        var connectArgs = {
            host: this._host,
        };

        if (this.log){
            connectArgs.log = this.log;
        }

        this.client = new elasticsearch.Client(connectArgs);
    }

    index(type, id, body, _index){
        var self = this;
        _index = _index || this._index;

        return self.client.create({
            index: _index,
            type: type,
            id: id,
            body: body,
        });
    }

    search(args){
        args.index = args.index || this._index;
        return this.client.search(args);
    }

    close(){
        this.client.close();
    }
}

module.exports = ES;
