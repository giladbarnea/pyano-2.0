"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bhe_1 = require("../../../bhe");
class SubjectDiv extends bhe_1.Div {
    constructor({ id }) {
        super({ id });
        this.cacheAppend({
            input: bhe_1.div({ cls: 'input' }),
        });
    }
}
const subjectDiv = new SubjectDiv({ id: 'subject_div' });
exports.default = subjectDiv;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3ViamVjdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInN1YmplY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFLQSxzQ0FBOEQ7QUFFOUQsTUFBTSxVQUFXLFNBQVEsU0FBRztJQUd4QixZQUFZLEVBQUUsRUFBRSxFQUFFO1FBQ2QsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNkLElBQUksQ0FBQyxXQUFXLENBQUM7WUFDYixLQUFLLEVBQUcsU0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFHLE9BQU8sRUFBRSxDQUFDO1NBRWpDLENBQUMsQ0FBQTtJQUNOLENBQUM7Q0FHSjtBQUVELE1BQU0sVUFBVSxHQUFHLElBQUksVUFBVSxDQUFDLEVBQUUsRUFBRSxFQUFHLGFBQWEsRUFBRSxDQUFDLENBQUM7QUFDMUQsa0JBQWUsVUFBVSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLy8gKiAgcGFnZXMvTmV3L3NlY3Rpb25zL3N1YmplY3RcblxuLyoqXG4gKiBpbXBvcnQgc2VjdGlvbnMgZnJvbSBcIi4vc2VjdGlvbnNcIlxuICogc2VjdGlvbnMuc3ViamVjdCovXG5pbXBvcnQgeyBkaXYsIGVsZW0sIGJ1dHRvbiwgRGl2LCBCdXR0b24gfSBmcm9tIFwiLi4vLi4vLi4vYmhlXCI7XG5cbmNsYXNzIFN1YmplY3REaXYgZXh0ZW5kcyBEaXYge1xuICAgIFxuICAgIFxuICAgIGNvbnN0cnVjdG9yKHsgaWQgfSkge1xuICAgICAgICBzdXBlcih7IGlkIH0pO1xuICAgICAgICB0aGlzLmNhY2hlQXBwZW5kKHtcbiAgICAgICAgICAgIGlucHV0IDogZGl2KHsgY2xzIDogJ2lucHV0JyB9KSxcbiAgICAgICAgICAgIFxuICAgICAgICB9KVxuICAgIH1cbiAgICBcbiAgICBcbn1cblxuY29uc3Qgc3ViamVjdERpdiA9IG5ldyBTdWJqZWN0RGl2KHsgaWQgOiAnc3ViamVjdF9kaXYnIH0pO1xuZXhwb3J0IGRlZmF1bHQgc3ViamVjdERpdjtcblxuIl19