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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBa0VHIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiBpbXBvcnQgKiBhcyAkIGZyb20gXCJqcXVlcnlcIjtcbiBcbiBPYmplY3QuZGVmaW5lUHJvcGVydGllcygkLnByb3RvdHlwZSwge1xuIGZhZGUgOiB7XG4gYXN5bmMgdmFsdWUoc3BlZWQsIHRvLCBjYWxsYmFjaykge1xuIGlmICggc2tpcEZhZGUgKSB7XG4gY29uc29sZS5sb2coJ2dvdCBza2lwRmFkZSA9IHRydWUgc3RhcnQgb2YgZm4sIHJldHVybmluZycpO1xuIHJldHVybiBhd2FpdCB0aGlzLmZhZGVUbygwLCB0bywgY2FsbGJhY2spO1xuIH1cbiBjb25zdCBlbGVtZW50ID0gdGhpc1swXTtcbiBpZiAoIGVsZW1lbnQudGFnTmFtZSA9PSBcIkJVVFRPTlwiIClcbiBlbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoJ3VuY2xpY2thYmxlJywgdG8gPT0gMCk7XG4gbGV0IHByZXZPcGFjID0gZWxlbWVudC5zdHlsZS5vcGFjaXR5O1xuIGlmICggdHlwZW9mIHByZXZPcGFjICE9ICdudW1iZXInICkge1xuIHByZXZPcGFjID0gdG8gPyAwIDogMTsgLy8gb3Bwb3NpdGVcbiBlbGVtZW50LnN0eWxlLm9wYWNpdHkgPSBwcmV2T3BhYztcbiBpZiAoIGVsZW1lbnQuc3R5bGUuZGlzcGxheSA9PSAnbm9uZScgKVxuIGVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICcnO1xuIFxuIH1cbiBcbiBjb25zdCBkaWZmID0gTWF0aC5hYnMocHJldk9wYWMgLSB0byk7XG4gbGV0IHN0ZXA7XG4gaWYgKCB0byApXG4gc3RlcCA9IGRpZmYgLyAzMjtcbiBlbHNlXG4gc3RlcCA9IC1kaWZmIC8gMzI7XG4gY29uc3QgZXZlcnlNcyA9IHJvdW5kKHNwZWVkIC8gMzIpO1xuIGZvciAoIGxldCBpIG9mIHJhbmdlKDAsIDMxKSApIHtcbiBpZiAoIHNraXBGYWRlICkge1xuIGNvbnNvbGUubG9nKCdnb3Qgc2tpcEZhZGUgPSB0cnVlIGluIGxvb3AsIHJldHVybmluZycpO1xuIHJldHVybiBhd2FpdCB0aGlzLmZhZGVUbygwLCB0bywgY2FsbGJhY2spO1xuIH1cbiBlbGVtZW50LnN0eWxlLm9wYWNpdHkgPSBmbG9hdChlbGVtZW50LnN0eWxlLm9wYWNpdHkpICsgc3RlcDtcbiBhd2FpdCBhc3gud2FpdChldmVyeU1zKTtcbiB9XG4gXG4gXG4gcmV0dXJuIGF3YWl0IHRoaXMuZmFkZVRvKDAsIHRvLCBjYWxsYmFjayk7XG4gfVxuIH0sXG4gZGVhY3RpdmF0ZSA6IHtcbiB2YWx1ZSgpIHtcbiB0aGlzLnRvZ2dsZUNsYXNzKCdpbmFjdGl2ZS1idG4nLCB0cnVlKVxuIC50b2dnbGVDbGFzcygnYWN0aXZlLWJ0bicsIGZhbHNlKTtcbiB9XG4gfSxcbiBhY3RpdmF0ZSA6IHtcbiB2YWx1ZSgpIHtcbiB0aGlzLnRvZ2dsZUNsYXNzKCdpbmFjdGl2ZS1idG4nLCBmYWxzZSlcbiAudG9nZ2xlQ2xhc3MoJ2FjdGl2ZS1idG4nLCB0cnVlKTtcbiB9XG4gfSxcbiB0b2dnbGUgOiB7XG4gdmFsdWUoYWN0aXZhdGUpIHtcbiBhY3RpdmF0ZSA/IHRoaXMuYWN0aXZhdGUoKSA6IHRoaXMuZGVhY3RpdmF0ZSgpO1xuIH1cbiB9LFxuIGlzQWN0aXZlIDoge1xuIHZhbHVlKCkge1xuIHJldHVybiB0aGlzLmhhc0NsYXNzKCdhY3RpdmUtYnRuJyk7XG4gfVxuIH0sXG4gfSk7XG4gZXhwb3J0IGRlZmF1bHQgJDtcbiAqL1xuIl19