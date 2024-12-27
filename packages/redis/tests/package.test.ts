import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { redisInit, RedisMap } from '../dist/index.mjs';
import type { RedisClient } from '../dist/index.d.mts';


let client: RedisClient;

beforeAll(async () => {
    client = await redisInit();
    const map = new RedisMap("testRedisPackage");
    await map.clear();
});

afterAll(async () => {
    const map = new RedisMap("testRedisPackage");
    await map.clear();

    await client.quit();
});

describe("Testing /redis package build", () => {
    test("redisInit() returns a client", async () => {
        expect(client).toBeDefined();
    });

    test("RedisMap is defined", async () => {
        const map = new RedisMap("testRedisPackage");
        expect(map).toBeDefined();
    });

    test("set() and get() works", async () => {
        const map = new RedisMap("testRedisPackage");
        await map.set("key", "value");
        const value = await map.get("key");
        expect(value).toBe("value");
    });
});