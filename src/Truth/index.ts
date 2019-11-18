import * as path from "path";
import * as fs from 'fs'
import myfs from '../MyFs'
import asx from '../asx'
import { str } from "../str";
import { date } from "../MyDate";

/**An object wrapping a path with extension. Can be absolute or base.
 * ``toString()`` returns ``this.path``.
 * ``name`` property exists only if wrapping an absolute path.*/
class File {
    /**The path including extension. Can be either absolute or a file name.*/
    readonly path: string;
    /**The path without extension. Can be either absolute or a file name.*/
    private pathNoExt: string;
    /**If exists, a File object of the basename.*/
    private name: File;
    
    constructor(pathWithExt) {
        if ( !bool(path.extname(pathWithExt)) )
            throw new Error(`File constructor: passed 'pathWithExt' is extensionless: ${pathWithExt}`);
        
        this.path = pathWithExt;
        
        this.pathNoExt = myfs.remove_ext(this.path);
        if ( path.isAbsolute(this.path) )
            
            this.name = new File(path.basename(this.path));
        
    }
    
    toString() {
        return this.path;
    }
    
    async renameByOtherFile(other: File) {
        const fs = require("fs");
        await fs.renameSync(this.path, other.path);
    }
    
    async renameByCTime() {
        
        const stats = fs.lstatSync(this.path);
        const datestr = date(stats.ctime).human();
        const newPath = myfs.push_before_ext(this.path, `__CREATED_${datestr}`);
        console.log('renameByCTime() to: ', newPath);
        await fs.renameSync(this.path, newPath);
    }
    
    
    async getBitrateAndHeight(): Promise<[ string, string ]> {
        if ( !this.path.endsWith('mp4') && !this.path.endsWith('mov') ) {
            console.warn(`File: "${this.path}" isn't "mp4" or "mov"`);
            return undefined
        }
        const { execSync } = require('child_process');
        const ffprobeCmd = `ffprobe -v quiet -print_format json -show_streams -show_format`;
        const probe = JSON.parse(await execSync(`${ffprobeCmd} "${this.path}"`, { encoding : 'utf8' }));
        const { bit_rate, height } = probe.streams.find(s => s["codec_type"] == "video");
        return [ bit_rate, height ];
    }
    
    
    async exists(): Promise<boolean> {
        return await myfs.path_exists(this.path);
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
    private readonly base: File;
    /**A File object representing the absolute ``*_on.txt``  path.*/
    readonly on: File;
    /**A File object representing the absolute ``*_off.txt`` path.*/
    private readonly off: File;
    
    constructor(pathNoExt: string) {
        this.base = new File(`${pathNoExt}.txt`);
        this.on = new File(`${pathNoExt}_on.txt`);
        this.off = new File(`${pathNoExt}_off.txt`);
    }
    
    getAll(): [ File, File, File ] {
        return [ this.base, this.on, this.off ];
    }
    
    
    async getMissing(): Promise<File[]> {
        let missing = [];
        if ( !(await this.base.exists()) )
            missing.push(this.base);
        if ( !(await this.on.exists()) )
            missing.push(this.on);
        if ( !(await this.off.exists()) )
            missing.push(this.off);
        
        return missing;
    }
    
    async allExist(): Promise<boolean> {
        return all(await asx.concurrent(
            this.base.exists(),
            this.on.exists(),
            this.off.exists()));
    }
    
    async anyExist(): Promise<boolean> {
        return any(await asx.concurrent(
            this.base.exists(),
            this.on.exists(),
            this.off.exists()));
    }
    
    async removeAll(): Promise<void> {
        if ( await this.base.exists() )
            await this.base.remove();
        if ( await this.on.exists() )
            await this.on.remove();
        if ( await this.off.exists() )
            await this.off.remove();
        
    }
    
    async renameByOtherTxt(other: Txt): Promise<unknown[]> {
        console.warn('renameByOtherTxt: didnt set new this props');
        return await asx.concurrent(
            fs.renameSync(this.base.path, other.base.path),
            fs.renameSync(this.on.path, other.on.path),
            fs.renameSync(this.off.path, other.off.path),
        );
    }
}

class Truth {
    /**The absolute path without extension.*/
    private readonly pathNoExt: string;
    /**The basename without extension.*/
    private readonly name: string;
    private readonly txt: Txt;
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
        if ( bool(path.extname(pathNoExt)) )
            throw new Error(`Passed path is not extensionless: ${pathNoExt}`);
        if ( pathNoExt.endsWith('off') || pathNoExt.endsWith('on') )
            throw new Error(`Passed path of "_on" or "_off" file and not base: ${pathNoExt}`);
        
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
        return fs
            .readFileSync(this.txt.on.path, { encoding : 'utf8' })
            .split('\n')
            .filter(line => bool(line)).length;
    }
}
