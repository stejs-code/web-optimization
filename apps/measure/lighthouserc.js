export const ci = {
    collect: {
        numberOfRuns: 10,
        settings: {
            preset: 'perf',  // or 'perf' for mobile
            // explicitly set throttling so it's documented
            throttlingMethod: 'simulate',
        },
    },
};