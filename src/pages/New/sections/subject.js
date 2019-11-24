"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bhe_1 = require("../../../bhe");
const util_1 = require("../../../util");
const Glob_1 = require("../../../Glob");
const electron_1 = require("electron");
class Input extends bhe_1.Div {
    constructor() {
        super({ cls: 'input' });
        const editable = bhe_1.span({ cls: 'editable' });
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
            editable,
            autocomplete: bhe_1.span({ cls: 'autocomplete', text: 'Subject Id' }).on({
                focus: () => {
                    console.log('autocomplete focus');
                },
                change: (ev) => {
                    console.log('autocomplete change');
                },
            })
        });
    }
    reset({ inputMissing }) {
        if (inputMissing) {
            this.addClass('input-missing');
        }
        this.autocomplete.text('Subject Id');
        this.editable.text('');
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
                    this.autocomplete
                        .text('Subject Id')
                        .removeAttr('hidden');
                    return ev.preventDefault();
                }
                this.autocomplete.attr({ hidden: true });
                const newText = oldText.slice(0, oldText.length - 1);
                if (ev.ctrlKey || !util_1.bool(newText)) {
                    console.warn('!bool(newText) || ctrlKey, editable(""), preventDefault, "Subject Id" and return');
                    this.editable.text('');
                    this.autocomplete
                        .text('Subject Id')
                        .removeAttr('hidden');
                    return ev.preventDefault();
                }
                this.editable.text(newText);
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
            this.editable.text(oldText + this.autocomplete.text());
            this.autocomplete.attr({ hidden: true });
            this.sendEnd();
            return;
        }
        const illegal = /[^(a-z0-9|_)]/;
        if (ev.key.match(illegal)) {
            console.log('Matched [^(a-z0-9|_)], returning', ev);
            return;
        }
        const oldText = this.editable.text().lower().removeAll(illegal);
        let txt;
        if (util_1.bool(oldText))
            txt = oldText.toLowerCase() + ev.key;
        else
            txt = ev.key;
        this.editable.text(txt);
        const subjectSuggestion = subjects.find(s => s.startsWith(txt));
        this.removeClass('input-missing');
        if (subjectSuggestion) {
            this.autocomplete
                .text(subjectSuggestion.substr(txt.length))
                .removeAttr('hidden');
            console.warn('changed autocomplete');
            this.sendEnd();
        }
        else {
            if (this.autocomplete.text()) {
                this.autocomplete.attr({ hidden: true });
                console.warn('hide autocomplete');
            }
            this.sendEnd();
        }
        console.log({ txt, subjectSuggestion, 'this.autocomplete.text()': this.autocomplete.text() });
        console.log('\n');
    }
}
class SubjectDiv extends bhe_1.Div {
    constructor({ id }) {
        super({ id });
        const input = new Input();
        this.cacheAppend({ input });
    }
}
const subjectDiv = new SubjectDiv({ id: 'subject_div' });
const subjects = Glob_1.default.BigConfig.subjects;
exports.default = subjectDiv;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3ViamVjdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInN1YmplY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFLQSxzQ0FBMEU7QUFDMUUsd0NBQXFDO0FBRXJDLHdDQUFnQztBQUNoQyx1Q0FBa0M7QUFFbEMsTUFBTSxLQUFNLFNBQVEsU0FBRztJQUluQjtRQUNJLEtBQUssQ0FBQyxFQUFFLEdBQUcsRUFBRyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQ3pCLE1BQU0sUUFBUSxHQUFHLFVBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRyxVQUFVLEVBQUUsQ0FBQyxDQUFDO1FBUzVDLElBQUk7YUFDQyxJQUFJLENBQUMsRUFBRSxlQUFlLEVBQUcsSUFBSSxFQUFFLENBQUM7YUFFaEMsRUFBRSxDQUFDO1lBQ0EsT0FBTyxFQUFHLENBQUMsRUFBaUIsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUM7WUFDeEQsS0FBSyxFQUFHLENBQUMsRUFBYyxFQUFFLEVBQUU7Z0JBQ3ZCLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBQzNCLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDZixpQkFBTSxDQUFDLGdCQUFnQixFQUFFLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQztvQkFDakQsSUFBSSxFQUFHLFNBQVM7b0JBQ2hCLE9BQU8sRUFBRyxNQUFNO29CQUNoQixTQUFTLEVBQUcsQ0FBRSxPQUFPLENBQUU7aUJBQzFCLENBQUMsQ0FBQTtZQUNOLENBQUM7U0FFSixDQUFDO2FBQ0QsV0FBVyxDQUFDO1lBQ1QsUUFBUTtZQUNSLFlBQVksRUFBRyxVQUFJLENBQUMsRUFBRSxHQUFHLEVBQUcsY0FBYyxFQUFFLElBQUksRUFBRyxZQUFZLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDbEUsS0FBSyxFQUFHLEdBQUcsRUFBRTtvQkFDVCxPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDLENB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V0FBVyxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQTtJQUMvQixDQUFDO0NBR0o7QUFFRCxNQUFNLFVBQVUsR0FBRyxJQUFJLFVBQVUsQ0FBQyxFQUFFLEVBQUUsRUFBRyxhQUFhLEVBQUUsQ0FBQyxDQUFDO0FBQzFELE1BQU0sUUFBUSxHQUFHLGNBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDO0FBQ3pDLGtCQUFlLFVBQVUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8vICogIHBhZ2VzL05ldy9zZWN0aW9ucy9zdWJqZWN0XG5cbi8qKlxuICogaW1wb3J0IHNlY3Rpb25zIGZyb20gXCIuL3NlY3Rpb25zXCJcbiAqIHNlY3Rpb25zLnN1YmplY3QqL1xuaW1wb3J0IHsgZGl2LCBlbGVtLCBidXR0b24sIHNwYW4sIERpdiwgQnV0dG9uLCBTcGFuIH0gZnJvbSBcIi4uLy4uLy4uL2JoZVwiO1xuaW1wb3J0IHsgYm9vbCB9IGZyb20gXCIuLi8uLi8uLi91dGlsXCI7XG5pbXBvcnQgTXlBbGVydCBmcm9tICcuLi8uLi8uLi9NeUFsZXJ0J1xuaW1wb3J0IEdsb2IgZnJvbSAnLi4vLi4vLi4vR2xvYidcbmltcG9ydCB7IHJlbW90ZSB9IGZyb20gXCJlbGVjdHJvblwiO1xuXG5jbGFzcyBJbnB1dCBleHRlbmRzIERpdiB7XG4gICAgZWRpdGFibGU6IFNwYW47XG4gICAgYXV0b2NvbXBsZXRlOiBTcGFuO1xuICAgIFxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcih7IGNscyA6ICdpbnB1dCcgfSk7XG4gICAgICAgIGNvbnN0IGVkaXRhYmxlID0gc3Bhbih7IGNscyA6ICdlZGl0YWJsZScgfSk7XG4gICAgICAgIC8vIC5hdHRyKHsgY29udGVudGVkaXRhYmxlIDogdHJ1ZSB9KTtcbiAgICAgICAgLyoub24oe1xuICAgICAgICAgLy8gaW5wdXQgOiAoZXY6IElucHV0RXZlbnQpID0+IHRoaXMuZG9BdXRvY29tcGxldGUoZXYpLFxuICAgICAgICAgLy8gZm9jdXMgOiAoZXY6IEZvY3VzRXZlbnQpID0+IHtcbiAgICAgICAgIC8vICAgICBjb25zb2xlLmxvZygnZWRpdGFibGUgZm9jdXMnKTtcbiAgICAgICAgIC8vIH0sXG4gICAgICAgICAvLyBrZXlkb3duIDogKGV2OiBLZXlib2FyZEV2ZW50KSA9PiB0aGlzLm9uS2V5RG93bihldiksXG4gICAgICAgICB9KTsqL1xuICAgICAgICB0aGlzXG4gICAgICAgICAgICAuYXR0cih7IGNvbnRlbnRlZGl0YWJsZSA6IHRydWUgfSlcbiAgICAgICAgICAgIC8vIC5mb2N1cygoKSA9PiBlZGl0YWJsZS5mb2N1cygpKVxuICAgICAgICAgICAgLm9uKHtcbiAgICAgICAgICAgICAgICBrZXlkb3duIDogKGV2OiBLZXlib2FyZEV2ZW50KSA9PiB0aGlzLmRvQXV0b2NvbXBsZXRlKGV2KSxcbiAgICAgICAgICAgICAgICBmb2N1cyA6IChldjogRm9jdXNFdmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnaW5wdXQgZm9jdXMnKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZW5kRW5kKCk7XG4gICAgICAgICAgICAgICAgICAgIHJlbW90ZS5nZXRDdXJyZW50V2luZG93KCkud2ViQ29udGVudHMuc2VuZElucHV0RXZlbnQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZSA6IFwia2V5RG93blwiLFxuICAgICAgICAgICAgICAgICAgICAgICAga2V5Q29kZSA6ICdIb21lJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGlmaWVycyA6IFsgJ3NoaWZ0JyBdXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2FjaGVBcHBlbmQoe1xuICAgICAgICAgICAgICAgIGVkaXRhYmxlLFxuICAgICAgICAgICAgICAgIGF1dG9jb21wbGV0ZSA6IHNwYW4oeyBjbHMgOiAnYXV0b2NvbXBsZXRlJywgdGV4dCA6ICdTdWJqZWN0IElkJyB9KS5vbih7XG4gICAgICAgICAgICAgICAgICAgIGZvY3VzIDogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2F1dG9jb21wbGV0ZSBmb2N1cycpXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGNoYW5nZSA6IChldjogS2V5Ym9hcmRFdmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2F1dG9jb21wbGV0ZSBjaGFuZ2UnKVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSByZXNldCh7IGlucHV0TWlzc2luZyB9OiB7IGlucHV0TWlzc2luZzogYm9vbGVhbiB9KSB7XG4gICAgICAgIGlmICggaW5wdXRNaXNzaW5nICkge1xuICAgICAgICAgICAgdGhpcy5hZGRDbGFzcygnaW5wdXQtbWlzc2luZycpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLyokc3VibWl0U3ViamVjdEJ0blxuICAgICAgICAgLmFkZENsYXNzKCdpbmFjdGl2ZS1idG4nKVxuICAgICAgICAgLnJlbW92ZUNsYXNzKCdhY3RpdmUtYnRuJylcbiAgICAgICAgIC5odG1sKCdTdWJtaXQnKTsqL1xuICAgICAgICBcbiAgICAgICAgdGhpcy5hdXRvY29tcGxldGUudGV4dCgnU3ViamVjdCBJZCcpO1xuICAgICAgICB0aGlzLmVkaXRhYmxlLnRleHQoJycpO1xuICAgIH1cbiAgICBcbiAgICBwcml2YXRlIHNlbmRFbmQoKSB7XG4gICAgICAgIHJlbW90ZS5nZXRDdXJyZW50V2luZG93KCkud2ViQ29udGVudHMuc2VuZElucHV0RXZlbnQoe1xuICAgICAgICAgICAgdHlwZSA6IFwia2V5RG93blwiLFxuICAgICAgICAgICAga2V5Q29kZSA6ICdFbmQnLFxuICAgICAgICAgICAgbW9kaWZpZXJzIDogW11cbiAgICAgICAgfSlcbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSBkb0F1dG9jb21wbGV0ZShldjogS2V5Ym9hcmRFdmVudCkge1xuICAgICAgICBjb25zb2xlLmxvZygnXFxuZG9BdXRvY29tcGxldGUnLCBldik7XG4gICAgICAgIGlmICggZXYuY3RybEtleSB8fCBbICdCYWNrc3BhY2UnLCAnSG9tZScsICdFbmQnLCAnRGVsZXRlJyBdLmluY2x1ZGVzKGV2LmtleSkgfHwgZXYua2V5LmluY2x1ZGVzKCdBcnJvdycpICkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoIGV2LmtleSA9PT0gJ0JhY2tzcGFjZScgKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYEJhY2tzcGFjZSwgcmV0dXJuaW5nLiBlZGl0YWJsZSB0ZXh0IGxlbjogJHt0aGlzLmVkaXRhYmxlLnRleHQoKS5sZW5ndGh9LCBhdXRvY29tcGxldGUgdGV4dCBsZW46ICR7dGhpcy5hdXRvY29tcGxldGUudGV4dCgpLmxlbmd0aH1cbiAgICAgICAgICAgICAgICBhY3RpdmVFbGVtZW50OiAke2RvY3VtZW50LmFjdGl2ZUVsZW1lbnQuY2xhc3NOYW1lfWAsIGV2KTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBjb25zdCBvbGRUZXh0ID0gdGhpcy5lZGl0YWJsZS50ZXh0KCk7XG4gICAgICAgICAgICAgICAgaWYgKCBvbGRUZXh0Lmxlbmd0aCA9PT0gMCApIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdvbGRUZXh0Lmxlbmd0aCA9PT0gMCwgcHJldmVudERlZmF1bHQsIFwiU3ViamVjdCBJZFwiIGFuZCByZXR1cm4nKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hdXRvY29tcGxldGVcbiAgICAgICAgICAgICAgICAgICAgICAgIC50ZXh0KCdTdWJqZWN0IElkJylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZW1vdmVBdHRyKCdoaWRkZW4nKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIHRoaXMuYXV0b2NvbXBsZXRlLnRleHQoJycpO1xuICAgICAgICAgICAgICAgIHRoaXMuYXV0b2NvbXBsZXRlLmF0dHIoeyBoaWRkZW4gOiB0cnVlIH0pO1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ld1RleHQgPSBvbGRUZXh0LnNsaWNlKDAsIG9sZFRleHQubGVuZ3RoIC0gMSk7XG4gICAgICAgICAgICAgICAgaWYgKCBldi5jdHJsS2V5IHx8ICFib29sKG5ld1RleHQpICkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJyFib29sKG5ld1RleHQpIHx8IGN0cmxLZXksIGVkaXRhYmxlKFwiXCIpLCBwcmV2ZW50RGVmYXVsdCwgXCJTdWJqZWN0IElkXCIgYW5kIHJldHVybicpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmVkaXRhYmxlLnRleHQoJycpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmF1dG9jb21wbGV0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRleHQoJ1N1YmplY3QgSWQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlbW92ZUF0dHIoJ2hpZGRlbicpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5lZGl0YWJsZS50ZXh0KG5ld1RleHQpO1xuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUud2FybignQmFja3NwYWNlLCBjaGFuZ2VkIGVkaXRhYmxlJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZW5kRW5kKCk7XG4gICAgICAgICAgICAgICAgLy8gaWYgKCB0aGlzLmF1dG9jb21wbGV0ZS50ZXh0KCkubGVuZ3RoIDw9IDEgKSB7XG4gICAgICAgICAgICAgICAgLy8gICAgIHRoaXMuYXV0b2NvbXBsZXRlLnRleHQoJ1N1YmplY3QgSWQnKTtcbiAgICAgICAgICAgICAgICAvLyAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAvLyAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0gZWxzZSB7IC8vIEFycm93LCBiYXJlIENvbnRyb2wgZXRjXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0Z1bmN0aW9uYWwsIHJldHVybmluZycsIGV2KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgaWYgKCBldi5rZXkgPT09ICdUYWInICkge1xuICAgICAgICAgICAgbGV0IG9sZFRleHQgPSB0aGlzLmVkaXRhYmxlLnRleHQoKTtcbiAgICAgICAgICAgIGlmICggdGhpcy5hdXRvY29tcGxldGUuYXR0cignaGlkZGVuJykgfHwgIWJvb2wob2xkVGV4dCkgKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5lZGl0YWJsZS50ZXh0KG9sZFRleHQgKyB0aGlzLmF1dG9jb21wbGV0ZS50ZXh0KCkpO1xuICAgICAgICAgICAgLy8gdGhpcy5hdXRvY29tcGxldGUudGV4dCgnJyk7XG4gICAgICAgICAgICB0aGlzLmF1dG9jb21wbGV0ZS5hdHRyKHsgaGlkZGVuIDogdHJ1ZSB9KTtcbiAgICAgICAgICAgIHRoaXMuc2VuZEVuZCgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGlsbGVnYWwgPSAvW14oYS16MC05fF8pXS87XG4gICAgICAgIGlmICggZXYua2V5Lm1hdGNoKGlsbGVnYWwpICkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ01hdGNoZWQgW14oYS16MC05fF8pXSwgcmV0dXJuaW5nJywgZXYpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8qaWYgKCBldi5rZXkgPT09ICdhJyAmJiBldi5jdHJsS2V5ICkge1xuICAgICAgICAgcmVtb3RlLmdldEN1cnJlbnRXaW5kb3coKS53ZWJDb250ZW50cy5zZW5kSW5wdXRFdmVudCh7XG4gICAgICAgICB0eXBlIDogXCJrZXlEb3duXCIsXG4gICAgICAgICBrZXlDb2RlIDogJ0hvbWUnLFxuICAgICAgICAgbW9kaWZpZXJzIDogWyBcInNoaWZ0XCIgXVxuICAgICAgICAgfSlcbiAgICAgICAgIH0qL1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IG9sZFRleHQgPSB0aGlzLmVkaXRhYmxlLnRleHQoKS5sb3dlcigpLnJlbW92ZUFsbChpbGxlZ2FsKTtcbiAgICAgICAgbGV0IHR4dDtcbiAgICAgICAgaWYgKCBib29sKG9sZFRleHQpIClcbiAgICAgICAgICAgIHR4dCA9IG9sZFRleHQudG9Mb3dlckNhc2UoKSArIGV2LmtleTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdHh0ID0gZXYua2V5O1xuICAgICAgICB0aGlzLmVkaXRhYmxlLnRleHQodHh0KTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coeyAndGhpcy5lZGl0YWJsZS50ZXh0KCknIDogdGhpcy5lZGl0YWJsZS50ZXh0KCksIHR4dCB9KTtcbiAgICAgICAgXG4gICAgICAgIC8vIGlmICggIWJvb2woZWRpdGFibGVUZXh0KSApIHtcbiAgICAgICAgLy8gICAgIHJldHVybiB0aGlzLnJlc2V0KHsgaW5wdXRNaXNzaW5nIDogdHJ1ZSB9KTtcbiAgICAgICAgLy8gfVxuICAgICAgICBcbiAgICAgICAgLy8gYXV0b2NvbXBsZXRlXG4gICAgICAgIFxuICAgICAgICBjb25zdCBzdWJqZWN0U3VnZ2VzdGlvbiA9IHN1YmplY3RzLmZpbmQocyA9PiBzLnN0YXJ0c1dpdGgodHh0KSk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLnJlbW92ZUNsYXNzKCdpbnB1dC1taXNzaW5nJyk7XG4gICAgICAgIC8qJHN1Ym1pdFN1YmplY3RCdG5cbiAgICAgICAgIC5yZW1vdmVDbGFzcygnaW5hY3RpdmUtYnRuJylcbiAgICAgICAgIC5hZGRDbGFzcygnYWN0aXZlLWJ0bicpXG4gICAgICAgICAuaHRtbChlZGl0YWJsZVRleHQpOyovXG4gICAgICAgIC8vIHRoaXMuZWRpdGFibGUudGV4dChlZGl0YWJsZVRleHQpO1xuICAgICAgICBpZiAoIHN1YmplY3RTdWdnZXN0aW9uICkge1xuICAgICAgICAgICAgdGhpcy5hdXRvY29tcGxldGVcbiAgICAgICAgICAgICAgICAudGV4dChzdWJqZWN0U3VnZ2VzdGlvbi5zdWJzdHIodHh0Lmxlbmd0aCkpXG4gICAgICAgICAgICAgICAgLnJlbW92ZUF0dHIoJ2hpZGRlbicpO1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdjaGFuZ2VkIGF1dG9jb21wbGV0ZScpO1xuICAgICAgICAgICAgdGhpcy5zZW5kRW5kKClcbiAgICAgICAgICAgIFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKCB0aGlzLmF1dG9jb21wbGV0ZS50ZXh0KCkgKSB7XG4gICAgICAgICAgICAgICAgLy8gdGhpcy5hdXRvY29tcGxldGUuaHRtbCgnJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5hdXRvY29tcGxldGUuYXR0cih7IGhpZGRlbiA6IHRydWUgfSk7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdoaWRlIGF1dG9jb21wbGV0ZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zZW5kRW5kKClcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKHsgdHh0LCBzdWJqZWN0U3VnZ2VzdGlvbiwgJ3RoaXMuYXV0b2NvbXBsZXRlLnRleHQoKScgOiB0aGlzLmF1dG9jb21wbGV0ZS50ZXh0KCkgfSk7XG4gICAgICAgIC8vIHRoaXMuYXV0b2NvbXBsZXRlXG4gICAgICAgIC8vICAgICAudGV4dChzdWJqZWN0U3VnZ2VzdGlvbiA/IHN1YmplY3RTdWdnZXN0aW9uLnN1YnN0cihlZGl0YWJsZVRleHQubGVuZ3RoKSA6ICcnKTtcbiAgICAgICAgLy8gTXlBbGVydC5jbG9zZSgpO1xuICAgICAgICBjb25zb2xlLmxvZygnXFxuJyk7XG4gICAgfVxuICAgIFxufVxuXG5cbmNsYXNzIFN1YmplY3REaXYgZXh0ZW5kcyBEaXYge1xuICAgIGlucHV0OiBJbnB1dDtcbiAgICBcbiAgICBcbiAgICBjb25zdHJ1Y3Rvcih7IGlkIH0pIHtcbiAgICAgICAgc3VwZXIoeyBpZCB9KTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGlucHV0ID0gbmV3IElucHV0KCk7XG4gICAgICAgIHRoaXMuY2FjaGVBcHBlbmQoeyBpbnB1dCB9KVxuICAgIH1cbiAgICBcbiAgICBcbn1cblxuY29uc3Qgc3ViamVjdERpdiA9IG5ldyBTdWJqZWN0RGl2KHsgaWQgOiAnc3ViamVjdF9kaXYnIH0pO1xuY29uc3Qgc3ViamVjdHMgPSBHbG9iLkJpZ0NvbmZpZy5zdWJqZWN0cztcbmV4cG9ydCBkZWZhdWx0IHN1YmplY3REaXY7XG5cbiJdfQ==