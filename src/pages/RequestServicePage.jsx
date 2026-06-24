// src/pages/RequestServicePage.jsx
import { useState } from 'react';
import { apiAddOrder } from '../api';

const PRICE_PER_GALLON = 40;
const DELIVERY_FEE     = 20;

// ── Step indicator ──
function StepBar({ step, isWalkin }) {
  const steps = isWalkin
    ? ['Select Order Type', 'Order Details']
    : ['Select Order Type', 'Order Details', 'Review & Pay'];
  return (
    <div className="flex items-center gap-2 mb-6">
      {steps.map((label, i) => {
        const num    = i + 1;
        const active = step === num;
        const done   = step > num;
        return (
          <div key={i} className="flex items-center gap-2 flex-1 last:flex-none">
            <div className="flex items-center gap-2 shrink-0">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition
                ${done  ? 'bg-[#0ea5c9] border-[#0ea5c9] text-white'
                : active ? 'bg-white border-[#0ea5c9] text-[#0ea5c9]'
                         : 'bg-white border-gray-200 text-gray-400'}`}>
                {done ? '✓' : num}
              </div>
              <span className={`text-xs font-semibold hidden sm:block ${active ? 'text-[#0ea5c9]' : done ? 'text-gray-500' : 'text-gray-300'}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 rounded ${done ? 'bg-[#0ea5c9]' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Order type card ──
function OrderTypeCard({ emoji, title, subtitle, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-2xl border-2 p-4 text-left transition cursor-pointer
        ${selected ? 'border-[#0ea5c9] bg-[#f0fafd]' : 'border-gray-200 bg-white hover:border-[#0ea5c9]/40'}`}
    >
      <div className="text-3xl mb-2">{emoji}</div>
      <div className="font-bold text-sm text-[#0f172a]">{title}</div>
      <div className="text-xs text-gray-500 mt-0.5">{subtitle}</div>
    </button>
  );
}

// ── Priority badge ──
function PriorityBadge({ value, label, emoji, selected, onClick }) {
  return (
    <button
      onClick={() => onClick(value)}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition cursor-pointer
        ${selected ? 'border-[#0ea5c9] bg-[#f0fafd] text-[#0ea5c9]' : 'border-gray-200 bg-white text-gray-500 hover:border-[#0ea5c9]/40'}`}
    >
      <span>{emoji}</span>{label}
    </button>
  );
}

export default function RequestServicePage({ user, onOrderPlaced }) {
  const [step,     setStep]     = useState(1);
  const [orderType, setOrderType] = useState('');   // 'walkin' | 'delivery'
  const [priority,  setPriority]  = useState('normal');
  const [quantity,  setQuantity]  = useState(1);
  const [address,   setAddress]   = useState(user?.address || '');
  const [notes,     setNotes]     = useState('');
  const [payMethod, setPayMethod] = useState('');
  const [refNumber, setRefNumber] = useState('');
  const [loading,   setLoading]   = useState(false);
  const [success,   setSuccess]   = useState(false);
  const [error,     setError]     = useState('');

  const isWalkin   = orderType === 'walkin';
  const isDelivery = orderType === 'delivery';
  const subtotal   = quantity * PRICE_PER_GALLON;
  const deliveryFee = isDelivery ? DELIVERY_FEE : 0;
  const total      = subtotal + deliveryFee;

  // ── Navigation ──
  function goNext() {
    setError('');
    if (step === 1 && !orderType) { setError('Please select an order type.'); return; }
    if (step === 2 && isDelivery && !address.trim()) { setError('Please enter a delivery address.'); return; }
    setStep(s => s + 1);
  }
  function goBack() { setError(''); setStep(s => s - 1); }

  // ── Submit ──
  async function handleConfirm() {
    if (isDelivery && !payMethod) { setError('Please select a payment method.'); return; }
    if ((payMethod === 'gcash' || payMethod === 'maya') && !refNumber.trim()) {
      setError('Please enter your reference number.'); return;
    }
    setLoading(true);
    try {
      await apiAddOrder({
        userId:      user.id,
        type:        isWalkin ? 'Walk-in / Pickup' : 'Delivery',
        priority,
        quantity,
        address:     isDelivery ? address : 'Walk-in',
        notes,
        payMethod:   isWalkin ? 'Pay on arrival' : payMethod,
        refNumber:   isWalkin ? '' : refNumber,
        total,
        status:      'Pending',
      });
      setSuccess(true);
      onOrderPlaced?.();
    } catch {
      setError('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // ── Success screen ──
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl mb-4">✅</div>
        <h2 className="text-xl font-bold text-[#0f172a] mb-2">Order Placed!</h2>
        <p className="text-gray-500 text-sm mb-6">
          {isWalkin
            ? 'Your walk-in order has been received. Please pay when you arrive.'
            : 'Your delivery order has been received. We\'ll notify you once it\'s ready.'}
        </p>
        <div className="bg-white rounded-2xl shadow-sm px-8 py-5 text-sm text-left space-y-2 min-w-[260px] mb-6">
          <div className="flex justify-between"><span className="text-gray-400">Type</span><span className="font-semibold">{isWalkin ? 'Walk-in / Pickup' : 'Delivery'}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Gallons</span><span className="font-semibold">{quantity}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Total</span><span className="font-bold text-[#0ea5c9]">₱{total.toFixed(2)}</span></div>
          {isDelivery && <div className="flex justify-between"><span className="text-gray-400">Payment</span><span className="font-semibold capitalize">{payMethod}</span></div>}
        </div>
        <button
          onClick={() => { setSuccess(false); setStep(1); setOrderType(''); setPriority('normal'); setQuantity(1); setAddress(user?.address || ''); setNotes(''); setPayMethod(''); setRefNumber(''); }}
          className="bg-[#0ea5c9] hover:bg-[#0284a8] text-white font-semibold px-8 py-3 rounded-xl transition text-sm"
        >
          Place Another Order
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-lg font-bold text-[#0f172a]">Request an Order</h2>
        <p className="text-sm text-gray-400">Fill out the {isWalkin ? '2' : '3'}-step form below</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <StepBar step={step} isWalkin={isWalkin} />

        {/* ── STEP 1: Order Type ── */}
        {step === 1 && (
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Choose Order Type *</p>
            <div className="flex gap-3 mb-6">
              <OrderTypeCard
                emoji="🚶"
                title="Walk-in / Pickup"
                subtitle="Free"
                selected={orderType === 'walkin'}
                onClick={() => { setOrderType('walkin'); setError(''); }}
              />
              <OrderTypeCard
                emoji="🛵"
                title="Delivery"
                subtitle={`+ ₱${DELIVERY_FEE}.00`}
                selected={orderType === 'delivery'}
                onClick={() => { setOrderType('delivery'); setError(''); }}
              />
            </div>

            {orderType && (
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Priority</p>
                <div className="flex gap-2">
                  <PriorityBadge value="normal"  label="Normal"  emoji="🕐" selected={priority === 'normal'}  onClick={setPriority} />
                  <PriorityBadge value="urgent"  label="Urgent"  emoji="⚡" selected={priority === 'urgent'}  onClick={setPriority} />
                  <PriorityBadge value="priority" label="Priority" emoji="❤️" selected={priority === 'priority'} onClick={setPriority} />
                </div>
              </div>
            )}

            {error && <p className="text-red-500 text-xs mt-3">{error}</p>}

            <div className="flex justify-end mt-6">
              <button onClick={goNext} disabled={!orderType}
                className="bg-[#0ea5c9] hover:bg-[#0284a8] text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition disabled:opacity-40">
                Next →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Order Details ── */}
        {step === 2 && (
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Order Details</p>

            {/* Quantity */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                Quantity of Gallons *
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-xl border-2 border-gray-200 flex items-center justify-center text-lg font-bold text-gray-600 hover:border-[#0ea5c9] transition"
                >−</button>
                <span className="text-xl font-bold text-[#0f172a] w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-9 h-9 rounded-xl border-2 border-gray-200 flex items-center justify-center text-lg font-bold text-gray-600 hover:border-[#0ea5c9] transition"
                >+</button>
                <span className="text-sm text-gray-400 ml-1">🪣 GALLONS</span>
              </div>
            </div>

            {/* Delivery fields */}
            {isDelivery && (
              <>
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                    Delivery Location / Complete Address *
                  </label>
                  <input
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="e.g. Purok 3, Brgy. Cambaro, Mandaue City"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#0ea5c9]"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                    Delivery Notes / Instructions
                  </label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="e.g. Leave at the gate, call upon arrival..."
                    rows={2}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#0ea5c9] resize-none"
                  />
                </div>
              </>
            )}

            {/* Walk-in note */}
            {isWalkin && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-4 text-sm text-blue-600">
                💡 Walk-in orders are paid upon arrival at the station.
              </div>
            )}

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Order Summary</p>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Gallons ({quantity})</span>
                  <span>₱{subtotal.toFixed(2)}</span>
                </div>
                {isDelivery && (
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span>₱{deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-[#0f172a] pt-2 border-t border-gray-200">
                  <span>TOTAL</span>
                  <span className="text-[#0ea5c9]">₱{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {error && <p className="text-red-500 text-xs mb-3">{error}</p>}

            <div className="flex justify-between">
              <button onClick={goBack}
                className="border border-gray-200 text-gray-600 font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition">
                ← Back
              </button>
              {isWalkin ? (
                <button onClick={handleConfirm} disabled={loading}
                  className="bg-[#0ea5c9] hover:bg-[#0284a8] text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition disabled:opacity-60">
                  {loading ? 'Placing...' : '✅ Confirm Order'}
                </button>
              ) : (
                <button onClick={goNext}
                  className="bg-[#0ea5c9] hover:bg-[#0284a8] text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition">
                  Review & Pay →
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 3: Review & Pay (Delivery only) ── */}
        {step === 3 && (
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Review & Payment</p>

            {/* Order summary */}
            <div className="bg-gray-50 rounded-xl p-4 mb-5">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Order Summary</p>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Gallons ({quantity})</span><span>₱{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span><span>₱{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Address</span>
                  <span className="text-right max-w-[55%] text-gray-500">{address}</span>
                </div>
                <div className="flex justify-between font-bold text-[#0f172a] pt-2 border-t border-gray-200">
                  <span>TOTAL</span>
                  <span className="text-[#0ea5c9]">₱{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div className="mb-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Select Payment Method</p>
              <div className="flex gap-3 mb-4">
                {/* GCash */}
                <button
                  onClick={() => setPayMethod('gcash')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold text-sm transition cursor-pointer
                    ${payMethod === 'gcash' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 bg-white text-gray-500 hover:border-blue-300'}`}
                >
                  <span className="text-lg">💙</span> GCash
                </button>
                {/* Maya */}
                <button
                  onClick={() => setPayMethod('maya')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold text-sm transition cursor-pointer
                    ${payMethod === 'maya' ? 'border-green-500 bg-green-50 text-green-600' : 'border-gray-200 bg-white text-gray-500 hover:border-green-300'}`}
                >
                  <span className="text-lg">💚</span> Maya
                </button>
              </div>

              {/* QR + ref input */}
              {(payMethod === 'gcash' || payMethod === 'maya') && (
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-400 mb-3">
                    Scan the QR code below to pay via <span className="font-semibold capitalize">{payMethod}</span>
                  </p>
                  <div className="w-28 h-28 mx-auto bg-white border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-300 text-xs mb-3">
                    QR Code
                  </div>
                  <p className="text-xs text-gray-400 mb-2">After paying, enter your reference number:</p>
                  <input
                    value={refNumber}
                    onChange={e => setRefNumber(e.target.value)}
                    placeholder={`Enter ${payMethod === 'gcash' ? 'GCash' : 'Maya'} Reference Number`}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#0ea5c9] text-center"
                  />
                </div>
              )}
            </div>

            {error && <p className="text-red-500 text-xs mb-3">{error}</p>}

            <div className="flex justify-between">
              <button onClick={goBack}
                className="border border-gray-200 text-gray-600 font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition">
                ← Back
              </button>
              <button onClick={handleConfirm} disabled={loading}
                className="bg-[#0ea5c9] hover:bg-[#0284a8] text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition disabled:opacity-60">
                {loading ? 'Placing...' : '✅ Confirm Payment'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}