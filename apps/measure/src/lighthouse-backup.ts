import { $ } from "bun"
import * as fs from 'node:fs/promises'
import * as path from "node:path";

export type Lighthouse = {
    ttfb: number, // time to first byte
    fcp: number,
    lcp: number,
    tbt: number,
}

export async function measureLighthouse(url: string) {
    console.log(`Starting measuring ${url}`)
    const execution = $`bunx lhci collect --url ${url} -n=5 --additive=false`

    await execution

    const files = await fs
        .readdir("./.lighthouseci")
        .then(i =>
            i
                .filter(i => i.endsWith('.json') && i.startsWith('lhr'))
                .map(i => Bun.file(path.join('./.lighthouseci/', i))))

    const results: Lighthouse[] = []
    for (const file of files) {
        results.push(await readFromFile(file))
    }

    const result = results.reduce((previousValue, currentValue) => {
        previousValue.ttfb += currentValue.ttfb
        previousValue.tbt += currentValue.tbt
        previousValue.fcp += currentValue.fcp
        previousValue.lcp += currentValue.lcp

        return previousValue
    }, {
        ttfb: 0, // time to first byte
        fcp: 0,
        lcp: 0,
        tbt: 0,
    } satisfies Lighthouse)


    result.ttfb /= 5;
    result.fcp /= 5;
    result.lcp /= 5;
    result.tbt /= 5;

    console.log(`Measured ${url}:`, result)

    return result
}

async function readFromFile(file: Bun.BunFile): Promise<Lighthouse> {
    const json = await file.json()

    return {
        tbt: json['audits']['total-blocking-time']['numericValue'],
        ttfb: json['audits']['server-response-time']['numericValue'],
        fcp: json['audits']['first-contentful-paint']['numericValue'],
        lcp: json['audits']['largest-contentful-paint']['numericValue'],
    }
}