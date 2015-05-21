/// <reference path="../typings/tsd.d.ts" />

const Evilscan = require('evilscan');

import * as http from 'http';
import Client from './client';

/**
 * Found address.
 */
export type Address = {
    ip: string;
    port: number;
    response: { [key: string]: any };
}

/**
 * Searching the addresses matching the specified criteria in the local network.
 */
export default class Scanner {

    private evilscan;
    private requests: Promise<Address>[] = [];

    /**
     * @see {@link https://npmjs.com/package/evilscan}
     * @param ip Range of IP addresses.
     * @param port Range of ports.
     */
    constructor(private ip: string, private port: string) {
        this.evilscan = new Evilscan({
            target: ip,
            port: port
        })
            .on('result', this.onResult.bind(this))
            .on('error', Scanner.onError);
    }

    /**
     * Start searching.
     */
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

    /**
     * Invoked when was found suitable address.
     *
     * @param host Information about address.
     * @param host.ip Address IP.
     * @param host.port Address port.
     * @param host.status Address status.
     */
    protected onResult(host: { ip: string; port: number; status: string; }): void {
        if(host.status !== 'open') return;

        this.requests.push(new Promise<Address>((resolve) => {
            http.get({
                hostname: host.ip,
                port: host.port,
                path: Client.routes.info
            }, (res) => {
                res.setEncoding('utf8');
                res.on('data', (data) => {
                    try {
                        var response = JSON.parse(data);
                    } catch(err) {
                        resolve();
                    }

                    Client.isInfoResponse(response)
                        ? resolve(<Address>{
                            ip: host.ip,
                            port: host.port,
                            response: response
                        })
                        : resolve();
                });
            }).on('error', (err: Error) => {
                resolve();
                throw err;
            });
        }));
    }

    /**
     * Invoked when occurred error.
     *
     * @param data Error information.
     * @param data.fnc Name of function that was failed.
     * @param data.err Error
     */
    protected static onError(data: { fnc: string; err: Error; }): void {
        throw new Error(data.fnc + ': ' + data.err.toString());
    }
}
