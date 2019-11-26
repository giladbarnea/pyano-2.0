"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bhe_1 = require("../../bhe");
class Keyboard extends bhe_1.BetterHTMLElement {
    constructor() {
        console.log('Keyboard ctor');
        super({
            id: 'keyboard', children: {
                C4: {
                    '[data-note="C4"]': {
                        'C#4': '[data-note="C#4"]'
                    }
                },
                D4: {
                    '[data-note="D4"]': {
                        'D#4': '[data-note="D#4"]'
                    }
                },
                E4: '[data-note="E4"]',
                F4: {
                    '[data-note="F4"]': {
                        'F#4': '[data-note="F#4"]'
                    }
                },
                G4: {
                    '[data-note="G4"]': {
                        'G#4': '[data-note="G#4"]'
                    }
                },
                A4: {
                    '[data-note="A4"]': {
                        'A#4': '[data-note="A#4"]'
                    }
                },
                B4: '[data-note="B4"]',
            }
        });
    }
}
const keyboard = new Keyboard();
exports.default = keyboard;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5Ym9hcmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJrZXlib2FyZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1DQUE4QztBQUU5QyxNQUFNLFFBQVMsU0FBUSx1QkFBaUI7SUFDcEM7UUFDSSxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQzdCLEtBQUssQ0FBQztZQUNGLEVBQUUsRUFBRyxVQUFVLEVBQUUsUUFBUSxFQUFHO2dCQUN4QixFQUFFLEVBQUc7b0JBQ0Qsa0JBQWtCLEVBQUc7d0JBQ2pCLEtBQUssRUFBRyxtQkFBbUI7cUJBQzlCO2lCQUNKO2dCQUNELEVBQUUsRUFBRztvQkFDRCxrQkFBa0IsRUFBRzt3QkFDakIsS0FBSyxFQUFHLG1CQUFtQjtxQkFDOUI7aUJBQ0o7Z0JBQ0QsRUFBRSxFQUFHLGtCQUFrQjtnQkFDdkIsRUFBRSxFQUFHO29CQUNELGtCQUFrQixFQUFHO3dCQUNqQixLQUFLLEVBQUcsbUJBQW1CO3FCQUM5QjtpQkFDSjtnQkFDRCxFQUFFLEVBQUc7b0JBQ0Qsa0JBQWtCLEVBQUc7d0JBQ2pCLEtBQUssRUFBRyxtQkFBbUI7cUJBQzlCO2lCQUNKO2dCQUNELEVBQUUsRUFBRztvQkFDRCxrQkFBa0IsRUFBRzt3QkFDakIsS0FBSyxFQUFHLG1CQUFtQjtxQkFDOUI7aUJBQ0o7Z0JBQ0QsRUFBRSxFQUFHLGtCQUFrQjthQUMxQjtTQUNKLENBQUMsQ0FBQztJQUVQLENBQUM7Q0FDSjtBQUVELE1BQU0sUUFBUSxHQUFHLElBQUksUUFBUSxFQUFFLENBQUM7QUFDaEMsa0JBQWUsUUFBUSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQmV0dGVySFRNTEVsZW1lbnQgfSBmcm9tIFwiLi4vLi4vYmhlXCI7XG5cbmNsYXNzIEtleWJvYXJkIGV4dGVuZHMgQmV0dGVySFRNTEVsZW1lbnQge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBjb25zb2xlLmxvZygnS2V5Ym9hcmQgY3RvcicpO1xuICAgICAgICBzdXBlcih7XG4gICAgICAgICAgICBpZCA6ICdrZXlib2FyZCcsIGNoaWxkcmVuIDoge1xuICAgICAgICAgICAgICAgIEM0IDoge1xuICAgICAgICAgICAgICAgICAgICAnW2RhdGEtbm90ZT1cIkM0XCJdJyA6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdDIzQnIDogJ1tkYXRhLW5vdGU9XCJDIzRcIl0nXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIEQ0IDoge1xuICAgICAgICAgICAgICAgICAgICAnW2RhdGEtbm90ZT1cIkQ0XCJdJyA6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdEIzQnIDogJ1tkYXRhLW5vdGU9XCJEIzRcIl0nXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIEU0IDogJ1tkYXRhLW5vdGU9XCJFNFwiXScsXG4gICAgICAgICAgICAgICAgRjQgOiB7XG4gICAgICAgICAgICAgICAgICAgICdbZGF0YS1ub3RlPVwiRjRcIl0nIDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgJ0YjNCcgOiAnW2RhdGEtbm90ZT1cIkYjNFwiXSdcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgRzQgOiB7XG4gICAgICAgICAgICAgICAgICAgICdbZGF0YS1ub3RlPVwiRzRcIl0nIDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgJ0cjNCcgOiAnW2RhdGEtbm90ZT1cIkcjNFwiXSdcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgQTQgOiB7XG4gICAgICAgICAgICAgICAgICAgICdbZGF0YS1ub3RlPVwiQTRcIl0nIDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgJ0EjNCcgOiAnW2RhdGEtbm90ZT1cIkEjNFwiXSdcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgQjQgOiAnW2RhdGEtbm90ZT1cIkI0XCJdJyxcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgIH1cbn1cblxuY29uc3Qga2V5Ym9hcmQgPSBuZXcgS2V5Ym9hcmQoKTtcbmV4cG9ydCBkZWZhdWx0IGtleWJvYXJkO1xuIl19