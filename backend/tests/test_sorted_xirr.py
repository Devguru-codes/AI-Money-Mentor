import sys
sys.path.append('c:/Users/devgu/Downloads/ai-money-mentor/AI-Money-Mentor/backend')
from agents.niveshak.portfolio_analyzer import PortfolioAnalyzer

analyzer = PortfolioAnalyzer()

total_value = 50000
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

# FIX IT HERE
transactions = sorted(transactions, key=lambda x: x['date'])

print("Sorted Normal XIRR:", analyzer.calculate_xirr(transactions))
