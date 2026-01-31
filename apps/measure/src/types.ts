import type { ProjectType } from "./config.ts";

export interface ModuleData {
  project: string;
  projectType: ProjectType;
  chunk: string;
  module: string;
  moduleName: string;
  isNodeModule: boolean;
  sizeRaw: number;
  sizeGzip: number;
  sizeBrotli: number;
  percentOfChunk: number;
  percentOfProject: number;
}

export interface BundleData {
  projectName: string;
  projectType: ProjectType;
  totalSize: number;
  modules: ModuleData[];
}

export interface BuildResult {
  projectName: string;
  success: boolean;
  error?: string;
  bundleData?: BundleData;
}
