import { describe, expect, it } from "vitest"
import { packBins } from "./index.js"


describe("packBins", () => {
    it("returns empty list for zero bins", () => {
        const bins = packBins({}, 0, 0.5)
        expect(bins).toEqual([])
    })

    it("solves standard bin packing", () => {
        const bins = packBins({
            "one": 1,
            "two": 2,
            "three": 3,
        }, 2, 1)

        expect(bins).toEqual([
            {
                size: 3, contents: [
                    { id: "three", size: 3, shardIndex: 0, numShards: 1 }
                ]
            },
            {
                size: 3, contents: [
                    { id: "two", size: 2, shardIndex: 0, numShards: 1 },
                    { id: "one", size: 1, shardIndex: 0, numShards: 1 },
                ]
            },
        ])
    })

    it("content with size zero is skipped", () => {
        const bins = packBins({
            "zero": 0,
        }, 1, 1)

        expect(bins).toEqual([
            { size: 0, contents: [] }
        ])
    })

    it("splits large content", () => {
        const bins = packBins({
            "four": 4,
        }, 2, 1)

        expect(bins).toEqual([
            {
                size: 2, contents: [
                    { id: "four", size: 2, shardIndex: 1, numShards: 2 }
                ]
            },
            {
                size: 2, contents: [
                    { id: "four", size: 2, shardIndex: 0, numShards: 2 },
                ]
            },
        ])
    })

    it("splits large content and bin packs alongside small content", () => {
        const bins = packBins({
            "two": 2,
            "four": 4,
        }, 3, 1)

        expect(bins).toEqual([
            {
                size: 2, contents: [
                    { id: "four", size: 2, shardIndex: 1, numShards: 2 }
                ]
            },
            {
                size: 2, contents: [
                    { id: "four", size: 2, shardIndex: 0, numShards: 2 },
                ]
            },
            {
                size: 2, contents: [
                    { id: "two", size: 2, shardIndex: 0, numShards: 1 },
                ]
            },
        ])
    })

    it("irregular content with lower uniformity", () => {
        const bins = packBins({
            "two": 2,
            "five": 5,
        }, 3, 0.75)

        expect(bins).toEqual([
            {
                size: 2.5, contents: [
                    { id: "five", size: 2.5, shardIndex: 1, numShards: 2 }
                ]
            },
            {
                size: 2.5, contents: [
                    { id: "five", size: 2.5, shardIndex: 0, numShards: 2 },
                ]
            },
            {
                size: 2, contents: [
                    { id: "two", size: 2, shardIndex: 0, numShards: 1 },
                ]
            },
        ])
    })

    it("zero uniformity places everything in the first bin", () => {
        const bins = packBins({
            "one": 1,
            "two": 2,
            "three": 3,
        }, 2, 0)

        expect(bins).toEqual([
            {
                size: 6, contents: [
                    { id: "three", size: 3, shardIndex: 0, numShards: 1 },
                    { id: "two", size: 2, shardIndex: 0, numShards: 1 },
                    { id: "one", size: 1, shardIndex: 0, numShards: 1 },
                ]
            },
            {
                size: 0, contents: []
            },
        ])
    })

    it("high quantity of irregular content with non-perfect uniformity", () => {
        const bins = packBins({
            "one": 684210,
            "two": 571840,
            "three": 493670,
            "four": 421350,
            "five": 367920,
            "six": 318470,
            "seven": 281630,
            "eight": 247890,
            "nine": 221540,
            "ten": 198760,
            "eleven": 181420,
            "twelve": 166830,
            "thirteen": 153290,
            "fourteen": 141760,
            "fifteen": 131480,
            "sixteen": 122370,
            "seventeen": 114920,
            "eighteen": 108340,
            "nineteen": 102170,
            "twenty": 96480,
            "twenty-one": 91320,
            "twenty-two": 86750,
            "twenty-three": 82410,
            "twenty-four": 78360,
            "twenty-five": 74620,
            "twenty-six": 71180,
            "twenty-seven": 68140,
            "twenty-eight": 65270,
            "twenty-nine": 62580,
            "thirty": 60120,
            "thirty-one": 57840,
            "thirty-two": 55690,
            "thirty-three": 53620,
            "thirty-four": 51740,
            "thirty-five": 49930,
            "thirty-six": 48210,
            "thirty-seven": 46580,
            "thirty-eight": 44960,
            "thirty-nine": 43420,
            "forty": 41980,
            "forty-one": 40560,
            "forty-two": 39240,
            "forty-three": 37980,
            "forty-four": 36710,
            "forty-five": 35540,
            "forty-six": 34380,
            "forty-seven": 33260,
            "forty-eight": 32140,
            "forty-nine": 31080,
            "fifty": 30020,
            "fifty-one": 29040,
            "fifty-two": 28070,
            "fifty-three": 27180,
            "fifty-four": 26320,
            "fifty-five": 25490,
            "fifty-six": 24670,
            "fifty-seven": 23880,
            "fifty-eight": 23120,
            "fifty-nine": 22410,
            "sixty": 21720,
            "sixty-one": 21050,
            "sixty-two": 20390,
            "sixty-three": 19760,
            "sixty-four": 19140,
            "sixty-five": 18550,
            "sixty-six": 17980,
            "sixty-seven": 17420,
            "sixty-eight": 16880,
            "sixty-nine": 16350,
            "seventy": 15840,
            "seventy-one": 15340,
            "seventy-two": 14860,
            "seventy-three": 14390,
            "seventy-four": 13940,
            "seventy-five": 13510,
            "seventy-six": 13080,
            "seventy-seven": 12670,
            "seventy-eight": 12280,
            "seventy-nine": 11890,
            "eighty": 11520,
            "eighty-one": 11160,
            "eighty-two": 10810,
            "eighty-three": 10470,
            "eighty-four": 10140,
            "eighty-five": 9810,
            "eighty-six": 9480,
            "eighty-seven": 9160,
            "eighty-eight": 8850,
            "eighty-nine": 8540,
            "ninety": 8240,
            "ninety-one": 7950,
            "ninety-two": 7660,
            "ninety-three": 7380,
            "ninety-four": 7110,
            "ninety-five": 6840,
            "ninety-six": 6570,
            "ninety-seven": 6310,
            "ninety-eight": 6050,
            "ninety-nine": 5790,
            "one-hundred": 5530,
        }, 100, 0.95)

        expect(bins.length).toBe(100)

        let totalSize = 0
        let totalError = 0
        for (const bin of bins) {
            totalSize += bin.size
            totalError += Math.abs(bin.size - 74445.6)
        }

        expect(totalSize).toBe(7444560)
        expect(totalError / 100).lessThanOrEqual(74445.6 * 0.1)
    })
})