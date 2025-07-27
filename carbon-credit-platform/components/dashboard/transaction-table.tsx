// components/dashboard/transaction-table.tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { Transaction } from "@/lib/types"

interface TransactionTableProps {
  transactions: Transaction[]
}

export default function TransactionTable({ transactions }: TransactionTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>From</TableHead>
            <TableHead>To</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                No transactions found.
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell className="font-medium">{tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}</TableCell>
                <TableCell>{new Date(tx.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  {tx.amount} {tx.unit}
                </TableCell>
                <TableCell className="truncate max-w-[100px]">{tx.from}</TableCell>
                <TableCell className="truncate max-w-[100px]">{tx.to}</TableCell>
                <TableCell>
                  <Badge
                    className={`${
                      tx.status === "completed"
                        ? "bg-success text-white"
                        : tx.status === "pending"
                          ? "bg-warning text-white"
                          : "bg-error text-white"
                    }`}
                  >
                    {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
