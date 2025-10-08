// FIX: Import React to provide the namespace for React.DependencyList.
import React, { useEffect, useRef } from 'react';

const useDebouncedEffect = (callback: () => void, delay: number, deps: React.DependencyList) => {
    const firstUpdate = useRef(true);
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        // Don't run on initial mount
        if (firstUpdate.current) {
            firstUpdate.current = false;
            return;
        }

        const handler = setTimeout(() => {
            callbackRef.current();
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [delay, ...deps]);
};

export default useDebouncedEffect;
