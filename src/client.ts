/// <reference path="../typings/tsd.d.ts" />

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
    }

    run(): void {
        this.express.get(Client.routes.info, Client.onInfo);
        this.express.get(Client.routes.play, Client.onPlay);
        this.express.get(Client.routes.stop, Client.onStop);
        this.express.listen(this.config.port, this.config.ip);
    }

    static identity = 'airsound';

    static routes = {
        info: '/info',
        play: '/play',
        stop: '/stop'
    };

    protected static onInfo(req: express.Request, res: express.Response): void {
        res.json({
            identity: Client.identity
        });
    }

    protected static onPlay(req: express.Request, res: express.Response): void {}

    protected static onStop(req: express.Request, res: express.Response): void {}
}
