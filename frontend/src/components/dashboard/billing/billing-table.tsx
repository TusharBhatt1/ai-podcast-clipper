"use client";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import type Stripe from "stripe";
import { getUserBillings } from "~/app/actions.ts/stripe";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

export default function BillingTable() {
  const [userInvoices, setUserInvoices] = useState<Stripe.PaymentIntent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getUserBillings();
        setUserInvoices(data || []);
      } catch (error) {
        console.error("Failed to fetch billing data:", error);
      } finally {
        setLoading(false);
      }
    }

    void fetchData();
  }, []);

  return (
    <div>
      <p className="mt-2 mb-4 px-2 text-lg font-bold">
        A list of your invoices
      </p>

      {loading ? (
        <p className="text-gray-500">Loading invoices...</p>
      ) : userInvoices.length === 0 ? (
        <p className="text-gray-500">No invoices found.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[400px]">Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Method</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {userInvoices.map((invoice) => {
              const date = new Date(invoice.created * 1000);
              const createdAt = date.toLocaleString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              });

              return (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{createdAt}</TableCell>
                  <TableCell>{renderStatus(invoice.status)}</TableCell>
                  <TableCell>
                    {invoice.payment_method_types[0]?.toUpperCase()}
                  </TableCell>
                  <TableCell className="text-right">
                    ${(invoice.amount / 100).toFixed(2)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>

          <TableFooter>
            <TableRow>
              <TableCell colSpan={3}>Total</TableCell>
              <TableCell className="text-right">
                $
                {(
                  userInvoices.reduce((a, invoice) => a + invoice.amount, 0) /
                  100
                ).toFixed(2)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      )}
    </div>
  );
}

function renderStatus(status: string) {
  switch (status) {
    case "succeeded":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
          <CheckCircle className="h-4 w-4 text-green-600" />
          Succeeded
        </span>
      );

    case "failed":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
          <XCircle className="h-4 w-4 text-red-600" />
          Failed
        </span>
      );

    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
          <Clock className="h-4 w-4 text-yellow-600" />
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
  }
}
