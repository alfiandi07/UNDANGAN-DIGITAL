import type { RowDataPacket, ResultSetHeader } from "mysql2";
import { pool } from "../db.js";
import type { Rsvp, CreateRsvpInput } from "../models/rsvp.js";

type BarisRsvp = RowDataPacket & Rsvp;

export async function tambahRsvp(
  invitationId: number,
  data: CreateRsvpInput
): Promise<Rsvp> {
  const pax = data.pax ?? 1;
  const [res] = await pool.execute<ResultSetHeader>(
    `INSERT INTO rsvps (invitation_id, guest_name, attendance, pax, message)
     VALUES (?, ?, ?, ?, ?)`,
    [invitationId, data.guest_name, data.attendance, pax, data.message]
  );

  const [rows] = await pool.execute<BarisRsvp[]>(
    "SELECT * FROM rsvps WHERE id = ?",
    [res.insertId]
  );
  return rows[0];
}

export async function ambilRsvpsByInvitationId(invitationId: number): Promise<Rsvp[]> {
  const [rows] = await pool.execute<BarisRsvp[]>(
    "SELECT * FROM rsvps WHERE invitation_id = ? ORDER BY id DESC",
    [invitationId]
  );
  return rows;
}

