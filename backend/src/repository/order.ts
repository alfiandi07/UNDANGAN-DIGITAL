import type { RowDataPacket, ResultSetHeader } from "mysql2";
import { pool } from "../db.js";
import type {
  Order,
  Invitation,
  PackageType,
  EventDetails,
} from "../models/order.js";

type BarisOrder = RowDataPacket & Order;
type BarisInvitation = RowDataPacket & Invitation;

export async function buatOrderDanUndangan(data: {
  order_id: string;
  buyer_name: string;
  buyer_whatsapp: string;
  buyer_email: string;
  password_hash: string;
  template_id: number;
  package_type: PackageType;
  gross_amount: number;
  slug: string;
  max_photos: number;
  expires_at: Date;
  initial_event_details: EventDetails;
}): Promise<{ order: Order; invitation: Invitation }> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Simpan ke tabel orders
    await connection.execute<ResultSetHeader>(
      `INSERT INTO orders 
       (order_id, buyer_name, buyer_whatsapp, buyer_email, password_hash, template_id, package_type, gross_amount, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        data.order_id,
        data.buyer_name,
        data.buyer_whatsapp,
        data.buyer_email,
        data.password_hash,
        data.template_id,
        data.package_type,
        data.gross_amount,
      ]
    );

    // 2. Simpan draf ke tabel invitations
    await connection.execute<ResultSetHeader>(
      `INSERT INTO invitations
       (order_id, slug, template_id, package_type, max_photos, current_photos, event_details, status, expires_at)
       VALUES (?, ?, ?, ?, ?, 0, ?, 'draft', ?)`,
      [
        data.order_id,
        data.slug,
        data.template_id,
        data.package_type,
        data.max_photos,
        JSON.stringify(data.initial_event_details),
        data.expires_at,
      ]
    );

    await connection.commit();

    const order = await cariOrderByOrderId(data.order_id);
    const invitation = await cariInvitationByOrderId(data.order_id);

    if (!order || !invitation) {
      throw new Error("Gagal mengambil data pesanan yang baru dibuat");
    }

    return { order, invitation };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

export async function cariOrderByOrderId(orderId: string): Promise<Order | null> {
  const [rows] = await pool.execute<BarisOrder[]>(
    `SELECT o.*, t.title as template_title
     FROM orders o
     JOIN templates t ON o.template_id = t.id
     WHERE o.order_id = ?`,
    [orderId]
  );
  return rows.length > 0 ? rows[0] : null;
}

export async function cariInvitationByOrderId(orderId: string): Promise<Invitation | null> {
  const [rows] = await pool.execute<BarisInvitation[]>(
    `SELECT i.*, t.title as template_title, o.buyer_name
     FROM invitations i
     JOIN templates t ON i.template_id = t.id
     JOIN orders o ON i.order_id = o.order_id
     WHERE i.order_id = ?`,
    [orderId]
  );
  if (rows.length === 0) return null;
  const row = rows[0];
  if (typeof row.event_details === "string") {
    row.event_details = JSON.parse(row.event_details);
  }
  return row;
}

export async function cariInvitationBySlug(slug: string): Promise<Invitation | null> {
  const [rows] = await pool.execute<BarisInvitation[]>(
    `SELECT i.*, t.title as template_title, o.buyer_name
     FROM invitations i
     JOIN templates t ON i.template_id = t.id
     JOIN orders o ON i.order_id = o.order_id
     WHERE i.slug = ?`,
    [slug]
  );
  if (rows.length === 0) return null;
  const row = rows[0];
  if (typeof row.event_details === "string") {
    row.event_details = JSON.parse(row.event_details);
  }
  return row;
}

export async function semuaOrdersAdmin(): Promise<Order[]> {
  const [rows] = await pool.execute<BarisOrder[]>(
    `SELECT o.*, t.title as template_title
     FROM orders o
     JOIN templates t ON o.template_id = t.id
     ORDER BY o.id DESC`
  );
  return rows;
}

export async function semuaOrdersByEmail(email: string): Promise<Order[]> {
  const [rows] = await pool.execute<BarisOrder[]>(
    `SELECT o.*, t.title as template_title, i.slug, i.status as invitation_status
     FROM orders o
     JOIN templates t ON o.template_id = t.id
     LEFT JOIN invitations i ON o.order_id = i.order_id
     WHERE o.buyer_email = ?
     ORDER BY o.id DESC`,
    [email]
  );
  return rows;
}

export async function semuaInvitationsByEmail(email: string): Promise<Invitation[]> {
  const [rows] = await pool.execute<BarisInvitation[]>(
    `SELECT i.*, t.title as template_title, o.buyer_name, o.payment_status
     FROM invitations i
     JOIN templates t ON i.template_id = t.id
     JOIN orders o ON i.order_id = o.order_id
     WHERE o.buyer_email = ?
     ORDER BY i.id DESC`,
    [email]
  );
  return rows.map((r) => {
    if (typeof r.event_details === "string") {
      r.event_details = JSON.parse(r.event_details);
    }
    return r;
  });
}

export async function setOrderPaid(orderId: string, expiresAt: Date): Promise<boolean> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.execute(
      `UPDATE orders 
       SET payment_status = 'paid', paid_at = NOW()
       WHERE order_id = ?`,
      [orderId]
    );

    await connection.execute(
      `UPDATE invitations
       SET status = 'active', expires_at = ?
       WHERE order_id = ?`,
      [expiresAt, orderId]
    );

    await connection.commit();
    return true;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

export async function updateEventDetails(
  slug: string,
  eventDetails: EventDetails,
  photosCount: number
): Promise<Invitation | null> {
  await pool.execute(
    `UPDATE invitations
     SET event_details = ?, current_photos = ?
     WHERE slug = ?`,
    [JSON.stringify(eventDetails), photosCount, slug]
  );
  return cariInvitationBySlug(slug);
}
