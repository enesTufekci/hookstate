import { useStateLink, createStateLink, None } from '../';

import { renderHook, act } from '@testing-library/react-hooks';
import React from 'react';

test('object: should rerender used via nested', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink({
            field1: 0,
            field2: 'str'
        })
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.nested.field1.get()).toStrictEqual(0);

    act(() => {
        result.current.nested.field1.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.nested.field1.get()).toStrictEqual(1);
    expect(Object.keys(result.current.nested)).toEqual(['field1', 'field2']);
    expect(Object.keys(result.current.get())).toEqual(['field1', 'field2']);
});

// tslint:disable-next-line: no-any
const TestSymbol = Symbol('TestSymbol') as any;
test('object: should not rerender used symbol properties', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink({
            field1: 0,
            field2: 'str'
        })
    });

    expect(TestSymbol in result.current.get()).toEqual(false)
    expect(TestSymbol in result.current.nested).toEqual(false)
    expect(result.current.get()[TestSymbol]).toEqual(undefined)
    expect(result.current.nested[TestSymbol]).toEqual(undefined)
    
    expect(() => { result.current.get().field1 = 100 })
    .toThrow('StateLink is used incorrectly. Attempted \'set\' at \'/\'. Hint: did you mean to use \'state.nested.field1.set(value)\' instead of \'state.field1 = value\'?')
    
    result.current.get()[TestSymbol] = 100

    expect(renderTimes).toStrictEqual(1);
    expect(TestSymbol in result.current.get()).toEqual(false)
    expect(TestSymbol in result.current.nested).toEqual(false)
    expect(result.current.get()[TestSymbol]).toEqual(100);
    expect(Object.keys(result.current.nested)).toEqual(['field1', 'field2']);
    expect(Object.keys(result.current.get())).toEqual(['field1', 'field2']);
    expect(result.current.get().field1).toEqual(0);
});

test('object: should rerender used when set to the same', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink({
            field: 1
        })
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.get()).toEqual({ field: 1 });

    act(() => {
        result.current.set(p => p);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.get()).toEqual({ field: 1 });
    expect(Object.keys(result.current.nested)).toEqual(['field']);
    expect(Object.keys(result.current.get())).toEqual(['field']);
});

test('object: should rerender when keys used', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink<{field: number, optional?: number} | null>({
            field: 1
        })
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.keys).toEqual(['field']);

    act(() => {
        result.current.nested!.field.set(p => p);
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.keys).toEqual(['field']);

    act(() => {
        result.current.nested!.optional.set(2);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.keys).toEqual(['field', 'optional']);

    act(() => {
        result.current.set(null);
    });
    expect(renderTimes).toStrictEqual(3);
    expect(result.current.keys).toEqual(undefined);
});

test('object: should rerender unused when new element', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink({
            field1: 0,
            field2: 'str'
        })
    });
    expect(renderTimes).toStrictEqual(1);

    act(() => {
        // tslint:disable-next-line: no-string-literal
        result.current.nested['field3'].set(1);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.get()).toEqual({
        field1: 0,
        field2: 'str',
        field3: 1
    });
    expect(Object.keys(result.current.nested)).toEqual(['field1', 'field2', 'field3']);
    expect(Object.keys(result.current.get())).toEqual(['field1', 'field2', 'field3']);
    expect(result.current.get().field1).toStrictEqual(0);
    expect(result.current.get().field2).toStrictEqual('str');
    // tslint:disable-next-line: no-string-literal
    expect(result.current.get()['field3']).toStrictEqual(1);
});

test('object: should not rerender unused property', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink({
            field1: 0,
            field2: 'str'
        })
    });
    expect(renderTimes).toStrictEqual(1);
    
    act(() => {
        result.current.nested.field1.set(p => p + 1);
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.get().field1).toStrictEqual(1);
});

test('object: should not rerender unused self', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink({
            field1: 0,
            field2: 'str'
        })
    });

    act(() => {
        result.current.nested.field1.set(2);
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.get().field1).toStrictEqual(2);
});

test('object: should delete property when set to none', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink({
            field1: 0,
            field2: 'str',
            field3: true
        })
    });
    expect(renderTimes).toStrictEqual(1);
    expect(result.current.get().field1).toStrictEqual(0);
    
    act(() => {
        // deleting existing property
        result.current.nested.field1.set(None);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.get()).toEqual({ field2: 'str', field3: true });

    act(() => {
        // deleting non existing property
        result.current.nested.field1.set(None);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.get()).toEqual({ field2: 'str', field3: true });
    
    act(() => {
        // inserting property
        result.current.nested.field1.set(1);
    });
    expect(renderTimes).toStrictEqual(3);
    expect(result.current.get().field1).toEqual(1);

    act(() => {
        // deleting existing but not used in render property
        result.current.nested.field2.set(None);
    });
    expect(renderTimes).toStrictEqual(4);
    expect(result.current.get()).toEqual({ field1: 1, field3: true });

    // deleting root value makes it promised
    act(() => {
        result.current.set(None)
    })
    expect(result.current.promised).toEqual(true)
    expect(renderTimes).toStrictEqual(5);
});

test('object: should auto save latest state for unmounted', async () => {
    const state = createStateLink({
        field1: 0,
        field2: 'str'
    })
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink(state)
    });
    const unmountedLink = state.access().nested
    expect(unmountedLink.field1.get()).toStrictEqual(0);
    expect(result.current.get().field1).toStrictEqual(0);

    act(() => {
        result.current.nested.field1.set(2);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(unmountedLink.field1.get()).toStrictEqual(2);
    expect(result.current.get().field1).toStrictEqual(2);
});

test('object: should set to null', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink<{} | null>({})
    });

    result.current.get()
    act(() => {
        result.current.set(p => null);
        result.current.set(null);
    });
    expect(renderTimes).toStrictEqual(2);
});

test('object: should denull', async () => {
    let renderTimes = 0
    const { result } = renderHook(() => {
        renderTimes += 1;
        return useStateLink<{} | null>({})
    });

    const state = result.current.denull()
    expect(state ? state.value : null).toEqual({})
    act(() => {
        result.current.set(p => null);
        result.current.set(null);
    });
    expect(renderTimes).toStrictEqual(2);
    expect(result.current.denull()).toEqual(null)
});
