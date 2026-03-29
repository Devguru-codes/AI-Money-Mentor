def dummy_xirr():
    from datetime import datetime
    tx1 = [
        {"date": "2023-11-01", "amount": -8000},
        {"date": "2023-12-01", "amount": -8000},
        {"date": "2024-01-01", "amount": -8000},
        {"date": "2024-02-01", "amount": -8000},
        {"date": "2024-03-01", "amount": -8000},
        {"date": "2024-04-01", "amount": 8000}
    ]

    amounts = []
    days = []
    first_date = datetime.strptime(tx1[0]['date'], '%Y-%m-%d')
    for t in tx1:
        amounts.append(t['amount'])
        days.append((datetime.strptime(t['date'], '%Y-%m-%d') - first_date).days)

    total_cf = sum(amounts)
    rate = 0.1 if total_cf >= 0 else -0.5  # Smart initial guess!
    
    for i in range(100):
        try:
            npv = sum(a / ((1 + rate) ** (d / 365)) for a, d in zip(amounts, days))
            dnpv = sum(-a * d / 365 / ((1 + rate) ** ((d / 365) + 1)) for a, d in zip(amounts, days) if d > 0)
        except Exception:
            break
            
        print(f"Iter {i}: rate={rate:.4f}, npv={npv:.2f}, dnpv={dnpv:.2f}")
        if abs(npv) < 0.01: 
            return rate
        if dnpv != 0:
            rate = rate - npv / dnpv
        
        rate = max(-0.9999, min(rate, 10))
    return rate

print("Result:", dummy_xirr())
