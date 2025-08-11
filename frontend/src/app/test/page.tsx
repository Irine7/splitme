import React from 'react'
import MasterclassDemo from '../components/MasterclassDemo';
import { BalanceCard } from '@/components/balance-card';

function page() {
	return (
		<div>
			<BalanceCard groupId={1} />
			{/* <MasterclassDemo /> */}
		</div>
	)
}

export default page