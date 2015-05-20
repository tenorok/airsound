/// <reference path="../typings/tsd.d.ts" />

const getmac = require('getmac');

import * as express from 'express';
import * as ip from 'ip';
import * as _ from 'lodash';

type ConfigParam = { ip?: string; port: number; };
type Config = { ip: string; port: number; };

export default class Client {

    private config: Config;
    private express: express.Express;

    constructor(config: ConfigParam) {
        this.config = _.defaults<ConfigParam, Config>(config, {
            ip: ip.address()
        });
        this.express = express();
        this.getMacAddress(); // Heating.
    }

    run(): void {
        this.express.get(Client.routes.info, this.onInfo.bind(this));
        this.express.get(Client.routes.play, this.onPlay.bind(this));
        this.express.get(Client.routes.stop, this.onStop.bind(this));
        this.express.listen(this.config.port, this.config.ip);
    }

    protected onInfo(req: express.Request, res: express.Response): void {
        this.getMacAddress().then((macAddress) => {
            res.json({
                identity: Client.identity,
                mac: macAddress
            });
        });
    }

    protected onPlay(req: express.Request, res: express.Response): void {}

    protected onStop(req: express.Request, res: express.Response): void {}

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

    static identity = 'airsound';

    static routes = {
        info: '/info',
        play: '/play',
        stop: '/stop'
    };
}
