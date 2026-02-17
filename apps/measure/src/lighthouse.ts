import { $ } from "bun"
import * as fs from 'node:fs/promises'
import * as path from "node:path";
import { parseArgs } from "util";

export type Lighthouse = {
    ttfb: number, // time to first byte
    fcp: number,
    lcp: number,
    tbt: number,
}

export async function measureLighthouse(url: string) {
    console.log(`Starting measuring ${url}`)
    const execution = $`bunx lhci collect --url ${url} --additive=false`

    await execution
    console.log("Getting results:")
    const files = await fs
        .readdir("./.lighthouseci")
        .then(i =>
            i
                .filter(i => i.endsWith('.json') && i.startsWith('lhr'))
                .map(i => {
                    const filePath = path.join('./.lighthouseci/', i);
                    console.log("filePath:", filePath)
                    return Bun.file(filePath)
                }))

    console.log("Results:", files)
    const results: Lighthouse[] = []
    for (const file of files) {
        const res = await readFromFile(file)

        results.push(res)
        console.log("url:", JSON.stringify({ ...res }))
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


    result.ttfb /= 10;
    result.fcp /= 10;
    result.lcp /= 10;
    result.tbt /= 10;

    console.log("Final Results:")
    console.log(JSON.stringify({ url, ...result }))

    console.log()
    console.log()

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

async function main() {
    let { values: { config } } = parseArgs({
        args: Bun.argv,
        options: {
            config: {
                type: 'string',
            },
        },
        strict: true,
        allowPositionals: true,
    });


    config ??= './config.json'

    const file = Bun.file(config)
    const json = await file.json()

    const data = [];
    for (const project of json.projects) {
        data.push(await measureLighthouse(project.url));
    }

    Bun.write('./lh-results.json', JSON.stringify(data, null, 2))
}

await main()
