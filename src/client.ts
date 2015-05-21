/// <reference path="../typings/tsd.d.ts" />

const getmac = require('getmac');

import { UrlOptions } from 'url';
import * as express from 'express';
import * as ip from 'ip';
import * as _ from 'lodash';
import Speaker from './speaker';

type ConfigParam = { ip?: string; port: number; };
type Config = { ip: string; port: number; };

export type InfoResponse = {
    identity: string;
    mac: string;
};

export interface PlayRequest extends UrlOptions {
    href?: string;
}

export default class Client {

    private config: Config;
    private express: express.Express;

    constructor(config: ConfigParam) {
        this.config = _.defaults<ConfigParam, Config>(config, {
            ip: ip.address()
        });
        this.express = express();
        this.getMacAddress(); // Heating cache.
    }

    listen(onStart?: Function): void {
        this.express.get(Client.routes.info, this.onInfo.bind(this));
        this.express.get(Client.routes.play, Client.onPlay.bind(this));
        this.express.get(Client.routes.stop, Client.onStop.bind(this));
        this.express.listen(this.config.port, this.config.ip, onStart);
    }

    protected onInfo(req: express.Request, res: express.Response): void {
        this.getMacAddress().then((macAddress) => {
            res.json(<InfoResponse>{
                identity: Client.identity,
                mac: macAddress
            });
        });
    }

    protected static onPlay(req: express.Request, res: express.Response): void {
        let query: PlayRequest = req.query;
        Speaker.on(query.href || query);
        res.end();
    }

    protected static onStop(req: express.Request, res: express.Response): void {
        Speaker.off();
        res.end();
    }

    private macAddress: string;

    private getMacAddress(): Promise<string> {
        if(this.macAddress) {
            return new Promise<string>((resolve) => resolve(this.macAddress));
        }

        return new Promise<string>((resolve, reject) => {
            getmac.getMac((err: Error, macAddress: string) => {
                if(err) {
                    reject();
                    throw err;
                }
                this.macAddress = macAddress;
                resolve(macAddress);
            });
        });
    }

    static isInfoResponse(data: InfoResponse|any): boolean {
        if(typeof data !== 'object') return false;
        return typeof data.identity === 'string' && typeof data.mac === 'string';
    }

    static identity = 'airsound';

    static routes = {
        info: '/info',
        play: '/play',
        stop: '/stop'
    };
}
