import { assertEquals, runTest} from "./common-test.js";
import { Movement } from "../main/cube.js";
import { SideType } from "../main/common.js";

function testDummyTranslation() {
    const codes = ['U','U1','D','D1'];
    codes.forEach(c => {
       const movement = Movement.from(c);
       const translated = movement.translate(SideType.FRONT);
       assertEquals(translated, movement, 'Sides UP and DOWN are not translatable');
    });
}

function testVerticalSidesTranslation() {
    const codes = [
        ['F', SideType.FRONT], ['F', SideType.LEFT], ['F', SideType.BACK], ['F', SideType.RIGHT],
        ['L', SideType.FRONT], ['L', SideType.LEFT], ['L', SideType.BACK], ['L', SideType.RIGHT],
        ['B', SideType.FRONT], ['B', SideType.LEFT], ['B', SideType.BACK], ['B', SideType.RIGHT],
        ['R', SideType.FRONT], ['R', SideType.LEFT], ['R', SideType.BACK], ['R', SideType.RIGHT],
    ];
    const expected = [
        'F', 'L', 'B', 'R',
        'L', 'B', 'R', 'F',
        'B', 'R', 'F', 'L',
        'R', 'F', 'L', 'B'
    ];
    for(let i = 0; i < codes.length; i++) {
        const code = codes[i][0];
        const frontSide = codes[i][1];
        const movement = Movement.from(code);
        const translatedCode = movement.translate(frontSide).toCode();
        console.log(code, frontSide, expected[i]);
        assertEquals(translatedCode, expected[i], 'Should translate (rotate) move according to selected front side');
        const movement1 = Movement.from(code+"1");
        const translatedCode1 = movement1.translate(frontSide).toCode();
        assertEquals(translatedCode1, expected[i]+"1", 'Should translate (rotate) move according to selected front side');
    }
}

runTest(testDummyTranslation);
runTest(testVerticalSidesTranslation);
