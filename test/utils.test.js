import { Utils } from '../src/js/utils.js';

test('utils.js:compareSetupDicts() synced', () => {
    let unsynced = Utils.compareSetupDicts({
        test: { value: 'value'}
    }, {
        test: { value: 'value' }
    });
    expect(unsynced.length).toBe(0);
})

test('utils.js:compareSetupDicts() unsynced', () => {
    let unsynced = Utils.compareSetupDicts({
        test: { value: 'value'}
    }, {
        test: { value: 'value2' }
    });
    expect(unsynced.length).toBe(1);
})

test('utils.js:setupValuesToDict()', () => {
    const setupValues = [
        { name: 'test', value: 'test', status: 'Default' }
    ]
    expect(Utils.setupValuesToDict(setupValues)).toEqual({
        test: { name: 'test', value: 'test', status: 'Default' }
    })
})

test('utils.js:dictToSetupValues() filtered to one element in array "test"', () => {
    const setupDict = {
        test: { name: 'test', value: 'test', status: 'Default' },
        test2: { name: 'test2', value: 'test', status: 'Default' }
    }

    expect(Utils.dictToSetupValues(setupDict, ['test'])).toEqual([
        { name: 'test', value: 'test' }
    ])
})

test('utils.js:dictToSetupValues() filtered to empty array', () => {
    const setupDict = {
        test: { name: 'test', value: 'test', status: 'Default' },
        test2: { name: 'test2', value: 'test', status: 'Default' }
    }

    expect(Utils.dictToSetupValues(setupDict, [])).toEqual([])
})