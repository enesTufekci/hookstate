import React from 'react';
import { createStateLink, useStateLink } from '@hookstate/core';

const stateLink = createStateLink(0);

setInterval(() => stateLink.set(p => p + 1), 3000)

export const ExampleComponent = () => {
    const state = useStateLink(stateLink);
    return <>
        <b>Counter value: {state.get()}</b> (watch +1 every 3 seconds) {' '}
        <button onClick={() => state.set(p => p + 1)}>Increment</button>
    </>
}