'use client';

import React, { useState } from 'react';
import { useAddressBookStore, AddressEntry } from '@/stores/address-book-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, AlertCircle } from 'lucide-react';
import { isAddress } from 'viem';
import toast from 'react-hot-toast';

function AddressBook() {
	const { entries, addEntry, removeEntry } = useAddressBookStore();
	const [newAddress, setNewAddress] = useState<string>('');
	const [newOwnerName, setNewOwnerName] = useState<string>('');
	const [addressError, setAddressError] = useState<string>('');
	const [ownerError, setOwnerError] = useState<string>('');

	// Группировка записей по имени владельца для отображения
	const entriesByOwner = entries.reduce<Record<string, AddressEntry[]>>((acc, entry) => {
		if (!acc[entry.ownerName]) {
			acc[entry.ownerName] = [];
		}
		acc[entry.ownerName].push(entry);
		return acc;
	}, {});

	const validateForm = () => {
		let isValid = true;

		// Проверка адреса
		if (!newAddress) {
			setAddressError('Wallet address is required');
			isValid = false;
		} else if (!isAddress(newAddress)) {
			setAddressError('Invalid Ethereum address');
			isValid = false;
		} else {
			setAddressError('');
		}

		// Проверка имени владельца
		if (!newOwnerName.trim()) {
			setOwnerError('Owner name is required');
			isValid = false;
		} else {
			setOwnerError('');
		}

		return isValid;
	};

	const handleAddEntry = () => {
		if (!validateForm()) return;

		const result = addEntry({
			address: newAddress as `0x${string}`,
			ownerName: newOwnerName.trim()
		});

		if (result.success) {
			toast.success(`Address ${newAddress} added for ${newOwnerName}`);
			setNewAddress('');
			setNewOwnerName('');
		} else {
			toast.error(result.error || 'An error occurred while adding the address');
		}
	};

	const handleRemoveEntry = (address: `0x${string}`) => {
		removeEntry(address);
		toast.success(`Address ${address} has been removed from the address book`);
	};

	return (
		<div className="container mx-auto px-4 py-8 min-h-[80vh] flex flex-col">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 glass-card bg-card dark:bg-background/30 rounded-lg shadow-lg p-8 flex-1">
				<h2 className="text-2xl font-semibold text-foreground dark:text-white/90 mb-6">
					Address Book
				</h2>
				<p className="text-muted-foreground dark:text-white/60 mb-8">
					Add wallet addresses and their owners for use when creating splits
				</p>

				{/* Форма добавления нового адреса */}
				<div className="bg-background/50 dark:bg-background/20 p-6 rounded-lg mb-8">
					<h3 className="text-lg font-medium mb-4">Add New Address</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<Label htmlFor="ownerName" className="mb-2 block">
								Owner Name
							</Label>
							<Input
								id="ownerName"
								value={newOwnerName}
								onChange={(e) => setNewOwnerName(e.target.value)}
								placeholder="Enter owner name"
								className={ownerError ? 'border-red-500' : ''}
							/>
							{ownerError && (
								<p className="text-red-500 text-sm mt-1 flex items-center">
									<AlertCircle className="w-3 h-3 mr-1" />
									{ownerError}
								</p>
							)}
						</div>

						<div>
							<Label htmlFor="walletAddress" className="mb-2 block">
								Wallet Address
							</Label>
							<Input
								id="walletAddress"
								value={newAddress}
								onChange={(e) => setNewAddress(e.target.value)}
								placeholder="0x..."
								className={addressError ? 'border-red-500' : ''}
							/>
							{addressError && (
								<p className="text-red-500 text-sm mt-1 flex items-center">
									<AlertCircle className="w-3 h-3 mr-1" />
									{addressError}
								</p>
							)}
						</div>
					</div>

					<Button
						onClick={handleAddEntry}
						className="mt-4 bg-purple-600 hover:bg-purple-700 text-white"
					>
						<Plus className="w-4 h-4 mr-2" />
						Add Address
					</Button>
				</div>

				{/* Записи адресной книги */}
				<div>
					<h3 className="text-lg font-medium mb-4">Saved Addresses</h3>

					{Object.keys(entriesByOwner).length === 0 ? (
						<div className="text-center py-8 text-muted-foreground dark:text-white/60">
							No saved addresses in the address book yet
						</div>
					) : (
						<div className="space-y-6">
							{Object.entries(entriesByOwner).map(([ownerName, ownerEntries]) => (
								<div key={ownerName} className="bg-background/50 dark:bg-background/20 p-4 rounded-lg">
									<h4 className="font-medium text-foreground dark:text-white/90 mb-2">
										{ownerName}
									</h4>
									<div className="space-y-2">
										{ownerEntries.map((entry) => (
											<div
												key={entry.address}
												className="flex items-center justify-between py-2 px-3 bg-background/80 dark:bg-background/40 rounded-md"
											>
												<div className="font-mono text-sm truncate max-w-[70%]">{entry.address}</div>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleRemoveEntry(entry.address)}
													className="text-red-500 hover:text-red-600 hover:bg-red-100/20"
												>
													<Trash2 className="w-4 h-4" />
												</Button>
											</div>
										))}
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default AddressBook;