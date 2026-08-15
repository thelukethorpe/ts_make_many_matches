import { OrderedMap, OrderedMapIterator } from "js-sdsl"

export class PriorityQueue<K, V> {
    private size = 0
    private readonly orderedMap: OrderedMap<K, V[]>

    constructor(cmp: (x: K, y: K) => number) {
        this.orderedMap = new OrderedMap(undefined, cmp)
    }

    getSize(): number {
        return this.size
    }

    offer(k: K, v: V): void {
        this.size++
        const it = this.orderedMap.lowerBound(k)
        if (it.equals(this.orderedMap.end())) {
            this.orderedMap.setElement(k, [v])
            return
        }

        const [pK, pVs] = it.pointer
        if (pK === k) {
            pVs.push(v)
            return
        }

        this.orderedMap.setElement(k, [v], it)
    }

    peek(): V | null {
        const front = this.orderedMap.front()
        if (front === undefined) {
            return null
        }

        const vs = front[1]
        return vs[vs.length - 1]!
    }

    poll(): V | null {
        const it = this.orderedMap.begin()
        return this.pollIt(it)
    }

    pollCeiling(k: K): V | null {
        const it = this.orderedMap.lowerBound(k)
        return this.pollIt(it)
    }

    private pollIt(it: OrderedMapIterator<K, V[]>): V | null {
        if (it.equals(this.orderedMap.end())) {
            return null
        }

        this.size--
        const vs = it.pointer[1]
        const v = vs.pop()
        if (vs.length === 0) {
            this.orderedMap.eraseElementByIterator(it)
        }
        return v!
    }
}
