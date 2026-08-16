import { PriorityQueue } from "./PriorityQueue.js"

/**
 * Packs content into bins according to a given uniformity, sharding the content if necessary.
 * @param contentIdToSize 
 * @param numBins 
 * @param uniformityCoefficient
 * @returns 
 */
export function packBins(contentIdToSize: Readonly<ContentIdToSize>, numBins: number, uniformityCoefficient: number): PackedBin[] {
    if (numBins <= 0) {
        return []
    }

    let totalSize = 0
    const unpackedContents = new PriorityQueue<Size, Content>(
        (a, b) => {
            return b - a // Largest size at front of queue.
        }
    )

    for (const id in contentIdToSize) {
        const size = contentIdToSize[id]!
        if (size <= 0) {
            continue
        }

        totalSize += size
        unpackedContents.offer(size, {
            id,
            size,
            shardIndex: 0,
            numShards: 1,
        })
    }

    const maxBinSize = totalSize / (numBins * uniformityCoefficient)

    const bins = new Array<PackedBin>(numBins)
    for (let i = 0; i < bins.length; i++) {
        bins[i] = { size: 0, contents: [] }
    }
    let currentBinIndex = 0
    let leastPackedBinIndex = 0
    let sizeLeftInLeastPackedBin = maxBinSize

    while (unpackedContents.getSize() > 0) {
        const didSplit = splitUnpackedContentIfTooLarge(unpackedContents, sizeLeftInLeastPackedBin)
        if (didSplit) {
            currentBinIndex = 0
            continue
        }

        const binToPack = bins[currentBinIndex]!
        const didPack = tryPackBin(unpackedContents, binToPack, maxBinSize)
        if (!didPack) {
            currentBinIndex++
        } else if (currentBinIndex === leastPackedBinIndex) {
            leastPackedBinIndex = getLeastPackedBinIndex(bins)
            const leastPackedBin = bins[leastPackedBinIndex]!
            sizeLeftInLeastPackedBin = maxBinSize - leastPackedBin.size
        }
    }

    return bins
}

function splitUnpackedContentIfTooLarge(unpackedContents: PriorityQueue<Size, Content>, maxSize: number): boolean {
    const largest = unpackedContents.peek()!
    if (largest.size <= maxSize) {
        return false
    }

    // If this results in a second tree traversal, a `pollIf` method could be implemented as an optimization.
    unpackedContents.poll()
    const splitSize = largest.size / 2
    const splitNumShards = largest.numShards * 2
    const a: Content = {
        id: largest.id,
        size: splitSize,
        shardIndex: largest.shardIndex,
        numShards: splitNumShards
    }
    const b: Content = {
        id: largest.id,
        size: splitSize,
        shardIndex: largest.shardIndex + largest.numShards,
        numShards: splitNumShards
    }
    unpackedContents.offer(splitSize, a)
    unpackedContents.offer(splitSize, b)
    return true
}

function tryPackBin(unpackedContents: PriorityQueue<Size, Content>, bin: PackedBin, maxBinSize: number): boolean {
    const sizeLeft = maxBinSize - bin.size
    const largestContentThatFitsInBin = unpackedContents.pollCeiling(sizeLeft)
    if (largestContentThatFitsInBin === null) {
        return false
    }

    bin.size += largestContentThatFitsInBin.size
    bin.contents.push(largestContentThatFitsInBin)
    return true
}

function getLeastPackedBinIndex(bins: PackedBin[]): number {
    let leastPackedBinIndex = 0
    let leastPackedBinSize = Infinity
    for (let i = 0; i < bins.length; i++) {
        const bin = bins[i]!
        if (bin.size < leastPackedBinSize) {
            leastPackedBinIndex = i
            leastPackedBinSize = bin.size
        }
    }
    return leastPackedBinIndex
}

type ContentId = string
type Size = number
type ContentIdToSize = Record<ContentId, Size>
type PackedBin = {
    size: Size
    contents: Content[]
}
type Content = {
    id: ContentId
    size: Size
    shardIndex: number
    numShards: number
}
