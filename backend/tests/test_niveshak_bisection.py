def solve_bisection(tx):
    from datetime import datetime
    amounts = []
    days = []
    first_date = datetime.strptime(tx[0]['date'], '%Y-%m-%d')
    for t in tx:
        amounts.append(t['amount'])
        days.append((datetime.strptime(t['date'], '%Y-%m-%d') - first_date).days)

    def npv(rate):
        return sum(a / ((1 + rate) ** (d / 365)) for a, d in zip(amounts, days))
        
    total_cf = sum(amounts)
    
    if total_cf >= 0:
        low, high = 0.0, 10000.0  
    else:
        low, high = -0.9999, 0.0
        
    npv_low = npv(low)
    npv_high = npv(high)
    
    if npv_low * npv_high > 0:
        return -99.0 if total_cf < 0 else 0.0
        
    for i in range(100):
        mid = (low + high) / 2
        npv_mid = npv(mid)
        if abs(npv_mid) < 0.01 or (high - low) < 1e-6:
            return mid * 100
            
        if npv_mid * npv_low > 0:
            low = mid
            npv_low = npv_mid
        else:
            high = mid
            
    return mid * 100

total_value = 8000
sip = 8000
duration = 5
from datetime import datetime
today = datetime.now()
transactions = []
for i in range(1, duration + 1):
    m = today.month - i
    year_offset = 0
    while m <= 0:
        m += 12
        year_offset -= 1
    y = today.year + year_offset
    d = min(today.day, 28)
    tx_date = f"{y:04d}-{m:02d}-{d:02d}"
    transactions.append({"date": tx_date, "amount": -sip})
transactions.append({"date": today.strftime("%Y-%m-%d"), "amount": total_value})
print("Image 1 True XIRR:", solve_bisection(transactions))

total_value = 800
sip = 8000
duration = 12
transactions2 = []
for i in range(1, duration + 1):
    m = today.month - i
    year_offset = 0
    while m <= 0:
        m += 12
        year_offset -= 1
    y = today.year + year_offset
    d = min(today.day, 28)
    tx_date = f"{y:04d}-{m:02d}-{d:02d}"
    transactions2.append({"date": tx_date, "amount": -sip})
transactions2.append({"date": today.strftime("%Y-%m-%d"), "amount": total_value})
print("Image 2 True XIRR:", solve_bisection(transactions2))
