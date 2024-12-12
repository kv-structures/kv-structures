import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { RedisMap } from "../src/RedisMap.ts";
import { init, RedisClient } from '../src/init.ts';
import { beforeEach } from 'node:test';


let client: RedisClient;

beforeAll(async () => {
    client = await init();
});

beforeEach(async () => {
    const map = new RedisMap("test");
    await map.clear();
});

afterAll(async () => {
    const map = new RedisMap("test");
    await map.clear();

    await client.quit();
});

describe("RedisMap", () => {
    it("should be defined when name is autogenerated", () => {
        const map = new RedisMap();
        expect(map).toBeDefined();
    });

    it("should be defined when name is provided", () => {
        const map = new RedisMap("test");
        expect(map).toBeDefined();
        expect(map.name).toBe("test");
    });

    it("returns a value which was set including ttl options and then delete", async () => {
        const map = new RedisMap("test");
        await map.set("key", "value");
        const value = await map.get("key");
        expect(value).toBe("value");

        await map.delete("key");
        const valueDeleted = await map.get("key");
        expect(valueDeleted).toBeNull();

        await map.set("key", "value", 100);
        const has1 = await map.has("key");
        expect(has1).toBe(true);

        const value2 = await map.get("key");
        expect(value2).toBe("value");

        await new Promise((resolve) => setTimeout(resolve, 100));

        const has2 = await map.has("key");
        expect(has2).toBe(false);

        const value3 = await map.get("key");
        expect(value3).toBeNull();
    });

    it("returns size and keys", async () => {
        const map = new RedisMap("test");

        const elements = 11;
        for (let i = 0; i < elements; i++) {
            await map.set(`key${i}`, `value${i}`);
        }

        const size = await map.size();
        expect(size).toBe(elements);

        const mapKeys: string[] = [];
        for await (const keys of map.keys()) {
            mapKeys.push(...keys);
        }

        mapKeys.sort((a, b) => Number(a.slice(3)) > Number(b.slice(3)) ? 1 : -1);
        expect(mapKeys).toEqual(Array.from({ length: elements }, (_, i) => `key${i}`));
    });

    it("clears a Map", async () => {
        const map = new RedisMap("test");

        const elements = 11;
        for (let i = 0; i < elements; i++) {
            await map.set(`key${i}`, `value${i}`);
        }

        const size = await map.size();
        expect(size).toBe(elements);

        await map.clear();

        const size2 = await map.size();
        expect(size2).toBe(0);
    });

    it("incements and decrements values", async () => {
        const map = new RedisMap("test");

        await map.set("key", 0);
        await map.increment("key", 1);
        const value = await map.get("key");
        expect(value).toBe(1);

        await map.decrement("key", 1);
        const value2 = await map.get("key");
        expect(value2).toBe(0);

        await map.increment("key", 1.5);
        const value3 = await map.get("key");
        expect(value3).toBe(1.5);

        await map.decrement("key", 1.5);
        const value4 = await map.get("key");
        expect(value4).toBe(0);
    });
});
