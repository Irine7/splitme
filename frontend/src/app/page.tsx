'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { GroupList } from '@/components/group-list';
import { ExpenseList } from '@/components/expense-list';
import { BalanceCard } from '@/components/balance-card';
import { Plus, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateGroupModal } from '@/components/modals/create-group-modal';
import { GroupCarousel } from '@/components/group-carousel';

export default function HomePage() {
	const { isConnected } = useAccount();
	const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
	const [showCreateGroup, setShowCreateGroup] = useState(false);

	if (!isConnected) {
		return (
			<div className="min-h-screen bg-background/50 bg-gradient-to-br from-background to-muted/30 flex items-center justify-center p-4">
				<div className="glass-card border-gray-200 dark:border-gray-800 max-w-md w-full p-8 text-center animate-fade-in">
					<h1 className="text-4xl md:text-5xl font-bebas mb-4 text-gradient">
						SplitMe
					</h1>
					<p className="text-foreground/80 mb-8 text-lg">
						Split expenses easily with your friends on Morph
					</p>
					{/* <div className="flex justify-center">
						<ConnectButton.Custom>
							{({ openConnectModal }) => (
								<Button
									onClick={openConnectModal}
									size="lg"
									className="group relative overflow-hidden text-gray-300 hover:bg-purple-50 hover:text-purple-600 dark:text-gray-300 dark:hover:bg-purple-900/30 dark:hover:text-purple-400"
								>
									<Wallet className="w-5 h-5 mr-2" />
									Connect Wallet
									<span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
								</Button>
							)}
						</ConnectButton.Custom>
					</div> */}
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background/50">
			<div className="container mx-auto px-4 py-8 max-w-7xl">
				<div className="grid grid-cols-1 lg:grid-cols-4 gap-6 ">
					{/* Groups Sidebar */}
					<div className="lg:col-span-1">
						<div className="glass-card p-6 h-full flex flex-col border-gray-200 dark:border-gray-800">
							<div className="flex flex-col items-center justify-between mb-6 pb-4 border-b border-border/30">
								{/* 3D Object (Rocket) */}
								<div className="object-3d mb-8">
									<div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center">
										{/* Replace with actual rocket image */}
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											className="w-12 h-12 text-gray-400"
										>
											<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
											<path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
											<path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path>
											<path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>
										</svg>
									</div>
								</div>
								<h2 className="text-2xl font-bebas tracking-wider text-foreground">
									Your Splits
								</h2>
								<Button
									onClick={() => setShowCreateGroup(true)}
									variant="outline"
									size="sm"
									className="border-border/50 hover:border-accent/50 transition-colors"
								>
									<Plus className="w-4 h-4 mr-1.5" />
									Add New Split
								</Button>
							</div>
							<div className="flex-1 overflow-y-auto pr-2 -mr-2">
								<GroupList
									selectedGroupId={selectedGroupId}
									onSelectGroup={setSelectedGroupId}
								/>
							</div>
						</div>
					</div>

					{/* Main Content */}
					<div className="lg:col-span-3">
						{selectedGroupId ? (
							<div className="space-y-6">
								<BalanceCard groupId={selectedGroupId} />
								<ExpenseList groupId={selectedGroupId} />
							</div>
						) : (
							<div className="space-y-8">
								<div className="glass-card p-8 border-gray-200 dark:border-gray-800">
									<h3 className="text-2xl font-medium mb-6">
										Create or Join a Split
									</h3>
									<p className="text-foreground/70 mb-6">
										Choose a category below to create a new expense sharing
										split or join an existing one.
									</p>

									{/* Group Carousel */}
									<GroupCarousel onSelectGroup={setSelectedGroupId} />
								</div>

								<div className="glass-card p-8 text-center border-gray-200 dark:border-gray-800">
									<div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4 mx-auto">
										<div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
											<Plus className="w-5 h-5 text-accent" />
										</div>
									</div>
									<h3 className="text-xl font-medium mb-2">No Active Groups</h3>
									<p className="text-foreground/70 max-w-md mx-auto">
										You don't have any active expense sharing groups yet. Create
										a new group above to get started.
									</p>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			<CreateGroupModal
				isOpen={showCreateGroup}
				onClose={() => setShowCreateGroup(false)}
			/>
		</div>
	);
}
