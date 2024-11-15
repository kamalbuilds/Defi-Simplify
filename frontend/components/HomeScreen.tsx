'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Moon, Sun, Menu, Wallet, Repeat, Box, BarChart2, Shield, ChevronDown, Share, Twitter, Github } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { Protocols } from '@/config/protocols'
import Image from 'next/image'

const FloatingOrb = ({ className }: { className?: string }) => (
    <motion.div
        className={`absolute rounded-full opacity-20 blur-3xl ${className}`}
        animate={{
            y: ['0%', '100%', '0%'],
            scale: [1, 1.2, 1],
        }}
        transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
        }}
    />
)

export const HomeScreen = () => {
    const { setTheme } = useTheme()

    return (
        <div className="from-background to-background relative min-h-screen overflow-hidden bg-gradient-to-br">
            {/* Background Orbs */}
            <FloatingOrb className="-left-48 -top-48 size-96 bg-purple-400 dark:bg-purple-600" />
            <FloatingOrb className="-right-48 top-1/4 size-96 bg-blue-400 dark:bg-blue-600" />
            <FloatingOrb className="-left-48 bottom-1/4 size-96 bg-emerald-400 dark:bg-emerald-600" />

            <main className="relative">
                <section className="container px-4 py-32 md:py-48">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mx-auto max-w-[800px] text-center"
                    >
                        <h1 className="text-4xl font-bold tracking-tight md:text-[6rem]">
                            <span className="animate-pulse bg-gradient-to-r from-purple-400 to-blue-600 bg-clip-text text-transparent"> TradeX</span>
                        </h1>
                        <div className='my-12 flex flex-col gap-1'>
                            <p className="text-muted-foreground mx-auto max-w-[600px]  text-xl md:text-2xl">
                                CrossChain DEX Aggregator & Strategy Builder
                            </p>
                            <p className="text-muted-foreground mx-auto max-w-[600px] text-xl md:text-2xl">
                                Building, Executing, and Sharing Cross-Chain Trading Strategies Made Simple
                            </p>
                        </div>
                        <div className="flex justify-center gap-4">
                            <Link href='/batch'>
                                <Button size="lg" className="gap-2">
                                    Start Trading <ArrowRight className="size-4" />
                                </Button>
                            </Link>
                            <Link href='https://t.me/kamalthedev' target='_blank'>
                                <Button size="lg" variant="outline">
                                    Contact Us
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </section>

                <section className="container px-4 py-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="mx-auto mb-16 max-w-[800px] text-center"
                    >
                        <h2 className="mb-6 text-3xl font-bold md:text-4xl">Features</h2>
                        <p className="text-muted-foreground text-xl">
                            List of Features that our dapp provides over other competitiors.
                        </p>
                    </motion.div>
                    <div className="grid gap-8 md:grid-cols-2">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            viewport={{ once: true }}
                        >
                            <Card className="group relative overflow-hidden">
                                <CardContent className="p-6">
                                    <div className="bg-primary/10 mb-4 w-fit rounded-lg p-3">
                                        <Repeat className="text-primary size-6" />
                                    </div>
                                    <h3 className="mb-2 text-xl font-semibold">Cross-Chain Swaps</h3>
                                    <p className="text-muted-foreground">
                                        Seamlessly trade assets across multiple blockchains with optimal routing and MEV protection.
                                    </p>
                                </CardContent>
                                <div className="from-primary/10 to-primary/5 absolute inset-0 bg-gradient-to-r opacity-0 transition-opacity group-hover:opacity-100" />
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            viewport={{ once: true }}
                        >
                            <Card className="group relative overflow-hidden">
                                <CardContent className="p-6">
                                    <div className="bg-primary/10 mb-4 w-fit rounded-lg p-3">
                                        <Box className="text-primary size-6" />
                                    </div>
                                    <h3 className="mb-2 text-xl font-semibold">Strategy Builder</h3>
                                    <p className="text-muted-foreground">
                                        Create and share custom trading strategies with our visual block-based builder. Execute transactions using smart account in one click
                                    </p>
                                </CardContent>
                                <div className="from-primary/10 to-primary/5 absolute inset-0 bg-gradient-to-r opacity-0 transition-opacity group-hover:opacity-100" />
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            viewport={{ once: true }}
                        >
                            <Card className="group relative overflow-hidden">
                                <CardContent className="p-6">
                                    <div className="bg-primary/10 mb-4 w-fit rounded-lg p-3">
                                        <Shield className="text-primary size-6" />
                                    </div>
                                    <h3 className="mb-2 text-xl font-semibold">Security First</h3>
                                    <p className="text-muted-foreground">
                                        Built-in MEV protection and secure cross-chain transaction handling.
                                    </p>
                                </CardContent>
                                <div className="from-primary/10 to-primary/5 absolute inset-0 bg-gradient-to-r opacity-0 transition-opacity group-hover:opacity-100" />
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            viewport={{ once: true }}
                        >
                            <Card className="group relative overflow-hidden">
                                <CardContent className="p-6">
                                    <div className="bg-primary/10 mb-4 w-fit rounded-lg p-3">
                                        <Share className="text-primary size-6" />
                                    </div>
                                    <h3 className="mb-2 text-xl font-semibold">Save and Share</h3>
                                    <p className="text-muted-foreground">
                                        Save Your strategy using GreenField and share it with your community
                                    </p>
                                </CardContent>
                                <div className="from-primary/10 to-primary/5 absolute inset-0 bg-gradient-to-r opacity-0 transition-opacity group-hover:opacity-100" />
                            </Card>
                        </motion.div>
                    </div>
                </section>

                <section className="container px-4 py-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="mx-auto mb-16 max-w-[800px] text-center"
                    >
                        <h2 className="mb-6 text-3xl font-bold md:text-4xl">Supported Protocols</h2>
                        <p className="text-muted-foreground text-xl">
                            Integrated with leading DEXs and cross-chain protocols for optimal trading experience.
                        </p>
                    </motion.div>
                    <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                        {Protocols.map((protocol, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="hover:bg-accent flex items-center justify-center rounded-lg bg-gray-100 p-6 transition-colors dark:bg-gray-700"
                            >
                                <div className='flex items-center justify-center gap-2'>
                                    <Image src={protocol.image} height={30} width={30} alt={protocol.name} />
                                    <span className="font-semibold">{protocol.name}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                <section className="container px-4 py-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="text-center"
                    >
                        <h2 className="mb-12 text-3xl font-bold md:text-4xl">Ready to start trading?</h2>
                        <Button size="lg" className="gap-2">
                            Launch App <ArrowRight className="size-4" />
                        </Button>
                    </motion.div>
                </section>
            </main>

            <footer className="border-t">
                <div className="container px-4 py-8">
                    <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                        <div className="flex items-center gap-2">
                            <Wallet className="size-5" />
                            <span className="font-semibold">TradeX</span>
                        </div>
                        <div className="flex gap-6">
                            <Link href="https://twitter.com/abhish_3k" target='_blank' className="text-muted-foreground hover:text-foreground text-sm">
                                <Twitter />
                            </Link>
                            <Link href="https://github.com/kamalbuilds/BNB-Trading-Aggregator" target='_blank' className="text-muted-foreground hover:text-foreground text-sm">
                                <Github />
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}