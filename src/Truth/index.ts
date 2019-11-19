import * as path from "path";
import * as fs from 'fs'
import myfs from '../MyFs'
import { bool } from "../util";

/**An object wrapping a path with extension. Can be absolute or base.
 * ``toString()`` returns ``this.path``.
 * ``name`` property exists only if wrapping an absolute path.*/
class File {
    /**The path including extension. Can be either absolute or a file name.*/
    readonly path: string;
    /**The path without extension. Can be either absolute or a file name.*/
    private pathNoExt: string;
    /**If exists, a File object of the basename.*/
    readonly name: File;
    
    constructor(pathWithExt: string) {
        if ( !bool(path.extname(pathWithExt)) ) {
            throw new Error(`File constructor: passed 'pathWithExt' is extensionless: ${pathWithExt}`);
        }
        
        this.path = pathWithExt;
        
        this.pathNoExt = myfs.remove_ext(this.path);
        if ( path.isAbsolute(this.path) )
            
            this.name = new File(path.basename(this.path));
        
    }
    
    toString() {
        return this.path;
    }
    
    renameByOtherFile(other: File) {
        console.warn('renameByOtherFile not setting new this.path');
        fs.renameSync(this.path, other.path);
    }
    
    renameByCTime() {
        console.warn('renameByCTime not setting new this.path');
        const stats = fs.lstatSync(this.path);
        // @ts-ignore
        const datestr = stats.ctime.human();
        const newPath = myfs.push_before_ext(this.path, `__CREATED_${datestr}`);
        console.log('renameByCTime() to: ', newPath);
        fs.renameSync(this.path, newPath);
    }
    
    
    async getBitrateAndHeight(): Promise<[ string, string ]> {
        if ( !this.path.endsWith('mp4') && !this.path.endsWith('mov') ) {
            console.warn(`File: "${this.path}" isn't "mp4" or "mov"`);
            return undefined
        }
        const { execSync } = require('child_process');
        const ffprobeCmd = `ffprobe -v quiet -print_format json -show_streams -show_format`;
        const probe = JSON.parse(execSync(`${ffprobeCmd} "${this.path}"`, { encoding : 'utf8' }));
        const { bit_rate, height } = probe.streams.find(s => s["codec_type"] === "video");
        return [ bit_rate, height ];
    }
    
    
    exists(): boolean {
        return fs.existsSync(this.path);
    }
    
    remove() {
        fs.unlinkSync(this.path);
    }
    
    size(): number {
        let { size } = fs.lstatSync(this.path);
        return size;
    }
}

class Txt {
    /**A File object representing the absolute ``*.txt`` path.*/
    readonly base: File;
    /**A File object representing the absolute ``*_on.txt``  path.*/
    readonly on: File;
    /**A File object representing the absolute ``*_off.txt`` path.*/
    readonly off: File;
    
    constructor(pathNoExt: string) {
        this.base = new File(`${pathNoExt}.txt`);
        this.on = new File(`${pathNoExt}_on.txt`);
        this.off = new File(`${pathNoExt}_off.txt`);
    }
    
    getAll(): [ File, File, File ] {
        return [ this.base, this.on, this.off ];
    }
    
    
    getExisting(): [ (File | false), (File | false), (File | false) ] {
        const existing = [];
        existing.push(this.base.exists() ? this.base : false);
        existing.push(this.on.exists() ? this.on : false);
        existing.push(this.off.exists() ? this.off : false);
        
        // @ts-ignore
        return existing;
    }
    
    allExist(): boolean {
        return (
            this.base.exists()
            && this.on.exists()
            && this.off.exists()
        );
    }
    
    anyExist(): boolean {
        return (
            this.base.exists()
            || this.on.exists()
            || this.off.exists()
        );
        
    }
    
    removeAll(): void {
        if ( this.base.exists() )
            this.base.remove();
        if ( this.on.exists() )
            this.on.remove();
        if ( this.off.exists() )
            this.off.remove();
        
    }
    
    renameByOtherTxt(other: Txt): void {
        console.warn('renameByOtherTxt: didnt set new this base / on / off');
        fs.renameSync(this.base.path, other.base.path);
        fs.renameSync(this.on.path, other.on.path);
        fs.renameSync(this.off.path, other.off.path);
        
    }
}

export class Truth {
    /**The absolute path without extension.*/
    private readonly pathNoExt: string;
    /**The basename without extension.*/
    readonly name: string;
    readonly txt: Txt;
    /**A File object of the midi file.*/
    private readonly midi: File;
    /**A File object of the mp4 file.*/
    private readonly mp4: File;
    /**A File object of the mov file.*/
    private readonly mov: File;
    /**A File object of the onsets file.*/
    private readonly onsets: File;
    
    /**An object wrapping an absolute path without extension.*/
    constructor(pathNoExt: string) {
        if ( !path.isAbsolute(pathNoExt) )
            throw new Error(`Passed path is not absolute: ${pathNoExt}`);
        if ( bool(path.extname(pathNoExt)) ) {
            console.warn(`Passed path is not extensionless: ${pathNoExt}. Removing extension`);
            pathNoExt = myfs.remove_ext(pathNoExt);
        }
        if ( pathNoExt.endsWith('off') || pathNoExt.endsWith('on') ) {
            console.warn(`Passed path of "_on" or "_off" file and not base: ${pathNoExt}. Using base`);
            let noExt = myfs.remove_ext(pathNoExt);
            // @ts-ignore
            pathNoExt = `${noExt.upTo('_', true)}${path.extname(pathNoExt)}`;
            
        }
        
        this.pathNoExt = pathNoExt;
        
        this.name = path.basename(this.pathNoExt);
        
        this.txt = new Txt(this.pathNoExt);
        
        
        this.midi = new File(`${this.pathNoExt}.mid`);
        this.mp4 = new File(`${this.pathNoExt}.mp4`);
        this.mov = new File(`${this.pathNoExt}.mov`);
        this.onsets = new File(`${this.pathNoExt}_onsets.json`);
        
    }
    
    /**Counts the number of non-empty lines in the txt on path file.*/
    numOfNotes(): number {
        if ( !this.txt.on.exists() ) {
            console.warn(`this.txt.on (${this.txt.on}) does not exist, returning undefined`);
            return undefined
        }
        const strings = fs
            .readFileSync(this.txt.on.path, { encoding : 'utf8' })
            .split('\n');
        let notes: number = 0;
        for ( let s of strings ) {
            if ( s.includes('\\') ) {
                console.warn(`s includes backslash, ${this.txt.on}`);
            } else if ( bool(s) ) {
                notes++;
            }
            
        }
        return notes;
    }
}
