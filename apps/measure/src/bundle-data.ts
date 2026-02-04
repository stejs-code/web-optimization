import { spawn } from 'bun';
import { join } from 'path';

interface Project {
    name: string;
    path: string;
    type: 'nextjs' | 'vite';
    buildCommand: string;
    url: string;
}

interface Config {
    projects: Project[];
}

interface ElasticsearchDocument {
    file: string;
    moduleName: string;
    bundle: string;
    project: string;
    size: number;
    gzipSize: number;
}

interface NextJsStatsGroup {
    path: string;
    statSize: number;
    parsedSize: number;
    gzipSize: number;
    groups?: NextJsStatsGroup[];
}

interface NextJsStats extends NextJsStatsGroup {
    label: string;
}


interface ViteStatsNode {
    name: string;
    uid: string;
    children?: ViteStatsNode[];
}

interface ViteStats {
    tree: {
        children?: ViteStatsNode[];
    };
    nodeParts: {
        [uid: string]: {
            "id": string,
            renderedLength: number;
            gzipLength: number;
            "brotliLength": number,
            "metaUid": string
        };
    };
    nodeMetas: Record<string, {
        "id": string,
        "moduleParts": Record<string, string>,
        "imported": { "uid": string }[],
        "importedBy": { "uid": string }[],
        "isEntry": boolean
    }>;
}

function getModuleName(filePath: string): string {
    const nodeModulesIndex = filePath.indexOf('node_modules/');
    if (nodeModulesIndex !== -1) {
        const pathAfterNodeModules = filePath.substring(
            nodeModulesIndex + 'node_modules/'.length,
        );
        const pathParts = pathAfterNodeModules.split('/');
        if (pathParts[0] && pathParts[0].startsWith('@')) {
            return `${pathParts[0]}/${pathParts[1]}`;
        }
        return pathParts[0] ?? '';
    }
    return filePath;
}

function extractNextJsStats(
    bundle: NextJsStats,
    project: Project,
): ElasticsearchDocument[] {
    const documents: ElasticsearchDocument[] = [];

    function recurse(group: NextJsStatsGroup, bundleLabel: string) {
        if (group.path) {
            documents.push({
                file: group.path,
                moduleName: getModuleName(group.path),
                bundle: bundleLabel,
                project: project.name,
                size: group.parsedSize,
                gzipSize: group.gzipSize,
            });
        }

        if (group.groups) {
            for (const subGroup of group.groups) {
                recurse(subGroup, bundleLabel);
            }
        }
    }

    recurse(bundle, bundle.label);

    return documents;
}

function extractViteStats(
    stats: ViteStats,
    project: Project,
): ElasticsearchDocument[] {
    const documents: ElasticsearchDocument[] = [];
    const { nodeParts, nodeMetas } = stats;

    // function recurse(node: ViteStatsNode, bundleName: string) {
    //     const part = node.uid ? nodeParts[node.uid] : undefined;
    //
    //     if (part) {
    //         documents.push({
    //             file: node.name,
    //             moduleName: getModuleName(node.name),
    //             bundle: bundleName,
    //             project: project.name,
    //             size: part.renderedLength,
    //             gzipSize: part.gzipLength || 0,
    //         });
    //     }
    //
    //     if (node.children) {
    //         for (const child of node.children) {
    //             recurse(child, bundleName);
    //         }
    //     }
    // }
    //
    // if (tree.children) {
    //     for (const bundleNode of tree.children) {
    //         recurse(bundleNode, bundleNode.name);
    //     }
    // }

    if (nodeMetas) {
        for (const metaKey in nodeMetas) {
            const meta = nodeMetas[metaKey]
            if (!meta) continue
            const moduleName = getModuleName(meta.id)

            for (const modulePartsKey in meta.moduleParts) {
                const node = nodeParts[meta.moduleParts[modulePartsKey] ?? '']
                if (!node) continue

                documents.push({
                    file: meta.id,
                    moduleName: moduleName,
                    bundle: modulePartsKey,
                    project: project.name,
                    size: node.renderedLength,
                    gzipSize: node.gzipLength || 0,
                });
            }
        }
    }

    return documents;
}

async function getBundleData() {
    const configFile = Bun.file(join(import.meta.dir, '../config.json'));
    const config: Config = await configFile.json();

    const allStats: ElasticsearchDocument[] = [];

    for (const project of config.projects) {
        console.log(`Building ${project.name}...`);

        const buildCommand = project.buildCommand.split(' ');
        const command = buildCommand.shift();
        const args = buildCommand;

        const env: Record<string, string> = { ...process.env } as Record<
            string,
            string
        >;

        if (project.type === 'nextjs' || project.type === 'vite') {
            env.ANALYZE = 'true';
        }

        const buildProcess = spawn([command!, ...args], {
            cwd: project.path,
            env,
            stdio: ['inherit', 'inherit', 'inherit'],
        });

        await buildProcess.exited;

        console.log(`Parsing stats for ${project.name}...`);

        const statsPath =
            project.type === 'nextjs'
                ? join(project.path, '.next', 'analyze', 'client.json')
                : join(project.path, 'stats.json');

        const statsFile = Bun.file(statsPath);

        if (!(await statsFile.exists())) {
            console.error(`stats.json not found for ${project.name}`);
            continue;
        }

        const stats = await statsFile.json();

        if (project.type === 'nextjs') {
            const nextJsStats = stats as NextJsStats[];

            for (const bundle of nextJsStats) {
                allStats.push(...extractNextJsStats(bundle, project));
            }
        } else if (project.type === 'vite') {
            const viteStats = stats as ViteStats;
            if (viteStats.tree && viteStats.nodeParts) {
                allStats.push(...extractViteStats(viteStats, project));
            } else {
                console.error(`Incompatible stats.json format for ${project.name}`);
            }
        }
    }


    const outputFile = Bun.file(join(import.meta.dir, '../bundle-stats.ndjson'));
    await Bun.write(outputFile, allStats.map(doc => JSON.stringify(doc)).join('\n'));

    console.log('Bundle data collected and saved to bundle-stats.ndjson');
}

await getBundleData();
