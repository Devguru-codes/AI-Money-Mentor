def dummy_bisection():
    from datetime import datetime
    tx1 = [
        {"date": "2023-11-01", "amount": -8000},
        {"date": "2023-12-01", "amount": -8000},
        {"date": "2024-01-01", "amount": -8000},
        {"date": "2024-02-01", "amount": -8000},
        {"date": "2024-03-01", "amount": -8000},
        {"date": "2024-04-01", "amount": 800} # Very massive loss
    ]
    
    tx2 = [
        {"date": "2023-01-01", "amount": -10000},
        {"date": "2024-01-01", "amount": 12000}
    ]

    def solve_bisection(tx):
        amounts = []
        days = []
        first_date = datetime.strptime(tx[0]['date'], '%Y-%m-%d')
        for t in tx:
            amounts.append(t['amount'])
            days.append((datetime.strptime(t['date'], '%Y-%m-%d') - first_date).days)

        def npv(rate):
            return sum(a / ((1 + rate) ** (d / 365)) for a, d in zip(amounts, days))
            
        total_cf = sum(amounts)
        print("total cf", total_cf)
        
        # Determine increasing or decreasing function
        # For typical investments (invest then return), NPV DECREASES as rate increases.
        # Let's check:
        # If rate is larger, the denominator grows, so NPV goes down. Let's assume NPV is decreasing.
        
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

    print("tx1 bisection XIRR:", solve_bisection(tx1))
    print("tx2 bisection XIRR:", solve_bisection(tx2))

dummy_bisection()
