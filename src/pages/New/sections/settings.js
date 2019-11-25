"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bhe_1 = require("../../../bhe");
const electron_1 = require("electron");
const util_1 = require("../../../util");
const Glob_1 = require("../../../Glob");
class Input extends bhe_1.Div {
    constructor() {
        super({ cls: 'input' });
        const editable = bhe_1.span({ cls: 'editable' });
        this.attr({ contenteditable: true })
            .cacheAppend({
            editable,
        });
    }
}
class SubjectInput extends Input {
    constructor() {
        super();
        const autocomplete = bhe_1.span({ cls: 'autocomplete', text: 'Subject Id' });
        this
            .attr({ contenteditable: true })
            .on({
            keydown: (ev) => this.doAutocomplete(ev),
            focus: (ev) => {
                console.log('input focus');
                this.sendEnd();
                electron_1.remote.getCurrentWindow().webContents.sendInputEvent({
                    type: "keyDown",
                    keyCode: 'Home',
                    modifiers: ['shift']
                });
            },
        })
            .cacheAppend({
            autocomplete
        });
    }
    reset() {
        this.editable.text('');
        this.autocomplete
            .text('Subject Id')
            .removeAttr('hidden');
        submitButton
            .removeClass('active')
            .addClass('inactive')
            .html('Submit');
    }
    setText(newText) {
        this.autocomplete.attr({ hidden: true });
        this.editable.text(newText);
        submitButton
            .removeClass('inactive')
            .addClass('active')
            .html(newText);
    }
    sendEnd() {
        electron_1.remote.getCurrentWindow().webContents.sendInputEvent({
            type: "keyDown",
            keyCode: 'End',
            modifiers: []
        });
    }
    doAutocomplete(ev) {
        console.log('\ndoAutocomplete', ev);
        if (ev.ctrlKey || ['Backspace', 'Home', 'End', 'Delete'].includes(ev.key) || ev.key.includes('Arrow')) {
            if (ev.key === 'Backspace') {
                console.log(`Backspace, returning. editable text len: ${this.editable.text().length}, autocomplete text len: ${this.autocomplete.text().length}
                activeElement: ${document.activeElement.className}`, ev);
                const oldText = this.editable.text();
                if (oldText.length === 0) {
                    console.warn('oldText.length === 0, preventDefault, "Subject Id" and return');
                    this.reset();
                    return ev.preventDefault();
                }
                const newText = oldText.slice(0, oldText.length - 1);
                if (ev.ctrlKey || !util_1.bool(newText)) {
                    console.warn('!bool(newText) || ctrlKey, editable(""), preventDefault, "Subject Id" and return');
                    this.reset();
                    return ev.preventDefault();
                }
                this.setText(newText);
                this.sendEnd();
            }
            else {
                console.log('Functional, returning', ev);
            }
            return;
        }
        ev.preventDefault();
        if (ev.key === 'Tab') {
            let oldText = this.editable.text();
            if (this.autocomplete.attr('hidden') || !util_1.bool(oldText)) {
                return;
            }
            this.setText(oldText + this.autocomplete.text());
            this.sendEnd();
            return;
        }
        const illegal = /[^(a-z0-9|_)]/;
        if (ev.key.match(illegal)) {
            console.log('Matched [^(a-z0-9|_)], returning', ev);
            return;
        }
        const oldText = this.editable.text().lower().removeAll(illegal);
        let newText;
        if (util_1.bool(oldText))
            newText = oldText.toLowerCase() + ev.key;
        else
            newText = ev.key;
        this.setText(newText);
        const subjectSuggestion = subjects.find(s => s.startsWith(newText));
        this.removeClass('input-missing');
        if (subjectSuggestion) {
            this.autocomplete
                .text(subjectSuggestion.substr(newText.length))
                .removeAttr('hidden');
            console.warn('changed autocomplete');
        }
        else if (this.autocomplete.text()) {
            this.autocomplete.attr({ hidden: true });
            console.warn('hide autocomplete');
        }
        this.sendEnd();
        console.log({ newText, subjectSuggestion, 'this.autocomplete.text()': this.autocomplete.text() });
        console.log('\n');
    }
}
class SettingsDiv extends bhe_1.Div {
    constructor({ id }) {
        super({ id });
        const input = new Input();
        const subtitle = bhe_1.elem({ tag: 'h2', text: 'Settings' });
        this.cacheAppend({ subtitle, input });
    }
}
class SubjectDiv extends bhe_1.Div {
    constructor({ id }) {
        super({ id });
        const input = new SubjectInput();
        const subtitle = bhe_1.elem({ tag: 'h3', text: 'Subject' });
        this.cacheAppend({ subtitle, input });
    }
}
const subjectDiv = new SubjectDiv({ id: 'subject_div' });
const subjects = Glob_1.default.BigConfig.subjects;
const submitButton = bhe_1.button({ cls: 'inactive', html: 'Submit' });
subjectDiv.cacheAppend({ submitButton });
const settingsDiv = new SettingsDiv({ id: 'settings_div' })
    .cacheAppend({ subjectDiv });
exports.default = settingsDiv;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dGluZ3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzZXR0aW5ncy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUtBLHNDQUEwRTtBQUMxRSx1Q0FBa0M7QUFDbEMsd0NBQXFDO0FBQ3JDLHdDQUFpQztBQUVqQyxNQUFNLEtBQU0sU0FBUSxTQUFHO0lBR25CO1FBQ0ksS0FBSyxDQUFDLEVBQUUsR0FBRyxFQUFHLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFDekIsTUFBTSxRQUFRLEdBQUcsVUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFHLFVBQVUsRUFBRSxDQUFDLENBQUM7UUFFNUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLGVBQWUsRUFBRyxJQUFJLEVBQUUsQ0FBQzthQUNoQyxXQUFXLENBQUM7WUFDVCxRQUFRO1NBQ1gsQ0FBQyxDQUFDO0lBQ1gsQ0FBQztDQUdKO0FBRUQsTUFBTSxZQUFhLFNBQVEsS0FBSztJQUk1QjtRQUNJLEtBQUssRUFBRSxDQUFDO1FBQ1IsTUFBTSxZQUFZLEdBQUcsVUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFHLGNBQWMsRUFBRSxJQUFJLEVBQUcsWUFBWSxFQUFFLENBQUMsQ0FBQztRQUV6RSxJQUFJO2FBQ0MsSUFBSSxDQUFDLEVBQUUsZUFBZSxFQUFHLElBQUksRUFBRSxDQUFDO2FBQ2hDLEVBQUUsQ0FBQztZQUNBLE9BQU8sRUFBRyxDQUFDLEVBQWlCLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDO1lBQ3hELEtBQUssRUFBRyxDQUFDLEVBQWMsRUFBRSxFQUFFO2dCQUN2QixPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO2dCQUMzQixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ2YsaUJBQU0sQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUM7b0JBQ2pELElBQUksRUFBRyxTQUFTO29CQUNoQixPQUFPLEVBQUcsTUFBTTtv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RUFBRSxDQUFDLENBQUE7SUFLekMsQ0FBQztDQUdKO0FBRUQsTUFBTSxVQUFXLFNBQVEsU0FBRztJQUt4QixZQUFZLEVBQUUsRUFBRSxFQUFFO1FBQ2QsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUVkLE1BQU0sS0FBSyxHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7UUFDakMsTUFBTSxRQUFRLEdBQUcsVUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFHLElBQUksRUFBRSxJQUFJLEVBQUcsU0FBUyxFQUFFLENBQUMsQ0FBQztRQUN4RCxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUE7SUFDekMsQ0FBQztDQUdKO0FBRUQsTUFBTSxVQUFVLEdBQUcsSUFBSSxVQUFVLENBQUMsRUFBRSxFQUFFLEVBQUcsYUFBYSxFQUFFLENBQUMsQ0FBQztBQUMxRCxNQUFNLFFBQVEsR0FBRyxjQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQztBQUN6QyxNQUFNLFlBQVksR0FBRyxZQUFNLENBQUMsRUFBRSxHQUFHLEVBQUcsVUFBVSxFQUFFLElBQUksRUFBRyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0FBQ25FLFVBQVUsQ0FBQyxXQUFXLENBQUMsRUFBRSxZQUFZLEVBQUUsQ0FBQyxDQUFDO0FBS3pDLE1BQU0sV0FBVyxHQUFHLElBQUksV0FBVyxDQUFDLEVBQUUsRUFBRSxFQUFHLGNBQWMsRUFBRSxDQUFDO0tBQ3ZELFdBQVcsQ0FBQyxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUM7QUFDakMsa0JBQWUsV0FBVyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLy8gKiAgcGFnZXMvTmV3L3NlY3Rpb25zL3NldHRpbmdzXG5cbi8qKlxuICogaW1wb3J0IHNlY3Rpb25zIGZyb20gXCIuL3NlY3Rpb25zXCJcbiAqIHNlY3Rpb25zLnNldHRpbmdzKi9cbmltcG9ydCB7IGRpdiwgZWxlbSwgYnV0dG9uLCBEaXYsIEJ1dHRvbiwgU3Bhbiwgc3BhbiB9IGZyb20gXCIuLi8uLi8uLi9iaGVcIjtcbmltcG9ydCB7IHJlbW90ZSB9IGZyb20gXCJlbGVjdHJvblwiO1xuaW1wb3J0IHsgYm9vbCB9IGZyb20gXCIuLi8uLi8uLi91dGlsXCI7XG5pbXBvcnQgR2xvYiBmcm9tIFwiLi4vLi4vLi4vR2xvYlwiO1xuXG5jbGFzcyBJbnB1dCBleHRlbmRzIERpdiB7XG4gICAgZWRpdGFibGU6IFNwYW47XG4gICAgXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKHsgY2xzIDogJ2lucHV0JyB9KTtcbiAgICAgICAgY29uc3QgZWRpdGFibGUgPSBzcGFuKHsgY2xzIDogJ2VkaXRhYmxlJyB9KTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuYXR0cih7IGNvbnRlbnRlZGl0YWJsZSA6IHRydWUgfSlcbiAgICAgICAgICAgIC5jYWNoZUFwcGVuZCh7XG4gICAgICAgICAgICAgICAgZWRpdGFibGUsXG4gICAgICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgXG59XG5cbmNsYXNzIFN1YmplY3RJbnB1dCBleHRlbmRzIElucHV0IHtcbiAgICBlZGl0YWJsZTogU3BhbjtcbiAgICBhdXRvY29tcGxldGU6IFNwYW47XG4gICAgXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIGNvbnN0IGF1dG9jb21wbGV0ZSA9IHNwYW4oeyBjbHMgOiAnYXV0b2NvbXBsZXRlJywgdGV4dCA6ICdTdWJqZWN0IElkJyB9KTtcbiAgICAgICAgXG4gICAgICAgIHRoaXNcbiAgICAgICAgICAgIC5hdHRyKHsgY29udGVudGVkaXRhYmxlIDogdHJ1ZSB9KVxuICAgICAgICAgICAgLm9uKHtcbiAgICAgICAgICAgICAgICBrZXlkb3duIDogKGV2OiBLZXlib2FyZEV2ZW50KSA9PiB0aGlzLmRvQXV0b2NvbXBsZXRlKGV2KSxcbiAgICAgICAgICAgICAgICBmb2N1cyA6IChldjogRm9jdXNFdmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnaW5wdXQgZm9jdXMnKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZW5kRW5kKCk7XG4gICAgICAgICAgICAgICAgICAgIHJlbW90ZS5nZXRDdXJyZW50V2luZG93KCkud2ViQ29udGVudHMuc2VuZElucHV0RXZlbnQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZSA6IFwia2V5RG93blwiLFxuICAgICAgICAgICAgICAgICAgICAgICAga2V5Q29kZSA6ICdIb21lJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGlmaWVycyA6IFsgJ3NoaWZ0JyBdXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2FjaGVBcHBlbmQoe1xuICAgICAgICAgICAgICAgIGF1dG9jb21wbGV0ZVxuICAgICAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgcmVzZXQoKSB7XG4gICAgICAgIHRoaXMuZWRpdGFibGUudGV4dCgnJyk7XG4gICAgICAgIHRoaXMuYXV0b2NvbXBsZXRlXG4gICAgICAgICAgICAudGV4dCgnU3ViamVjdCBJZCcpXG4gICAgICAgICAgICAucmVtb3ZlQXR0cignaGlkZGVuJyk7XG4gICAgICAgIHN1Ym1pdEJ1dHRvblxuICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdhY3RpdmUnKVxuICAgICAgICAgICAgLmFkZENsYXNzKCdpbmFjdGl2ZScpXG4gICAgICAgICAgICAuaHRtbCgnU3VibWl0JylcbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSBzZXRUZXh0KG5ld1RleHQ6IHN0cmluZykge1xuICAgICAgICB0aGlzLmF1dG9jb21wbGV0ZS5hdHRyKHsgaGlkZGVuIDogdHJ1ZSB9KTtcbiAgICAgICAgdGhpcy5lZGl0YWJsZS50ZXh0KG5ld1RleHQpO1xuICAgICAgICBzdWJtaXRCdXR0b25cbiAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnaW5hY3RpdmUnKVxuICAgICAgICAgICAgLmFkZENsYXNzKCdhY3RpdmUnKVxuICAgICAgICAgICAgLmh0bWwobmV3VGV4dClcbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSBzZW5kRW5kKCkge1xuICAgICAgICByZW1vdGUuZ2V0Q3VycmVudFdpbmRvdygpLndlYkNvbnRlbnRzLnNlbmRJbnB1dEV2ZW50KHtcbiAgICAgICAgICAgIHR5cGUgOiBcImtleURvd25cIixcbiAgICAgICAgICAgIGtleUNvZGUgOiAnRW5kJyxcbiAgICAgICAgICAgIG1vZGlmaWVycyA6IFtdXG4gICAgICAgIH0pXG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgZG9BdXRvY29tcGxldGUoZXY6IEtleWJvYXJkRXZlbnQpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1xcbmRvQXV0b2NvbXBsZXRlJywgZXYpO1xuICAgICAgICBpZiAoIGV2LmN0cmxLZXkgfHwgWyAnQmFja3NwYWNlJywgJ0hvbWUnLCAnRW5kJywgJ0RlbGV0ZScgXS5pbmNsdWRlcyhldi5rZXkpIHx8IGV2LmtleS5pbmNsdWRlcygnQXJyb3cnKSApIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKCBldi5rZXkgPT09ICdCYWNrc3BhY2UnICkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBCYWNrc3BhY2UsIHJldHVybmluZy4gZWRpdGFibGUgdGV4dCBsZW46ICR7dGhpcy5lZGl0YWJsZS50ZXh0KCkubGVuZ3RofSwgYXV0b2NvbXBsZXRlIHRleHQgbGVuOiAke3RoaXMuYXV0b2NvbXBsZXRlLnRleHQoKS5sZW5ndGh9XG4gICAgICAgICAgICAgICAgYWN0aXZlRWxlbWVudDogJHtkb2N1bWVudC5hY3RpdmVFbGVtZW50LmNsYXNzTmFtZX1gLCBldik7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgY29uc3Qgb2xkVGV4dCA9IHRoaXMuZWRpdGFibGUudGV4dCgpO1xuICAgICAgICAgICAgICAgIGlmICggb2xkVGV4dC5sZW5ndGggPT09IDAgKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2Fybignb2xkVGV4dC5sZW5ndGggPT09IDAsIHByZXZlbnREZWZhdWx0LCBcIlN1YmplY3QgSWRcIiBhbmQgcmV0dXJuJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVzZXQoKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IG5ld1RleHQgPSBvbGRUZXh0LnNsaWNlKDAsIG9sZFRleHQubGVuZ3RoIC0gMSk7XG4gICAgICAgICAgICAgICAgaWYgKCBldi5jdHJsS2V5IHx8ICFib29sKG5ld1RleHQpICkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJyFib29sKG5ld1RleHQpIHx8IGN0cmxLZXksIGVkaXRhYmxlKFwiXCIpLCBwcmV2ZW50RGVmYXVsdCwgXCJTdWJqZWN0IElkXCIgYW5kIHJldHVybicpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc2V0KCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnNldFRleHQobmV3VGV4dCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZW5kRW5kKCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9IGVsc2UgeyAvLyBBcnJvdywgYmFyZSBDb250cm9sIGV0Y1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdGdW5jdGlvbmFsLCByZXR1cm5pbmcnLCBldik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGlmICggZXYua2V5ID09PSAnVGFiJyApIHtcbiAgICAgICAgICAgIGxldCBvbGRUZXh0ID0gdGhpcy5lZGl0YWJsZS50ZXh0KCk7XG4gICAgICAgICAgICBpZiAoIHRoaXMuYXV0b2NvbXBsZXRlLmF0dHIoJ2hpZGRlbicpIHx8ICFib29sKG9sZFRleHQpICkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2V0VGV4dChvbGRUZXh0ICsgdGhpcy5hdXRvY29tcGxldGUudGV4dCgpKTtcbiAgICAgICAgICAgIHRoaXMuc2VuZEVuZCgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGlsbGVnYWwgPSAvW14oYS16MC05fF8pXS87XG4gICAgICAgIGlmICggZXYua2V5Lm1hdGNoKGlsbGVnYWwpICkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ01hdGNoZWQgW14oYS16MC05fF8pXSwgcmV0dXJuaW5nJywgZXYpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgY29uc3Qgb2xkVGV4dCA9IHRoaXMuZWRpdGFibGUudGV4dCgpLmxvd2VyKCkucmVtb3ZlQWxsKGlsbGVnYWwpO1xuICAgICAgICBsZXQgbmV3VGV4dDtcbiAgICAgICAgaWYgKCBib29sKG9sZFRleHQpIClcbiAgICAgICAgICAgIG5ld1RleHQgPSBvbGRUZXh0LnRvTG93ZXJDYXNlKCkgKyBldi5rZXk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG5ld1RleHQgPSBldi5rZXk7XG4gICAgICAgIHRoaXMuc2V0VGV4dChuZXdUZXh0KTtcbiAgICAgICAgLy8gdGhpcy5lZGl0YWJsZS50ZXh0KG5ld1RleHQpO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHN1YmplY3RTdWdnZXN0aW9uID0gc3ViamVjdHMuZmluZChzID0+IHMuc3RhcnRzV2l0aChuZXdUZXh0KSk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLnJlbW92ZUNsYXNzKCdpbnB1dC1taXNzaW5nJyk7XG4gICAgICAgIC8qc3VibWl0QnV0dG9uXG4gICAgICAgICAucmVtb3ZlQ2xhc3MoJ2luYWN0aXZlJylcbiAgICAgICAgIC5hZGRDbGFzcygnYWN0aXZlJylcbiAgICAgICAgIC5odG1sKG5ld1RleHQpOyovXG4gICAgICAgIFxuICAgICAgICBpZiAoIHN1YmplY3RTdWdnZXN0aW9uICkge1xuICAgICAgICAgICAgdGhpcy5hdXRvY29tcGxldGVcbiAgICAgICAgICAgICAgICAudGV4dChzdWJqZWN0U3VnZ2VzdGlvbi5zdWJzdHIobmV3VGV4dC5sZW5ndGgpKVxuICAgICAgICAgICAgICAgIC5yZW1vdmVBdHRyKCdoaWRkZW4nKTtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignY2hhbmdlZCBhdXRvY29tcGxldGUnKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9IGVsc2UgaWYgKCB0aGlzLmF1dG9jb21wbGV0ZS50ZXh0KCkgKSB7XG4gICAgICAgICAgICAvLyB0aGlzLmF1dG9jb21wbGV0ZS5odG1sKCcnKTtcbiAgICAgICAgICAgIHRoaXMuYXV0b2NvbXBsZXRlLmF0dHIoeyBoaWRkZW4gOiB0cnVlIH0pO1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdoaWRlIGF1dG9jb21wbGV0ZScpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2VuZEVuZCgpO1xuICAgICAgICBjb25zb2xlLmxvZyh7IG5ld1RleHQsIHN1YmplY3RTdWdnZXN0aW9uLCAndGhpcy5hdXRvY29tcGxldGUudGV4dCgpJyA6IHRoaXMuYXV0b2NvbXBsZXRlLnRleHQoKSB9KTtcbiAgICAgICAgXG4gICAgICAgIGNvbnNvbGUubG9nKCdcXG4nKTtcbiAgICB9XG4gICAgXG59XG5cbmNsYXNzIFNldHRpbmdzRGl2IGV4dGVuZHMgRGl2IHtcbiAgICBcbiAgICBcbiAgICBjb25zdHJ1Y3Rvcih7IGlkIH0pIHtcbiAgICAgICAgc3VwZXIoeyBpZCB9KTtcbiAgICAgICAgY29uc3QgaW5wdXQgPSBuZXcgSW5wdXQoKTtcbiAgICAgICAgY29uc3Qgc3VidGl0bGUgPSBlbGVtKHsgdGFnIDogJ2gyJywgdGV4dCA6ICdTZXR0aW5ncycgfSk7XG4gICAgICAgIHRoaXMuY2FjaGVBcHBlbmQoeyBzdWJ0aXRsZSwgaW5wdXQgfSlcbiAgICAgICAgLyp0aGlzLmNhY2hlQXBwZW5kKHtcbiAgICAgICAgIGFkZExldmVsQnRuIDogYnV0dG9uKHsgY2xzIDogJ2FjdGl2ZScsIGh0bWwgOiAnQWRkIExldmVsJywgY2xpY2sgOiB0aGlzLmFkZExldmVsIH0pLFxuICAgICAgICAgXG4gICAgICAgICB9KSovXG4gICAgfVxuICAgIFxuICAgIFxufVxuXG5jbGFzcyBTdWJqZWN0RGl2IGV4dGVuZHMgRGl2IHtcbiAgICBpbnB1dDogU3ViamVjdElucHV0O1xuICAgIHN1Ym1pdEJ1dHRvbjogQnV0dG9uO1xuICAgIHN1YnRpdGxlOiBEaXY7XG4gICAgXG4gICAgY29uc3RydWN0b3IoeyBpZCB9KSB7XG4gICAgICAgIHN1cGVyKHsgaWQgfSk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBpbnB1dCA9IG5ldyBTdWJqZWN0SW5wdXQoKTtcbiAgICAgICAgY29uc3Qgc3VidGl0bGUgPSBlbGVtKHsgdGFnIDogJ2gzJywgdGV4dCA6ICdTdWJqZWN0JyB9KTtcbiAgICAgICAgdGhpcy5jYWNoZUFwcGVuZCh7IHN1YnRpdGxlLCBpbnB1dCB9KVxuICAgIH1cbiAgICBcbiAgICBcbn1cblxuY29uc3Qgc3ViamVjdERpdiA9IG5ldyBTdWJqZWN0RGl2KHsgaWQgOiAnc3ViamVjdF9kaXYnIH0pO1xuY29uc3Qgc3ViamVjdHMgPSBHbG9iLkJpZ0NvbmZpZy5zdWJqZWN0cztcbmNvbnN0IHN1Ym1pdEJ1dHRvbiA9IGJ1dHRvbih7IGNscyA6ICdpbmFjdGl2ZScsIGh0bWwgOiAnU3VibWl0JyB9KTtcbnN1YmplY3REaXYuY2FjaGVBcHBlbmQoeyBzdWJtaXRCdXR0b24gfSk7XG4vLyAuYWRkQ2xhc3MoJ2luYWN0aXZlLWJ0bicpXG4vLyAuaHRtbCgnU3VibWl0Jylcbi8vIC5jbGljayhvblN1Ym1pdFN1YmplY3RDbGljayk7XG5cbmNvbnN0IHNldHRpbmdzRGl2ID0gbmV3IFNldHRpbmdzRGl2KHsgaWQgOiAnc2V0dGluZ3NfZGl2JyB9KVxuICAgIC5jYWNoZUFwcGVuZCh7IHN1YmplY3REaXYgfSk7XG5leHBvcnQgZGVmYXVsdCBzZXR0aW5nc0RpdjtcblxuIl19