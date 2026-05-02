import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createOrder } from '../services/orderService';
import { localStorageService } from '../services/localStorageService';

export default function OrderModal({ isOpen, onClose, stock, initialAction, currentPrice }) {
  const [action, setAction] = useState(initialAction || 'BUY');
  const [productType, setProductType] = useState('DELIVERY'); // DELIVERY, INTRADAY
  const [orderType, setOrderType] = useState('REGULAR'); // REGULAR, STOPLOSS, GTT
  const [priceType, setPriceType] = useState('LIMIT'); // LIMIT, MARKET

  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(currentPrice || 0);
  const [triggerPrice, setTriggerPrice] = useState(currentPrice || 0);
  const [stopLossPrice, setStopLossPrice] = useState(currentPrice || 0);
  const [stopLossPriceType, setStopLossPriceType] = useState('LIMIT'); // LIMIT, MARKET

  useEffect(() => {
    if (isOpen) {
      setAction(initialAction || 'BUY');
      setPrice(currentPrice || 0);
      setTriggerPrice(currentPrice || 0);
      setStopLossPrice(currentPrice || 0);
      setOrderType('REGULAR');
      setPriceType('LIMIT');
      setStopLossPriceType('LIMIT');
      setQuantity(1);
    }
  }, [isOpen, initialAction, currentPrice]);

  if (!isOpen) return null;

  const isBuy = action === 'BUY';
  const themeColor = isBuy ? '#059669' : '#dc2626'; // emerald-600 : red-600

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (productType === 'INTRADAY') {
      alert("Intraday trading is not supported yet.");
      return;
    }

    const user = localStorageService.getUser();
    const userId = user ? (user.id || user.user_id) : 0;

    const payload = {
      user_id: userId || 0,
      stock_ticker: stock?.symbol || "",
      order_type: action,
      order_category: orderType === 'STOPLOSS' ? 'STOP_LOSS' : orderType,
      product_type: productType,
      execution_type: priceType,
      quantity: quantity,
      price: priceType === 'MARKET' ? currentPrice : price,
      trigger_price: orderType === 'STOPLOSS' ? triggerPrice : 0,
      stop_loss_price: orderType === 'STOPLOSS' ? (stopLossPriceType === 'MARKET' ? triggerPrice : stopLossPrice) : 0
    };

    try {
      await createOrder(payload);
      alert("Order placed successfully");
      onClose();
    } catch (error) {
      console.error("Order creation failed:", error);
      alert("Failed to place order.");
    }
  };

  const approxMargin = quantity * (priceType === 'MARKET' ? currentPrice : price);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-sans backdrop-blur-sm transition-all">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col">
        {/* Header */}
        <div className={`flex justify-between items-center px-5 py-4 text-white`} style={{ backgroundColor: themeColor }}>
          <div>
            <div className="font-bold text-lg tracking-wide">{action} {stock?.symbol || 'STOCK'}</div>
            <div className="text-xs opacity-90 font-mono mt-0.5">{stock?.exchange || 'NSE'} • ₹{Number(currentPrice || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-black/20 rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-6">
          {/* Action Toggle */}
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button 
              className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-all ${isBuy ? 'bg-white shadow text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setAction('BUY')}
            >
              BUY
            </button>
            <button 
              className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-all ${!isBuy ? 'bg-white shadow text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setAction('SELL')}
            >
              SELL
            </button>
          </div>

          {/* Product Type Tabs */}
          <div className="flex border-b border-gray-200">
            {['DELIVERY', 'INTRADAY'].map(pt => (
              <button
                key={pt}
                onClick={() => setProductType(pt)}
                className={`flex-1 pb-2 text-sm font-semibold transition-colors border-b-2 ${productType === pt ? '' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                style={{ 
                  borderColor: productType === pt ? themeColor : 'transparent', 
                  color: productType === pt ? themeColor : undefined 
                }}
              >
                {pt}
                {pt === 'INTRADAY' && <span className="text-[0.6rem] block font-normal text-red-500">Not supported</span>}
              </button>
            ))}
          </div>

          {/* Order Type Tabs */}
          <div className="flex gap-2">
             {['REGULAR', 'STOPLOSS', 'GTT'].map(ot => (
               <button
                 key={ot}
                 onClick={() => {
                   setOrderType(ot);
                   if (ot === 'GTT') setPriceType('LIMIT'); // GTT is typically Limit
                 }}
                 className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-colors ${orderType === ot ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
               >
                 {ot}
               </button>
             ))}
          </div>

          {/* Input Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Quantity</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</label>
                <div className="flex items-center gap-2 text-[0.65rem] font-semibold bg-gray-100 p-0.5 rounded">
                  <button 
                    className={`px-1.5 py-0.5 rounded ${priceType === 'LIMIT' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}
                    onClick={() => setPriceType('LIMIT')}
                  >
                    LMT
                  </button>
                  <button 
                    className={`px-1.5 py-0.5 rounded ${priceType === 'MARKET' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}
                    onClick={() => setPriceType('MARKET')}
                    disabled={orderType === 'GTT'}
                  >
                    MKT
                  </button>
                </div>
              </div>
              <input
                type="number"
                step="0.05"
                value={priceType === 'MARKET' ? currentPrice : price}
                onChange={(e) => setPrice(Number(e.target.value))}
                disabled={priceType === 'MARKET'}
                className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 ${priceType === 'MARKET' ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
              />
            </div>
          </div>

          {/* Conditional Inputs for Stoploss */}
          {orderType === 'STOPLOSS' && (
            <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 mt-1">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Trigger Price</label>
                <input
                  type="number"
                  step="0.05"
                  value={triggerPrice}
                  onChange={(e) => setTriggerPrice(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
                />
                <div className="flex flex-col justify-end text-[10px] text-gray-400 mt-1">
                   Triggers when price reaches this value.
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Stop Loss Price</label>
                  <div className="flex items-center gap-2 text-[0.65rem] font-semibold bg-gray-100 p-0.5 rounded">
                    <button 
                      className={`px-1.5 py-0.5 rounded ${stopLossPriceType === 'LIMIT' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}
                      onClick={() => setStopLossPriceType('LIMIT')}
                    >
                      LMT
                    </button>
                    <button 
                      className={`px-1.5 py-0.5 rounded ${stopLossPriceType === 'MARKET' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}
                      onClick={() => setStopLossPriceType('MARKET')}
                    >
                      MKT
                    </button>
                  </div>
                </div>
                <input
                  type="number"
                  step="0.05"
                  value={stopLossPriceType === 'MARKET' ? triggerPrice : stopLossPrice}
                  onChange={(e) => setStopLossPrice(Number(e.target.value))}
                  disabled={stopLossPriceType === 'MARKET'}
                  className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 ${stopLossPriceType === 'MARKET' ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
                />
                <div className="flex flex-col justify-end text-[10px] text-gray-400 mt-1">
                   Executes order at this price.
                </div>
              </div>
            </div>
          )}

          {/* GTT Note */}
          {orderType === 'GTT' && (
            <div className="bg-blue-50 text-blue-600 p-3 rounded-lg text-xs font-medium border border-blue-100 mt-2">
              GTT order is valid for 1 year or until it is triggered/cancelled. Limit price is required.
            </div>
          )}
          {/* Footer Info */}
          <div className="flex justify-between items-center bg-gray-50 p-3.5 rounded-xl mt-2 border border-gray-100">
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Approx Margin</span>
            <span className="text-sm font-mono font-bold text-gray-800">₹{(approxMargin || 0).toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}</span>
          </div>

        </div>

        {/* Place Order Button */}
        <div className="p-5 pt-0 mt-2">
          <button
            onClick={handleSubmit}
            className="w-full py-3.5 rounded-xl text-white font-bold text-sm tracking-widest uppercase shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0"
            style={{ backgroundColor: themeColor, boxShadow: `0 4px 14px ${themeColor}40` }}
          >
            {action}
          </button>
        </div>

      </div>
    </div>
  );
}