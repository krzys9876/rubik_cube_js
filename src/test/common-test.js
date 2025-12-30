export function assertEquals(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(`Assertion failed with message: ${message}. Expected: ${expected}. Got: ${actual}`);
    }
}

export function assertEqualsRounded(actual, expected, precissionDigits, message) {
    let factor = 10^precissionDigits;
    let actualRounded = Math.round(actual * factor) / factor;
    let expectedRounded = Math.round(expected * factor) / factor;
    if (actualRounded !== expectedRounded) {
        throw new Error(`Assertion failed with message: ${message}. Expected: ${expected}. Got: ${actual} (precission: ${precissionDigits} digits`);
    }
}

export function assertTrue(condition, message) {
    assertEquals(condition, true, message);
}

export function assertFalse(condition, message) {
    assertEquals(condition, false, message);
}

export function runTest(test) {
    console.log(`Running test: ${test.name}`);
    test();
    console.log(`Passed test: ${test.name}`);
}
