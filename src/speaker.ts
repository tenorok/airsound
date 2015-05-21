/// <reference path="../typings/tsd.d.ts" />

const lame = require('lame');
const icecast = require('icecast');
const Speak = require('speaker');

import { UrlOptions } from 'url';

export default class Speaker {

    private static icecastClient = null;
    private static decoder = null;
    private static speak = null;

    static on(options: string | UrlOptions): void {
        if(this.icecastClient) {
            this.off();
        }

        this.decoder = new lame.Decoder();
        this.speak = new Speak();

        this.icecastClient = icecast.get(options, (res) => {
            res
                .pipe(this.decoder)
                .pipe(this.speak);
        });
    }

    static off(): void {
        if(!this.icecastClient) return;

        this.icecastClient.abort();
        this.icecastClient = null;
        this.speak.end();
        this.decoder.end();
    }
}
