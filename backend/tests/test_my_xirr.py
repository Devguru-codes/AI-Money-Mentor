import sys
sys.path.append('c:/Users/devgu/Downloads/ai-money-mentor/AI-Money-Mentor/backend')
from agents.niveshak.portfolio_analyzer import PortfolioAnalyzer

pa = PortfolioAnalyzer()
tx1 = [
    {"date": "2023-11-01", "amount": -8000},
    {"date": "2023-12-01", "amount": -8000},
    {"date": "2024-01-01", "amount": -8000},
    {"date": "2024-02-01", "amount": -8000},
    {"date": "2024-03-01", "amount": -8000},
    {"date": "2024-04-01", "amount": 8000}
]
print("Loss case:", pa.calculate_xirr(tx1))

tx2 = [
    {"date": "2023-01-01", "amount": -10000},
    {"date": "2024-01-01", "amount": 12000}
]
print("Basic positive 20% case:", pa.calculate_xirr(tx2))
