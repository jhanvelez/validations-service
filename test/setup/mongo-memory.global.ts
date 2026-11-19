import { MongoMemoryServer } from 'mongodb-memory-server';
import type { TestProject } from 'vitest/node';

declare module 'vitest' {
  export interface ProvidedContext {
    mongoUri: string;
  }
}

let mongo: MongoMemoryServer;

export async function setup(project: TestProject): Promise<void> {
  mongo = await MongoMemoryServer.create();
  project.provide('mongoUri', mongo.getUri('validations-e2e'));
}

export async function teardown(): Promise<void> {
  await mongo.stop();
}