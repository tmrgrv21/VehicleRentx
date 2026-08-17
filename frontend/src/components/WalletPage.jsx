import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from './DashboardLayout';

const WalletPage = () => {
  const user = JSON.parse(localStorage.getItem('vrx_user') || '{}');
  const [balance, setBalance] = useState(user.walletBalance || 0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addAmount, setAddAmount] = useState('');
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState('');
  
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [payPalLoading, setPayPalLoading] = useState(false);

  const fetchWallet = () => {
    if (!user._id) return;
    setLoading(true);
    axios.get(`http://localhost:5000/api/wallet/${user._id}`)
      .then(res => {
        setBalance(res.data.balance);
        setTransactions(res.data.transactions);
        
        const u = JSON.parse(localStorage.getItem('vrx_user') || '{}');
        u.walletBalance = res.data.balance;
        localStorage.setItem('vrx_user', JSON.stringify(u));
        
        setLoading(false);
      }).catch(() => setLoading(false));
  };

  useEffect(() => { 
    fetchWallet(); 
  }, []);

  const loadPayPalScript = (clientId) => {
    return new Promise((resolve) => {
      try {
        if (window.paypal) {
          resolve(true);
          return;
        }
        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&disable-funding=credit,card`;
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      } catch (e) {
        resolve(false);
      }
    });
  };

  const handleDirectSimulatedTopup = async (amount) => {
    const topupAmt = amount || parseFloat(addAmount);
    if (!topupAmt || topupAmt <= 0) return alert('Please enter a valid top-up amount.');

    setAdding(true);
    try {
      const verifyRes = await axios.post('http://localhost:5000/api/wallet/paypal/verify', {
        userId: user._id,
        amount: topupAmt,
        orderId: 'SIMULATED_PAYPAL_' + Date.now()
      });

      setBalance(verifyRes.data.balance);
      setMessage(`✅ Instant Sandbox Credit: ₹${topupAmt} added to your wallet successfully!`);
      setAddAmount('');
      setSelectedAmount(0);
      setTimeout(() => setMessage(''), 4000);
      fetchWallet();
    } catch (err) {
      alert('Top-up failed. Check server connection.');
    }
    setAdding(false);
  };

  const handleInitiatePayPal = async (amount) => {
    const topupAmt = amount || parseFloat(addAmount);
    if (!topupAmt || topupAmt <= 0) return alert('Please enter a valid top-up amount.');
    
    setSelectedAmount(topupAmt);
    setPayPalLoading(true);
    
    try {
      const orderRes = await axios.post('http://localhost:5000/api/wallet/paypal/order', { amount: topupAmt });
      const order = orderRes.data;

      const scriptLoaded = await loadPayPalScript(order.clientId);
      if (!scriptLoaded) {
        alert('Failed to load PayPal secure SDK. Check your internet connection.');
        setPayPalLoading(false);
        return;
      }

      setPayPalLoading(false);
      
      setTimeout(() => {
        const container = document.getElementById('paypal-button-container');
        if (container) container.innerHTML = '';

        window.paypal.Buttons({
          createOrder: function (data, actions) {
            const usdVal = (topupAmt / 80.0).toFixed(2);
            return actions.order.create({
              purchase_units: [{
                description: `VehicleRentX Digital Wallet Top-Up (₹${topupAmt})`,
                amount: {
                  currency_code: 'USD',
                  value: usdVal
                }
              }]
            });
          },
          onApprove: async function (data, actions) {
            setAdding(true);
            try {
              const verifyRes = await axios.post('http://localhost:5000/api/wallet/paypal/verify', {
                userId: user._id,
                amount: topupAmt,
                orderId: data.orderID || ('ORDER_PP_' + Date.now())
              });

              setBalance(verifyRes.data.balance);
              setMessage(verifyRes.data.message);
              setAddAmount('');
              setSelectedAmount(0);
              setTimeout(() => setMessage(''), 4000);
              fetchWallet();
            } catch (err) {
              alert(err.response?.data?.error || 'PayPal payment capture verification failed.');
            }
            setAdding(false);
          },
          onError: function (err) {
            console.error('PayPal Transaction Error:', err);
            alert('PayPal transaction encountered an error. Please reload and try again.');
            setSelectedAmount(0);
          }
        }).render('#paypal-button-container');
      }, 300);

    } catch (err) {
      alert(err.response?.data?.error || 'Failed to initialize PayPal order.');
      setPayPalLoading(false);
      setSelectedAmount(0);
    }
  };

  const activeHolds = transactions
    .filter(t => t.type === 'security_hold')
    .reduce((sum, hold) => {
      const isRefunded = transactions.some(r => r.type === 'deposit_refund' && r.bookingId === hold.bookingId);
      return isRefunded ? sum : sum + hold.amount;
    }, 0);

  return (
    <DashboardLayout activeTab="wallet">
      {message && <div className="alert alert-success py-2 mb-4 text-center rounded-3 fw-bold">{message}</div>}
      
      <div className="row g-4">
        <div className="col-lg-5">
          <div className="rounded-4 shadow-sm overflow-hidden" style={{ background: 'linear-gradient(135deg, #0F172A, #1E293B)' }}>
            <div className="p-5 text-white">
              <div className="d-flex align-items-center gap-2 mb-3">
                <i className="fa-solid fa-wallet fs-4" style={{ color: '#06B6D4' }}></i>
                <span className="text-uppercase small fw-bold" style={{ letterSpacing: '2px', color: '#94A3B8' }}>Wallet Balance</span>
              </div>
              <h1 className="display-4 fw-bold mb-0">₹{balance.toLocaleString()}</h1>
              <p className="mt-2 mb-0" style={{ color: '#64748B' }}><i className="fa-solid fa-circle-check me-1" style={{ color: '#10B981' }}></i> Active Wallet</p>
            </div>
            
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px 30px' }}>
              <div className="d-flex justify-content-between text-white text-center">
                <div>
                  <small style={{ color: '#94A3B8' }}>Active Holds</small>
                  <br/>
                  <span className="fw-bold text-warning">₹{activeHolds}</span>
                </div>
                <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', borderRight: '1px solid rgba(255,255,255,0.1)', padding: '0 15px' }}>
                  <small style={{ color: '#94A3B8' }}>Total Spent</small>
                  <br/>
                  <span className="fw-bold text-danger">₹{transactions.filter(t => t.type === 'ride_payment').reduce((a, t) => a + t.amount, 0)}</span>
                </div>
                <div>
                  <small style={{ color: '#94A3B8' }}>Deposited</small>
                  <br/>
                  <span className="fw-bold text-success">₹{transactions.filter(t => t.type === 'topup').reduce((a, t) => a + t.amount, 0)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-4 shadow-sm p-4 mt-4">
            <h5 className="fw-bold mb-3"><i className="fa-solid fa-plus-circle me-2 text-success"></i>PayPal Smart Checkout</h5>
            
            <div className="d-flex gap-2 mb-3 flex-wrap">
              {[100, 200, 500, 1000, 2000].map(amt => (
                <button key={amt} className="btn btn-outline-dark rounded-pill fw-bold px-3" onClick={() => handleInitiatePayPal(amt)} disabled={adding || payPalLoading}>
                  +₹{amt}
                </button>
              ))}
            </div>
            
            <div className="input-group mb-3">
              <span className="input-group-text bg-light border-0 fw-bold">₹</span>
              <input type="number" className="form-control p-3 bg-light border-0" placeholder="Enter custom amount" value={addAmount} onChange={e => setAddAmount(e.target.value)} disabled={adding || payPalLoading} />
              <button className="btn btn-primary-custom px-4" style={{ background: 'var(--primary)', borderColor: 'var(--primary)' }} onClick={() => handleInitiatePayPal()} disabled={!addAmount || adding || payPalLoading}>
                {payPalLoading ? 'Loading SDK...' : 'Set Amount'}
              </button>
            </div>

            {selectedAmount > 0 && (
              <div className="border border-light p-3 rounded-4 bg-light mt-3 animate-fade-in">
                <span className="small fw-bold text-muted d-block mb-3 text-center">
                  TOP-UP: ₹{selectedAmount} (~ ${(selectedAmount / 80).toFixed(2)} USD)
                </span>
                
                {adding && (
                  <div className="text-center p-3">
                    <div className="spinner-border text-primary spinner-border-sm me-2"></div>
                    <span className="small text-muted">Securing payment captures...</span>
                  </div>
                )}
                
                <div id="paypal-button-container" style={{ minHeight: '120px' }}></div>

                <div className="text-center mt-2 border-top pt-2">
                  <button 
                    type="button" 
                    className="btn btn-outline-success btn-sm w-100 rounded-pill fw-bold" 
                    onClick={() => handleDirectSimulatedTopup(selectedAmount)}
                    disabled={adding}
                  >
                    ⚡ Instant Sandbox Top-up (Bypass Login)
                  </button>
                </div>
              </div>
            )}
            
            <span className="text-muted small mt-2 d-block text-center"><i className="fa-solid fa-lock me-1"></i>Secured by PayPal Sandbox & Merchant APIs</span>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="bg-white rounded-4 shadow-sm p-4">
            <h5 className="fw-bold mb-4"><i className="fa-solid fa-clock-rotate-left me-2 text-primary"></i>Campus Transaction Logs</h5>
            {loading ? (
              <div className="text-center p-4"><div className="spinner-border text-primary"></div></div>
            ) : transactions.length === 0 ? (
              <div className="text-center p-5">
                <i className="fa-solid fa-receipt fs-1 text-muted mb-3" style={{ opacity: 0.3 }}></i>
                <p className="text-muted">No transactions registered. Credit your wallet to start.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-2" style={{ maxHeight: '480px', overflowY: 'auto' }}>
                {transactions.map((tx, i) => {
                  const isPositive = ['topup', 'deposit_refund'].includes(tx.type);
                  return (
                    <div key={tx._id || i} className="d-flex align-items-center gap-3 p-3 rounded-3" style={{ background: '#F8FAFC', transition: 'background 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
                      onMouseLeave={e => e.currentTarget.style.background = '#F8FAFC'}>
                      <div style={{
                        width: '45px', height: '45px', borderRadius: '12px',
                        background: tx.type === 'topup' ? 'rgba(16,185,129,0.1)' : tx.type === 'deposit_refund' ? 'rgba(6,182,212,0.1)' : tx.type === 'security_hold' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                        color: tx.type === 'topup' ? '#10B981' : tx.type === 'deposit_refund' ? '#06B6D4' : tx.type === 'security_hold' ? '#F59E0B' : '#EF4444',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0
                      }}>
                        <i className={`fa-solid ${tx.type === 'topup' ? 'fa-arrow-down' : tx.type === 'deposit_refund' ? 'fa-rotate-left' : tx.type === 'security_hold' ? 'fa-lock' : 'fa-arrow-up'}`}></i>
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="fw-bold mb-0">
                          {tx.description || (tx.type === 'topup' ? 'Wallet Deposit' : tx.type === 'security_hold' ? 'Security Hold' : tx.type === 'deposit_refund' ? 'Refund Release' : 'Ride Charges')}
                        </h6>
                        <small className="text-muted" style={{ fontSize: '11px' }}>
                          {new Date(tx.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                          {tx.transactionId && <span className="text-primary ms-1">({tx.transactionId})</span>}
                        </small>
                      </div>
                      <h5 className={`fw-bold m-0 ${isPositive ? 'text-success' : 'text-danger'}`}>
                        {isPositive ? '+' : '-'}₹{tx.amount}
                      </h5>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WalletPage;