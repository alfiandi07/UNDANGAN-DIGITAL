import type { Request, Response } from "express";
import * as rsvpRepo from "../repository/rsvp.js";
import * as orderRepo from "../repository/order.js";
import type { Attendance } from "../models/rsvp.js";

// GET /api/invitations/:slug/rsvps
export async function daftarRsvps(req: Request, res: Response) {
  try {
    const slug = String(req.params.slug);
    const invitation = await orderRepo.cariInvitationBySlug(slug);
    if (!invitation) {
      res.status(404).json({ error: "Undangan tidak ditemukan" });
      return;
    }

    const rsvps = await rsvpRepo.ambilRsvpsByInvitationId(invitation.id);
    res.json(rsvps);
  } catch (err) {
    res.status(500).json({ error: "Gagal memuat ucapan & RSVP" });
  }
}

// POST /api/invitations/:slug/rsvps
export async function kirimRsvp(req: Request, res: Response) {
  try {
    const slug = String(req.params.slug);
    const invitation = await orderRepo.cariInvitationBySlug(slug);
    if (!invitation) {
      res.status(404).json({ error: "Undangan tidak ditemukan" });
      return;
    }

    const { guest_name, attendance, pax, message } = req.body ?? {};

    if (!guest_name || !message) {
      res.status(400).json({ error: "Nama tamu dan ucapan doa wajib diisi" });
      return;
    }

    const att: Attendance =
      attendance === "tidak_hadir" || attendance === "ragu" ? attendance : "hadir";

    const rsvp = await rsvpRepo.tambahRsvp(invitation.id, {
      guest_name: String(guest_name).trim(),
      attendance: att,
      pax: Number(pax) || 1,
      message: String(message).trim(),
    });

    res.status(201).json({
      success: true,
      message: "Terima kasih atas konfirmasi dan ucapan doa restu Anda!",
      rsvp,
    });
  } catch (err) {
    console.error("Submit RSVP error:", err);
    res.status(500).json({ error: "Gagal mengirimkan ucapan RSVP" });
  }
}

