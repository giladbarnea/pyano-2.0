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
            editable,
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
class SubjectDiv extends bhe_1.Div {
    constructor({ id }) {
        super({ id });
        const input = new Input();
        const subtitle = bhe_1.elem({ tag: 'h3', text: 'Subject' });
        this.cacheAppend({ subtitle, input });
    }
}
const subjectDiv = new SubjectDiv({ id: 'subject_div' });
const subjects = Glob_1.default.BigConfig.subjects;
const submitButton = bhe_1.button({ cls: 'inactive', html: 'Submit' });
subjectDiv.cacheAppend({ submitButton });
exports.default = subjectDiv;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3ViamVjdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInN1YmplY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFLQSxzQ0FBcUU7QUFDckUsd0NBQXFDO0FBQ3JDLHdDQUFnQztBQUNoQyx1Q0FBa0M7QUFFbEMsTUFBTSxLQUFNLFNBQVEsU0FBRztJQUluQjtRQUNJLEtBQUssQ0FBQyxFQUFFLEdBQUcsRUFBRyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQ3pCLE1BQU0sUUFBUSxHQUFHLFVBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRyxVQUFVLEVBQUUsQ0FBQyxDQUFDO1FBQzVDLE1BQU0sWUFBWSxHQUFHLFVBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRyxjQUFjLEVBQUUsSUFBSSxFQUFHLFlBQVksRUFBRSxDQUFDLENBQUM7UUFFekUsSUFBSTthQUNDLElBQUksQ0FBQyxFQUFFLGVBQWUsRUFBRyxJQUFJLEVBQUUsQ0FBQzthQUNoQyxFQUFFLENBQUM7WUFDQSxPQUFPLEVBQUcsQ0FBQyxFQUFpQixFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQztZQUN4RCxLQUFLLEVBQUcsQ0FBQyxFQUFjLEVBQUUsRUFBRTtnQkFDdkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztnQkFDM0IsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNmLGlCQUFNLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDO29CQUNqRCxJQUFJLEVBQUcsU0FBUztvQkFDaEIsT0FBTyxFQUFHLE1BQU07b0JBQ2hCLFNBQVMsRUFBRyxDQUFFLE9BQU8sQ0FBRTtpQkFDMUIsQ0FBQyxDQUFBO1lBQ04sQ0FBQztTQUVKLENBQUM7YUFDRCxXQUFXLENBQUM7WUFDVCxRQUFRO1lBQ1IsWUFBWTtTQUNmLENBQUMsQ0FBQztJQUNYLENBQUM7SUFFTyxLQUFLO1FBQ1QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJ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Q3pDLE1BQU0sWUFBWSxHQUFHLFlBQU0sQ0FBQyxFQUFFLEdBQUcsRUFBRyxVQUFVLEVBQUUsSUFBSSxFQUFHLFFBQVEsRUFBRSxDQUFDLENBQUM7QUFDbkUsVUFBVSxDQUFDLFdBQVcsQ0FBQyxFQUFFLFlBQVksRUFBRSxDQUFDLENBQUM7QUFJekMsa0JBQWUsVUFBVSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLy8gKiAgcGFnZXMvTmV3L3NlY3Rpb25zL3N1YmplY3RcblxuLyoqXG4gKiBpbXBvcnQgc2VjdGlvbnMgZnJvbSBcIi4vc2VjdGlvbnNcIlxuICogc2VjdGlvbnMuc3ViamVjdCovXG5pbXBvcnQgeyBlbGVtLCBidXR0b24sIHNwYW4sIERpdiwgQnV0dG9uLCBTcGFuIH0gZnJvbSBcIi4uLy4uLy4uL2JoZVwiO1xuaW1wb3J0IHsgYm9vbCB9IGZyb20gXCIuLi8uLi8uLi91dGlsXCI7XG5pbXBvcnQgR2xvYiBmcm9tICcuLi8uLi8uLi9HbG9iJ1xuaW1wb3J0IHsgcmVtb3RlIH0gZnJvbSBcImVsZWN0cm9uXCI7XG5cbmNsYXNzIElucHV0IGV4dGVuZHMgRGl2IHtcbiAgICBlZGl0YWJsZTogU3BhbjtcbiAgICBhdXRvY29tcGxldGU6IFNwYW47XG4gICAgXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKHsgY2xzIDogJ2lucHV0JyB9KTtcbiAgICAgICAgY29uc3QgZWRpdGFibGUgPSBzcGFuKHsgY2xzIDogJ2VkaXRhYmxlJyB9KTtcbiAgICAgICAgY29uc3QgYXV0b2NvbXBsZXRlID0gc3Bhbih7IGNscyA6ICdhdXRvY29tcGxldGUnLCB0ZXh0IDogJ1N1YmplY3QgSWQnIH0pO1xuICAgICAgICBcbiAgICAgICAgdGhpc1xuICAgICAgICAgICAgLmF0dHIoeyBjb250ZW50ZWRpdGFibGUgOiB0cnVlIH0pXG4gICAgICAgICAgICAub24oe1xuICAgICAgICAgICAgICAgIGtleWRvd24gOiAoZXY6IEtleWJvYXJkRXZlbnQpID0+IHRoaXMuZG9BdXRvY29tcGxldGUoZXYpLFxuICAgICAgICAgICAgICAgIGZvY3VzIDogKGV2OiBGb2N1c0V2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdpbnB1dCBmb2N1cycpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbmRFbmQoKTtcbiAgICAgICAgICAgICAgICAgICAgcmVtb3RlLmdldEN1cnJlbnRXaW5kb3coKS53ZWJDb250ZW50cy5zZW5kSW5wdXRFdmVudCh7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlIDogXCJrZXlEb3duXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBrZXlDb2RlIDogJ0hvbWUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kaWZpZXJzIDogWyAnc2hpZnQnIF1cbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYWNoZUFwcGVuZCh7XG4gICAgICAgICAgICAgICAgZWRpdGFibGUsXG4gICAgICAgICAgICAgICAgYXV0b2NvbXBsZXRlXG4gICAgICAgICAgICB9KTtcbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSByZXNldCgpIHtcbiAgICAgICAgdGhpcy5lZGl0YWJsZS50ZXh0KCcnKTtcbiAgICAgICAgdGhpcy5hdXRvY29tcGxldGVcbiAgICAgICAgICAgIC50ZXh0KCdTdWJqZWN0IElkJylcbiAgICAgICAgICAgIC5yZW1vdmVBdHRyKCdoaWRkZW4nKTtcbiAgICAgICAgc3VibWl0QnV0dG9uXG4gICAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpXG4gICAgICAgICAgICAuYWRkQ2xhc3MoJ2luYWN0aXZlJylcbiAgICAgICAgICAgIC5odG1sKCdTdWJtaXQnKVxuICAgIH1cbiAgICBcbiAgICBwcml2YXRlIHNldFRleHQobmV3VGV4dDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuYXV0b2NvbXBsZXRlLmF0dHIoeyBoaWRkZW4gOiB0cnVlIH0pO1xuICAgICAgICB0aGlzLmVkaXRhYmxlLnRleHQobmV3VGV4dCk7XG4gICAgICAgIHN1Ym1pdEJ1dHRvblxuICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdpbmFjdGl2ZScpXG4gICAgICAgICAgICAuYWRkQ2xhc3MoJ2FjdGl2ZScpXG4gICAgICAgICAgICAuaHRtbChuZXdUZXh0KVxuICAgIH1cbiAgICBcbiAgICBwcml2YXRlIHNlbmRFbmQoKSB7XG4gICAgICAgIHJlbW90ZS5nZXRDdXJyZW50V2luZG93KCkud2ViQ29udGVudHMuc2VuZElucHV0RXZlbnQoe1xuICAgICAgICAgICAgdHlwZSA6IFwia2V5RG93blwiLFxuICAgICAgICAgICAga2V5Q29kZSA6ICdFbmQnLFxuICAgICAgICAgICAgbW9kaWZpZXJzIDogW11cbiAgICAgICAgfSlcbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSBkb0F1dG9jb21wbGV0ZShldjogS2V5Ym9hcmRFdmVudCkge1xuICAgICAgICBjb25zb2xlLmxvZygnXFxuZG9BdXRvY29tcGxldGUnLCBldik7XG4gICAgICAgIGlmICggZXYuY3RybEtleSB8fCBbICdCYWNrc3BhY2UnLCAnSG9tZScsICdFbmQnLCAnRGVsZXRlJyBdLmluY2x1ZGVzKGV2LmtleSkgfHwgZXYua2V5LmluY2x1ZGVzKCdBcnJvdycpICkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoIGV2LmtleSA9PT0gJ0JhY2tzcGFjZScgKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYEJhY2tzcGFjZSwgcmV0dXJuaW5nLiBlZGl0YWJsZSB0ZXh0IGxlbjogJHt0aGlzLmVkaXRhYmxlLnRleHQoKS5sZW5ndGh9LCBhdXRvY29tcGxldGUgdGV4dCBsZW46ICR7dGhpcy5hdXRvY29tcGxldGUudGV4dCgpLmxlbmd0aH1cbiAgICAgICAgICAgICAgICBhY3RpdmVFbGVtZW50OiAke2RvY3VtZW50LmFjdGl2ZUVsZW1lbnQuY2xhc3NOYW1lfWAsIGV2KTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBjb25zdCBvbGRUZXh0ID0gdGhpcy5lZGl0YWJsZS50ZXh0KCk7XG4gICAgICAgICAgICAgICAgaWYgKCBvbGRUZXh0Lmxlbmd0aCA9PT0gMCApIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdvbGRUZXh0Lmxlbmd0aCA9PT0gMCwgcHJldmVudERlZmF1bHQsIFwiU3ViamVjdCBJZFwiIGFuZCByZXR1cm4nKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXNldCgpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgbmV3VGV4dCA9IG9sZFRleHQuc2xpY2UoMCwgb2xkVGV4dC5sZW5ndGggLSAxKTtcbiAgICAgICAgICAgICAgICBpZiAoIGV2LmN0cmxLZXkgfHwgIWJvb2wobmV3VGV4dCkgKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignIWJvb2wobmV3VGV4dCkgfHwgY3RybEtleSwgZWRpdGFibGUoXCJcIiksIHByZXZlbnREZWZhdWx0LCBcIlN1YmplY3QgSWRcIiBhbmQgcmV0dXJuJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVzZXQoKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuc2V0VGV4dChuZXdUZXh0KTtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbmRFbmQoKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0gZWxzZSB7IC8vIEFycm93LCBiYXJlIENvbnRyb2wgZXRjXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0Z1bmN0aW9uYWwsIHJldHVybmluZycsIGV2KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgaWYgKCBldi5rZXkgPT09ICdUYWInICkge1xuICAgICAgICAgICAgbGV0IG9sZFRleHQgPSB0aGlzLmVkaXRhYmxlLnRleHQoKTtcbiAgICAgICAgICAgIGlmICggdGhpcy5hdXRvY29tcGxldGUuYXR0cignaGlkZGVuJykgfHwgIWJvb2wob2xkVGV4dCkgKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zZXRUZXh0KG9sZFRleHQgKyB0aGlzLmF1dG9jb21wbGV0ZS50ZXh0KCkpO1xuICAgICAgICAgICAgdGhpcy5zZW5kRW5kKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaWxsZWdhbCA9IC9bXihhLXowLTl8XyldLztcbiAgICAgICAgaWYgKCBldi5rZXkubWF0Y2goaWxsZWdhbCkgKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnTWF0Y2hlZCBbXihhLXowLTl8XyldLCByZXR1cm5pbmcnLCBldik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBjb25zdCBvbGRUZXh0ID0gdGhpcy5lZGl0YWJsZS50ZXh0KCkubG93ZXIoKS5yZW1vdmVBbGwoaWxsZWdhbCk7XG4gICAgICAgIGxldCBuZXdUZXh0O1xuICAgICAgICBpZiAoIGJvb2wob2xkVGV4dCkgKVxuICAgICAgICAgICAgbmV3VGV4dCA9IG9sZFRleHQudG9Mb3dlckNhc2UoKSArIGV2LmtleTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgbmV3VGV4dCA9IGV2LmtleTtcbiAgICAgICAgdGhpcy5zZXRUZXh0KG5ld1RleHQpO1xuICAgICAgICAvLyB0aGlzLmVkaXRhYmxlLnRleHQobmV3VGV4dCk7XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgY29uc3Qgc3ViamVjdFN1Z2dlc3Rpb24gPSBzdWJqZWN0cy5maW5kKHMgPT4gcy5zdGFydHNXaXRoKG5ld1RleHQpKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMucmVtb3ZlQ2xhc3MoJ2lucHV0LW1pc3NpbmcnKTtcbiAgICAgICAgLypzdWJtaXRCdXR0b25cbiAgICAgICAgIC5yZW1vdmVDbGFzcygnaW5hY3RpdmUnKVxuICAgICAgICAgLmFkZENsYXNzKCdhY3RpdmUnKVxuICAgICAgICAgLmh0bWwobmV3VGV4dCk7Ki9cbiAgICAgICAgXG4gICAgICAgIGlmICggc3ViamVjdFN1Z2dlc3Rpb24gKSB7XG4gICAgICAgICAgICB0aGlzLmF1dG9jb21wbGV0ZVxuICAgICAgICAgICAgICAgIC50ZXh0KHN1YmplY3RTdWdnZXN0aW9uLnN1YnN0cihuZXdUZXh0Lmxlbmd0aCkpXG4gICAgICAgICAgICAgICAgLnJlbW92ZUF0dHIoJ2hpZGRlbicpO1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdjaGFuZ2VkIGF1dG9jb21wbGV0ZScpO1xuICAgICAgICAgICAgXG4gICAgICAgIH0gZWxzZSBpZiAoIHRoaXMuYXV0b2NvbXBsZXRlLnRleHQoKSApIHtcbiAgICAgICAgICAgIC8vIHRoaXMuYXV0b2NvbXBsZXRlLmh0bWwoJycpO1xuICAgICAgICAgICAgdGhpcy5hdXRvY29tcGxldGUuYXR0cih7IGhpZGRlbiA6IHRydWUgfSk7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ2hpZGUgYXV0b2NvbXBsZXRlJyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZW5kRW5kKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKHsgbmV3VGV4dCwgc3ViamVjdFN1Z2dlc3Rpb24sICd0aGlzLmF1dG9jb21wbGV0ZS50ZXh0KCknIDogdGhpcy5hdXRvY29tcGxldGUudGV4dCgpIH0pO1xuICAgICAgICBcbiAgICAgICAgY29uc29sZS5sb2coJ1xcbicpO1xuICAgIH1cbiAgICBcbn1cblxuXG5jbGFzcyBTdWJqZWN0RGl2IGV4dGVuZHMgRGl2IHtcbiAgICBpbnB1dDogSW5wdXQ7XG4gICAgc3VibWl0QnV0dG9uOiBCdXR0b247XG4gICAgc3VidGl0bGU6IERpdjtcbiAgICBcbiAgICBjb25zdHJ1Y3Rvcih7IGlkIH0pIHtcbiAgICAgICAgc3VwZXIoeyBpZCB9KTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGlucHV0ID0gbmV3IElucHV0KCk7XG4gICAgICAgIGNvbnN0IHN1YnRpdGxlID0gZWxlbSh7IHRhZyA6ICdoMycsIHRleHQgOiAnU3ViamVjdCcgfSk7XG4gICAgICAgIHRoaXMuY2FjaGVBcHBlbmQoeyBzdWJ0aXRsZSwgaW5wdXQgfSlcbiAgICB9XG4gICAgXG4gICAgXG59XG5cbmNvbnN0IHN1YmplY3REaXYgPSBuZXcgU3ViamVjdERpdih7IGlkIDogJ3N1YmplY3RfZGl2JyB9KTtcbmNvbnN0IHN1YmplY3RzID0gR2xvYi5CaWdDb25maWcuc3ViamVjdHM7XG5jb25zdCBzdWJtaXRCdXR0b24gPSBidXR0b24oeyBjbHMgOiAnaW5hY3RpdmUnLCBodG1sIDogJ1N1Ym1pdCcgfSk7XG5zdWJqZWN0RGl2LmNhY2hlQXBwZW5kKHsgc3VibWl0QnV0dG9uIH0pO1xuLy8gLmFkZENsYXNzKCdpbmFjdGl2ZS1idG4nKVxuLy8gLmh0bWwoJ1N1Ym1pdCcpXG4vLyAuY2xpY2sob25TdWJtaXRTdWJqZWN0Q2xpY2spO1xuZXhwb3J0IGRlZmF1bHQgc3ViamVjdERpdjtcblxuIl19