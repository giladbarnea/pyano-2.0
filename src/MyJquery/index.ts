/*
 import * as $ from "jquery";
 
 Object.defineProperties($.prototype, {
 fade : {
 async value(speed, to, callback) {
 if ( skipFade ) {
 console.log('got skipFade = true start of fn, returning');
 return await this.fadeTo(0, to, callback);
 }
 const element = this[0];
 if ( element.tagName == "BUTTON" )
 element.classList.toggle('unclickable', to == 0);
 let prevOpac = element.style.opacity;
 if ( typeof prevOpac != 'number' ) {
 prevOpac = to ? 0 : 1; // opposite
 element.style.opacity = prevOpac;
 if ( element.style.display == 'none' )
 element.style.display = '';
 
 }
 
 const diff = Math.abs(prevOpac - to);
 let step;
 if ( to )
 step = diff / 32;
 else
 step = -diff / 32;
 const everyMs = round(speed / 32);
 for ( let i of range(0, 31) ) {
 if ( skipFade ) {
 console.log('got skipFade = true in loop, returning');
 return await this.fadeTo(0, to, callback);
 }
 element.style.opacity = float(element.style.opacity) + step;
 await asx.wait(everyMs);
 }
 
 
 return await this.fadeTo(0, to, callback);
 }
 },
 deactivate : {
 value() {
 this.toggleClass('inactive-btn', true)
 .toggleClass('active-btn', false);
 }
 },
 activate : {
 value() {
 this.toggleClass('inactive-btn', false)
 .toggleClass('active-btn', true);
 }
 },
 toggle : {
 value(activate) {
 activate ? this.activate() : this.deactivate();
 }
 },
 isActive : {
 value() {
 return this.hasClass('active-btn');
 }
 },
 });
 export default $;
 */
