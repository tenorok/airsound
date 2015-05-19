/// <reference path="../typings/tsd.d.ts" />

import * as express from 'express';
import * as ip from 'ip';
import * as _ from 'lodash';

type ConfigParam = { ip?: string; port: number; };
type Config = { ip: string; port: number; };

export default class Client {

    private config: Config;

    constructor(config: ConfigParam) {
        this.config = _.defaults<ConfigParam, Config>(config, {
            ip: ip.address()
        });
    }

    static routes = {
        info: '/info',
        play: '/play',
        stop: '/stop'
    }
}
