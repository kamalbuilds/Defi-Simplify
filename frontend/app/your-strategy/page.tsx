"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getOffchainAuthKeys } from "@/utils/greenfield.utils"
import {
    GetBucketMetaResponse,
    ListObjectsByBucketNameResponse,
    SpResponse,
} from "@bnb-chain/greenfield-js-sdk"
import {
    Database,
    Download,
    FolderPlus,
    MoreVertical,
    Plus,
    Trash2,
    Upload,
} from "lucide-react"
import { ConnectButton, useActiveAccount } from "thirdweb/react"

import { greenFieldClient, selectSp } from "@/config/greenfield.config"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import AddressLabel from "@/components/AddressLabel"
import TimestampToDate from "@/components/TimeStamp"
import Spinner from '@/components/Spinner'
import WalletConnect from "@/components/WalletConnect"
import { useAccount } from 'wagmi';
interface Bucket {
    id: string
    name: string
    objectCount: number
    size: string
    created: string
}

interface StorageObject {
    id: string
    name: string
    type: string
    size: string
    created: string
}

export default function YourStrategyPage() {
    const [bucketList, setBucketList] = useState<
        SpResponse<GetBucketMetaResponse> | any[]
    >([])
    const activeAccount = useActiveAccount()
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [strategyList, setStrategyLists] = useState<
        SpResponse<ListObjectsByBucketNameResponse> | any[]
    >([])

    const { connector } = useAccount();

    const [isDeleting, setIsDeleting] = useState(false);

    console.log("greenFieldClient", greenFieldClient)

    const getBucketList = async () => {
        if (!activeAccount) return
        setIsLoading(true);
        try {
            const spInfo = await selectSp()
            const strategyList = await greenFieldClient.object.listObjects({
                bucketName: activeAccount.address.toLowerCase(),
                endpoint: spInfo.endpoint,
            })
            console.log("strategyList: ", strategyList)

            if (strategyList.statusCode === 200) {
                const { Objects } =
                    strategyList.body?.GfSpListObjectsByBucketNameResponse
                console.log("Objects", Objects)
                setStrategyLists(Objects)
                setIsLoading(false);
            } else {
                alert("Error in fetching list")
                setStrategyLists([])
                setIsLoading(false);
            }
        } catch (error) {
            console.log("Error", error)
            setStrategyLists([])
            setIsLoading(false);
        }
    }

    useEffect(() => {
        getBucketList()
    }, [activeAccount])

    const handleDeleteStrategy = async ({
        objectName,
    }: {
        objectName: string
    }) => {
        if (!activeAccount) return

        setIsDeleting(true)
        try {
            const deleteBucketTx = await greenFieldClient.object.deleteObject({
                bucketName: activeAccount.address,
                objectName: objectName,
                operator: activeAccount.address,
            })

            const simulateInfo = await deleteBucketTx.simulate({
                denom: "BNB",
            })

            console.log("simulateInfo", simulateInfo)

            const res = await deleteBucketTx.broadcast({
                denom: "BNB",
                gasLimit: Number(simulateInfo?.gasLimit),
                gasPrice: simulateInfo?.gasPrice || "5000000000",
                payer: activeAccount.address,
                granter: "",
            })

            console.log("res", res)

            if (res.code === 0) {
                alert("success")
                setIsDeleting(false)
            }
        } catch (error) {
            console.log("Error in deleting >>>>>", error)
            setIsDeleting(false)
        }
    }

    const handleDownloadStrategy = async ({
        objectName,
    }: {
        objectName: string
    }) => {
        if (!activeAccount) return
        try {
            const spInfo = await selectSp()
            console.log("spInfo", spInfo)

            const provider = await connector?.getProvider();
            const offChainData = await getOffchainAuthKeys(activeAccount.address, provider);
            if (!offChainData) {
                alert('No offchain, please create offchain pairs first');
                return;
            }

            const res = await greenFieldClient.object.downloadFile(
                {
                    bucketName: activeAccount.address,
                    objectName,
                },
                {
                    type: 'EDDSA',
                    address: activeAccount.address,
                    domain: window.location.origin,
                    seed: offChainData.seedString,
                },
            );

            // console.log(res);
        } catch (error) {
            console.log("Error", error)
        }
    }



    return (
        <div className="flex min-h-screen flex-col space-y-6 p-8">
            <header className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight">
                        Storage Dashboard
                    </h1>
                    <p className="text-muted-foreground">
                        Manage your buckets and storage objects.
                    </p>
                </div>
            </header>

            {isLoading && (
                <div className="flex min-h-[50vh] items-center justify-center">
                    <Spinner />
                </div>
            )}

            {!activeAccount && (
                <div className="flex min-h-[50vh] items-center justify-center">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle>Connect Your Wallet</CardTitle>
                            <CardDescription>
                                Please connect your wallet to view your storage dashboard.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <WalletConnect />
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeAccount &&
                Array.isArray(strategyList) &&
                strategyList.length === 0 && (
                    <div className="flex min-h-[50vh] items-center justify-center">
                        <Card className="w-full max-w-md">
                            <CardHeader>
                                <CardTitle>No Strategies Found</CardTitle>
                                <CardDescription>
                                    You have not created any strategy yet.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/batch">
                                    <Button>
                                        <FolderPlus className="mr-2 size-4" />
                                        Create Your First strategy
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                )}

            {activeAccount &&
                !isLoading &&
                Array.isArray(strategyList) &&
                strategyList.length !== 0 && (
                    <div className="">
                        <Card>
                            <CardHeader>
                                <CardTitle>Strategies</CardTitle>
                                <CardDescription>
                                    List of Strategies that you have created
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Objects</TableHead>
                                            <TableHead>Created</TableHead>
                                            <TableHead>Creator</TableHead>
                                            <TableHead></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {strategyList.map((strategy, id) => {
                                            console.log("Strategy >>>", strategy)

                                            const { ObjectInfo } = strategy

                                            return (
                                                <TableRow
                                                    key={id}
                                                    className="cursor-pointer hover:bg-muted/50"
                                                >
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center">
                                                            <Database className="mr-2 size-4 text-muted-foreground" />
                                                            {ObjectInfo.ObjectName}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{ObjectInfo.ContentType}</TableCell>
                                                    <TableCell>
                                                        <TimestampToDate timestamp={ObjectInfo.CreateAt} />
                                                    </TableCell>
                                                    <TableCell>
                                                        <AddressLabel
                                                            address={ObjectInfo.Creator}
                                                            character={6}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm">
                                                                    <MoreVertical className="size-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        handleDownloadStrategy(
                                                                            ObjectInfo.objectName
                                                                        )
                                                                    }}
                                                                >
                                                                    <Download className="mr-2 size-4" />
                                                                    Download
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        handleDeleteStrategy(ObjectInfo.ObjectName)
                                                                    }}
                                                                    className="text-destructive"
                                                                >
                                                                    <Trash2 className="mr-2 size-4" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                )}
        </div>
    )
}
