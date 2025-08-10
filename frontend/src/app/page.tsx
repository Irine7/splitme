'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Navigation } from '@/components/nav';
import { GroupList } from '@/components/group-list';
import { ExpenseList } from '@/components/expense-list';
import { BalanceCard } from '@/components/balance-card';
import { Plus, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateGroupModal } from '@/components/modals/create-group-modal';

export default function HomePage() {
	const { isConnected } = useAccount();
	const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
	const [showCreateGroup, setShowCreateGroup] = useState(false);

	if (!isConnected) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center p-4">
				<div className="glass-card max-w-md w-full p-8 text-center animate-fade-in">
					<h1 className="text-4xl md:text-5xl font-bebas mb-4 text-gradient">
						SplitMe
					</h1>
					<p className="text-foreground/80 mb-8 text-lg">
						Split expenses easily with your friends on Morph Layer 2
					</p>
					<div className="flex justify-center">
						<ConnectButton.Custom>
							{({ openConnectModal }) => (
								<Button
									onClick={openConnectModal}
									size="lg"
									className="group relative overflow-hidden"
								>
									<Wallet className="w-5 h-5 mr-2" />
									Connect Wallet
									<span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
								</Button>
							)}
						</ConnectButton.Custom>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background/50">
			<Navigation />

			<div className="container mx-auto px-4 py-8 max-w-7xl">
				<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
					{/* Groups Sidebar */}
					<div className="lg:col-span-1">
						<div className="glass-card p-6 h-full flex flex-col">
							<div className="flex flex-col items-center justify-between mb-6 pb-4 border-b border-border/30">
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
							<div className="glass-card p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
								<div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mb-6">
									<div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
										<Plus className="w-5 h-5 text-accent" />
									</div>
								</div>
								<h3 className="text-2xl font-bebas tracking-wider text-foreground mb-3">
									Select a group to get started
								</h3>
								<p className="text-foreground/70 max-w-md">
									Choose a group from the sidebar to view expenses and balances,
									or create a new group to begin.
								</p>
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
