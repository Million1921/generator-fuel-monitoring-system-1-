import prisma from "@/lib/db"
import { TransactionsTable } from "@/features/transactions/components/TransactionsTable"

export const dynamic = "force-dynamic"

export default async function TransactionsPage(props: { 
  searchParams: Promise<{ 
    search?: string; 
    page?: string;
    from?: string;
    to?: string;
  }> 
}) {
  const searchParams = await props.searchParams;
  const search = searchParams.search;
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const from = searchParams.from;
  const to = searchParams.to;
  
  const limit = 10;
  const skip = (page - 1) * limit;

  let transactions: any[] = [];
  let totalCount: number = 0;

  try {
    const where: any = {};
    
    if (search) {
      where.OR = [
        { receiptNo: { contains: search, mode: 'insensitive' } },
        { senderAccount: { contains: search, mode: 'insensitive' } },
        { receiverAccount: { contains: search, mode: 'insensitive' } },
        { payerName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (from || to) {
      where.createdAt = {};
      if (from) {
        where.createdAt.gte = new Date(from);
      }
      if (to) {
        where.createdAt.lte = new Date(to);
      }
    }

    const [fetchedTransactions, count] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { site: true }
      }),
      prisma.transaction.count({ where })
    ]);

    transactions = fetchedTransactions;
    totalCount = count;
  } catch (error: any) {
    console.error("Transactions Page - Global Error:", error.message);
  }

  const totalPages = Math.ceil(totalCount / limit) || 1;

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 pb-6 bg-gray-50/30 overflow-x-auto overflow-y-hidden">
        <div className="flex items-center justify-between mt-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-800">BARREL Transactions</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage and track all fuel-related transactions.</p>
          </div>
        </div>

        <TransactionsTable 
          transactions={transactions}
          total={totalCount}
          page={page}
          totalPages={totalPages}
          search={search}
          dateFrom={from}
          dateTo={to}
        />
    </div>
  )
}
