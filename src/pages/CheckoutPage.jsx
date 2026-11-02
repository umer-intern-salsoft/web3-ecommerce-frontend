import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { useStore } from '../store/useStore';
import { fetchApi } from '../api';

export default function CheckoutPage() {
  const { cart, getCartTotal, clearCart } = useStore();
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();

  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const totalEth = getCartTotal();
  const adminWallet = import.meta.env.VITE_ADMIN_WALLET_ADDRESS;

  const { data: hash, isPending: isSendingTx, sendTransaction, error: sendError } = useSendTransaction();

  const { isLoading: isWaitingForTx } = useWaitForTransactionReceipt({
    hash,
    onSuccess: async (receipt) => {
      if (receipt.status === 'success') {
        await verifyOrder(hash);
      }
    }
  });

  const handlePayment = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!isConnected) {
      setErrorMessage('Please connect your crypto wallet first.');
      return;
    }

    if (!adminWallet) {
      setErrorMessage('Admin wallet address is missing from configuration.');
      return;
    }

    try {
      sendTransaction({
        to: adminWallet,
        value: parseEther(totalEth.toFixed(6).toString())
      });
    } catch (err) {
      setErrorMessage(err.message || 'Failed to initiate transaction.');
    }
  };

  const verifyOrder = async (txHash) => {
    setIsVerifying(true);
    try {
      const cartPayload = cart.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }));

      await fetchApi('/orders/verify', {
        method: 'POST',
        body: JSON.stringify({
          txHash,
          cartItems: cartPayload
        })
      });

      clearCart();
      setSuccessMessage('Payment verified! Your order has been placed.');
      setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      setErrorMessage(err.message || 'Payment sent but backend verification failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (cart.length === 0 && !successMessage) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 mb-4">Your cart is empty.</p>
        <button onClick={() => navigate('/')} className="bg-blue-600 text-white px-4 py-2 rounded">
          Return to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Web3 Checkout</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6 space-y-4">
        <h2 className="text-xl font-bold border-b pb-2">Order Summary</h2>
        {cart.map(item => (
          <div key={item.product.id} className="flex justify-between text-sm">
            <span>{item.product.name} (x{item.quantity})</span>
            <span className="font-semibold">{(item.product.priceEth * item.quantity).toFixed(4)} ETH</span>
          </div>
        ))}
        <div className="border-t pt-4 flex justify-between font-bold text-lg">
          <span>Total:</span>
          <span className="text-indigo-600">{totalEth.toFixed(4)} ETH</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
        <h2 className="text-xl font-bold">Wallet Payment (Sepolia Network)</h2>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Wallet Status:</span>
          <appkit-button />
        </div>

        {isConnected && (
          <div className="text-xs bg-gray-100 p-2 rounded break-all text-gray-600">
            Connected: {address}
          </div>
        )}

        {(errorMessage || sendError) && (
          <div className="p-3 bg-red-100 text-red-700 rounded text-sm">
            {errorMessage || sendError?.message}
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-green-100 text-green-700 rounded text-sm font-semibold">
            {successMessage}
          </div>
        )}

        <button
          disabled={!isConnected || isSendingTx || isWaitingForTx || isVerifying}
          onClick={handlePayment}
          className={`w-full py-3 rounded-lg text-white font-bold transition ${
            !isConnected || isSendingTx || isWaitingForTx || isVerifying
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 shadow-md'
          }`}
        >
          {isSendingTx && 'Awaiting Wallet Approval...'}
          {isWaitingForTx && 'Confirming on Sepolia Blockchain...'}
          {isVerifying && 'Verifying Payment on Server...'}
          {!isSendingTx && !isWaitingForTx && !isVerifying && `Pay ${totalEth.toFixed(4)} ETH`}
        </button>
      </div>
    </div>
  );
}