import { useState, useEffect } from "react"
import { SmartContract, Args, bytesToStr } from "@massalabs/massa-web3"
import { PAYSTREAM_CONTRACT_ADDRESS } from "@/contract"
import { useWallet } from "@/contexts/wallet-context"
import { toast } from "@/hooks/use-toast"
import type { Stream } from "@/types/stream"

export function useStreams() {
    const { provider } = useWallet()
    const [streams, setStreams] = useState<Stream[]>([])
    const [isFetching, setIsFetching] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchStreamData = async () => {
        if (!provider) {
            console.log("No provider available")
            setIsFetching(false)
            return
        }

        try {
            setIsFetching(true)
            setError(null)
            console.log("Creating SmartContract instance...")

            // Create smart contract instance
            const payStreamContract = new SmartContract(provider, PAYSTREAM_CONTRACT_ADDRESS)
            console.log("SmartContract created, getting stream length...")

            // Get total number of streams
            const streamLengthResult = await payStreamContract.read('getStreamLength')
            const streamLengthStr = bytesToStr(streamLengthResult.value)
            const streamLengthNum = parseInt(streamLengthStr)
            console.log("Total streams:", streamLengthNum)

            const allStreams: Stream[] = []

            // Loop through all streams with .0 suffix
            console.log("Starting loop, total streams:", streamLengthNum)
            for (let i = 1; i <= streamLengthNum; i++) {
                console.log(`Processing stream ${i}.0/${streamLengthNum}`)
                try {
                    // Prepare arguments for getStreamInfo function with .0 suffix
                    const args = new Args().addString(`${i}.0`)
                    console.log(`${i}.0`, "stream ID")
                    // Call the smart contract to get stream info
                    const result = await payStreamContract.read('getStreamInfo', args)
                    const streamData = new Args(result.value)
                    console.log(streamData, "data")

                    // Check if the stream data is valid (not empty)
                    if (streamData.serialized.length === 0) {
                        console.log(`Stream ${i}.0 is empty, skipping...`)
                        continue
                    }

                    // Parse the returned data with validation
                    const payer = streamData.nextString()
                    if (!payer || payer === "") {
                        console.log(`Stream ${i}.0 has invalid payer, skipping...`)
                        continue
                    }

                    const payee = streamData.nextString()
                    if (!payee || payee === "") {
                        console.log(`Stream ${i}.0 has invalid payee, skipping...`)
                        continue
                    }

                    const amount = streamData.nextString()
                    if (!amount || amount === "") {
                        console.log(`Stream ${i}.0 has invalid amount, skipping...`)
                        continue
                    }

                    const interval = streamData.nextU64()

                    // The status and nextPaymentAt seem to be combined, let's handle this differently
                    const statusAndNextPayment = streamData.nextString()

                    // Split the combined string
                    const cleanStatus = statusAndNextPayment.replace(/\0/g, '').split(/\d+/)[0].trim()
                    const nextPaymentMatch = statusAndNextPayment.match(/\d+/)
                    const nextPaymentAt = nextPaymentMatch ? BigInt(nextPaymentMatch[0]) : BigInt(0)

                    // Validate the stream data
                    if (cleanStatus !== "active" && cleanStatus !== "paused" && cleanStatus !== "cancelled") {
                        console.log(`Stream ${i}.0 has invalid status: ${cleanStatus}, skipping...`)
                        continue
                    }

                    // Create stream object
                    const streamInfo: Stream = {
                        id: `${i}.0`,
                        payer,
                        payee,
                        amount,
                        interval: Number(interval),
                        nextPayment: Number(nextPaymentAt),
                        status: cleanStatus as "active" | "paused" | "cancelled",
                        createdAt: Math.floor(Date.now() / 1000), // Using current time as fallback
                        totalPaid: "0", // This would need to be fetched separately
                        paymentsCount: 0, // This would need to be fetched separately
                    }

                    console.log(streamInfo)

                    allStreams.push(streamInfo)
                    console.log(`Fetched stream ${i}.0:`, streamInfo)
                } catch (error) {
                    console.error(`Error fetching stream ${i}.0:`, error)
                    // Continue with next stream even if one fails
                }
            }

            setStreams(allStreams)
            console.log("All streams fetched:", allStreams)
        } catch (error) {
            console.error("Error fetching stream data:", error)
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
            setError(errorMessage)
            toast({
                title: "Failed to Fetch Stream",
                description: errorMessage,
                variant: "destructive",
            })
        } finally {
            setIsFetching(false)
        }
    }

    useEffect(() => {
        fetchStreamData()
    }, [provider])

    return {
        streams,
        isFetching,
        error,
        refetch: fetchStreamData
    }
} 