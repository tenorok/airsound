/// <reference path="../typings/tsd.d.ts" />

const Evilscan = require('evilscan');

import * as http from 'http';

export type Address = {
    ip: string;
    port: number;
    response: { [key: string]: any };
}

export default class Scanner {

    private evilscan;
    private requests: Promise<Address>[] = [];

    constructor(private ip: string, private port: string, private query: { path: string; resProps: string[] }) {
        this.evilscan = new Evilscan({
            target: ip,
            port: port
        })
            .on('result', this.onResult.bind(this))
            .on('error', Scanner.onError);
    }

    scan(): Promise<Address[]> {
        this.evilscan.run();
        return new Promise<Address[]>((resolve) => {
            this.evilscan.on('done', () => {
                Promise.all(this.requests).then((addresses: Address[]) => {
                    resolve(addresses.filter(address => !!address));
                });
            });
        });
    }

    protected onResult(host: { ip: string; port: number; status: string; }): void {
        if(host.status !== 'open') return;

        this.requests.push(new Promise<Address>((resolve) => {
            http.get({
                hostname: host.ip,
                port: host.port,
                path: this.query.path
            }, (res) => {
                res.setEncoding('utf8');
                res.on('data', (data) => {
                    let response = JSON.parse(data),
                        isValidResponse = this.query.resProps.every((prop) => { return !!response[prop] });

                    isValidResponse
                        ? resolve({
                            ip: host.ip,
                            port: host.port,
                            response: response
                        })
                        : resolve();
                });
            }).on('error', (err: Error) => {
                resolve();
                throw new Error(err.message);
            });
        }));
    }

    protected static onError(data: { fnc: string; err: Error; }): void {
        throw new Error(data.fnc + ': ' + data.err.toString());
    }
}
