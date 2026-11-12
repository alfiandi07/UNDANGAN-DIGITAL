import type { RowDataPacket, ResultSetHeader } from "mysql2";
import { pool } from "../db.js";
import type { OperationalCost, FinanceSummary } from "../models/finance.js";

type BarisCost = RowDataPacket & OperationalCost;

export async function ambilSemuaBiayaOperasional(periodMonth?: string): Promise<OperationalCost[]> {
  let query = "SELECT * FROM operational_costs";
  const params: string[] = [];

  if (periodMonth) {
    query += " WHERE period_month = ?";
    params.push(periodMonth);
  }

  query += " ORDER BY id DESC";
  const [rows] = await pool.execute<BarisCost[]>(query, params);
  return rows;
}

export async function tambahBiayaOperasional(
  periodMonth: string,
  expenseName: string,
  amount: number
): Promise<OperationalCost> {
  const [res] = await pool.execute<ResultSetHeader>(
    "INSERT INTO operational_costs (period_month, expense_name, amount) VALUES (?, ?, ?)",
    [periodMonth, expenseName, amount]
  );

  const [rows] = await pool.execute<BarisCost[]>(
    "SELECT * FROM operational_costs WHERE id = ?",
    [res.insertId]
  );
  return rows[0];
}

export async function hapusBiayaOperasional(id: number): Promise<boolean> {
  const [res] = await pool.execute<ResultSetHeader>(
    "DELETE FROM operational_costs WHERE id = ?",
    [id]
  );
  return res.affectedRows > 0;
}

// Menghitung ringkasan laba bersih dan bagi hasil bertiga (FR-E2)
export async function hitungRingkasanFinansial(): Promise<FinanceSummary> {
  // 1. Total Omset dari pesanan berstatus paid
  const [orderRows] = await pool.execute<RowDataPacket[]>(
    `SELECT 
       COALESCE(SUM(gross_amount), 0) as total_omset,
       COUNT(id) as total_orders_paid
     FROM orders 
     WHERE payment_status = 'paid'`
  );
  const totalOmset = Number(orderRows[0]?.total_omset ?? 0);
  const totalOrdersPaid = Number(orderRows[0]?.total_orders_paid ?? 0);

  // 2. Total Pengeluaran Operasional
  const [expenseRows] = await pool.execute<RowDataPacket[]>(
    "SELECT COALESCE(SUM(amount), 0) as total_expenses FROM operational_costs"
  );
  const totalExpenses = Number(expenseRows[0]?.total_expenses ?? 0);

  // 3. Rumus PRD: Net Profit = Total Omset - Total Biaya Operasional
  const netProfit = Math.max(0, totalOmset - totalExpenses);

  // 4. Pembagian Rata untuk 3 Orang Anggota Tim Inti
  const sharePerMember = Math.floor(netProfit / 3);

  // Ambil daftar nama admin dari tabel admins
  const [adminRows] = await pool.execute<RowDataPacket[]>(
    "SELECT name FROM admins ORDER BY id ASC LIMIT 3"
  );

  const defaultNames = ["Admin ASM 1", "Admin ASM 2", "Admin ASM 3"];
  const teamMembers = defaultNames.map((defName, idx) => ({
    name: adminRows[idx]?.name || defName,
    role: `Kreator & Co-Founder #${idx + 1}`,
    share_amount: sharePerMember,
  }));

  const expenses = await ambilSemuaBiayaOperasional();

  return {
    total_omset: totalOmset,
    total_orders_paid: totalOrdersPaid,
    total_expenses: totalExpenses,
    net_profit: netProfit,
    share_per_member: sharePerMember,
    team_members: teamMembers,
    expenses,
  };
}

// Auto-cleanup skrip (FR-E3): cari undangan yang sudah lewat masa tenggang H+7 / H+14
export async function jalankanCleanupServer(): Promise<{
  cleaned_count: number;
  cleaned_slugs: string[];
}> {
  // 1. Ambil undangan yang harus dibersihkan:
  // - Paket Basic/Standard: NOW() > expires_at + INTERVAL 7 DAY
  // - Paket Special: NOW() > expires_at + INTERVAL 14 DAY
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT id, slug, package_type, event_details
     FROM invitations
     WHERE status = 'active'
       AND (
         (package_type IN ('basic', 'standard') AND NOW() > DATE_ADD(expires_at, INTERVAL 7 DAY))
         OR
         (package_type IN ('special', 'premium') AND NOW() > DATE_ADD(expires_at, INTERVAL 14 DAY))
       )`
  );

  const cleanedSlugs: string[] = [];

  for (const row of rows) {
    let details: Record<string, unknown> = {};
    try {
      details = typeof row.event_details === "string" ? JSON.parse(row.event_details) : row.event_details;
    } catch {}

    // Kosongkan array foto untuk menghemat kapasitas server/storage
    details.photos = [];

    await pool.execute(
      `UPDATE invitations 
       SET status = 'cleaned', current_photos = 0, event_details = ?
       WHERE id = ?`,
      [JSON.stringify(details), row.id]
    );

    cleanedSlugs.push(row.slug);
  }

  return {
    cleaned_count: cleanedSlugs.length,
    cleaned_slugs: cleanedSlugs,
  };
}

