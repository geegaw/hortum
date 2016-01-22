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

        return self.client.index({
            index: _index,
            type: type,
            id: id,
            body: body,
        });
    }

    del(type, id, _index){
        var self = this;
        _index = _index || this._index;

        return self.client.delete({
            index: _index,
            type: type,
            id: id,
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
