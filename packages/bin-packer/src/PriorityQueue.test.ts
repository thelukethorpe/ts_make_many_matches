import { describe, expect, it } from "vitest";
import { PriorityQueue } from "./PriorityQueue.js";

describe("PriorityQueue", () => {
    it("peek returns the smallest element without removing it", () => {
        const priorityQueue = new PriorityQueue<number, string>((a, b) => { return a - b })
        expect(priorityQueue.peek()).toBe(null)

        priorityQueue.offer(2, "two")
        expect(priorityQueue.peek()).toBe("two")

        priorityQueue.offer(3, "three")
        expect(priorityQueue.peek()).toBe("two")

        priorityQueue.offer(1, "one")
        expect(priorityQueue.peek()).toBe("one")
    })

    it("poll returns and removes smallest element", () => {
        const priorityQueue = new PriorityQueue<number, string>((a, b) => { return a - b })

        priorityQueue.offer(2, "two")
        priorityQueue.offer(3, "three")
        priorityQueue.offer(1, "one")

        expect(priorityQueue.poll()).toBe("one")
        expect(priorityQueue.poll()).toBe("two")
        expect(priorityQueue.poll()).toBe("three")
        expect(priorityQueue.poll()).toBe(null)
    })

    it("size returns the number of elements", () => {
        const priorityQueue = new PriorityQueue<number, string>((a, b) => { return a - b })
        expect(priorityQueue.getSize()).toBe(0)

        priorityQueue.offer(1, "one")
        expect(priorityQueue.getSize()).toBe(1)

        priorityQueue.offer(2, "two")
        expect(priorityQueue.getSize()).toBe(2)

        priorityQueue.poll()
        expect(priorityQueue.getSize()).toBe(1)

        priorityQueue.poll()
        expect(priorityQueue.getSize()).toBe(0)

        priorityQueue.poll()
        expect(priorityQueue.getSize()).toBe(0)
    })

    it("pollCeiling returns and removes the smallest element GTE a given bound", () => {
        const priorityQueue = new PriorityQueue<number, string>((a, b) => { return a - b })

        // Tests greater-than sub-case.
        priorityQueue.offer(3, "three")
        priorityQueue.offer(9, "nine")
        priorityQueue.offer(5, "five")
        priorityQueue.offer(7, "seven")
        priorityQueue.offer(1, "one")

        expect(priorityQueue.pollCeiling(10)).toBe(null)
        expect(priorityQueue.pollCeiling(8)).toBe("nine")
        expect(priorityQueue.pollCeiling(6)).toBe("seven")
        expect(priorityQueue.pollCeiling(4)).toBe("five")
        expect(priorityQueue.pollCeiling(2)).toBe("three")
        expect(priorityQueue.pollCeiling(0)).toBe("one")

        // Tests equal-to sub-case.
        priorityQueue.offer(3, "three")
        priorityQueue.offer(9, "nine")
        priorityQueue.offer(5, "five")
        priorityQueue.offer(7, "seven")
        priorityQueue.offer(1, "one")

        expect(priorityQueue.pollCeiling(9)).toBe("nine")
        expect(priorityQueue.pollCeiling(7)).toBe("seven")
        expect(priorityQueue.pollCeiling(5)).toBe("five")
        expect(priorityQueue.pollCeiling(3)).toBe("three")
        expect(priorityQueue.pollCeiling(1)).toBe("one")

        // Tests polling behavior.
        priorityQueue.offer(3, "three")
        priorityQueue.offer(9, "nine")
        priorityQueue.offer(5, "five")
        priorityQueue.offer(7, "seven")
        priorityQueue.offer(1, "one")

        expect(priorityQueue.pollCeiling(4)).toBe("five")
        expect(priorityQueue.pollCeiling(4)).toBe("seven")
        expect(priorityQueue.pollCeiling(4)).toBe("nine")
        expect(priorityQueue.pollCeiling(4)).toBe(null)

        expect(priorityQueue.pollCeiling(0)).toBe("one")
        expect(priorityQueue.pollCeiling(0)).toBe("three")
        expect(priorityQueue.pollCeiling(0)).toBe(null)
    })
})
