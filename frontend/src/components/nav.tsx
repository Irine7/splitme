'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { Github, Menu, Wallet, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import Image from 'next/image';
import { ThemeToggle } from './theme-toggle';
import Link from 'next/link';

export function Navigation() {
  const { isConnected } = useAccount();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image src="/logo.png" alt="Logo" width={130} height={130} />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {isConnected && (
              <>
                {/* <Button
                  variant="ghost"
                  className="text-gray-700 hover:bg-purple-50 hover:text-purple-600 dark:text-gray-300 dark:hover:bg-purple-900/30 dark:hover:text-purple-400 px-4 py-2 rounded-lg font-medium transition-colors"
                  asChild
                >
                  <Link href="/dashboard">Dashboard</Link>
                </Button> */}
                <Button
                  variant="ghost"
                  className="text-gray-700 hover:bg-purple-50 hover:text-purple-600 dark:text-gray-300 dark:hover:bg-purple-900/30 dark:hover:text-purple-400 px-4 py-2 rounded-lg font-medium transition-colors"
                  onClick={() => window.location.href = '/history'}
                >
                  History
                </Button>
              </>
            )}

            <ThemeToggle />

            {/* <a
              href="https://github.com/Irine7/splitme"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
            >
              <Github className="w-5 h-5" />
              <span className="sr-only">GitHub</span>
            </a> */}

            <div className="ml-2">
              <ConnectButton
                showBalance={false}
                accountStatus="address"
                chainStatus="none"
              />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            <ThemeToggle />

            <Button
              variant="ghost"
              size="icon"
              className="text-gray-700 hover:bg-purple-50 hover:text-purple-600 dark:text-gray-300 dark:hover:bg-purple-900/30 dark:hover:text-purple-400"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {isConnected && (
              <>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-700 hover:bg-purple-50 hover:text-purple-600 dark:text-gray-300 dark:hover:bg-purple-900/30 dark:hover:text-purple-400 px-4 py-2 rounded-lg font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                  asChild
                >
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-700 hover:bg-purple-50 hover:text-purple-600 dark:text-gray-300 dark:hover:bg-purple-900/30 dark:hover:text-purple-400 px-4 py-2 rounded-lg font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                  asChild
                >
                  <Link href="/history">History</Link>
                </Button>
              </>
            )}
            <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
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
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
