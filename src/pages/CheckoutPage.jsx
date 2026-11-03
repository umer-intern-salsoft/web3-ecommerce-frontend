import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { AppKitButton } from '@reown/appkit/react';
import { parseEther } from 'viem';
import { useStore } from '../store/useStore';
import { fetchApi } from '../api';

export default function CheckoutPage() {
  const { cart, getCartTotal, clearCart } = useStore();
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();

  const [txHash, setTxHash] = useState(null);
  const [statusText, setStatusText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const totalEth = getCartTotal();
  const adminWallet = import.meta.env.VITE_ADMIN_WALLET_ADDRESS;

  const { sendTransactionAsync, isPending: isSendingTx } = useSendTransaction();

  // Watch for transaction receipt on Sepolia
  const { data: receipt, isLoading: isWaitingForTx, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const handlePayment = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    setStatusText('');

    if (!isConnected) {
      setErrorMessage('Please connect your crypto wallet first.');
      return;
    }

    if (!adminWallet) {
      setErrorMessage('Admin wallet address is missing from configuration.');
      return;
    }

    try {
      setStatusText('Awaiting wallet approval...');
      const hash = await sendTransactionAsync({
        to: adminWallet,
        value: parseEther(totalEth.toFixed(6).toString())
      });

      setTxHash(hash);
      setStatusText('Transaction broadcasted! Waiting for Sepolia block confirmation...');
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to send transaction.');
      setStatusText('');
    }
  };

  // Automatically trigger backend verification once transaction succeeds on-chain
  useEffect(() => {
    const verifyOrder = async (hashToVerify) => {
      setIsVerifying(true);
      setStatusText('Verifying transaction with server...');
      try {
        const cartPayload = cart.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        }));

        await fetchApi('/orders/verify', {
          method: 'POST',
          body: JSON.stringify({
            txHash: hashToVerify,
            cartItems: cartPayload
          })
        });

        clearCart();
        setSuccessMessage('Payment verified! Order placed successfully.');
        setStatusText('Redirecting to home page...');

        // Redirect back to store landing page after 2.5 seconds
        setTimeout(() => {
          navigate('/');
        }, 2500);
      } catch (err) {
        setErrorMessage(err.message || 'Payment sent on-chain, but server verification failed.');
      } finally {
        setIsVerifying(false);
      }
    };

    if (isTxSuccess && receipt && txHash && !isVerifying && !successMessage) {
      verifyOrder(txHash);
    }
  }, [isTxSuccess, receipt, txHash, isVerifying, successMessage, cart, clearCart, navigate]);

  if (cart.length === 0 && !successMessage) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="surface-card p-10">
        <p className="mb-5 text-slate-500">Your cart is empty.</p>
        <button onClick={() => navigate('/')} className="primary-button">
          Return to Shop
        </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <span className="eyebrow">Secure checkout</span>
        <h1 className="page-title mt-2">Complete your order</h1>
        <p className="mt-2 text-slate-500">Pay directly from your wallet on the Sepolia network.</p>
      </div>

      <div className="surface-card mb-5 space-y-4 p-5 sm:p-6">
        <h2 className="border-b border-slate-100 pb-4 text-lg font-bold text-slate-900">Order summary</h2>
        {cart.map(item => (
          <div key={item.product.id} className="flex justify-between gap-4 text-sm text-slate-600">
            <span>{item.product.name} <span className="text-slate-400">× {item.quantity}</span></span>
            <span className="font-semibold text-slate-900">{(item.product.priceEth * item.quantity).toFixed(4)} ETH</span>
          </div>
        ))}
        <div className="flex justify-between border-t border-slate-100 pt-4 text-lg font-bold">
          <span>Total:</span>
          <span className="text-violet-600">{totalEth.toFixed(4)} ETH</span>
        </div>
      </div>

      <div className="surface-card space-y-6 p-5 sm:p-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Wallet payment</h2>
          <p className="mt-1 text-sm text-slate-500">Sepolia test network</p>
        </div>

        <div className="flex min-h-16 flex-col items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-slate-800">Connect a wallet</p>
            <p className="text-xs text-slate-500">Rainbow and other WalletConnect wallets supported</p>
          </div>
          <AppKitButton />
        </div>

        {isConnected && (
          <div className="break-all rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700">
            Connected: {address}
          </div>
        )}

        {errorMessage && (
          <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
            {successMessage}
          </div>
        )}

        {statusText && !errorMessage && !successMessage && (
          <div className="animate-pulse rounded-xl bg-violet-50 p-3 text-sm text-violet-700">
            {statusText}
          </div>
        )}

        <button
          disabled={!isConnected || isSendingTx || isWaitingForTx || isVerifying || !!successMessage}
          onClick={handlePayment}
          className={`w-full rounded-xl py-3.5 font-bold text-white transition ${
            !isConnected || isSendingTx || isWaitingForTx || isVerifying || !!successMessage
              ? 'cursor-not-allowed bg-slate-300'
              : 'bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg shadow-violet-200 hover:-translate-y-0.5 hover:shadow-xl'
          }`}
        >
          {isSendingTx && 'Awaiting Wallet Approval...'}
          {isWaitingForTx && 'Confirming on Sepolia Blockchain...'}
          {isVerifying && 'Verifying Payment on Server...'}
          {successMessage && 'Order Placed! Redirecting...'}
          {!isSendingTx && !isWaitingForTx && !isVerifying && !successMessage && `Pay ${totalEth.toFixed(4)} ETH`}
        </button>
      </div>
    </div>
  );
}