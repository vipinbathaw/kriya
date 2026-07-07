interface BalanceSummaryProps {
  totalCredits: number;
  totalDebits: number;
  currency: string;
}

function formatAmount(amount: number, currency: string): string {
  const symbol = currency === 'INR' ? '\u20B9' : currency === 'USD' ? '$' : currency + ' ';
  const value = (amount / 100).toFixed(2);
  return `${symbol}${value}`;
}

export function BalanceSummary({ totalCredits, totalDebits, currency }: BalanceSummaryProps) {
  const balance = totalCredits - totalDebits;
  const balancePositive = balance >= 0;

  return (
    <div
      className="rounded-xl border p-5 grid grid-cols-3 gap-4"
      style={{
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)',
        color: 'var(--card-foreground)',
      }}
    >
      <div className="text-center">
        <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>
          Income
        </p>
        <p className="text-lg font-bold text-green-600 dark:text-green-400">
          +{formatAmount(totalCredits, currency)}
        </p>
      </div>
      <div className="text-center border-x" style={{ borderColor: 'var(--border)' }}>
        <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>
          Expenses
        </p>
        <p className="text-lg font-bold text-red-600 dark:text-red-400">
          -{formatAmount(totalDebits, currency)}
        </p>
      </div>
      <div className="text-center">
        <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>
          Balance
        </p>
        <p
          className={`text-lg font-bold ${
            balancePositive
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {balancePositive ? '+' : ''}{formatAmount(balance, currency)}
        </p>
      </div>
    </div>
  );
}
