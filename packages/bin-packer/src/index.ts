import { PriorityQueue } from "./PriorityQueue.ts"

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
    const unpackedContents = new PriorityQueue<Size, UnpackedContent>(
        (a, b) => {
            return b - a // Largest size at front of queue.
        }
    )

    for (const id in contentIdToSize) {
        const size = contentIdToSize[id]!
        totalSize += size
        unpackedContents.offer(size, {
            id,
            size,
            shardIndex: 0,
            numShards: 1,
        })
    }

    const maxBinSize = totalSize / uniformityCoefficient
    let sizeLeftInLeastPackedBin = maxBinSize

    const bins: PackedBin[] = new Array(numBins).map(() => {
        return { size: 0, content: [] }
    })
    let currentBinIndex = 0

    while (unpackedContents.getSize() > 0) {
        const didSplit = splitUnpackedContentIfTooLarge(unpackedContents, sizeLeftInLeastPackedBin)
        if (didSplit) {
            currentBinIndex = 0
            continue
        }

        const binToPack = bins[currentBinIndex]!
        const didPack = tryPackBin(unpackedContents, binToPack, maxBinSize)
        if (didPack) {
            sizeLeftInLeastPackedBin = Math.min(maxBinSize - binToPack.size, sizeLeftInLeastPackedBin)
        } else {
            currentBinIndex++

            // TODO handle properly...?
            if (currentBinIndex >= numBins) {
                throw new Error("Uh oh...")
            }
        }
    }

    return bins
}

function splitUnpackedContentIfTooLarge(unpackedContents: PriorityQueue<Size, UnpackedContent>, maxSize: number): boolean {
    const largest = unpackedContents.peek()!
    if (largest.size <= maxSize) {
        return false
    }

    // If this results in a second tree traversal, a `pollIf` method could be implemented as an optimization.
    unpackedContents.poll()
    const splitSize = largest.size / 2
    const splitNumShards = largest.numShards * 2
    const a: UnpackedContent = {
        id: largest.id,
        size: splitSize,
        shardIndex: largest.shardIndex,
        numShards: splitNumShards
    }
    const b: UnpackedContent = {
        id: largest.id,
        size: splitSize,
        shardIndex: largest.shardIndex + largest.numShards,
        numShards: splitNumShards
    }
    unpackedContents.offer(splitSize, a)
    unpackedContents.offer(splitSize, b)
    return true
}

function tryPackBin(unpackedContents: PriorityQueue<Size, UnpackedContent>, bin: PackedBin, maxBinSize: number): boolean {
    const sizeLeft = maxBinSize - bin.size
    const largestContentThatFitsInBin = unpackedContents.pollCeiling(sizeLeft)
    if (largestContentThatFitsInBin === null) {
        return false
    }

    bin.size += largestContentThatFitsInBin.size
    bin.content.push(largestContentThatFitsInBin)
    return true
}

type ContentId = string
type Size = number
type ContentIdToSize = Record<ContentId, Size>
type PackedBin = {
    size: Size
    content: PackedContent[]
}
type PackedContent = {
    id: ContentId
    shardIndex: number
    numShards: number
}
type UnpackedContent = {
    id: ContentId
    size: Size
    shardIndex: number
    numShards: number
}
