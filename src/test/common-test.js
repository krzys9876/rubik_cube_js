export function assertEquals(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(`Assertion failed with message: ${message}. Expected: ${expected}. Got: ${actual}`);
    }
}

export function assertEqualsRounded(actual, expected, precisionDigits, message) {
    let factor = 10^precisionDigits;
    let actualRounded = Math.round(actual * factor) / factor;
    let expectedRounded = Math.round(expected * factor) / factor;
    if (actualRounded !== expectedRounded) {
        throw new Error(`Assertion failed with message: ${message}. Expected: ${expected}. Got: ${actual} (precission: ${precisionDigits} digits`);
    }
}

export function assertTrue(condition, message) {
    assertEquals(condition, true, message);
}

export function assertFalse(condition, message) {
    assertEquals(condition, false, message);
}

export function assertEqualMatrices(actual, expected, precisionDigits, message) {
    assertEquals(actual.length, expected.length, 'Matrices should have the same number of rows');
    for(let row = 0; row < actual.length; row++) {
        assertEquals(actual[row].length, expected[row].length, `Matrices should have the same number of columns in each row (row ${row}`);
        for(let col = 0; col < actual[row].length; col++) {
            assertEqualsRounded(actual[row][col], expected[row][col], precisionDigits, `${message} (row ${row} col ${col})`);
        }
    }
}

export function assertEqualCoords(actual, expected, precisionDigits, message) {
    assertEqualsRounded(actual.x, expected.x, precisionDigits, `${message} (x)`);
    assertEqualsRounded(actual.y, expected.y, precisionDigits, `${message} (y)`);
    assertEqualsRounded(actual.z, expected.z, precisionDigits, `${message} (z)`);
}

export function runTest(test) {
    console.log(`Running test: ${test.name}`);
    test();
    console.log(`Passed test: ${test.name}`);
}
