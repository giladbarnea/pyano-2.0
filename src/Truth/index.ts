import * as path from "path";
import * as fs from 'fs'
import { bool } from "../util";
import myfs from '../MyFs'

/**An object wrapping an abs path with extension.*/
class File {
    
    /**The abs path WITH extension*/
    private _absPath: string;
    // /**The abs path WITHOUT extension.*/
    // private pathNoExt: string;
    
    
    constructor(absPathWithExt: string) {
        if ( !bool(path.extname(absPathWithExt)) ) {
            throw new Error(`File constructor: passed 'absPathWithExt' is extensionless: ${absPathWithExt}`);
        }
        if ( !path.isAbsolute(absPathWithExt) ) {
            throw new Error(`File constructor: passed 'absPathWithExt' NOT absolute: ${absPathWithExt}`);
        }
        
        this._absPath = absPathWithExt;
        
        // this.pathNoExt = myfs.remove_ext(absPathWithExt);
        
        
    }
    
    get absPath(): string {
        return this._absPath;
    }
    
    /**Sets this._absPath and also RENAMES the actual file.*/
    set absPath(absPathWithExt: string) {
        if ( !bool(path.extname(absPathWithExt)) ) {
            throw new Error(`File constructor: passed 'absPathWithExt' is extensionless: ${absPathWithExt}`);
        }
        if ( !path.isAbsolute(absPathWithExt) ) {
            throw new Error(`File constructor: passed 'absPathWithExt' NOT absolute: ${absPathWithExt}`);
        }
        this._absPath = absPathWithExt;
        fs.renameSync(this._absPath, absPathWithExt);
    }
    
    /*toString() {
     return this.path;
     }*/
    /**@deprecated*/
    renameByOtherFile(other: File) {
        console.warn('called renameByOtherFile(), use set absPath instead');
        this.absPath = other.absPath;
    }
    
    renameByCTime() {
        const stats = fs.lstatSync(this.absPath);
        // @ts-ignore
        const datestr = stats.ctime.human();
        const newPath = myfs.push_before_ext(this.absPath, `__CREATED_${datestr}`);
        console.log('renameByCTime() to: ', newPath);
        this.absPath = newPath;
    }
    
    
    async getBitrateAndHeight(): Promise<[ string, string ]> {
        if ( !this._absPath.endsWith('mp4') && !this._absPath.endsWith('mov') ) {
            console.warn(`File: "${this._absPath}" isn't "mp4" or "mov"`);
            return undefined
        }
        const { execSync } = require('child_process');
        const ffprobeCmd = `ffprobe -v quiet -print_format json -show_streams -show_format`;
        const probe = JSON.parse(execSync(`${ffprobeCmd} "${this._absPath}"`, { encoding : 'utf8' }));
        const { bit_rate, height } = probe.streams.find(s => s["codec_type"] === "video");
        return [ bit_rate, height ];
    }
    
    
    exists(): boolean {
        return fs.existsSync(this._absPath);
    }
    
    remove() {
        fs.unlinkSync(this._absPath);
    }
    
    size(): number {
        let { size } = fs.lstatSync(this._absPath);
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
    
    constructor(nameNoExt: string) {
        const absPath = path.join(TRUTHS_PATH_ABS, nameNoExt);
        this.base = new File(`${absPath}.txt`);
        this.on = new File(`${absPath}_on.txt`);
        this.off = new File(`${absPath}_off.txt`);
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
        // console.warn('renameByOtherTxt: didnt set new this base / on / off');
        this.base.absPath = other.base.absPath;
        this.on.absPath = other.on.absPath;
        this.off.absPath = other.off.absPath;
        // fs.renameSync(this.base.path, other.base.path);
        // fs.renameSync(this.on.path, other.on.path);
        // fs.renameSync(this.off.path, other.off.path);
        
    }
}

export class Truth {
    // /**The absolute path without extension.*/
    // private readonly pathNoExt: string;
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
    
    constructor(nameNoExt: string) {
        let [ name, ext ] = myfs.split_ext(nameNoExt);
        
        if ( bool(ext) ) {
            console.warn(`Truth ctor, passed name is not extensionless: ${nameNoExt}. Continuing with "${name}"`);
            // nameNoExt = myfs.remove_ext(nameNoExt);
        }
        if ( name.endsWith('off') || name.endsWith('on') ) {
            // TODO: THIS IS BUGGY
            // let noExt = myfs.remove_ext(name);
            // @ts-ignore
            name = `${name.upTo('_', true)}`;
            console.warn(`Passed path of "_on" or "_off" file and not base. Using name: "${name}"`);
            
        }
        
        
        this.name = name;
        
        this.txt = new Txt(name);
        
        const absPath = path.join(TRUTHS_PATH_ABS, name);
        this.midi = new File(`${absPath}.mid`);
        this.mp4 = new File(`${absPath}.mp4`);
        this.mov = new File(`${absPath}.mov`);
        this.onsets = new File(`${absPath}_onsets.json`);
        
    }
    
    /**Counts the number of non-empty lines in the txt on path file.*/
    numOfNotes(): number {
        if ( !this.txt.on.exists() ) {
            console.warn(`this.txt.on (${this.txt.on.absPath}) does not exist, returning undefined`);
            return undefined
        }
        const strings = fs
            .readFileSync(this.txt.on.absPath, { encoding : 'utf8' })
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
