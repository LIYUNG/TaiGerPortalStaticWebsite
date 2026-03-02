interface TestInterface {
    name: string;
}

export interface TestInterface2 extends TestInterface {
    age: number;
}

export const test = (t: TestInterface) => {
    return t.name;
}

export const test2 = (t: TestInterface2) => {
    test(t);
}